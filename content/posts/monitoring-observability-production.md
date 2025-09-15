---
title: "프로덕션 환경 모니터링과 관찰가능성 구축하기"
description: "대규모 금융 서비스의 안정성을 보장하기 위한 모니터링, 로깅, 알림 시스템을 구축하는 실전 가이드입니다."
publishedAt: "2024-11-20"
category: "Tech"
tags: ["모니터링", "관찰가능성", "Prometheus", "Grafana", "ELK", "알림"]
author: "최모니터"
featured: true
---

# 프로덕션 환경 모니터링과 관찰가능성 구축하기

금융 서비스에서 시스템 안정성은 곧 신뢰성입니다. 카카오페이에서 구축한 종합적인 모니터링과 관찰가능성(Observability) 시스템을 통해 24/7 무중단 서비스를 보장하는 방법을 소개합니다.

## 모니터링 아키텍처 설계

### 1. 3-Pillar 관찰가능성
```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Application 메트릭
  - job_name: 'spring-actuator'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: 
        - 'payment-service:8080'
        - 'user-service:8080'
        - 'notification-service:8080'
    scrape_interval: 10s

  # Infrastructure 메트릭
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)

  # Database 메트릭
  - job_name: 'mysql-exporter'
    static_configs:
      - targets: ['mysql-exporter:9104']
  
  # Redis 메트릭
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 2. 커스텀 메트릭 구현
```java
@Component
@Slf4j
public class BusinessMetrics {
    
    private final MeterRegistry meterRegistry;
    private final Counter paymentSuccessCounter;
    private final Counter paymentFailureCounter;
    private final Timer paymentProcessingTime;
    private final Gauge activeUserGauge;
    
    public BusinessMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // 결제 성공/실패 카운터
        this.paymentSuccessCounter = Counter.builder("payment_success_total")
                .description("Total number of successful payments")
                .tag("service", "payment")
                .register(meterRegistry);
                
        this.paymentFailureCounter = Counter.builder("payment_failure_total")
                .description("Total number of failed payments")
                .tag("service", "payment")
                .register(meterRegistry);
        
        // 결제 처리 시간
        this.paymentProcessingTime = Timer.builder("payment_processing_duration")
                .description("Payment processing time")
                .tag("service", "payment")
                .register(meterRegistry);
        
        // 활성 사용자 수
        this.activeUserGauge = Gauge.builder("active_users")
                .description("Number of active users")
                .register(meterRegistry, this, BusinessMetrics::getActiveUserCount);
    }
    
    @EventListener
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        paymentSuccessCounter.increment(
            Tags.of(
                "payment_method", event.getPaymentMethod(),
                "merchant_category", event.getMerchantCategory()
            )
        );
        
        paymentProcessingTime.record(
            event.getProcessingDuration(), 
            TimeUnit.MILLISECONDS
        );
        
        // 비즈니스 메트릭 로깅
        log.info("Payment success: transactionId={}, amount={}, duration={}ms",
                event.getTransactionId(),
                event.getAmount(),
                event.getProcessingDuration());
    }
    
    @EventListener
    public void handlePaymentFailure(PaymentFailureEvent event) {
        paymentFailureCounter.increment(
            Tags.of(
                "error_code", event.getErrorCode(),
                "payment_method", event.getPaymentMethod()
            )
        );
        
        log.error("Payment failure: transactionId={}, errorCode={}, reason={}",
                event.getTransactionId(),
                event.getErrorCode(),
                event.getErrorMessage());
    }
    
    private double getActiveUserCount() {
        // Redis에서 활성 사용자 수 조회
        return redisTemplate.opsForHyperLogLog()
                .size("active_users:" + LocalDate.now());
    }
    
    // 서킷브레이커 메트릭
    @EventListener
    public void handleCircuitBreakerStateChange(CircuitBreakerStateChangeEvent event) {
        meterRegistry.gauge("circuit_breaker_state",
                Tags.of("name", event.getCircuitBreakerName()),
                event.getStateTransition().getToState().ordinal());
    }
}
```

## 로깅 시스템 구축

### 1. 구조화된 로깅
```java
@Component
public class StructuredLogger {
    
