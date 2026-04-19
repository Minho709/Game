# Git / GitHub Workflow Guide

`Game` 레포를 운영할 때 참고하는 실전 가이드입니다.

이 문서는 다음 상황에서 다시 보면 좋습니다.

- 브랜치를 어떻게 파야 하는지 헷갈릴 때
- PR을 언제 올려야 하는지 애매할 때
- 커밋 메시지를 어떻게 써야 할지 고민될 때
- 나중에 다른 사람과 협업하게 될 때

---

## 1. 기본 원칙

- `main`은 가능한 안정적인 상태로 유지한다
- 기능 추가나 버그 수정은 브랜치에서 작업한다
- 의미 있는 변경은 PR을 통해 `main`에 합친다
- 한 PR은 하나의 목적만 담는다
- 커밋은 "의미 단위"로 나눈다

짧게 기억하면:

`작업은 브랜치에서, 정리는 PR에서, main은 안정적으로`

---

## 2. 브랜치 이름 규칙

추천 규칙:

- `feature/...` : 새 기능
- `fix/...` : 버그 수정
- `docs/...` : 문서 수정
- `chore/...` : 설정, 정리, 관리 작업

예시:

- `feature/desk-clear-sound`
- `feature/desk-clear-scoreboard`
- `feature/desk-clear-wind-disturbance`
- `fix/desk-clear-drag-threshold`
- `docs/update-readme`
- `chore/add-root-gitignore`

브랜치 이름은 길어도 괜찮지만, `무슨 작업인지 바로 보이는 것`이 중요합니다.

---

## 3. 언제 main에 바로 커밋해도 되나

혼자 작업할 때는 아주 작은 수정만 `main` 직커밋을 허용해도 됩니다.

예:

- 오타 수정
- 짧은 README 수정
- 아주 작은 설정 파일 수정

하지만 아래는 브랜치 + PR 추천입니다.

- 게임 기능 추가
- 입력 방식 변경
- 점수 시스템 수정
- 방해 요소 추가
- UI 구조 변경
- 배포 관련 변경

기준은 간단합니다.

`기능이나 동작에 영향이 있으면 브랜치에서 작업한다`

---

## 4. 실전 운영 가이드

가장 추천하는 흐름:

1. `main` 최신화
2. 새 브랜치 생성
3. 작업
4. 커밋
5. 원격 브랜치 push
6. GitHub에서 PR 생성
7. 검토 후 merge
8. 브랜치 정리

### 기본 명령어 흐름

```bash
git checkout main
git pull
git checkout -b feature/desk-clear-sound
```

작업 후:

```bash
git add .
git commit -m "Add sound feedback to Desk Clear"
git push -u origin feature/desk-clear-sound
```

그 다음 GitHub에서 PR 생성

merge 후:

```bash
git checkout main
git pull
git branch -d feature/desk-clear-sound
```

---

## 5. 커밋 메시지 규칙

좋은 커밋 메시지는 `무엇을 바꿨는지`가 바로 보여야 합니다.

좋은 예:

- `Add sound feedback to Desk Clear`
- `Fix delayed click handling in drag input`
- `Implement disturbance manager for Desk Clear`
- `Add repository .gitignore`

나쁜 예:

- `update`
- `fix`
- `change`
- `final`

추천 형식:

`동사 + 대상 + 목적(선택)`

예:

- `Adjust drag threshold for better click responsiveness`
- `Add disturbance warning toasts`
- `Refine item variations for office theme`

---

## 6. 커밋은 어떻게 나눌까

좋은 기준은 `의미 단위`입니다.

좋은 예:

- 드래그 입력 개선
- 메일 방해 요소 추가
- README 수정

좋지 않은 예:

- 입력 수정 + UI 수정 + 문서 수정 + 방해 요소 추가를 한 커밋에 섞기

원칙:

- 한 커밋 = 한 의도

---

## 7. PR이란 무엇인가

PR(Pull Request)은

`내 브랜치의 변경사항을 main에 합쳐달라고 요청하는 절차`

입니다.

커밋과 PR의 차이:

- 커밋: 작업 기록 1개
- PR: 브랜치 전체 변경을 합치기 위한 요청

즉:

- 커밋은 작업 단위
- PR은 기능 단위

---

## 8. PR은 언제 올릴까

아래 경우 PR 추천:

- 기능 하나가 끝났을 때
- 버그 수정이 끝났을 때
- main에 합칠 만한 상태가 되었을 때

아래 경우는 PR 강력 추천:

- 동작이 바뀌는 수정
- 게임 UX가 바뀌는 수정
- 배포 전 핵심 변경
- 다른 사람과 협업 중인 경우

---

## 9. 좋은 PR 제목

좋은 예:

- `Add sound feedback to Desk Clear`
- `Fix delayed click response in drag input`
- `Implement Supabase scoreboard for Desk Clear`

좋지 않은 예:

- `update`
- `fix code`
- `final version`

PR 제목도 커밋 메시지처럼 `무엇이 바뀌는지`가 드러나야 합니다.

---

## 10. PR 설명 템플릿

혼자 작업할 때도 아래 형식이 가장 좋습니다.

```md
## What
- 무엇을 바꿨는지

## Why
- 왜 바꿨는지

## How to test
- 어떻게 확인하면 되는지

## Notes
- 남은 이슈나 주의사항
```

예시:

```md
## What
- Adjusted drag threshold from 5 to 7
- Kept click-first input behavior

## Why
- Clicks felt delayed because dragging was triggered too easily

## How to test
- Click an item without moving: it should select immediately
- Drag an item slightly: it should not start dragging too early
- Drag clearly: it should move as expected

## Notes
- Threshold may still need minor tuning on trackpads
```

---

## 11. merge 방식 추천

GitHub에는 보통 세 가지 merge 방식이 있습니다.

### 1. Merge commit

브랜치 히스토리를 그대로 남깁니다.

장점:

- 작업 흐름 보존

단점:

- 히스토리가 지저분해질 수 있음

### 2. Squash and merge

브랜치 안의 여러 커밋을 하나로 합쳐서 `main`에 넣습니다.

장점:

- 히스토리가 깔끔함
- 개인 프로젝트에 적합

단점:

- 브랜치 내부 세부 커밋은 main에서 사라짐

### 3. Rebase and merge

커밋을 직선형 히스토리로 붙입니다.

장점:

- 매우 깔끔한 히스토리

단점:

- 초반엔 이해하기 조금 어려울 수 있음

### 현재 추천

이 레포는 당분간 `Squash and merge` 추천

이유:

- 기능 단위로 깔끔하게 남기기 좋음
- 개인 프로젝트 운영에 가장 무난함

---

## 12. 혼자 작업할 때 추천 규칙

- 작은 수정은 `main` 직커밋 가능
- 기능 작업은 브랜치 사용
- 기능 하나 끝날 때마다 PR 생성
- merge는 `Squash and merge`
- merge 후 브랜치 삭제

짧게 기억하면:

- `문서/오타`: main 가능
- `기능/버그`: 브랜치 + PR

---

## 13. 협업할 때 추천 규칙

나중에 다른 사람과 협업할 때는 아래 규칙 권장:

- `main` 직접 push 금지
- 모든 작업은 브랜치에서 진행
- PR 통해서만 merge
- 리뷰 없이 큰 변경 merge 금지
- PR 하나에 여러 기능 섞지 않기
- 테스트 방법을 PR에 반드시 적기

아주 중요한 원칙:

`한 PR = 한 목적`

좋은 예:

- 입력 수정 PR
- 사운드 추가 PR
- 스코어보드 PR

---

## 14. 충돌(conflict)이 났을 때

충돌은 보통 같은 파일의 같은 부분을 서로 다르게 수정했을 때 생깁니다.

기본 대응:

1. 현재 충돌 파일 확인
2. 어느 내용이 맞는지 판단
3. 수동으로 정리
4. `git add`
5. rebase 또는 merge 계속 진행

중요:

- 무조건 덮어쓰지 말 것
- 내 변경 + 상대 변경 중 무엇이 맞는지 확인할 것
- README, 설정 파일, 같은 UI 파일에서 자주 발생함

---

## 15. 작업 시작 전에 보면 좋은 체크리스트

- 지금 작업은 `main`에서 바로 해도 되는가?
- 기능 변경이면 브랜치를 새로 파야 하는가?
- 브랜치 이름이 작업 내용을 잘 설명하는가?
- 이 변경은 PR 제목으로 한 줄 설명 가능한가?

한 줄 설명이 안 되면, 작업 범위가 너무 클 가능성이 큽니다.

---

## 16. 작업 끝난 뒤 체크리스트

- 변경 범위가 이번 작업 목적과 일치하는가?
- 불필요한 파일이 섞이지 않았는가?
- 커밋 메시지가 명확한가?
- PR 설명에 `What / Why / How to test`가 들어갔는가?
- merge 후 브랜치 정리를 했는가?

---

## 17. 이 레포에서 추천하는 실제 패턴

`Desk clear(Web)` 관련 브랜치 예시:

- `feature/desk-clear-sound`
- `feature/desk-clear-scoreboard`
- `feature/desk-clear-wind-disturbance`
- `feature/desk-clear-zone-shift`
- `fix/desk-clear-click-delay`
- `fix/desk-clear-drag-threshold`

---

## 18. 자주 쓰는 명령어 모음

### 상태 확인

```bash
git status
```

### 브랜치 확인

```bash
git branch
```

### 새 브랜치 생성 + 이동

```bash
git checkout -b feature/desk-clear-sound
```

### 변경 추가

```bash
git add .
```

### 커밋

```bash
git commit -m "Add sound feedback to Desk Clear"
```

### 원격 push

```bash
git push -u origin feature/desk-clear-sound
```

### main 최신화

```bash
git checkout main
git pull
```

### 로컬 브랜치 삭제

```bash
git branch -d feature/desk-clear-sound
```

---

## 19. 최종 추천 운영 방식

현재 `Game` 레포 운영 추천:

- `main`은 안정 버전
- 기능 작업은 `feature/...`
- 버그 수정은 `fix/...`
- PR 제목은 기능 중심으로 명확하게
- merge는 `Squash and merge`
- merge 후 브랜치 삭제

---

## 20. 한 줄 요약

기억이 안 날 때는 이것만 보면 됩니다.

1. 기능 작업이면 브랜치 판다
2. 커밋은 의미 단위로 한다
3. GitHub에 push 후 PR 만든다
4. PR에는 `What / Why / How to test`를 쓴다
5. `Squash and merge`로 main에 합친다
6. merge 후 브랜치 정리한다

