---
title: "SQL 데이터베이스 설계: 금융 서비스를 위한 확장성과 일관성"
description: "대규모 금융 데이터를 안전하고 효율적으로 관리하기 위한 SQL 데이터베이스 설계 원칙과 최적화 기법을 실무 경험을 바탕으로 소개합니다."
publishedAt: "2024-11-02"
category: "Tech"
tags: ["SQL", "데이터베이스설계", "MySQL", "PostgreSQL", "데이터모델링"]
author: "데이터베이스"
featured: false
---

# SQL 데이터베이스 설계: 금융 서비스를 위한 확장성과 일관성

금융 서비스에서 데이터의 정합성과 성능은 서비스 신뢰성에 직결되는 핵심 요소입니다. 카카오페이에서 사용하는 SQL 데이터베이스 설계 원칙과 최적화 방법을 상세히 설명합니다.

## 데이터베이스 스키마 설계

### 1. 사용자 관련 테이블
```sql
-- 사용자 기본 정보 테이블
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) NOT NULL UNIQUE COMMENT '사용자 고유 식별자',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일',
    phone_number VARCHAR(20) UNIQUE COMMENT '휴대폰 번호',
    password_hash VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    name VARCHAR(100) NOT NULL COMMENT '이름',
    birth_date DATE COMMENT '생년월일',
    gender ENUM('M', 'F', 'OTHER') COMMENT '성별',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    kyc_status ENUM('NONE', 'PENDING', 'VERIFIED', 'FAILED') DEFAULT 'NONE',
    kyc_level TINYINT DEFAULT 1 COMMENT 'KYC 인증 레벨 (1-3)',
    daily_limit DECIMAL(15,2) DEFAULT 1000000.00 COMMENT '일일 거래 한도',
    monthly_limit DECIMAL(15,2) DEFAULT 30000000.00 COMMENT '월간 거래 한도',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone_number),
    INDEX idx_uuid (uuid),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_kyc_status_level (kyc_status, kyc_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '사용자 기본 정보';

-- 사용자 프로필 확장 테이블
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    profile_image_url VARCHAR(500),
    nickname VARCHAR(50),
    bio TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country_code CHAR(2) DEFAULT 'KR',
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    language_code CHAR(2) DEFAULT 'ko',
    currency_code CHAR(3) DEFAULT 'KRW',
    notification_preferences JSON,
    privacy_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_country (country_code),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '사용자 프로필 확장 정보';

-- 사용자 인증 정보 테이블
CREATE TABLE user_auth_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_type ENUM('ACCESS', 'REFRESH', 'RESET_PASSWORD', 'EMAIL_VERIFY') NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    client_info JSON COMMENT '클라이언트 정보 (IP, User-Agent 등)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_token_type (user_id, token_type),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '사용자 인증 토큰';
```

