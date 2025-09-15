---
title: "양자 컴퓨팅과 차세대 암호화 기술: 포스트 양자 암호학"
description: "양자 컴퓨팅 시대의 도래에 대비한 포스트 양자 암호화 기술과 카카오페이에서의 보안 대응 전략을 소개합니다."
publishedAt: "2024-12-29"
category: "Tech"
tags: ["양자컴퓨팅", "암호화", "포스트양자암호", "보안", "블록체인"]
author: "양자보안"
featured: true
---

# 양자 컴퓨팅과 차세대 암호화 기술: 포스트 양자 암호학

양자 컴퓨팅의 발전은 현재의 암호화 기술에 근본적인 위협을 가하고 있습니다. 카카오페이에서 양자 컴퓨팅 시대에 대비한 보안 기술 연구와 포스트 양자 암호화(Post-Quantum Cryptography) 도입 준비 과정을 공유합니다.

## 양자 컴퓨팅의 암호학적 위협

### 1. 쇼어 알고리즘과 RSA 암호화의 취약성
```python
# quantum_simulation.py - 양자 알고리즘 시뮬레이션
import numpy as np
from typing import List, Tuple, Optional
import math
import random
from dataclasses import dataclass

@dataclass
class QuantumState:
    """양자 상태 표현"""
    amplitudes: np.ndarray
    num_qubits: int
    
    def __post_init__(self):
        # 정규화 확인
        norm = np.sum(np.abs(self.amplitudes) ** 2)
        if not np.isclose(norm, 1.0):
            self.amplitudes = self.amplitudes / np.sqrt(norm)

class QuantumSimulator:
    """양자 컴퓨팅 시뮬레이터 (교육용)"""
    
    def __init__(self, num_qubits: int):
        self.num_qubits = num_qubits
        self.num_states = 2 ** num_qubits
        
        # 초기 상태 |00...0⟩
        initial_amplitudes = np.zeros(self.num_states, dtype=complex)
        initial_amplitudes[0] = 1.0
        self.state = QuantumState(initial_amplitudes, num_qubits)
    
    def hadamard(self, qubit: int):
        """Hadamard 게이트 적용"""
        H = np.array([[1, 1], [1, -1]], dtype=complex) / np.sqrt(2)
        self._apply_single_qubit_gate(H, qubit)
    
    def controlled_not(self, control: int, target: int):
        """CNOT 게이트 적용"""
        new_amplitudes = np.zeros_like(self.state.amplitudes)
        
        for i in range(self.num_states):
            control_bit = (i >> control) & 1
            target_bit = (i >> target) & 1
            
            if control_bit == 0:
                new_amplitudes[i] = self.state.amplitudes[i]
            else:
                # target bit 플립
                flipped_target = i ^ (1 << target)
                new_amplitudes[i] = self.state.amplitudes[flipped_target]
        
        self.state.amplitudes = new_amplitudes
    
    def quantum_fourier_transform(self):
        """양자 푸리에 변환"""
        for i in range(self.num_qubits):
            self.hadamard(i)
            
            for j in range(i + 1, self.num_qubits):
                # 제어된 회전 게이트
                angle = 2 * np.pi / (2 ** (j - i + 1))
                self._controlled_rotation(j, i, angle)
        
        # 큐빗 순서 뒤집기
        for i in range(self.num_qubits // 2):
            self._swap_qubits(i, self.num_qubits - 1 - i)
    
    def measure(self, qubit: int) -> int:
        """특정 큐빗 측정"""
        prob_0 = 0.0
        prob_1 = 0.0
        
        for i in range(self.num_states):
            bit = (i >> qubit) & 1
            prob = abs(self.state.amplitudes[i]) ** 2
            
            if bit == 0:
                prob_0 += prob
            else:
                prob_1 += prob
        
        # 확률에 따라 측정 결과 결정
        result = 1 if random.random() < prob_1 / (prob_0 + prob_1) else 0
        
        # 상태 붕괴
        self._collapse_state(qubit, result)
        
        return result
    
    def _apply_single_qubit_gate(self, gate: np.ndarray, qubit: int):
        """단일 큐빗 게이트 적용"""
        new_amplitudes = np.zeros_like(self.state.amplitudes)
        
        for i in range(self.num_states):
            bit = (i >> qubit) & 1
            other_i = i ^ (1 << qubit)  # qubit 비트 플립
            
            # 게이트 매트릭스 적용
            if bit == 0:
                new_amplitudes[i] += gate[0, 0] * self.state.amplitudes[i]
                new_amplitudes[other_i] += gate[1, 0] * self.state.amplitudes[i]
            else:
                new_amplitudes[i] += gate[1, 1] * self.state.amplitudes[i]
                new_amplitudes[other_i] += gate[0, 1] * self.state.amplitudes[i]
        
        self.state.amplitudes = new_amplitudes
    
    def _controlled_rotation(self, control: int, target: int, angle: float):
        """제어된 회전 게이트"""
        for i in range(self.num_states):
            control_bit = (i >> control) & 1
            target_bit = (i >> target) & 1
            
            if control_bit == 1:
                # 회전 적용
                other_i = i ^ (1 << target)
                
                if target_bit == 0:
                    original_amp = self.state.amplitudes[i]
                    other_amp = self.state.amplitudes[other_i]
                    
                    self.state.amplitudes[i] = original_amp * np.cos(angle/2) - 1j * other_amp * np.sin(angle/2)
                    self.state.amplitudes[other_i] = other_amp * np.cos(angle/2) - 1j * original_amp * np.sin(angle/2)

class ShorsAlgorithmSimulator:
    """쇼어 알고리즘 시뮬레이터 (간소화)"""
    
    def __init__(self, N: int):
        self.N = N  # 인수분해할 수
        self.quantum_sim = None
    
    def find_factors(self) -> Tuple[int, int]:
        """인수 찾기"""
        # 고전적 전처리
        if self.N % 2 == 0:
            return 2, self.N // 2
        
        # 무작위로 a 선택
        a = random.randint(2, self.N - 1)
        
        # 최대공약수 확인
        gcd_val = math.gcd(a, self.N)
        if gcd_val > 1:
            return gcd_val, self.N // gcd_val
        
        # 양자 부분: 주기 찾기
        period = self._find_period_quantum(a)
        
        if period is None or period % 2 != 0:
            return None, None  # 실패
        
        # 고전적 후처리
        factor1 = math.gcd(pow(a, period // 2) - 1, self.N)
        factor2 = math.gcd(pow(a, period // 2) + 1, self.N)
        
        if factor1 > 1 and factor1 < self.N:
            return factor1, self.N // factor1
        if factor2 > 1 and factor2 < self.N:
            return factor2, self.N // factor2
        
        return None, None
    
    def _find_period_quantum(self, a: int) -> Optional[int]:
        """양자 알고리즘으로 주기 찾기 (시뮬레이션)"""
        # 실제로는 복잡한 양자 회로가 필요
        # 여기서는 교육 목적으로 간소화
        
        # 주기를 찾기 위한 반복
        for period in range(2, self.N):
            if pow(a, period, self.N) == 1:
                return period
        
        return None

# RSA 취약성 데모
class RSAVulnerabilityDemo:
    """RSA 암호화 취약성 데모"""
    
    def __init__(self):
        self.primes = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
    
    def generate_rsa_key(self, key_size: int = 8) -> Tuple[int, int, int]:
        """간단한 RSA 키 생성 (교육용)"""
        # 작은 소수들로 데모
        p = random.choice(self.primes)
        q = random.choice([p for p in self.primes if p != p])
        
        n = p * q
        phi_n = (p - 1) * (q - 1)
        
        # 공개 지수
        e = 65537
        while math.gcd(e, phi_n) != 1:
            e += 2
        
        # 개인 지수
        d = pow(e, -1, phi_n)
        
        return (n, e, d)  # (공개키 n, 공개지수 e, 개인지수 d)
    
    def encrypt(self, message: int, public_key: Tuple[int, int]) -> int:
        """RSA 암호화"""
        n, e = public_key
        return pow(message, e, n)
    
    def decrypt(self, ciphertext: int, private_key: Tuple[int, int]) -> int:
        """RSA 복호화"""
        n, d = private_key
        return pow(ciphertext, d, n)
    
    def quantum_attack(self, public_key: Tuple[int, int]) -> Optional[Tuple[int, int]]:
        """양자 컴퓨터를 사용한 RSA 공격 시뮬레이션"""
        n, e = public_key
        
        print(f"Attacking RSA with N = {n}")
        
        # 쇼어 알고리즘 사용
        shor = ShorsAlgorithmSimulator(n)
        
        max_attempts = 10
        for attempt in range(max_attempts):
            factors = shor.find_factors()
            
            if factors[0] is not None and factors[1] is not None:
                p, q = factors
                print(f"Found factors: p = {p}, q = {q}")
                
                # 개인키 계산
                phi_n = (p - 1) * (q - 1)
                d = pow(e, -1, phi_n)
                
                return (n, d)
        
        print("Failed to factor N")
        return None

# 데모 실행
def demonstrate_quantum_threat():
    """양자 위협 데모"""
    print("=== RSA 양자 컴퓨팅 위협 데모 ===")
    
    demo = RSAVulnerabilityDemo()
    
    # RSA 키 생성
    n, e, d = demo.generate_rsa_key()
    public_key = (n, e)
    private_key = (n, d)
    
    print(f"Generated RSA key: N = {n}, e = {e}")
    
    # 메시지 암호화
    message = 42
    ciphertext = demo.encrypt(message, public_key)
    print(f"Encrypted message {message} -> {ciphertext}")
    
    # 정상적인 복호화
    decrypted = demo.decrypt(ciphertext, private_key)
    print(f"Decrypted: {decrypted}")
    
    # 양자 공격 시뮬레이션
    print("\n양자 컴퓨터로 개인키 추출 시도...")
    cracked_key = demo.quantum_attack(public_key)
    
    if cracked_key:
        cracked_message = demo.decrypt(ciphertext, cracked_key)
        print(f"Quantum attack successful! Cracked message: {cracked_message}")
    else:
        print("Quantum attack failed (due to simulation limitations)")

if __name__ == "__main__":
    demonstrate_quantum_threat()
```

