---
title: "클라우드 네이티브 인프라 자동화와 IaC 실전 가이드"
description: "Terraform, Ansible, Kubernetes를 활용한 클라우드 인프라 자동화 구축과 카카오페이에서의 운영 경험을 공유합니다."
publishedAt: "2024-12-26"
category: "Tech"
tags: ["클라우드", "인프라", "자동화", "Terraform", "Kubernetes"]
author: "클라우드마스터"
featured: true
---

# 클라우드 네이티브 인프라 자동화와 IaC 실전 가이드

클라우드 네이티브 환경에서 인프라 자동화는 필수 요소입니다. 카카오페이에서 AWS, GCP, Azure 멀티 클라우드 환경을 구축하며 축적한 Infrastructure as Code(IaC) 실무 경험과 자동화 전략을 상세히 공유합니다.

## Terraform을 활용한 IaC 구현

### 1. 모듈화된 인프라 설계
```hcl
# modules/vpc/main.tf - VPC 모듈
variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

# VPC 생성
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# 인터넷 게이트웨이
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.environment}-igw"
    Environment = var.environment
  }
}

# 퍼블릭 서브넷
resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.environment}-public-${var.availability_zones[count.index]}"
    Environment = var.environment
    Type        = "public"
  }
}

# 프라이빗 서브넷
resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "${var.environment}-private-${var.availability_zones[count.index]}"
    Environment = var.environment
    Type        = "private"
  }
}

# NAT 게이트웨이
resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = {
    Name        = "${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name        = "${var.environment}-nat-${var.availability_zones[count.index]}"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.main]
}

# 라우팅 테이블
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name        = "${var.environment}-private-rt-${var.availability_zones[count.index]}"
    Environment = var.environment
  }
}

# 라우팅 테이블 연결
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# 출력 변수
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "vpc_cidr_block" {
  value = aws_vpc.main.cidr_block
}
```