### 2. 결제 관련 테이블
```sql
-- 가맹점 정보 테이블
CREATE TABLE merchants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    business_number VARCHAR(20) UNIQUE COMMENT '사업자등록번호',
    representative_name VARCHAR(100) NOT NULL,
    business_type VARCHAR(100),
    category_code VARCHAR(10),
    category_name VARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    website_url VARCHAR(500),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING') DEFAULT 'PENDING',
    contract_start_date DATE,
    contract_end_date DATE,
    commission_rate DECIMAL(5,4) DEFAULT 0.0250 COMMENT '수수료율',
    settlement_cycle ENUM('DAILY', 'WEEKLY', 'MONTHLY') DEFAULT 'DAILY',
    settlement_bank_code CHAR(3),
    settlement_account_number VARCHAR(30),
    api_key VARCHAR(64),
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_uuid (uuid),
    INDEX idx_business_number (business_number),
    INDEX idx_status (status),
    INDEX idx_category (category_code),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (business_name, representative_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '가맹점 정보';

-- 결제 수단 테이블
CREATE TABLE payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    method_type ENUM('CARD', 'BANK_ACCOUNT', 'DIGITAL_WALLET', 'CRYPTO') NOT NULL,
    provider VARCHAR(50) NOT NULL COMMENT '카드사/은행 코드',
    provider_name VARCHAR(100) NOT NULL,
    encrypted_number VARCHAR(255) NOT NULL COMMENT '암호화된 카드/계좌번호',
    masked_number VARCHAR(50) NOT NULL COMMENT '마스킹된 번호',
    holder_name VARCHAR(100) NOT NULL,
    expiry_month TINYINT COMMENT '만료월 (카드)',
    expiry_year SMALLINT COMMENT '만료년 (카드)',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_status ENUM('PENDING', 'VERIFIED', 'FAILED') DEFAULT 'PENDING',
    verified_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    failure_count TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_methods (user_id, is_active),
    INDEX idx_user_default (user_id, is_default),
    INDEX idx_provider (provider),
    INDEX idx_verification (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '사용자 결제 수단';

-- 결제 트랜잭션 테이블
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    merchant_id BIGINT NOT NULL,
    payment_method_id BIGINT,
    order_number VARCHAR(100) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency_code CHAR(3) DEFAULT 'KRW',
    commission_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'DISPUTED') NOT NULL DEFAULT 'PENDING',
    payment_gateway VARCHAR(50) COMMENT 'PG사 식별자',
    gateway_transaction_id VARCHAR(100) COMMENT 'PG사 거래번호',
    gateway_response JSON COMMENT 'PG사 응답 데이터',
    failure_code VARCHAR(20) COMMENT '실패 코드',
    failure_message VARCHAR(500) COMMENT '실패 메시지',
    idempotency_key VARCHAR(64) UNIQUE COMMENT '중복 방지 키',
    client_ip VARCHAR(45),
    user_agent TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL COMMENT '결제 만료 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
    
    INDEX idx_uuid (uuid),
    INDEX idx_user_payments (user_id, created_at DESC),
    INDEX idx_merchant_payments (merchant_id, created_at DESC),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number),
    INDEX idx_gateway_txn (gateway_transaction_id),
    INDEX idx_idempotency (idempotency_key),
    INDEX idx_created_at (created_at),
    INDEX idx_amount_status (amount, status),
    
    -- 파티셔닝을 위한 준비
    PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
        PARTITION p202401 VALUES LESS THAN (202402),
        PARTITION p202402 VALUES LESS THAN (202403),
        PARTITION p202403 VALUES LESS THAN (202404),
        PARTITION p202404 VALUES LESS THAN (202405),
        PARTITION p202405 VALUES LESS THAN (202406),
        PARTITION p202406 VALUES LESS THAN (202407),
        PARTITION p202407 VALUES LESS THAN (202408),
        PARTITION p202408 VALUES LESS THAN (202409),
        PARTITION p202409 VALUES LESS THAN (202410),
        PARTITION p202410 VALUES LESS THAN (202411),
        PARTITION p202411 VALUES LESS THAN (202412),
        PARTITION p202412 VALUES LESS THAN (202501),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '결제 트랜잭션';

-- 환불 테이블
CREATE TABLE refunds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid CHAR(36) NOT NULL UNIQUE,
    payment_id BIGINT NOT NULL,
    refund_amount DECIMAL(15,2) NOT NULL,
    reason VARCHAR(500),
    status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    requested_by BIGINT COMMENT '환불 요청자 (NULL이면 시스템)',
    approved_by BIGINT COMMENT '환불 승인자',
    gateway_refund_id VARCHAR(100) COMMENT 'PG사 환불 거래번호',
    gateway_response JSON,
    failure_code VARCHAR(20),
    failure_message VARCHAR(500),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    
    INDEX idx_uuid (uuid),
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '환불 처리';
```

