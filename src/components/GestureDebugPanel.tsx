import type { GestureRecognitionState } from '../types/gestures'

interface GestureDebugPanelProps {
  state: GestureRecognitionState
}

export default function GestureDebugPanel({ state }: GestureDebugPanelProps) {
  return (
    <div className="gesture-diagnostics">
      <span className="gesture-diagnostics__title">Tracking details</span>
      <dl className="gesture-debug">
        <div><dt>Hands</dt><dd>{state.handCount}</dd></div>
        <div><dt>Candidate</dt><dd>{state.candidate.replaceAll('_', ' ')}</dd></div>
        <div><dt>Mode</dt><dd>{state.isTransient ? 'Pulse' : 'Continuous'}</dd></div>
      </dl>
    </div>
  )
}