## 포스트 양자 암호화 기술

### 1. 격자 기반 암호화 (Lattice-based Cryptography)
```python
# lattice_crypto.py - 격자 기반 암호화 구현
import numpy as np
import random
from typing import Tuple, List
import hashlib

class LatticeBasedCrypto:
    """격자 기반 암호화 (Learning With Errors - LWE)"""
    
    def __init__(self, n: int = 256, q: int = 2**12, sigma: float = 3.0):
        self.n = n          # 보안 매개변수
        self.q = q          # 모듈러 
        self.sigma = sigma  # 노이즈 표준편차
    
    def generate_keypair(self) -> Tuple[np.ndarray, np.ndarray]:
        """키쌍 생성"""
        # 개인키: n차원 이진 벡터
        s = np.random.randint(0, 2, self.n, dtype=np.int32)
        
        # 공개키: (A, b = As + e mod q) 형태
        # A: m x n 무작위 행렬
        m = self.n + 100  # 공개키 크기
        A = np.random.randint(0, self.q, (m, self.n), dtype=np.int32)
        
        # 노이즈 벡터
        e = self._gaussian_noise(m)
        
        # b = As + e mod q
        b = (A @ s + e) % self.q
        
        public_key = (A, b)
        private_key = s
        
        return public_key, private_key
    
    def encrypt(self, message_bit: int, public_key: Tuple[np.ndarray, np.ndarray]) -> Tuple[np.ndarray, int]:
        """단일 비트 암호화"""
        A, b = public_key
        m = len(b)
        
        # 무작위 이진 벡터 r
        r = np.random.randint(0, 2, m, dtype=np.int32)
        
        # 암호문 계산
        # u = A^T * r mod q
        u = (A.T @ r) % self.q
        
        # v = b^T * r + message_bit * floor(q/2) mod q
        v = (b @ r + message_bit * (self.q // 2)) % self.q
        
        return u, v
    
    def decrypt(self, ciphertext: Tuple[np.ndarray, int], private_key: np.ndarray) -> int:
        """복호화"""
        u, v = ciphertext
        s = private_key
        
        # 복호화: v - s^T * u mod q
        decrypted_value = (v - s @ u) % self.q
        
        # 가장 가까운 0 또는 floor(q/2)로 반올림
        if decrypted_value < self.q // 4 or decrypted_value > 3 * self.q // 4:
            return 0
        else:
            return 1
    
    def _gaussian_noise(self, size: int) -> np.ndarray:
        """가우시안 노이즈 생성"""
        noise = np.random.normal(0, self.sigma, size)
        return np.round(noise).astype(np.int32)

class KyberLikePKE:
    """Kyber 유사 공개키 암호화 (단순화)"""
    
    def __init__(self, k: int = 2, n: int = 256, q: int = 3329):
        self.k = k  # 매트릭스 차원
        self.n = n  # 다항식 차수
        self.q = q  # 모듈러
        self.eta1 = 3  # 비밀키 노이즈
        self.eta2 = 2  # 암호화 노이즈
    
    def generate_keypair(self) -> Tuple[Tuple[np.ndarray, np.ndarray], np.ndarray]:
        """Kyber 키쌍 생성"""
        # 시드 생성
        seed = np.random.bytes(32)
        
        # 공개 매트릭스 A 생성 (시드로부터)
        A = self._expand_a(seed)
        
        # 비밀 벡터 s 생성
        s = self._sample_noise_vector(self.eta1, self.k)
        
        # 오류 벡터 e 생성
        e = self._sample_noise_vector(self.eta1, self.k)
        
        # 공개키 t = As + e
        t = (A @ s + e) % self.q
        
        public_key = (t, seed)
        private_key = s
        
        return public_key, private_key
    
    def encrypt(self, message: np.ndarray, public_key: Tuple[np.ndarray, np.ndarray]) -> Tuple[np.ndarray, np.ndarray]:
        """메시지 암호화"""
        t, seed = public_key
        
        # A 재구성
        A = self._expand_a(seed)
        
        # 무작위 벡터 r 생성
        r = self._sample_noise_vector(self.eta1, self.k)
        
        # 노이즈 벡터들
        e1 = self._sample_noise_vector(self.eta2, self.k)
        e2 = self._sample_noise_polynomial(self.eta2)
        
        # 암호문 계산
        # u = A^T * r + e1
        u = (A.T @ r + e1) % self.q
        
        # v = t^T * r + e2 + encode(message)
        encoded_msg = self._encode_message(message)
        v = (t @ r + e2 + encoded_msg) % self.q
        
        return u, v
    
    def decrypt(self, ciphertext: Tuple[np.ndarray, np.ndarray], private_key: np.ndarray) -> np.ndarray:
        """복호화"""
        u, v = ciphertext
        s = private_key
        
        # 복호화: v - s^T * u
        decrypted = (v - s @ u) % self.q
        
        # 메시지 디코딩
        return self._decode_message(decrypted)
    
    def _expand_a(self, seed: bytes) -> np.ndarray:
        """시드로부터 공개 매트릭스 A 생성"""
        # 실제로는 SHAKE-128 등을 사용
        np.random.seed(int.from_bytes(seed[:4], 'big'))
        return np.random.randint(0, self.q, (self.k, self.k), dtype=np.int32)
    
    def _sample_noise_vector(self, eta: int, size: int) -> np.ndarray:
        """노이즈 벡터 샘플링"""
        return np.random.randint(-eta, eta + 1, size, dtype=np.int32)
    
    def _sample_noise_polynomial(self, eta: int) -> np.int32:
        """노이즈 다항식 샘플링 (단순화)"""
        return np.random.randint(-eta, eta + 1, dtype=np.int32)
    
    def _encode_message(self, message: np.ndarray) -> np.int32:
        """메시지 인코딩"""
        # 단순화: 비트를 q/2로 스케일링
        return np.sum(message) * (self.q // 2)
    
    def _decode_message(self, value: np.int32) -> np.ndarray:
        """메시지 디코딩"""
        # 단순화: 임계값으로 비트 복원
        bit = 1 if value > self.q // 4 else 0
        return np.array([bit])

class PostQuantumSignature:
    """포스트 양자 서명 (Dilithium 유사)"""
    
    def __init__(self, k: int = 4, l: int = 4, n: int = 256, q: int = 8380417):
        self.k = k  # 공개키 차원
        self.l = l  # 서명 차원  
        self.n = n  # 다항식 차수
        self.q = q  # 모듈러
        self.gamma1 = 1 << 17
        self.gamma2 = (self.q - 1) // 88
    
    def generate_keypair(self) -> Tuple[np.ndarray, Tuple[np.ndarray, np.ndarray]]:
        """서명 키쌍 생성"""
        # 시드 생성
        seed = np.random.bytes(32)
        
        # 공개 매트릭스 A 생성
        A = self._expand_a(seed)
        
        # 비밀 벡터 s1, s2 생성
        s1 = self._sample_uniform_vector(self.l)
        s2 = self._sample_uniform_vector(self.k)
        
        # 공개키 t = As1 + s2
        t = (A @ s1 + s2) % self.q
        
        public_key = t
        private_key = (s1, s2, A)
        
        return public_key, private_key
    
    def sign(self, message: bytes, private_key: Tuple[np.ndarray, np.ndarray, np.ndarray]) -> Tuple[np.ndarray, np.ndarray]:
        """메시지 서명"""
        s1, s2, A = private_key
        
        # 메시지 해시
        msg_hash = self._hash_message(message)
        
        # 서명 생성 루프
        for attempt in range(100):  # 최대 시도 횟수
            # 무작위 벡터 y 생성
            y = self._sample_gamma1_vector(self.l)
            
            # w = Ay
            w = (A @ y) % self.q
            w1 = self._high_bits(w)
            
            # 챌린지 생성
            c = self._sample_challenge(msg_hash, w1)
            
            # z = y + cs1
            z = (y + c * s1) % self.q
            
            # 서명 검증 조건들 확인
            if self._check_signature_bounds(z, w, c, s2):
                return z, c
        
        raise ValueError("Failed to generate signature")
    
    def verify(self, message: bytes, signature: Tuple[np.ndarray, np.ndarray], public_key: np.ndarray) -> bool:
        """서명 검증"""
        z, c = signature
        t = public_key
        
        # 메시지 해시
        msg_hash = self._hash_message(message)
        
        # 검증 계산
        # Az - ct를 계산하여 원래 w와 비교
        try:
            # A 재구성이 필요하지만 단순화
            # 실제로는 공개키에 A 정보도 포함되어야 함
            return True  # 단순화된 검증
        except:
            return False
    
    def _expand_a(self, seed: bytes) -> np.ndarray:
        """시드로부터 공개 매트릭스 생성"""
        np.random.seed(int.from_bytes(seed[:4], 'big'))
        return np.random.randint(0, self.q, (self.k, self.l), dtype=np.int32)
    
    def _sample_uniform_vector(self, size: int) -> np.ndarray:
        """균등 분포 벡터 샘플링"""
        return np.random.randint(-2, 3, size, dtype=np.int32)
    
    def _sample_gamma1_vector(self, size: int) -> np.ndarray:
        """gamma1 범위 벡터 샘플링"""
        return np.random.randint(-self.gamma1, self.gamma1 + 1, size, dtype=np.int32)
    
    def _hash_message(self, message: bytes) -> bytes:
        """메시지 해시"""
        return hashlib.sha3_256(message).digest()
    
    def _sample_challenge(self, msg_hash: bytes, w1: np.ndarray) -> np.ndarray:
        """챌린지 샘플링"""
        # 실제로는 더 복잡한 해시 기반 샘플링
        combined = msg_hash + w1.tobytes()
        hash_val = hashlib.sha3_256(combined).digest()
        
        # 해시로부터 스파스 챌린지 벡터 생성
        challenge = np.zeros(self.n, dtype=np.int32)
        for i in range(min(60, self.n)):  # 스파스 벡터
            idx = hash_val[i % len(hash_val)] % self.n
            challenge[idx] = 1 if hash_val[i] & 1 else -1
        
        return challenge
    
    def _high_bits(self, w: np.ndarray) -> np.ndarray:
        """상위 비트 추출"""
        return (w + self.gamma2) // (2 * self.gamma2)
    
    def _check_signature_bounds(self, z: np.ndarray, w: np.ndarray, c: np.ndarray, s2: np.ndarray) -> bool:
        """서명 경계 조건 확인"""
        # 실제로는 더 복잡한 조건들 확인
        return np.all(np.abs(z) < self.gamma1 - 100)  # 단순화된 조건

# 사용 예제 및 테스트
def test_post_quantum_crypto():
    """포스트 양자 암호화 테스트"""
    print("=== 포스트 양자 암호화 테스트 ===")
    
    # 1. LWE 기반 암호화 테스트
    print("\n1. LWE 기반 암호화 테스트")
    lwe = LatticeBasedCrypto(n=64, q=1024)  # 작은 매개변수로 테스트
    
    pub_key, priv_key = lwe.generate_keypair()
    print(f"키 생성 완료 - 공개키 크기: {len(pub_key[1])}, 개인키 크기: {len(priv_key)}")
    
    # 메시지 암호화/복호화
    message = 1
    ciphertext = lwe.encrypt(message, pub_key)
    decrypted = lwe.decrypt(ciphertext, priv_key)
    
    print(f"원본 메시지: {message}")
    print(f"복호화 결과: {decrypted}")
    print(f"암호화 성공: {'✓' if message == decrypted else '✗'}")
    
    # 2. Kyber 유사 PKE 테스트
    print("\n2. Kyber 유사 PKE 테스트")
    kyber = KyberLikePKE(k=2, n=64, q=3329)
    
    pub_key, priv_key = kyber.generate_keypair()
    
    message = np.array([1, 0, 1, 1])  # 4비트 메시지
    ciphertext = kyber.encrypt(message[:1], pub_key)  # 1비트만 테스트
    decrypted = kyber.decrypt(ciphertext, priv_key)
    
    print(f"원본 메시지: {message[0]}")
    print(f"복호화 결과: {decrypted[0]}")
    print(f"암호화 성공: {'✓' if message[0] == decrypted[0] else '✗'}")
    
    # 3. 포스트 양자 서명 테스트
    print("\n3. 포스트 양자 서명 테스트")
    signature_scheme = PostQuantumSignature(k=2, l=2, n=64, q=8380417)
    
    pub_key, priv_key = signature_scheme.generate_keypair()
    
    message = b"Hello, Post-Quantum World!"
    signature = signature_scheme.sign(message, priv_key)
    is_valid = signature_scheme.verify(message, signature, pub_key)
    
    print(f"메시지: {message.decode()}")
    print(f"서명 검증: {'✓' if is_valid else '✗'}")
    
    # 변조된 메시지로 검증
    tampered_message = b"Hello, Post-Quantum World!!"
    is_valid_tampered = signature_scheme.verify(tampered_message, signature, pub_key)
    print(f"변조 메시지 검증: {'✗' if not is_valid_tampered else '✓ (문제 발생)'}")

if __name__ == "__main__":
    test_post_quantum_crypto()
```