### 3. 계좌 및 잔액 관리
```sql
-- 사용자 계좌 테이블
CREATE TABLE user_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    account_type ENUM('MAIN', 'SAVINGS', 'INVESTMENT', 'ESCROW') DEFAULT 'MAIN',
    currency_code CHAR(3) DEFAULT 'KRW',
    balance DECIMAL(20,2) DEFAULT 0.00,
    available_balance DECIMAL(20,2) DEFAULT 0.00,
    frozen_balance DECIMAL(20,2) DEFAULT 0.00,
    daily_limit DECIMAL(15,2) DEFAULT 1000000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 30000000.00,
    status ENUM('ACTIVE', 'FROZEN', 'CLOSED') DEFAULT 'ACTIVE',
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    last_transaction_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_account_type (user_id, account_type, currency_code),
    INDEX idx_user_accounts (user_id, status),
    INDEX idx_account_type (account_type),
    INDEX idx_status (status),
    
    -- 잔액 체크 제약조건
    CONSTRAINT chk_balance_positive CHECK (balance >= 0),
    CONSTRAINT chk_available_balance CHECK (available_balance >= 0),
    CONSTRAINT chk_frozen_balance CHECK (frozen_balance >= 0),
    CONSTRAINT chk_balance_consistency CHECK (balance = available_balance + frozen_balance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '사용자 계좌';

-- 잔액 변동 내역 테이블 (이중부기 방식)
CREATE TABLE balance_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER_OUT', 'TRANSFER_IN', 'FEE', 'REFUND', 'ADJUSTMENT') NOT NULL,
    reference_type ENUM('PAYMENT', 'REFUND', 'TRANSFER', 'CHARGE', 'ADMIN') NOT NULL,
    reference_id BIGINT NOT NULL COMMENT '참조 트랜잭션 ID',
    amount DECIMAL(20,2) NOT NULL,
    balance_before DECIMAL(20,2) NOT NULL,
    balance_after DECIMAL(20,2) NOT NULL,
    description VARCHAR(500),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES user_accounts(id),
    
    INDEX idx_user_transactions (user_id, created_at DESC),
    INDEX idx_account_transactions (account_id, created_at DESC),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_created_at (created_at),
    INDEX idx_amount (amount),
    
    -- 파티셔닝
    PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
        PARTITION p202401 VALUES LESS THAN (202402),
        PARTITION p202402 VALUES LESS THAN (202403),
        PARTITION p202403 VALUES LESS THAN (202404),
        PARTITION p202404 VALUES LESS THAN (202405),
        PARTITION p202405 VALUES LESS THAN (202406),
        PARTITION p202406 VALUES LESS THAN (202407),
        PARTITION p202407 VALUES LESS THAN (202408),
        PARTITION p202408 VALUES LESS THAN (202409),
        PARTITION p202409 VALUES LESS THAN (202410),
        PARTITION p202410 VALUES LESS THAN (202411),
        PARTITION p202411 VALUES LESS THAN (202412),
        PARTITION p202412 VALUES LESS THAN (202501),
        PARTITION p_future VALUES LESS THAN MAXVALUE
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '잔액 변동 내역';
```

## 데이터 정합성 보장

