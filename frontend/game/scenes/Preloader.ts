/**
 * Preloader 씬
 * 로딩 진행률을 시각적으로 표시하고
 * 모든 준비가 완료되면 GameScene으로 전환
 */
import * as Phaser from 'phaser'
import { EventBus } from '../EventBus'

export class Preloader extends Phaser.Scene {
  // 로딩 바 관련 그래픽 객체
  private progressBar!: Phaser.GameObjects.Graphics
  private progressBox!: Phaser.GameObjects.Graphics
  private loadingText!: Phaser.GameObjects.Text
  private percentText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'Preloader' })
  }

  /**
   * 씬 초기화
   */
  init(): void {
    console.log('[Preloader] 씬 초기화')
  }

  /**
   * 로딩 화면 에셋 로드
   * Boot에서 로드하지 않은 추가 에셋이 있다면 여기서 로드
   */
  preload(): void {
    // 로딩 UI 생성
    this.createLoadingUI()

    // 로딩 이벤트 리스너 등록
    this.setupLoadingEvents()

    // 추가 에셋이 있다면 여기서 로드
    // 현재는 Boot에서 모든 에셋을 로드하므로 비어있음
  }

  /**
   * 로딩 UI 컴포넌트 생성
   */
  private createLoadingUI(): void {
    const { width, height } = this.cameras.main

    // 로딩 바 배경 박스
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x222222, 0.8)
    this.progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    // 로딩 진행률 바
    this.progressBar = this.add.graphics()

    // '로딩 중...' 텍스트
    this.loadingText = this.add.text(width / 2, height / 2 - 50, '로딩 중...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    })
    this.loadingText.setOrigin(0.5, 0.5)

    // 퍼센트 텍스트
    this.percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    })
    this.percentText.setOrigin(0.5, 0.5)
  }

  /**
   * 로딩 이벤트 리스너 설정
   */
  private setupLoadingEvents(): void {
    const { width, height } = this.cameras.main

    // 로딩 진행률 업데이트
    this.load.on('progress', (value: number) => {
      // 진행률 바 업데이트
      this.progressBar.clear()
      this.progressBar.fillStyle(0x00ff00, 1)
      this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)

      // 퍼센트 텍스트 업데이트
      const percent = Math.round(value * 100)
      this.percentText.setText(`${percent}%`)

      // EventBus로 진행률 알림 (React 컴포넌트에서 사용 가능)
      EventBus.emit('loading-progress', { progress: value })
    })

    // 파일 로드 완료 시
    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      console.log(`[Preloader] 파일 로드 완료: ${file.key}`)
    })

    // 모든 로딩 완료 시
    this.load.on('complete', () => {
      console.log('[Preloader] 모든 에셋 로딩 완료')
      EventBus.emit('loading-complete')
    })
  }

  /**
   * 씬 생성 완료 후 실행
   */
  create(): void {
    console.log('[Preloader] 로딩 완료, GameScene으로 전환 준비')

    // 로딩 바를 100%로 채우기
    const { width, height } = this.cameras.main
    this.progressBar.clear()
    this.progressBar.fillStyle(0x00ff00, 1)
    this.progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300, 30)
    this.percentText.setText('100%')
    this.loadingText.setText('완료!')

    // 짧은 딜레이 후 GameScene으로 전환 (사용자가 100% 확인할 수 있도록)
    this.time.delayedCall(500, () => {
      console.log('[Preloader] GameScene으로 전환')
      this.scene.start('GameScene')
    })
  }
}

export default Preloader
