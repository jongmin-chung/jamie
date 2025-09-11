---
title: "Node.js 백엔드 개발: 확장 가능한 금융 API 서버 구축하기"
description: "Node.js를 활용하여 높은 성능과 확장성을 갖춘 금융 서비스 백엔드를 개발하는 실무 기법과 베스트 프랙티스를 소개합니다."
publishedAt: "2024-11-05"
category: "Development"
tags: ["Node.js", "백엔드개발", "Express", "API", "성능최적화"]
author: "노드개발"
featured: false
---

# Node.js 백엔드 개발: 확장 가능한 금융 API 서버 구축하기

Node.js의 비동기 I/O 특성을 활용하여 대규모 트래픽을 처리하는 금융 서비스 백엔드를 구축하는 방법과 실무에서 사용하는 최적화 기법을 공유합니다.

## 프로젝트 구조와 아키텍처

### 1. 모듈화된 프로젝트 구조
```
src/
├── app.js                 # 애플리케이션 엔트리포인트
├── config/               # 설정 파일들
│   ├── database.js
│   ├── redis.js
│   └── constants.js
├── controllers/          # 컨트롤러 레이어
│   ├── paymentController.js
│   ├── userController.js
│   └── merchantController.js
├── services/            # 비즈니스 로직
│   ├── paymentService.js
│   ├── authService.js
│   └── notificationService.js
├── models/              # 데이터 모델
│   ├── Payment.js
│   ├── User.js
│   └── Transaction.js
├── middleware/          # 미들웨어
│   ├── auth.js
│   ├── validation.js
│   ├── rateLimiter.js
│   └── errorHandler.js
├── routes/             # 라우트 정의
│   ├── api/
│   │   ├── v1/
│   │   │   ├── payments.js
│   │   │   ├── users.js
│   │   │   └── merchants.js
│   └── index.js
├── utils/              # 유틸리티 함수
│   ├── logger.js
│   ├── crypto.js
│   └── validator.js
└── tests/              # 테스트 파일
    ├── unit/
    ├── integration/
    └── fixtures/
```

### 2. Express 애플리케이션 초기 설정
```javascript
// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

class KakaoPayServer {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // 보안 미들웨어
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS 설정
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS policy violation'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // 압축
    this.app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024
    }));

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15분
      max: 1000, // 요청 제한
      message: {
        error: 'Too many requests',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.ip + ':' + (req.headers['user-agent'] || '');
      }
    });

    this.app.use('/api/', limiter);

    // Body parser
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 요청 로깅
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.headers['user-agent'],
          ip: req.ip
        });
      });
      
      next();
    });
  }

  initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version
      });
    });

    // API 라우트
    this.app.use('/api/v1', require('./routes/api/v1'));
    
    // 404 핸들러
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    });
  }

  initializeErrorHandling() {
    this.app.use(errorHandler);

    // Unhandled promise rejection
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection:', { reason, promise });
      process.exit(1);
    });

    // Uncaught exception
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  start() {
    const PORT = process.env.PORT || 3000;
    
    this.app.listen(PORT, () => {
      logger.info(`KakaoPay Server started on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT,
        pid: process.pid
      });
    });
  }
}