    private final Logger logger = LoggerFactory.getLogger(StructuredLogger.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public void logPaymentEvent(String event, String transactionId, 
                               Map<String, Object> context) {
        try {
            LogEntry logEntry = LogEntry.builder()
                    .timestamp(Instant.now())
                    .level("INFO")
                    .service("payment-service")
                    .event(event)
                    .transactionId(transactionId)
                    .userId(getCurrentUserId())
                    .sessionId(getCurrentSessionId())
                    .requestId(getCurrentRequestId())
                    .context(context)
                    .build();
            
            String jsonLog = objectMapper.writeValueAsString(logEntry);
            logger.info(jsonLog);
            
        } catch (Exception e) {
            logger.error("Failed to create structured log", e);
        }
    }
    
    public void logSecurityEvent(SecurityEvent event) {
        Map<String, Object> securityContext = Map.of(
            "sourceIp", event.getSourceIp(),
            "userAgent", event.getUserAgent(),
            "eventType", event.getEventType().name(),
            "severity", event.getSeverity().name(),
            "additionalInfo", event.getAdditionalInfo()
        );
        
        logPaymentEvent("SECURITY_EVENT", null, securityContext);
    }
    
    public void logPerformanceEvent(String operation, long durationMs, 
                                   boolean isSlowQuery) {
        Map<String, Object> performanceContext = Map.of(
            "operation", operation,
            "duration_ms", durationMs,
            "is_slow", isSlowQuery,
            "thread", Thread.currentThread().getName()
        );
        
        String level = isSlowQuery ? "WARN" : "INFO";
        logPaymentEvent("PERFORMANCE", null, performanceContext);
    }
}

// 로그 엔트리 모델
@Data
@Builder
public class LogEntry {
    private Instant timestamp;
    private String level;
    private String service;
    private String event;
    private String transactionId;
    private String userId;
    private String sessionId;
    private String requestId;
    private Map<String, Object> context;
}
```

### 2. ELK 스택 구성
```yaml
# logstash-pipeline.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "payment" {
    json {
      source => "message"
    }
    
    # 날짜 파싱
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    # 사용자 ID 마스킹 (보안)
    mutate {
      gsub => [
        "userId", "(.{3}).*(.{3})", "\1***\2"
      ]
    }
    
    # 성능 지표 계산
    if [context][duration_ms] {
      ruby {
        code => "
          duration = event.get('[context][duration_ms]')
          if duration > 1000
            event.set('performance_tier', 'SLOW')
          elsif duration > 500
            event.set('performance_tier', 'MEDIUM')
          else
            event.set('performance_tier', 'FAST')
          end
        "
      }
    }
    
    # 에러 분류
    if [level] == "ERROR" {
      if [context][error_code] {
        mutate {
          add_field => { "error_category" => "BUSINESS_ERROR" }
        }
      } else {
        mutate {
          add_field => { "error_category" => "SYSTEM_ERROR" }
        }
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "kakaopay-logs-%{+YYYY.MM.dd}"
    template_name => "kakaopay-logs"
    template => "/usr/share/logstash/templates/kakaopay-logs.json"
  }
  
  # 중요한 에러는 즉시 알림
  if [level] == "ERROR" and [error_category] == "SYSTEM_ERROR" {
    http {
      url => "http://alertmanager:9093/api/v1/alerts"
      http_method => "post"
      format => "json"
      mapping => {
        "alerts" => [{
          "labels" => {
            "alertname" => "SystemError"
            "service" => "%{service}"
            "severity" => "critical"
          }
          "annotations" => {
            "summary" => "System error detected"
            "description" => "%{message}"
          }
        }]
      }
    }
  }
}
```

## 알림 시스템 구축

### 1. 계층화된 알림 정책
```yaml
# alertmanager-config.yml
global:
  slack_api_url: 'https://hooks.slack.com/services/T123/B456/xyz'
  smtp_smarthost: 'smtp.gmail.com:587'

templates:
  - '/etc/alertmanager/templates/*.tmpl'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    # 크리티컬 알림 - 즉시 모든 채널로
    - match:
        severity: critical
      receiver: 'critical-all-channels'
      group_wait: 0s
      repeat_interval: 5m
    
