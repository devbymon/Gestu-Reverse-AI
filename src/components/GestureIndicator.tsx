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
  const waitingForHand = !state.tracking || state.handCount === 0
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
        <span>Gesture recognition</span>
        <span className={state.stability >= 1 && !waitingForHand ? 'is-stable' : ''}>
          {waitingForHand ? 'Ready' : state.stability >= 1 ? 'Recognized' : 'Reading gesture…'}
        </span>
      </div>
      <div className="gesture-indicator__result">
        <span className="gesture-indicator__symbol" aria-hidden="true">{presentation.symbol}</span>
        <div>
          <strong>{waitingForHand ? 'Show your hand' : presentation.label}</strong>
          <span>{waitingForHand ? 'Try any gesture from the map' : `Particle effect · ${presentation.action}`}</span>
        </div>
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
      <div className="gesture-meter__label">
        <span>{waitingForHand ? 'Waiting for a hand' : 'Recognition confidence'}</span>
        <span>{waitingForHand ? 'Camera ready' : `${progress}%`}</span>
      </div>
      <GestureDebugPanel state={state} />
    </section>
  )
}
