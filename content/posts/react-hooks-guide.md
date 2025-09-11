---
title: "React Hooks 완전 가이드"
description: "React Hooks의 모든 것을 알아보는 완전한 가이드입니다. useState부터 useEffect까지 실무에서 사용하는 방법을 살펴봅시다."
publishedAt: "2025-09-10"
category: "frontend"
tags: ["react", "hooks", "javascript"]
author: "김개발"
---

# React Hooks 완전 가이드

React Hooks는 React 16.8에서 도입된 혁신적인 기능으로, 함수형 컴포넌트에서도 상태 관리와 생명주기 메서드를 사용할 수 있게 해주었습니다.

## useState Hook

`useState`는 가장 기본적인 Hook으로, 함수형 컴포넌트에서 상태를 관리할 수 있게 해줍니다.

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}
```

## useEffect Hook

`useEffect`는 컴포넌트의 생명주기를 처리하는 데 사용됩니다. 컴포넌트가 마운트, 업데이트, 언마운트될 때 실행할 코드를 정의할 수 있습니다.

```javascript
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 컴포넌트가 마운트되거나 userId가 변경될 때 실행
    fetchUser(userId).then(setUser);
  }, [userId]); // 의존성 배열

  return user ? <div>{user.name}</div> : <div>로딩중...</div>;
}
```

## 커스텀 Hook 만들기

자주 사용하는 로직을 커스텀 Hook으로 추출하여 재사용할 수 있습니다.

```javascript
// hooks/useCounter.js
import { useState } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

## 주의사항

React Hooks를 사용할 때 지켜야 할 규칙들이 있습니다:

1. **최상위 레벨에서만 호출**: 반복문, 조건문, 중첩된 함수 내에서 Hook을 호출하면 안 됩니다.
2. **React 함수에서만 호출**: 일반 JavaScript 함수가 아닌 React 함수형 컴포넌트나 커스텀 Hook에서만 사용해야 합니다.

## 결론

React Hooks는 함수형 컴포넌트의 능력을 크게 향상시켜 주었습니다. 클래스 컴포넌트의 복잡성을 줄이고, 로직의 재사용성을 높여주는 강력한 도구입니다. 올바른 사용법을 익혀 더 나은 React 애플리케이션을 개발해보세요.