module.exports = KakaoPayServer;
```

## 결제 처리 서비스

### 1. 결제 컨트롤러
```javascript
// controllers/paymentController.js
const paymentService = require('../services/paymentService');
const { validatePaymentRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const { userId } = req.user;
      const { amount, merchantId, paymentMethod, productName } = req.body;
      const idempotencyKey = req.headers['idempotency-key'];

      if (!idempotencyKey) {
        return res.status(400).json({
          error: 'MISSING_IDEMPOTENCY_KEY',
          message: 'Idempotency-Key header is required'
        });
      }

      // 중복 요청 확인
      const existingPayment = await paymentService.findByIdempotencyKey(
        userId, 
        idempotencyKey
      );

      if (existingPayment) {
        return res.status(200).json({
          success: true,
          payment: existingPayment,
          message: 'Payment already processed'
        });
      }

      const paymentRequest = {
        userId,
        amount: parseFloat(amount),
        merchantId,
        paymentMethod,
        productName,
        idempotencyKey,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      };

      const result = await paymentService.processPayment(paymentRequest);

      logger.info('Payment processed successfully', {
        paymentId: result.paymentId,
        userId,
        amount,
        merchantId
      });

      res.status(201).json({
        success: true,
        payment: result
      });

    } catch (error) {
      logger.error('Payment processing failed', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.userId,
        body: req.body
      });

      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { userId } = req.user;

      const payment = await paymentService.getPaymentDetails(paymentId, userId);

      if (!payment) {
        return res.status(404).json({
          error: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found'
        });
      }

      res.status(200).json({
        success: true,
        payment
      });

    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(req, res, next) {
    try {
      const { userId } = req.user;
      const { 
        page = 1, 
        limit = 20, 
        status, 
        startDate, 
        endDate 
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // 최대 100개 제한
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      };

      const result = await paymentService.getPaymentHistory(userId, options);

      res.status(200).json({
        success: true,
        payments: result.payments,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async cancelPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { userId } = req.user;
      const { reason } = req.body;

      const result = await paymentService.cancelPayment(paymentId, userId, reason);

      logger.info('Payment cancelled', {
        paymentId,
        userId,
        reason
      });

      res.status(200).json({
        success: true,
        message: 'Payment cancelled successfully',
        refundInfo: result
      });

    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;
      const { userId } = req.user; // 관리자 권한 필요

      const result = await paymentService.refundPayment(
        paymentId, 
        amount, 
        reason,
        userId
      );

      logger.info('Payment refunded', {
        paymentId,
        refundAmount: amount,
        reason,
        processedBy: userId
      });

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        refund: result
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
```

### 2. 결제 서비스 로직
```javascript
// services/paymentService.js
const Payment = require('../models/Payment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const paymentGateway = require('../utils/paymentGateway');
const eventEmitter = require('../utils/eventEmitter');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class PaymentService {
  async processPayment(paymentRequest) {
    const session = await Payment.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. 사용자 검증 및 잠금
        const user = await User.findById(paymentRequest.userId)
          .session(session)
          .select('+dailyLimit +isActive');

        if (!user || !user.isActive) {
          throw new Error('USER_NOT_FOUND_OR_INACTIVE');
        }

        // 2. 일일 한도 확인
        const todayTransactions = await this.getTodayTransactionSum(
          paymentRequest.userId, 
          session
        );

        if (todayTransactions + paymentRequest.amount > user.dailyLimit) {
          throw new Error('DAILY_LIMIT_EXCEEDED');
        }

        // 3. 결제 처리
        const paymentId = this.generatePaymentId();
        
        const payment = new Payment({
          _id: paymentId,
          userId: paymentRequest.userId,
          merchantId: paymentRequest.merchantId,
          amount: paymentRequest.amount,
          paymentMethod: paymentRequest.paymentMethod,
          productName: paymentRequest.productName,
          status: 'pending',
          idempotencyKey: paymentRequest.idempotencyKey,
          metadata: {
            userAgent: paymentRequest.userAgent,
            ipAddress: paymentRequest.ipAddress
          }
        });

        await payment.save({ session });

        // 4. 외부 결제 게이트웨이 호출
        const gatewayResponse = await paymentGateway.processPayment({
          paymentId,
          amount: paymentRequest.amount,
          paymentMethod: paymentRequest.paymentMethod,
          merchantId: paymentRequest.merchantId
        });

        if (!gatewayResponse.success) {
          payment.status = 'failed';
          payment.errorCode = gatewayResponse.errorCode;
          payment.errorMessage = gatewayResponse.errorMessage;
          await payment.save({ session });
          
          throw new Error(`GATEWAY_ERROR: ${gatewayResponse.errorMessage}`);
        }

        // 5. 결제 성공 처리
        payment.status = 'completed';
        payment.transactionId = gatewayResponse.transactionId;
        payment.completedAt = new Date();
        await payment.save({ session });

        // 6. 거래 기록 생성
        const transaction = new Transaction({
          paymentId,
          userId: paymentRequest.userId,
          type: 'payment',
          amount: paymentRequest.amount,
          status: 'completed',
          description: `Payment for ${paymentRequest.productName}`
        });

        await transaction.save({ session });

        // 7. 캐시 업데이트
        await this.updateUserStatsCache(paymentRequest.userId, paymentRequest.amount);

        return payment;
      });

      // 8. 이벤트 발생 (세션 외부에서)
      eventEmitter.emit('payment.completed', {
        paymentId: payment._id,
        userId: paymentRequest.userId,
        amount: paymentRequest.amount,
        merchantId: paymentRequest.merchantId
      });

      return payment;

    } catch (error) {
      logger.error('Payment processing failed', {
        error: error.message,
        paymentRequest,
        stack: error.stack
      });
      
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findByIdempotencyKey(userId, idempotencyKey) {
    const cacheKey = `payment:idempotency:${userId}:${idempotencyKey}`;
    
    // 먼저 Redis에서 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // DB에서 조회
    const payment = await Payment.findOne({
      userId,
      idempotencyKey
    }).lean();

    if (payment) {
      // 캐시에 저장 (1시간)
      await redis.setex(cacheKey, 3600, JSON.stringify(payment));
    }

    return payment;
  }

  async getPaymentDetails(paymentId, userId) {
    const cacheKey = `payment:details:${paymentId}`;
    
    // Redis에서 먼저 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      const payment = JSON.parse(cached);
      if (payment.userId === userId) {
        return payment;
      }
    }

    const payment = await Payment.findOne({
      _id: paymentId,
      userId
    })
    .populate('merchantId', 'name category')
    .lean();

    if (payment) {
      // 캐시에 저장 (5분)
      await redis.setex(cacheKey, 300, JSON.stringify(payment));
    }

    return payment;
  }

  async getPaymentHistory(userId, options) {
    const {
      page,
      limit,
      status,
      startDate,
      endDate
    } = options;

    const query = { userId };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('merchantId', 'name category')
        .lean(),
      Payment.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      payments,
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  async cancelPayment(paymentId, userId, reason) {
    const payment = await Payment.findOne({
      _id: paymentId,
      userId,
      status: { $in: ['pending', 'completed'] }
    });

    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND_OR_NOT_CANCELLABLE');
    }

    // 결제 게이트웨이에 취소 요청
    const cancelResult = await paymentGateway.cancelPayment({
      paymentId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      reason
    });

    if (!cancelResult.success) {
      throw new Error(`CANCEL_FAILED: ${cancelResult.errorMessage}`);
    }

    // 상태 업데이트
    payment.status = 'cancelled';
    payment.cancelReason = reason;
    payment.cancelledAt = new Date();
    await payment.save();

    // 환불 처리
    if (payment.status === 'completed') {
      await this.processRefund(payment, payment.amount, 'cancellation');
    }

    // 이벤트 발생
    eventEmitter.emit('payment.cancelled', {
      paymentId,
      userId,
      amount: payment.amount,
      reason
    });

    return {
      paymentId,
      refundAmount: payment.amount,
      refundStatus: 'processed'
    };
  }

  async getTodayTransactionSum(userId, session = null) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query = Payment.aggregate([
      {
        $match: {
          userId: userId,
          status: 'completed',
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    if (session) {
      query.session(session);
    }

    const result = await query.exec();
    return result[0]?.totalAmount || 0;
  }

  async updateUserStatsCache(userId, amount) {
    const cacheKey = `user:stats:${userId}`;
    
    const stats = await redis.hgetall(cacheKey);
    
    const updatedStats = {
      totalTransactions: parseInt(stats.totalTransactions || 0) + 1,
      totalAmount: parseFloat(stats.totalAmount || 0) + amount,
      lastTransactionAt: new Date().toISOString()
    };

    await redis.hmset(cacheKey, updatedStats);
    await redis.expire(cacheKey, 86400); // 24시간
  }

  generatePaymentId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `pay_${timestamp}_${random}`;
  }
}

module.exports = new PaymentService();
```

## 성능 최적화

### 1. 데이터베이스 최적화
```javascript
// config/database.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        
        // 성능 최적화 옵션
        bufferMaxEntries: 0,
        bufferCommands: false,
        
        // 모니터링
        monitorCommands: true
      };

      await mongoose.connect(process.env.MONGODB_URI, options);
      
      this.isConnected = true;
      logger.info('Connected to MongoDB', {
        host: mongoose.connection.host,
        database: mongoose.connection.name
      });

      this.setupEventHandlers();
      this.setupIndexes();

    } catch (error) {
      logger.error('MongoDB connection failed', { error: error.message });
      process.exit(1);
    }
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB error', { error: error.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
    });

    // 명령어 모니터링
    mongoose.connection.on('commandStarted', (event) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('MongoDB command started', {
          command: event.commandName,
          collection: event.command[event.commandName],
          requestId: event.requestId
        });
      }
    });

    mongoose.connection.on('commandSucceeded', (event) => {
      const duration = event.duration;
      if (duration > 100) { // 100ms 이상 소요된 쿼리 로깅
        logger.warn('Slow MongoDB query', {
          command: event.commandName,
          duration: `${duration}ms`,
          requestId: event.requestId
        });
      }
    });
  }

  async setupIndexes() {
    try {
      // Payment 컬렉션 인덱스
      await mongoose.connection.db.collection('payments').createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { status: 1 } },
        { key: { merchantId: 1, createdAt: -1 } },
        { key: { idempotencyKey: 1 }, unique: true, sparse: true },
        { key: { transactionId: 1 }, unique: true, sparse: true }
      ]);

      // User 컬렉션 인덱스
      await mongoose.connection.db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { phoneNumber: 1 }, unique: true, sparse: true },
        { key: { isActive: 1 } }
      ]);

      // Transaction 컬렉션 인덱스
      await mongoose.connection.db.collection('transactions').createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { paymentId: 1 } },
        { key: { type: 1, status: 1 } }
      ]);

      logger.info('Database indexes created successfully');

    } catch (error) {
      logger.error('Failed to create database indexes', { error: error.message });
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', { error: error.message });
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      database: mongoose.connection.name
    };
  }
}

