---
title: "GraphQL API 설계 패턴과 실무 적용 가이드"
description: "GraphQL을 활용한 효율적인 API 설계 패턴과 카카오페이에서의 실제 적용 사례를 통해 학습하는 실무 가이드입니다."
publishedAt: "2024-12-20"
category: "Development"
tags: ["GraphQL", "API", "백엔드", "데이터페칭", "스키마설계"]
author: "박그래프"
featured: true
---

# GraphQL API 설계 패턴과 실무 적용 가이드

GraphQL은 Facebook에서 개발한 데이터 쿼리 및 조작 언어로, REST API의 한계를 극복하고 클라이언트가 필요한 데이터만 정확히 요청할 수 있게 해줍니다. 카카오페이에서 GraphQL을 도입하며 축적한 실무 경험을 바탕으로 효과적인 API 설계 패턴을 소개합니다.

## GraphQL 스키마 설계 원칙

### 1. 도메인 중심 스키마 설계
```graphql
# 사용자 관련 타입 정의
type User {
  id: ID!
  email: String!
  profile: UserProfile
  wallets: [Wallet!]!
  transactions(
    first: Int = 10
    after: String
    status: TransactionStatus
  ): TransactionConnection
}

type UserProfile {
  name: String!
  phone: String
  avatar: String
  verificationLevel: VerificationLevel!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# 지갑 관련 타입
type Wallet {
  id: ID!
  type: WalletType!
  balance: Money!
  currency: Currency!
  isActive: Boolean!
  linkedCards: [PaymentCard!]!
  linkedAccounts: [BankAccount!]!
}

# 거래 내역 관련 타입
type Transaction {
  id: ID!
  amount: Money!
  status: TransactionStatus!
  merchant: Merchant
  description: String
  createdAt: DateTime!
  metadata: JSON
}

# 연결 타입 (Pagination)
type TransactionConnection {
  edges: [TransactionEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type TransactionEdge {
  node: Transaction!
  cursor: String!
}
```

### 2. 입력 타입과 페이로드 패턴
```graphql
# 뮤테이션 입력 타입
input SendMoneyInput {
  recipientId: ID!
  amount: MoneyInput!
  description: String
  scheduledAt: DateTime
  pin: String!
}

input MoneyInput {
  amount: Float!
  currency: Currency!
}

# 뮤테이션 페이로드 패턴
type SendMoneyPayload {
  success: Boolean!
  transaction: Transaction
  errors: [UserError!]!
  clientMutationId: String
}

type UserError {
  field: String!
  message: String!
  code: ErrorCode!
}

enum ErrorCode {
  INSUFFICIENT_BALANCE
  INVALID_RECIPIENT
  PIN_MISMATCH
  TRANSACTION_LIMIT_EXCEEDED
}
```

## 리졸버 구현 패턴

### 1. DataLoader를 활용한 N+1 문제 해결
```javascript
const DataLoader = require('dataloader');

// 사용자 데이터 로더
const userLoader = new DataLoader(async (userIds) => {
  const users = await userService.getUsersByIds(userIds);
  return userIds.map(id => users.find(user => user.id === id));
}, {
  cacheKeyFn: (key) => `user:${key}`,
  maxBatchSize: 100
});

// 거래 내역 데이터 로더
const transactionLoader = new DataLoader(async (keys) => {
  const transactions = await transactionService.getTransactionsByKeys(keys);
  return keys.map(key => {
    const [userId, filters] = key.split(':');
    return transactions.filter(tx => 
      tx.userId === userId && matchesFilters(tx, filters)
    );
  });
});

const resolvers = {
  Query: {
    user: async (parent, { id }, context) => {
      return context.loaders.user.load(id);
    },
    
    transactions: async (parent, args, context) => {
      const key = `${context.userId}:${JSON.stringify(args)}`;
      return context.loaders.transaction.load(key);
    }
  },
  
  User: {
    transactions: async (user, args, context) => {
      const key = `${user.id}:${JSON.stringify(args)}`;
      return context.loaders.transaction.load(key);
    },
    
    wallets: async (user, args, context) => {
      return context.loaders.wallet.load(user.id);
    }
  },
  
  Transaction: {
    user: async (transaction, args, context) => {
      return context.loaders.user.load(transaction.userId);
    },
    
    merchant: async (transaction, args, context) => {
      if (!transaction.merchantId) return null;
      return context.loaders.merchant.load(transaction.merchantId);
    }
  }
};
```

