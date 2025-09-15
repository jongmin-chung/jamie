---
title: "프론트엔드 성능 최적화: 모바일 금융 앱을 위한 실전 기법"
description: "모바일 환경에서 빠르고 부드러운 사용자 경험을 제공하기 위한 프론트엔드 성능 최적화 기법을 실무 사례와 함께 소개합니다."
publishedAt: "2024-11-30"
category: "Development"
tags: ["프론트엔드", "성능최적화", "React", "모바일", "웹성능"]
author: "박프론트"
featured: false
---

# 프론트엔드 성능 최적화: 모바일 금융 앱을 위한 실전 기법

모바일 금융 서비스에서 성능은 사용자 경험과 직결되는 중요한 요소입니다. 카카오페이 프론트엔드 팀의 성능 최적화 노하우를 실무 코드와 함께 상세히 공유합니다.

## 번들 크기 최적화

### 1. 코드 스플리팅과 지연 로딩
```javascript
// 라우트 기반 코드 스플리팅
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// 페이지별 지연 로딩
const HomePage = lazy(() => import('./pages/HomePage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const App = () => (
  <div className="app">
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/history" element={<TransactionHistory />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Suspense>
  </div>
);

// 컴포넌트 레벨 지연 로딩
const PaymentMethods = lazy(() => 
  import('./components/PaymentMethods').then(module => ({
    default: module.PaymentMethods
  }))
);

// 조건부 로딩
const BiometricAuth = lazy(() => {
  // 생체인증 지원 기기에서만 로딩
  if (window.PublicKeyCredential) {
    return import('./components/BiometricAuth');
  }
  return Promise.resolve({ default: () => null });
});
```

### 2. Tree Shaking 최적화
```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      // lodash 최적화
      'lodash': 'lodash-es',
      // moment.js 대신 date-fns 사용
      'moment': 'date-fns',
    },
  },
};

// 필요한 함수만 import
import { debounce, throttle } from 'lodash-es';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// 사용하지 않는 코드 제거
const optimizedUtilities = {
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  },
  
  formatDate: (dateString) => {
    return format(parseISO(dateString), 'yyyy년 MM월 dd일', { locale: ko });
  },
  
  debounceSearch: debounce((query, callback) => {
    callback(query);
  }, 300),
};
```

## 렌더링 성능 최적화

### 1. React 최적화 기법
```javascript
import { memo, useMemo, useCallback, useState, useRef } from 'react';

// 컴포넌트 메모이제이션
const TransactionItem = memo(({ transaction, onSelect }) => {
  const formattedAmount = useMemo(() => 
    new Intl.NumberFormat('ko-KR').format(transaction.amount),
    [transaction.amount]
  );
  
  const handleClick = useCallback(() => {
    onSelect(transaction.id);
  }, [transaction.id, onSelect]);
  
  return (
    <div className="transaction-item" onClick={handleClick}>
      <div className="merchant">{transaction.merchantName}</div>
      <div className="amount">{formattedAmount}원</div>
      <div className="date">{transaction.date}</div>
    </div>
  );
});

// 가상화된 리스트 (react-window 사용)
import { FixedSizeList as List } from 'react-window';

const VirtualizedTransactionList = ({ transactions }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={transactions.length}
      itemSize={80}
      overscanCount={5}
    >
      {Row}
    </List>
  );
};

// 무한 스크롤 최적화
const useInfiniteScroll = (loadMore, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef();
  
  const lastElementRef = useCallback(node => {
    if (isFetching) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setIsFetching(true);
        loadMore().finally(() => setIsFetching(false));
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isFetching, loadMore, hasMore]);
  
  return lastElementRef;
};
```

### 2. 상태 관리 최적화
```javascript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// 선택적 구독을 통한 리렌더링 최소화
const useStore = create(
  subscribeWithSelector((set, get) => ({
    user: null,
    transactions: [],
    ui: {
      loading: false,
      modal: null,
      notifications: []
    },
    
    // 사용자 정보 업데이트
    setUser: (user) => set({ user }),
    
    // 거래 내역 업데이트 (불변성 유지)
    addTransaction: (transaction) => set(state => ({
      transactions: [transaction, ...state.transactions]
    })),
    
    // UI 상태 업데이트
    setLoading: (loading) => set(state => ({
      ui: { ...state.ui, loading }
    })),
    
    setModal: (modal) => set(state => ({
      ui: { ...state.ui, modal }
    })),
  }))
);

// 컴포넌트에서 필요한 상태만 구독
const TransactionList = () => {
  const transactions = useStore(state => state.transactions);
  const loading = useStore(state => state.ui.loading);
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      {transactions.map(transaction => 
        <TransactionItem key={transaction.id} transaction={transaction} />
      )}
    </div>
  );
};
```

