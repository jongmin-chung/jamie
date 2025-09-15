---
title: "AI와 머신러닝의 핀테크 응용: 개인화부터 리스크 관리까지"
description: "인공지능 기술이 금융 서비스를 어떻게 혁신하고 있는지, 카카오페이의 AI 적용 사례와 함께 살펴봅니다."
publishedAt: "2024-12-30"
category: "Tech"
tags: ["AI", "머신러닝", "핀테크", "개인화", "리스크관리"]
author: "김에이아이"
featured: true
---

# AI와 머신러닝의 핀테크 응용: 개인화부터 리스크 관리까지

인공지능과 머신러닝 기술은 금융 서비스의 모든 영역을 혁신하고 있습니다. 카카오페이에서 AI 기술을 활용해 사용자 경험을 개선하고 리스크를 관리하며 새로운 서비스를 개발한 경험을 바탕으로, 핀테크에서의 AI 활용법을 심도 있게 소개합니다.

## 개인화 추천 시스템

### 1. 사용자 행동 분석 기반 추천
```python
import numpy as np
import pandas as pd
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Embedding, Dense, Concatenate, Dropout

# 협업 필터링 모델
class PaymentRecommendationEngine:
    def __init__(self):
        self.user_merchant_matrix = None
        self.merchant_features = None
        self.user_embeddings = None
        self.merchant_embeddings = None
        
    def prepare_data(self, transactions_df):
        """거래 데이터를 추천 시스템용으로 전처리"""
        # 사용자-가맹점 행렬 생성
        self.user_merchant_matrix = transactions_df.pivot_table(
            index='user_id', 
            columns='merchant_id', 
            values='amount',
            aggfunc='sum',
            fill_value=0
        )
        
        # 가맹점 특성 추출
        merchant_stats = transactions_df.groupby('merchant_id').agg({
            'amount': ['mean', 'std', 'count'],
            'category': lambda x: x.iloc[0],  # 카테고리
            'user_id': 'nunique'  # 고유 사용자 수
        }).reset_index()
        
        # 카테고리 벡터화
        tfidf = TfidfVectorizer(max_features=100)
        category_features = tfidf.fit_transform(
            merchant_stats['category'].astype(str)
        ).toarray()
        
        self.merchant_features = np.hstack([
            merchant_stats[['amount']].values,
            category_features
        ])
        
    def build_neural_collaborative_filtering(self, n_users, n_merchants, embedding_dim=50):
        """Neural Collaborative Filtering 모델 구축"""
        # 입력 레이어
        user_input = Input(shape=(), name='user_id')
        merchant_input = Input(shape=(), name='merchant_id')
        
        # 임베딩 레이어
        user_embedding = Embedding(
            n_users, embedding_dim, 
            name='user_embedding'
        )(user_input)
        merchant_embedding = Embedding(
            n_merchants, embedding_dim,
            name='merchant_embedding' 
        )(merchant_input)
        
        # 벡터 평탄화
        user_vec = tf.keras.layers.Flatten()(user_embedding)
        merchant_vec = tf.keras.layers.Flatten()(merchant_embedding)
        
        # MLP 경로
        mlp_concat = Concatenate()([user_vec, merchant_vec])
        mlp_dropout = Dropout(0.2)(mlp_concat)
        mlp_dense1 = Dense(128, activation='relu')(mlp_dropout)
        mlp_dropout2 = Dropout(0.2)(mlp_dense1)
        mlp_dense2 = Dense(64, activation='relu')(mlp_dropout2)
        
        # GMF (Generalized Matrix Factorization) 경로
        gmf_layer = tf.keras.layers.Multiply()([user_vec, merchant_vec])
        
        # 최종 결합
        final_concat = Concatenate()([mlp_dense2, gmf_layer])
        output = Dense(1, activation='sigmoid', name='rating')(final_concat)
        
        model = Model(inputs=[user_input, merchant_input], outputs=output)
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['mae', 'mse']
        )
        
        return model
    
    def train_model(self, model, train_data, validation_data, epochs=50):
        """모델 훈련"""
        # 콜백 설정
        callbacks = [
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=3
            )
        ]
        
        history = model.fit(
            train_data,
            validation_data=validation_data,
            epochs=epochs,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def get_user_recommendations(self, model, user_id, n_recommendations=10):
        """사용자별 추천 가맹점 생성"""
        # 모든 가맹점에 대한 예측
        all_merchants = range(len(self.merchant_features))
        user_array = np.array([user_id] * len(all_merchants))
        merchant_array = np.array(all_merchants)
        
        predictions = model.predict([user_array, merchant_array])
        
        # 기존 이용 가맹점 제외
        used_merchants = set(
            self.user_merchant_matrix.loc[user_id]
            [self.user_merchant_matrix.loc[user_id] > 0].index
        )
        
        # 추천 점수 계산 및 정렬
        recommendations = []
        for i, (merchant_id, score) in enumerate(zip(all_merchants, predictions.flatten())):
            if merchant_id not in used_merchants:
                recommendations.append((merchant_id, score))
        
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:n_recommendations]
```