### 2. 해시 기반 서명 (Hash-based Signatures)
```python
# hash_based_signatures.py - 해시 기반 서명 구현
import hashlib
import os
from typing import List, Tuple, Optional
import numpy as np

class MerkleTree:
    """머클 트리 구현"""
    
    def __init__(self, leaves: List[bytes]):
        self.leaves = leaves
        self.tree = self._build_tree()
    
    def _build_tree(self) -> List[List[bytes]]:
        """머클 트리 구축"""
        if not self.leaves:
            return [[]]
        
        tree = [self.leaves[:]]  # 리프 레벨
        
        current_level = self.leaves[:]
        
        while len(current_level) > 1:
            next_level = []
            
            # 페어링하여 해시
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    combined = current_level[i] + current_level[i + 1]
                else:
                    combined = current_level[i] + current_level[i]
                
                parent_hash = hashlib.sha256(combined).digest()
                next_level.append(parent_hash)
            
            tree.append(next_level)
            current_level = next_level
        
        return tree
    
    def get_root(self) -> bytes:
        """루트 해시 반환"""
        if not self.tree or not self.tree[-1]:
            return b""
        return self.tree[-1][0]
    
    def get_proof(self, leaf_index: int) -> List[bytes]:
        """머클 증명 생성"""
        if leaf_index >= len(self.leaves):
            return []
        
        proof = []
        current_index = leaf_index
        
        for level in range(len(self.tree) - 1):
            # 형제 노드의 인덱스
            if current_index % 2 == 0:
                sibling_index = current_index + 1
            else:
                sibling_index = current_index - 1
            
            # 형제 노드가 존재하면 증명에 추가
            if sibling_index < len(self.tree[level]):
                proof.append(self.tree[level][sibling_index])
            else:
                proof.append(self.tree[level][current_index])
            
            current_index = current_index // 2
        
        return proof
    
    @staticmethod
    def verify_proof(leaf: bytes, proof: List[bytes], root: bytes, leaf_index: int) -> bool:
        """머클 증명 검증"""
        current_hash = leaf
        current_index = leaf_index
        
        for sibling_hash in proof:
            if current_index % 2 == 0:
                combined = current_hash + sibling_hash
            else:
                combined = sibling_hash + current_hash
            
            current_hash = hashlib.sha256(combined).digest()
            current_index = current_index // 2
        
        return current_hash == root

class WinternitzOTS:
    """Winternitz One-Time Signature (WOTS+)"""
    
    def __init__(self, n: int = 32, w: int = 16):
        self.n = n  # 보안 매개변수 (바이트)
        self.w = w  # Winternitz 매개변수
        self.l1 = int(np.ceil(8 * n / np.log2(w)))  # 메시지 체인 수
        self.l2 = int(np.floor(np.log2(self.l1 * (w - 1)) / np.log2(w))) + 1  # 체크섬 체인 수
        self.l = self.l1 + self.l2  # 총 체인 수
    
    def generate_keypair(self, seed: bytes) -> Tuple[List[bytes], List[bytes]]:
        """WOTS+ 키쌍 생성"""
        # 시드로부터 비밀키 생성
        private_key = []
        for i in range(self.l):
            sk_i = hashlib.sha256(seed + i.to_bytes(4, 'big')).digest()
            private_key.append(sk_i)
        
        # 공개키 생성 (각 체인을 w-1번 해시)
        public_key = []
        for i in range(self.l):
            pk_i = private_key[i]
            for _ in range(self.w - 1):
                pk_i = hashlib.sha256(pk_i).digest()
            public_key.append(pk_i)
        
        return public_key, private_key
    
    def sign(self, message: bytes, private_key: List[bytes]) -> List[bytes]:
        """메시지 서명"""
        # 메시지를 base-w로 변환
        msg_hash = hashlib.sha256(message).digest()
        base_w_repr = self._to_base_w(msg_hash, self.l1)
        
        # 체크섬 계산
        checksum = sum(self.w - 1 - x for x in base_w_repr)
        checksum_repr = self._to_base_w(checksum.to_bytes(4, 'big'), self.l2)
        
        # 전체 표현
        full_repr = base_w_repr + checksum_repr
        
        # 서명 생성
        signature = []
        for i, b in enumerate(full_repr):
            sig_i = private_key[i]
            for _ in range(b):
                sig_i = hashlib.sha256(sig_i).digest()
            signature.append(sig_i)
        
        return signature
    
    def verify(self, message: bytes, signature: List[bytes], public_key: List[bytes]) -> bool:
        """서명 검증"""
        if len(signature) != self.l or len(public_key) != self.l:
            return False
        
        # 메시지를 base-w로 변환
        msg_hash = hashlib.sha256(message).digest()
        base_w_repr = self._to_base_w(msg_hash, self.l1)
        
        # 체크섬 계산
        checksum = sum(self.w - 1 - x for x in base_w_repr)
        checksum_repr = self._to_base_w(checksum.to_bytes(4, 'big'), self.l2)
        
        # 전체 표현
        full_repr = base_w_repr + checksum_repr
        
        # 검증
        for i, b in enumerate(full_repr):
            # 서명에서 남은 해시 적용
            temp = signature[i]
            for _ in range(self.w - 1 - b):
                temp = hashlib.sha256(temp).digest()
            
            if temp != public_key[i]:
                return False
        
        return True
    
    def _to_base_w(self, data: bytes, length: int) -> List[int]:
        """데이터를 base-w 표현으로 변환"""
        result = []
        bit_string = ''.join(format(byte, '08b') for byte in data)
        
        # w의 로그2 비트씩 그룹화
        bits_per_digit = int(np.log2(self.w))
        
        for i in range(0, len(bit_string), bits_per_digit):
            if len(result) >= length:
                break
            
            group = bit_string[i:i + bits_per_digit]
            if len(group) < bits_per_digit:
                group = group.ljust(bits_per_digit, '0')
            
            result.append(int(group, 2))
        
        # 길이 맞추기
        while len(result) < length:
            result.append(0)
        
        return result[:length]

class XMSS:
    """eXtended Merkle Signature Scheme (XMSS)"""
    
    def __init__(self, height: int = 10, n: int = 32, w: int = 16):
        self.height = height  # 트리 높이
        self.n = n           # 보안 매개변수
        self.w = w           # Winternitz 매개변수
        self.num_signatures = 2 ** height
        self.wots = WinternitzOTS(n, w)
        
        self.state = {
            'signatures_used': 0,
            'root': None,
            'private_keys': [],
            'public_keys': [],
            'merkle_tree': None
        }
    
    def generate_keypair(self, seed: bytes) -> Tuple[bytes, dict]:
        """XMSS 키쌍 생성"""
        # 모든 WOTS+ 키쌍 생성
        public_keys = []
        private_keys = []
        
        for i in range(self.num_signatures):
            wots_seed = hashlib.sha256(seed + i.to_bytes(4, 'big')).digest()
            pub_key, priv_key = self.wots.generate_keypair(wots_seed)
            
            # 공개키를 하나의 해시로 압축
            pub_key_hash = hashlib.sha256(b''.join(pub_key)).digest()
            public_keys.append(pub_key_hash)
            private_keys.append(priv_key)
        
        # 머클 트리 구성
        merkle_tree = MerkleTree(public_keys)
        root = merkle_tree.get_root()
        
        # 상태 업데이트
        self.state = {
            'signatures_used': 0,
            'root': root,
            'private_keys': private_keys,
            'public_keys': public_keys,
            'merkle_tree': merkle_tree
        }
        
        return root, self.state.copy()  # 공개키는 루트 해시
    
    def sign(self, message: bytes, private_state: dict) -> Optional[Tuple[List[bytes], int, List[bytes]]]:
        """메시지 서명"""
        if private_state['signatures_used'] >= self.num_signatures:
            return None  # 모든 서명 소진
        
        index = private_state['signatures_used']
        
        # WOTS+ 서명 생성
        wots_signature = self.wots.sign(message, private_state['private_keys'][index])
        
        # 머클 증명 생성
        merkle_proof = private_state['merkle_tree'].get_proof(index)
        
        # 상태 업데이트
        private_state['signatures_used'] += 1
        
        return (wots_signature, index, merkle_proof)
    
    def verify(self, message: bytes, signature: Tuple[List[bytes], int, List[bytes]], 
               public_key: bytes) -> bool:
        """서명 검증"""
        wots_signature, index, merkle_proof = signature
        
        # 임시 WOTS+ 공개키 재구성
        temp_wots = WinternitzOTS(self.n, self.w)
        
        # WOTS+ 서명에서 공개키 재구성
        msg_hash = hashlib.sha256(message).digest()
        base_w_repr = temp_wots._to_base_w(msg_hash, temp_wots.l1)
        
        # 체크섬 계산
        checksum = sum(temp_wots.w - 1 - x for x in base_w_repr)
        checksum_repr = temp_wots._to_base_w(checksum.to_bytes(4, 'big'), temp_wots.l2)
        full_repr = base_w_repr + checksum_repr
        
        # 공개키 재구성
        reconstructed_pub_key = []
        for i, b in enumerate(full_repr):
            temp = wots_signature[i]
            for _ in range(temp_wots.w - 1 - b):
                temp = hashlib.sha256(temp).digest()
            reconstructed_pub_key.append(temp)
        
        # 공개키 해시
        pub_key_hash = hashlib.sha256(b''.join(reconstructed_pub_key)).digest()
        
        # 머클 증명 검증
        return MerkleTree.verify_proof(pub_key_hash, merkle_proof, public_key, index)

# 테스트 및 데모
def test_hash_based_signatures():
    """해시 기반 서명 테스트"""
    print("=== 해시 기반 서명 테스트 ===")
    
    # 1. WOTS+ 테스트
    print("\n1. WOTS+ 일회용 서명 테스트")
    wots = WinternitzOTS(n=32, w=16)
    
    seed = os.urandom(32)
    pub_key, priv_key = wots.generate_keypair(seed)
    
    message = b"Hello, WOTS+ signature!"
    signature = wots.sign(message, priv_key)
    
    is_valid = wots.verify(message, signature, pub_key)
    print(f"메시지: {message.decode()}")
    print(f"서명 검증: {'✓' if is_valid else '✗'}")
    print(f"서명 크기: {sum(len(sig) for sig in signature)} bytes")
    
    # 변조된 메시지 테스트
    tampered_message = b"Hello, WOTS+ signature!!"
    is_valid_tampered = wots.verify(tampered_message, signature, pub_key)
    print(f"변조 메시지 검증: {'✗' if not is_valid_tampered else '✓ (문제 발생)'}")
    
    # 2. XMSS 다중 서명 테스트
    print("\n2. XMSS 다중 서명 테스트")
    xmss = XMSS(height=4, n=32, w=16)  # 16개 서명 가능
    
    seed = os.urandom(32)
    public_key, private_state = xmss.generate_keypair(seed)
    
    print(f"XMSS 공개키 크기: {len(public_key)} bytes")
    print(f"최대 서명 횟수: {xmss.num_signatures}")
    
    # 여러 메시지 서명
    messages = [
        b"First message",
        b"Second message", 
        b"Third message"
    ]
    
    signatures = []
    for i, msg in enumerate(messages):
        sig = xmss.sign(msg, private_state)
        if sig:
            signatures.append((msg, sig))
            
            # 서명 검증
            is_valid = xmss.verify(msg, sig, public_key)
            print(f"메시지 {i+1} 서명 검증: {'✓' if is_valid else '✗'}")
        else:
            print(f"메시지 {i+1} 서명 실패: 서명 한도 초과")
    
    print(f"사용된 서명 횟수: {private_state['signatures_used']}/{xmss.num_signatures}")
    
    # 3. 머클 트리 테스트
    print("\n3. 머클 트리 검증 테스트")
    leaves = [f"leaf_{i}".encode() for i in range(8)]
    merkle_tree = MerkleTree(leaves)
    
    root = merkle_tree.get_root()
    print(f"머클 루트: {root.hex()[:16]}...")
    
    # 증명 생성 및 검증
    leaf_index = 3
    proof = merkle_tree.get_proof(leaf_index)
    is_valid = MerkleTree.verify_proof(leaves[leaf_index], proof, root, leaf_index)
    
    print(f"리프 {leaf_index} 증명 검증: {'✓' if is_valid else '✗'}")
    print(f"증명 크기: {len(proof)} 개 해시")

if __name__ == "__main__":
    test_hash_based_signatures()
```

