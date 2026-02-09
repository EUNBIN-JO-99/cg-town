/**
 * GameScene (메인 게임 씬)
 * 실제 게임 플레이가 이루어지는 메인 씬
 * 배경, 캐릭터, 상호작용 등을 관리
 */
import * as Phaser from 'phaser'
import { EventBus } from '../EventBus'

export class GameScene extends Phaser.Scene {
  // 배경 이미지
  private background!: Phaser.GameObjects.Image

  // 플레이어 캐릭터 (추후 확장)
  private player?: Phaser.GameObjects.Sprite

  // 키보드 입력
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super({ key: 'GameScene' })
  }

  /**
   * 씬 초기화
   * 씬 시작 시 전달받은 데이터 처리
   */
  init(data?: Record<string, unknown>): void {
    console.log('[GameScene] 씬 초기화', data)
  }

  /**
   * 씬 생성
   * 게임 오브젝트 배치 및 초기 설정
   */
  create(): void {
    console.log('[GameScene] 씬 생성 시작')

    // 배경 이미지 설정
    this.setupBackground()

    // 키보드 입력 설정
    this.setupInput()

    // EventBus 연결 설정
    this.setupEventBus()

    // 씬 준비 완료 이벤트 발생
    EventBus.emit('scene-ready', { scene: this })
    EventBus.emit('game-started')

    console.log('[GameScene] 씬 생성 완료')
  }

  /**
   * 배경 이미지 설정
   */
  private setupBackground(): void {
    const { width, height } = this.cameras.main

    // 배경 이미지를 화면 중앙에 배치
    this.background = this.add.image(width / 2, height / 2, 'main_home')

    // 배경 이미지 크기를 화면에 맞게 조정 (옵션)
    // this.background.setDisplaySize(width, height)

    // 배경을 가장 뒤에 배치
    this.background.setDepth(-1)

    console.log('[GameScene] 배경 이미지 설정 완료')
  }

  /**
   * 키보드 입력 설정
   */
  private setupInput(): void {
    // 기본 커서 키 (화살표 키) 생성
    this.cursors = this.input.keyboard?.createCursorKeys()

    // WASD 키도 사용 가능하도록 추가 (추후 구현)
    // const wasd = this.input.keyboard?.addKeys('W,A,S,D')

    console.log('[GameScene] 입력 설정 완료')
  }

  /**
   * EventBus 연결 설정
   * React 컴포넌트와의 통신을 위한 이벤트 리스너 등록
   */
  private setupEventBus(): void {
    // React에서 게임 일시정지 요청 시
    EventBus.on('game-paused', () => {
      this.scene.pause()
      console.log('[GameScene] 게임 일시정지')
    })

    // React에서 게임 재개 요청 시
    EventBus.on('game-resumed', () => {
      this.scene.resume()
      console.log('[GameScene] 게임 재개')
    })

    // 씬 종료 시 이벤트 리스너 정리
    this.events.on('shutdown', () => {
      EventBus.off('game-paused')
      EventBus.off('game-resumed')
      console.log('[GameScene] 이벤트 리스너 정리 완료')
    })

    console.log('[GameScene] EventBus 연결 완료')
  }

  /**
   * 게임 루프 업데이트
   * 매 프레임마다 호출됨
   * @param time - 게임 시작 이후 경과 시간 (ms)
   * @param delta - 이전 프레임과의 시간 차이 (ms)
   */
  update(time: number, delta: number): void {
    // 입력이 없으면 리턴
    if (!this.cursors) return

    // 키보드 입력 처리 (추후 플레이어 이동 구현 시 사용)
    // if (this.cursors.left.isDown) { ... }
    // if (this.cursors.right.isDown) { ... }
    // if (this.cursors.up.isDown) { ... }
    // if (this.cursors.down.isDown) { ... }

    // 플레이어 업데이트 (추후 구현)
    // this.updatePlayer(delta)
  }

  /**
   * 씬 정리
   * 씬 종료 시 리소스 해제
   */
  shutdown(): void {
    console.log('[GameScene] 씬 종료')
  }
}

export default GameScene
