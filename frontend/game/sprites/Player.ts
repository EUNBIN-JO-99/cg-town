/**
 * 로컬 플레이어 스프라이트 클래스
 * 키보드 입력을 받아 그리드 기반으로 이동하며,
 * EventBus를 통해 이동 이벤트를 발생시킵니다.
 */
import * as Phaser from 'phaser'
import { EventBus } from '../EventBus'
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, MOVE_DURATION } from '../../lib/gameConfig'

// 이동 방향 타입 정의
type Direction = 'up' | 'down' | 'left' | 'right' | 'default'

export class Player extends Phaser.GameObjects.Sprite {
  // 키보드 커서 키 객체
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  // 스페이스 키 객체
  private spaceKey!: Phaser.Input.Keyboard.Key

  // 현재 그리드 좌표
  private gridX: number
  private gridY: number

  // 목표 월드 좌표 (이동 애니메이션용)
  private targetX: number
  private targetY: number

  // 이동 중 여부
  private isMoving: boolean = false

  // 현재 방향
  private currentDirection: Direction = 'default'

  // 플레이어 이름 텍스트
  private nameText: Phaser.GameObjects.Text

  // 플레이어 이름
  private playerName: string

  /**
   * 플레이어 생성자
   * @param scene - 플레이어가 속한 씬
   * @param gridX - 시작 그리드 X 좌표
   * @param gridY - 시작 그리드 Y 좌표
   * @param texture - 스프라이트 텍스처 키
   * @param name - 플레이어 이름
   */
  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    texture: string,
    name: string = 'Player'
  ) {
    // 그리드 좌표를 월드 좌표로 변환하여 스프라이트 생성
    const worldX = gridX * TILE_SIZE + TILE_SIZE / 2
    const worldY = gridY * TILE_SIZE + TILE_SIZE / 2

    super(scene, worldX, worldY, texture)

    // 그리드 좌표 초기화
    this.gridX = gridX
    this.gridY = gridY
    this.targetX = worldX
    this.targetY = worldY
    this.playerName = name

    // 씬에 스프라이트 추가
    scene.add.existing(this)

    // 키보드 입력 설정
    this.setupInput()

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
  }

  /**
   * 키보드 입력 설정
   * 화살표 키와 스페이스 키를 등록합니다.
   */
  private setupInput(): void {
    // 키보드가 활성화되어 있는지 확인
    if (!this.scene.input.keyboard) {
      console.error('키보드 입력을 사용할 수 없습니다.')
      return
    }

    // 화살표 키 등록
    this.cursors = this.scene.input.keyboard.createCursorKeys()

    // 스페이스 키 등록
    this.spaceKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    )
  }

  /**
   * 매 프레임 업데이트
   * 이동 입력 처리 및 애니메이션 적용
   * @param time - 현재 시간
   * @param delta - 이전 프레임과의 시간 차이 (ms)
   */
  update(time: number, delta: number): void {
    // 이동 중이면 보간 처리
    if (this.isMoving) {
      this.updateMovement(delta)
    } else {
      // 이동 중이 아니면 입력 확인
      this.handleInput()
    }

    // 이름 텍스트 위치 업데이트 (플레이어 따라다니기)
    this.nameText.setPosition(this.x, this.y - 50)
  }

  /**
   * 키보드 입력 처리
   * 화살표 키로 이동, 스페이스 키로 기본 포즈
   */
  private handleInput(): void {
    // 스페이스 키: 기본 포즈로 전환
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.setDefaultPose()
      return
    }

    // 화살표 키 입력 확인 및 이동 시작
    if (this.cursors.up.isDown) {
      this.startMove('up')
    } else if (this.cursors.down.isDown) {
      this.startMove('down')
    } else if (this.cursors.left.isDown) {
      this.startMove('left')
    } else if (this.cursors.right.isDown) {
      this.startMove('right')
    }
  }

  /**
   * 이동 시작
   * 그리드 경계를 확인하고 목표 위치를 설정합니다.
   * @param direction - 이동 방향
   */
  private startMove(direction: Direction): void {
    // 새로운 그리드 좌표 계산
    let newGridX = this.gridX
    let newGridY = this.gridY

    switch (direction) {
      case 'up':
        newGridY -= 1
        break
      case 'down':
        newGridY += 1
        break
      case 'left':
        newGridX -= 1
        break
      case 'right':
        newGridX += 1
        break
    }

    // 그리드 경계 확인
    if (
      newGridX < 0 ||
      newGridX >= GRID_WIDTH ||
      newGridY < 0 ||
      newGridY >= GRID_HEIGHT
    ) {
      // 경계를 벗어나면 이동하지 않음
      return
    }

    // 방향 업데이트 및 애니메이션 설정
    this.currentDirection = direction
    this.updateDirectionAnimation(direction)

    // 그리드 좌표 업데이트
    this.gridX = newGridX
    this.gridY = newGridY

    // 목표 월드 좌표 설정
    this.targetX = this.gridX * TILE_SIZE + TILE_SIZE / 2
    this.targetY = this.gridY * TILE_SIZE + TILE_SIZE / 2

    // 이동 상태 활성화
    this.isMoving = true

    // 이벤트 발생: 로컬 플레이어 이동
    EventBus.emit('player-move', {
      x: this.gridX,
      y: this.gridY,
      direction: direction
    })
  }

  /**
   * 이동 애니메이션 업데이트 (Lerp 적용)
   * @param delta - 프레임 간 시간 차이 (ms)
   */
  private updateMovement(delta: number): void {
    // 보간 비율 계산 (MOVE_DURATION 기준)
    const lerpFactor = Math.min(1, delta / MOVE_DURATION * 3)

    // 현재 위치에서 목표 위치로 부드럽게 이동 (Lerp)
    this.x = Phaser.Math.Linear(this.x, this.targetX, lerpFactor)
    this.y = Phaser.Math.Linear(this.y, this.targetY, lerpFactor)

    // 목표 위치에 도달했는지 확인 (오차 범위 1픽셀)
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.targetX,
      this.targetY
    )

    if (distance < 1) {
      // 정확한 위치로 스냅
      this.x = this.targetX
      this.y = this.targetY
      this.isMoving = false
    }
  }

  /**
   * 방향에 따른 애니메이션 업데이트
   * @param direction - 현재 이동 방향
   */
  private updateDirectionAnimation(direction: Direction): void {
    // 방향에 따라 스프라이트 프레임 또는 텍스처 변경
    // 실제 애니메이션은 텍스처 설정에 따라 구현
    // 예: this.play(`walk-${direction}`)

    // 좌우 방향에 따른 스프라이트 뒤집기
    if (direction === 'left') {
      this.setFlipX(true)
    } else if (direction === 'right') {
      this.setFlipX(false)
    }
  }

  /**
   * 기본 포즈로 전환
   * 스페이스 키를 눌렀을 때 호출됩니다.
   */
  private setDefaultPose(): void {
    this.currentDirection = 'default'
    // 기본 포즈 애니메이션 재생
    // 예: this.play('idle')

    // 이벤트 발생: 플레이어 정지
    EventBus.emit('player-stop', {
      x: this.gridX,
      y: this.gridY
    })
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
   * 플레이어 이름 설정
   * @param name - 새로운 플레이어 이름
   */
  setPlayerName(name: string): void {
    this.playerName = name
    this.nameText.setText(name)
  }

  /**
   * 플레이어 위치 강제 설정 (텔레포트)
   * @param gridX - 목표 그리드 X 좌표
   * @param gridY - 목표 그리드 Y 좌표
   */
  setGridPosition(gridX: number, gridY: number): void {
    this.gridX = gridX
    this.gridY = gridY
    this.x = gridX * TILE_SIZE + TILE_SIZE / 2
    this.y = gridY * TILE_SIZE + TILE_SIZE / 2
    this.targetX = this.x
    this.targetY = this.y
    this.isMoving = false
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

export default Player
