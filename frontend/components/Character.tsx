'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, BASE_CHARACTER_SIZE } from '@/lib/gameConfig'
import { useGameScaleContext } from '@/contexts/GameScaleContext'

type Direction = 'up' | 'down' | 'left' | 'right' | 'default'

interface CharacterImages {
  default: string
  up: string
  down: string
  left: string
  right: string
}

interface CharacterProps {
  images: CharacterImages
  initialGridX?: number
  initialGridY?: number
  name?: string
  onPositionChange?: (gridX: number, gridY: number, direction: Direction) => void
}

export default function Character({
  images,
  initialGridX = 5,
  initialGridY = 5,
  name,
  onPositionChange,
}: CharacterProps) {
  // 스케일 컨텍스트에서 현재 스케일 가져오기
  const { scale } = useGameScaleContext()

  const [gridPos, setGridPos] = useState({ x: initialGridX, y: initialGridY })
  // 논리 좌표 (그리드 기준 픽셀 위치)
  const [displayPos, setDisplayPos] = useState({ x: initialGridX * TILE_SIZE, y: initialGridY * TILE_SIZE })
  const [direction, setDirection] = useState<Direction>('default')

  const isMoving = useRef(false)
  const animFrameRef = useRef<number | null>(null)
  const targetPixelPos = useRef({ x: initialGridX * TILE_SIZE, y: initialGridY * TILE_SIZE })
  const onPositionChangeRef = useRef(onPositionChange)
  const keysPressed = useRef<Set<string>>(new Set())
  const lastKeyRef = useRef<string>('')

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange
  }, [onPositionChange])

  // 초기 그리드 위치가 변경될 때 (서버 초기화 등) 위치 업데이트
  useEffect(() => {
    setGridPos({ x: initialGridX, y: initialGridY })
    const px = initialGridX * TILE_SIZE
    const py = initialGridY * TILE_SIZE
    setDisplayPos({ x: px, y: py })
    targetPixelPos.current = { x: px, y: py }
  }, [initialGridX, initialGridY])

  // 애니메이션 루프 - 부드러운 이동 처리
  useEffect(() => {
    const animate = () => {
      setDisplayPos(prev => {
        const dx = targetPixelPos.current.x - prev.x
        const dy = targetPixelPos.current.y - prev.y

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          isMoving.current = false
          // 키가 계속 눌려있으면 다음 이동 시도
          if (keysPressed.current.size > 0) {
            setTimeout(tryMove, 0)
          }
          return { x: targetPixelPos.current.x, y: targetPixelPos.current.y }
        }

        return {
          x: prev.x + dx * 0.25,
          y: prev.y + dy * 0.25
        }
      })
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // 마지막으로 누른 키 방향으로 이동
  const tryMove = () => {
    if (isMoving.current) return

    const lastKey = lastKeyRef.current
    if (!lastKey || !keysPressed.current.has(lastKey)) return

    setGridPos(prev => {
      let newX = prev.x
      let newY = prev.y
      let newDir: Direction = 'default'

      switch (lastKey) {
        case 'ArrowUp':
          newY = Math.max(0, prev.y - 1)
          newDir = 'up'
          break
        case 'ArrowDown':
          newY = Math.min(GRID_HEIGHT - 1, prev.y + 1)
          newDir = 'down'
          break
        case 'ArrowLeft':
          newX = Math.max(0, prev.x - 1)
          newDir = 'left'
          break
        case 'ArrowRight':
          newX = Math.min(GRID_WIDTH - 1, prev.x + 1)
          newDir = 'right'
          break
      }

      setDirection(newDir)

      if (newX !== prev.x || newY !== prev.y) {
        isMoving.current = true
        targetPixelPos.current = { x: newX * TILE_SIZE, y: newY * TILE_SIZE }
        onPositionChangeRef.current?.(newX, newY, newDir)
      }

      return { x: newX, y: newY }
    })
  }

  // 키보드 입력 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 스페이스바: 기본 포즈로 전환
      if (e.key === ' ') {
        e.preventDefault()
        setDirection('default')
        setGridPos(prev => {
          onPositionChangeRef.current?.(prev.x, prev.y, 'default')
          return prev
        })
        return
      }
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
      e.preventDefault()
      keysPressed.current.add(e.key)
      lastKeyRef.current = e.key
      tryMove()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const currentImage = images[direction]

  // 스케일이 적용된 캐릭터 크기
  const scaledCharSize = BASE_CHARACTER_SIZE * scale
  const scaledTileSize = TILE_SIZE * scale

  // 캐릭터를 타일 중앙에 배치하기 위한 오프셋 계산
  const charOffset = (scaledCharSize - scaledTileSize) / 2

  // 논리 좌표를 렌더링 좌표로 변환
  const screenX = displayPos.x * scale - charOffset
  const screenY = displayPos.y * scale - charOffset

  return (
    <div
      className="character"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${scaledCharSize}px`,
        height: `${scaledCharSize}px`,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          src={currentImage}
          alt="character"
          fill
          sizes={`${scaledCharSize}px`}
          style={{ objectFit: 'contain' }}
          priority
          unoptimized
        />
      </div>
      {name && (
        <div style={{
          textAlign: 'center',
          fontSize: `${12 * scale}px`,
          fontWeight: 'bold',
          color: 'white',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          marginTop: `${-5 * scale}px`
        }}>
          {name}
        </div>
      )}
    </div>
  )
}
