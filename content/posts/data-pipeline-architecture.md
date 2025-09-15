---
title: "대규모 실시간 데이터 파이프라인 아키텍처 설계"
description: "Apache Kafka와 Apache Flink를 활용하여 초당 수만 건의 거래 데이터를 실시간으로 처리하는 파이프라인을 구축하는 방법을 소개합니다."
publishedAt: "2024-11-18"
category: "Tech"
tags: ["데이터파이프라인", "Kafka", "Flink", "실시간처리", "빅데이터"]
author: "박데이터"
featured: true
---

# 대규모 실시간 데이터 파이프라인 아키텍처 설계

카카오페이의 하루 수천만 건의 거래 데이터를 실시간으로 처리하고 분석하기 위한 데이터 파이프라인 아키텍처를 상세히 소개합니다.

## 아키텍처 개요

### 전체 시스템 구성
```yaml
# kafka-cluster.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: kakaopay-kafka
spec:
  kafka:
    version: 3.4.0
    replicas: 9
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
      inter.broker.protocol.version: "3.4"
      num.partitions: 12
      log.retention.hours: 168  # 7일
      log.segment.bytes: 1073741824  # 1GB
      compression.type: lz4
    storage:
      type: persistent-claim
      size: 1Ti
      class: fast-ssd
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 100Gi
      class: fast-ssd
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

## 데이터 수집 레이어

### 1. 거래 데이터 프로듀서
```java
@Service
public class TransactionEventProducer {
    
    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;
    private final MeterRegistry meterRegistry;
    
    public TransactionEventProducer(KafkaTemplate<String, TransactionEvent> kafkaTemplate,
                                  MeterRegistry meterRegistry) {
        this.kafkaTemplate = kafkaTemplate;
        this.meterRegistry = meterRegistry;
        
        // 프로듀서 최적화 설정
        kafkaTemplate.setDefaultTopic("transaction-events");
        kafkaTemplate.setProducerInterceptors(
            List.of(new MonitoringProducerInterceptor<>())
        );
    }
    
    @Async
    public CompletableFuture<SendResult<String, TransactionEvent>> publishTransaction(
            TransactionEvent event) {
        
        // 파티셔닝 키 설정 (사용자 ID 기반)
        String partitionKey = event.getUserId();
        
        // 메시지 헤더 설정
        ProducerRecord<String, TransactionEvent> record = 
            new ProducerRecord<>("transaction-events", partitionKey, event);
        record.headers().add("eventType", event.getEventType().getBytes());
        record.headers().add("timestamp", String.valueOf(System.currentTimeMillis()).getBytes());
        
        return kafkaTemplate.send(record)
                .completable()
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        meterRegistry.counter("kafka.producer.success").increment();
                    } else {
                        meterRegistry.counter("kafka.producer.error").increment();
                        log.error("Failed to send transaction event", ex);
                    }
                });
    }
    
    // 배치 전송 최적화
    @EventListener
    public void handleBatchTransactionEvents(BatchTransactionEvent batchEvent) {
        List<ProducerRecord<String, TransactionEvent>> records = 
            batchEvent.getEvents().stream()
                .map(event -> new ProducerRecord<>(
                    "transaction-events", 
                    event.getUserId(), 
                    event))
                .collect(Collectors.toList());
        
        // 배치로 전송
        CompletableFuture.allOf(
            records.stream()
                .map(kafkaTemplate::send)
                .map(CompletableFuture::completable)
                .toArray(CompletableFuture[]::new)
        ).join();
    }
}
```

### 2. Schema Registry 활용
```java
// Avro 스키마 정의
@AvroGenerated
public class TransactionEvent {
    private String transactionId;
    private String userId;
    private BigDecimal amount;
    private String merchantId;
    private TransactionType type;
    private long timestamp;
    private Map<String, String> metadata;
    
    // Avro 스키마 진화 지원
    @AvroDefault("UNKNOWN")
    private PaymentMethod paymentMethod;
}

@Configuration
public class SchemaRegistryConfig {
    
