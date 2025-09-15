---
title: "엣지 컴퓨팅과 IoT 실시간 데이터 처리 아키텍처"
description: "IoT 디바이스와 엣지 컴퓨팅을 활용한 실시간 데이터 처리 시스템 구축과 카카오페이의 스마트 결제 인프라 사례를 소개합니다."
publishedAt: "2024-12-27"
category: "Tech"
tags: ["엣지컴퓨팅", "IoT", "실시간처리", "스마트결제", "분산시스템"]
author: "엣지마스터"
featured: false
---

# 엣지 컴퓨팅과 IoT 실시간 데이터 처리 아키텍처

엣지 컴퓨팅은 데이터 소스에 가까운 곳에서 컴퓨팅을 수행하여 지연시간을 줄이고 대역폭을 절약하는 패러다임입니다. 카카오페이에서 스마트 결제 단말기와 IoT 기반 무인 매장 솔루션을 구축하며 축적한 엣지 컴퓨팅 경험을 공유합니다.

## 엣지 컴퓨팅 아키텍처 설계

### 1. 계층형 아키텍처
```python
# edge_architecture.py - 엣지 컴퓨팅 아키텍처 정의
from typing import Dict, List, Optional, Any
from abc import ABC, abstractmethod
import asyncio
import json
import time
from dataclasses import dataclass
from enum import Enum

class ProcessingTier(Enum):
    DEVICE = "device"          # IoT 디바이스 레벨
    EDGE = "edge"             # 엣지 노드 레벨
    FOG = "fog"               # 포그 노드 레벨 (중간)
    CLOUD = "cloud"           # 클라우드 레벨

@dataclass
class EdgeNode:
    node_id: str
    location: str
    tier: ProcessingTier
    capabilities: List[str]
    max_cpu_usage: float = 80.0
    max_memory_usage: float = 85.0
    max_storage_usage: float = 90.0

@dataclass
class IoTDevice:
    device_id: str
    device_type: str
    location: str
    sensors: List[str]
    last_heartbeat: float
    battery_level: Optional[float] = None
    network_strength: Optional[float] = None

class EdgeProcessor(ABC):
    """엣지 프로세서 베이스 클래스"""
    
    def __init__(self, node: EdgeNode):
        self.node = node
        self.is_active = False
        self.current_workload = 0
        self.processing_queue = asyncio.Queue()
        
    @abstractmethod
    async def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 처리 로직"""
        pass
    
    @abstractmethod
    async def can_handle_workload(self, workload_size: int) -> bool:
        """워크로드 처리 가능 여부 판단"""
        pass
    
    async def start(self):
        """프로세서 시작"""
        self.is_active = True
        await self._processing_loop()
    
    async def stop(self):
        """프로세서 중지"""
        self.is_active = False
    
    async def _processing_loop(self):
        """처리 루프"""
        while self.is_active:
            try:
                data = await asyncio.wait_for(
                    self.processing_queue.get(), timeout=1.0
                )
                result = await self.process_data(data)
                await self._handle_result(result)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                print(f"Processing error: {e}")
    
    async def _handle_result(self, result: Dict[str, Any]):
        """처리 결과 핸들링"""
        if result.get('forward_to_cloud'):
            await self._forward_to_cloud(result)
        
        if result.get('local_action'):
            await self._execute_local_action(result)

class PaymentTerminalProcessor(EdgeProcessor):
    """결제 단말기 엣지 프로세서"""
    
    def __init__(self, node: EdgeNode):
        super().__init__(node)
        self.transaction_cache = {}
        self.fraud_detection_model = self._load_fraud_model()
        self.offline_transaction_queue = []
    
    async def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """결제 데이터 처리"""
        transaction_type = data.get('type')
        
        if transaction_type == 'payment_request':
            return await self._process_payment_request(data)
        elif transaction_type == 'device_status':
            return await self._process_device_status(data)
        elif transaction_type == 'fraud_check':
            return await self._process_fraud_check(data)
        else:
            return {'status': 'unknown_type', 'data': data}
    
    async def _process_payment_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """결제 요청 처리"""
        transaction_id = data['transaction_id']
        amount = data['amount']
        card_info = data['card_info']
        
        # 1. 로컬 캐시에서 카드 정보 확인
        card_status = await self._check_card_status(card_info)
        if not card_status['valid']:
            return {
                'transaction_id': transaction_id,
                'status': 'rejected',
                'reason': card_status['reason'],
                'local_action': 'display_error'
            }
        
        # 2. 사기 탐지 모델 실행
        fraud_score = await self._detect_fraud(data)
        if fraud_score > 0.8:
            return {
                'transaction_id': transaction_id,
                'status': 'rejected',
                'reason': 'fraud_detected',
                'fraud_score': fraud_score,
                'forward_to_cloud': True
            }
        
        # 3. 오프라인 모드 체크
        if not await self._check_network_connectivity():
            if amount <= 50000:  # 5만원 이하는 오프라인 승인
                offline_tx = {
                    'transaction_id': transaction_id,
                    'amount': amount,
                    'timestamp': time.time(),
                    'status': 'approved_offline'
                }
                self.offline_transaction_queue.append(offline_tx)
                
                return {
                    'transaction_id': transaction_id,
                    'status': 'approved',
                    'approval_code': self._generate_offline_approval_code(),
                    'local_action': 'print_receipt'
                }
            else:
                return {
                    'transaction_id': transaction_id,
                    'status': 'rejected',
                    'reason': 'offline_limit_exceeded',
                    'local_action': 'display_error'
                }
        
        # 4. 클라우드로 전송하여 최종 승인
        return {
            'transaction_id': transaction_id,
            'status': 'pending',
            'forward_to_cloud': True,
            'priority': 'high'
        }
    
    async def _detect_fraud(self, transaction_data: Dict[str, Any]) -> float:
        """로컬 사기 탐지 모델 실행"""
        features = self._extract_features(transaction_data)
        
        # 간단한 규칙 기반 사기 탐지
        risk_score = 0.0
        
        # 금액 기반 리스크
        amount = transaction_data['amount']
        if amount > 500000:  # 50만원 초과
            risk_score += 0.3
        elif amount > 1000000:  # 100만원 초과
            risk_score += 0.5
        
        # 시간 기반 리스크
        current_hour = time.localtime().tm_hour
        if current_hour < 6 or current_hour > 23:  # 새벽 시간대
            risk_score += 0.2
        
        # 반복 거래 패턴
        card_hash = self._hash_card_info(transaction_data['card_info'])
        recent_transactions = self._get_recent_transactions(card_hash)
        if len(recent_transactions) > 5:  # 최근 1시간 내 5회 초과
            risk_score += 0.4
        
        return min(risk_score, 1.0)
    
    async def can_handle_workload(self, workload_size: int) -> bool:
        """워크로드 처리 가능 여부 확인"""
        cpu_usage = await self._get_cpu_usage()
        memory_usage = await self._get_memory_usage()
        
        return (cpu_usage < self.node.max_cpu_usage and 
                memory_usage < self.node.max_memory_usage)
    
    def _load_fraud_model(self):
        """사기 탐지 모델 로드 (간소화된 버전)"""
        # 실제 환경에서는 TensorFlow Lite 또는 ONNX 모델 사용
        return {
            'model_version': '1.2.3',
            'last_updated': time.time(),
            'thresholds': {
                'low_risk': 0.3,
                'medium_risk': 0.6,
                'high_risk': 0.8
            }
        }

class SmartStoreProcessor(EdgeProcessor):
    """무인 매장 엣지 프로세서"""
    
    def __init__(self, node: EdgeNode):
        super().__init__(node)
        self.inventory_cache = {}
        self.customer_analytics = {}
        self.computer_vision_model = self._load_cv_model()
    
    async def process_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """스마트 스토어 데이터 처리"""
        data_type = data.get('type')
        
        if data_type == 'camera_frame':
            return await self._process_camera_frame(data)
        elif data_type == 'weight_sensor':
            return await self._process_weight_sensor(data)
        elif data_type == 'door_sensor':
            return await self._process_door_sensor(data)
        elif data_type == 'checkout_request':
            return await self._process_checkout_request(data)
        else:
            return {'status': 'unknown_type'}
    
    async def _process_camera_frame(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """카메라 프레임 처리"""
        frame_data = data['frame']
        camera_id = data['camera_id']
        timestamp = data['timestamp']
        
        # 객체 탐지 실행
        detected_objects = await self._detect_objects(frame_data)
        
        # 사람 수 카운팅
        person_count = len([obj for obj in detected_objects if obj['class'] == 'person'])
        
        # 제품 인식
        products = [obj for obj in detected_objects if obj['class'] in self.inventory_cache]
        
        result = {
            'camera_id': camera_id,
            'timestamp': timestamp,
            'person_count': person_count,
            'detected_products': products,
            'status': 'processed'
        }
        
        # 이상 상황 감지
        if person_count > 10:  # 매장 과밀
            result['alert'] = 'overcrowding'
            result['forward_to_cloud'] = True
        
        # 도난 의심 상황
        suspicious_behavior = await self._detect_suspicious_behavior(detected_objects)
        if suspicious_behavior:
            result['alert'] = 'suspicious_activity'
            result['forward_to_cloud'] = True
            result['priority'] = 'high'
        
        return result
    
    async def _process_checkout_request(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """체크아웃 요청 처리"""
        customer_id = data['customer_id']
        cart_items = data['cart_items']
        
        # 재고 확인
        inventory_check = await self._check_inventory(cart_items)
        if not inventory_check['available']:
            return {
                'customer_id': customer_id,
                'status': 'inventory_error',
                'unavailable_items': inventory_check['unavailable_items'],
                'local_action': 'display_inventory_error'
            }
        
        # 총액 계산
        total_amount = sum(item['price'] * item['quantity'] for item in cart_items)
        
        # 고객 신용도 확인 (간단한 로컬 캐시)
        customer_credit = self.customer_analytics.get(customer_id, {}).get('credit_score', 0.5)
        
        if total_amount > 100000 and customer_credit < 0.3:  # 고액 + 낮은 신용도
            return {
                'customer_id': customer_id,
                'status': 'approval_required',
                'total_amount': total_amount,
                'forward_to_cloud': True,
                'priority': 'medium'
            }
        
        # 자동 결제 승인
        return {
            'customer_id': customer_id,
            'status': 'approved',
            'total_amount': total_amount,
            'cart_items': cart_items,
            'local_action': 'process_payment'
        }
    
    async def _detect_objects(self, frame_data: bytes) -> List[Dict[str, Any]]:
        """객체 탐지 (모의 구현)"""
        # 실제로는 TensorFlow Lite 또는 OpenVINO 모델 사용
        import random
        
        # 모의 객체 탐지 결과
        objects = []
        for _ in range(random.randint(1, 5)):
            obj = {
                'class': random.choice(['person', 'product_a', 'product_b', 'cart']),
                'confidence': random.uniform(0.7, 0.95),
                'bbox': [
                    random.randint(0, 100),
                    random.randint(0, 100),
                    random.randint(100, 200),
                    random.randint(100, 200)
                ]
            }
            objects.append(obj)
        
        return objects
    
    def _load_cv_model(self):
        """컴퓨터 비전 모델 로드"""
        return {
            'model_type': 'yolo_v8_lite',
            'version': '2.1.0',
            'classes': ['person', 'cart', 'product_a', 'product_b', 'product_c'],
            'input_size': (416, 416),
            'confidence_threshold': 0.7
        }

# 엣지 오케스트레이터
class EdgeOrchestrator:
    """엣지 노드들을 관리하고 워크로드를 분산"""
    
    def __init__(self):
        self.edge_nodes: Dict[str, EdgeProcessor] = {}
        self.device_registry: Dict[str, IoTDevice] = {}
        self.load_balancer = LoadBalancer()
        
    async def register_node(self, node_id: str, processor: EdgeProcessor):
        """엣지 노드 등록"""
        self.edge_nodes[node_id] = processor
        await processor.start()
        print(f"Edge node {node_id} registered and started")
    
    async def register_device(self, device: IoTDevice):
        """IoT 디바이스 등록"""
        self.device_registry[device.device_id] = device
        print(f"IoT device {device.device_id} registered")
    
    async def route_data(self, device_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """데이터 라우팅"""
        device = self.device_registry.get(device_id)
        if not device:
            return {'error': 'Device not found'}
        
        # 적절한 엣지 노드 선택
        target_node = await self.load_balancer.select_node(
            self.edge_nodes, data, device.location
        )
        
        if not target_node:
            return {'error': 'No available edge node'}
        
        # 데이터 처리
        await target_node.processing_queue.put(data)
        return {'status': 'routed', 'node_id': target_node.node.node_id}
    
    async def health_check(self):
        """헬스 체크"""
        for node_id, processor in self.edge_nodes.items():
            if processor.is_active:
                cpu_usage = await processor._get_cpu_usage()
                memory_usage = await processor._get_memory_usage()
                
                print(f"Node {node_id}: CPU {cpu_usage}%, Memory {memory_usage}%")
            else:
                print(f"Node {node_id}: INACTIVE")

class LoadBalancer:
    """로드 밸런서"""
    
    async def select_node(
        self, 
        nodes: Dict[str, EdgeProcessor], 
        data: Dict[str, Any],
        device_location: str
    ) -> Optional[EdgeProcessor]:
        """최적의 엣지 노드 선택"""
        
        candidates = []
        for node_id, processor in nodes.items():
            if not processor.is_active:
                continue
                
            # 처리 능력 확인
            can_handle = await processor.can_handle_workload(1)
            if not can_handle:
                continue
                
            # 지리적 거리 계산 (간소화)
            distance = self._calculate_distance(processor.node.location, device_location)
            
            # 현재 워크로드 확인
            workload_score = processor.current_workload / 100.0
            
            # 종합 점수 계산 (거리가 가깝고 워크로드가 낮을수록 좋음)
            score = 1.0 / (1.0 + distance + workload_score)
            
            candidates.append((score, processor))
        
        if not candidates:
            return None
            
        # 점수가 가장 높은 노드 선택
        candidates.sort(key=lambda x: x[0], reverse=True)
        return candidates[0][1]
    
    def _calculate_distance(self, location1: str, location2: str) -> float:
        """지리적 거리 계산 (간소화)"""
        # 실제로는 GPS 좌표를 사용하여 정확한 거리 계산
        if location1 == location2:
            return 0.0
        else:
            return 1.0  # 단순화된 거리
```