### 2. 실시간 개인화 서비스
```python
import redis
import json
from datetime import datetime, timedelta
import asyncio

class RealTimePersonalizationEngine:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.feature_cache_ttl = 3600  # 1시간
        self.recommendation_cache_ttl = 1800  # 30분
        
    async def update_user_features(self, user_id, transaction_data):
        """실시간 사용자 특성 업데이트"""
        feature_key = f"user_features:{user_id}"
        
        # 기존 특성 조회
        existing_features = self.redis.hgetall(feature_key)
        
        # 새로운 특성 계산
        new_features = self.calculate_features(transaction_data, existing_features)
        
        # Redis에 업데이트
        pipeline = self.redis.pipeline()
        for feature, value in new_features.items():
            pipeline.hset(feature_key, feature, json.dumps(value))
        pipeline.expire(feature_key, self.feature_cache_ttl)
        await pipeline.execute()
        
        # 추천 캐시 무효화
        await self.invalidate_recommendation_cache(user_id)
    
    def calculate_features(self, transaction_data, existing_features):
        """사용자 특성 계산"""
        features = {}
        
        # 거래 빈도 특성
        features['avg_transaction_amount'] = transaction_data.get('amount', 0)
        features['transaction_count'] = existing_features.get('transaction_count', 0) + 1
        features['last_transaction_time'] = datetime.now().isoformat()
        
        # 카테고리 선호도
        category = transaction_data.get('category')
        if category:
            category_key = f'category_preference_{category}'
            current_pref = json.loads(existing_features.get(category_key, '0'))
            features[category_key] = current_pref + 1
        
        # 시간대별 활동 패턴
        hour = datetime.now().hour
        time_slot = self.get_time_slot(hour)
        time_key = f'time_preference_{time_slot}'
        current_time_pref = json.loads(existing_features.get(time_key, '0'))
        features[time_key] = current_time_pref + 1
        
        return features
    
    def get_time_slot(self, hour):
        """시간을 슬롯으로 변환"""
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 18:
            return 'afternoon'
        elif 18 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    async def get_personalized_offers(self, user_id, context=None):
        """개인화된 오퍼 제공"""
        cache_key = f"offers:{user_id}"
        
        # 캐시된 추천 확인
        cached_offers = await self.redis.get(cache_key)
        if cached_offers:
            return json.loads(cached_offers)
        
        # 사용자 특성 조회
        user_features = await self.redis.hgetall(f"user_features:{user_id}")
        
        # 컨텍스트 정보 추가
        if context:
            current_location = context.get('location')
            current_time = context.get('time', datetime.now())
            time_slot = self.get_time_slot(current_time.hour)
        
        # 개인화된 오퍼 생성
        offers = await self.generate_contextual_offers(
            user_features, current_location, time_slot
        )
        
        # 결과 캐싱
        await self.redis.setex(
            cache_key, 
            self.recommendation_cache_ttl,
            json.dumps(offers)
        )
        
        return offers
    
    async def generate_contextual_offers(self, user_features, location, time_slot):
        """컨텍스트 기반 오퍼 생성"""
        offers = []
        
        # 위치 기반 오퍼
        if location:
            nearby_merchants = await self.get_nearby_merchants(location)
            for merchant in nearby_merchants:
                offer_score = self.calculate_offer_score(
                    merchant, user_features, time_slot
                )
                if offer_score > 0.7:  # 임계값
                    offers.append({
                        'merchant_id': merchant['id'],
                        'merchant_name': merchant['name'],
                        'offer_type': 'location_based',
                        'score': offer_score,
                        'distance': merchant['distance']
                    })
        
        # 시간대별 오퍼
        time_preference_key = f'time_preference_{time_slot}'
        if time_preference_key in user_features:
            time_based_offers = await self.get_time_based_offers(time_slot)
            offers.extend(time_based_offers)
        
        return sorted(offers, key=lambda x: x['score'], reverse=True)[:10]
```

