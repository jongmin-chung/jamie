---
title: "금융 데이터 예측을 위한 머신러닝 모델 구축하기"
description: "거래 패턴 분석부터 리스크 예측까지, 금융 서비스에서 활용하는 머신러닝 모델 개발과 운영 사례를 소개합니다."
publishedAt: "2024-12-12"
category: "Tech"
tags: ["머신러닝", "예측모델", "금융데이터", "Python", "리스크관리"]
author: "에엠엘"
featured: true
---

# 금융 데이터 예측을 위한 머신러닝 모델 구축하기

카카오페이의 다양한 금융 서비스에서 머신러닝을 활용해 사용자 행동 예측, 리스크 관리, 개인화 추천 등을 수행하는 실무 경험을 공유합니다.

## 데이터 파이프라인과 특징 공학

### 1. 거래 데이터 전처리
```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import datetime as dt

class FinancialDataProcessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
    
    def load_transaction_data(self, start_date, end_date):
        """거래 데이터 로드"""
        query = """
        SELECT 
            user_id,
            transaction_id,
            amount,
            merchant_id,
            merchant_category,
            payment_method,
            transaction_time,
            is_weekend,
            hour_of_day,
            day_of_month,
            is_success
        FROM transactions 
        WHERE transaction_time BETWEEN %s AND %s
        """
        
        df = pd.read_sql(query, self.db_connection, 
                        params=[start_date, end_date])
        
        return self.preprocess_data(df)
    
    def preprocess_data(self, df):
        """데이터 전처리 및 특징 생성"""
        # 시간 기반 특징 생성
        df['transaction_time'] = pd.to_datetime(df['transaction_time'])
        df['hour'] = df['transaction_time'].dt.hour
        df['day_of_week'] = df['transaction_time'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_night'] = ((df['hour'] >= 22) | (df['hour'] <= 6)).astype(int)
        
        # 사용자별 행동 패턴 특징
        user_features = self.create_user_features(df)
        df = df.merge(user_features, on='user_id', how='left')
        
        # 가맹점 카테고리별 특징
        merchant_features = self.create_merchant_features(df)
        df = df.merge(merchant_features, on='merchant_category', how='left')
        
        return df
    
    def create_user_features(self, df):
        """사용자별 행동 패턴 특징 생성"""
        user_stats = df.groupby('user_id').agg({
            'amount': ['mean', 'std', 'median', 'count'],
            'transaction_time': ['min', 'max'],
            'is_success': 'mean',
            'merchant_category': 'nunique'
        }).reset_index()
        
        # 컬럼명 정리
        user_stats.columns = ['user_id', 'avg_amount', 'std_amount', 'median_amount', 
                             'transaction_count', 'first_transaction', 'last_transaction',
                             'success_rate', 'unique_categories']
        
        # 사용자 활동 기간
        user_stats['days_active'] = (
            user_stats['last_transaction'] - user_stats['first_transaction']
        ).dt.days + 1
        
        # 일평균 거래 빈도
        user_stats['transactions_per_day'] = (
            user_stats['transaction_count'] / user_stats['days_active']
        )
        
        # 이상치 제거
        user_stats['avg_amount'] = np.clip(
            user_stats['avg_amount'], 
            user_stats['avg_amount'].quantile(0.01),
            user_stats['avg_amount'].quantile(0.99)
        )
        
        return user_stats[['user_id', 'avg_amount', 'std_amount', 'transaction_count',
                          'success_rate', 'unique_categories', 'transactions_per_day']]
    
    def create_merchant_features(self, df):
        """가맹점 카테고리별 특징 생성"""
        merchant_stats = df.groupby('merchant_category').agg({
            'amount': ['mean', 'std'],
            'is_success': 'mean',
            'user_id': 'nunique'
        }).reset_index()
        
        merchant_stats.columns = ['merchant_category', 'category_avg_amount', 
                                'category_std_amount', 'category_success_rate',
                                'unique_users']
        
        return merchant_stats
    
    def engineer_features(self, df):
        """고급 특징 공학"""
        # 시간대별 거래 패턴
        df['is_business_hours'] = ((df['hour'] >= 9) & (df['hour'] <= 18)).astype(int)
        df['is_lunch_time'] = ((df['hour'] >= 12) & (df['hour'] <= 14)).astype(int)
        
        # 거래 금액 구간화
        df['amount_tier'] = pd.cut(df['amount'], 
                                  bins=[0, 10000, 50000, 100000, 500000, float('inf')],
                                  labels=['very_low', 'low', 'medium', 'high', 'very_high'])
        
        # 상대적 거래 금액 (사용자 평균 대비)
        df['amount_ratio_to_user_avg'] = df['amount'] / df['avg_amount']
        
        # 카테고리별 상대 금액
        df['amount_ratio_to_category_avg'] = df['amount'] / df['category_avg_amount']
        
        # 연속 거래 패턴 (시계열 특징)
        df = df.sort_values(['user_id', 'transaction_time'])
        df['time_since_last_transaction'] = (
            df.groupby('user_id')['transaction_time'].diff().dt.total_seconds() / 3600
        )  # 시간 단위
        
        # 결측치 처리
        df['time_since_last_transaction'] = df['time_since_last_transaction'].fillna(24)
        
        return df
    
    def prepare_features(self, df):
        """모델링을 위한 최종 특징 준비"""
        # 범주형 변수 인코딩
        categorical_columns = ['merchant_category', 'payment_method', 'amount_tier']
        
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col])
            else:
                df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col])
        
        # 수치형 특징 선택
        numerical_features = [
            'amount', 'hour', 'day_of_week', 'avg_amount', 'std_amount',
            'transaction_count', 'success_rate', 'unique_categories',
            'transactions_per_day', 'category_avg_amount', 'category_success_rate',
            'amount_ratio_to_user_avg', 'amount_ratio_to_category_avg',
            'time_since_last_transaction', 'is_weekend', 'is_night',
            'is_business_hours', 'is_lunch_time'
        ]
        
        encoded_features = [f'{col}_encoded' for col in categorical_columns]
        
        self.feature_columns = numerical_features + encoded_features
        
        # 특징 정규화
        X = df[self.feature_columns].copy()
        X[numerical_features] = self.scaler.fit_transform(X[numerical_features])
        
        return X, df['is_success']
```

