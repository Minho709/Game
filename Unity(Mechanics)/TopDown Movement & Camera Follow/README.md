# TopDown Movement & Camera Follow

## 개요 / Overview
Unity 2022.3 LTS 기반 격자 탑뷰 이동 및 카메라 추적 구현입니다.
Grid-based top-down movement and camera follow system built with Unity 2022.3 LTS.

---

## 개발 환경 / Environment
| 항목 | 버전 |
|------|------|
| Unity | 2022.3 LTS |
| Render Pipeline | URP 2D |
| Input System | New Input System |
| Language | C# |

---

## 구현 내용 / Features

### PlayerController.cs
- 격자(타일) 기반 상하좌우 이동 / Grid-based movement (Up/Down/Left/Right)
- 이동 중 방향 전환 시 현재 칸 완료 후 전환 / Direction change after tile completion
- 달리기 (Shift) / Run (Shift)
- Raycast 기반 벽 충돌 감지 (Wall Layer) / Wall collision detection via Raycast
- 선택 키로 앞 오브젝트 상호작용 (Z, Space) / Object interaction via select key

### CameraController.cs
- 플레이어 추적 / Player follow
- 맵 경계 클램핑 / Map boundary clamping
- 맵이 카메라보다 작을 경우 중앙 고정 / Center lock when map is smaller than camera view

---

## 조작키 / Controls
| 기능 / Action | 키 / Key |
|------|------|
| 이동 / Move | 방향키 / Arrow Keys |
| 달리기 / Run | Shift |
| 상호작용 / Interact | Z, Space |

---

## 참고 / Notes
- Unity 6에서의 동작은 미확인 / Not tested on Unity 6