### 2. EKS 클러스터 모듈
```hcl
# modules/eks/main.tf - EKS 모듈
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
  default     = "1.28"
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
}

variable "node_groups" {
  description = "Map of EKS managed node group definitions"
  type = map(object({
    instance_types = list(string)
    capacity_type  = string
    min_size      = number
    max_size      = number
    desired_size  = number
    disk_size     = number
    labels        = map(string)
    taints = list(object({
      key    = string
      value  = string
      effect = string
    }))
  }))
  default = {}
}

# IAM 역할 - EKS 클러스터
resource "aws_iam_role" "cluster" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })

  tags = {
    Name = "${var.cluster_name}-cluster-role"
  }
}

# IAM 정책 연결 - EKS 클러스터
resource "aws_iam_role_policy_attachment" "cluster_amazon_eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

# 보안 그룹 - EKS 클러스터
resource "aws_security_group" "cluster" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "Security group for EKS cluster"
  vpc_id      = data.aws_subnet.first.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-cluster-sg"
  }
}

# EKS 클러스터
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    security_group_ids      = [aws_security_group.cluster.id]
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  # 로깅 활성화
  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler",
  ]

  # 암호화 설정
  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_amazon_eks_cluster_policy,
    aws_cloudwatch_log_group.cluster,
  ]

  tags = {
    Name = var.cluster_name
  }
}

# CloudWatch 로그 그룹
resource "aws_cloudwatch_log_group" "cluster" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 7

  tags = {
    Name = "${var.cluster_name}-cluster-logs"
  }
}

# KMS 키 - EKS 암호화
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.cluster_name}-encryption-key"
  }
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.cluster_name}-encryption-key"
  target_key_id = aws_kms_key.eks.key_id
}

# IAM 역할 - 노드 그룹
resource "aws_iam_role" "node_group" {
  name = "${var.cluster_name}-node-group-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })
}

# IAM 정책 연결 - 노드 그룹
resource "aws_iam_role_policy_attachment" "node_group_amazon_eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node_group.name
}

resource "aws_iam_role_policy_attachment" "node_group_amazon_eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node_group.name
}

resource "aws_iam_role_policy_attachment" "node_group_amazon_ec2_container_registry_read_only" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node_group.name
}

# 노드 그룹
resource "aws_eks_node_group" "main" {
  for_each = var.node_groups

  cluster_name    = aws_eks_cluster.main.name
  node_group_name = each.key
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = var.subnet_ids

  capacity_type  = each.value.capacity_type
  instance_types = each.value.instance_types
  disk_size      = each.value.disk_size

  scaling_config {
    desired_size = each.value.desired_size
    max_size     = each.value.max_size
    min_size     = each.value.min_size
  }

  update_config {
    max_unavailable = 1
  }

  labels = each.value.labels

  dynamic "taint" {
    for_each = each.value.taints
    content {
      key    = taint.value.key
      value  = taint.value.value
      effect = taint.value.effect
    }
  }

  # 시작 템플릿
  launch_template {
    name    = aws_launch_template.node_group[each.key].name
    version = aws_launch_template.node_group[each.key].latest_version
  }

  depends_on = [
    aws_iam_role_policy_attachment.node_group_amazon_eks_worker_node_policy,
    aws_iam_role_policy_attachment.node_group_amazon_eks_cni_policy,
    aws_iam_role_policy_attachment.node_group_amazon_ec2_container_registry_read_only,
  ]

  tags = {
    Name = "${var.cluster_name}-${each.key}"
  }
}

# 시작 템플릿 - 노드 그룹
resource "aws_launch_template" "node_group" {
  for_each = var.node_groups

  name = "${var.cluster_name}-${each.key}"

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = each.value.disk_size
      volume_type = "gp3"
      encrypted   = true
    }
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.cluster_name}-${each.key}"
    }
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    cluster_name = aws_eks_cluster.main.name
    node_group   = each.key
  }))
}

data "aws_subnet" "first" {
  id = var.subnet_ids[0]
}

# 출력
output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  value = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_arn" {
  value = aws_eks_cluster.main.arn
}

output "cluster_certificate_authority_data" {
  value = aws_eks_cluster.main.certificate_authority[0].data
}
```

### 3. 환경별 구성 파일
```hcl
# environments/production/main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "kakaopay-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-northeast-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = "production"
      Project     = "kakaopay"
      ManagedBy   = "terraform"
      Owner       = "platform-team"
    }
  }
}

# 로컬 변수
locals {
  cluster_name = "kakaopay-prod"
  environment  = "production"
  
  availability_zones = [
    "${var.aws_region}a",
    "${var.aws_region}b",
    "${var.aws_region}c"
  ]
  
  node_groups = {
    general = {
      instance_types = ["m5.large", "m5.xlarge"]
      capacity_type  = "ON_DEMAND"
      min_size      = 3
      max_size      = 20
      desired_size  = 5
      disk_size     = 50
      labels = {
        role = "general"
      }
      taints = []
    }
    
    compute_optimized = {
      instance_types = ["c5.xlarge", "c5.2xlarge"]
      capacity_type  = "SPOT"
      min_size      = 0
      max_size      = 10
      desired_size  = 2
      disk_size     = 50
      labels = {
        role = "compute"
      }
      taints = [{
        key    = "compute-optimized"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]
    }
  }
}

# VPC 모듈 호출
module "vpc" {
  source = "../../modules/vpc"

  environment        = local.environment
  vpc_cidr          = "10.0.0.0/16"
  availability_zones = local.availability_zones
}

# EKS 모듈 호출
module "eks" {
  source = "../../modules/eks"

  cluster_name    = local.cluster_name
  cluster_version = "1.28"
  subnet_ids      = concat(module.vpc.public_subnet_ids, module.vpc.private_subnet_ids)
  node_groups     = local.node_groups

  depends_on = [module.vpc]
}

# RDS 모듈 호출
module "rds" {
  source = "../../modules/rds"

  identifier     = "${local.cluster_name}-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r5.xlarge"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = "kakaopay"
  username = "admin"
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "${local.cluster_name}-db-final-snapshot"

  tags = {
    Name = "${local.cluster_name}-database"
  }
}

# Redis 클러스터
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.cluster_name}-cache-subnet"
  subnet_ids = module.vpc.private_subnet_ids
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id         = "${local.cluster_name}-redis"
  description                  = "Redis cluster for ${local.cluster_name}"
  
  node_type                   = "cache.r6g.xlarge"
  parameter_group_name        = "default.redis7"
  port                        = 6379
  
  num_cache_clusters          = 3
  automatic_failover_enabled  = true
  multi_az_enabled           = true
  
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth.result
  
  snapshot_retention_limit = 5
  snapshot_window         = "03:00-05:00"
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format      = "text"
    log_type        = "slow-log"
  }

  tags = {
    Name = "${local.cluster_name}-redis"
  }
}
```

