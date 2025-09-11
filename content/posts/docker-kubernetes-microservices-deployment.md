---
title: "Docker와 Kubernetes를 활용한 마이크로서비스 배포 전략"
description: "컨테이너 기반 마이크로서비스 아키텍처의 배포 자동화와 카카오페이에서 적용하는 실전 운영 노하우를 소개합니다."
publishedAt: "2024-12-18"
category: "Development"
tags: ["Docker", "Kubernetes", "마이크로서비스", "DevOps", "배포자동화"]
author: "김컨테이너"
featured: false
---

# Docker와 Kubernetes를 활용한 마이크로서비스 배포 전략

마이크로서비스 아키텍처에서 각 서비스의 독립적 배포와 확장은 필수 요소입니다. 카카오페이에서 Docker와 Kubernetes를 활용해 구축한 마이크로서비스 배포 파이프라인과 운영 경험을 공유합니다.

## Dockerfile 최적화 패턴

### 1. 멀티 스테이지 빌드
```dockerfile
# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app

# 의존성 먼저 설치 (캐시 최적화)
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Runtime Stage
FROM node:18-alpine AS runtime
WORKDIR /app

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 필요한 파일만 복사
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

USER nextjs
EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 2. 베이스 이미지 최적화
```dockerfile
# 경량 베이스 이미지 사용
FROM node:18-alpine

# 취약점 패치
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# 레이어 캐싱 최적화를 위한 순서
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 소스 코드는 마지막에 복사
COPY . .

# PID 1 문제 해결을 위한 dumb-init 사용
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

## Kubernetes 매니페스트 구성

### 1. Deployment 설정
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  namespace: kakaopay
  labels:
    app: payment-service
    version: v1.2.3
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
        version: v1.2.3
    spec:
      serviceAccountName: payment-service-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 2000
      containers:
      - name: payment-service
        image: kakaopay/payment-service:v1.2.3
        ports:
        - containerPort: 3000
          name: http
        - containerPort: 9090
          name: metrics
        
        # 리소스 제한
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        # 환경 변수
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        
        # 헬스체크
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # 볼륨 마운트
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: logs
          mountPath: /app/logs
      
      volumes:
      - name: config
        configMap:
          name: payment-service-config
      - name: logs
        emptyDir: {}
      
      # 파드 분산 배치
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - payment-service
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
  namespace: kakaopay
  labels:
    app: payment-service
spec:
  selector:
    app: payment-service
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: 9090
    protocol: TCP
  type: ClusterIP
```

### 2. ConfigMap과 Secret 관리
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: payment-service-config
  namespace: kakaopay
data:
  config.yaml: |
    server:
      port: 3000
      timeout: 30s
    logging:
      level: info
      format: json
    features:
      enableMetrics: true
      enableTracing: true
    payment:
      timeout: 10s
      retryAttempts: 3
      retryDelay: 1s

---
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
  namespace: kakaopay
type: Opaque
data:
  host: cGF5bWVudC1kYi5pbnRlcm5hbA==  # base64 encoded
  username: cGF5bWVudA==
  password: c2VjdXJlUGFzc3dvcmQxMjM=

---
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
  namespace: kakaopay
type: Opaque
data:
  private-key: |
    LS0tLS1CRUdJTi...  # base64 encoded private key
  public-key: |
    LS0tLS1CRUdJTi...   # base64 encoded public key
```

### 3. Ingress 설정
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kakaopay-ingress
  namespace: kakaopay
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.kakaopay.com
    secretName: kakaopay-tls
  rules:
  - host: api.kakaopay.com
    http:
      paths:
      - path: /api/v1/payment
        pathType: Prefix
        backend:
          service:
            name: payment-service
            port:
              number: 80
      - path: /api/v1/user
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /api/v1/notification
        pathType: Prefix
        backend:
          service:
            name: notification-service
            port:
              number: 80