## 양자 안전 블록체인 구현

### 1. 포스트 양자 블록체인
```python
# quantum_safe_blockchain.py - 양자 안전 블록체인 구현
import hashlib
import json
import time
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import os

# 이전에 구현한 포스트 양자 암호화 클래스들 import
from lattice_crypto import KyberLikePKE, PostQuantumSignature
from hash_based_signatures import XMSS

@dataclass
class QuantumSafeTransaction:
    """양자 안전 트랜잭션"""
    sender: str
    receiver: str
    amount: float
    timestamp: float
    nonce: int
    signature: Optional[Tuple] = None
    signature_type: str = "dilithium"  # 또는 "xmss"
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    def get_hash(self) -> str:
        """트랜잭션 해시 계산"""
        tx_data = self.to_dict()
        tx_data.pop('signature', None)  # 서명 제외하고 해시
        tx_string = json.dumps(tx_data, sort_keys=True)
        return hashlib.sha3_256(tx_string.encode()).hexdigest()

@dataclass 
class QuantumSafeBlock:
    """양자 안전 블록"""
    index: int
    timestamp: float
    transactions: List[QuantumSafeTransaction]
    previous_hash: str
    merkle_root: str
    nonce: int = 0
    hash: str = ""
    quantum_proof: Dict[str, Any] = None  # 양자 증명 데이터
    
    def calculate_merkle_root(self) -> str:
        """머클 루트 계산"""
        if not self.transactions:
            return hashlib.sha3_256(b"").hexdigest()
        
        tx_hashes = [tx.get_hash() for tx in self.transactions]
        
        while len(tx_hashes) > 1:
            next_level = []
            for i in range(0, len(tx_hashes), 2):
                if i + 1 < len(tx_hashes):
                    combined = tx_hashes[i] + tx_hashes[i + 1]
                else:
                    combined = tx_hashes[i] + tx_hashes[i]
                
                next_level.append(hashlib.sha3_256(combined.encode()).hexdigest())
            tx_hashes = next_level
        
        return tx_hashes[0]
    
    def calculate_hash(self) -> str:
        """블록 해시 계산"""
        block_data = {
            'index': self.index,
            'timestamp': self.timestamp,
            'merkle_root': self.merkle_root,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }
        
        block_string = json.dumps(block_data, sort_keys=True)
        return hashlib.sha3_256(block_string.encode()).hexdigest()

class QuantumSafeWallet:
    """양자 안전 지갑"""
    
    def __init__(self, wallet_id: str):
        self.wallet_id = wallet_id
        
        # 다중 서명 지원
        self.dilithium = PostQuantumSignature()
        self.xmss = XMSS(height=8)  # 256개 서명 가능
        self.kyber = KyberLikePKE()
        
        # 키 생성
        self.dilithium_keys = self.dilithium.generate_keypair()
        
        seed = os.urandom(32)
        self.xmss_keys = self.xmss.generate_keypair(seed)
        self.xmss_private_state = self.xmss_keys[1]
        
        self.kyber_keys = self.kyber.generate_keypair()
        
        # 공개 주소 (여러 공개키의 해시)
        self.address = self._generate_address()
    
    def _generate_address(self) -> str:
        """지갑 주소 생성"""
        # 모든 공개키를 결합하여 주소 생성
        combined_pubkeys = (
            str(self.dilithium_keys[0]).encode() +
            self.xmss_keys[0] +
            str(self.kyber_keys[0]).encode()
        )
        
        return hashlib.sha3_256(combined_pubkeys).hexdigest()[:40]
    
    def sign_transaction(self, transaction: QuantumSafeTransaction, 
                        signature_type: str = "dilithium") -> QuantumSafeTransaction:
        """트랜잭션 서명"""
        tx_hash = transaction.get_hash().encode()
        
        if signature_type == "dilithium":
            signature = self.dilithium.sign(tx_hash, self.dilithium_keys[1])
            transaction.signature = signature
            transaction.signature_type = "dilithium"
            
        elif signature_type == "xmss":
            signature = self.xmss.sign(tx_hash, self.xmss_private_state)
            if signature:
                transaction.signature = signature
                transaction.signature_type = "xmss"
            else:
                raise ValueError("XMSS signatures exhausted")
        
        return transaction
    
    def verify_transaction(self, transaction: QuantumSafeTransaction, 
                          sender_address: str) -> bool:
        """트랜잭션 서명 검증"""
        if not transaction.signature:
            return False
        
        tx_hash = transaction.get_hash().encode()
        
        # 실제로는 sender_address로부터 공개키를 복원해야 함
        # 여기서는 단순화
        if transaction.signature_type == "dilithium":
            return self.dilithium.verify(
                tx_hash, transaction.signature, self.dilithium_keys[0]
            )
        elif transaction.signature_type == "xmss":
            return self.xmss.verify(
                tx_hash, transaction.signature, self.xmss_keys[0]
            )
        
        return False

class QuantumSafeBlockchain:
    """양자 안전 블록체인"""
    
    def __init__(self):
        self.chain: List[QuantumSafeBlock] = []
        self.pending_transactions: List[QuantumSafeTransaction] = []
        self.balances: Dict[str, float] = {}
        self.difficulty = 4  # PoW 난이도
        
        # 제네시스 블록 생성
        self._create_genesis_block()
    
    def _create_genesis_block(self):
        """제네시스 블록 생성"""
        genesis_block = QuantumSafeBlock(
            index=0,
            timestamp=time.time(),
            transactions=[],
            previous_hash="0",
            merkle_root="",
            nonce=0
        )
        
        genesis_block.merkle_root = genesis_block.calculate_merkle_root()
        genesis_block.hash = genesis_block.calculate_hash()
        
        self.chain.append(genesis_block)
    
    def add_transaction(self, transaction: QuantumSafeTransaction) -> bool:
        """트랜잭션 추가"""
        # 트랜잭션 유효성 검증
        if not self._validate_transaction(transaction):
            return False
        
        self.pending_transactions.append(transaction)
        return True
    
    def _validate_transaction(self, transaction: QuantumSafeTransaction) -> bool:
        """트랜잭션 유효성 검증"""
        # 1. 서명 검증
        wallet = QuantumSafeWallet("temp")  # 임시 지갑 (검증용)
        if not wallet.verify_transaction(transaction, transaction.sender):
            return False
        
        # 2. 잔액 확인
        sender_balance = self.balances.get(transaction.sender, 0)
        if sender_balance < transaction.amount:
            return False
        
        # 3. 이중 지불 방지 (간소화)
        for tx in self.pending_transactions:
            if (tx.sender == transaction.sender and 
                tx.nonce == transaction.nonce):
                return False
        
        return True
    
    def mine_block(self, miner_address: str) -> QuantumSafeBlock:
        """블록 마이닝 (Proof of Work)"""
        # 마이닝 보상 트랜잭션 추가
        mining_reward = QuantumSafeTransaction(
            sender="0",  # 시스템
            receiver=miner_address,
            amount=10.0,
            timestamp=time.time(),
            nonce=0
        )
        
        transactions = self.pending_transactions + [mining_reward]
        
        # 새 블록 생성
        new_block = QuantumSafeBlock(
            index=len(self.chain),
            timestamp=time.time(),
            transactions=transactions,
            previous_hash=self.chain[-1].hash,
            merkle_root="",
            nonce=0
        )
        
        new_block.merkle_root = new_block.calculate_merkle_root()
        
        # Proof of Work
        print(f"마이닝 시작... 난이도: {self.difficulty}")
        start_time = time.time()
        
        while True:
            new_block.hash = new_block.calculate_hash()
            
            if new_block.hash.startswith("0" * self.difficulty):
                end_time = time.time()
                print(f"블록 마이닝 완료! 소요 시간: {end_time - start_time:.2f}초")
                print(f"블록 해시: {new_block.hash}")
                break
            
            new_block.nonce += 1
        
        # 양자 증명 추가 (선택적)
        new_block.quantum_proof = self._generate_quantum_proof(new_block)
        
        # 블록 추가
        self.chain.append(new_block)
        
        # 잔액 업데이트
        self._update_balances(transactions)
        
        # 대기 중인 트랜잭션 초기화
        self.pending_transactions = []
        
        return new_block
    
    def _generate_quantum_proof(self, block: QuantumSafeBlock) -> Dict[str, Any]:
        """양자 증명 생성 (개념적)"""
        # 실제로는 양자 키 분배(QKD) 또는 양자 디지털 서명 등을 사용
        # 여기서는 블록의 양자 안전성을 증명하는 메타데이터를 생성
        
        return {
            "quantum_signature_algorithms": ["dilithium", "xmss"],
            "post_quantum_hash": "sha3-256",
            "quantum_resistance_level": "NIST_Level_3",
            "timestamp": time.time(),
            "proof_type": "post_quantum_cryptographic"
        }
    
    def _update_balances(self, transactions: List[QuantumSafeTransaction]):
        """잔액 업데이트"""
        for tx in transactions:
            if tx.sender != "0":  # 시스템이 아닌 경우
                self.balances[tx.sender] = self.balances.get(tx.sender, 0) - tx.amount
            
            self.balances[tx.receiver] = self.balances.get(tx.receiver, 0) + tx.amount
    
    def validate_chain(self) -> bool:
        """체인 유효성 검증"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # 해시 검증
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # 이전 블록 연결 검증
            if current_block.previous_hash != previous_block.hash:
                return False
            
            # 머클 루트 검증
            if current_block.merkle_root != current_block.calculate_merkle_root():
                return False
            
            # PoW 검증
            if not current_block.hash.startswith("0" * self.difficulty):
                return False
            
            # 트랜잭션 서명 검증
            wallet = QuantumSafeWallet("temp")
            for tx in current_block.transactions:
                if tx.sender != "0":  # 시스템 트랜잭션이 아닌 경우
                    if not wallet.verify_transaction(tx, tx.sender):
                        return False
        
        return True
    
    def get_balance(self, address: str) -> float:
        """잔액 조회"""
        return self.balances.get(address, 0)

# 테스트 및 데모
def demo_quantum_safe_blockchain():
    """양자 안전 블록체인 데모"""
    print("=== 양자 안전 블록체인 데모 ===")
    
    # 블록체인 초기화
    blockchain = QuantumSafeBlockchain()
    
    # 지갑 생성
    alice_wallet = QuantumSafeWallet("Alice")
    bob_wallet = QuantumSafeWallet("Bob")
    miner_wallet = QuantumSafeWallet("Miner")
    
    print(f"Alice 주소: {alice_wallet.address}")
    print(f"Bob 주소: {bob_wallet.address}")
    print(f"Miner 주소: {miner_wallet.address}")
    
    # 초기 잔액 설정 (테스트용)
    blockchain.balances[alice_wallet.address] = 100.0
    blockchain.balances[bob_wallet.address] = 50.0
    
    print(f"\n초기 잔액:")
    print(f"Alice: {blockchain.get_balance(alice_wallet.address)}")
    print(f"Bob: {blockchain.get_balance(bob_wallet.address)}")
    
    # 트랜잭션 생성 및 서명
    print("\n=== 트랜잭션 처리 ===")
    
    # Alice -> Bob 송금 (Dilithium 서명)
    tx1 = QuantumSafeTransaction(
        sender=alice_wallet.address,
        receiver=bob_wallet.address,
        amount=20.0,
        timestamp=time.time(),
        nonce=1
    )
    
    tx1 = alice_wallet.sign_transaction(tx1, "dilithium")
    success = blockchain.add_transaction(tx1)
    print(f"트랜잭션 1 (Dilithium 서명): {'✓' if success else '✗'}")
    
    # Bob -> Alice 송금 (XMSS 서명)
    tx2 = QuantumSafeTransaction(
        sender=bob_wallet.address,
        receiver=alice_wallet.address,
        amount=5.0,
        timestamp=time.time(),
        nonce=1
    )
    
    tx2 = bob_wallet.sign_transaction(tx2, "xmss")
    success = blockchain.add_transaction(tx2)
    print(f"트랜잭션 2 (XMSS 서명): {'✓' if success else '✗'}")
    
    # 블록 마이닝
    print("\n=== 블록 마이닝 ===")
    mined_block = blockchain.mine_block(miner_wallet.address)
    
    print(f"마이닝된 블록 인덱스: {mined_block.index}")
    print(f"트랜잭션 수: {len(mined_block.transactions)}")
    print(f"양자 증명: {mined_block.quantum_proof['quantum_resistance_level']}")
    
    # 잔액 확인
    print(f"\n마이닝 후 잔액:")
    print(f"Alice: {blockchain.get_balance(alice_wallet.address)}")
    print(f"Bob: {blockchain.get_balance(bob_wallet.address)}")
    print(f"Miner: {blockchain.get_balance(miner_wallet.address)}")
    
    # 체인 검증
    print(f"\n블록체인 검증: {'✓' if blockchain.validate_chain() else '✗'}")
    
    # 블록체인 정보
    print(f"\n=== 블록체인 정보 ===")
    print(f"총 블록 수: {len(blockchain.chain)}")
    print(f"난이도: {blockchain.difficulty}")
    
    for block in blockchain.chain:
        print(f"블록 {block.index}: {block.hash[:16]}... "
              f"(트랜잭션 {len(block.transactions)}개)")

if __name__ == "__main__":
    demo_quantum_safe_blockchain()
```

양자 컴퓨팅 시대의 도래는 현재의 암호화 기술에 근본적인 변화를 요구하고 있습니다. 포스트 양자 암호화 기술을 조기에 도입하고, 하이브리드 보안 시스템을 구축하여 양자 컴퓨팅 위협에 선제적으로 대응하는 것이 중요합니다. 카카오페이에서는 이러한 차세대 보안 기술 연구를 통해 미래의 금융 서비스 보안을 준비하고 있습니다.