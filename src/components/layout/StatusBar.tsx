import type { HandTrackingState } from '../../types/handTracking'
import type { ParticlePerformance } from '../../types/particles'

interface StatusBarProps {
  performance: ParticlePerformance | null
  tracking: HandTrackingState
  engineError: string | null
}

export default function StatusBar({ performance, tracking, engineError }: StatusBarProps) {
  const mediaPipeState = tracking.modelStatus === 'ready'
    ? `Ready · ${tracking.backend ?? 'Auto'}`
    : tracking.modelStatus
  return (
    <footer className="status-bar" aria-label="Live system metrics">
      <span><i className={engineError ? 'status-dot is-error' : 'status-dot is-online'} /> Engine {engineError ?? 'WebGL ready'}</span>
      <span><strong>{performance?.fps ?? 'N/A'}</strong> FPS</span>
      <span><strong>{performance?.particleCount.toLocaleString() ?? 'N/A'}</strong> particles</span>
      <span><strong>Gesture</strong> control</span>
      <span><strong>{mediaPipeState}</strong> MediaPipe</span>
      <span className="status-bar__privacy">On-device processing</span>
    </footer>
  )
}
