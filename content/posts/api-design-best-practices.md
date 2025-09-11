---
title: "RESTful API 설계 모범 사례: 확장 가능한 금융 API 구축하기"
description: "대규모 금융 서비스에서 사용하는 RESTful API 설계 원칙과 실무 적용 방법을 상세히 설명합니다."
publishedAt: "2024-12-03"
category: "Development"
tags: ["API설계", "REST", "OpenAPI", "버전관리", "보안"]
author: "서에이피"
featured: false
---

# RESTful API 설계 모범 사례: 확장 가능한 금융 API 구축하기

카카오페이의 다양한 서비스를 지원하는 API를 설계하고 운영하면서 축적한 경험을 바탕으로, 확장 가능하고 유지보수하기 쉬운 RESTful API 설계 방법을 소개합니다.

## API 설계 기본 원칙

### 1. 리소스 중심 설계
```yaml
# 올바른 리소스 구조
/api/v1/users/{userId}                    # 사용자 정보
/api/v1/users/{userId}/accounts           # 사용자 계좌 목록
/api/v1/users/{userId}/accounts/{accountId}/transactions  # 계좌별 거래 내역
/api/v1/payments                          # 결제 목록
/api/v1/payments/{paymentId}              # 특정 결제
/api/v1/merchants                         # 가맹점 목록
/api/v1/merchants/{merchantId}/payments   # 가맹점별 결제 내역

# 피해야 할 동사 기반 URL
/api/v1/getUser                          # ❌
/api/v1/createPayment                    # ❌
/api/v1/updateUserProfile                # ❌
```

### 2. HTTP 메서드 적절한 사용
```java
@RestController
@RequestMapping("/api/v1/payments")
@Validated
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    // GET - 리소스 조회
    @GetMapping
    public ResponseEntity<PagedResponse<PaymentSummary>> getPayments(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        PaymentSearchCriteria criteria = PaymentSearchCriteria.builder()
                .status(status)
                .from(from)
                .to(to)
                .build();
                
        Page<PaymentSummary> payments = paymentService.searchPayments(criteria, 
                PageRequest.of(page, size));
        
        return ResponseEntity.ok(PagedResponse.of(payments));
    }
    
    // GET - 특정 리소스 조회
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentDetail> getPayment(
            @PathVariable @NotBlank String paymentId) {
        
        PaymentDetail payment = paymentService.getPaymentDetail(paymentId);
        
        return ResponseEntity.ok(payment);
    }
    
    // POST - 새 리소스 생성
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @RequestBody @Valid PaymentRequest request,
            HttpServletRequest httpRequest) {
        
        String idempotencyKey = httpRequest.getHeader("Idempotency-Key");
        if (StringUtils.isEmpty(idempotencyKey)) {
            throw new BadRequestException("Idempotency-Key header is required");
        }
        
        PaymentResponse response = paymentService.processPayment(request, idempotencyKey);
        
        URI location = URI.create("/api/v1/payments/" + response.getPaymentId());
        return ResponseEntity.created(location).body(response);
    }
    
    // PUT - 전체 리소스 업데이트
    @PutMapping("/{paymentId}")
    public ResponseEntity<PaymentDetail> updatePayment(
            @PathVariable @NotBlank String paymentId,
            @RequestBody @Valid PaymentUpdateRequest request) {
        
        PaymentDetail updated = paymentService.updatePayment(paymentId, request);
        
        return ResponseEntity.ok(updated);
    }
    
    // PATCH - 부분 리소스 업데이트
    @PatchMapping("/{paymentId}")
    public ResponseEntity<PaymentDetail> patchPayment(
            @PathVariable @NotBlank String paymentId,
            @RequestBody @Valid JsonPatch patch) {
        
        PaymentDetail updated = paymentService.patchPayment(paymentId, patch);
        
        return ResponseEntity.ok(updated);
    }
    
    // DELETE - 리소스 삭제
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> cancelPayment(
            @PathVariable @NotBlank String paymentId,
            @RequestBody @Valid PaymentCancelRequest request) {
        
        paymentService.cancelPayment(paymentId, request);
        
        return ResponseEntity.noContent().build();
    }
}
```

## 응답 형식 표준화

### 1. 일관된 응답 구조
```java
// 공통 응답 래퍼
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private long timestamp;
    private String requestId;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, 
                System.currentTimeMillis(), getCurrentRequestId());
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, 
                System.currentTimeMillis(), getCurrentRequestId());
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message, 
                System.currentTimeMillis(), getCurrentRequestId());
    }
}

// 페이지네이션 응답
@Data
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> content;
    private PageInfo pageInfo;
    
    @Data
    @AllArgsConstructor
    public static class PageInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
    }
    
    public static <T> PagedResponse<T> of(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                new PageInfo(
                        page.getNumber(),
                        page.getSize(),
                        page.getTotalElements(),
                        page.getTotalPages(),
                        page.isFirst(),
                        page.isLast()
                )
        );
    }
}

// 에러 응답
@Data
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private String details;
    private long timestamp;
    private String path;
    private List<ValidationError> validationErrors;
    
    @Data
    @AllArgsConstructor
    public static class ValidationError {
        private String field;
        private Object rejectedValue;
        private String message;
    }
}
```

