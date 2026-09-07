# 2048 게임 구현(Build) 작업 지침

## 배경
`my-blog` 프로젝트는 마크다운 블로그 + 미니 웹앱 포트폴리오다. 프로젝트 루트의 `CLAUDE.md`에 정의된 Plan → Build → Review → Embed 사이클 중 지금은 **Build** 단계다. Plan 단계에서 작성되고 사용자 승인을 받은 계획이 `C:\Users\SNOO\Desktop\my-blog\apps\2048\spec.md`에 있다.

## 해야 할 일
1. `C:\Users\SNOO\Desktop\my-blog\apps\2048\spec.md`를 정독한다.
2. spec.md에 명시된 대로 다음 3개 파일을 작성한다.
   - `C:\Users\SNOO\Desktop\my-blog\apps\2048\index.html`
   - `C:\Users\SNOO\Desktop\my-blog\apps\2048\style.css`
   - `C:\Users\SNOO\Desktop\my-blog\apps\2048\game.js`
3. spec.md에 적힌 게임 규칙, 핵심 로직 설계(슬라이드/병합 통일 로직, 같은 턴 재병합 방지, 이동 처리 흐름, 점수판, 랜덤 타일 생성, 승패 판정), 입력 처리(키보드+터치 스와이프), 스타일(타일 색상, 반응형 레이아웃, 점수판/버튼 배치), 외부 의존성 없음 방침을 그대로 따른다. spec.md와 다르게 구현해야 할 합리적 이유가 있다면 그렇게 하되 무엇을 왜 다르게 했는지 최종 보고에 명시한다.
4. 구현 후, 로컬에서 직접 열어보거나 (가능하다면 `npx live-server` 등으로) 실행해서 기본 동작(타일 생성, 방향키로 이동/병합, 점수 갱신)에 명백한 오류가 없는지 스스로 한 번 점검한다. 단, 정식 브라우저 검증과 코드 리뷰는 이후 별도의 Review 서브에이전트가 담당하므로 여기서는 "명백히 깨진 상태로 넘기지 않는다" 정도의 가벼운 자체 점검만 하면 된다.

## 제약 (중요)
- **오직 `/apps/2048/` 폴더 안의 `index.html`, `style.css`, `game.js` 세 파일만 만들거나 수정한다.**
- 프로젝트 루트의 `build.js`, `lib/`, `public/`, `posts/`, 루트 `index.html`, `CLAUDE.md`, `.git`, `.claude` 등 그 어떤 다른 파일/폴더도 절대 건드리지 않는다.
- `spec.md`, `plan-instructions.md`, `build-instructions.md`는 참고만 하고 수정하지 않는다.
- 외부 라이브러리나 CDN을 사용하지 않는다 (spec.md 6번 항목 참고).

## 완료 후
만든 3개 파일 각각에 대해 무엇을 구현했는지, spec.md와 다르게 구현한 부분이 있다면 무엇이고 왜인지 요약해서 보고할 것.