## Ansible을 활용한 설정 자동화

### 1. 플레이북 구조
```yaml
# playbooks/site.yml - 메인 플레이북
---
- name: Configure EKS Worker Nodes
  hosts: eks_workers
  become: yes
  roles:
    - common
    - docker
    - kubernetes
    - monitoring
    - security

- name: Configure Database Servers
  hosts: databases
  become: yes
  roles:
    - common
    - postgresql
    - backup
    - monitoring

- name: Configure Load Balancers
  hosts: loadbalancers
  become: yes
  roles:
    - common
    - nginx
    - ssl
    - monitoring

# roles/common/tasks/main.yml - 공통 설정
---
- name: Update system packages
  package:
    name: "*"
    state: latest
  register: package_update
  retries: 3
  delay: 5

- name: Install essential packages
  package:
    name:
      - curl
      - wget
      - vim
      - htop
      - iotop
      - net-tools
      - tcpdump
      - strace
      - lsof
      - jq
      - awscli
    state: present

- name: Configure timezone
  timezone:
    name: "{{ timezone | default('Asia/Seoul') }}"
  notify: restart rsyslog

- name: Configure NTP
  template:
    src: chrony.conf.j2
    dest: /etc/chrony.conf
    backup: yes
  notify: restart chronyd

- name: Set up log rotation
  template:
    src: logrotate.conf.j2
    dest: /etc/logrotate.d/custom
    mode: '0644'

- name: Configure system limits
  template:
    src: limits.conf.j2
    dest: /etc/security/limits.conf
    backup: yes

- name: Configure sysctl parameters
  sysctl:
    name: "{{ item.key }}"
    value: "{{ item.value }}"
    state: present
    reload: yes
  loop:
    - { key: "net.core.somaxconn", value: "32768" }
    - { key: "net.core.netdev_max_backlog", value: "5000" }
    - { key: "net.ipv4.tcp_max_syn_backlog", value: "8192" }
    - { key: "vm.max_map_count", value: "262144" }
    - { key: "fs.file-max", value: "2097152" }

# roles/kubernetes/tasks/main.yml - Kubernetes 설정
---
- name: Install kubectl
  get_url:
    url: "https://dl.k8s.io/release/{{ kubectl_version }}/bin/linux/amd64/kubectl"
    dest: /usr/local/bin/kubectl
    mode: '0755'
    owner: root
    group: root

- name: Install Helm
  unarchive:
    src: "https://get.helm.sh/helm-{{ helm_version }}-linux-amd64.tar.gz"
    dest: /tmp
    remote_src: yes
    creates: /tmp/linux-amd64/helm
  register: helm_download

- name: Move Helm binary
  copy:
    src: /tmp/linux-amd64/helm
    dest: /usr/local/bin/helm
    mode: '0755'
    owner: root
    group: root
    remote_src: yes
  when: helm_download.changed

- name: Configure kubelet
  template:
    src: kubelet-config.yaml.j2
    dest: /etc/kubernetes/kubelet/kubelet-config.yaml
    backup: yes
  notify: restart kubelet

- name: Install CNI plugins
  unarchive:
    src: "https://github.com/containernetworking/plugins/releases/download/{{ cni_version }}/cni-plugins-linux-amd64-{{ cni_version }}.tgz"
    dest: /opt/cni/bin
    remote_src: yes
    creates: /opt/cni/bin/bridge

- name: Configure container runtime
  template:
    src: containerd-config.toml.j2
    dest: /etc/containerd/config.toml
    backup: yes
  notify: restart containerd
```