### 2. 실시간 특징 생성 파이프라인
```python
from kafka import KafkaConsumer, KafkaProducer
import json
import redis
from datetime import datetime, timedelta

class RealTimeFeatureEngine:
    def __init__(self, redis_client, model_predictor):
        self.redis = redis_client
        self.model_predictor = model_predictor
        self.consumer = KafkaConsumer(
            'transaction-events',
            bootstrap_servers=['localhost:9092'],
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        self.producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    
    def process_transaction_stream(self):
        """실시간 거래 스트림 처리"""
        for message in self.consumer:
            transaction = message.value
            
            try:
                # 실시간 특징 생성
                features = self.generate_realtime_features(transaction)
                
                # 모델 예측
                prediction = self.model_predictor.predict(features)
                
                # 결과 전송
                result = {
                    'transaction_id': transaction['transaction_id'],
                    'prediction': prediction,
                    'features': features.to_dict(),
                    'timestamp': datetime.now().isoformat()
                }
                
                self.producer.send('prediction-results', value=result)
                
                # Redis에 사용자 통계 업데이트
                self.update_user_stats(transaction)
                
            except Exception as e:
                print(f"Error processing transaction {transaction['transaction_id']}: {e}")
    
    def generate_realtime_features(self, transaction):
        """실시간 특징 생성"""
        user_id = transaction['user_id']
        current_time = datetime.fromisoformat(transaction['transaction_time'])
        
        # Redis에서 사용자 통계 조회
        user_stats = self.get_user_stats(user_id)
        
        features = {
            'amount': transaction['amount'],
            'hour': current_time.hour,
            'day_of_week': current_time.weekday(),
            'is_weekend': 1 if current_time.weekday() >= 5 else 0,
            'is_night': 1 if current_time.hour >= 22 or current_time.hour <= 6 else 0,
            
            # 사용자 통계 특징
            'avg_amount': user_stats.get('avg_amount', transaction['amount']),
            'transaction_count': user_stats.get('transaction_count', 0),
            'success_rate': user_stats.get('success_rate', 1.0),
            
            # 실시간 계산 특징
            'amount_ratio_to_user_avg': transaction['amount'] / user_stats.get('avg_amount', transaction['amount']),
            'time_since_last_transaction': self.get_time_since_last_transaction(user_id, current_time)
        }
        
        return pd.DataFrame([features])
    
    def get_user_stats(self, user_id):
        """Redis에서 사용자 통계 조회"""
        stats_key = f"user_stats:{user_id}"
        stats = self.redis.hgetall(stats_key)
        
        return {k.decode(): float(v.decode()) for k, v in stats.items()}
    
    def update_user_stats(self, transaction):
        """사용자 통계 업데이트"""
        user_id = transaction['user_id']
        stats_key = f"user_stats:{user_id}"
        
        # 현재 통계 조회
        current_stats = self.get_user_stats(user_id)
        
        # 통계 업데이트
        count = current_stats.get('transaction_count', 0) + 1
        total_amount = current_stats.get('total_amount', 0) + transaction['amount']
        avg_amount = total_amount / count
        
        # Redis에 업데이트된 통계 저장
        updated_stats = {
            'transaction_count': count,
            'total_amount': total_amount,
            'avg_amount': avg_amount,
            'last_transaction_time': transaction['transaction_time']
        }
        
        self.redis.hmset(stats_key, updated_stats)
        self.redis.expire(stats_key, 86400 * 30)  # 30일 TTL
    
    def get_time_since_last_transaction(self, user_id, current_time):
        """마지막 거래 이후 경과 시간 계산"""
        stats_key = f"user_stats:{user_id}"
        last_transaction = self.redis.hget(stats_key, 'last_transaction_time')
        
        if last_transaction:
            last_time = datetime.fromisoformat(last_transaction.decode())
            return (current_time - last_time).total_seconds() / 3600  # 시간 단위
        
        return 24  # 기본값: 24시간
```

