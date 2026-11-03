import { useRef } from 'react'
import { useHandTracking } from '../hooks/useHandTracking'
import HandLandmarkOverlay, {
  type HandLandmarkOverlayHandle,
} from './HandLandmarkOverlay'
import HandTrackingStatus from './HandTrackingStatus'

export default function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HandLandmarkOverlayHandle>(null)
  const { state, enableCamera, disableCamera } = useHandTracking(videoRef, overlayRef)
  const isTransitioning = state.status === 'requesting-permission' || state.status === 'initializing'
  const isRunning = state.status === 'active' || state.status === 'no-hands'

  return (
    <aside className="camera-panel" aria-label="AI hand tracking camera">
      <div className="camera-panel__header">
        <div>
          <span className="camera-panel__index">02</span>
          <div>
            <strong>AI Hand Tracking</strong>
            <span>MediaPipe · 21 landmarks</span>
          </div>
        </div>
        <span className="camera-panel__privacy">LOCAL ONLY</span>
      </div>

      <div className={`camera-viewport camera-viewport--${state.status}`} aria-busy={isTransitioning}>
        <video
          ref={videoRef}
          className="camera-video"
          muted
          playsInline
          aria-label="Mirrored camera preview"
        />
        <HandLandmarkOverlay ref={overlayRef} />
        {!isRunning && (
          <div className="camera-placeholder">
            <span className="camera-reticle" aria-hidden="true"><i /></span>
            <strong>
              {state.status === 'initializing'
                ? 'Loading vision model'
                : state.status === 'requesting-permission'
                  ? 'Waiting for permission'
                  : state.status === 'error'
                    ? 'Camera unavailable'
                    : 'Camera is disabled'}
            </strong>
            <span>Your video stays on this device</span>
          </div>
        )}
        {isRunning && <span className="camera-live-badge">LIVE</span>}
      </div>

      <HandTrackingStatus state={state} />

      <button
        className={`camera-button ${isRunning ? 'camera-button--stop' : ''}`}
        type="button"
        disabled={isTransitioning}
        onClick={isRunning ? disableCamera : () => void enableCamera()}
      >
        <span aria-hidden="true" />
        {isTransitioning ? 'Starting camera…' : isRunning ? 'Disable Camera' : 'Enable Camera'}
      </button>
      <p className="camera-consent">
        Camera access starts only after you click. Frames are processed locally and are never recorded.
      </p>
    </aside>
  )
}