    # 높은 우선순위 - Slack + Email
    - match:
        severity: high
      receiver: 'high-priority'
      repeat_interval: 15m
    
    # 경고 수준 - Slack만
    - match:
        severity: warning
      receiver: 'warning-slack'
      repeat_interval: 1h

receivers:
  - name: 'critical-all-channels'
    slack_configs:
      - channel: '#critical-alerts'
        title: '🚨 CRITICAL ALERT'
        text: |
          {{ range .Alerts }}
          *Service:* {{ .Labels.service }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Severity:* {{ .Labels.severity }}
          *Runbook:* {{ .Annotations.runbook_url }}
          {{ end }}
    email_configs:
      - to: 'oncall@kakaopay.com'
        subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
        body: |
          Critical alert detected in {{ .GroupLabels.service }}
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}
    pagerduty_configs:
      - service_key: 'your-pagerduty-key'
        description: '{{ .GroupLabels.alertname }}'

  - name: 'high-priority'
    slack_configs:
      - channel: '#high-priority-alerts'
        title: '⚠️ High Priority Alert'
    email_configs:
      - to: 'team@kakaopay.com'

  - name: 'warning-slack'
    slack_configs:
      - channel: '#warnings'
        title: '📊 Warning'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'service']
```

### 2. 인텔리전트 알림 규칙
```yaml
# alert-rules.yml
groups:
  - name: payment-service-alerts
    rules:
      # 결제 성공률 저하
      - alert: PaymentSuccessRateBelow95Percent
        expr: |
          (
            rate(payment_success_total[5m]) /
            (rate(payment_success_total[5m]) + rate(payment_failure_total[5m]))
          ) * 100 < 95
        for: 2m
        labels:
          severity: critical
          service: payment
        annotations:
          summary: "Payment success rate below 95%"
          description: "Current success rate: {{ $value }}%"
          runbook_url: "https://wiki.kakaopay.com/runbooks/payment-success-rate"
      
      # API 응답 시간 증가
      - alert: HighAPILatency
        expr: |
          histogram_quantile(0.95, 
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 5m
        labels:
          severity: high
          service: "{{ $labels.service }}"
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency: {{ $value }}s"
      
      # 데이터베이스 연결 문제
      - alert: DatabaseConnectionFailure
        expr: mysql_up == 0
        for: 1m
        labels:
          severity: critical
          service: database
        annotations:
          summary: "Database connection failure"
          description: "Cannot connect to MySQL database"
      
      # 메모리 사용률 높음
      - alert: HighMemoryUsage
        expr: |
          (
            node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
          ) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage: {{ $value }}%"
      
      # 디스크 공간 부족
      - alert: LowDiskSpace
        expr: |
          (
            node_filesystem_size_bytes{fstype!="tmpfs"} - 
            node_filesystem_free_bytes{fstype!="tmpfs"}
          ) / node_filesystem_size_bytes{fstype!="tmpfs"} * 100 > 90
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk usage: {{ $value }}% on {{ $labels.mountpoint }}"

  - name: business-metrics-alerts
    rules:
      # 활성 사용자 수 급감
      - alert: ActiveUsersDrop
        expr: |
          (
            active_users - active_users offset 1h
          ) / active_users offset 1h * 100 < -20
        for: 10m
        labels:
          severity: high
          team: product
        annotations:
          summary: "Active users dropped significantly"
          description: "Active users dropped by {{ $value }}% in the last hour"
      
      # 비정상적인 에러율 증가
      - alert: ErrorRateSpike
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) /
          rate(http_requests_total[5m]) * 100 > 5
        for: 3m
        labels:
          severity: high
        annotations:
          summary: "Error rate spike detected"
          description: "Error rate: {{ $value }}%"
