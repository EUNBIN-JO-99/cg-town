'use client'
import { createContext, useContext, useRef, ReactNode, useState, useEffect } from 'react'
import { useGameScale, GameScaleData } from '@/hooks/useGameScale'
import { MAP_WIDTH, MAP_HEIGHT } from '@/lib/gameConfig'

/**
 * 초기 스케일 데이터 계산 (SSR 대비)
 */
function getDefaultScaleData(): GameScaleData {
  // SSR 환경에서는 기본값 반환
  if (typeof window === 'undefined') {
    return {
      scale: 1,
      displayWidth: MAP_WIDTH,
      displayHeight: MAP_HEIGHT,
      offsetX: 0,
      offsetY: 0,
    }
  }

  // 클라이언트에서는 window 크기 기반으로 계산
  const containerWidth = window.innerWidth
  const containerHeight = window.innerHeight
  const mapAspectRatio = MAP_WIDTH / MAP_HEIGHT
  const containerAspectRatio = containerWidth / containerHeight

  let scale: number
  let displayWidth: number
  let displayHeight: number
  let offsetX: number
  let offsetY: number

  if (containerAspectRatio > mapAspectRatio) {
    scale = containerHeight / MAP_HEIGHT
    displayHeight = containerHeight
    displayWidth = MAP_WIDTH * scale
    offsetX = (containerWidth - displayWidth) / 2
    offsetY = 0
  } else {
    scale = containerWidth / MAP_WIDTH
    displayWidth = containerWidth
    displayHeight = MAP_HEIGHT * scale
    offsetX = 0
    offsetY = (containerHeight - displayHeight) / 2
  }

  return { scale, displayWidth, displayHeight, offsetX, offsetY }
}

// 기본값 (초기 로딩 시 사용 - 동적으로 계산)
const defaultScaleData: GameScaleData = {
  scale: 1,
  displayWidth: MAP_WIDTH,
  displayHeight: MAP_HEIGHT,
  offsetX: 0,
  offsetY: 0,
}

// Context 생성
const GameScaleContext = createContext<GameScaleData>(defaultScaleData)

interface GameScaleProviderProps {
  children: ReactNode
}

/**
 * 게임 스케일 Context Provider
 * - 게임 컨테이너의 ref를 관리하고 스케일 정보를 하위 컴포넌트에 전달
 * - useGameScale 훅을 사용하여 반응형 스케일 계산
 * - 초기 마운트 시에도 올바른 스케일이 적용되도록 처리
 */
export function GameScaleProvider({ children }: GameScaleProviderProps) {
  // 게임 컨테이너 ref
  const containerRef = useRef<HTMLDivElement>(null)

  // 스케일 데이터 계산
  const scaleData = useGameScale(containerRef)

  // 마운트 상태 추적 (hydration 완료 후 정확한 스케일 적용)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 초기 마운트 전에는 window 기반 스케일 사용, 마운트 후에는 containerRef 기반 스케일 사용
  const effectiveScaleData = isMounted ? scaleData : getDefaultScaleData()

  return (
    <GameScaleContext.Provider value={effectiveScaleData}>
      {/* 게임 컨테이너 - 전체 화면을 차지하며 레터박스 배경 역할 */}
      <div ref={containerRef} className="game-container">
        {/* 게임 월드 - 실제 게임 요소들이 렌더링되는 영역 */}
        <div
          className="game-world"
          style={{
            width: effectiveScaleData.displayWidth,
            height: effectiveScaleData.displayHeight,
            transform: `translate(${effectiveScaleData.offsetX}px, ${effectiveScaleData.offsetY}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </GameScaleContext.Provider>
  )
}

/**
 * 게임 스케일 Context 훅
 * - 하위 컴포넌트에서 스케일 정보에 접근할 때 사용
 */
export function useGameScaleContext(): GameScaleData {
  const context = useContext(GameScaleContext)
  if (!context) {
    throw new Error('useGameScaleContext must be used within a GameScaleProvider')
  }
  return context
}