### 2. 인벤토리 동적 생성
```python
#!/usr/bin/env python3
# dynamic_inventory.py - AWS 동적 인벤토리

import json
import boto3
import argparse
from collections import defaultdict

class AWSInventory:
    def __init__(self):
        self.inventory = defaultdict(dict)
        self.inventory['_meta'] = {'hostvars': {}}
        
        # AWS 클라이언트 초기화
        self.ec2 = boto3.client('ec2')
        self.eks = boto3.client('eks')
        self.rds = boto3.client('rds')
        
    def get_inventory(self):
        """전체 인벤토리 구성"""
        self.get_ec2_instances()
        self.get_eks_nodes()
        self.get_rds_instances()
        return self.inventory
    
    def get_ec2_instances(self):
        """EC2 인스턴스 수집"""
        try:
            response = self.ec2.describe_instances(
                Filters=[
                    {'Name': 'instance-state-name', 'Values': ['running']},
                    {'Name': 'tag:ManagedBy', 'Values': ['terraform']}
                ]
            )
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    self.process_ec2_instance(instance)
                    
        except Exception as e:
            print(f"Error fetching EC2 instances: {e}")
    
    def process_ec2_instance(self, instance):
        """EC2 인스턴스 처리"""
        instance_id = instance['InstanceId']
        private_ip = instance.get('PrivateIpAddress', '')
        public_ip = instance.get('PublicIpAddress', '')
        
        # 태그에서 정보 추출
        tags = {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
        
        # 그룹 결정
        role = tags.get('Role', 'ungrouped')
        environment = tags.get('Environment', 'unknown')
        
        # 그룹에 호스트 추가
        group_name = f"{environment}_{role}"
        if 'hosts' not in self.inventory[group_name]:
            self.inventory[group_name]['hosts'] = []
        
        host_ip = private_ip if private_ip else public_ip
        if host_ip:
            self.inventory[group_name]['hosts'].append(host_ip)
            
            # 호스트 변수 설정
            self.inventory['_meta']['hostvars'][host_ip] = {
                'instance_id': instance_id,
                'instance_type': instance['InstanceType'],
                'private_ip': private_ip,
                'public_ip': public_ip,
                'availability_zone': instance['Placement']['AvailabilityZone'],
                'subnet_id': instance['SubnetId'],
                'vpc_id': instance['VpcId'],
                'tags': tags,
                'ansible_host': host_ip,
                'ansible_user': 'ec2-user' if 'amazon' in tags.get('Name', '').lower() else 'ubuntu'
            }
    
    def get_eks_nodes(self):
        """EKS 노드 수집"""
        try:
            clusters = self.eks.list_clusters()['clusters']
            
            for cluster_name in clusters:
                node_groups = self.eks.list_nodegroups(
                    clusterName=cluster_name
                )['nodegroups']
                
                for node_group in node_groups:
                    self.process_eks_node_group(cluster_name, node_group)
                    
        except Exception as e:
            print(f"Error fetching EKS nodes: {e}")
    
    def process_eks_node_group(self, cluster_name, node_group_name):
        """EKS 노드 그룹 처리"""
        try:
            node_group = self.eks.describe_nodegroup(
                clusterName=cluster_name,
                nodegroupName=node_group_name
            )['nodegroup']
            
            # Auto Scaling Group에서 인스턴스 조회
            asg_name = node_group['resources']['autoScalingGroups'][0]['name']
            
            autoscaling = boto3.client('autoscaling')
            asg_response = autoscaling.describe_auto_scaling_groups(
                AutoScalingGroupNames=[asg_name]
            )
            
            instances = asg_response['AutoScalingGroups'][0]['Instances']
            
            group_name = f"eks_{cluster_name}_{node_group_name}"
            self.inventory[group_name]['hosts'] = []
            
            for instance in instances:
                if instance['LifecycleState'] == 'InService':
                    instance_id = instance['InstanceId']
                    
                    # EC2 세부 정보 조회
                    ec2_response = self.ec2.describe_instances(
                        InstanceIds=[instance_id]
                    )
                    
                    ec2_instance = ec2_response['Reservations'][0]['Instances'][0]
                    private_ip = ec2_instance.get('PrivateIpAddress')
                    
                    if private_ip:
                        self.inventory[group_name]['hosts'].append(private_ip)
                        
                        self.inventory['_meta']['hostvars'][private_ip] = {
                            'instance_id': instance_id,
                            'cluster_name': cluster_name,
                            'node_group': node_group_name,
                            'instance_type': ec2_instance['InstanceType'],
                            'private_ip': private_ip,
                            'ansible_host': private_ip,
                            'ansible_user': 'ec2-user'
                        }
                        
        except Exception as e:
            print(f"Error processing EKS node group {node_group_name}: {e}")

    def run(self):
        """스크립트 실행"""
        parser = argparse.ArgumentParser()
        parser.add_argument('--list', action='store_true')
        parser.add_argument('--host', action='store')
        args = parser.parse_args()

        if args.list:
            print(json.dumps(self.get_inventory(), indent=2))
        elif args.host:
            print(json.dumps(self.inventory['_meta']['hostvars'].get(args.host, {}), indent=2))
        else:
            print(json.dumps({}))

if __name__ == '__main__':
    AWSInventory().run()
```