## 리스크 관리 AI

### 1. 이상거래 탐지 시스템
```python
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import xgboost as xgb
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib

class FraudDetectionSystem:
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.xgb_model = None
        self.lstm_model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        
    def preprocess_features(self, transactions_df):
        """거래 데이터 특성 추출"""
        # 기본 특성
        features = transactions_df.copy()
        
        # 시간 특성
        features['hour'] = pd.to_datetime(features['timestamp']).dt.hour
        features['day_of_week'] = pd.to_datetime(features['timestamp']).dt.dayofweek
        features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # 사용자별 통계 특성
        user_stats = transactions_df.groupby('user_id').agg({
            'amount': ['mean', 'std', 'count', 'max'],
            'merchant_id': 'nunique'
        }).reset_index()
        user_stats.columns = ['user_id', 'user_avg_amount', 'user_std_amount', 
                             'user_tx_count', 'user_max_amount', 'user_unique_merchants']
        
        features = features.merge(user_stats, on='user_id', how='left')
        
        # Z-score 특성 (평소와 얼마나 다른지)
        features['amount_zscore'] = (
            features['amount'] - features['user_avg_amount']
        ) / (features['user_std_amount'] + 1e-8)
        
        # 가맹점별 통계
        merchant_stats = transactions_df.groupby('merchant_id').agg({
            'amount': ['mean', 'std'],
            'user_id': 'nunique'
        }).reset_index()
        merchant_stats.columns = ['merchant_id', 'merchant_avg_amount', 
                                'merchant_std_amount', 'merchant_unique_users']
        
        features = features.merge(merchant_stats, on='merchant_id', how='left')
        
        # 순차 특성 (최근 거래 패턴)
        features = features.sort_values(['user_id', 'timestamp'])
        features['time_since_last_tx'] = (
            features.groupby('user_id')['timestamp']
            .diff().dt.total_seconds().fillna(0)
        )
        
        # 속도 특성 (연속 거래)
        features['tx_velocity_1h'] = (
            features.groupby('user_id')['timestamp']
            .rolling('1H', on='timestamp').count()
        )
        
        return features
    
    def train_isolation_forest(self, features_df):
        """Isolation Forest를 사용한 이상치 탐지"""
        feature_cols = [
            'amount', 'amount_zscore', 'hour', 'day_of_week',
            'user_avg_amount', 'user_std_amount', 'time_since_last_tx',
            'tx_velocity_1h'
        ]
        
        X = features_df[feature_cols].fillna(0)
        X_scaled = self.scaler.fit_transform(X)
        
        self.isolation_forest.fit(X_scaled)
        
        # 이상치 점수 계산
        anomaly_scores = self.isolation_forest.decision_function(X_scaled)
        features_df['anomaly_score'] = anomaly_scores
        
        return features_df
    
    def train_xgboost_classifier(self, features_df, labels):
        """XGBoost를 사용한 사기 분류"""
        feature_cols = [
            'amount', 'amount_zscore', 'hour', 'day_of_week', 'is_weekend',
            'user_avg_amount', 'user_std_amount', 'user_tx_count',
            'merchant_avg_amount', 'merchant_std_amount', 'time_since_last_tx',
            'tx_velocity_1h', 'anomaly_score'
        ]
        
        X = features_df[feature_cols].fillna(0)
        y = labels
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # XGBoost 모델 훈련
        self.xgb_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            scale_pos_weight=len(y_train[y_train==0]) / len(y_train[y_train==1])
        )
        
        self.xgb_model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=10,
            verbose=False
        )
        
        # 특성 중요도 저장
        self.feature_importance = dict(zip(
            feature_cols,
            self.xgb_model.feature_importances_
        ))
        
        return self.xgb_model
    
    def build_lstm_model(self, sequence_length, n_features):
        """LSTM을 사용한 순차 패턴 분석"""
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(sequence_length, n_features)),
            Dropout(0.2),
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['precision', 'recall', 'f1_score']
        )
        
        return model
    
    def create_sequences(self, user_transactions, sequence_length=10):
        """사용자별 거래 시퀀스 생성"""
        sequences = []
        labels = []
        
        for user_id, group in user_transactions.groupby('user_id'):
            if len(group) < sequence_length:
                continue
                
            group = group.sort_values('timestamp')
            feature_cols = ['amount', 'hour', 'day_of_week', 'amount_zscore']
            
            for i in range(len(group) - sequence_length):
                sequence = group[feature_cols].iloc[i:i+sequence_length].values
                label = group['is_fraud'].iloc[i+sequence_length]
                
                sequences.append(sequence)
                labels.append(label)
        
        return np.array(sequences), np.array(labels)
    
    def predict_fraud_probability(self, transaction_features):
        """거래의 사기 확률 예측"""
        # Isolation Forest 이상치 점수
        X_scaled = self.scaler.transform([transaction_features])
        anomaly_score = self.isolation_forest.decision_function(X_scaled)[0]
        
        # XGBoost 분류 확률
        features_with_anomaly = transaction_features + [anomaly_score]
        xgb_prob = self.xgb_model.predict_proba([features_with_anomaly])[0][1]
        
        # 앙상블 점수 (가중 평균)
        ensemble_score = 0.7 * xgb_prob + 0.3 * (1 - (anomaly_score + 1) / 2)
        
        return {
            'fraud_probability': ensemble_score,
            'anomaly_score': anomaly_score,
            'xgb_probability': xgb_prob,
            'risk_level': self.categorize_risk(ensemble_score)
        }
    
    def categorize_risk(self, probability):
        """위험도 카테고리 분류"""
        if probability < 0.3:
            return 'LOW'
        elif probability < 0.7:
            return 'MEDIUM'
        else:
            return 'HIGH'
```

