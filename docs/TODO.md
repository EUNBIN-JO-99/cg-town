# CG Town 작업 목록

> 최종 업데이트: 2026-02-09

---

## P0 — 지금 당장 (기반 작업)

### 맵/UI
| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 1 | 타일맵 꾸미기 (Sprout Lands 에셋 적용) | TODO | Tiled 에디터로 배경/오브젝트 배치, 현재 grass/river만 있음 |
| 2 | 충돌 레이어 설정 (벽, 물, 오브젝트) | TODO | 타일맵에 collision 레이어 추가 |

### 유저/세션
| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 3 | ~~로그아웃 기능~~ | DONE | 게임 페이지 + 도감 페이지에 로그아웃 버튼 추가 |
| 4 | ~~관리자 일괄 등록 스크립트~~ | DONE | `scripts/bulk-register.js` + CSV 기반, Secret key 사용 |
| 5 | ~~캐릭터 머리 위 상태 텍스트~~ | DONE | `status_message` 컬럼 + Phaser 노란색 텍스트 표시 |

---

## P1 — 중요 (핵심 기능)

### 도감 개선
| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 6 | 포켓몬 스타일 게임 UI | TODO | 도감 목록/상세 디자인 전면 개편 |
| 7 | ~~부서별 필터/그룹~~ | DONE | 부서 탭 pill 버튼 + NPC 별도 탭 |
| 8 | ~~기술스택 다중선택~~ | DONE | 태그 입력 방식 (기존 유지) |
| 9 | ~~프로젝트 다중선택~~ | DONE | 단일 텍스트 → 태그 다중 입력으로 변경 |
| 10 | ~~직급 + 직무 둘 다 사용~~ | DONE | `position`(직급) 컬럼 추가, 관리자 설정 (읽기전용) |
| 11 | ~~상태 입력 (휴가/외근/파견 등)~~ | DONE | 도감 편집에서 입력 (30자), 게임+도감에 표시 |

### NPC
| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 12 | ~~NPC 관리 방식 결정~~ | DONE | `is_npc` 플래그 방식으로 결정, 도감에서 NPC 탭 분리 |
| 13 | 지식베이스 구축 + RAG | TODO | 온보딩 문서 기반, LangGraph/LangChain 활용 |
| 14 | RAG 테스트 페이지 | TODO | 지식 입력 → 즉시 RAG 질의 테스트할 수 있는 어드민 페이지 |
| 15 | 정형데이터 질의 (TAG) | TODO | "서비스 개발 몇 명이야?" 같은 질문은 RAG 없이 DB 직접 조회 |
| 16 | NPC 채팅 UI | TODO | 게임 내 채팅창 여닫기, NPC 근처에서 대화 시작 |
| 17 | 입사 서류 다운로드 | TODO | NPC가 안내 + 파일 다운로드 링크 제공 |

---

## P2 — 보통 (테스트/프로토타입)

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 18 | ~~테스트 개발 폴더 구조~~ | DONE | `tests/` 하위 3개 폴더 생성 |
| 19 | 회의실 자동예약 기능 | TODO | `tests/meeting-room-booking/` |
| 20 | 오늘 식당 메뉴 스크래핑 | TODO | `tests/cafeteria-menu-scraper/` |
| 21 | NPC 말풍선 (공지/메뉴) | TODO | NPC가 주기적으로 공지사항이나 식당 메뉴를 읊음 |
| 22 | Phaser 스프라이트시트 애니메이션 | TODO | 현재 개별 이미지 → 걷기 애니메이션 적용 |
| 23 | ~~기존 React 캐릭터 컴포넌트 삭제~~ | DONE | Character.tsx, RemoteCharacter.tsx, game/ 폴더 등 -1666줄 정리 |

---

## P3 — 추후 개발

| # | 작업 | 상태 | 비고 |
|---|------|------|------|
| 24 | 인접 채팅 | TODO | 플레이어 간 일정 거리 이내에서만 채팅 가능 |
| 25 | 담타존 | TODO | 어두운 UI, 익명 채팅, 건의사항 남기기 |
| 26 | CG's Notes | TODO | 개인별 업무 노트 모아보기, 노션 연동 검토, 따봉 기능 |
| 27 | 공지사항 연동 (hiworks) | TODO | 나중에 hiworks API 연동 시 구현 |
| 28 | 45도 포즈 | TODO | 캐릭터 대각선 방향 이미지 |
| 29 | 아이디어 수집 체계 | TODO | 팀원 아이디어 모아보는 기능 |

---

## 결정 사항

| 주제 | 결정 | 비고 |
|------|------|------|
| 분야 vs 직급 | **둘 다 사용** | `field`(직무) + `position`(직급) 병행. 잘못 입력 시 본인이 수정 |
| NPC 관리 | **is_npc 플래그** | profiles 테이블에 `is_npc` boolean 추가, 도감에서 NPC 탭 분리 |
| 정형데이터 질의 | **TAG + RAG 하이브리드** | 단순 집계 → DB 직접 조회(TAG), 문서 기반 → RAG |
| 일괄 등록 | **Node.js 스크립트** | `scripts/bulk-register.js`, Secret key로 `auth.admin.createUser()` |
| 캐릭터 이미지 | **Supabase Storage** | `characters/{email_prefix}/{direction}.png` URL 자동 조합 |

---

## 완료된 작업

- [x] 프로젝트 세팅 (Next.js + FastAPI + Supabase)
- [x] JWT 인증 미들웨어
- [x] WebSocket 실시간 멀티플레이어
- [x] 타일 기반 그리드 이동 (64px, 24x12)
- [x] 랜덤 스폰 + 충돌 감지
- [x] 캐릭터 이름 표시
- [x] 방향 포즈 유지 + Space키 default 포즈
- [x] 위치 저장/복원 (user_metadata)
- [x] 비밀번호 재설정
- [x] Phaser.js 마이그레이션 (PhaserGame, EventBus, Tween 보간)
- [x] 직원 도감 기본 구현 (/dogam, /dogam/[id], /dogam/edit)
- [x] Supabase Storage 캐릭터 이미지 (email prefix 기반 URL)
- [x] 프로필 API (GET/PUT)
- [x] DB 스키마 확장 (tech_stack, field, project, tmi)
- [x] 에셋팩 추가 (Sprout Lands, Forest)
- [x] 로그아웃 기능 (게임 + 도감)
- [x] 일괄 등록 스크립트 (scripts/bulk-register.js)
- [x] DB 스키마: position, is_npc, status_message 추가
- [x] 상태 메시지 표시 (Phaser 머리 위 + 도감)
- [x] 도감 부서별 필터 + NPC 탭
- [x] 도감 편집 개선 (프로젝트 다중선택, 상태 입력, 직급 표시)
- [x] 미사용 React 컴포넌트 정리 (-1666줄)
- [x] tests/ 폴더 구조 생성
- [x] 문서화 (TODO.md, SETUP-GUIDE.md)