    @Bean
    public KafkaAvroSerializer kafkaAvroSerializer() {
        KafkaAvroSerializer serializer = new KafkaAvroSerializer();
        Map<String, Object> props = new HashMap<>();
        props.put("schema.registry.url", "http://schema-registry:8081");
        props.put("auto.register.schemas", false);
        props.put("use.latest.version", true);
        serializer.configure(props, false);
        return serializer;
    }
}
```

## 실시간 스트림 처리

### 1. Flink 스트림 처리 작업
```java
public class TransactionProcessingJob {
    
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        
        // 체크포인트 설정
        env.enableCheckpointing(30000); // 30초
        env.getCheckpointConfig().setCheckpointingMode(CheckpointingMode.EXACTLY_ONCE);
        env.getCheckpointConfig().setMinPauseBetweenCheckpoints(5000);
        env.getCheckpointConfig().setCheckpointTimeout(60000);
        
        // Kafka 소스 설정
        KafkaSource<TransactionEvent> kafkaSource = KafkaSource.<TransactionEvent>builder()
                .setBootstrapServers("kakaopay-kafka:9092")
                .setTopics("transaction-events")
                .setGroupId("transaction-processing")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new TransactionEventDeserializer())
                .build();
        
        DataStream<TransactionEvent> transactionStream = env.fromSource(
            kafkaSource, 
            WatermarkStrategy.<TransactionEvent>forBoundedOutOfOrderness(Duration.ofSeconds(5))
                .withTimestampAssigner((event, timestamp) -> event.getTimestamp()),
            "transaction-source"
        );
        
        // 실시간 집계 처리
        DataStream<TransactionSummary> summaryStream = transactionStream
            .keyBy(TransactionEvent::getUserId)
            .window(TumblingEventTimeWindows.of(Time.minutes(1)))
            .aggregate(new TransactionAggregator());
        
        // 이상 거래 탐지
        DataStream<FraudAlert> fraudAlerts = transactionStream
            .keyBy(TransactionEvent::getUserId)
            .process(new FraudDetectionFunction());
        
        // 결과 출력
        summaryStream.sinkTo(createElasticsearchSink());
        fraudAlerts.sinkTo(createAlertingSink());
        
        env.execute("Transaction Processing Job");
    }
    
    private static class TransactionAggregator 
            implements AggregateFunction<TransactionEvent, TransactionAccumulator, TransactionSummary> {
        
        @Override
        public TransactionAccumulator createAccumulator() {
            return new TransactionAccumulator();
        }
        
        @Override
        public TransactionAccumulator add(TransactionEvent event, TransactionAccumulator acc) {
            acc.addTransaction(event);
            return acc;
        }
        
        @Override
        public TransactionSummary getResult(TransactionAccumulator acc) {
            return TransactionSummary.builder()
                    .userId(acc.getUserId())
                    .totalAmount(acc.getTotalAmount())
                    .transactionCount(acc.getTransactionCount())
                    .averageAmount(acc.getAverageAmount())
                    .timestamp(System.currentTimeMillis())
                    .build();
        }
        
        @Override
        public TransactionAccumulator merge(TransactionAccumulator a, TransactionAccumulator b) {
            return a.merge(b);
        }
    }
}
```

### 2. 이상 거래 탐지 함수
```java
public class FraudDetectionFunction extends KeyedProcessFunction<String, TransactionEvent, FraudAlert> {
    
    private transient ValueState<UserTransactionProfile> userProfileState;
    private transient ListState<TransactionEvent> recentTransactionsState;
    
    @Override
    public void open(Configuration parameters) {
        ValueStateDescriptor<UserTransactionProfile> profileDescriptor = 
            new ValueStateDescriptor<>("user-profile", UserTransactionProfile.class);
        userProfileState = getRuntimeContext().getState(profileDescriptor);
        
        ListStateDescriptor<TransactionEvent> transactionDescriptor = 
            new ListStateDescriptor<>("recent-transactions", TransactionEvent.class);
        recentTransactionsState = getRuntimeContext().getListState(transactionDescriptor);
    }
    