### 1. 트랜잭션 처리 프로시저
```sql
-- 결제 처리 스토어드 프로시저
DELIMITER //

CREATE PROCEDURE ProcessPayment(
    IN p_user_id BIGINT,
    IN p_merchant_id BIGINT,
    IN p_payment_method_id BIGINT,
    IN p_amount DECIMAL(15,2),
    IN p_order_number VARCHAR(100),
    IN p_product_name VARCHAR(500),
    IN p_idempotency_key VARCHAR(64),
    OUT p_payment_id BIGINT,
    OUT p_status VARCHAR(20),
    OUT p_message VARCHAR(500)
)
BEGIN
    DECLARE v_user_balance DECIMAL(20,2) DEFAULT 0;
    DECLARE v_daily_used DECIMAL(15,2) DEFAULT 0;
    DECLARE v_daily_limit DECIMAL(15,2) DEFAULT 0;
    DECLARE v_commission_rate DECIMAL(5,4) DEFAULT 0;
    DECLARE v_commission_amount DECIMAL(15,2) DEFAULT 0;
    DECLARE v_account_id BIGINT;
    DECLARE v_payment_uuid CHAR(36);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            p_message = MESSAGE_TEXT;
        SET p_status = 'ERROR';
    END;
    
    START TRANSACTION;
    
    -- 중복 요청 확인
    SELECT id INTO p_payment_id
    FROM payments
    WHERE idempotency_key = p_idempotency_key;
    
    IF p_payment_id IS NOT NULL THEN
        SET p_status = 'DUPLICATE';
        SET p_message = 'Payment already processed';
        COMMIT;
        LEAVE procedure_exit;
    END IF;
    
    -- 사용자 정보 및 한도 확인
    SELECT daily_limit INTO v_daily_limit
    FROM users
    WHERE id = p_user_id AND status = 'ACTIVE'
    FOR UPDATE;
    
    IF v_daily_limit IS NULL THEN
        SET p_status = 'USER_NOT_FOUND';
        SET p_message = 'User not found or inactive';
        ROLLBACK;
        LEAVE procedure_exit;
    END IF;
    
    -- 일일 사용 한도 확인
    SELECT COALESCE(SUM(amount), 0) INTO v_daily_used
    FROM payments
    WHERE user_id = p_user_id
      AND status IN ('COMPLETED', 'PROCESSING')
      AND DATE(created_at) = CURDATE();
    
    IF (v_daily_used + p_amount) > v_daily_limit THEN
        SET p_status = 'DAILY_LIMIT_EXCEEDED';
        SET p_message = 'Daily limit exceeded';
        ROLLBACK;
        LEAVE procedure_exit;
    END IF;
    
    -- 사용자 계좌 잠금 및 잔액 확인
    SELECT id, available_balance INTO v_account_id, v_user_balance
    FROM user_accounts
    WHERE user_id = p_user_id 
      AND account_type = 'MAIN'
      AND status = 'ACTIVE'
    FOR UPDATE;
    
    IF v_user_balance < p_amount THEN
        SET p_status = 'INSUFFICIENT_BALANCE';
        SET p_message = 'Insufficient balance';
        ROLLBACK;
        LEAVE procedure_exit;
    END IF;
    
    -- 가맹점 수수료율 조회
    SELECT commission_rate INTO v_commission_rate
    FROM merchants
    WHERE id = p_merchant_id AND status = 'ACTIVE';
    
    SET v_commission_amount = p_amount * v_commission_rate;
    SET v_payment_uuid = UUID();
    
    -- 결제 레코드 생성
    INSERT INTO payments (
        uuid, user_id, merchant_id, payment_method_id,
        order_number, product_name, amount, commission_amount,
        status, idempotency_key, requested_at
    ) VALUES (
        v_payment_uuid, p_user_id, p_merchant_id, p_payment_method_id,
        p_order_number, p_product_name, p_amount, v_commission_amount,
        'PROCESSING', p_idempotency_key, NOW()
    );
    
    SET p_payment_id = LAST_INSERT_ID();
    
    -- 잔액 차감 (가용잔액 -> 동결잔액)
    UPDATE user_accounts
    SET available_balance = available_balance - p_amount,
        frozen_balance = frozen_balance + p_amount,
        last_transaction_at = NOW(),
        updated_at = NOW()
    WHERE id = v_account_id;
    
    -- 잔액 변동 기록
    INSERT INTO balance_transactions (
        user_id, account_id, transaction_type, reference_type, reference_id,
        amount, balance_before, balance_after, description
    ) VALUES (
        p_user_id, v_account_id, 'WITHDRAW', 'PAYMENT', p_payment_id,
        -p_amount, v_user_balance, v_user_balance - p_amount,
        CONCAT('Payment for order: ', p_order_number)
    );
    
    SET p_status = 'SUCCESS';
    SET p_message = 'Payment initiated successfully';
    
    COMMIT;
    
END //

DELIMITER ;
```

