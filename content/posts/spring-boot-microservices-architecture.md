---
title: "Spring Boot 마이크로서비스 아키텍처 설계와 구현"
description: "대규모 금융 서비스를 위한 Spring Boot 기반 마이크로서비스 아키텍처를 설계하고 구현하는 실전 가이드입니다."
publishedAt: "2024-11-28"
category: "Development"
tags: ["Spring Boot", "마이크로서비스", "아키텍처", "Java", "분산시스템"]
author: "박마이크로"
featured: true
---

# Spring Boot 마이크로서비스 아키텍처 설계와 구현

카카오페이의 대규모 금융 서비스를 지탱하는 마이크로서비스 아키텍처를 Spring Boot로 구현하는 방법을 실전 경험을 바탕으로 소개합니다.

## 아키텍처 개요

### 서비스 분해 전략
```java
// 사용자 서비스
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String userId) {
        User user = userService.findById(userId);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}

// 결제 서비스
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @RequestBody PaymentRequest request) {
        Payment payment = paymentService.process(request);
        return ResponseEntity.ok(PaymentResponse.from(payment));
    }
}
```

## 서비스 간 통신

### 1. HTTP 클라이언트 구성
```java
@Configuration
public class RestClientConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .codecs(configurer -> 
                    configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }
}

@Service
public class UserServiceClient {
    
    private final WebClient webClient;
    private final String userServiceUrl;
    
    public Mono<User> getUser(String userId) {
        return webClient.get()
                .uri(userServiceUrl + "/users/{userId}", userId)
                .retrieve()
                .bodyToMono(User.class)
                .timeout(Duration.ofSeconds(3))
                .retry(2);
    }
}
```

### 2. 메시지 기반 통신
```java
@Configuration
@EnableRabbitMQ
public class RabbitMQConfig {
    
    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable("payment.processed").build();
    }
    
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange("payment.exchange");
    }
    
    @Bean
    public Binding paymentBinding() {
        return BindingBuilder
                .bind(paymentQueue())
                .to(paymentExchange())
                .with("payment.processed");
    }
}

@Service
public class PaymentEventPublisher {
    
    private final RabbitTemplate rabbitTemplate;
    
    public void publishPaymentProcessed(PaymentEvent event) {
        rabbitTemplate.convertAndSend(
            "payment.exchange", 
            "payment.processed", 
            event
        );
    }
}
```

## 데이터 관리

### 데이터베이스별 서비스 분리
```java
// 사용자 서비스 - PostgreSQL
@Configuration
@EnableJpaRepositories(basePackages = "com.kakaopay.user.repository")
public class UserDataSourceConfig {
    
    @Primary
    @Bean
    public DataSource userDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:postgresql://user-db:5432/userdb");
        dataSource.setMaximumPoolSize(20);
        return dataSource;
    }
}

// 결제 서비스 - MySQL
@Configuration
@EnableJpaRepositories(basePackages = "com.kakaopay.payment.repository")
public class PaymentDataSourceConfig {
    
    @Bean
    public DataSource paymentDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://payment-db:3306/paymentdb");
        dataSource.setMaximumPoolSize(30);
        return dataSource;
    }
}
```

### 분산 트랜잭션 처리
```java
@Service
@Transactional
public class PaymentProcessingService {
    
    private final PaymentRepository paymentRepository;
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    
    public PaymentResult processPayment(PaymentRequest request) {
        // 1. 결제 정보 저장
        Payment payment = createPayment(request);
        paymentRepository.save(payment);
        
        // 2. 사용자 잔액 차감 (Saga 패턴)
        CompensationContext context = new CompensationContext();
        
        try {
            userServiceClient.deductBalance(
                request.getUserId(), 
                request.getAmount()
            );
            context.addCompensation(() -> 
                userServiceClient.refundBalance(
                    request.getUserId(), 
                    request.getAmount()
                )
            );
            
            // 3. 알림 발송
            notificationServiceClient.sendPaymentNotification(payment);
            
            payment.markAsCompleted();
            return PaymentResult.success(payment);
            
        } catch (Exception e) {
            context.compensate();
            payment.markAsFailed();
            throw new PaymentProcessingException("결제 처리 중 오류 발생", e);
        }
    }
}
```

## 서비스 디스커버리와 로드 밸런싱

### Eureka 서버 구성
```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

### 클라이언트 서비스 등록
```yaml
# application.yml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
    fetch-registry: true
    register-with-eureka: true
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 10
    lease-expiration-duration-in-seconds: 30

spring:
  application:
    name: payment-service
```

## 모니터링과 관찰성

### 헬스 체크 구성
```java
@Component
public class PaymentServiceHealthIndicator implements HealthIndicator {
    
    private final PaymentRepository paymentRepository;
    
    @Override
    public Health health() {
        try {
            // 데이터베이스 연결 상태 확인
            paymentRepository.count();
            
            // 외부 서비스 연결 상태 확인
            checkExternalServices();
            
            return Health.up()
                    .withDetail("database", "available")
                    .withDetail("external-services", "available")
                    .build();
                    
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
```

### 분산 추적 구성
```java
@Configuration
public class TracingConfig {
    
    @Bean
    public Sender sender() {
        return OkHttpSender.create("http://zipkin:9411/api/v2/spans");
    }
    
    @Bean
    public AsyncReporter<Span> spanReporter() {
        return AsyncReporter.create(sender());
    }
    
    @Bean
    public Tracing tracing() {
        return Tracing.newBuilder()
                .localServiceName("payment-service")
                .spanReporter(spanReporter())
                .build();
    }
}
```

## API Gateway 구성

### Spring Cloud Gateway
```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/api/v1/users/**")
                        .filters(f -> f.stripPrefix(2)
                                .circuitBreaker(c -> c.name("user-service")
                                        .fallbackUri("forward:/fallback/users")))
                        .uri("lb://user-service"))
                .route("payment-service", r -> r.path("/api/v1/payments/**")
                        .filters(f -> f.stripPrefix(2)
                                .requestRateLimiter(c -> c.setRateLimiter(redisRateLimiter())))
                        .uri("lb://payment-service"))
                .build();
    }
    
    @Bean
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(10, 20, 1);
    }
}
```

## 설정 관리

### Spring Cloud Config
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

```yaml
# bootstrap.yml (클라이언트)
spring:
  cloud:
    config:
      uri: http://config-server:8888
      retry:
        initial-interval: 1000
        multiplier: 1.1
        max-attempts: 6
      fail-fast: true
```

## 보안 구성

### JWT 토큰 검증
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder())))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated())
                .build();
    }
    
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("http://auth-server/jwks")
                .build();
    }
}
```

## 테스트 전략

### 통합 테스트
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "eureka.client.enabled=false",
    "spring.cloud.config.enabled=false"
})
class PaymentServiceIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @MockBean
    private UserServiceClient userServiceClient;
    
    @Test
    void processPayment_Success() {
        // Given
        when(userServiceClient.deductBalance(any(), any()))
                .thenReturn(Mono.just(true));
        
        PaymentRequest request = PaymentRequest.builder()
                .userId("user123")
                .amount(10000L)
                .build();
        
        // When
        ResponseEntity<PaymentResponse> response = restTemplate.postForEntity(
                "/api/v1/payments", request, PaymentResponse.class);
        
        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getStatus()).isEqualTo("COMPLETED");
    }
}
```

마이크로서비스 아키텍처는 복잡성을 증가시키지만, 적절한 설계와 구현을 통해 확장성과 유지보수성을 크게 향상시킬 수 있습니다. 단계적으로 도입하면서 팀의 역량을 함께 키워나가는 것이 중요합니다.