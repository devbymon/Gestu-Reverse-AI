import type { GestureRecognitionState, GestureType } from '../types/gestures'
import GestureDebugPanel from './GestureDebugPanel'

interface GestureIndicatorProps {
  state: GestureRecognitionState
}

const GESTURE_LABELS: Record<GestureType, string> = {
  FIST: 'Closed Fist',
  OPEN_PALM: 'Open Palm',
  INDEX_POINT: 'Index Point',
  PEACE: 'Peace Sign',
  PINCH: 'Pinch',
  SWIPE: 'Hand Swipe',
  TWO_HAND_EXPANSION: 'Two-Hand Expansion',
  UNKNOWN: 'No Gesture Detected',
}

export default function GestureIndicator({ state }: GestureIndicatorProps) {
  return (
    <section className="gesture-indicator" aria-label="Gesture recognition" aria-live="polite">
      <div className="gesture-indicator__topline">
        <span>Gesture Recognition</span>
        <span className={state.stability >= 1 ? 'is-stable' : ''}>
          {state.tracking ? state.stability >= 1 ? 'Stable' : 'Stabilizing' : 'Waiting'}
        </span>
      </div>
      <strong>{GESTURE_LABELS[state.gesture]}</strong>
      <span className="gesture-effect">Effect · {state.effect}</span>
      <div className="gesture-meter" aria-label="Interaction intensity">
        <span style={{ width: `${Math.round(state.intensity * 100)}%` }} />
      </div>
      <GestureDebugPanel state={state} />
    </section>
  )
}