## 실시간 스트리밍 처리

### 1. Apache Kafka를 활용한 이벤트 스트리밍
```python
# kafka_streaming.py - 실시간 스트리밍 처리
import asyncio
import json
from typing import Dict, List, Any, Callable
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError
import time
import logging
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor

@dataclass
class SensorReading:
    device_id: str
    sensor_type: str
    value: float
    timestamp: float
    location: str
    metadata: Dict[str, Any] = None

class IoTDataStreamer:
    """IoT 데이터 스트리머"""
    
    def __init__(self, kafka_config: Dict[str, str]):
        self.kafka_config = kafka_config
        self.producer = None
        self.consumer = None
        self.is_running = False
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    async def start_producer(self):
        """프로듀서 시작"""
        self.producer = KafkaProducer(
            bootstrap_servers=self.kafka_config['servers'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8'),
            acks='all',
            retries=3,
            batch_size=16384,
            linger_ms=10,
            buffer_memory=33554432
        )
        print("Kafka producer started")
    
    async def start_consumer(self, topics: List[str], group_id: str):
        """컨슈머 시작"""
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=self.kafka_config['servers'],
            group_id=group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            key_deserializer=lambda m: m.decode('utf-8'),
            auto_offset_reset='latest',
            enable_auto_commit=True,
            consumer_timeout_ms=1000
        )
        self.is_running = True
        print(f"Kafka consumer started for topics: {topics}")
    
    async def publish_sensor_data(self, reading: SensorReading, topic: str):
        """센서 데이터 발행"""
        if not self.producer:
            await self.start_producer()
        
        message = asdict(reading)
        
        try:
            future = self.producer.send(
                topic,
                key=reading.device_id,
                value=message,
                partition=self._get_partition_key(reading.device_id)
            )
            
            # 비동기적으로 결과 확인
            record_metadata = await asyncio.wrap_future(
                asyncio.ensure_future(
                    asyncio.get_event_loop().run_in_executor(
                        self.executor, future.get, 10
                    )
                )
            )
            
            return {
                'topic': record_metadata.topic,
                'partition': record_metadata.partition,
                'offset': record_metadata.offset
            }
            
        except KafkaError as e:
            logging.error(f"Failed to publish message: {e}")
            raise
    
    async def consume_messages(self, message_handler: Callable[[Dict], None]):
        """메시지 소비"""
        if not self.consumer:
            raise ValueError("Consumer not started")
        
        while self.is_running:
            try:
                message_pack = self.consumer.poll(timeout_ms=1000)
                
                for topic_partition, messages in message_pack.items():
                    for message in messages:
                        await asyncio.get_event_loop().run_in_executor(
                            self.executor,
                            message_handler,
                            {
                                'key': message.key,
                                'value': message.value,
                                'topic': message.topic,
                                'partition': message.partition,
                                'offset': message.offset,
                                'timestamp': message.timestamp
                            }
                        )
                        
            except Exception as e:
                logging.error(f"Error consuming messages: {e}")
                await asyncio.sleep(1)
    
    def _get_partition_key(self, device_id: str) -> int:
        """디바이스 ID 기반 파티션 키 계산"""
        return hash(device_id) % 3  # 3개 파티션 가정
    
    async def stop(self):
        """스트리머 중지"""
        self.is_running = False
        
        if self.producer:
            self.producer.flush()
            self.producer.close()
        
        if self.consumer:
            self.consumer.close()
        
        self.executor.shutdown(wait=True)
        print("IoT Data Streamer stopped")

class RealTimeAnalyzer:
    """실시간 데이터 분석기"""
    
    def __init__(self):
        self.window_size = 60  # 1분 윈도우
        self.data_windows: Dict[str, List[SensorReading]] = {}
        self.alert_thresholds = {
            'temperature': {'min': -10, 'max': 50},
            'humidity': {'min': 0, 'max': 100},
            'vibration': {'min': 0, 'max': 1000},
            'door_sensor': {'min': 0, 'max': 1}
        }
        
    async def analyze_sensor_data(self, reading: SensorReading) -> Dict[str, Any]:
        """센서 데이터 분석"""
        device_id = reading.device_id
        
        # 데이터 윈도우 관리
        if device_id not in self.data_windows:
            self.data_windows[device_id] = []
        
        # 현재 데이터 추가
        self.data_windows[device_id].append(reading)
        
        # 오래된 데이터 제거 (1분 윈도우)
        current_time = time.time()
        self.data_windows[device_id] = [
            r for r in self.data_windows[device_id] 
            if current_time - r.timestamp <= self.window_size
        ]
        
        # 분석 수행
        analysis_result = {
            'device_id': device_id,
            'sensor_type': reading.sensor_type,
            'current_value': reading.value,
            'timestamp': reading.timestamp,
            'anomaly_detected': False,
            'trend': 'stable',
            'alerts': []
        }
        
        # 임계값 체크
        threshold = self.alert_thresholds.get(reading.sensor_type)
        if threshold:
            if reading.value < threshold['min'] or reading.value > threshold['max']:
                analysis_result['anomaly_detected'] = True
                analysis_result['alerts'].append({
                    'type': 'threshold_violation',
                    'message': f"Value {reading.value} outside range [{threshold['min']}, {threshold['max']}]",
                    'severity': 'high'
                })
        
        # 트렌드 분석
        if len(self.data_windows[device_id]) >= 5:
            trend = self._analyze_trend(self.data_windows[device_id])
            analysis_result['trend'] = trend
            
            # 급격한 변화 감지
            if trend in ['rapidly_increasing', 'rapidly_decreasing']:
                analysis_result['alerts'].append({
                    'type': 'rapid_change',
                    'message': f"Detected {trend} trend",
                    'severity': 'medium'
                })
        
        # 이상 패턴 감지
        anomaly_score = await self._detect_anomaly_pattern(reading, self.data_windows[device_id])
        if anomaly_score > 0.8:
            analysis_result['anomaly_detected'] = True
            analysis_result['anomaly_score'] = anomaly_score
            analysis_result['alerts'].append({
                'type': 'pattern_anomaly',
                'message': f"Unusual pattern detected (score: {anomaly_score:.2f})",
                'severity': 'high'
            })
        
        return analysis_result
    
    def _analyze_trend(self, readings: List[SensorReading]) -> str:
        """트렌드 분석"""
        if len(readings) < 2:
            return 'insufficient_data'
        
        values = [r.value for r in readings[-10:]]  # 최근 10개 값
        
        # 선형 회귀로 트렌드 계산
        n = len(values)
        x = list(range(n))
        
        sum_x = sum(x)
        sum_y = sum(values)
        sum_xy = sum(x[i] * values[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        
        if slope > 1:
            return 'rapidly_increasing'
        elif slope > 0.1:
            return 'increasing'
        elif slope < -1:
            return 'rapidly_decreasing'
        elif slope < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    async def _detect_anomaly_pattern(self, current: SensorReading, history: List[SensorReading]) -> float:
        """이상 패턴 감지"""
        if len(history) < 10:
            return 0.0
        
        # 통계 기반 이상 탐지
        values = [r.value for r in history]
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        std_dev = variance ** 0.5
        
        # Z-score 계산
        if std_dev == 0:
            return 0.0
        
        z_score = abs((current.value - mean_val) / std_dev)
        
        # Z-score를 0-1 범위의 이상 점수로 변환
        anomaly_score = min(z_score / 3.0, 1.0)
        
        return anomaly_score

class AlertManager:
    """알림 관리자"""
    
    def __init__(self):
        self.alert_rules = {}
        self.notification_channels = {}
        self.alert_history = []
        
    def add_alert_rule(self, rule_id: str, condition: Callable[[Dict], bool], 
                      action: Callable[[Dict], None]):
        """알림 규칙 추가"""
        self.alert_rules[rule_id] = {
            'condition': condition,
            'action': action
        }
    
    def add_notification_channel(self, channel_id: str, channel_type: str, config: Dict):
        """알림 채널 추가"""
        self.notification_channels[channel_id] = {
            'type': channel_type,
            'config': config
        }
    
    async def process_analysis_result(self, result: Dict[str, Any]):
        """분석 결과 처리"""
        for rule_id, rule in self.alert_rules.items():
            if rule['condition'](result):
                await self._trigger_alert(rule_id, result, rule['action'])
    
    async def _trigger_alert(self, rule_id: str, result: Dict, action: Callable):
        """알림 트리거"""
        alert = {
            'rule_id': rule_id,
            'device_id': result['device_id'],
            'timestamp': time.time(),
            'message': f"Alert triggered for device {result['device_id']}",
            'severity': self._determine_severity(result),
            'data': result
        }
        
        self.alert_history.append(alert)
        
        # 액션 실행
        try:
            await asyncio.get_event_loop().run_in_executor(None, action, alert)
        except Exception as e:
            logging.error(f"Failed to execute alert action: {e}")
        
        # 알림 채널로 전송
        await self._send_notifications(alert)
    
    def _determine_severity(self, result: Dict) -> str:
        """심각도 결정"""
        if result.get('anomaly_detected') and result.get('anomaly_score', 0) > 0.9:
            return 'critical'
        elif any(alert['severity'] == 'high' for alert in result.get('alerts', [])):
            return 'high'
        elif any(alert['severity'] == 'medium' for alert in result.get('alerts', [])):
            return 'medium'
        else:
            return 'low'
    
    async def _send_notifications(self, alert: Dict):
        """알림 전송"""
        for channel_id, channel in self.notification_channels.items():
            try:
                if channel['type'] == 'webhook':
                    await self._send_webhook_notification(channel['config'], alert)
                elif channel['type'] == 'email':
                    await self._send_email_notification(channel['config'], alert)
                elif channel['type'] == 'sms':
                    await self._send_sms_notification(channel['config'], alert)
            except Exception as e:
                logging.error(f"Failed to send notification via {channel_id}: {e}")
    
    async def _send_webhook_notification(self, config: Dict, alert: Dict):
        """웹훅 알림 전송"""
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            await session.post(
                config['url'],
                json={
                    'alert': alert,
                    'timestamp': alert['timestamp']
                },
                headers=config.get('headers', {})
            )

# 사용 예제
async def main():
    # Kafka 설정
    kafka_config = {
        'servers': ['localhost:9092']
    }
    
    # 스트리머 초기화
    streamer = IoTDataStreamer(kafka_config)
    analyzer = RealTimeAnalyzer()
    alert_manager = AlertManager()
    
    # 알림 규칙 설정
    alert_manager.add_alert_rule(
        'temperature_alert',
        lambda result: result.get('anomaly_detected', False) and result['sensor_type'] == 'temperature',
        lambda alert: print(f"Temperature alert: {alert}")
    )
    
    # 알림 채널 설정
    alert_manager.add_notification_channel(
        'webhook_channel',
        'webhook',
        {'url': 'https://hooks.slack.com/services/...'}
    )
    
    # 메시지 처리 핸들러
    async def handle_sensor_message(message):
        reading = SensorReading(**message['value'])
        analysis_result = await analyzer.analyze_sensor_data(reading)
        await alert_manager.process_analysis_result(analysis_result)
        
        if analysis_result['anomaly_detected']:
            print(f"Anomaly detected: {analysis_result}")
    
    # 컨슈머 시작
    await streamer.start_consumer(['sensor-data'], 'edge-processing-group')
    
    # 메시지 처리 시작
    await streamer.consume_messages(handle_sensor_message)

if __name__ == "__main__":
    asyncio.run(main())
```

엣지 컴퓨팅과 IoT 실시간 데이터 처리는 지연시간을 최소화하고 대역폭을 효율적으로 사용하는 핵심 기술입니다. 적절한 아키텍처 설계와 실시간 분석을 통해 스마트 시티, 산업 IoT, 자율주행 등 다양한 분야에서 혁신적인 서비스를 구현할 수 있습니다.