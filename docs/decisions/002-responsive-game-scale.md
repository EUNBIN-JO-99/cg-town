# 002. 반응형 게임 스케일 시스템

## 상태
적용됨

## 날짜
2025-02-08

## 맥락
- 맵 크기: 1536px x 768px (24x12 그리드, 타일 64px)
- 캐릭터: 고정 픽셀 위치로 이동
- 문제: 화면 크기가 다르면 배경은 늘어나는데 캐릭터는 고정 위치라서 안 맞음
- 목표: 화면 크기에 맞게 배경과 캐릭터가 같은 비율로 스케일

## 결정

### 1. 레이어 구조 분리

```
┌─────────────────────────────────────────────────┐
│  배경 (fixed, 화면 전체 cover)                    │
│  ┌───────────────────────────────────────────┐  │
│  │  game-container (fixed, 투명)              │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  game-world (상대 위치, 스케일 적용)   │  │  │
│  │  │    - 캐릭터들 (absolute)              │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│  연결 상태 (fixed, 우측 상단)                     │
└─────────────────────────────────────────────────┘
```

### 2. 스케일 계산 방식

```typescript
// 화면에 맞게 contain 방식으로 스케일 계산
const scaleX = windowWidth / MAP_WIDTH   // 1536
const scaleY = windowHeight / MAP_HEIGHT // 768
const scale = Math.min(scaleX, scaleY)

// 중앙 정렬을 위한 오프셋
const displayWidth = MAP_WIDTH * scale
const displayHeight = MAP_HEIGHT * scale
const offsetX = (windowWidth - displayWidth) / 2
const offsetY = (windowHeight - displayHeight) / 2
```

### 3. 파일 구조

```
frontend/
├── hooks/
│   └── useGameScale.ts       # 스케일 계산 훅 (ResizeObserver)
├── contexts/
│   └── GameScaleContext.tsx  # 스케일 Context Provider
├── lib/
│   └── gameConfig.ts         # MAP_WIDTH, MAP_HEIGHT, BASE_CHARACTER_SIZE
├── components/
│   ├── Character.tsx         # 스케일 적용된 캐릭터
│   └── RemoteCharacter.tsx   # 스케일 적용된 원격 캐릭터
└── app/
    ├── page.tsx              # 레이어 구조
    └── globals.css           # game-container, game-world 스타일
```

## 구현 상세

### useGameScale.ts
- `ResizeObserver`로 화면 크기 변화 감지
- SSR 대비 `typeof window` 체크
- 초기값: `window.innerWidth/Height` 기반 계산

### GameScaleContext.tsx
- `GameScaleProvider`: game-container + game-world div 구조 제공
- `useGameScaleContext`: 하위 컴포넌트에서 scale 값 접근

### Character.tsx / RemoteCharacter.tsx
- 논리좌표(gridX * TILE_SIZE) → 렌더링좌표(논리좌표 * scale)
- 캐릭터 크기: BASE_CHARACTER_SIZE * scale
- Image 컴포넌트: `fill` + `unoptimized` (깜빡임 방지)

### globals.css
```css
.game-background-fullscreen {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-size: cover;  /* 화면 꽉 채움 */
  z-index: 0;
}

.game-container {
  position: fixed;
  background-color: transparent;  /* 배경 보이도록 */
  z-index: 1;
}

.game-world {
  position: relative;
  /* width, height, transform은 JS에서 동적 설정 */
}

.character {
  position: absolute;  /* game-world 기준 */
}
```

### page.tsx 레이어 순서
1. `game-background-fullscreen` (z-index: 0) - 배경, 화면 전체
2. 연결 상태 표시 (z-index: 100) - fixed, 우측 상단
3. `GameScaleProvider` (z-index: 1) - 캐릭터들

## 장점
- 화면 크기 변경해도 배경과 캐릭터 비율 일치
- 배경은 항상 화면 전체 채움 (cover)
- 캐릭터는 논리 좌표 기준으로 정확한 위치
- 타일맵 전환 시에도 동일한 스케일 시스템 재사용 가능

## 단점
- 스케일 계산 오버헤드 (미미함)
- 배경과 캐릭터 좌표계가 다름 (배경은 cover, 캐릭터는 contain)

## 향후 계획
- 타일맵 시스템 도입 시 MapContext 추가
- 맵별 크기/비율 다르게 설정 가능하도록 확장