    @Override
    public void processElement(TransactionEvent transaction, 
                             KeyedProcessFunction<String, TransactionEvent, FraudAlert>.Context ctx, 
                             Collector<FraudAlert> out) throws Exception {
        
        UserTransactionProfile profile = userProfileState.value();
        if (profile == null) {
            profile = new UserTransactionProfile(transaction.getUserId());
        }
        
        // 이상 패턴 체크
        List<FraudIndicator> indicators = checkFraudIndicators(transaction, profile);
        
        if (!indicators.isEmpty()) {
            FraudAlert alert = FraudAlert.builder()
                    .userId(transaction.getUserId())
                    .transactionId(transaction.getTransactionId())
                    .indicators(indicators)
                    .riskScore(calculateRiskScore(indicators))
                    .timestamp(ctx.timestamp())
                    .build();
            
            out.collect(alert);
        }
        
        // 프로필 업데이트
        profile.updateWithTransaction(transaction);
        userProfileState.update(profile);
        
        // 최근 거래 목록 관리 (1시간 윈도우)
        recentTransactionsState.add(transaction);
        
        // 만료된 거래 정리 타이머 설정
        long cleanupTime = ctx.timestamp() + Duration.ofHours(1).toMillis();
        ctx.timerService().registerEventTimeTimer(cleanupTime);
    }
    
    private List<FraudIndicator> checkFraudIndicators(TransactionEvent transaction, 
                                                     UserTransactionProfile profile) {
        List<FraudIndicator> indicators = new ArrayList<>();
        
        // 1. 금액 이상 (평소보다 10배 이상)
        if (transaction.getAmount().compareTo(profile.getAverageAmount().multiply(BigDecimal.valueOf(10))) > 0) {
            indicators.add(FraudIndicator.UNUSUAL_AMOUNT);
        }
        
        // 2. 빈도 이상 (1분 내 5회 이상)
        try {
            long recentCount = StreamSupport.stream(recentTransactionsState.get().spliterator(), false)
                    .filter(t -> t.getTimestamp() > transaction.getTimestamp() - 60000)
                    .count();
            if (recentCount >= 5) {
                indicators.add(FraudIndicator.HIGH_FREQUENCY);
            }
        } catch (Exception e) {
            // 처리 실패 로깅
        }
        
        // 3. 새로운 가맹점 (처음 거래하는 곳)
        if (!profile.getKnownMerchants().contains(transaction.getMerchantId())) {
            indicators.add(FraudIndicator.NEW_MERCHANT);
        }
        
        return indicators;
    }
}
```

## 데이터 저장 레이어

### 1. 실시간 데이터 저장 (ClickHouse)
```sql
-- 거래 데이터 테이블 (ClickHouse)
CREATE TABLE transactions (
    transaction_id String,
    user_id String,
    merchant_id String,
    amount Decimal64(2),
    transaction_type Enum8('PAYMENT' = 1, 'REFUND' = 2, 'TRANSFER' = 3),
    payment_method Enum8('CARD' = 1, 'BANK' = 2, 'WALLET' = 3),
    timestamp DateTime64(3),
    metadata String,
    created_date Date DEFAULT toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, timestamp)
SETTINGS index_granularity = 8192;

-- 실시간 대시보드용 Materialized View
CREATE MATERIALIZED VIEW transaction_summary_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (toStartOfHour(timestamp), transaction_type)
AS SELECT
    toStartOfHour(timestamp) as hour,
    transaction_type,
    count() as transaction_count,
    sum(amount) as total_amount,
    avg(amount) as avg_amount
FROM transactions
GROUP BY hour, transaction_type;
```

### 2. 분석용 데이터 웨어하우스 (BigQuery)
```java
@Component
public class BigQueryETL {
    
    private final BigQuery bigQuery;
    
    @Scheduled(cron = "0 */10 * * * *") // 10분마다
    public void extractTransactionData() {
        String extractQuery = """
            SELECT 
                transaction_id,
                user_id,
                merchant_id,
                amount,
                transaction_type,
                timestamp,
                DATE(timestamp) as transaction_date
            FROM `kakaopay.raw_data.transactions`
            WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 10 MINUTE)
            """;
        
        QueryJobConfiguration queryConfig = QueryJobConfiguration.newBuilder(extractQuery)
                .setDestinationTable(TableId.of("kakaopay", "analytics", "hourly_transactions"))
                .setWriteDisposition(JobInfo.WriteDisposition.WRITE_APPEND)
                .build();
        
        try {
            Job queryJob = bigQuery.create(JobInfo.newBuilder(queryConfig).build());
            queryJob.waitFor();
            
            if (queryJob.getStatus().getError() != null) {
                throw new RuntimeException("BigQuery job failed: " + queryJob.getStatus().getError());
            }
        } catch (Exception e) {
            log.error("Failed to execute BigQuery ETL", e);
        }
    }
}
```

## 모니터링 및 알림

### 1. 데이터 품질 모니터링
```java
@Component
public class DataQualityMonitor {
    