## GitOps와 ArgoCD 구성

### 1. ArgoCD 애플리케이션 정의
```yaml
# argocd/applications/kakaopay-backend.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: kakaopay-backend
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "1"
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: kakaopay
  source:
    repoURL: https://github.com/kakaopay/k8s-manifests
    targetRevision: main
    path: applications/backend
    helm:
      valueFiles:
        - values.yaml
        - values-production.yaml
      parameters:
        - name: image.tag
          value: "latest"
        - name: replicaCount
          value: "3"
        - name: resources.requests.memory
          value: "512Mi"
        - name: resources.limits.memory
          value: "1Gi"
  destination:
    server: https://kubernetes.default.svc
    namespace: kakaopay-backend
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
  revisionHistoryLimit: 10
  
---
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: kakaopay
  namespace: argocd
spec:
  description: KakaoPay applications
  sourceRepos:
  - 'https://github.com/kakaopay/*'
  - 'https://charts.bitnami.com/bitnami'
  - 'https://kubernetes-sigs.github.io/aws-load-balancer-controller'
  
  destinations:
  - namespace: 'kakaopay-*'
    server: https://kubernetes.default.svc
  - namespace: monitoring
    server: https://kubernetes.default.svc
  - namespace: istio-system
    server: https://kubernetes.default.svc
    
  clusterResourceWhitelist:
  - group: ''
    kind: Namespace
  - group: rbac.authorization.k8s.io
    kind: ClusterRole
  - group: rbac.authorization.k8s.io
    kind: ClusterRoleBinding
  - group: apiextensions.k8s.io
    kind: CustomResourceDefinition
    
  namespaceResourceWhitelist:
  - group: ''
    kind: ConfigMap
  - group: ''
    kind: Secret
  - group: ''
    kind: Service
  - group: apps
    kind: Deployment
  - group: apps
    kind: StatefulSet
  - group: networking.k8s.io
    kind: Ingress
```