```

## 배포 자동화 파이프라인

### 1. GitLab CI/CD 파이프라인
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy-staging
  - deploy-production

variables:
  DOCKER_REGISTRY: registry.kakaopay.com
  KUBERNETES_NAMESPACE: kakaopay
  APP_NAME: payment-service

# 테스트 단계
test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm run test:unit
    - npm run test:integration
    - npm run lint
    - npm run security-audit
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  only:
    - merge_requests
    - main
    - develop

# Docker 이미지 빌드
build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  before_script:
    - echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
  script:
    - docker build -t $DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA .
    - docker build -t $DOCKER_REGISTRY/$APP_NAME:latest .
    - docker push $DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA
    - docker push $DOCKER_REGISTRY/$APP_NAME:latest
  only:
    - main
    - develop

# 스테이징 배포
deploy:staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  environment:
    name: staging
    url: https://api-staging.kakaopay.com
  script:
    - kubectl config use-context staging
    - envsubst < k8s/deployment.yaml | kubectl apply -f -
    - kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE
    - kubectl rollout status deployment/$APP_NAME -n $KUBERNETES_NAMESPACE
    - kubectl get pods -n $KUBERNETES_NAMESPACE -l app=$APP_NAME
  only:
    - develop

# 프로덕션 배포 (수동)
deploy:production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  environment:
    name: production
    url: https://api.kakaopay.com
  script:
    - kubectl config use-context production
    - envsubst < k8s/deployment.yaml | kubectl apply -f -
    - kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHA -n $KUBERNETES_NAMESPACE
    - kubectl rollout status deployment/$APP_NAME -n $KUBERNETES_NAMESPACE
    - kubectl get pods -n $KUBERNETES_NAMESPACE -l app=$APP_NAME
  when: manual
  only:
    - main
```

### 2. ArgoCD를 활용한 GitOps
```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-service
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: kakaopay
  source:
    repoURL: https://git.kakaopay.com/platform/k8s-manifests
    targetRevision: HEAD
    path: apps/payment-service
  destination:
    server: https://kubernetes.default.svc
    namespace: kakaopay
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

## 모니터링과 로깅

### 1. Prometheus 메트릭 설정
```yaml
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: payment-service-metrics
  namespace: kakaopay
spec:
  selector:
    matchLabels:
      app: payment-service
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
    scrapeTimeout: 10s
```

```javascript
// Express.js에서 메트릭 수집
const express = require('express');
const promClient = require('prom-client');

const app = express();

// 기본 메트릭 수집
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// 커스텀 메트릭
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const paymentCounter = new promClient.Counter({
  name: 'payments_total',
  help: 'Total number of payment attempts',
  labelNames: ['status', 'payment_method']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(paymentCounter);

// 메트릭 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.url, res.statusCode)
      .observe(duration);
  });
  
  next();
});

// 메트릭 엔드포인트
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 결제 메트릭 추가
app.post('/api/payment', async (req, res) => {
  try {
    const result = await processPayment(req.body);
    paymentCounter.labels('success', req.body.paymentMethod).inc();
    res.json(result);
  } catch (error) {
    paymentCounter.labels('failure', req.body.paymentMethod).inc();
    res.status(500).json({ error: error.message });
  }
});
```

### 2. 중앙집중식 로깅
```yaml
apiVersion: logging.coreos.com/v1
kind: ClusterLogForwarder
metadata:
  name: instance
  namespace: openshift-logging
spec:
  outputs:
  - name: elasticsearch-kakaopay
    type: elasticsearch
    url: https://elasticsearch.kakaopay.com:9200
    secret:
      name: elasticsearch-secret
  pipelines:
  - name: application-logs
    inputRefs:
    - application
    filterRefs:
    - kakaopay-filter
    outputRefs:
    - elasticsearch-kakaopay
```

## 보안 강화

### 1. Pod Security Policy
```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: kakaopay-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### 2. Network Policy
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: payment-service-netpol
  namespace: kakaopay
spec:
  podSelector:
    matchLabels:
      app: payment-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: kakaopay
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kakaopay
    - podSelector:
        matchLabels:
          app: payment-db
    ports:
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

## 트러블슈팅과 디버깅

### 1. 일반적인 문제 해결
```bash
# 파드 상태 확인
kubectl get pods -n kakaopay -l app=payment-service

# 파드 로그 확인
kubectl logs -n kakaopay deployment/payment-service -f

# 파드 내부 접속
kubectl exec -it -n kakaopay deployment/payment-service -- /bin/sh

# 리소스 사용량 확인
kubectl top pods -n kakaopay

# 이벤트 확인
kubectl get events -n kakaopay --sort-by=.metadata.creationTimestamp

# 네트워크 연결 테스트
kubectl exec -n kakaopay deployment/payment-service -- nc -zv payment-db 5432
```

### 2. 성능 튜닝
```yaml
# HorizontalPodAutoscaler 설정
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payment-service-hpa
  namespace: kakaopay
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payment-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 15
      selectPolicy: Max
```

Docker와 Kubernetes를 활용한 마이크로서비스 배포는 복잡하지만 강력한 확장성과 안정성을 제공합니다. 적절한 모니터링과 자동화를 통해 안정적인 서비스 운영이 가능하며, 지속적인 개선과 최적화가 중요합니다.