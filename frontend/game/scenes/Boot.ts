/**
 * Boot 씬
 * 게임 시작 시 가장 먼저 실행되는 씬
 * 모든 에셋(이미지, 스프라이트시트 등)을 로드
 */
import * as Phaser from 'phaser'

export class Boot extends Phaser.Scene {
  // 에셋 기본 경로 (환경변수 또는 기본값 사용)
  private baseUrl: string

  constructor() {
    super({ key: 'Boot' })
    // Next.js 환경변수에서 BASE_URL 가져오기
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  }

  /**
   * 씬 초기화
   * 로더 설정 및 기본 구성
   */
  init(): void {
    // 로더 기본 경로 설정
    this.load.setBaseURL(this.baseUrl)

    console.log('[Boot] 씬 초기화 완료')
  }

  /**
   * 에셋 사전 로드
   * 게임에서 사용할 모든 이미지와 스프라이트시트를 로드
   */
  preload(): void {
    console.log('[Boot] 에셋 로딩 시작...')

    // === 배경 이미지 로드 ===
    this.load.image('main_home', '/images/main_home.png')

    // === 캐릭터 스프라이트 로드 (은빈 캐릭터) ===
    // 각 방향별 개별 이미지 로드
    this.load.image('eunbin_front', '/images/charactor/eunbin/eunbin_front.png')
    this.load.image('eunbin_back', '/images/charactor/eunbin/eunbin_back.png')
    this.load.image('eunbin_left', '/images/charactor/eunbin/eunbin_left.png')
    this.load.image('eunbin_right', '/images/charactor/eunbin/eunbin_right.png')
    this.load.image('eunbin_default', '/images/charactor/eunbin/eunbin_default .png')

    // === 추가 에셋이 필요한 경우 여기에 추가 ===
    // this.load.image('key', '/path/to/image.png')
    // this.load.spritesheet('key', '/path/to/spritesheet.png', { frameWidth: 32, frameHeight: 32 })
    // this.load.audio('key', '/path/to/audio.mp3')
    // this.load.tilemapTiledJSON('key', '/path/to/tilemap.json')
  }

  /**
   * 씬 생성 완료 후 실행
   * 에셋 로딩 완료 후 Preloader 씬으로 전환
   */
  create(): void {
    console.log('[Boot] 에셋 로딩 완료, Preloader 씬으로 전환')

    // Preloader 씬으로 전환
    this.scene.start('Preloader')
  }
}

export default Boot