### 2. 인증 및 인가 미들웨어
```javascript
const { AuthenticationError, ForbiddenError } = require('apollo-server');

// 인증 검사 데코레이터
function requireAuth(target, propertyName, descriptor) {
  const method = descriptor.value;
  
  descriptor.value = async function(...args) {
    const [parent, arguments, context] = args;
    
    if (!context.user) {
      throw new AuthenticationError('인증이 필요합니다');
    }
    
    return method.apply(this, args);
  };
}

// 권한 검사 데코레이터
function requirePermission(permission) {
  return function(target, propertyName, descriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args) {
      const [parent, arguments, context] = args;
      
      if (!hasPermission(context.user, permission)) {
        throw new ForbiddenError('권한이 없습니다');
      }
      
      return method.apply(this, args);
    };
  };
}

class TransactionResolver {
  @requireAuth
  @requirePermission('READ_TRANSACTIONS')
  async getTransactions(parent, args, context) {
    return transactionService.getUserTransactions(
      context.user.id, 
      args
    );
  }
  
  @requireAuth
  @requirePermission('SEND_MONEY')
  async sendMoney(parent, { input }, context) {
    // PIN 검증
    const isValidPin = await pinService.verify(
      context.user.id, 
      input.pin
    );
    
    if (!isValidPin) {
      return {
        success: false,
        errors: [{
          field: 'pin',
          message: 'PIN이 올바르지 않습니다',
          code: 'PIN_MISMATCH'
        }]
      };
    }
    
    try {
      const transaction = await transactionService.sendMoney(
        context.user.id,
        input
      );
      
      return {
        success: true,
        transaction,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        errors: formatErrors(error),
        transaction: null
      };
    }
  }
}
```

## 고급 패턴 적용

### 1. Union Types와 Interface 활용
```graphql
# 결제수단 인터페이스
interface PaymentMethod {
  id: ID!
  type: PaymentMethodType!
  isActive: Boolean!
  displayName: String!
}

# 카드 결제수단
type CreditCard implements PaymentMethod {
  id: ID!
  type: PaymentMethodType!
  isActive: Boolean!
  displayName: String!
  maskedNumber: String!
  expiryMonth: Int!
  expiryYear: Int!
  issuer: CardIssuer!
}

# 계좌 결제수단
type BankAccount implements PaymentMethod {
  id: ID!
  type: PaymentMethodType!
  isActive: Boolean!
  displayName: String!
  bankCode: String!
  accountNumber: String!
  accountHolder: String!
}

# 알림 Union Type
union Notification = TransactionNotification | 
                   SecurityAlert | 
                   PromotionNotification

type TransactionNotification {
  id: ID!
  transaction: Transaction!
  message: String!
  createdAt: DateTime!
}

type SecurityAlert {
  id: ID!
  alertType: SecurityAlertType!
  severity: AlertSeverity!
  message: String!
  actionRequired: Boolean!
  createdAt: DateTime!
}
```

### 2. Custom Scalars 구현
```javascript
const { GraphQLScalarType, GraphQLError } = require('graphql');
const { Kind } = require('graphql/language');

// DateTime Scalar
const DateTimeType = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 형식의 날짜/시간',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    throw new GraphQLError(`Value is not a valid DateTime: ${value}`);
  },
  
  parseValue(value) {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Value is not a valid DateTime: ${value}`);
      }
      return date;
    }
    throw new GraphQLError(`Value is not a string: ${value}`);
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError(`Value is not a valid DateTime: ${ast.value}`);
      }
      return date;
    }
    throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`);
  }
});

// Money Scalar (정밀한 금액 처리)
const MoneyType = new GraphQLScalarType({
  name: 'Money',
  description: '정밀한 금액 표현을 위한 커스텀 타입',
  
  serialize(value) {
    return {
      amount: value.amount.toString(),
      currency: value.currency
    };
  },
  
  parseValue(value) {
    if (typeof value === 'object' && value.amount && value.currency) {
      return {
        amount: new Decimal(value.amount),
        currency: value.currency
      };
    }
    throw new GraphQLError(`Value is not a valid Money object: ${value}`);
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      const amount = ast.fields.find(field => field.name.value === 'amount');
      const currency = ast.fields.find(field => field.name.value === 'currency');
      
      if (amount && currency) {
        return {
          amount: new Decimal(amount.value.value),
          currency: currency.value.value
        };
      }
    }
    throw new GraphQLError(`Can only parse object to Money but got a: ${ast.kind}`);
  }
});
```

### 3. 실시간 구독 구현
```javascript
const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    transactionUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['TRANSACTION_UPDATED']),
        (payload, variables, context) => {
          // 사용자의 거래만 구독
          return payload.transactionUpdated.userId === context.user.id;
        }
      )
    },
    
    notificationReceived: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['NOTIFICATION_RECEIVED']),
        (payload, variables, context) => {
          return payload.notificationReceived.userId === context.user.id;
        }
      )
    },
    
    balanceChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['BALANCE_CHANGED']),
        async (payload, variables, context) => {
          // 사용자가 해당 지갑에 접근 권한이 있는지 확인
          const wallet = await walletService.getWallet(
            payload.balanceChanged.walletId
          );
          return wallet.userId === context.user.id;
        }
      )
    }
  },
  
  Mutation: {
    sendMoney: async (parent, { input }, context) => {
      const transaction = await transactionService.sendMoney(
        context.user.id,
        input
      );
      
      // 거래 완료 후 구독자들에게 알림
      pubsub.publish('TRANSACTION_UPDATED', {
        transactionUpdated: transaction
      });
      
      // 잔액 변경 알림
      pubsub.publish('BALANCE_CHANGED', {
        balanceChanged: {
          walletId: transaction.sourceWalletId,
          newBalance: await walletService.getBalance(transaction.sourceWalletId)
        }
      });
      
      return {
        success: true,
        transaction,
        errors: []
      };
    }
  }
};
```

