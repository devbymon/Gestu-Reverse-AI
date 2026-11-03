import { getEffectPreset } from '../../engine/EffectPresets'
import type { InteractionMode } from '../../types/dashboard'
import type { GestureRecognitionState } from '../../types/gestures'
import type { FormationType } from '../../types/particleEffects'
import { GESTURE_LABELS } from '../../utils/gestureLabels'

interface ViewportOverlayProps {
  formation: FormationType
  gesture: GestureRecognitionState
  mode: InteractionMode
  particleCount: number | null
  compact?: boolean
}

export default function ViewportOverlay({
  formation,
  gesture,
  mode,
  particleCount,
  compact = false,
}: ViewportOverlayProps) {
  return (
    <div className={`viewport-overlay ${compact ? 'is-compact' : ''}`} aria-live="polite">
      <div><span>Formation</span><strong>{getEffectPreset(formation).name}</strong></div>
      <div><span>Gesture</span><strong>{GESTURE_LABELS[gesture.gesture]}</strong></div>
      {!compact && <div><span>Mode</span><strong>{mode === 'AI' ? 'AI Gesture' : 'Manual Demo'}</strong></div>}
      {!compact && <div><span>Particles</span><strong>{particleCount?.toLocaleString() ?? 'N/A'}</strong></div>}
    </div>
  )
}
