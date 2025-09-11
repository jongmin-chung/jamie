---
title: "클라우드 네이티브 환경에서의 DevOps 자동화 구축"
description: "Kubernetes와 Jenkins를 활용하여 완전 자동화된 CI/CD 파이프라인을 구축하고 운영하는 실전 가이드입니다."
publishedAt: "2024-12-01"
category: "Development"
tags: ["DevOps", "Kubernetes", "CI/CD", "Jenkins", "Docker", "자동화"]
author: "정데브옵스"
featured: false
---

# 클라우드 네이티브 환경에서의 DevOps 자동화 구축

카카오페이의 마이크로서비스들을 안정적이고 빠르게 배포하기 위한 완전 자동화된 DevOps 파이프라인 구축 경험을 공유합니다.

## CI/CD 파이프라인 아키텍처

### 전체 아키텍처
```yaml
# jenkins-pipeline.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: jenkins-pipeline-config
data:
  Jenkinsfile: |
    pipeline {
        agent {
            kubernetes {
                label 'build-pod'
                yaml """
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: maven
                    image: maven:3.8-openjdk-17
                    command: ['sleep']
                    args: ['99d']
                  - name: docker
                    image: docker:latest
                    command: ['sleep']
                    args: ['99d']
                    volumeMounts:
                    - name: docker-sock
                      mountPath: /var/run/docker.sock
                  - name: kubectl
                    image: bitnami/kubectl:latest
                    command: ['sleep']
                    args: ['99d']
                  volumes:
                  - name: docker-sock
                    hostPath:
                      path: /var/run/docker.sock
                """
            }
        }
        
        stages {
            stage('Checkout') {
                steps {
                    checkout scm
                    script {
                        env.GIT_COMMIT_SHORT = sh(
                            script: "git rev-parse --short HEAD",
                            returnStdout: true
                        ).trim()
                    }
                }
            }
            
            stage('Test') {
                parallel {
                    stage('Unit Tests') {
                        steps {
                            container('maven') {
                                sh 'mvn clean test'
                            }
                        }
                        post {
                            always {
                                publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                            }
                        }
                    }
                    
                    stage('Security Scan') {
                        steps {
                            container('maven') {
                                sh 'mvn dependency-check:aggregate'
                            }
                        }
                    }
                    
                    stage('Code Quality') {
                        steps {
                            container('maven') {
                                sh 'mvn sonar:sonar'
                            }
                        }
                    }
                }
            }
            
            stage('Build & Push') {
                when {
                    anyOf {
                        branch 'main'
                        branch 'develop'
                    }
                }
                steps {
                    container('maven') {
                        sh 'mvn clean package -DskipTests'
                    }
                    container('docker') {
                        script {
                            def image = docker.build("kakaopay/payment-service:${env.GIT_COMMIT_SHORT}")
                            docker.withRegistry('https://registry.kakaopay.com', 'docker-registry-creds') {
                                image.push()
                                image.push('latest')
                            }
                        }
                    }
                }
            }
            
            stage('Deploy') {
                parallel {
                    stage('Deploy to Staging') {
                        when {
                            branch 'develop'
                        }
                        steps {
                            container('kubectl') {
                                sh """
                                    kubectl set image deployment/payment-service \\
                                        payment-service=kakaopay/payment-service:${env.GIT_COMMIT_SHORT} \\
                                        -n staging
                                    kubectl rollout status deployment/payment-service -n staging
                                """
                            }
                        }
                    }
                    
                    stage('Deploy to Production') {
                        when {
                            branch 'main'
                        }
                        steps {
                            script {
                                def deployApproval = input(
                                    message: 'Deploy to production?',
                                    parameters: [
                                        choice(choices: ['Deploy', 'Abort'], description: 'Choose action', name: 'action')
                                    ]
                                )
                                
                                if (deployApproval == 'Deploy') {
                                    container('kubectl') {
                                        // Blue-Green 배포
                                        sh """
                                            ./scripts/blue-green-deploy.sh \\
                                                kakaopay/payment-service:${env.GIT_COMMIT_SHORT}
                                        """
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        post {
            always {
                cleanWs()
            }
            success {
                slackSend(
                    channel: '#deployments',
                    color: 'good',
                    message: "✅ 배포 성공: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
                )
            }
            failure {
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ 배포 실패: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
                )
            }
        }
    }
```

