---
title: "TypeScript 기초 완벽 정리"
description: "TypeScript의 기본 개념부터 실무 활용법까지, 초보자도 쉽게 이해할 수 있는 완벽한 가이드입니다."
publishedAt: "2025-09-09"
category: "frontend"
tags: ["typescript", "javascript", "타입시스템"]
author: "박타입"
---

# TypeScript 기초 완벽 정리

TypeScript는 Microsoft에서 개발한 JavaScript의 상위집합(superset) 언어로, 정적 타입 시스템을 제공합니다.

## 왜 TypeScript를 사용해야 할까요?

### 1. 타입 안정성
```typescript
// JavaScript
function add(a, b) {
  return a + b;
}

add(1, "2"); // "12" - 의도하지 않은 결과

// TypeScript  
function add(a: number, b: number): number {
  return a + b;
}

add(1, "2"); // 컴파일 에러!
```

### 2. 개발 경험 향상
- 자동완성
- 리팩토링 지원
- 런타임 에러 사전 방지

## 기본 타입들

### 원시 타입
```typescript
let name: string = "김개발";
let age: number = 30;
let isStudent: boolean = false;
let nothing: null = null;
let notDefined: undefined = undefined;
```

### 배열과 객체
```typescript
let numbers: number[] = [1, 2, 3, 4, 5];
let fruits: Array<string> = ["사과", "바나나", "오렌지"];

interface Person {
  name: string;
  age: number;
  email?: string; // 선택적 속성
}

let user: Person = {
  name: "이개발",
  age: 25
};
```

## 함수 타입 정의

```typescript
// 함수 선언
function greet(name: string): string {
  return `안녕하세요, ${name}님!`;
}

// 화살표 함수
const multiply = (x: number, y: number): number => x * y;

// 선택적 매개변수
function introduce(name: string, age?: number): string {
  if (age) {
    return `저는 ${name}이고, ${age}세입니다.`;
  }
  return `저는 ${name}입니다.`;
}
```

## 인터페이스와 타입

### Interface
```typescript
interface Vehicle {
  brand: string;
  model: string;
  year: number;
  start(): void;
}

class Car implements Vehicle {
  brand: string;
  model: string;
  year: number;

  constructor(brand: string, model: string, year: number) {
    this.brand = brand;
    this.model = model;
    this.year = year;
  }

  start(): void {
    console.log("자동차가 시동됩니다.");
  }
}
```

### Type Alias
```typescript
type Status = "pending" | "approved" | "rejected";
type ID = string | number;

interface Task {
  id: ID;
  title: string;
  status: Status;
}
```

## 제네릭(Generics)

제네릭을 사용하면 재사용 가능한 컴포넌트를 만들 수 있습니다.

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("안녕하세요");
let output2 = identity<number>(42);

// 제네릭 인터페이스
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
}

let userResponse: ApiResponse<User> = {
  data: { id: 1, name: "김사용자" },
  status: 200,
  message: "성공"
};
```

## 유틸리티 타입

TypeScript에서 제공하는 유용한 유틸리티 타입들입니다.

```typescript
interface UserInfo {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial - 모든 속성을 선택적으로 만듦
type PartialUser = Partial<UserInfo>;

// Pick - 특정 속성만 선택
type UserSummary = Pick<UserInfo, "id" | "name">;

// Omit - 특정 속성 제외
type UserWithoutId = Omit<UserInfo, "id">;

// Required - 모든 속성을 필수로 만듦
type RequiredUser = Required<PartialUser>;
```

## 실무 팁

### 1. 점진적 적용
기존 JavaScript 프로젝트에 TypeScript를 점진적으로 도입할 수 있습니다.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,
    "allowJs": true,
    "checkJs": false
  }
}
```

### 2. 타입 단언 주의
타입 단언은 꼭 필요한 경우에만 사용하세요.

```typescript
// 피하세요
const myCanvas = document.getElementById("canvas") as HTMLCanvasElement;

// 더 안전한 방법
const myCanvas = document.getElementById("canvas");
if (myCanvas instanceof HTMLCanvasElement) {
  // 타입이 자동으로 좁혀집니다
  myCanvas.getContext("2d");
}
```

## 마무리

TypeScript는 처음에는 복잡해 보일 수 있지만, 익숙해지면 개발 생산성과 코드 품질을 크게 향상시켜 줍니다. 작은 프로젝트부터 시작해서 점차 적용 범위를 넓혀가며 학습해보세요!