### 2. Helm 차트 구조
```yaml
# charts/kakaopay-backend/Chart.yaml
apiVersion: v2
name: kakaopay-backend
description: KakaoPay Backend Service
type: application
version: 1.0.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.1.9
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.3.7
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled

# charts/kakaopay-backend/values.yaml
replicaCount: 3

image:
  repository: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/kakaopay-backend
  pullPolicy: IfNotPresent
  tag: ""

serviceAccount:
  create: true
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/kakaopay-backend-service-account
  name: ""

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8080"
  prometheus.io/path: "/metrics"

podSecurityContext:
  fsGroup: 2000
  runAsNonRoot: true
  runAsUser: 1001

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: true
  className: "alb"
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-northeast-2:123456789012:certificate/example
  hosts:
    - host: api.kakaopay.com
      paths:
        - path: /api/v1/payment
          pathType: Prefix
  tls: []

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

nodeSelector:
  role: general

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - kakaopay-backend
        topologyKey: kubernetes.io/hostname

# 환경 변수
env:
  - name: NODE_ENV
    value: "production"
  - name: DB_HOST
    valueFrom:
      secretKeyRef:
        name: database-secret
        key: host
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: database-secret
        key: password
  - name: REDIS_URL
    valueFrom:
      secretKeyRef:
        name: redis-secret
        key: url

# 의존성 서비스
postgresql:
  enabled: false  # 외부 RDS 사용

redis:
  enabled: false  # 외부 ElastiCache 사용

# ConfigMap
configMap:
  create: true
  data:
    app.yaml: |
      server:
        port: 8080
        timeout: 30s
      logging:
        level: info
        format: json
      metrics:
        enabled: true
        port: 9090
```

### 3. CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy to EKS

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'Dockerfile'
      - '.github/workflows/deploy.yml'

env:
  AWS_REGION: ap-northeast-2
  ECR_REPOSITORY: kakaopay-backend
  EKS_CLUSTER_NAME: kakaopay-prod

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Run security audit
      run: npm audit --audit-level high
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.build-image.outputs.image-tag }}
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Docker 이미지 빌드 및 푸시
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        
        # 최신 태그도 업데이트
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
        
        echo "image-tag=$IMAGE_TAG" >> $GITHUB_OUTPUT

    - name: Scan image for vulnerabilities
      run: |
        # Trivy를 사용한 보안 스캔
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          -v $HOME/Library/Caches:/root/.cache/ \
          aquasec/trivy image --exit-code 1 --severity HIGH,CRITICAL \
          $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Update kube config
      run: |
        aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

    - name: Deploy to ArgoCD
      env:
        IMAGE_TAG: ${{ needs.build.outputs.image-tag }}
      run: |
        # ArgoCD CLI 설치
        curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
        chmod +x /usr/local/bin/argocd
        
        # ArgoCD 로그인
        argocd login ${{ secrets.ARGOCD_SERVER }} --username ${{ secrets.ARGOCD_USERNAME }} --password ${{ secrets.ARGOCD_PASSWORD }}
        
        # 애플리케이션 이미지 태그 업데이트
        argocd app set kakaopay-backend --parameter image.tag=$IMAGE_TAG
        
        # 동기화 및 대기
        argocd app sync kakaopay-backend
        argocd app wait kakaopay-backend --health --timeout 600

    - name: Run smoke tests
      run: |
        # 배포 후 스모크 테스트
        kubectl get pods -n kakaopay-backend
        kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kakaopay-backend -n kakaopay-backend --timeout=300s
        
        # Health check
        ENDPOINT=$(kubectl get ingress kakaopay-backend-ingress -n kakaopay-backend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        curl -f http://$ENDPOINT/health || exit 1

    - name: Notify Slack
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

이러한 클라우드 네이티브 인프라 자동화를 통해 일관성 있고 안정적인 배포 환경을 구축할 수 있습니다. IaC와 GitOps를 조합하여 인프라와 애플리케이션 모두를 코드로 관리하고, 자동화된 파이프라인을 통해 신속하고 안전한 배포를 실현할 수 있습니다.