## 예측 모델 개발

### 1. 거래 성공률 예측 모델
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from sklearn.model_selection import cross_val_score, GridSearchCV
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

class TransactionSuccessPredictor:
    def __init__(self):
        self.models = {
            'logistic': LogisticRegression(random_state=42),
            'random_forest': RandomForestClassifier(random_state=42),
            'gradient_boosting': GradientBoostingClassifier(random_state=42)
        }
        self.best_model = None
        self.feature_importance = None
    
    def train_models(self, X_train, y_train, X_val, y_val):
        """다양한 모델 훈련 및 비교"""
        results = {}
        
        for name, model in self.models.items():
            print(f"Training {name}...")
            
            # 모델 훈련
            model.fit(X_train, y_train)
            
            # 검증 데이터로 평가
            val_predictions = model.predict(X_val)
            val_probabilities = model.predict_proba(X_val)[:, 1]
            
            # 메트릭 계산
            auc_score = roc_auc_score(y_val, val_probabilities)
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
            
            results[name] = {
                'model': model,
                'auc_score': auc_score,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'predictions': val_predictions,
                'probabilities': val_probabilities
            }
            
            print(f"{name} - AUC: {auc_score:.4f}, CV: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # 최적 모델 선택
        self.best_model_name = max(results.keys(), key=lambda k: results[k]['auc_score'])
        self.best_model = results[self.best_model_name]['model']
        
        print(f"\nBest model: {self.best_model_name}")
        
        return results
    
    def hyperparameter_tuning(self, X_train, y_train):
        """하이퍼파라미터 튜닝"""
        if self.best_model_name == 'random_forest':
            param_grid = {
                'n_estimators': [100, 200, 300],
                'max_depth': [10, 20, None],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
        elif self.best_model_name == 'gradient_boosting':
            param_grid = {
                'n_estimators': [100, 200],
                'learning_rate': [0.05, 0.1, 0.15],
                'max_depth': [3, 5, 7]
            }
        else:  # logistic regression
            param_grid = {
                'C': [0.1, 1.0, 10.0],
                'penalty': ['l1', 'l2'],
                'solver': ['liblinear', 'saga']
            }
        
        grid_search = GridSearchCV(
            self.models[self.best_model_name],
            param_grid,
            cv=5,
            scoring='roc_auc',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        self.best_model = grid_search.best_estimator_
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best CV score: {grid_search.best_score_:.4f}")
        
        return grid_search.best_params_
    
    def analyze_feature_importance(self, feature_names):
        """특징 중요도 분석"""
        if hasattr(self.best_model, 'feature_importances_'):
            importances = self.best_model.feature_importances_
        elif hasattr(self.best_model, 'coef_'):
            importances = np.abs(self.best_model.coef_[0])
        else:
            print("Feature importance not available for this model")
            return
        
        self.feature_importance = pd.DataFrame({
            'feature': feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        # 시각화
        plt.figure(figsize=(12, 8))
        top_features = self.feature_importance.head(20)
        sns.barplot(data=top_features, x='importance', y='feature')
        plt.title('Top 20 Feature Importance')
        plt.tight_layout()
        plt.show()
        
        return self.feature_importance
    
    def evaluate_model(self, X_test, y_test):
        """모델 성능 평가"""
        predictions = self.best_model.predict(X_test)
        probabilities = self.best_model.predict_proba(X_test)[:, 1]
        
        # 분류 리포트
        print("Classification Report:")
        print(classification_report(y_test, predictions))
        
        # AUC Score
        auc = roc_auc_score(y_test, probabilities)
        print(f"AUC Score: {auc:.4f}")
        
        # 혼동 행렬 시각화
        plt.figure(figsize=(8, 6))
        cm = confusion_matrix(y_test, predictions)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.show()
        
        return {
            'auc': auc,
            'predictions': predictions,
            'probabilities': probabilities
        }
    
    def save_model(self, filepath):
        """모델 저장"""
        model_data = {
            'model': self.best_model,
            'model_name': self.best_model_name,
            'feature_importance': self.feature_importance
        }
        
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
```

### 2. 리스크 스코어링 모델
```python
class RiskScoringModel:
    def __init__(self):
        self.fraud_model = None
        self.credit_model = None
        self.risk_thresholds = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.8
        }
    
    def build_fraud_detection_model(self, X_train, y_fraud):
        """사기 거래 탐지 모델"""
        from sklearn.ensemble import IsolationForest
        from sklearn.svm import OneClassSVM
        
        # 이상치 탐지 모델 (비지도 학습)
        isolation_forest = IsolationForest(
            contamination=0.1,  # 10%의 이상치 예상
            random_state=42
        )
        
        # 정상 거래만으로 훈련
        normal_transactions = X_train[y_fraud == 0]
        isolation_forest.fit(normal_transactions)
        
        self.fraud_model = isolation_forest
        
        return isolation_forest
    
    def calculate_risk_score(self, transaction_features):
        """종합 리스크 점수 계산"""
        scores = {}
        
        # 1. 사기 리스크 점수
        if self.fraud_model:
            fraud_score = self.fraud_model.decision_function(transaction_features.reshape(1, -1))[0]
            # -1 ~ 1 범위를 0 ~ 1로 변환
            fraud_risk = (1 - fraud_score) / 2
            scores['fraud_risk'] = max(0, min(1, fraud_risk))
        
        # 2. 거래 패턴 이상 점수
        pattern_risk = self.calculate_pattern_risk(transaction_features)
        scores['pattern_risk'] = pattern_risk
        
        # 3. 금액 이상 점수
        amount_risk = self.calculate_amount_risk(transaction_features)
        scores['amount_risk'] = amount_risk
        
        # 4. 시간 패턴 리스크
        time_risk = self.calculate_time_risk(transaction_features)
        scores['time_risk'] = time_risk
        
        # 종합 리스크 점수 (가중 평균)
        weights = {
            'fraud_risk': 0.4,
            'pattern_risk': 0.3,
            'amount_risk': 0.2,
            'time_risk': 0.1
        }
        
        total_risk = sum(scores[key] * weights[key] for key in weights.keys())
        
        return {
            'total_risk': total_risk,
            'risk_level': self.get_risk_level(total_risk),
            'component_scores': scores
        }
    
    def calculate_pattern_risk(self, features):
        """거래 패턴 기반 리스크 계산"""
        # 사용자 평균 대비 금액 비율
        amount_ratio = features.get('amount_ratio_to_user_avg', 1.0)
        
        # 비정상적으로 높은 금액일 경우 리스크 증가
        if amount_ratio > 5:
            return 0.8
        elif amount_ratio > 3:
            return 0.6
        elif amount_ratio > 2:
            return 0.4
        else:
            return 0.2
    
    def calculate_amount_risk(self, features):
        """거래 금액 기반 리스크 계산"""
        amount = features.get('amount', 0)
        
        # 금액별 리스크 구간
        if amount > 1000000:    # 100만원 초과
            return 0.9
        elif amount > 500000:   # 50만원 초과
            return 0.7
        elif amount > 100000:   # 10만원 초과
            return 0.5
        elif amount > 50000:    # 5만원 초과
            return 0.3
        else:
            return 0.1
    
    def calculate_time_risk(self, features):
        """시간 패턴 기반 리스크 계산"""
        is_night = features.get('is_night', 0)
        is_weekend = features.get('is_weekend', 0)
        
        risk = 0.0
        
        # 야간 거래
        if is_night:
            risk += 0.3
        
        # 주말 거래
        if is_weekend:
            risk += 0.2
        
        # 마지막 거래 이후 시간
        time_since_last = features.get('time_since_last_transaction', 24)
        if time_since_last < 0.1:  # 6분 이내 연속 거래
            risk += 0.4
        
        return min(1.0, risk)
    
    def get_risk_level(self, risk_score):
        """리스크 점수를 레벨로 변환"""
        if risk_score >= self.risk_thresholds['high']:
            return 'HIGH'
        elif risk_score >= self.risk_thresholds['medium']:
            return 'MEDIUM'
        elif risk_score >= self.risk_thresholds['low']:
            return 'LOW'
        else:
            return 'VERY_LOW'
```

## 모델 배포와 모니터링

### 1. 모델 서빙 API
```python
from flask import Flask, request, jsonify
import joblib
import numpy as np
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

class ModelServer:
    def __init__(self):
        self.models = {}
        self.load_models()
    
    def load_models(self):
        """모델 로드"""
        try:
            self.models['transaction_success'] = joblib.load('models/transaction_success_model.pkl')
            self.models['risk_scoring'] = RiskScoringModel()
            self.models['risk_scoring'].fraud_model = joblib.load('models/fraud_detection_model.pkl')
            
            logging.info("Models loaded successfully")
        except Exception as e:
            logging.error(f"Error loading models: {e}")
    
    @app.route('/predict/transaction_success', methods=['POST'])
    def predict_transaction_success():
        """거래 성공률 예측 API"""
        try:
            data = request.json
            features = np.array(data['features']).reshape(1, -1)
            
            model = self.models['transaction_success']['model']
            prediction = model.predict_proba(features)[0][1]
            
            result = {
                'transaction_id': data.get('transaction_id'),
                'success_probability': float(prediction),
                'recommendation': 'APPROVE' if prediction > 0.7 else 'REVIEW',
                'model_version': self.models['transaction_success'].get('version', '1.0')
            }
            
            logging.info(f"Transaction success prediction: {result}")
            return jsonify(result)
            
        except Exception as e:
            logging.error(f"Prediction error: {e}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/predict/risk_score', methods=['POST'])
    def predict_risk_score():
        """리스크 점수 예측 API"""
        try:
            data = request.json
            features = data['features']
            
            risk_model = self.models['risk_scoring']
            risk_result = risk_model.calculate_risk_score(features)
            
            result = {
                'transaction_id': data.get('transaction_id'),
                'risk_score': risk_result['total_risk'],
                'risk_level': risk_result['risk_level'],
                'component_scores': risk_result['component_scores'],
                'action': self.get_recommended_action(risk_result['risk_level'])
            }
            
            logging.info(f"Risk score prediction: {result}")
            return jsonify(result)
            
        except Exception as e:
            logging.error(f"Risk scoring error: {e}")
            return jsonify({'error': str(e)}), 500
    
    def get_recommended_action(self, risk_level):
        """리스크 레벨에 따른 권장 액션"""
        actions = {
            'VERY_LOW': 'AUTO_APPROVE',
            'LOW': 'AUTO_APPROVE',
            'MEDIUM': 'MANUAL_REVIEW',
            'HIGH': 'ADDITIONAL_AUTH_REQUIRED'
        }
        return actions.get(risk_level, 'MANUAL_REVIEW')

model_server = ModelServer()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### 2. 모델 성능 모니터링
```python
class ModelMonitor:
    def __init__(self, db_connection, alert_system):
        self.db = db_connection
        self.alert_system = alert_system
        self.performance_metrics = {}
    
    def monitor_model_performance(self, model_name, predictions, actuals, features):
        """모델 성능 모니터링"""
        from sklearn.metrics import accuracy_score, precision_score, recall_score
        
        # 성능 지표 계산
        accuracy = accuracy_score(actuals, predictions)
        precision = precision_score(actuals, predictions, average='weighted')
        recall = recall_score(actuals, predictions, average='weighted')
        
        # 성능 저장
        performance_data = {
            'model_name': model_name,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'sample_count': len(predictions),
            'timestamp': datetime.now()
        }
        
        self.save_performance_metrics(performance_data)
        
        # 성능 임계값 체크
        self.check_performance_thresholds(model_name, performance_data)
        
        # 데이터 드리프트 감지
        self.detect_data_drift(model_name, features)
    
    def detect_data_drift(self, model_name, current_features):
        """데이터 드리프트 감지"""
        from scipy.stats import ks_2samp
        
        # 기준 데이터 조회 (훈련 시 사용한 데이터)
        baseline_features = self.get_baseline_features(model_name)
        
        drift_detected = False
        drift_features = []
        
        for feature_name in baseline_features.columns:
            if feature_name in current_features.columns:
                # Kolmogorov-Smirnov 테스트
                ks_stat, p_value = ks_2samp(
                    baseline_features[feature_name],
                    current_features[feature_name]
                )
                
                # p-value < 0.05이면 분포가 유의미하게 다름
                if p_value < 0.05:
                    drift_detected = True
                    drift_features.append({
                        'feature': feature_name,
                        'ks_statistic': ks_stat,
                        'p_value': p_value
                    })
        
        if drift_detected:
            self.alert_system.send_alert(
                title=f"Data Drift Detected - {model_name}",
                message=f"Drift detected in features: {[f['feature'] for f in drift_features]}",
                severity="HIGH"
            )
    
    def check_performance_thresholds(self, model_name, performance_data):
        """성능 임계값 체크"""
        thresholds = {
            'accuracy': 0.85,
            'precision': 0.80,
            'recall': 0.80
        }
        
        alerts = []
        
        for metric, threshold in thresholds.items():
            if performance_data[metric] < threshold:
                alerts.append(f"{metric}: {performance_data[metric]:.3f} (threshold: {threshold})")
        
        if alerts:
            self.alert_system.send_alert(
                title=f"Model Performance Degradation - {model_name}",
                message=f"Performance below threshold: {', '.join(alerts)}",
                severity="MEDIUM"
            )
    
    def generate_performance_report(self, model_name, days=7):
        """성능 리포트 생성"""
        query = """
        SELECT 
            DATE(timestamp) as date,
            AVG(accuracy) as avg_accuracy,
            AVG(precision) as avg_precision,
            AVG(recall) as avg_recall,
            SUM(sample_count) as total_predictions
        FROM model_performance 
        WHERE model_name = %s 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL %s DAY)
        GROUP BY DATE(timestamp)
        ORDER BY date
        """
        
        df = pd.read_sql(query, self.db, params=[model_name, days])
        
        # 시각화
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # 정확도 추이
        axes[0, 0].plot(df['date'], df['avg_accuracy'])
        axes[0, 0].set_title('Accuracy Trend')
        axes[0, 0].set_ylabel('Accuracy')
        
        # 정밀도 추이
        axes[0, 1].plot(df['date'], df['avg_precision'])
        axes[0, 1].set_title('Precision Trend')
        axes[0, 1].set_ylabel('Precision')
        
        # 재현율 추이
        axes[1, 0].plot(df['date'], df['avg_recall'])
        axes[1, 0].set_title('Recall Trend')
        axes[1, 0].set_ylabel('Recall')
        
        # 예측 횟수
        axes[1, 1].bar(df['date'], df['total_predictions'])
        axes[1, 1].set_title('Daily Predictions')
        axes[1, 1].set_ylabel('Count')
        
        plt.tight_layout()
        plt.show()
        
        return df
```

머신러닝을 활용한 금융 서비스는 지속적인 모델 개선과 모니터링이 핵심입니다. 데이터 품질 관리, 모델 성능 추적, 그리고 비즈니스 임팩트 측정을 통해 신뢰할 수 있는 AI 서비스를 구축할 수 있습니다.