## 네트워크 최적화

### 1. API 호출 최적화
```javascript
// GraphQL과 Apollo Client를 통한 데이터 페칭 최적화
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_USER_TRANSACTIONS, UPDATE_USER_PROFILE } from './queries';

const useOptimizedTransactions = (userId) => {
  const client = useApolloClient();
  
  const { data, loading, error, fetchMore } = useQuery(GET_USER_TRANSACTIONS, {
    variables: { userId, first: 20 },
    // 캐시 정책
    fetchPolicy: 'cache-first',
    // 백그라운드에서 업데이트
    notifyOnNetworkStatusChange: true,
  });
  
  // 페이지네이션
  const loadMore = useCallback(() => {
    return fetchMore({
      variables: {
        after: data?.user?.transactions?.pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        
        return {
          user: {
            ...prev.user,
            transactions: {
              ...fetchMoreResult.user.transactions,
              edges: [
                ...prev.user.transactions.edges,
                ...fetchMoreResult.user.transactions.edges,
              ],
            },
          },
        };
      },
    });
  }, [data, fetchMore]);
  
  // 캐시 직접 업데이트로 낙관적 업데이트
  const addTransactionToCache = useCallback((newTransaction) => {
    client.cache.modify({
      id: client.cache.identify({ __typename: 'User', id: userId }),
      fields: {
        transactions: (existing) => ({
          ...existing,
          edges: [{ node: newTransaction }, ...existing.edges],
        }),
      },
    });
  }, [client, userId]);
  
  return {
    transactions: data?.user?.transactions?.edges?.map(edge => edge.node) || [],
    loading,
    error,
    loadMore,
    addTransactionToCache,
  };
};

// Request 중복 제거
const requestCache = new Map();

const dedupedFetch = async (url, options = {}) => {
  const key = `${url}-${JSON.stringify(options)}`;
  
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const request = fetch(url, options)
    .then(response => response.json())
    .finally(() => {
      // 5초 후 캐시에서 제거
      setTimeout(() => requestCache.delete(key), 5000);
    });
  
  requestCache.set(key, request);
  return request;
};
```

### 2. 이미지 최적화
```javascript
// 이미지 지연 로딩과 최적화
import { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  placeholder, 
  className 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // WebP 지원 여부 확인
  const getOptimizedSrc = (originalSrc) => {
    const supportsWebP = 
      document.createElement('canvas').toDataURL('image/webp').indexOf('webp') > -1;
    
    if (supportsWebP && originalSrc.includes('.jpg') || originalSrc.includes('.png')) {
      return originalSrc.replace(/\.(jpg|png)$/, '.webp');
    }
    
    return originalSrc;
  };
  
  return (
    <div ref={imgRef} className={`image-container ${className}`}>
      {!isLoaded && placeholder && (
        <div className="image-placeholder">{placeholder}</div>
      )}
      
      {isInView && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </div>
  );
};

// 이미지 프리로딩
const useImagePreloader = (imageUrls) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  
  useEffect(() => {
    imageUrls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(url));
      };
      img.src = url;
    });
  }, [imageUrls]);
  
  return loadedImages;
};
```

## 메모리 관리

### 1. 메모리 누수 방지
```javascript
// 이벤트 리스너 정리
const useEventListener = (eventType, handler, element = window) => {
  const savedHandler = useRef();
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    
    if (element && element.addEventListener) {
      element.addEventListener(eventType, eventListener);
      
      return () => {
        element.removeEventListener(eventType, eventListener);
      };
    }
  }, [eventType, element]);
};

// 타이머 정리
const useInterval = (callback, delay) => {
  const savedCallback = useRef();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// 구독 정리
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      setLastMessage(JSON.parse(event.data));
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [url]);
  
  return { socket, lastMessage };
};
```

