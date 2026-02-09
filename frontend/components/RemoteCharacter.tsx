'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TILE_SIZE, BASE_CHARACTER_SIZE } from '@/lib/gameConfig'
import { useGameScaleContext } from '@/contexts/GameScaleContext'

interface RemoteCharacterProps {
  userId: string
  name: string
  gridX: number
  gridY: number
  direction: string
  images: Record<string, string>
}

export default function RemoteCharacter({ userId, name, gridX, gridY, direction, images }: RemoteCharacterProps) {
  // 스케일 컨텍스트에서 현재 스케일 가져오기
  const { scale } = useGameScaleContext()

  // 논리 좌표 (그리드 기준 픽셀 위치)
  const targetPixel = { x: gridX * TILE_SIZE, y: gridY * TILE_SIZE }
  const [displayPos, setDisplayPos] = useState(targetPixel)
  const targetPos = useRef(targetPixel)
  const animFrameRef = useRef<number | null>(null)

  // 그리드 위치가 변경될 때 타겟 위치 업데이트
  useEffect(() => {
    targetPos.current = { x: gridX * TILE_SIZE, y: gridY * TILE_SIZE }
  }, [gridX, gridY])

  // 애니메이션 루프 - 부드러운 이동 처리
  useEffect(() => {
    const animate = () => {
      setDisplayPos(prev => {
        const dx = targetPos.current.x - prev.x
        const dy = targetPos.current.y - prev.y

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          return { x: targetPos.current.x, y: targetPos.current.y }
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

  const currentImage = images[direction] || images['default']

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
          alt={name}
          fill
          sizes={`${scaledCharSize}px`}
          style={{ objectFit: 'contain' }}
          priority
          unoptimized
        />
      </div>
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
    </div>
  )
}
