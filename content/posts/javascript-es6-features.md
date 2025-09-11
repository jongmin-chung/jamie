---
title: "JavaScript ES6+ 주요 기능 정리"
description: "ES6부터 최신 JavaScript까지, 현대 JavaScript 개발에 필수인 기능들을 정리했습니다."
publishedAt: "2025-09-07"
category: "frontend"
tags: ["javascript", "es6", "모던자바스크립트"]
author: "최자바"
---

# JavaScript ES6+ 주요 기능 정리

ES6(ES2015) 이후 JavaScript는 많은 발전을 이루었습니다. 현대 JavaScript 개발에 필수인 기능들을 알아보겠습니다.

## let과 const

### var의 문제점
```javascript
// var는 함수 스코프
function example() {
  for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // 3, 3, 3 출력
  }
}

// let은 블록 스코프
function example2() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // 0, 1, 2 출력
  }
}
```

### const 활용
```javascript
// 상수 선언
const PI = 3.14159;

// 객체와 배열도 const로 선언 가능 (재할당은 불가, 내용 변경은 가능)
const user = { name: '김자바', age: 30 };
user.age = 31; // 가능
user.email = 'kim@example.com'; // 가능

const numbers = [1, 2, 3];
numbers.push(4); // 가능
```

## 화살표 함수 (Arrow Functions)

```javascript
// 일반 함수
function add(a, b) {
  return a + b;
}

// 화살표 함수
const add = (a, b) => a + b;

// 객체 반환
const createUser = (name, age) => ({ name, age });

// this 바인딩 차이
const obj = {
  name: '테스트',
  regularFunction: function() {
    console.log(this.name); // '테스트'
  },
  arrowFunction: () => {
    console.log(this.name); // undefined (전역 객체의 name)
  }
};
```

## 템플릿 리터럴

```javascript
const name = '김개발';
const age = 28;

// ES5
const message = '안녕하세요, 제 이름은 ' + name + '이고 나이는 ' + age + '세입니다.';

// ES6+
const message = `안녕하세요, 제 이름은 ${name}이고 나이는 ${age}세입니다.`;

// 여러 줄 문자열
const multiline = `
첫 번째 줄
두 번째 줄
세 번째 줄
`;
```

## 구조 분해 할당 (Destructuring)

### 배열 구조 분해
```javascript
const numbers = [1, 2, 3, 4, 5];

// ES5
const first = numbers[0];
const second = numbers[1];

// ES6+
const [first, second, ...rest] = numbers;
console.log(first); // 1
console.log(second); // 2
console.log(rest); // [3, 4, 5]
```

### 객체 구조 분해
```javascript
const user = {
  name: '이개발',
  age: 32,
  email: 'lee@example.com',
  address: {
    city: '서울',
    district: '강남구'
  }
};

// 기본 구조 분해
const { name, age, email } = user;

// 이름 변경
const { name: userName, age: userAge } = user;

// 기본값 설정
const { phone = '010-0000-0000' } = user;

// 중첩 객체 구조 분해
const { address: { city, district } } = user;
```

## 전개 연산자 (Spread Operator)

### 배열에서 사용
```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 배열 복사
const copiedArr = [...arr1];

// 배열 병합
const merged = [...arr1, ...arr2];

// 함수 인수로 전달
const max = Math.max(...arr1);
```

### 객체에서 사용
```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };

// 객체 복사
const copiedObj = { ...obj1 };

// 객체 병합
const merged = { ...obj1, ...obj2 };

// 속성 재정의
const updated = { ...obj1, b: 20 };
```

## 나머지 매개변수 (Rest Parameters)

```javascript
// 가변 인수 함수
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3, 4, 5); // 15

// 일부 매개변수와 함께 사용
function logMessages(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}

logMessages('INFO', '첫 번째 메시지', '두 번째 메시지');
```

## 클래스 (Classes)

```javascript
// ES6+ 클래스
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // 메서드
  greet() {
    return `안녕하세요, ${this.name}입니다.`;
  }

  // 정적 메서드
  static createAdult(name) {
    return new Person(name, 18);
  }

  // getter
  get info() {
    return `${this.name} (${this.age}세)`;
  }

  // setter
  set age(value) {
    if (value < 0) throw new Error('나이는 음수일 수 없습니다.');
    this._age = value;
  }
}

// 상속
class Developer extends Person {
  constructor(name, age, language) {
    super(name, age);
    this.language = language;
  }

  code() {
    return `${this.name}이(가) ${this.language}로 코딩 중입니다.`;
  }
}
```

## 프로미스 (Promises)

```javascript
// 프로미스 생성
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.send();
  });
}

// 프로미스 사용
fetchData('/api/users')
  .then(users => console.log(users))
  .catch(error => console.error(error));

// 프로미스 체이닝
fetchData('/api/users')
  .then(users => users.filter(user => user.active))
  .then(activeUsers => console.log(activeUsers))
  .catch(error => console.error(error));
```

## async/await

```javascript
// async 함수
async function getUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('사용자 정보를 가져오는데 실패했습니다:', error);
    throw error;
  }
}

// 병렬 처리
async function getMultipleUsers(ids) {
  const promises = ids.map(id => getUser(id));
  const users = await Promise.all(promises);
  return users;
}
```

## 모듈 (Modules)

```javascript
// math.js - 모듈 내보내기
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 기본 내보내기
export default function subtract(a, b) {
  return a - b;
}
```

```javascript
// main.js - 모듈 가져오기
import subtract, { PI, add, multiply } from './math.js';

// 전체 가져오기
import * as MathUtils from './math.js';

// 동적 가져오기
async function loadMath() {
  const mathModule = await import('./math.js');
  return mathModule;
}
```

## Map과 Set

### Map
```javascript
const map = new Map();

// 설정
map.set('name', '김맵');
map.set(1, 'one');
map.set(true, 'boolean');

// 가져오기
console.log(map.get('name')); // '김맵'
console.log(map.has('name')); // true
console.log(map.size); // 3

// 반복
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}
```

### Set
```javascript
const set = new Set();

// 추가
set.add(1);
set.add(2);
set.add(2); // 중복 무시

console.log(set.size); // 2
console.log(set.has(1)); // true

// 배열에서 중복 제거
const numbers = [1, 2, 2, 3, 3, 4];
const uniqueNumbers = [...new Set(numbers)]; // [1, 2, 3, 4]
```

## 마무리

ES6+ 기능들은 현대 JavaScript 개발의 핵심입니다. 이러한 기능들을 잘 활용하면 더 깔끔하고 효율적인 코드를 작성할 수 있습니다. 점진적으로 적용해보면서 익숙해지는 것이 중요합니다.