### 2. 대용량 리스트 최적화
```javascript
// React Window를 사용한 가상화
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualizedTransactionList = ({ transactions }) => {
  const getItemSize = useCallback((index) => {
    const transaction = transactions[index];
    // 거래 타입에 따라 높이 다르게 설정
    return transaction.type === 'detailed' ? 120 : 80;
  }, [transactions]);
  
  const Row = memo(({ index, style }) => {
    const transaction = transactions[index];
    
    return (
      <div style={style}>
        <TransactionItem 
          transaction={transaction}
          isVirtualized={true}
        />
      </div>
    );
  });
  
  return (
    <div style={{ height: '100vh' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={transactions.length}
            itemSize={getItemSize}
            overscanCount={5}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

// 검색 결과 최적화
const useSearchResults = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await searchAPI(searchQuery);
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedSearch(query);
    
    // 컴포넌트 언마운트 시 debounced 함수 취소
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);
  
  return { query, setQuery, results, isLoading };
};
```

## 모니터링과 측정

### 1. 성능 메트릭 수집
```javascript
// Web Vitals 측정
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const performanceObserver = {
  init() {
    // Core Web Vitals 측정
    getCLS(this.sendMetric);
    getFID(this.sendMetric);
    getFCP(this.sendMetric);
    getLCP(this.sendMetric);
    getTTFB(this.sendMetric);
    
    // 커스텀 메트릭 추가
    this.measureCustomMetrics();
  },
  
  sendMetric(metric) {
    // 성능 데이터를 분석 서버로 전송
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    // 자체 분석 시스템으로도 전송
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.pathname,
      }),
    }).catch(console.error);
  },
  
  measureCustomMetrics() {
    // 결제 프로세스 시간 측정
    performance.mark('payment-process-start');
    
    // 페이지별 렌더링 시간
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('payment')) {
          this.sendMetric({
            name: 'payment-render-time',
            value: entry.duration,
            id: generateUniqueId(),
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
};

// React 컴포넌트 렌더링 성능 측정
const useRenderTime = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // 16ms 초과시 기록
        console.warn(`${componentName} render time: ${renderTime}ms`);
        
        // 성능 이슈 리포팅
        reportPerformanceIssue({
          component: componentName,
          renderTime,
          url: window.location.pathname,
        });
      }
    };
  });
};
```

### 2. 사용자 세션 분석
```javascript
// 사용자 행동 패턴 분석
class UserSessionAnalyzer {
  constructor() {
    this.sessionStart = Date.now();
    this.interactions = [];
    this.performanceData = {};
  }
  
  trackInteraction(type, target, metadata = {}) {
    this.interactions.push({
      type,
      target,
      timestamp: Date.now(),
      metadata,
    });
    
    // 실시간 분석
    this.analyzeUserBehavior();
  }
  
  analyzeUserBehavior() {
    const recentInteractions = this.interactions.slice(-10);
    
    // 빠른 연속 클릭 감지 (실수 클릭)
    const rapidClicks = recentInteractions.filter(
      (interaction, index) => {
        if (index === 0) return false;
        const prevInteraction = recentInteractions[index - 1];
        return interaction.timestamp - prevInteraction.timestamp < 300;
      }
    );
    
    if (rapidClicks.length > 3) {
      // 사용자가 실수 클릭을 하고 있을 가능성
      this.showHelpTooltip();
    }
    
    // 체류 시간 분석
    const sessionDuration = Date.now() - this.sessionStart;
    if (sessionDuration > 300000 && this.interactions.length < 5) {
      // 5분 이상 체류했지만 상호작용이 적음 -> 혼란 상태
      this.offerAssistance();
    }
  }
  
  generateSessionReport() {
    return {
      sessionDuration: Date.now() - this.sessionStart,
      totalInteractions: this.interactions.length,
      interactionRate: this.interactions.length / ((Date.now() - this.sessionStart) / 1000),
      mostUsedFeatures: this.getMostUsedFeatures(),
      performanceIssues: this.identifyPerformanceIssues(),
    };
  }
}
```

모바일 금융 앱의 프론트엔드 성능 최적화는 사용자 만족도와 비즈니스 성과에 직접적인 영향을 미칩니다. 지속적인 모니터링과 측정을 통해 병목 지점을 찾아 개선하고, 새로운 최적화 기법을 적용해 나가는 것이 중요합니다.