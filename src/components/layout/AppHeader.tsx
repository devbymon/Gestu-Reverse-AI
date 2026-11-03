import type { TrackingStatus } from '../../types/handTracking'
import Icon from '../ui/Icon'

interface AppHeaderProps {
  cameraStatus: TrackingStatus
  presentationMode: boolean
  onHelp: () => void
  onFullscreen: () => void
  onPresentation: () => void
}

function cameraLabel(status: TrackingStatus): string {
  if (status === 'active' || status === 'no-hands') return 'Camera active'
  if (status === 'initializing' || status === 'requesting-permission') return 'Camera starting'
  if (status === 'error') return 'Camera error'
  return 'Camera off'
}

export default function AppHeader({
  cameraStatus,
  presentationMode,
  onHelp,
  onFullscreen,
  onPresentation,
}: AppHeaderProps) {
  const cameraActive = cameraStatus === 'active' || cameraStatus === 'no-hands'
  return (
    <header className="app-header">
      <div className="app-brand">
        <div className="brand-mark" aria-hidden="true"><span /></div>
        <div><span>AI Interaction Lab</span><strong>Gestu Reverse <em>AI</em></strong></div>
      </div>
      <div className="header-status" aria-label="System status">
        <span><i className="status-dot is-online" /> System online</span>
        <span><i className={cameraActive ? 'status-dot is-online' : 'status-dot'} /> {cameraLabel(cameraStatus)}</span>
        <span className="mode-chip">Gesture control</span>
      </div>
      <nav className="header-actions" aria-label="Application actions">
        <button
          className={`presentation-button ${presentationMode ? 'is-active' : ''}`}
          type="button"
          onClick={onPresentation}
        >
          <Icon name="presentation" /> Present
        </button>
        <button className="icon-button" type="button" onClick={onFullscreen} aria-label="Toggle fullscreen" title="Fullscreen">
          <Icon name="fullscreen" />
        </button>
        <button className="icon-button" type="button" onClick={onHelp} aria-label="Open help" title="Help">
          <Icon name="help" />
        </button>
      </nav>
    </header>
  )
}
