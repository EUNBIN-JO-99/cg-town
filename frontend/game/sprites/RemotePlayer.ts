/**
 * 원격 플레이어 스프라이트 클래스
 * 서버로부터 받은 위치 데이터를 기반으로 부드럽게 이동합니다.
 * Lerp(선형 보간)을 사용하여 자연스러운 움직임을 구현합니다.
 */
import * as Phaser from 'phaser'
import { TILE_SIZE } from '../../lib/gameConfig'

// 이동 방향 타입 정의
type Direction = 'up' | 'down' | 'left' | 'right' | 'default'

export class RemotePlayer extends Phaser.GameObjects.Sprite {
  // 현재 그리드 좌표
  private gridX: number
  private gridY: number

  // 목표 월드 좌표 (보간 이동용)
  private targetX: number
  private targetY: number

  // 보간 속도 (0~1, 높을수록 빠름)
  private lerpSpeed: number = 0.15

  // 현재 방향
  private currentDirection: Direction = 'default'

  // 플레이어 이름 텍스트
  private nameText: Phaser.GameObjects.Text

  // 플레이어 ID (서버에서 식별용)
  private playerId: string

  // 플레이어 이름
  private playerName: string

  /**
   * 원격 플레이어 생성자
   * @param scene - 플레이어가 속한 씬
   * @param gridX - 시작 그리드 X 좌표
   * @param gridY - 시작 그리드 Y 좌표
   * @param texture - 스프라이트 텍스처 키
   * @param playerId - 플레이어 고유 ID
   * @param name - 플레이어 표시 이름
   */
  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    texture: string,
    playerId: string,
    name: string = 'Remote Player'
  ) {
    // 그리드 좌표를 월드 좌표로 변환하여 스프라이트 생성
    const worldX = gridX * TILE_SIZE + TILE_SIZE / 2
    const worldY = gridY * TILE_SIZE + TILE_SIZE / 2

    super(scene, worldX, worldY, texture)

    // 속성 초기화
    this.gridX = gridX
    this.gridY = gridY
    this.targetX = worldX
    this.targetY = worldY
    this.playerId = playerId
    this.playerName = name

    // 씬에 스프라이트 추가
    scene.add.existing(this)

    // 이름 텍스트 생성 (플레이어 위에 표시)
    this.nameText = scene.add.text(worldX, worldY - 50, name, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    })
    this.nameText.setOrigin(0.5, 1) // 텍스트 중앙 하단 기준점

    // 깊이 설정 (이름이 스프라이트 위에 표시되도록)
    this.setDepth(10)
    this.nameText.setDepth(11)

    // 원격 플레이어는 약간 투명하게 표시 (선택사항)
    this.setAlpha(0.9)
  }

  /**
   * 매 프레임 업데이트
   * 목표 위치로 부드럽게 이동 (Lerp)
   * @param time - 현재 시간
   * @param delta - 이전 프레임과의 시간 차이 (ms)
   */
  update(time: number, delta: number): void {
    // 현재 위치에서 목표 위치로 부드럽게 이동 (Lerp)
    this.x = Phaser.Math.Linear(this.x, this.targetX, this.lerpSpeed)
    this.y = Phaser.Math.Linear(this.y, this.targetY, this.lerpSpeed)

    // 목표에 매우 가까워지면 스냅 (떨림 방지)
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetX,
      this.targetY
    )

    if (distance < 0.5) {
      this.x = this.targetX
      this.y = this.targetY
    }

    // 이름 텍스트 위치 업데이트 (플레이어 따라다니기)
    this.nameText.setPosition(this.x, this.y - 50)
  }

  /**
   * 목표 위치 설정 (그리드 좌표)
   * 서버에서 위치 업데이트를 받았을 때 호출됩니다.
   * @param gridX - 목표 그리드 X 좌표
   * @param gridY - 목표 그리드 Y 좌표
   * @param direction - 이동 방향 (선택사항)
   */
  setTargetPosition(
    gridX: number,
    gridY: number,
    direction?: Direction
  ): void {
    this.gridX = gridX
    this.gridY = gridY

    // 그리드 좌표를 월드 좌표로 변환
    this.targetX = gridX * TILE_SIZE + TILE_SIZE / 2
    this.targetY = gridY * TILE_SIZE + TILE_SIZE / 2

    // 방향이 주어지면 업데이트
    if (direction) {
      this.setDirection(direction)
    }
  }

  /**
   * 즉시 위치 설정 (텔레포트)
   * 보간 없이 바로 해당 위치로 이동합니다.
   * @param gridX - 목표 그리드 X 좌표
   * @param gridY - 목표 그리드 Y 좌표
   */
  setPositionImmediate(gridX: number, gridY: number): void {
    this.gridX = gridX
    this.gridY = gridY

    // 월드 좌표로 변환
    const worldX = gridX * TILE_SIZE + TILE_SIZE / 2
    const worldY = gridY * TILE_SIZE + TILE_SIZE / 2

    // 즉시 위치 설정
    this.x = worldX
    this.y = worldY
    this.targetX = worldX
    this.targetY = worldY

    // 이름 텍스트도 즉시 이동
    this.nameText.setPosition(worldX, worldY - 50)
  }

  /**
   * 이동 방향 설정
   * 방향에 따라 스프라이트 모습을 업데이트합니다.
   * @param direction - 이동 방향
   */
  setDirection(direction: Direction): void {
    this.currentDirection = direction

    // 방향에 따른 스프라이트 뒤집기
    if (direction === 'left') {
      this.setFlipX(true)
    } else if (direction === 'right') {
      this.setFlipX(false)
    }

    // 방향에 따른 애니메이션 재생 (텍스처가 있을 경우)
    // 예: this.play(`walk-${direction}`)
  }

  /**
   * 보간 속도 설정
   * 값이 높을수록 목표 위치에 빨리 도달합니다.
   * @param speed - 보간 속도 (0~1)
   */
  setLerpSpeed(speed: number): void {
    this.lerpSpeed = Phaser.Math.Clamp(speed, 0.01, 1)
  }

  /**
   * 현재 그리드 좌표 반환
   * @returns 그리드 좌표 객체
   */
  getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY }
  }

  /**
   * 현재 방향 반환
   * @returns 현재 이동 방향
   */
  getDirection(): Direction {
    return this.currentDirection
  }

  /**
   * 플레이어 ID 반환
   * @returns 플레이어 고유 ID
   */
  getPlayerId(): string {
    return this.playerId
  }

  /**
   * 플레이어 이름 설정
   * @param name - 새로운 플레이어 이름
   */
  setPlayerName(name: string): void {
    this.playerName = name
    this.nameText.setText(name)
  }

  /**
   * 플레이어 이름 반환
   * @returns 플레이어 표시 이름
   */
  getPlayerName(): string {
    return this.playerName
  }

  /**
   * 스프라이트 및 관련 객체 정리
   * 씬에서 제거될 때 호출됩니다.
   */
  destroy(fromScene?: boolean): void {
    // 이름 텍스트 제거
    if (this.nameText) {
      this.nameText.destroy()
    }
    super.destroy(fromScene)
  }
}

export default RemotePlayer
