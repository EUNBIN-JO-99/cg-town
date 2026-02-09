'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { MAP_WIDTH, MAP_HEIGHT } from '@/lib/gameConfig'

// 맵 비율 (2:1)
const MAP_ASPECT_RATIO = MAP_WIDTH / MAP_HEIGHT

export interface GameScaleData {
  scale: number           // 현재 스케일 배율
  displayWidth: number    // 실제 표시되는 게임 영역 너비
  displayHeight: number   // 실제 표시되는 게임 영역 높이
  offsetX: number         // 레터박스 X 오프셋 (중앙 정렬용)
  offsetY: number         // 레터박스 Y 오프셋 (중앙 정렬용)
}

/**
 * 스케일 계산 유틸리티 함수
 * - 컨테이너 크기를 기반으로 맵 스케일 및 오프셋 계산
 */
function calculateScaleFromDimensions(containerWidth: number, containerHeight: number): GameScaleData {
  // 유효하지 않은 크기인 경우 기본값 반환
  if (containerWidth <= 0 || containerHeight <= 0) {
    return {
      scale: 1,
      displayWidth: MAP_WIDTH,
      displayHeight: MAP_HEIGHT,
      offsetX: 0,
      offsetY: 0,
    }
  }

  // 컨테이너 비율
  const containerAspectRatio = containerWidth / containerHeight

  let scale: number
  let displayWidth: number
  let displayHeight: number
  let offsetX: number
  let offsetY: number

  if (containerAspectRatio > MAP_ASPECT_RATIO) {
    // 컨테이너가 더 넓음 → 높이에 맞춤 (좌우 레터박스)
    scale = containerHeight / MAP_HEIGHT
    displayHeight = containerHeight
    displayWidth = MAP_WIDTH * scale
    offsetX = (containerWidth - displayWidth) / 2
    offsetY = 0
  } else {
    // 컨테이너가 더 좁음 → 너비에 맞춤 (상하 레터박스)
    scale = containerWidth / MAP_WIDTH
    displayWidth = containerWidth
    displayHeight = MAP_HEIGHT * scale
    offsetX = 0
    offsetY = (containerHeight - displayHeight) / 2
  }

  return { scale, displayWidth, displayHeight, offsetX, offsetY }
}

/**
 * 초기 스케일 데이터 계산 (SSR 대비)
 * - 서버에서는 기본값 사용
 * - 클라이언트에서는 window 크기 기반으로 계산
 */
function getInitialScaleData(): GameScaleData {
  // SSR 환경에서는 window가 없으므로 기본값 반환
  if (typeof window === 'undefined') {
    return {
      scale: 1,
      displayWidth: MAP_WIDTH,
      displayHeight: MAP_HEIGHT,
      offsetX: 0,
      offsetY: 0,
    }
  }

  // 클라이언트에서는 window 크기 기반으로 초기 스케일 계산
  return calculateScaleFromDimensions(window.innerWidth, window.innerHeight)
}

/**
 * 반응형 게임 스케일 훅
 * - ResizeObserver로 화면 크기 변화 감지
 * - 맵 비율(2:1) 유지하면서 화면에 맞게 스케일 조정
 * - 레터박스 방식으로 검정 여백 처리
 * - 초기 로드 시에도 window 크기 기반으로 올바른 스케일 적용
 */
export function useGameScale(containerRef: React.RefObject<HTMLElement | null>): GameScaleData {
  const [scaleData, setScaleData] = useState<GameScaleData>(getInitialScaleData)

  // 스케일 계산 함수 (메모이제이션)
  const calculateScale = useCallback(calculateScaleFromDimensions, [])

  // ResizeObserver로 컨테이너 크기 변화 감지
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 초기 계산
    const { width, height } = container.getBoundingClientRect()
    setScaleData(calculateScale(width, height))

    // ResizeObserver 설정
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setScaleData(calculateScale(width, height))
        }
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, calculateScale])

  return scaleData
}

/**
 * 논리 좌표(그리드)를 렌더링 좌표(스크린)로 변환
 */
export function gridToScreen(gridX: number, gridY: number, tileSize: number, scale: number): { x: number; y: number } {
  return {
    x: gridX * tileSize * scale,
    y: gridY * tileSize * scale,
  }
}

/**
 * 렌더링 좌표(스크린)를 논리 좌표(그리드)로 변환
 */
export function screenToGrid(screenX: number, screenY: number, tileSize: number, scale: number): { x: number; y: number } {
  return {
    x: Math.floor(screenX / (tileSize * scale)),
    y: Math.floor(screenY / (tileSize * scale)),
  }
}
