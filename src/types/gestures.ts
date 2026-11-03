export type GestureType =
  | 'FIST'
  | 'OPEN_PALM'
  | 'INDEX_POINT'
  | 'PEACE'
  | 'PINCH'
  | 'THREE_FINGERS'
  | 'TWO_HAND_EXPANSION'
  | 'UNKNOWN'

export interface GestureVector {
  x: number
  y: number
}

export interface GestureCommand {
  gesture: GestureType
  intensity: number
  position?: GestureVector
  direction?: GestureVector
  timestamp: number
}

export interface GestureClassification {
  gesture: Exclude<GestureType, 'TWO_HAND_EXPANSION'>
  heuristicScore: number
  pinchRatio: number
  extendedFingerCount: number
}

export interface GestureRecognitionState {
  gesture: GestureType
  candidate: GestureType
  effect: string
  intensity: number
  stability: number
  handCount: number
  tracking: boolean
  isTransient: boolean
}

export interface GestureControllerResult {
  command: GestureCommand
  state: GestureRecognitionState
}

export interface GestureThresholds {
  extensionAngleDegrees: number
  flexionAngleDegrees: number
  pinchEnterRatio: number
  pinchExitRatio: number
  confirmationFrames: number
}

export const UNKNOWN_GESTURE_COMMAND: GestureCommand = {
  gesture: 'UNKNOWN',
  intensity: 0,
  timestamp: 0,
}
