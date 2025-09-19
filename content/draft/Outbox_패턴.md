# Outbox 패턴

Outbox 패턴은 마이크로서비스 아키텍처에서 데이터 일관성을 유지하고,
이벤트 기반 통신을 구현하기 위한 디자인 패턴입니다.

이 패턴은 주로 데이터베이스 트랜잭션과 메시지 큐 시스템 간의 일관성을 보장하는 데 사용됩니다.

- Outbox는 **DB 트랜잭션**과 **이벤트 발행**을 **원자적으로 처리하기 위한** 패턴임
- 이벤트를 DB에 먼저 저장한 후, 별도 프로세스에서 안정하게 발행하여 **데이터의 정합성을 보장**

그렇다면 별도 프로세스에서 이벤트를 발행한다는 것은 어떤 의미일까요?

트랜잭션을 수행하는 스레드가 아닌 다른 스레드에서 이벤트를 발행한다는 의미입니다.

1. 스케줄링 기반 (Polling)

    ```java
    class OutboxEventPublisher {
        private final OutboxRepository outboxRepository;
        private final EventPublisher eventPublisher;
    
        @Scheduled(fixedDelay = 1000) // 1초마다 폴링
        public void publishPendingEvents() {
            List<OutboxEvent> unpublishedEvents = outboxRepository.findByStatus(PENDING);
    
            for (OutboxEvent event : unpublishedEvents) {
                try {
                    // 실제 이벤트 발행 (MQ, HTTP, 로컬 이벤트 등)
                    if (event.getType().equals("OrderCreated")) {
                        OrderCreatedEvent domainEvent = JsonUtils.fromJson(event.getPayload(), OrderCreatedEvent.class);
                        applicationEventPublisher.publishEvent(domainEvent);
                        // 또는 rabbitTemplate.send(domainEvent);
                    }
    
                    // 성공 표시
                    event.setStatus(PUBLISHED);
                    event.setPublishedAt(LocalDateTime.now());
                    outboxRepository.save(event);
    
                } catch (Exception e) {
                    // 재시도 로직
                    event.incrementRetryCount();
                    if (event.getRetryCount() > 3) {
                        event.setStatus(FAILED);
                    }
                    outboxRepository.save(event);
                }
            }
        }
    }
    ```

2. CDC (Change Data Capture)

    ```yaml
    # Debezium 설정 예시
    connector:
      name: outbox-connector
      config:
        connector.class: io.debezium.connector.postgresql.PostgresConnector
        database.hostname: localhost
        database.port: 5432
        database.user: user
        database.password: password
        database.dbname: mydb
        table.include.list: public.outbox_events
        transforms: outbox
        transforms.outbox.type: io.debezium.transforms.outbox.EventRouter
    ```

3. 트랜잭션 이후 즉시 실행

    ```java
    @Service
    public class OrderService {
        
        @Transactional
        public void createOrder(OrderRequest request) {
            // DB 저장
            orderRepository.save(new Order(request));
            outboxRepository.save(new OutboxEvent("OrderCreated", payload));
        }
        
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleAfterCommit(TransactionCommitEvent event) {
            // 트랜잭션 커밋 후 즉시 outbox 처리
            publishPendingEventsImediately();
        }
        
        private void publishPendingEventsImediately() {
            // 방금 저장된 이벤트들만 처리
            List<OutboxEvent> recentEvents = outboxRepository.findRecentUnpublished();
            // 발행 로직...
        }
    }
    ```

그러나, 동기 응답에서는 Outbox 패턴을 적용하기 어렵습니다.

동기 응답에 필요하지 않는 요소들은 Outbox 패턴을 적용하고, 동기 응답에 필요한 요소들은 트랜잭션 내에서 처리하는 것이 좋습니다.

즉, 중요한 작업은 동기 대기, 부가 작업은 비동기로!

그렇다면 롱 트랜잭션으로 인한 문제는 어떻게 해결할까요?

- 트랜잭션을 최대한 짧게 유지
- Facade 와 같이 외부 API와 트랜잭션 분리(트랜잭션에 아웃박스 이벤트들은 포함)

외부 API 하나당 보상 트랜잭션의 관리로서 SAGA 패턴의 구현체로 Outbox 패턴을 사용할 수 있습니다.
