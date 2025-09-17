import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import KakaoStyleBlogLayout from '@/components/KakaoStyleBlogLayout'
import CodeBlock from '@/components/ui/CodeBlock'

// This would typically come from a CMS or API
const blogContent = (
  <>
    <h1 id="react-hooks-완전-가이드">React Hooks 완전 가이드</h1>
    <p>React Hooks는 React 16.8에서 도입된 혁신적인 기능으로, 함수형 컴포넌트에서도 상태 관리와 생명주기 메서드를 사용할 수 있게 해주었습니다.</p>
    
    <h2 id="usestate-hook">useState Hook</h2>
    <p><code>useState</code>는 가장 기본적인 Hook으로, 함수형 컴포넌트에서 상태를 관리할 수 있게 해줍니다.</p>
    
    <CodeBlock language="jsx">{`import React, { useState } from 'react';

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
}`}</CodeBlock>
    
    <h2 id="useeffect-hook">useEffect Hook</h2>
    <p><code>useEffect</code>는 컴포넌트의 생명주기를 처리하는 데 사용됩니다. 컴포넌트가 마운트, 업데이트, 언마운트될 때 실행할 코드를 정의할 수 있습니다.</p>
    
    <CodeBlock language="jsx">{`import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // 컴포넌트가 마운트되거나 userId가 변경될 때 실행
    fetchUser(userId).then(setUser);
  }, [userId]); // 의존성 배열
  
  return user ? (
    <div>{user.name}</div>
  ) : (
    <div>로딩중...</div>
  );
}`}</CodeBlock>
    
    <h2 id="커스텀-hook-만들기">커스텀 Hook 만들기</h2>
    <p>자주 사용하는 로직을 커스텀 Hook으로 추출하여 재사용할 수 있습니다.</p>
    
    <CodeBlock language="jsx">{`// hooks/useCounter.js
import { useState } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}`}</CodeBlock>
    
    <h2 id="주의사항">주의사항</h2>
    <p>React Hooks를 사용할 때 지켜야 할 규칙들이 있습니다:</p>
    
    <ul>
      <li><strong>최상위 레벨에서만 호출</strong>: 반복문, 조건문, 중첩된 함수 내에서 Hook을 호출하면 안 됩니다.</li>
      <li><strong>React 함수에서만 호출</strong>: 일반 JavaScript 함수가 아닌 React 함수형 컴포넌트나 커스텀 Hook에서만 사용해야 합니다.</li>
    </ul>
    
    <h2 id="결론">결론</h2>
    <p>React Hooks는 함수형 컴포넌트의 능력을 크게 향상시켜 주었습니다. 클래스 컴포넌트의 복잡성을 줄이고, 로직의 재사용성을 높여주는 강력한 도구입니다. 올바른 사용법을 익혀 더 나은 React 애플리케이션을 개발해보세요.</p>
  </>
)

export default function ReactHooksGuide() {
  return (
    <>
      <Header />
      <main className="blog-post-content pt-16">
        <KakaoStyleBlogLayout
          title="React Hooks 완전 가이드"
          date="2025년 9월 10일"
          author="김개발"
          readTime="1분 읽기"
          category="frontend"
          content={blogContent}
          tags={["react", "hooks", "javascript"]}
          relatedPosts={[
            {
              slug: 'typescript-basics',
              title: 'TypeScript 기초 완벽 정리',
              excerpt: 'TypeScript의 기본 개념부터 실무 활용법까지, 초보자도 쉽게 이해할 수 있는 완벽한 가이드입니다.',
              date: '2025. 9. 9'
            },
            {
              slug: 'javascript-es6-features',
              title: 'JavaScript ES6+ 주요 기능 정리',
              excerpt: 'ES6부터 최신 JavaScript까지, 현대 JavaScript 개발에 필수인 기능들을 정리했습니다.',
              date: '2025. 9. 7'
            },
            {
              slug: 'web-performance-optimization',
              title: '웹 성능 최적화 실전 가이드',
              excerpt: '실제 웹사이트 성능을 개선하는 구체적인 방법들을 살펴봅시다. Core Web Vitals부터 실무 최적화 기법까지.',
              date: '2025. 9. 6'
            }
          ]}
        />
      </main>
      <Footer />
    </>
  )
}