### 2. 트리거를 이용한 데이터 일관성
```sql
-- 결제 상태 변경 시 잔액 처리 트리거
DELIMITER //

CREATE TRIGGER tr_payment_status_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    DECLARE v_account_id BIGINT;
    DECLARE v_balance_before DECIMAL(20,2);
    DECLARE v_balance_after DECIMAL(20,2);
    
    -- 결제 완료 처리
    IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
        SELECT id, balance INTO v_account_id, v_balance_before
        FROM user_accounts
        WHERE user_id = NEW.user_id AND account_type = 'MAIN';
        
        -- 동결잔액에서 실제 차감
        UPDATE user_accounts
        SET frozen_balance = frozen_balance - NEW.amount,
            balance = balance - NEW.amount,
            last_transaction_at = NOW(),
            updated_at = NOW()
        WHERE id = v_account_id;
        
        SET v_balance_after = v_balance_before - NEW.amount;
        
        -- 잔액 변동 기록
        INSERT INTO balance_transactions (
            user_id, account_id, transaction_type, reference_type, reference_id,
            amount, balance_before, balance_after, description
        ) VALUES (
            NEW.user_id, v_account_id, 'WITHDRAW', 'PAYMENT', NEW.id,
            -NEW.amount, v_balance_before, v_balance_after,
            CONCAT('Payment completed: ', NEW.order_number)
        );
    END IF;
    
    -- 결제 실패/취소 시 잔액 복구
    IF OLD.status IN ('PROCESSING', 'PENDING') 
       AND NEW.status IN ('FAILED', 'CANCELLED') THEN
        
        SELECT id, balance INTO v_account_id, v_balance_before
        FROM user_accounts
        WHERE user_id = NEW.user_id AND account_type = 'MAIN';
        
        -- 동결잔액을 가용잔액으로 복구
        UPDATE user_accounts
        SET frozen_balance = frozen_balance - NEW.amount,
            available_balance = available_balance + NEW.amount,
            last_transaction_at = NOW(),
            updated_at = NOW()
        WHERE id = v_account_id;
        
        -- 잔액 변동 기록
        INSERT INTO balance_transactions (
            user_id, account_id, transaction_type, reference_type, reference_id,
            amount, balance_before, balance_after, description
        ) VALUES (
            NEW.user_id, v_account_id, 'DEPOSIT', 'PAYMENT', NEW.id,
            NEW.amount, v_balance_before, v_balance_before,
            CONCAT('Payment ', NEW.status, ': ', NEW.order_number)
        );
    END IF;
END //

DELIMITER ;
```

## 성능 최적화

### 1. 인덱스 최적화
```sql
-- 쿼리 패턴 분석을 위한 뷰
CREATE VIEW payment_query_patterns AS
SELECT 
    DATE(created_at) as query_date,
    COUNT(*) as total_queries,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
    AVG(amount) as avg_amount,
    MAX(amount) as max_amount,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT merchant_id) as unique_merchants
FROM payments
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at);

-- 느린 쿼리 분석
SELECT 
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_exec_time_sec,
    MAX_TIMER_WAIT/1000000000 as max_exec_time_sec,
    SUM_ROWS_EXAMINED,
    SUM_ROWS_SENT
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT LIKE '%payments%'
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;

-- 인덱스 사용률 분석
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'kakaopay'
ORDER BY COUNT_FETCH DESC;
```

### 2. 파티셔닝 관리
```sql
-- 월별 파티션 자동 추가 프로시저
DELIMITER //

CREATE PROCEDURE AddMonthlyPartitions()
BEGIN
    DECLARE v_partition_name VARCHAR(20);
    DECLARE v_partition_value INT;
    DECLARE v_next_partition_value INT;
    DECLARE v_sql TEXT;
    
    -- 다음 달 파티션 추가
    SET v_partition_value = YEAR(DATE_ADD(NOW(), INTERVAL 1 MONTH)) * 100 + 
                           MONTH(DATE_ADD(NOW(), INTERVAL 1 MONTH));
    SET v_next_partition_value = v_partition_value + 1;
    SET v_partition_name = CONCAT('p', v_partition_value);
    
    -- payments 테이블 파티션 추가
    SET v_sql = CONCAT(
        'ALTER TABLE payments REORGANIZE PARTITION p_future INTO (',
        'PARTITION ', v_partition_name, ' VALUES LESS THAN (', v_next_partition_value, '),',
        'PARTITION p_future VALUES LESS THAN MAXVALUE)'
    );
    
    SET @sql = v_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- balance_transactions 테이블 파티션 추가
    SET v_sql = CONCAT(
        'ALTER TABLE balance_transactions REORGANIZE PARTITION p_future INTO (',
        'PARTITION ', v_partition_name, ' VALUES LESS THAN (', v_next_partition_value, '),',
        'PARTITION p_future VALUES LESS THAN MAXVALUE)'
    );
    
    SET @sql = v_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
END //

DELIMITER ;

-- 이벤트 스케줄러로 매월 자동 실행
CREATE EVENT ev_add_monthly_partitions
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 02:00:00'
DO
  CALL AddMonthlyPartitions();
```