module.exports = new DatabaseConnection();
```

### 2. Redis 캐싱 전략
```javascript
// utils/cache.js
const redis = require('../config/redis');
const logger = require('./logger');

class CacheManager {
  constructor() {
    this.defaultTTL = 3600; // 1시간
    this.prefixes = {
      user: 'user:',
      payment: 'payment:',
      merchant: 'merchant:',
      session: 'session:'
    };
  }

  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async mget(keys) {
    try {
      const values = await redis.mget(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error', { keys, error: error.message });
      return new Array(keys.length).fill(null);
    }
  }

  async mset(keyValues, ttl = this.defaultTTL) {
    try {
      const pipeline = redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValues)) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error', { error: error.message });
      return false;
    }
  }

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache del error', { key, error: error.message });
      return false;
    }
  }

  async invalidatePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache invalidate pattern error', { pattern, error: error.message });
      return 0;
    }
  }

  // 분산 락 구현
  async acquireLock(lockKey, timeout = 30000) {
    const lockId = Date.now() + Math.random();
    const lockValue = `${process.pid}:${lockId}`;
    
    try {
      const result = await redis.set(
        `lock:${lockKey}`,
        lockValue,
        'PX',
        timeout,
        'NX'
      );
      
      return result === 'OK' ? lockValue : null;
    } catch (error) {
      logger.error('Acquire lock error', { lockKey, error: error.message });
      return null;
    }
  }

  async releaseLock(lockKey, lockValue) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    try {
      const result = await redis.eval(script, 1, `lock:${lockKey}`, lockValue);
      return result === 1;
    } catch (error) {
      logger.error('Release lock error', { lockKey, error: error.message });
      return false;
    }
  }

  // 캐시 통계
  async getStats() {
    try {
      const info = await redis.info('memory');
      const stats = {};
      
      info.split('\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key.trim()] = value.trim();
        }
      });
      
      return {
        usedMemory: stats.used_memory_human,
        connectedClients: await redis.info('clients'),
        totalCommandsProcessed: stats.total_commands_processed,
        keyspaceHits: stats.keyspace_hits,
        keyspaceMisses: stats.keyspace_misses,
        hitRate: stats.keyspace_hits / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))
      };
    } catch (error) {
      logger.error('Get cache stats error', { error: error.message });
      return null;
    }
  }

  // 캐시 워밍업
  async warmup() {
    try {
      logger.info('Starting cache warmup...');
      
      // 자주 사용되는 데이터 미리 로드
      const warmupTasks = [
        this.warmupUserData(),
        this.warmupMerchantData(),
        this.warmupConfigData()
      ];
      
      await Promise.all(warmupTasks);
      logger.info('Cache warmup completed');
      
    } catch (error) {
      logger.error('Cache warmup error', { error: error.message });
    }
  }

  async warmupUserData() {
    // 활성 사용자 기본 정보 캐싱
    // 구현...
  }

  async warmupMerchantData() {
    // 가맹점 정보 캐싱
    // 구현...
  }

  async warmupConfigData() {
    // 설정 정보 캐싱
    // 구현...
  }
}

