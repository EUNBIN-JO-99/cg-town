/**
 * 이벤트 버스 모듈
 * Phaser 게임과 React 컴포넌트 간의 통신을 담당
 *
 * 사용 예시:
 * - EventBus.emit('player-move', { x: 100, y: 200 })
 * - EventBus.on('player-move', (data) => console.log(data))
 */
import * as Phaser from 'phaser'

/**
 * 이벤트 타입 정의
 * 게임에서 사용되는 모든 이벤트와 페이로드 타입
 */
export interface EventTypes {
  // 씬 관련 이벤트
  'scene-ready': { scene: Phaser.Scene }
  'scene-change': { from: string; to: string }

  // 플레이어 관련 이벤트
  'player-move': { x: number; y: number; direction: string }
  'player-stop': { x: number; y: number }
  'local-player-move': { x: number; y: number; direction: string }

  // 게임 상태 이벤트
  'game-started': undefined
  'game-paused': undefined
  'game-resumed': undefined

  // 로딩 관련 이벤트
  'loading-progress': { progress: number }
  'loading-complete': undefined

  // 멀티플레이어 이벤트
  'remote-player-join': { playerId: string; x: number; y: number }
  'remote-player-leave': { playerId: string }
  'remote-player-move': { playerId: string; x: number; y: number; direction: string }
}

/**
 * 타입 안전한 이벤트 버스 클래스
 * Phaser.Events.EventEmitter를 확장하여 타입 지원 추가
 */
class TypedEventEmitter extends Phaser.Events.EventEmitter {
  /**
   * 타입 안전한 이벤트 발생
   * @param event - 이벤트 이름
   * @param args - 이벤트 페이로드
   */
  emit<K extends keyof EventTypes>(
    event: K,
    ...args: EventTypes[K] extends undefined ? [] : [EventTypes[K]]
  ): boolean {
    return super.emit(event, ...args)
  }

  /**
   * 타입 안전한 이벤트 리스너 등록
   * @param event - 이벤트 이름
   * @param fn - 콜백 함수
   * @param context - 콜백 컨텍스트
   */
  on<K extends keyof EventTypes>(
    event: K,
    fn: (data: EventTypes[K]) => void,
    context?: unknown
  ): this {
    return super.on(event, fn, context)
  }

  /**
   * 타입 안전한 일회성 이벤트 리스너 등록
   * @param event - 이벤트 이름
   * @param fn - 콜백 함수
   * @param context - 콜백 컨텍스트
   */
  once<K extends keyof EventTypes>(
    event: K,
    fn: (data: EventTypes[K]) => void,
    context?: unknown
  ): this {
    return super.once(event, fn, context)
  }

  /**
   * 타입 안전한 이벤트 리스너 제거
   * @param event - 이벤트 이름
   * @param fn - 콜백 함수
   * @param context - 콜백 컨텍스트
   */
  off<K extends keyof EventTypes>(
    event: K,
    fn?: (data: EventTypes[K]) => void,
    context?: unknown
  ): this {
    return super.off(event, fn, context)
  }
}

// 싱글톤 이벤트 버스 인스턴스
export const EventBus = new TypedEventEmitter()

export default EventBus
