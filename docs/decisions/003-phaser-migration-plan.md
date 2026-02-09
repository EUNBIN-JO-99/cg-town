# 003. Phaser.js 마이그레이션 계획

## 상태
**진행 중** (Phase 1 완료, Phase 3-4 부분 완료)

## 날짜
2025-02-08 (최종 수정: 2026-02-08)

## 맥락
- 현재 React + CSS transform으로 캐릭터 렌더링 중
- 문제점: 스케일 불일치, 카메라 시스템 없음, 타일맵 미지원
- 목표: Phaser.js 도입으로 게임 엔진 기능 활용

## 결정
**Phaser 공식 Next.js 템플릿 기반 마이그레이션** + **FastAPI WebSocket 유지**

---

## 아키텍처

### 레이어 구조
```
┌─────────────────────────────────────────────────┐
│  React Layer (UI)                               │
│  - 연결 상태, 채팅, 메뉴, HUD                     │
│  - dynamic import + ssr: false                  │
├─────────────────────────────────────────────────┤
│  EventBus (통신)                                 │
│  - React ↔ Phaser 이벤트 전달                    │
├─────────────────────────────────────────────────┤
│  Phaser Layer (게임)                             │
│  - 타일맵, 캐릭터 스프라이트, 물리 엔진           │
│  - 카메라 시스템, 애니메이션                      │
├─────────────────────────────────────────────────┤
│  FastAPI WebSocket (백엔드)                      │
│  - 위치 동기화, 인증, AI NPC 확장 대비            │
└─────────────────────────────────────────────────┘
```

### 파일 구조 (마이그레이션 후)
```
frontend/
├── app/
│   └── page.tsx              # PhaserGame 동적 import
├── game/
│   ├── main.ts               # Phaser 게임 설정
│   ├── EventBus.ts           # React-Phaser 통신
│   ├── scenes/
│   │   ├── Boot.ts           # 에셋 로딩
│   │   ├── Preloader.ts      # 로딩 화면
│   │   └── GameScene.ts      # 메인 게임
│   └── sprites/
│       ├── Player.ts         # 로컬 플레이어
│       └── RemotePlayer.ts   # 원격 플레이어 (보간 포함)
├── components/
│   ├── PhaserGame.tsx        # Phaser 브릿지 (dynamic import)
│   └── UI/
│       └── ConnectionStatus.tsx
├── hooks/
│   └── useMultiplayer.ts     # WebSocket (EventBus 연동)
└── lib/
    └── gameConfig.ts         # 공통 설정
```

---

## 핵심 구현 사항

### 1. 보간(Interpolation) 로직 - Gemini 피드백 반영

**문제**: 서버에서 받은 좌표를 즉시 대입하면 네트워크 지연으로 순간이동처럼 보임

**해결**: RemotePlayer 스프라이트에 Lerp 적용

```typescript
// game/sprites/RemotePlayer.ts
export class RemotePlayer extends Phaser.GameObjects.Sprite {
  private targetX: number = 0
  private targetY: number = 0
  private lerpSpeed: number = 0.15  // 보간 속도

  // 서버에서 새 위치 수신 시
  setTargetPosition(gridX: number, gridY: number) {
    this.targetX = gridX * TILE_SIZE
    this.targetY = gridY * TILE_SIZE
  }

  // Phaser update() 루프에서 매 프레임 호출
  update() {
    // 현재 위치에서 목표 위치로 부드럽게 이동
    this.x = Phaser.Math.Linear(this.x, this.targetX, this.lerpSpeed)
    this.y = Phaser.Math.Linear(this.y, this.targetY, this.lerpSpeed)
  }
}
```

### 2. SSR 비활성화 - Gemini 피드백 반영

**문제**: Phaser는 브라우저 전용 (Window 객체 필요), Next.js SSR과 충돌

**해결**: dynamic import + ssr: false

```typescript
// app/page.tsx
import dynamic from 'next/dynamic'

const PhaserGame = dynamic(
  () => import('@/components/PhaserGame'),
  { ssr: false }
)

export default function Home() {
  return (
    <>
      <ConnectionStatus />
      <PhaserGame />
    </>
  )
}
```

### 3. 에셋 경로 관리 - Gemini 피드백 반영

**문제**: Vercel 배포 시 Phaser load.image() 경로와 Next.js public 폴더 충돌

**해결**: 환경 변수 기반 절대 경로

```typescript
// game/scenes/Boot.ts
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

export class Boot extends Phaser.Scene {
  preload() {
    this.load.setBaseURL(BASE_URL)
    this.load.image('tileset', '/images/tileset.png')
    this.load.tilemapTiledJSON('map', '/maps/main.json')
    this.load.spritesheet('player', '/images/player.png', {
      frameWidth: 64,
      frameHeight: 64
    })
  }
}
```

```env
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# .env.production (Vercel)
NEXT_PUBLIC_BASE_URL=https://cg-town.vercel.app
```

### 4. EventBus 통신

```typescript
// game/EventBus.ts
import Phaser from 'phaser'
export const EventBus = new Phaser.Events.EventEmitter()

// 이벤트 타입
// React → Phaser
// - 'remote-player-update': { userId, position }
// - 'remote-player-join': { userId, userInfo, position }
// - 'remote-player-leave': { userId }

// Phaser → React
// - 'local-player-move': { gridX, gridY, direction }
// - 'scene-ready': void
```

### 5. useMultiplayer 수정