### 2. 상태 코드 사용 가이드라인
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // 400 Bad Request
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        
        List<ErrorResponse.ValidationError> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new ErrorResponse.ValidationError(
                        error.getField(),
                        error.getRejectedValue(),
                        error.getDefaultMessage()
                ))
                .collect(Collectors.toList());
        
        ErrorResponse response = new ErrorResponse(
                "VALIDATION_FAILED",
                "입력 데이터 검증에 실패했습니다",
                ex.getMessage(),
                System.currentTimeMillis(),
                request.getRequestURI(),
                validationErrors
        );
        
        return ResponseEntity.badRequest().body(response);
    }
    
    // 401 Unauthorized
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex,
            HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                "AUTHENTICATION_FAILED",
                "인증에 실패했습니다",
                ex.getMessage(),
                System.currentTimeMillis(),
                request.getRequestURI(),
                null
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    // 403 Forbidden
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                "ACCESS_DENIED",
                "접근이 거부되었습니다",
                ex.getMessage(),
                System.currentTimeMillis(),
                request.getRequestURI(),
                null
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    // 404 Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                "RESOURCE_NOT_FOUND",
                "요청한 리소스를 찾을 수 없습니다",
                ex.getMessage(),
                System.currentTimeMillis(),
                request.getRequestURI(),
                null
        );
        
        return ResponseEntity.notFound().build();
    }
    
    // 409 Conflict
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
            DuplicateResourceException ex,
            HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                "RESOURCE_CONFLICT",
                "리소스 충돌이 발생했습니다",
                ex.getMessage(),
                System.currentTimeMillis(),
                request.getRequestURI(),
                null
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    
    // 429 Too Many Requests
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitExceededException(
            RateLimitExceededException ex,
            HttpServletRequest request) {
        
        ErrorResponse response = new ErrorResponse(
                "RATE_LIMIT_EXCEEDED",
                "요청 한도를 초과했습니다",
                ex.getMessage(),
                System.currentTimeMillis(),
                request.getRequestURI(),
                null
        );
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Retry-After", "60");
        
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .headers(headers)
                .body(response);
    }
}
```

## OpenAPI 문서화

### 1. Swagger 설정
```java
@Configuration
@EnableOpenApi
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("KakaoPay API")
                        .version("v1.0")
                        .description("카카오페이 결제 서비스 API")
                        .contact(new Contact()
                                .name("KakaoPay Dev Team")
                                .email("dev@kakaopay.com")
                                .url("https://developers.kakaopay.com"))
                        .license(new License()
                                .name("Private")
                                .url("https://kakaopay.com/license")))
                .addServersItem(new Server()
                        .url("https://api.kakaopay.com")
                        .description("Production server"))
                .addServersItem(new Server()
                        .url("https://api-dev.kakaopay.com")
                        .description("Development server"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}

// 컨트롤러 문서화
@RestController
@Tag(name = "Payment", description = "결제 관리 API")
public class PaymentController {
    
    @Operation(
            summary = "결제 생성",
            description = "새로운 결제를 생성합니다",
            responses = {
                    @ApiResponse(responseCode = "201", description = "결제 생성 성공",
                            content = @Content(schema = @Schema(implementation = PaymentResponse.class))),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청",
                            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                    @ApiResponse(responseCode = "401", description = "인증 실패"),
                    @ApiResponse(responseCode = "429", description = "요청 한도 초과")
            }
    )
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @Parameter(description = "결제 요청 정보", required = true)
            @RequestBody @Valid PaymentRequest request,
            
            @Parameter(description = "중복 방지를 위한 고유 키", required = true)
            @RequestHeader("Idempotency-Key") String idempotencyKey) {
        
        // 구현...
    }
}

// 모델 문서화
@Schema(description = "결제 요청")
@Data
public class PaymentRequest {
    
    @Schema(description = "결제 금액", example = "10000", minimum = "1", maximum = "10000000")
    @NotNull
    @Min(1)
    @Max(10000000)
    private Long amount;
    
    @Schema(description = "결제 수단", example = "CARD", allowableValues = {"CARD", "BANK_ACCOUNT", "KAKAO_MONEY"})
    @NotNull
    private PaymentMethod paymentMethod;
    
