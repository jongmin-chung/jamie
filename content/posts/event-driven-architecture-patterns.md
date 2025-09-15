---
title: "이벤트 드리븐 아키텍처 설계 패턴과 실무 적용"
description: "마이크로서비스 환경에서 이벤트 드리븐 아키텍처를 구현하는 방법과 카카오페이에서의 실제 적용 사례를 소개합니다."
publishedAt: "2024-12-28"
category: "Development"
tags: ["이벤트드리븐", "마이크로서비스", "메시지큐", "아키텍처", "분산시스템"]
author: "박이벤트"
featured: false
---

# 이벤트 드리븐 아키텍처 설계 패턴과 실무 적용

이벤트 드리븐 아키텍처(Event-Driven Architecture)는 느슨한 결합과 높은 확장성을 제공하는 현대적인 아키텍처 패턴입니다. 카카오페이의 결제 시스템에서 이벤트 드리븐 아키텍처를 구현하며 얻은 경험과 실전 노하우를 공유합니다.

## 이벤트 드리븐 아키텍처 기본 개념

### 1. 핵심 구성요소
```javascript
// 이벤트 정의
class PaymentEvent {
  constructor(type, payload, metadata = {}) {
    this.id = generateEventId();
    this.type = type;
    this.payload = payload;
    this.timestamp = new Date().toISOString();
    this.version = '1.0';
    this.metadata = {
      source: 'payment-service',
      correlationId: metadata.correlationId || generateCorrelationId(),
      causationId: metadata.causationId,
      ...metadata
    };
  }
}

// 이벤트 타입 정의
const EventTypes = {
  PAYMENT_REQUESTED: 'payment.requested',
  PAYMENT_VALIDATED: 'payment.validated',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_CANCELLED: 'payment.cancelled',
  
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  BALANCE_UPDATED: 'balance.updated',
  
  FRAUD_DETECTED: 'fraud.detected',
  RISK_ASSESSED: 'risk.assessed'
};

// 이벤트 발행
class EventPublisher {
  constructor(messageQueue) {
    this.messageQueue = messageQueue;
    this.eventStore = new EventStore();
  }
  
  async publish(event) {
    try {
      // 이벤트 저장 (Event Sourcing)
      await this.eventStore.save(event);
      
      // 메시지 큐로 발행
      await this.messageQueue.publish(event.type, event);
      
      console.log(`Event published: ${event.type}`, event.id);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }
  
  async publishBatch(events) {
    const transaction = await this.eventStore.beginTransaction();
    
    try {
      for (const event of events) {
        await this.eventStore.save(event, transaction);
        await this.messageQueue.publish(event.type, event);
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

### 2. 이벤트 핸들러 패턴
```javascript
// 베이스 이벤트 핸들러
class EventHandler {
  constructor(eventType, handler) {
    this.eventType = eventType;
    this.handler = handler;
    this.retryPolicy = {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000
    };
  }
  
  async handle(event) {
    let attempt = 0;
    
    while (attempt <= this.retryPolicy.maxRetries) {
      try {
        await this.handler(event);
        console.log(`Event handled successfully: ${event.id}`);
        return;
      } catch (error) {
        attempt++;
        
        if (attempt > this.retryPolicy.maxRetries) {
          console.error(`Event handling failed after ${this.retryPolicy.maxRetries} attempts:`, error);
          await this.handleFailure(event, error);
          throw error;
        }
        
        const delay = this.retryPolicy.initialDelay * 
                     Math.pow(this.retryPolicy.backoffMultiplier, attempt - 1);
        
        console.log(`Retrying event handling in ${delay}ms (attempt ${attempt})`);
        await this.sleep(delay);
      }
    }
  }
  
