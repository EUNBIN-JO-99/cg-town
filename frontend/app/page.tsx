'use client'

import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useMultiplayer } from '@/hooks/useMultiplayer'

// PhaserGame 컴포넌트를 dynamic import로 로드 (SSR 비활성화)
// Phaser는 브라우저 환경에서만 동작하므로 서버 사이드 렌더링을 비활성화합니다.
const PhaserGame = dynamic(() => import('@/components/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontSize: '18px',
      }}
    >
      게임 로딩 중...
    </div>
  ),
})

export default function Home() {
  // 멀티플레이어 훅 사용
  const { remotePlayers, isConnected, sendPosition, myName, myEmailPrefix, myGridPos } = useMultiplayer()

  // 플레이어 위치 변경 핸들러 (Phaser -> WebSocket)
  const handlePositionChange = useCallback(
    (gridX: number, gridY: number, direction: string) => {
      sendPosition(gridX, gridY, direction)
    },
    [sendPosition]
  )

  return (
    <>
      {/* 연결 상태 표시 (화면 우측 상단 고정) - Phaser 게임 밖에 배치 */}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 100,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          backgroundColor: isConnected ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
          color: 'white',
        }}
      >
        {isConnected ? `온라인 (${Object.keys(remotePlayers).length + 1}명)` : '연결 중...'}
      </div>

      {/* Phaser 게임 컴포넌트 */}
      <PhaserGame
        remotePlayers={remotePlayers}
        isConnected={isConnected}
        myName={myName}
        myEmailPrefix={myEmailPrefix}
        myGridPos={myGridPos}
        onPositionChange={handlePositionChange}
      />
    </>
  )
}