    @Schema(description = "가맹점 ID", example = "merchant_123")
    @NotBlank
    @Size(max = 50)
    private String merchantId;
    
    @Schema(description = "주문 번호", example = "ORDER_20241203_001")
    @NotBlank
    @Size(max = 100)
    private String orderNumber;
    
    @Schema(description = "상품명", example = "아메리카노")
    @NotBlank
    @Size(max = 200)
    private String productName;
    
    @Schema(description = "구매자 정보")
    @Valid
    private BuyerInfo buyerInfo;
}
```

## API 버전 관리

### 1. URI 버전 관리
```java
// 버전별 컨트롤러 분리
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentControllerV1 {
    
    @PostMapping
    public ResponseEntity<PaymentResponseV1> createPayment(
            @RequestBody PaymentRequestV1 request) {
        // V1 구현
    }
}

@RestController
@RequestMapping("/api/v2/payments")
public class PaymentControllerV2 {
    
    @PostMapping
    public ResponseEntity<PaymentResponseV2> createPayment(
            @RequestBody PaymentRequestV2 request) {
        // V2 구현 - 향상된 기능
    }
}

// 버전 호환성 유지
@Component
public class PaymentVersionAdapter {
    
    public PaymentRequestV2 adaptV1ToV2(PaymentRequestV1 v1Request) {
        return PaymentRequestV2.builder()
                .amount(v1Request.getAmount())
                .paymentMethod(v1Request.getPaymentMethod())
                .merchantId(v1Request.getMerchantId())
                // V2에서 추가된 필드는 기본값 설정
                .currency("KRW")
                .paymentFlow("STANDARD")
                .build();
    }
    
    public PaymentResponseV1 adaptV2ToV1(PaymentResponseV2 v2Response) {
        return PaymentResponseV1.builder()
                .paymentId(v2Response.getPaymentId())
                .status(v2Response.getStatus())
                .amount(v2Response.getAmount())
                // V1에서 지원하지 않는 필드는 제외
                .build();
    }
}
```

### 2. 헤더 기반 버전 관리
```java
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    @PostMapping(headers = "API-Version=v1")
    public ResponseEntity<PaymentResponseV1> createPaymentV1(
            @RequestBody PaymentRequestV1 request) {
        // V1 구현
    }
    
    @PostMapping(headers = "API-Version=v2")
    public ResponseEntity<PaymentResponseV2> createPaymentV2(
            @RequestBody PaymentRequestV2 request) {
        // V2 구현
    }
    
    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestHeader(value = "API-Version", defaultValue = "v1") String version,
            @RequestBody Object request) {
        
        switch (version) {
            case "v1":
                return createPaymentV1((PaymentRequestV1) request);
            case "v2":
                return createPaymentV2((PaymentRequestV2) request);
            default:
                throw new UnsupportedApiVersionException("Unsupported API version: " + version);
        }
    }
}
```

## 보안 고려사항

### 1. 인증과 인가
```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class ApiSecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf().disable()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/v*/health", "/api/v*/docs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v*/auth/login").permitAll()
                        .requestMatchers("/api/v*/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v*/payments/**").hasAnyRole("USER", "MERCHANT")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder())))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler()))
                .build();
    }
    
    @PreAuthorize("hasRole('USER') and #userId == authentication.principal.userId")
    @GetMapping("/users/{userId}/payments")
    public ResponseEntity<List<Payment>> getUserPayments(@PathVariable String userId) {
        // 사용자는 자신의 결제 내역만 조회 가능
    }
}
```

### 2. 입력 검증과 보안
```java
@Component
public class SecurityValidator {
    
    public void validatePaymentRequest(PaymentRequest request) {
        // SQL Injection 방지
        if (containsSqlKeywords(request.getProductName())) {
            throw new SecurityException("Invalid characters in product name");
        }
        
        // XSS 방지
        String sanitizedProductName = HtmlUtils.htmlEscape(request.getProductName());
        request.setProductName(sanitizedProductName);
        
        // 금액 범위 검증
        if (request.getAmount() > getMaxPaymentAmount(request.getMerchantId())) {
            throw new SecurityException("Payment amount exceeds merchant limit");
        }
    }
    
    private boolean containsSqlKeywords(String input) {
        String[] sqlKeywords = {"SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "UNION"};
        String upperInput = input.toUpperCase();
        
        return Arrays.stream(sqlKeywords)
                .anyMatch(upperInput::contains);
    }
}
```

RESTful API 설계는 단순히 기술적인 문제가 아니라 사용자 경험과 개발 생산성에 직접적인 영향을 미치는 중요한 요소입니다. 일관성 있는 설계 원칙과 충분한 문서화, 그리고 보안을 고려한 구현을 통해 장기적으로 유지보수하기 쉬운 API를 만들 수 있습니다.