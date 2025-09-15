---
title: "대용량 금융 데이터베이스 성능 최적화 실전 기법"
description: "수백만 건의 거래 데이터를 처리하는 데이터베이스 성능을 최적화하는 실무 기법과 사례를 소개합니다."
publishedAt: "2024-12-05"
category: "Tech"
tags: ["데이터베이스", "성능최적화", "인덱싱", "쿼리튜닝", "MySQL"]
author: "김데이터"
featured: false
---

# 대용량 금융 데이터베이스 성능 최적화 실전 기법

카카오페이에서 하루 수백만 건의 거래 데이터를 처리하면서 축적한 데이터베이스 성능 최적화 노하우를 공유합니다.

## 인덱스 설계 전략

### 1. 복합 인덱스 최적화
```sql
-- 거래 테이블의 일반적인 쿼리 패턴
SELECT * FROM transactions 
WHERE user_id = '123' 
  AND status = 'COMPLETED' 
  AND created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at DESC 
LIMIT 20;

-- 최적화된 복합 인덱스
CREATE INDEX idx_transactions_user_status_created 
ON transactions (user_id, status, created_at DESC);

-- 인덱스 효과 분석
EXPLAIN FORMAT=JSON 
SELECT * FROM transactions 
WHERE user_id = '123' 
  AND status = 'COMPLETED' 
  AND created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at DESC 
LIMIT 20;
```

### 2. 부분 인덱스 활용
```sql
-- 활성 사용자만 대상으로 하는 부분 인덱스
CREATE INDEX idx_active_users_email 
ON users (email) 
WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- 최근 거래만 빠르게 조회하기 위한 인덱스
CREATE INDEX idx_recent_transactions 
ON transactions (user_id, created_at) 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 쿼리 최적화 기법

### 1. N+1 문제 해결
```java
// 문제가 되는 코드
public List<UserTransactionSummary> getUserTransactionSummaries() {
    List<User> users = userRepository.findAll();
    return users.stream()
            .map(user -> {
                List<Transaction> transactions = 
                    transactionRepository.findByUserId(user.getId());
                return new UserTransactionSummary(user, transactions);
            })
            .collect(Collectors.toList());
}

// 최적화된 코드 - Fetch Join 사용
@Query("SELECT u FROM User u LEFT JOIN FETCH u.transactions t " +
       "WHERE t.createdAt >= :since OR t IS NULL")
public List<User> findUsersWithTransactionsSince(@Param("since") LocalDateTime since);

// 또는 배치 로딩 사용
@BatchSize(size = 50)
@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
private List<Transaction> transactions;
```

### 2. 페이지네이션 최적화
```sql
-- 기존 OFFSET 방식 (느림)
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 100000;

-- 커서 기반 페이지네이션 (빠름)
SELECT * FROM transactions 
WHERE created_at < '2024-11-15 10:30:00'
ORDER BY created_at DESC 
LIMIT 20;
```

```java
// Spring Data JPA에서 커서 기반 구현
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @Query("SELECT t FROM Transaction t WHERE t.createdAt < :cursor " +
           "ORDER BY t.createdAt DESC")
    Page<Transaction> findTransactionsBefore(
        @Param("cursor") LocalDateTime cursor, 
        Pageable pageable
    );
}
```

## 파티셔닝 전략

### 시간 기반 파티셔닝
```sql
-- 월별 파티셔닝 테이블 생성
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_user_created (user_id, created_at)
) PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    -- ... 계속
    PARTITION p202412 VALUES LESS THAN (202413),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 자동 파티션 관리 프로시저
DELIMITER //
CREATE PROCEDURE AddMonthlyPartition()
BEGIN
    DECLARE next_month INT;
    DECLARE partition_name VARCHAR(10);
    
    SET next_month = (YEAR(CURDATE()) * 100 + MONTH(CURDATE()) + 1);
    SET partition_name = CONCAT('p', next_month);
    
    SET @sql = CONCAT(
        'ALTER TABLE transactions ADD PARTITION (',
        'PARTITION ', partition_name, ' VALUES LESS THAN (', next_month + 1, '))'
    );
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END//
DELIMITER ;
```

## 읽기 성능 최적화

### 1. 읽기 전용 복제본 활용
```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    public DataSource masterDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://master-db:3306/kakaopay");
        dataSource.setMaximumPoolSize(20);
        return dataSource;
    }
    
    @Bean
    public DataSource slaveDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://slave-db:3306/kakaopay");
        dataSource.setMaximumPoolSize(30);
        dataSource.setReadOnly(true);
        return dataSource;
    }
}

@Service
@Transactional(readOnly = true)
public class TransactionQueryService {
    
    @Autowired
    @Qualifier("slaveDataSource")
    private DataSource readOnlyDataSource;
    
