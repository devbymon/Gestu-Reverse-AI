import type { HandTrackingState, TrackingStatus } from '../types/handTracking'

interface HandTrackingStatusProps {
  state: HandTrackingState
}

const STATUS_LABELS: Record<TrackingStatus, string> = {
  off: 'Camera Off',
  'requesting-permission': 'Requesting Permission',
  initializing: 'Initializing AI',
  active: 'Tracking Active',
  'no-hands': 'Camera Ready',
  error: 'Tracking Error',
}

export default function HandTrackingStatus({ state }: HandTrackingStatusProps) {
  const detail = state.handCount > 0
    ? `${state.handCount} ${state.handCount === 1 ? 'hand' : 'hands'} · ${state.handedness.join(' + ')}`
    : state.status === 'no-hands'
      ? 'Show one hand to begin'
    : state.backend
      ? `${state.backend} acceleration`
      : 'On-device vision'

  return (
    <div className={`tracking-status tracking-status--${state.status}`} role="status" aria-live="polite">
      <span className={`tracking-status__signal tracking-status__signal--${state.status}`} />
      <div>
        <strong>{STATUS_LABELS[state.status]}</strong>
        <span>{state.error ?? detail}</span>
      </div>
      <span className={`model-chip model-chip--${state.modelStatus}`}>
        AI {state.modelStatus}
      </span>
    </div>
  )
}
