# CG Town 작업 계획

## 완료된 작업
- [x] 프로젝트 세팅 및 실행 (Next.js + FastAPI + Supabase)
- [x] 백엔드 JWT 인증 미들웨어 (api/deps.py, api/router.py)
- [x] WebSocket 실시간 멀티플레이어 (ws/manager.py, ws/endpoint.py)
- [x] 프론트엔드 멀티플레이어 훅 (useMultiplayer.ts, RemoteCharacter.tsx)
- [x] 타일 기반 그리드 이동 시스템 (64px 타일, 24x12 그리드)
- [x] 랜덤 스폰 + 충돌 감지 (서버사이드)
- [x] 캐릭터 이름 표시
- [x] 대표님 계정 생성 (psc@ihopper.co.kr / CgTown2026@ / 박선춘)
- [x] 마지막 방향 포즈 유지 (키 떼도 방향 유지)
- [x] Space키 → default 포즈 전환
- [x] 위치 저장/복원 (user_metadata 사용, ADR: docs/decisions/001)
- [x] 비밀번호 재설정 기능 (/auth/reset-password)
- [x] **Phaser.js 마이그레이션** (ADR: docs/decisions/003)
  - [x] Phaser 설치 및 PhaserGame 브릿지 컴포넌트
  - [x] EventBus 통신 (React ↔ Phaser)
  - [x] 로컬 플레이어 키보드 이동
  - [x] 원격 플레이어 Tween 보간 (부드러운 이동)
  - [x] 연결 상태 UI 오버레이

## 미완료 작업

### Phaser 마이그레이션 남은 작업
- [ ] 타일맵 적용 (Tiled 에디터)
- [ ] 스프라이트시트 애니메이션 (현재는 개별 이미지)
- [ ] 기존 React 캐릭터 컴포넌트 삭제 정리

### 기능 개선
- [ ] 45도 포즈 (낮은 우선순위)
- [ ] AI NPC 확장 (FastAPI + LangGraph)

## 기술 메모
- Supabase: anon key만 보유, service role key 없음
- DB 테이블: 없음 (auth만 사용 중)
- 포트: 백엔드 8000, 프론트엔드 3000
- WS 인증 실패(4001) 시 재연결 안 하도록 수정 완료

### Phaser 관련
- **임포트**: `import * as Phaser from 'phaser'` (default export 없음)
- **SSR 비활성화**: `dynamic(() => import(...), { ssr: false })`
- **게임 설정**: 1536x768 (24x12 그리드, 64px 타일)
- **보간**: Phaser.Tweens 사용 (150ms duration)

### 주요 파일 구조
```
frontend/
├── components/PhaserGame.tsx    # Phaser 게임 + MainScene
├── lib/EventBus.ts              # React ↔ Phaser 통신
├── lib/gameConfig.ts            # 타일/그리드 설정
├── hooks/useMultiplayer.ts      # WebSocket 멀티플레이어
└── app/page.tsx                 # 메인 (dynamic import)
```

### ADR 문서
- `docs/decisions/001-user-metadata-for-position.md` - 위치 저장 방식
- `docs/decisions/002-responsive-game-scale.md` - 반응형 스케일 (deprecated)
- `docs/decisions/003-phaser-migration-plan.md` - Phaser 마이그레이션
