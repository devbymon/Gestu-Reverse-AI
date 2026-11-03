import type { GestureRecognitionState } from '../types/gestures'

interface GestureDebugPanelProps {
  state: GestureRecognitionState
}

export default function GestureDebugPanel({ state }: GestureDebugPanelProps) {
  return (
    <details className="gesture-diagnostics">
      <summary>Tracking details</summary>
      <dl className="gesture-debug">
        <div><dt>Hands</dt><dd>{state.handCount}</dd></div>
        <div><dt>Candidate</dt><dd>{state.candidate.replaceAll('_', ' ')}</dd></div>
        <div><dt>Mode</dt><dd>{state.isTransient ? 'Pulse' : 'Continuous'}</dd></div>
      </dl>
    </details>
  )
}
