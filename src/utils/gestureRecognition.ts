import type { TrackedHand } from '../types/handTracking'
import type {
  GestureClassification,
  GestureThresholds,
  GestureType,
} from '../types/gestures'
import {
  calculatePinchRatio,
  countFlexedFingers,
  getFingerExtensionStates,
} from './gestureGeometry'

export const DEFAULT_GESTURE_THRESHOLDS: GestureThresholds = {
  extensionAngleDegrees: 150,
  flexionAngleDegrees: 118,
  pinchEnterRatio: 0.38,
  pinchExitRatio: 0.5,
  snapContactRatio: 0.34,
  snapReleaseRatio: 0.72,
  snapWindowMs: 360,
  snapCooldownMs: 650,
  confirmationFrames: 3,
}

export function classifyHandGesture(
  hand: TrackedHand,
  previousGesture: GestureType = 'UNKNOWN',
  thresholds: GestureThresholds = DEFAULT_GESTURE_THRESHOLDS,
): GestureClassification {
  const states = getFingerExtensionStates(
    hand.landmarks,
    thresholds.extensionAngleDegrees,
  )
  const extended = Object.values(states).filter(Boolean).length
  const flexed = countFlexedFingers(hand.landmarks, thresholds.flexionAngleDegrees)
  const pinchRatio = calculatePinchRatio(hand.landmarks)
  const pinchThreshold = previousGesture === 'PINCH'
    ? thresholds.pinchExitRatio
    : thresholds.pinchEnterRatio

  if (pinchRatio <= pinchThreshold) {
    return {
      gesture: 'PINCH',
      heuristicScore: Math.min(1, 1 - pinchRatio / thresholds.pinchExitRatio),
      pinchRatio,
      extendedFingerCount: extended,
    }
  }
  if (states.index && states.middle && !states.ring && !states.pinky) {
    return { gesture: 'PEACE', heuristicScore: flexed / 4, pinchRatio, extendedFingerCount: extended }
  }
  if (states.index && !states.middle && !states.ring && !states.pinky) {
    return { gesture: 'INDEX_POINT', heuristicScore: flexed / 4, pinchRatio, extendedFingerCount: extended }
  }
  if (extended >= 4) {
    return { gesture: 'OPEN_PALM', heuristicScore: extended / 4, pinchRatio, extendedFingerCount: extended }
  }
  if (extended === 0 && flexed >= 3) {
    return { gesture: 'FIST', heuristicScore: flexed / 4, pinchRatio, extendedFingerCount: extended }
  }
  return { gesture: 'UNKNOWN', heuristicScore: 0, pinchRatio, extendedFingerCount: extended }
}