    private final ClickHouseTemplate clickHouseTemplate;
    private final SlackService slackService;
    
    @Scheduled(fixedRate = 60000) // 1분마다
    public void checkDataQuality() {
        // 1. 데이터 지연 체크
        checkDataLatency();
        
        // 2. 중복 데이터 체크
        checkDuplicateData();
        
        // 3. 스키마 변경 체크
        checkSchemaChanges();
        
        // 4. 데이터 볼륨 체크
        checkDataVolume();
    }
    
    private void checkDataLatency() {
        String query = """
            SELECT max(timestamp) as latest_timestamp
            FROM transactions
            WHERE created_date = today()
            """;
        
        LocalDateTime latestTimestamp = clickHouseTemplate.queryForObject(query, LocalDateTime.class);
        Duration latency = Duration.between(latestTimestamp, LocalDateTime.now());
        
        if (latency.toMinutes() > 5) {
            DataQualityAlert alert = DataQualityAlert.builder()
                    .type("DATA_LATENCY")
                    .severity("HIGH")
                    .message(String.format("데이터 지연 감지: %d분", latency.toMinutes()))
                    .build();
            
            sendAlert(alert);
        }
    }
    
    private void checkDataVolume() {
        String query = """
            SELECT count() as current_hour_count
            FROM transactions
            WHERE timestamp >= toStartOfHour(now())
            """;
        
        Long currentHourCount = clickHouseTemplate.queryForObject(query, Long.class);
        Long expectedCount = getExpectedHourlyVolume();
        
        double variance = Math.abs(currentHourCount - expectedCount) / (double) expectedCount;
        
        if (variance > 0.3) { // 30% 이상 차이
            DataQualityAlert alert = DataQualityAlert.builder()
                    .type("VOLUME_ANOMALY")
                    .severity("MEDIUM")
                    .message(String.format("거래량 이상: 예상 %d건, 실제 %d건", expectedCount, currentHourCount))
                    .build();
            
            sendAlert(alert);
        }
    }
}
```

### 2. 성능 메트릭 수집
```java
@Component
public class PipelineMetrics {
    
    private final MeterRegistry meterRegistry;
    
    public PipelineMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        initializeMetrics();
    }
    
    private void initializeMetrics() {
        // Kafka 프로듀서 메트릭
        Gauge.builder("kafka.producer.batch.size.avg")
                .register(meterRegistry, this, pipeline -> getKafkaProducerMetric("batch-size-avg"));
        
        // Flink 작업 메트릭
        Gauge.builder("flink.job.records.per.second")
                .register(meterRegistry, this, pipeline -> getFlinkJobMetric("numRecordsInPerSecond"));
        
        // ClickHouse 성능 메트릭
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("clickhouse.query.duration").register(meterRegistry));
    }
    
    @EventListener
    public void recordKafkaProducerEvent(KafkaProducerEvent event) {
        meterRegistry.counter("kafka.producer.messages", "topic", event.getTopic()).increment();
        meterRegistry.timer("kafka.producer.send.time").record(event.getSendDuration());
    }
    
    @EventListener
    public void recordFlinkProcessingEvent(FlinkProcessingEvent event) {
        meterRegistry.counter("flink.processed.records").increment(event.getRecordCount());
        meterRegistry.gauge("flink.processing.lag", event.getProcessingLag());
    }
}
```

## 재해 복구 및 백업

### 1. 다중 리전 복제
```yaml
# kafka-mirror-maker.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kafka-mirror-maker
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: mirror-maker
        image: strimzi/kafka:latest-kafka-3.4.0
        command:
        - /opt/kafka/bin/kafka-mirror-maker.sh
        - --consumer.config
        - /etc/kafka/consumer.properties
        - --producer.config
        - /etc/kafka/producer.properties
        - --whitelist
        - "transaction-events|fraud-alerts"
        volumeMounts:
        - name: config
          mountPath: /etc/kafka
      volumes:
      - name: config
        configMap:
          name: mirror-maker-config
```

실시간 데이터 파이프라인은 안정성과 확장성이 핵심입니다. 적절한 모니터링, 알림, 그리고 장애 복구 계획을 통해 24/7 무중단 서비스를 보장할 수 있습니다.