```

## 대시보드 구성

### 1. 실시간 운영 대시보드
```json
{
  "dashboard": {
    "title": "KakaoPay Production Dashboard",
    "panels": [
      {
        "title": "Key Business Metrics",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(payment_success_total[5m]) * 60",
            "legendFormat": "Payments/min"
          },
          {
            "expr": "sum(active_users)",
            "legendFormat": "Active Users"
          },
          {
            "expr": "rate(payment_success_total[5m]) / (rate(payment_success_total[5m]) + rate(payment_failure_total[5m])) * 100",
            "legendFormat": "Success Rate %"
          }
        ]
      },
      {
        "title": "Payment Processing Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(payment_processing_duration_bucket[5m]))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, rate(payment_processing_duration_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.99, rate(payment_processing_duration_bucket[5m]))",
            "legendFormat": "99th percentile"
          }
        ]
      },
      {
        "title": "Error Rate by Service",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) by (service)",
            "legendFormat": "{{ service }}"
          }
        ]
      },
      {
        "title": "Infrastructure Health",
        "type": "heatmap",
        "targets": [
          {
            "expr": "rate(node_cpu_seconds_total{mode!=\"idle\"}[5m]) by (instance)",
            "legendFormat": "{{ instance }}"
          }
        ]
      }
    ]
  }
}
```

### 2. 자동화된 리포트 생성
```python
class AutomatedReportGenerator:
    def __init__(self, prometheus_client, elasticsearch_client):
        self.prometheus = prometheus_client
        self.elasticsearch = elasticsearch_client
        
    def generate_daily_report(self, date):
        """일일 운영 리포트 생성"""
        report = {
            'date': date.isoformat(),
            'summary': {},
            'metrics': {},
            'incidents': [],
            'recommendations': []
        }
        
        # 비즈니스 메트릭 수집
        report['metrics']['total_payments'] = self.get_total_payments(date)
        report['metrics']['success_rate'] = self.get_success_rate(date)
        report['metrics']['avg_response_time'] = self.get_avg_response_time(date)
        report['metrics']['active_users'] = self.get_active_users(date)
        
        # 인시던트 정보
        report['incidents'] = self.get_incidents(date)
        
        # 성능 트렌드 분석
        report['trends'] = self.analyze_trends(date)
        
        # 추천사항 생성
        report['recommendations'] = self.generate_recommendations(report)
        
        return report
    
    def get_incidents(self, date):
        """인시던트 정보 조회"""
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"level": "ERROR"}},
                        {"range": {
                            "timestamp": {
                                "gte": date.strftime("%Y-%m-%d"),
                                "lt": (date + timedelta(days=1)).strftime("%Y-%m-%d")
                            }
                        }}
                    ]
                }
            },
            "aggs": {
                "error_types": {
                    "terms": {"field": "context.error_code.keyword"}
                },
                "services": {
                    "terms": {"field": "service.keyword"}
                }
            }
        }
        
        result = self.elasticsearch.search(
            index=f"kakaopay-logs-{date.strftime('%Y.%m.%d')}", 
            body=query
        )
        
        return {
            'total_errors': result['hits']['total']['value'],
            'error_by_type': result['aggregations']['error_types']['buckets'],
            'error_by_service': result['aggregations']['services']['buckets']
        }
    
    def generate_recommendations(self, report):
        """자동 추천사항 생성"""
        recommendations = []
        
        # 성공률 기반 추천
        if report['metrics']['success_rate'] < 99:
            recommendations.append({
                'priority': 'HIGH',
                'category': 'RELIABILITY',
                'description': '결제 성공률이 99% 미만입니다. 실패 원인 분석이 필요합니다.',
                'action': 'payment-failure-analysis'
            })
        
        # 응답 시간 기반 추천
        if report['metrics']['avg_response_time'] > 500:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'PERFORMANCE',
                'description': '평균 응답 시간이 500ms를 초과했습니다.',
                'action': 'performance-optimization'
            })
        
        return recommendations
```

종합적인 모니터링과 관찰가능성 시스템은 문제 발생 전 예방과 발생 후 빠른 대응을 가능하게 합니다. 지속적인 개선과 자동화를 통해 시스템 신뢰성을 높여나가는 것이 핵심입니다.