module.exports = new CacheManager();
```

## 모니터링과 로깅

### 1. 구조화된 로깅
```javascript
// utils/logger.js
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

class Logger {
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            '@timestamp': timestamp,
            level,
            message,
            service: 'kakaopay-api',
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version,
            pid: process.pid,
            ...meta
          });
        })
      ),
      transports: this.createTransports(),
      exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ],
      rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
      ]
    });
  }

  createTransports() {
    const transports = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ];

    // 프로덕션 환경에서 파일 로그 추가
    if (process.env.NODE_ENV === 'production') {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 10
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10485760,
          maxFiles: 10
        })
      );

      // Elasticsearch 로그 전송
      if (process.env.ELASTICSEARCH_URL) {
        transports.push(
          new ElasticsearchTransport({
            level: 'info',
            clientOpts: { node: process.env.ELASTICSEARCH_URL },
            index: 'kakaopay-api-logs',
            indexTemplate: {
              index_patterns: ['kakaopay-api-logs-*'],
              settings: {
                number_of_shards: 2,
                number_of_replicas: 1
              },
              mappings: {
                properties: {
                  '@timestamp': { type: 'date' },
                  level: { type: 'keyword' },
                  message: { type: 'text' },
                  service: { type: 'keyword' },
                  environment: { type: 'keyword' }
                }
              }
            }
          })
        );
      }
    }

    return transports;
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // 성능 측정을 위한 프로파일링
  profile(id) {
    this.logger.profile(id);
  }

  // 보안 이벤트 로깅
  security(event, meta = {}) {
    this.logger.warn(`SECURITY_EVENT: ${event}`, {
      ...meta,
      security: true,
      timestamp: new Date().toISOString()
    });
  }

  // 비즈니스 이벤트 로깅
  business(event, meta = {}) {
    this.logger.info(`BUSINESS_EVENT: ${event}`, {
      ...meta,
      business: true,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new Logger();
```

Node.js는 빠른 개발과 높은 성능을 동시에 제공하는 훌륭한 백엔드 플랫폼입니다. 적절한 아키텍처 설계와 최적화를 통해 대규모 금융 서비스도 안정적으로 운영할 수 있습니다.