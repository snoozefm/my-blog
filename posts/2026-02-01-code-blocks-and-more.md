---
title: 코드 블록과 그 밖의 것들
date: 2026-02-01
excerpt: 인용문, 구분선, 그리고 여러 언어의 코드 문법 강조를 테스트해봅니다.
---

이번 글에서는 몇 가지 마크다운 요소를 더 살펴봅니다.

1. 번호 목록 항목 하나
2. 번호 목록 항목 둘
3. 번호 목록 항목 셋

> 좋은 코드는 설명이 필요 없는 코드다.

---

## Python

```python
def fibonacci(n):
    # 피보나치 수열
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
```

## Bash

```bash
#!/bin/bash
for file in *.md; do
  echo "processing $file"
done
```

## JSON

```json
{
  "name": "my-blog",
  "version": "1.0.0",
  "private": true
}
```

## 지원하지 않는 언어 (폴백 확인용)

```ruby
def hello
  puts "hello"
end
```

지원하지 않는 언어는 문법 강조 없이 그대로 표시되어야 합니다.