    public List<Transaction> getRecentTransactions(String userId) {
        // 읽기 전용 복제본에서 조회
        return transactionRepository.findRecentByUserId(userId);
    }
}
```

### 2. 캐싱 전략
```java
@Service
public class UserBalanceService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;
    
    @Cacheable(value = "user-balance", key = "#userId", unless = "#result == null")
    public BigDecimal getUserBalance(String userId) {
        return userRepository.findById(userId)
                .map(User::getBalance)
                .orElse(BigDecimal.ZERO);
    }
    
    @CacheEvict(value = "user-balance", key = "#userId")
    public void updateUserBalance(String userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        user.setBalance(amount);
        userRepository.save(user);
    }
    
    // 분산 캐시 일관성 보장
    @EventListener
    public void handleBalanceUpdated(UserBalanceUpdatedEvent event) {
        String cacheKey = "user-balance::" + event.getUserId();
        redisTemplate.delete(cacheKey);
        
        // 캐시 워밍업
        CompletableFuture.runAsync(() -> 
            getUserBalance(event.getUserId())
        );
    }
}
```

## 쓰기 성능 최적화

### 배치 처리 최적화
```java
@Service
public class BatchTransactionProcessor {
    
    private final JdbcTemplate jdbcTemplate;
    
    @Transactional
    public void processBatchTransactions(List<Transaction> transactions) {
        String sql = "INSERT INTO transactions (user_id, amount, status, created_at) " +
                    "VALUES (?, ?, ?, ?)";
        
        jdbcTemplate.batchUpdate(sql, transactions, 1000, 
            (PreparedStatement ps, Transaction tx) -> {
                ps.setString(1, tx.getUserId());
                ps.setBigDecimal(2, tx.getAmount());
                ps.setString(3, tx.getStatus().name());
                ps.setTimestamp(4, Timestamp.valueOf(tx.getCreatedAt()));
            });
    }
    
    // 비동기 배치 처리
    @Async
    public CompletableFuture<Void> processAsyncBatch(List<Transaction> transactions) {
        int batchSize = 500;
        List<List<Transaction>> batches = Lists.partition(transactions, batchSize);
        
        List<CompletableFuture<Void>> futures = batches.stream()
                .map(batch -> CompletableFuture.runAsync(() -> 
                    processBatchTransactions(batch)))
                .collect(Collectors.toList());
        
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    }
}
```

## 모니터링과 분석

### 1. 성능 지표 수집
```java
@Component
public class DatabaseMetricsCollector {
    
    private final MeterRegistry meterRegistry;
    private final JdbcTemplate jdbcTemplate;
    
    @Scheduled(fixedRate = 30000) // 30초마다
    public void collectSlowQueries() {
        String sql = """
            SELECT query_time, sql_text, rows_examined 
            FROM mysql.slow_log 
            WHERE start_time > DATE_SUB(NOW(), INTERVAL 30 SECOND)
            ORDER BY query_time DESC 
            LIMIT 10
            """;
        
        List<SlowQuery> slowQueries = jdbcTemplate.query(sql, 
            (rs, rowNum) -> SlowQuery.builder()
                .queryTime(rs.getBigDecimal("query_time"))
                .sqlText(rs.getString("sql_text"))
                .rowsExamined(rs.getLong("rows_examined"))
                .build());
        
        slowQueries.forEach(query -> 
            meterRegistry.counter("database.slow_query", 
                "query_time", query.getQueryTime().toString())
                .increment());
    }
}
```

### 2. 자동 인덱스 추천
```sql
-- 인덱스 사용률 분석
SELECT 
    object_schema as db_name,
    object_name as table_name,
    index_name,
    count_star as total_queries,
    count_read as read_queries,
    count_read / count_star * 100 as read_percentage
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'kakaopay'
  AND count_star > 1000
ORDER BY count_star DESC;

-- 누락된 인덱스 탐지
SELECT 
    object_schema,
    object_name,
    column_name,
    cardinality
FROM information_schema.statistics s
LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage p
    ON s.table_schema = p.object_schema 
    AND s.table_name = p.object_name 
    AND s.index_name = p.index_name
WHERE p.index_name IS NULL
  AND s.table_schema = 'kakaopay'
  AND s.cardinality > 1000;
```

## 장애 대응 전략

### 1. 커넥션 풀 최적화
```java
@Configuration
public class HikariConfig {
    
    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        // 커넥션 수 최적화
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        
        // 타임아웃 설정
        config.setConnectionTimeout(3000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        
        // 헬스체크
        config.setConnectionTestQuery("SELECT 1");
        config.setValidationTimeout(1000);
        
        return new HikariDataSource(config);
    }
}
```

### 2. 서킷 브레이커 패턴
```java
@Component
public class DatabaseCircuitBreaker {
    
    private final CircuitBreaker circuitBreaker;
    
    public DatabaseCircuitBreaker() {
        this.circuitBreaker = CircuitBreaker.ofDefaults("database");
        circuitBreaker.getEventPublisher()
                .onStateTransition(event -> 
                    log.info("Circuit breaker state transition: {} -> {}", 
                        event.getStateTransition()));
    }
    
    public <T> T executeQuery(Supplier<T> querySupplier) {
        return circuitBreaker.executeSupplier(querySupplier);
    }
}
```

대용량 데이터베이스의 성능 최적화는 지속적인 모니터링과 개선이 필요한 영역입니다. 데이터 패턴의 변화에 맞춰 인덱스와 쿼리를 지속적으로 튜닝하고, 시스템 리소스를 효율적으로 활용하는 것이 핵심입니다.