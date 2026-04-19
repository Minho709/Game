# Git / GitHub Quick Guide for Notion

이 문서는 `Game` 레포를 운영할 때 자주 다시 보기 위한 노션용 요약 가이드입니다.

상세 설명이 필요하면 `GIT_GITHUB_WORKFLOW_GUIDE.md`를 참고합니다.

---

## 한눈에 보는 원칙

- `main`은 가능한 안정적으로 유지한다
- 기능 작업은 브랜치에서 한다
- 기능 단위로 PR을 만든다
- `한 PR = 한 목적`을 지킨다
- merge는 기본적으로 `Squash and merge`를 쓴다

짧게 기억하면:

`작업은 브랜치에서, 정리는 PR에서, main은 안정적으로`

---

## 가장 추천하는 실전 흐름

1. `main` 최신화
2. 새 브랜치 생성
3. 작업
4. 커밋
5. 원격 push
6. PR 생성
7. merge
8. 브랜치 삭제

기본 명령어:

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

merge 후:

```bash
git checkout main
git pull
git branch -d feature/desk-clear-sound
```

---

## 브랜치 이름 규칙

- `feature/...` : 새 기능
- `fix/...` : 버그 수정
- `docs/...` : 문서 수정
- `chore/...` : 설정/정리 작업

예시:

- `feature/desk-clear-sound`
- `feature/desk-clear-scoreboard`
- `feature/desk-clear-wind-disturbance`
- `fix/desk-clear-click-delay`
- `fix/desk-clear-drag-threshold`
- `docs/update-readme`

원칙:

`브랜치 이름만 봐도 무슨 작업인지 보여야 한다`

---

## 언제 main에 바로 커밋해도 되나

가능:

- 오타 수정
- 짧은 문서 수정
- 아주 작은 설정 수정

브랜치 추천:

- 기능 추가
- 버그 수정
- 입력/점수/UI 동작 변경
- 배포 관련 수정
- 방해 요소 추가

기준:

`동작이 바뀌면 브랜치에서 작업한다`

---

## 좋은 커밋 메시지

좋은 예:

- `Add sound feedback to Desk Clear`
- `Fix delayed click handling in drag input`
- `Implement disturbance manager for Desk Clear`
- `Add repository .gitignore`

나쁜 예:

- `update`
- `fix`
- `change`

원칙:

`무엇을 바꿨는지 한 줄로 보여야 한다`

---

## PR이란

PR(Pull Request)은

`브랜치에서 작업한 내용을 main에 합쳐달라고 요청하는 절차`

입니다.

차이:

- 커밋: 작업 기록 1개
- PR: 브랜치 전체 변경을 합치는 요청

---

## PR 제목 예시

- `Add sound feedback to Desk Clear`
- `Fix delayed click response in drag input`
- `Implement Supabase scoreboard for Desk Clear`

나쁜 예:

- `update`
- `fix code`
- `final`

---

## PR 설명 템플릿

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

## merge 방식 추천

추천:

- `Squash and merge`

이유:

- main 히스토리가 깔끔해짐
- 기능 단위로 정리하기 좋음
- 개인 프로젝트에 가장 무난함

---

## 혼자 작업할 때 규칙

- 작은 수정은 `main`도 가능
- 기능 작업은 브랜치 사용
- 기능 하나 끝날 때마다 PR 생성
- merge 후 브랜치 삭제

짧게:

- `문서/오타`: main 가능
- `기능/버그`: 브랜치 + PR

---

## 협업할 때 규칙

- `main` 직접 push 금지
- 모든 작업은 브랜치에서
- PR 통해서만 merge
- 큰 변경은 리뷰 후 merge
- `한 PR = 한 목적`
- PR에 테스트 방법 필수

---

## 충돌(conflict) 나면

1. 충돌 파일 확인
2. 어떤 내용이 맞는지 판단
3. 수동으로 정리
4. `git add`
5. merge 또는 rebase 계속 진행

원칙:

`무조건 덮어쓰지 말고, 어떤 변경이 맞는지 확인한다`

---

## 자주 쓰는 명령어

상태 확인:

```bash
git status
```

브랜치 확인:

```bash
git branch
```

새 브랜치 생성:

```bash
git checkout -b feature/desk-clear-sound
```

커밋:

```bash
git add .
git commit -m "Add sound feedback to Desk Clear"
```

원격 push:

```bash
git push -u origin feature/desk-clear-sound
```

main 최신화:

```bash
git checkout main
git pull
```

로컬 브랜치 삭제:

```bash
git branch -d feature/desk-clear-sound
```

---

## 작업 시작 전 체크리스트

- 이 작업은 main에 바로 해도 되는가?
- 기능 변경이면 브랜치를 새로 파야 하는가?
- 브랜치 이름이 작업 내용을 설명하는가?
- 이 작업은 PR 제목으로 한 줄 설명 가능한가?

---

## 작업 끝난 뒤 체크리스트

- 이번 작업 목적과 변경 범위가 맞는가?
- 불필요한 파일이 섞이지 않았는가?
- 커밋 메시지가 명확한가?
- PR 설명에 `What / Why / How to test`가 들어갔는가?
- merge 후 브랜치를 정리했는가?

---

## 이 레포에서 추천하는 패턴

- `main` : 안정 버전
- `feature/...` : 기능 개발
- `fix/...` : 버그 수정
- `docs/...` : 문서 수정
- merge는 `Squash and merge`

예시:

- `feature/desk-clear-sound`
- `feature/desk-clear-scoreboard`
- `feature/desk-clear-zone-shift`
- `fix/desk-clear-drag-threshold`

---

## 마지막 한 줄 요약

1. 기능이면 브랜치 판다
2. 커밋은 의미 단위로 한다
3. push 후 PR 만든다
4. PR에는 `What / Why / How to test`를 쓴다
5. `Squash and merge`로 합친다
6. 브랜치 정리한다

