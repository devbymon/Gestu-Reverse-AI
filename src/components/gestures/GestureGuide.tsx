import { useState, type CSSProperties } from 'react'
import type { GestureRecognitionState, GestureType } from '../../types/gestures'
import { GESTURE_PRESENTATION, getDisplayedGesture } from '../../utils/gesturePresentation'
import Icon from '../ui/Icon'

interface GestureGuideProps { state: GestureRecognitionState }

const GUIDE_GESTURES: GestureType[] = [
  'FIST', 'OPEN_PALM', 'INDEX_POINT', 'PEACE', 'PINCH', 'TWO_HAND_EXPANSION',
]

export default function GestureGuide({ state }: GestureGuideProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const displayedGesture = getDisplayedGesture(state.gesture, state.candidate)
  return (
    <aside className={`gesture-map ${mobileExpanded ? 'is-mobile-expanded' : 'is-mobile-collapsed'}`} aria-label="Gesture and effect guide">
      <div className="gesture-map__heading">
        <span>Gesture map</span>
        <small>{state.tracking ? 'Live' : 'Reference'}</small>
        <button
          className="gesture-map__mobile-toggle"
          type="button"
          aria-label={mobileExpanded ? 'Close gesture map' : 'Open gesture map'}
          aria-expanded={mobileExpanded}
          onClick={() => setMobileExpanded((expanded) => !expanded)}
        >
          <Icon name={mobileExpanded ? 'close' : 'menu'} size={19} />
        </button>
      </div>
      <div className="gesture-map__rows">
        {GUIDE_GESTURES.map((gesture) => {
          const item = GESTURE_PRESENTATION[gesture]
          const active = state.tracking && displayedGesture === gesture
          return (
            <div
              key={gesture}
              className={`gesture-map__row ${active ? 'is-active' : ''}`}
              style={{ '--gesture-color': item.color } as CSSProperties}
              aria-current={active ? 'true' : undefined}
            >
              <span className="gesture-map__symbol" aria-hidden="true">{item.symbol}</span>
              <strong>{item.label}</strong><span aria-hidden="true">→</span><span>{item.action}</span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