### 3. 아카이빙 전략
```sql
-- 오래된 데이터 아카이빙
CREATE TABLE payments_archive LIKE payments;
CREATE TABLE balance_transactions_archive LIKE balance_transactions;

-- 아카이빙 프로시저
DELIMITER //

CREATE PROCEDURE ArchiveOldData(IN months_old INT)
BEGIN
    DECLARE v_cutoff_date DATE;
    DECLARE v_archive_count INT DEFAULT 0;
    
    SET v_cutoff_date = DATE_SUB(CURDATE(), INTERVAL months_old MONTH);
    
    -- 완료된 결제 데이터 아카이빙
    INSERT INTO payments_archive
    SELECT * FROM payments
    WHERE status IN ('COMPLETED', 'REFUNDED', 'CANCELLED')
      AND created_at < v_cutoff_date;
    
    GET DIAGNOSTICS v_archive_count = ROW_COUNT;
    
    -- 원본 데이터 삭제
    DELETE FROM payments
    WHERE status IN ('COMPLETED', 'REFUNDED', 'CANCELLED')
      AND created_at < v_cutoff_date;
    
    -- 잔액 변동 내역 아카이빙
    INSERT INTO balance_transactions_archive
    SELECT bt.* FROM balance_transactions bt
    WHERE bt.created_at < v_cutoff_date
      AND NOT EXISTS (
          SELECT 1 FROM payments p
          WHERE p.id = bt.reference_id
            AND bt.reference_type = 'PAYMENT'
      );
    
    -- 원본 데이터 삭제
    DELETE bt FROM balance_transactions bt
    WHERE bt.created_at < v_cutoff_date
      AND NOT EXISTS (
          SELECT 1 FROM payments p
          WHERE p.id = bt.reference_id
            AND bt.reference_type = 'PAYMENT'
      );
    
    SELECT CONCAT('Archived ', v_archive_count, ' payment records') as result;
END //

DELIMITER ;
```

## 보안 고려사항

### 1. 데이터 암호화
```sql
-- 민감 정보 암호화 함수
DELIMITER //

CREATE FUNCTION EncryptSensitiveData(p_data TEXT, p_key VARCHAR(256))
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    -- AES 암호화 적용
    RETURN TO_BASE64(AES_ENCRYPT(p_data, SHA2(p_key, 256)));
END //

CREATE FUNCTION DecryptSensitiveData(p_encrypted_data TEXT, p_key VARCHAR(256))
RETURNS TEXT
READS SQL DATA
DETERMINISTIC
BEGIN
    -- AES 복호화
    RETURN AES_DECRYPT(FROM_BASE64(p_encrypted_data), SHA2(p_key, 256));
END //

DELIMITER ;

-- 암호화 적용 예시
UPDATE payment_methods 
SET encrypted_number = EncryptSensitiveData(card_number, 'encryption_key')
WHERE encrypted_number IS NULL;
```

### 2. 감사 로그 테이블
```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(64) NOT NULL,
    record_id BIGINT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_changed_at (changed_at),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT '감사 로그';

-- 감사 로그 트리거 예시
DELIMITER //

CREATE TRIGGER tr_payments_audit
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        table_name, record_id, action, 
        old_values, new_values, changed_at
    ) VALUES (
        'payments', NEW.id, 'UPDATE',
        JSON_OBJECT(
            'status', OLD.status,
            'amount', OLD.amount,
            'updated_at', OLD.updated_at
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'amount', NEW.amount,
            'updated_at', NEW.updated_at
        ),
        NOW()
    );
END //

DELIMITER ;
```

금융 서비스의 데이터베이스 설계는 정합성, 성능, 보안을 모두 고려해야 하는 복합적인 작업입니다. 적절한 정규화, 인덱싱, 파티셔닝 전략을 통해 안정적이고 확장 가능한 데이터베이스 시스템을 구축할 수 있습니다.