  async handleFailure(event, error) {
    // 실패한 이벤트를 Dead Letter Queue로 전송
    const failureEvent = new PaymentEvent('event.handling.failed', {
      originalEvent: event,
      error: error.message,
      handlerType: this.constructor.name
    });
    
    await this.deadLetterQueue.publish(failureEvent);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 결제 요청 핸들러
class PaymentRequestHandler extends EventHandler {
  constructor(paymentService, riskService) {
    super(EventTypes.PAYMENT_REQUESTED, (event) => this.processPayment(event));
    this.paymentService = paymentService;
    this.riskService = riskService;
  }
  
  async processPayment(event) {
    const { paymentId, amount, userId, merchantId } = event.payload;
    
    // 위험도 평가
    const riskScore = await this.riskService.assessRisk({
      userId,
      amount,
      merchantId,
      timestamp: event.timestamp
    });
    
    // 위험도 평가 이벤트 발행
    const riskEvent = new PaymentEvent(EventTypes.RISK_ASSESSED, {
      paymentId,
      riskScore,
      riskLevel: this.categorizeRisk(riskScore)
    }, {
      correlationId: event.metadata.correlationId,
      causationId: event.id
    });
    
    await this.eventPublisher.publish(riskEvent);
    
    // 위험도가 높으면 추가 검증 요청
    if (riskScore > 0.7) {
      const fraudEvent = new PaymentEvent(EventTypes.FRAUD_DETECTED, {
        paymentId,
        riskScore,
        userId,
        reason: 'High risk score detected'
      }, {
        correlationId: event.metadata.correlationId,
        causationId: event.id
      });
      
      await this.eventPublisher.publish(fraudEvent);
      return;
    }
    
    // 결제 처리
    try {
      const result = await this.paymentService.processPayment({
        paymentId,
        amount,
        userId,
        merchantId
      });
      
      // 결제 완료 이벤트 발행
      const completedEvent = new PaymentEvent(EventTypes.PAYMENT_COMPLETED, {
        paymentId,
        transactionId: result.transactionId,
        amount,
        userId,
        merchantId,
        completedAt: new Date().toISOString()
      }, {
        correlationId: event.metadata.correlationId,
        causationId: event.id
      });
      
      await this.eventPublisher.publish(completedEvent);
      
    } catch (error) {
      // 결제 실패 이벤트 발행
      const failedEvent = new PaymentEvent(EventTypes.PAYMENT_FAILED, {
        paymentId,
        error: error.message,
        userId,
        merchantId,
        failedAt: new Date().toISOString()
      }, {
        correlationId: event.metadata.correlationId,
        causationId: event.id
      });
      
      await this.eventPublisher.publish(failedEvent);
    }
  }
  
  categorizeRisk(score) {
    if (score < 0.3) return 'LOW';
    if (score < 0.7) return 'MEDIUM';
    return 'HIGH';
  }
}
```

## 사가(Saga) 패턴 구현

### 1. 분산 트랜잭션 관리
```javascript
// 사가 오케스트레이터
class PaymentSaga {
  constructor(eventPublisher) {
    this.eventPublisher = eventPublisher;
    this.steps = [
      { name: 'validatePayment', compensate: 'cancelPaymentValidation' },
      { name: 'reserveBalance', compensate: 'releaseBalance' },
      { name: 'processPayment', compensate: 'refundPayment' },
      { name: 'updateMerchantBalance', compensate: 'revertMerchantBalance' },
      { name: 'sendNotification', compensate: null }
    ];
    this.sagaStates = new Map();
  }
  
  async startSaga(paymentData) {
    const sagaId = generateSagaId();
    const sagaState = {
      id: sagaId,
      paymentData,
      completedSteps: [],
      currentStep: 0,
      status: 'STARTED',
      startedAt: new Date().toISOString()
    };
    
    this.sagaStates.set(sagaId, sagaState);
    
    // 첫 번째 단계 실행
    await this.executeNextStep(sagaId);
    
    return sagaId;
  }
  
  async executeNextStep(sagaId) {
    const sagaState = this.sagaStates.get(sagaId);
    if (!sagaState || sagaState.currentStep >= this.steps.length) {
      return;
    }
    
    const step = this.steps[sagaState.currentStep];
    
    try {
      // 단계 실행 이벤트 발행
      const stepEvent = new PaymentEvent(`saga.step.${step.name}`, {
        sagaId,
        stepName: step.name,
        paymentData: sagaState.paymentData
      });
      
      await this.eventPublisher.publish(stepEvent);
      
    } catch (error) {
      // 실패 시 보상 트랜잭션 실행
      await this.executeCompensation(sagaId);
    }
  }
  
  async onStepCompleted(sagaId, stepName) {
    const sagaState = this.sagaStates.get(sagaId);
    if (!sagaState) return;
    
    sagaState.completedSteps.push(stepName);
    sagaState.currentStep++;
    
    if (sagaState.currentStep >= this.steps.length) {
      // 모든 단계 완료
      sagaState.status = 'COMPLETED';
      sagaState.completedAt = new Date().toISOString();
      
      const completedEvent = new PaymentEvent('saga.completed', {
        sagaId,
        paymentData: sagaState.paymentData
      });
      
      await this.eventPublisher.publish(completedEvent);
    } else {
      // 다음 단계 실행
      await this.executeNextStep(sagaId);
    }
  }
  
  async onStepFailed(sagaId, stepName, error) {
    const sagaState = this.sagaStates.get(sagaId);
    if (!sagaState) return;
    
    sagaState.status = 'FAILED';
    sagaState.error = error;
    sagaState.failedStep = stepName;
    
    // 보상 트랜잭션 실행
    await this.executeCompensation(sagaId);
  }
  
  async executeCompensation(sagaId) {
    const sagaState = this.sagaStates.get(sagaId);
    if (!sagaState) return;
    
    sagaState.status = 'COMPENSATING';
    
    // 완료된 단계들을 역순으로 보상
    for (let i = sagaState.completedSteps.length - 1; i >= 0; i--) {
      const stepName = sagaState.completedSteps[i];
      const step = this.steps.find(s => s.name === stepName);
      
      if (step.compensate) {
        const compensateEvent = new PaymentEvent(`saga.compensate.${step.compensate}`, {
          sagaId,
          stepName: step.compensate,
          paymentData: sagaState.paymentData
        });
        
        try {
          await this.eventPublisher.publish(compensateEvent);
        } catch (error) {
          console.error(`Compensation failed for step ${step.compensate}:`, error);
        }
      }
    }
    
    sagaState.status = 'COMPENSATED';
    sagaState.compensatedAt = new Date().toISOString();
    
    // 사가 실패 이벤트 발행
    const failedEvent = new PaymentEvent('saga.failed', {
      sagaId,
      error: sagaState.error,
      failedStep: sagaState.failedStep
    });
    
    await this.eventPublisher.publish(failedEvent);
  }
}

// 사가 단계 핸들러들
class ValidatePaymentHandler extends EventHandler {
  constructor(validationService, paymentSaga) {
    super('saga.step.validatePayment', (event) => this.validate(event));
    this.validationService = validationService;
    this.paymentSaga = paymentSaga;
  }
  
  async validate(event) {
    const { sagaId, paymentData } = event.payload;
    
    try {
      await this.validationService.validatePayment(paymentData);
      await this.paymentSaga.onStepCompleted(sagaId, 'validatePayment');
    } catch (error) {
      await this.paymentSaga.onStepFailed(sagaId, 'validatePayment', error.message);
    }
  }
}

class ReserveBalanceHandler extends EventHandler {
  constructor(walletService, paymentSaga) {
    super('saga.step.reserveBalance', (event) => this.reserve(event));
    this.walletService = walletService;
    this.paymentSaga = paymentSaga;
  }
  
  async reserve(event) {
    const { sagaId, paymentData } = event.payload;
    
    try {
      await this.walletService.reserveBalance(
        paymentData.userId,
        paymentData.amount
      );
      await this.paymentSaga.onStepCompleted(sagaId, 'reserveBalance');
    } catch (error) {
      await this.paymentSaga.onStepFailed(sagaId, 'reserveBalance', error.message);
    }
  }
}
```

## CQRS와 Event Sourcing

### 1. 명령과 쿼리 분리
```javascript
// Command 모델
class PaymentCommand {
  constructor(type, aggregateId, payload, expectedVersion = null) {
    this.id = generateCommandId();
    this.type = type;
    this.aggregateId = aggregateId;
    this.payload = payload;
    this.expectedVersion = expectedVersion;
    this.timestamp = new Date().toISOString();
  }
}

// Command Handler
class ProcessPaymentCommandHandler {
  constructor(eventStore, eventPublisher) {
    this.eventStore = eventStore;
    this.eventPublisher = eventPublisher;
  }
  
  async handle(command) {
    const { aggregateId, payload, expectedVersion } = command;
    
    // 기존 이벤트들로부터 애그리게이트 재구성
    const events = await this.eventStore.getEvents(aggregateId);
    const payment = Payment.fromEvents(events);
    
    // 버전 체크 (Optimistic Concurrency Control)
    if (expectedVersion !== null && payment.version !== expectedVersion) {
      throw new Error('Concurrency conflict detected');
    }
    
    // 비즈니스 로직 실행
    const newEvents = payment.processPayment(payload);
    
    // 이벤트 저장 및 발행
    for (const event of newEvents) {
      await this.eventStore.save(event);
      await this.eventPublisher.publish(event);
    }
    
    return payment;
  }
}

// Query 모델
class PaymentReadModel {
  constructor(database) {
    this.database = database;
  }
  
  async getPaymentHistory(userId, filters = {}) {
    let query = `
      SELECT p.*, u.name as user_name, m.name as merchant_name
      FROM payment_projections p
      JOIN users u ON p.user_id = u.id
      JOIN merchants m ON p.merchant_id = m.id
      WHERE p.user_id = $1
    `;
    
    const params = [userId];
    
    if (filters.status) {
      query += ` AND p.status = $${params.length + 1}`;
      params.push(filters.status);
    }
    
    if (filters.fromDate) {
      query += ` AND p.created_at >= $${params.length + 1}`;
      params.push(filters.fromDate);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT 100`;
    
    const result = await this.database.query(query, params);
    return result.rows;
  }
  
  async getPaymentStatistics(userId, period) {
    const query = `
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_count
      FROM payment_projections 
      WHERE user_id = $1 
        AND created_at >= $2
    `;
    
    const result = await this.database.query(query, [userId, period]);
    return result.rows[0];
  }
}

// 프로젝션 업데이터 (이벤트 핸들러)
class PaymentProjectionUpdater extends EventHandler {
  constructor(database) {
    super([
      EventTypes.PAYMENT_COMPLETED,
      EventTypes.PAYMENT_FAILED,
      EventTypes.PAYMENT_CANCELLED
    ], (event) => this.updateProjection(event));
    this.database = database;
  }
  
  async updateProjection(event) {
    switch (event.type) {
      case EventTypes.PAYMENT_COMPLETED:
        await this.handlePaymentCompleted(event);
        break;
      case EventTypes.PAYMENT_FAILED:
        await this.handlePaymentFailed(event);
        break;
      case EventTypes.PAYMENT_CANCELLED:
        await this.handlePaymentCancelled(event);
        break;
    }
  }
  
  async handlePaymentCompleted(event) {
    const { paymentId, amount, userId, merchantId, completedAt } = event.payload;
    
    const query = `
      INSERT INTO payment_projections 
      (id, user_id, merchant_id, amount, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'completed', $5, $5)
      ON CONFLICT (id) 
      DO UPDATE SET 
        status = 'completed',
        updated_at = $5
    `;
    
    await this.database.query(query, [
      paymentId, userId, merchantId, amount, completedAt
    ]);
  }
  
  async handlePaymentFailed(event) {
    const { paymentId, error, failedAt } = event.payload;
    
    const query = `
      UPDATE payment_projections 
      SET status = 'failed', error_message = $2, updated_at = $3
      WHERE id = $1
    `;
    
    await this.database.query(query, [paymentId, error, failedAt]);
  }
}
```

## 이벤트 스트리밍과 실시간 처리

### 1. Kafka를 활용한 스트림 처리
```javascript
// Kafka 프로듀서
class KafkaEventPublisher {
  constructor(kafkaConfig) {
    this.kafka = kafka(kafkaConfig);
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });
  }
  
  async connect() {
    await this.producer.connect();
  }
  
  async publish(event) {
    const message = {
      key: event.payload.aggregateId || event.id,
      value: JSON.stringify(event),
      headers: {
        eventType: event.type,
        version: event.version,
        correlationId: event.metadata.correlationId
      },
      timestamp: new Date(event.timestamp).getTime()
    };
    
    await this.producer.send({
      topic: this.getTopicForEvent(event.type),
      messages: [message]
    });
  }
  
  async publishTransaction(events) {
    const transaction = await this.producer.transaction();
    
    try {
      for (const event of events) {
        await transaction.send({
          topic: this.getTopicForEvent(event.type),
          messages: [{
            key: event.payload.aggregateId || event.id,
            value: JSON.stringify(event),
            headers: {
              eventType: event.type,
              correlationId: event.metadata.correlationId
            }
          }]
        });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.abort();
      throw error;
    }
  }
  
  getTopicForEvent(eventType) {
    const [domain] = eventType.split('.');
    return `${domain}-events`;
  }
}

// Kafka 컨슈머 (스트림 처리)
class PaymentStreamProcessor {
  constructor(kafkaConfig) {
    this.kafka = kafka(kafkaConfig);
    this.consumer = this.kafka.consumer({
      groupId: 'payment-stream-processor',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });
  }
  
  async start() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'payment-events' });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        await this.processEvent(event);
      },
      eachBatch: async ({ batch, resolveOffset, commitOffsetsIfNecessary }) => {
        for (const message of batch.messages) {
          const event = JSON.parse(message.value.toString());
          await this.processEvent(event);
          resolveOffset(message.offset);
        }
        
        await commitOffsetsIfNecessary();
      }
    });
  }
  
  async processEvent(event) {
    switch (event.type) {
      case EventTypes.PAYMENT_COMPLETED:
        await this.updateUserBalance(event);
        await this.sendNotification(event);
        await this.updateAnalytics(event);
        break;
        
      case EventTypes.FRAUD_DETECTED:
        await this.blockUser(event);
        await this.alertSecurityTeam(event);
        break;
        
      case EventTypes.PAYMENT_FAILED:
        await this.logFailure(event);
        await this.triggerRetry(event);
        break;
    }
  }
  
  async updateUserBalance(event) {
    const { userId, amount } = event.payload;
    
    // Redis를 사용한 실시간 잔액 업데이트
    await this.redis.incrby(`balance:${userId}`, -amount);
    
    // 잔액 업데이트 이벤트 발행
    const balanceEvent = new PaymentEvent(EventTypes.BALANCE_UPDATED, {
      userId,
      change: -amount,
      newBalance: await this.redis.get(`balance:${userId}`)
    });
    
    await this.eventPublisher.publish(balanceEvent);
  }
}
```

## 모니터링과 디버깅

### 1. 분산 추적
```javascript
// 이벤트 추적
class EventTracer {
  constructor() {
    this.traces = new Map();
  }
  
  startTrace(correlationId, event) {
    const trace = {
      correlationId,
      startTime: Date.now(),
      events: [this.createTraceEvent(event)],
      status: 'ACTIVE'
    };
    
    this.traces.set(correlationId, trace);
    return trace;
  }
  
  addEvent(correlationId, event) {
    const trace = this.traces.get(correlationId);
    if (trace) {
      trace.events.push(this.createTraceEvent(event));
      trace.lastUpdate = Date.now();
    }
  }
  
  completeTrace(correlationId, result) {
    const trace = this.traces.get(correlationId);
    if (trace) {
      trace.status = 'COMPLETED';
      trace.result = result;
      trace.duration = Date.now() - trace.startTime;
      trace.completedAt = Date.now();
    }
  }
  
  createTraceEvent(event) {
    return {
      eventId: event.id,
      eventType: event.type,
      timestamp: Date.now(),
      service: event.metadata.source,
      causationId: event.metadata.causationId
    };
  }
  
  getTrace(correlationId) {
    return this.traces.get(correlationId);
  }
  
  // 긴 시간 동안 완료되지 않은 추적 찾기
  findStaleTraces(timeoutMs = 300000) { // 5분
    const now = Date.now();
    const staleTraces = [];
    
    for (const [correlationId, trace] of this.traces) {
      if (trace.status === 'ACTIVE' && 
          (now - trace.lastUpdate) > timeoutMs) {
        staleTraces.push(trace);
      }
    }
    
    return staleTraces;
  }
}

// 이벤트 메트릭 수집
class EventMetrics {
  constructor() {
    this.eventCounts = new Map();
    this.processingTimes = new Map();
    this.errors = new Map();
  }
  
  recordEvent(eventType) {
    const count = this.eventCounts.get(eventType) || 0;
    this.eventCounts.set(eventType, count + 1);
  }
  
  recordProcessingTime(eventType, duration) {
    if (!this.processingTimes.has(eventType)) {
      this.processingTimes.set(eventType, []);
    }
    
    this.processingTimes.get(eventType).push(duration);
  }
  
  recordError(eventType, error) {
    if (!this.errors.has(eventType)) {
      this.errors.set(eventType, []);
    }
    
    this.errors.get(eventType).push({
      error: error.message,
      timestamp: Date.now()
    });
  }
  
  getMetrics() {
    const metrics = {};
    
    for (const [eventType, count] of this.eventCounts) {
      const times = this.processingTimes.get(eventType) || [];
      const errors = this.errors.get(eventType) || [];
      
      metrics[eventType] = {
        count,
        averageProcessingTime: times.length > 0 
          ? times.reduce((a, b) => a + b, 0) / times.length 
          : 0,
        errorRate: count > 0 ? errors.length / count : 0,
        recentErrors: errors.slice(-10)
      };
    }
    
    return metrics;
  }
}
```

이벤트 드리븐 아키텍처는 복잡성을 증가시키지만, 올바르게 구현하면 높은 확장성과 유연성을 제공합니다. 적절한 모니터링과 디버깅 도구를 함께 사용하여 안정적인 분산 시스템을 구축할 수 있습니다.