### 2. 신용평가 AI 모델
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.metrics import roc_auc_score, classification_report
import lightgbm as lgb
import shap

class CreditScoringModel:
    def __init__(self):
        self.models = {
            'logistic': LogisticRegression(random_state=42),
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(random_state=42),
            'lightgbm': lgb.LGBMClassifier(random_state=42)
        }
        self.best_model = None
        self.feature_names = None
        self.explainer = None
        
    def prepare_credit_features(self, user_data, transaction_data, external_data=None):
        """신용평가용 특성 생성"""
        features = {}
        
        # 기본 인적사항
        features.update({
            'age': user_data.get('age', 0),
            'income': user_data.get('annual_income', 0),
            'employment_duration': user_data.get('employment_duration_months', 0),
            'education_level': user_data.get('education_level', 0)  # encoded
        })
        
        # 거래 행동 특성
        if not transaction_data.empty:
            tx_stats = self.calculate_transaction_stats(transaction_data)
            features.update(tx_stats)
        
        # 외부 데이터 (선택적)
        if external_data:
            features.update({
                'credit_bureau_score': external_data.get('credit_score', 0),
                'existing_loans': external_data.get('loan_count', 0),
                'debt_to_income_ratio': external_data.get('debt_ratio', 0)
            })
        
        return features
    
    def calculate_transaction_stats(self, transactions):
        """거래 데이터 기반 통계 특성"""
        stats = {}
        
        # 기본 거래 통계
        stats['total_transactions'] = len(transactions)
        stats['avg_transaction_amount'] = transactions['amount'].mean()
        stats['std_transaction_amount'] = transactions['amount'].std()
        stats['max_transaction_amount'] = transactions['amount'].max()
        stats['total_volume'] = transactions['amount'].sum()
        
        # 거래 빈도 분석
        transactions['date'] = pd.to_datetime(transactions['timestamp']).dt.date
        daily_tx = transactions.groupby('date').size()
        stats['avg_daily_transactions'] = daily_tx.mean()
        stats['max_daily_transactions'] = daily_tx.max()
        
        # 거래 다양성
        stats['unique_merchants'] = transactions['merchant_id'].nunique()
        stats['merchant_concentration'] = (
            transactions['merchant_id'].value_counts().iloc[0] / len(transactions)
            if len(transactions) > 0 else 0
        )
        
        # 시간 패턴
        transactions['hour'] = pd.to_datetime(transactions['timestamp']).dt.hour
        stats['night_tx_ratio'] = (
            len(transactions[(transactions['hour'] < 6) | (transactions['hour'] > 22)]) / 
            len(transactions) if len(transactions) > 0 else 0
        )
        
        # 카테고리 분산
        category_dist = transactions['category'].value_counts(normalize=True)
        stats['category_entropy'] = -sum(p * np.log2(p) for p in category_dist)
        
        # 정기 결제 패턴
        monthly_amounts = transactions.groupby(
            pd.to_datetime(transactions['timestamp']).dt.to_period('M')
        )['amount'].sum()
        stats['payment_stability'] = 1 - (monthly_amounts.std() / monthly_amounts.mean())
        
        return stats
    
    def train_ensemble_model(self, X, y):
        """앙상블 모델 훈련 및 최적 모델 선택"""
        model_scores = {}
        
        for name, model in self.models.items():
            # 교차검증 점수
            cv_scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
            model_scores[name] = cv_scores.mean()
            
            # 모델 훈련
            model.fit(X, y)
            
            print(f"{name} CV AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # 최고 성능 모델 선택
        best_model_name = max(model_scores, key=model_scores.get)
        self.best_model = self.models[best_model_name]
        self.feature_names = list(X.columns)
        
        print(f"Best model: {best_model_name} with AUC: {model_scores[best_model_name]:.4f}")
        
        # SHAP 설명 모델 생성
        self.explainer = shap.TreeExplainer(self.best_model)
        
        return self.best_model
    
    def predict_credit_score(self, features):
        """신용점수 예측"""
        feature_array = np.array([list(features.values())])
        
        # 확률 예측
        probability = self.best_model.predict_proba(feature_array)[0][1]
        
        # 신용점수 변환 (300-850 범위)
        credit_score = int(300 + probability * 550)
        
        # 신용등급 결정
        credit_grade = self.get_credit_grade(credit_score)
        
        # SHAP 설명
        shap_values = self.explainer.shap_values(feature_array)[1]
        feature_importance = dict(zip(self.feature_names, shap_values[0]))
        
        return {
            'credit_score': credit_score,
            'credit_grade': credit_grade,
            'approval_probability': probability,
            'feature_importance': feature_importance,
            'risk_factors': self.identify_risk_factors(feature_importance)
        }
    
    def get_credit_grade(self, score):
        """신용점수를 등급으로 변환"""
        if score >= 750:
            return 'AAA'
        elif score >= 700:
            return 'AA'
        elif score >= 650:
            return 'A'
        elif score >= 600:
            return 'BBB'
        elif score >= 550:
            return 'BB'
        elif score >= 500:
            return 'B'
        else:
            return 'C'
    
    def identify_risk_factors(self, feature_importance, top_n=5):
        """주요 위험 요소 식별"""
        # 음수 영향을 주는 특성들 (위험 요소)
        risk_factors = {k: v for k, v in feature_importance.items() if v < 0}
        
        # 절댓값 기준으로 정렬
        sorted_risks = sorted(risk_factors.items(), key=lambda x: abs(x[1]), reverse=True)
        
        return dict(sorted_risks[:top_n])
```

## 대화형 AI와 챗봇

### 1. 금융 상담 챗봇
```python
import openai
from transformers import pipeline
import re
import json
from datetime import datetime

class FinancialChatbot:
    def __init__(self, api_key):
        openai.api_key = api_key
        self.intent_classifier = pipeline(
            "text-classification",
            model="bert-base-multilingual-cased"
        )
        self.conversation_history = {}
        self.financial_context = {}
        
    def classify_intent(self, message):
        """사용자 의도 분류"""
        intents = {
            'balance_inquiry': ['잔액', '얼마', '돈', '계좌'],
            'transaction_history': ['내역', '거래', '사용', '결제'],
            'payment_method': ['카드', '계좌', '등록', '결제수단'],
            'loan_inquiry': ['대출', '한도', '신용', '빌려'],
            'investment': ['투자', '적금', '주식', '펀드'],
            'complaint': ['불만', '문제', '오류', '잘못'],
            'general_inquiry': ['정보', '문의', '궁금', '알려']
        }
        
        message_lower = message.lower()
        for intent, keywords in intents.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        
        return 'general_inquiry'
    
    def extract_entities(self, message):
        """엔티티 추출 (금액, 날짜 등)"""
        entities = {}
        
        # 금액 추출
        amount_pattern = r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:원|만원|억원)?'
        amounts = re.findall(amount_pattern, message)
        if amounts:
            entities['amount'] = amounts[0].replace(',', '')
        
        # 날짜 추출
        date_patterns = [
            r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일',
            r'(\d{1,2})월\s*(\d{1,2})일',
            r'(어제|오늘|내일|이번달|지난달)'
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, message)
            if date_match:
                entities['date'] = date_match.group()
                break
        
        return entities
    
    async def process_message(self, user_id, message):
        """메시지 처리 및 응답 생성"""
        # 대화 기록 조회
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        # 의도 및 엔티티 분석
        intent = self.classify_intent(message)
        entities = self.extract_entities(message)
        
        # 컨텍스트 기반 응답 생성
        context = {
            'intent': intent,
            'entities': entities,
            'user_id': user_id,
            'conversation_history': self.conversation_history[user_id][-5:],  # 최근 5개
            'timestamp': datetime.now().isoformat()
        }
        
        response = await self.generate_response(context)
        
        # 대화 기록 업데이트
        self.conversation_history[user_id].append({
            'user_message': message,
            'bot_response': response,
            'intent': intent,
            'entities': entities,
            'timestamp': context['timestamp']
        })
        
        return response
    
    async def generate_response(self, context):
        """GPT를 활용한 응답 생성"""
        intent = context['intent']
        
        # 의도별 전문 응답 생성
        if intent == 'balance_inquiry':
            return await self.handle_balance_inquiry(context)
        elif intent == 'transaction_history':
            return await self.handle_transaction_inquiry(context)
        elif intent == 'loan_inquiry':
            return await self.handle_loan_inquiry(context)
        else:
            return await self.handle_general_inquiry(context)
    
    async def handle_balance_inquiry(self, context):
        """잔액 조회 처리"""
        user_id = context['user_id']
        
        # 실제 잔액 조회 (가상 데이터)
        balance = await self.get_user_balance(user_id)
        
        response_template = f"""
        안녕하세요! 현재 잔액을 안내드리겠습니다.

        💰 카카오페이 머니: {balance['kakao_money']:,}원
        💳 연결계좌 잔액: {balance['linked_account']:,}원

        추가로 궁금한 사항이 있으시면 언제든 말씀해 주세요.
        """
        
        return response_template.strip()
    
    async def handle_loan_inquiry(self, context):
        """대출 문의 처리"""
        user_id = context['user_id']
        entities = context['entities']
        
        # 사용자 신용정보 조회
        credit_info = await self.get_user_credit_info(user_id)
        
        # GPT를 활용한 개인화 응답
        prompt = f"""
        사용자의 대출 문의에 대해 친근하고 전문적으로 응답해주세요.
        
        사용자 정보:
        - 신용등급: {credit_info.get('grade', 'BB')}
        - 연봉: {credit_info.get('income', 0):,}원
        - 기존 대출: {credit_info.get('existing_loans', 0):,}원
        
        요청 금액: {entities.get('amount', '없음')}
        
        카카오뱅크의 대출 상품을 추천하고, 대략적인 한도와 금리를 안내해주세요.
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 카카오페이의 전문 금융 상담사입니다."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content
    
    async def get_user_balance(self, user_id):
        """사용자 잔액 조회 (모의)"""
        return {
            'kakao_money': 150000,
            'linked_account': 2500000
        }
    
    async def get_user_credit_info(self, user_id):
        """사용자 신용정보 조회 (모의)"""
        return {
            'grade': 'A',
            'income': 50000000,
            'existing_loans': 30000000
        }
```

AI와 머신러닝은 핀테크 서비스의 모든 측면을 혁신하고 있습니다. 개인화된 서비스 제공부터 리스크 관리, 고객 상담까지 다양한 영역에서 AI 기술을 활용하여 더 나은 사용자 경험과 안전한 금융 서비스를 제공할 수 있습니다.