## Blue-Green 배포 자동화

### Blue-Green 배포 스크립트
```bash
#!/bin/bash
# blue-green-deploy.sh

set -e

IMAGE=$1
NAMESPACE="production"
SERVICE_NAME="payment-service"

# 현재 활성 버전 확인
CURRENT_VERSION=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.version}')

if [ "$CURRENT_VERSION" = "blue" ]; then
    NEW_VERSION="green"
    OLD_VERSION="blue"
else
    NEW_VERSION="blue"
    OLD_VERSION="green"
fi

echo "현재 버전: $OLD_VERSION, 새 버전: $NEW_VERSION"

# 새 버전 배포
kubectl set image deployment/${SERVICE_NAME}-${NEW_VERSION} \
    ${SERVICE_NAME}=${IMAGE} \
    -n $NAMESPACE

# 롤아웃 완료 대기
kubectl rollout status deployment/${SERVICE_NAME}-${NEW_VERSION} -n $NAMESPACE --timeout=300s

# 헬스 체크
echo "헬스 체크 수행 중..."
for i in {1..30}; do
    if kubectl exec -n $NAMESPACE deployment/${SERVICE_NAME}-${NEW_VERSION} -- \
       curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "헬스 체크 성공"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo "헬스 체크 실패 - 롤백 수행"
        exit 1
    fi
    
    sleep 10
done

# 스모크 테스트
echo "스모크 테스트 수행 중..."
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: smoke-test-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: smoke-test
        image: kakaopay/smoke-test:latest
        env:
        - name: TARGET_SERVICE
          value: ${SERVICE_NAME}-${NEW_VERSION}
        - name: NAMESPACE
          value: $NAMESPACE
      restartPolicy: Never
  backoffLimit: 3
EOF

# 스모크 테스트 결과 대기
JOB_NAME=$(kubectl get jobs -n $NAMESPACE --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')
kubectl wait --for=condition=complete job/$JOB_NAME -n $NAMESPACE --timeout=300s

# 트래픽 전환
echo "트래픽을 새 버전으로 전환 중..."
kubectl patch service $SERVICE_NAME -n $NAMESPACE -p \
    "{\"spec\":{\"selector\":{\"version\":\"$NEW_VERSION\"}}}"

echo "배포 완료: $NEW_VERSION"

# 이전 버전 정리 (1분 후)
sleep 60
kubectl scale deployment ${SERVICE_NAME}-${OLD_VERSION} --replicas=1 -n $NAMESPACE
```

## GitOps 구현

### ArgoCD 애플리케이션 정의
```yaml
# payment-service-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-service
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "2"
spec:
  project: kakaopay
  source:
    repoURL: https://github.com/kakaopay/k8s-manifests
    targetRevision: main
    path: applications/payment-service
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Helm Chart 구성
```yaml
# values.yaml
replicaCount: 3

image:
  repository: kakaopay/payment-service
  tag: "{{ .Values.image.tag }}"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
    - host: payment-api.kakaopay.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: payment-service-tls
      hosts:
        - payment-api.kakaopay.com

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 60
  periodSeconds: 30

