import Icon from '../ui/Icon'
import type { TrackingStatus } from '../../types/handTracking'

interface WelcomeDialogProps {
  open: boolean
  cameraStatus: TrackingStatus
  cameraError: string | null
  onStartCamera: () => void
  onContinueWithoutCamera: () => void
}

export default function WelcomeDialog({
  open,
  cameraStatus,
  cameraError,
  onStartCamera,
  onContinueWithoutCamera,
}: WelcomeDialogProps) {
  if (!open) return null
  const isStarting = cameraStatus === 'requesting-permission' || cameraStatus === 'initializing'
  const permissionBlocked = cameraStatus === 'error' &&
    cameraError?.toLowerCase().includes('permission')
  return (
    <div className="camera-gate" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <section className="camera-gate__intro">
        <span className="dialog-kicker">Gestu Reverse AI · Interactive particle system</span>
        <h1 id="welcome-title">A universe<br />waiting for <em>you.</em></h1>
        <p>An AI-powered particle universe that translates local hand gestures into formations, motion, and light—directly in your browser.</p>
      </section>
      <section className="camera-gate__panel">
        <span className="camera-access__icon"><Icon name="camera" size={22} /></span>
        <span className="dialog-kicker">Gestu Reverse AI · Camera access</span>
        <h2>Bring the universe<br />to your hands.</h2>
        <p>Enable your camera to track up to two hands. Frames stay on this device and are never recorded or uploaded.</p>
        {cameraStatus === 'error' && (
          <div className="camera-permission-alert" role="alert">
            <strong>{permissionBlocked ? 'Camera permission is blocked' : 'Camera could not start'}</strong>
            <p>
              {permissionBlocked
                ? 'Click the camera icon in the address bar, select Allow, then try again.'
                : cameraError}
            </p>
          </div>
        )}
        <button className="primary-button" type="button" disabled={isStarting} onClick={onStartCamera}>
          <Icon name="camera" />
          {isStarting
            ? cameraStatus === 'initializing' ? 'Loading hand tracking…' : 'Waiting for permission…'
            : cameraStatus === 'error' ? 'Try camera again' : 'Request camera access'}
        </button>
        <button className="camera-access__skip" type="button" onClick={onContinueWithoutCamera}>Continue without camera</button>
      </section>
    </div>
  )
}
