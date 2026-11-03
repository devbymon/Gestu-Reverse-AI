import type { CSSProperties } from 'react'
import type { GestureRecognitionState } from '../types/gestures'
import { GESTURE_PRESENTATION, getDisplayedGesture } from '../utils/gesturePresentation'
import GestureDebugPanel from './GestureDebugPanel'

interface GestureIndicatorProps {
  state: GestureRecognitionState
}

export default function GestureIndicator({ state }: GestureIndicatorProps) {
  const displayedGesture = getDisplayedGesture(state.gesture, state.candidate)
  const presentation = GESTURE_PRESENTATION[displayedGesture]
  const progress = state.tracking
    ? Math.round((state.isTransient ? 1 : state.stability) * 100)
    : 0
  return (
    <section
      className="gesture-indicator"
      style={{ '--gesture-color': presentation.color } as CSSProperties}
      aria-label="Gesture recognition"
      aria-live="polite"
    >
      <div className="gesture-indicator__topline">
        <span>Gesture stage</span>
        <span className={state.stability >= 1 ? 'is-stable' : ''}>
          {state.tracking ? state.stability >= 1 ? 'Stable' : 'Stabilizing' : 'Waiting'}
        </span>
      </div>
      <div className="gesture-indicator__result">
        <span className="gesture-indicator__symbol" aria-hidden="true">{presentation.symbol}</span>
        <div><strong>{presentation.label}</strong><span>Effect · {presentation.action}</span></div>
      </div>
      <div
        className="gesture-meter"
        role="progressbar"
        aria-label="Gesture recognition stability"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="gesture-meter__label"><span>Recognition stability</span><span>{state.handCount} {state.handCount === 1 ? 'hand' : 'hands'}</span></div>
      <GestureDebugPanel state={state} />
    </section>
  )
}