## 성능 최적화 전략

### 1. 쿼리 복잡도 분석
```javascript
const depthLimit = require('graphql-depth-limit');
const costAnalysis = require('graphql-cost-analysis');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(10), // 최대 쿼리 깊이 제한
    costAnalysis({
      maximumCost: 1000,
      defaultCost: 1,
      scalarCost: 1,
      objectCost: 2,
      listFactor: 10,
      introspection: false,
      createError: (max, actual) => {
        const error = new Error(`Query exceeded maximum cost of ${max}. Actual cost: ${actual}`);
        error.code = 'QUERY_TOO_COMPLEX';
        return error;
      }
    })
  ]
});
```

### 2. 캐싱 전략
```javascript
const Redis = require('redis');
const redis = Redis.createClient();

// 필드 레벨 캐싱
const resolvers = {
  Query: {
    user: async (parent, { id }, context) => {
      const cacheKey = `user:${id}`;
      
      // 캐시에서 먼저 확인
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const user = await userService.getUser(id);
      
      // 캐시에 저장 (5분 TTL)
      await redis.setex(cacheKey, 300, JSON.stringify(user));
      
      return user;
    }
  },
  
  User: {
    transactions: async (user, args, context) => {
      const cacheKey = `user:${user.id}:transactions:${JSON.stringify(args)}`;
      
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      
      const transactions = await transactionService.getUserTransactions(
        user.id, 
        args
      );
      
      // 거래 내역은 1분 캐시
      await redis.setex(cacheKey, 60, JSON.stringify(transactions));
      
      return transactions;
    }
  }
};

// 캐시 무효화
class CacheInvalidator {
  static async invalidateUserCache(userId) {
    const pattern = `user:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  static async invalidateTransactionCache(userId) {
    const pattern = `user:${userId}:transactions:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}
```

## 테스트 전략

### 1. 스키마 테스트
```javascript
const { buildSchema, validate, parse } = require('graphql');
const fs = require('fs');

describe('GraphQL Schema Tests', () => {
  const schema = buildSchema(fs.readFileSync('./schema.graphql', 'utf8'));
  
  test('should validate basic user query', () => {
    const query = parse(`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          email
          profile {
            name
            phone
          }
          wallets {
            id
            balance {
              amount
              currency
            }
          }
        }
      }
    `);
    
    const errors = validate(schema, query);
    expect(errors).toHaveLength(0);
  });
  
  test('should reject invalid field access', () => {
    const query = parse(`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          invalidField
        }
      }
    `);
    
    const errors = validate(schema, query);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('invalidField');
  });
});
```

### 2. 리졸버 테스트
```javascript
describe('Transaction Resolvers', () => {
  let mockContext;
  
  beforeEach(() => {
    mockContext = {
      user: { id: 'user123', email: 'test@kakaopay.com' },
      loaders: {
        user: new DataLoader(jest.fn()),
        transaction: new DataLoader(jest.fn())
      }
    };
  });
  
  test('should send money successfully', async () => {
    const input = {
      recipientId: 'user456',
      amount: { amount: 10000, currency: 'KRW' },
      description: '커피값',
      pin: '1234'
    };
    
    // 모킹
    pinService.verify = jest.fn().mockResolvedValue(true);
    transactionService.sendMoney = jest.fn().mockResolvedValue({
      id: 'tx123',
      amount: input.amount,
      status: 'COMPLETED'
    });
    
    const result = await resolvers.Mutation.sendMoney(
      null, 
      { input }, 
      mockContext
    );
    
    expect(result.success).toBe(true);
    expect(result.transaction.id).toBe('tx123');
    expect(result.errors).toHaveLength(0);
  });
  
  test('should handle invalid PIN', async () => {
    const input = {
      recipientId: 'user456',
      amount: { amount: 10000, currency: 'KRW' },
      pin: 'wrong'
    };
    
    pinService.verify = jest.fn().mockResolvedValue(false);
    
    const result = await resolvers.Mutation.sendMoney(
      null, 
      { input }, 
      mockContext
    );
    
    expect(result.success).toBe(false);
    expect(result.errors[0].code).toBe('PIN_MISMATCH');
  });
});
```

GraphQL은 클라이언트가 필요한 데이터만 효율적으로 요청할 수 있게 해주는 강력한 도구입니다. 적절한 스키마 설계와 리졸버 구현, 그리고 성능 최적화를 통해 확장 가능하고 유지보수가 용이한 API를 구축할 수 있습니다.