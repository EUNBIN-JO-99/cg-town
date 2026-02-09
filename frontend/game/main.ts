/**
 * Phaser 게임 메인 설정 파일
 * 게임의 기본 구성과 씬 등록을 담당
 */
import * as Phaser from 'phaser'
import { Boot } from './scenes/Boot'
import { Preloader } from './scenes/Preloader'
import { GameScene } from './scenes/GameScene'

// Phaser 게임 기본 설정
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL 우선, 불가시 Canvas 사용
  width: 1536, // 게임 캔버스 너비
  height: 768, // 게임 캔버스 높이
  parent: 'phaser-game', // DOM 컨테이너 ID
  backgroundColor: '#000000', // 배경색 (검정)
  scale: {
    mode: Phaser.Scale.FIT, // 화면에 맞게 스케일 조정
    autoCenter: Phaser.Scale.CENTER_BOTH, // 가운데 정렬
  },
  scene: [Boot, Preloader, GameScene], // 씬 순서대로 등록
  physics: {
    default: 'arcade', // 아케이드 물리 엔진 사용
    arcade: {
      gravity: { x: 0, y: 0 }, // 중력 없음 (탑다운 뷰)
      debug: false // 디버그 모드 비활성화
    }
  }
}

/**
 * 게임 인스턴스 생성 함수
 * @param parent - 게임을 렌더링할 DOM 요소 ID
 * @returns Phaser.Game 인스턴스
 */
export const createGame = (parent: string): Phaser.Game => {
  return new Phaser.Game({ ...config, parent })
}

export default config
