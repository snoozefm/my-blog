---
title: Hello World
date: 2026-01-15
excerpt: 첫 번째 글입니다. 이 블로그가 어떻게 만들어졌는지 간단히 소개합니다.
---

# 안녕하세요

이 블로그는 **마크다운 파일**을 읽어서 정적 HTML로 변환하는 작은 빌드 스크립트로 만들어졌습니다. 프레임워크는 전혀 사용하지 않고 순수 *HTML, CSS, JavaScript*로만 구현했습니다.

## 지원하는 문법

다음과 같은 기본적인 마크다운 문법을 지원합니다.

- 굵게, 기울임 같은 강조 표현
- [링크](https://example.com)와 이미지
- `인라인 코드`와 코드 블록
- 번호 목록과 불릿 목록

아래는 이미지 예시입니다.

![예시 이미지](data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect width='600' height='300' fill='%23888'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-size='24' text-anchor='middle' dominant-baseline='middle'%3E예시 이미지%3C/text%3E%3C/svg%3E)

코드 블록도 확인해봅시다.

```javascript
function greet(name) {
  // 간단한 인사 함수
  const message = `안녕하세요, ${name}님!`;
  console.log(message);
  return message;
}

greet("독자");
```

읽어주셔서 감사합니다.