```typescript
// hooks/useMultiplayer.ts (수정)
import { EventBus } from '@/game/EventBus'

// 기존 WebSocket 로직 유지 + EventBus 연동
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)

  switch (data.type) {
    case 'player_moved':
      // React 상태 대신 EventBus로 전달
      EventBus.emit('remote-player-update', {
        userId: data.user_id,
        position: data.position
      })
      break
    // ...
  }
}

// Phaser에서 로컬 플레이어 이동 시
EventBus.on('local-player-move', ({ gridX, gridY, direction }) => {
  sendPosition(gridX, gridY, direction)
})
```

---

## Supabase Realtime vs FastAPI WebSocket 검토

| 항목 | Supabase Realtime | FastAPI WebSocket |
|------|-------------------|-------------------|
| 장점 | 백엔드 코드 감소 | 이미 구현됨, 확장성 |
| 단점 | 복잡한 로직 제한 | 서버 유지 필요 |
| AI NPC | 어려움 | LangGraph 연동 용이 |
| 게임 로직 | DB 트리거 필요 | 자유로운 구현 |

**결론**: FastAPI 유지. AI NPC, 복잡한 게임 로직 확장 대비.

---

## 마이그레이션 단계

### Phase 1: Phaser 세팅 (1일) ✅ 완료
- [x] Phaser 설치 및 기본 구조 생성
- [x] PhaserGame 브릿지 컴포넌트 (dynamic import)
- [x] EventBus 설정
- [x] 기본 Scene 구조 (Boot, Preloader, GameScene)
- [x] **임포트 에러 수정**: `import * as Phaser from 'phaser'`

### Phase 2: 타일맵 적용 (1일) ⏳ 대기
- [ ] Tiled 에디터로 맵 제작 (또는 기존 배경 활용)
- [ ] 타일맵 로딩 및 렌더링
- [ ] 카메라 설정 (월드 바운드, 줌)

### Phase 3: 플레이어 마이그레이션 (1일) ✅ 완료
- [x] Player 스프라이트 클래스 (키보드 입력) - MainScene 내부 구현
- [x] RemotePlayer 스프라이트 클래스 (Tween 보간 적용)
- [ ] 스프라이트시트 애니메이션 (개별 이미지 사용 중)

### Phase 4: 멀티플레이어 연동 (1일) ✅ 완료
- [x] useMultiplayer EventBus 연동
- [x] 원격 플레이어 동기화 (Tween으로 부드러운 이동)
- [x] 연결 상태 UI

### Phase 5: 정리 (0.5일) ⏳ 부분 완료
- [ ] 기존 React 캐릭터 컴포넌트 삭제 (Character.tsx, RemoteCharacter.tsx)
- [ ] useGameScale, GameScaleContext 삭제
- [x] 문서 업데이트

---

## 실제 구현 사항 (계획 대비 변경점)

### 1. 인라인 Scene 방식 채택
계획에서는 `game/` 폴더에 분리된 Scene 파일을 두었지만, 실제 구현은 `PhaserGame.tsx` 내부에 `MainScene` 클래스를 인라인으로 정의했습니다.

**이유**: React props와의 긴밀한 연동 필요 (remotePlayers, myName, onPositionChange 등)

**구조**:
```
components/PhaserGame.tsx
├── MainScene (class) - Phaser 씬
│   ├── preload() - 에셋 로딩
│   ├── create() - 게임 오브젝트 생성
│   ├── update() - 입력 처리
│   └── handleRemotePlayersUpdate() - 원격 플레이어 동기화
└── PhaserGame (component) - React 브릿지
```

### 2. Lerp 대신 Tween 사용
원래 계획: Phaser.Math.Linear (Lerp)로 매 프레임 보간
실제 구현: Phaser.Tweens로 자동 애니메이션

```typescript
// 원격 플레이어 이동 시
this.tweens.add({
  targets: container,
  x: targetX,
  y: targetY,
  duration: 150,
  ease: 'Linear'
})
```

**장점**: update()에서 수동 계산 불필요, 코드 간결

### 3. game/ 폴더 파일 (미사용, 참고용)
다음 파일들은 생성되었지만 현재 사용되지 않음:
- `game/main.ts`
- `game/EventBus.ts` (lib/EventBus.ts 사용)
- `game/scenes/Boot.ts`, `Preloader.ts`, `GameScene.ts`
- `game/sprites/Player.ts`, `RemotePlayer.ts`

추후 게임 규모가 커지면 씬/스프라이트 분리 시 참고 가능.

---

## 삭제되는 파일
- `components/Character.tsx`
- `components/RemoteCharacter.tsx`
- `hooks/useGameScale.ts`
- `contexts/GameScaleContext.tsx`

## 유지되는 파일
- `hooks/useMultiplayer.ts` (EventBus 연동 추가)
- `lib/gameConfig.ts` (Phaser config로 확장)
- `backend/*` (전체 유지)

---

## 리스크

| 리스크 | 대응 |
|--------|------|
| Phaser 러닝 커브 | 공식 템플릿/문서 참고 |
| SSR 충돌 | dynamic import 필수 |
| 에셋 경로 문제 | BASE_URL 환경변수 |
| 네트워크 지연 | 보간(Lerp) 로직 |

---

## 참고 자료
- [Phaser 공식 Next.js 템플릿](https://github.com/phaserjs/template-nextjs)
- [Phaser 3 문서](https://newdocs.phaser.io/docs/3.86.0)
- [Tiled 맵 에디터](https://www.mapeditor.org/)