configMap:
  data:
    application.yml: |
      spring:
        profiles:
          active: production
        datasource:
          url: jdbc:mysql://payment-db:3306/payment
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
```

## 모니터링 및 알림

### Prometheus + Grafana 구성
```yaml
# monitoring-stack.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
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
    
    - job_name: 'payment-service'
      static_configs:
      - targets: ['payment-service:8080']
      metrics_path: /actuator/prometheus
      scrape_interval: 10s
    
    alerting:
      alertmanagers:
      - static_configs:
        - targets:
          - alertmanager:9093
    
    rule_files:
    - "alert_rules.yml"

  alert_rules.yml: |
    groups:
    - name: payment-service-alerts
      rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
      
      - alert: HighLatency
        expr: http_request_duration_seconds_quantile{quantile="0.95"} > 1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"
      
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} is restarting frequently"
```

### AlertManager 구성
```yaml
# alertmanager-config.yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'

receivers:
- name: 'web.hook'
  slack_configs:
  - channel: '#alerts'
    title: 'Alert'
    text: 'Alert: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'critical-alerts'
  slack_configs:
  - channel: '#critical-alerts'
    title: '🚨 Critical Alert'
    text: |
      {{ range .Alerts }}
      *Alert:* {{ .Annotations.summary }}
      *Description:* {{ .Annotations.description }}
      *Severity:* {{ .Labels.severity }}
      {{ end }}
  pagerduty_configs:
  - service_key: 'your-pagerduty-service-key'

- name: 'warning-alerts'
  slack_configs:
  - channel: '#warning-alerts'
    title: '⚠️ Warning'
    text: |
      {{ range .Alerts }}
      *Alert:* {{ .Annotations.summary }}
      *Description:* {{ .Annotations.description }}
      {{ end }}
```

## 보안 자동화

### 이미지 보안 스캔
```yaml
# security-pipeline.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-scan-config
data:
  scan.sh: |
    #!/bin/bash
    
    IMAGE_NAME=$1
    
    # Trivy를 사용한 취약점 스캔
    trivy image --format json --output scan-result.json $IMAGE_NAME
    
    # 고위험 취약점 확인
    HIGH_VULNS=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH" or .Severity == "CRITICAL")] | length' scan-result.json)
    
    if [ "$HIGH_VULNS" -gt 0 ]; then
        echo "발견된 고위험 취약점: $HIGH_VULNS개"
        jq '.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH" or .Severity == "CRITICAL")' scan-result.json
        exit 1
    fi
    
    echo "보안 스캔 통과"
    
    # 스캔 결과를 보안 대시보드로 전송
    curl -X POST https://security-dashboard.kakaopay.com/api/scan-results \
         -H "Content-Type: application/json" \
         -d @scan-result.json
```

## 성능 최적화 자동화

### JVM 튜닝 자동화
```java
@Component
public class JVMTuningService {
    
    private final MeterRegistry meterRegistry;
    
    @Scheduled(fixedRate = 300000) // 5분마다
    public void optimizeJVMSettings() {
        // GC 성능 모니터링
        double gcTime = meterRegistry.get("jvm.gc.pause").timer().totalTime(TimeUnit.SECONDS);
        double gcCount = meterRegistry.get("jvm.gc.pause").timer().count();
        
        if (gcCount > 0) {
            double avgGCTime = gcTime / gcCount;
            
            if (avgGCTime > 0.1) { // 평균 GC 시간이 100ms 초과
                adjustHeapSettings();
            }
        }
        
        // 메모리 사용량 체크
        double heapUsed = meterRegistry.get("jvm.memory.used").gauge().value();
        double heapMax = meterRegistry.get("jvm.memory.max").gauge().value();
        double heapUsage = heapUsed / heapMax;
        
        if (heapUsage > 0.8) { // 힙 사용률 80% 초과
            suggestScaleOut();
        }
    }
    
    private void adjustHeapSettings() {
        // Kubernetes ConfigMap 업데이트를 통한 JVM 설정 변경
        log.info("High GC overhead detected, suggesting heap optimization");
        // 실제 운영에서는 자동 조정보다는 알림만 발송
    }
}
```

클라우드 네이티브 DevOps는 자동화, 모니터링, 그리고 지속적인 개선의 문화입니다. 도구와 기술도 중요하지만, 팀 간의 협업과 공유된 책임 의식이 성공의 핵심입니다.