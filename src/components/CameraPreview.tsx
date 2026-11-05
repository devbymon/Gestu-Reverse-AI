import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useHandTracking } from '../hooks/useHandTracking'
import HandLandmarkOverlay, {
  type HandLandmarkOverlayHandle,
} from './HandLandmarkOverlay'
import HandTrackingStatus from './HandTrackingStatus'
import type { HandTrackingFrame, HandTrackingState } from '../types/handTracking'
import type { GestureRecognitionState } from '../types/gestures'
import Icon from './ui/Icon'
import GestureIndicator from './GestureIndicator'

export interface CameraPanelHandle {
  enableCamera: () => Promise<void>
  disableCamera: () => void
}

interface CameraPreviewProps {
  gestureState: GestureRecognitionState
  onTrackingFrame: (frame: HandTrackingFrame) => void
  onTrackingReset: () => void
  onStateChange: (state: HandTrackingState) => void
}

const CameraPreview = forwardRef<CameraPanelHandle, CameraPreviewProps>(
  function CameraPreview({
    gestureState,
    onTrackingFrame,
    onTrackingReset,
    onStateChange,
  }, forwardedRef) {
    const [mobileExpanded, setMobileExpanded] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const overlayRef = useRef<HandLandmarkOverlayHandle>(null)
    const { state, enableCamera, disableCamera } = useHandTracking(
      videoRef,
      overlayRef,
      onTrackingFrame,
      onTrackingReset,
    )
    const isTransitioning = state.status === 'requesting-permission' || state.status === 'initializing'
    const isRunning = state.status === 'active' || state.status === 'no-hands'

    useImperativeHandle(forwardedRef, () => ({ enableCamera, disableCamera }), [disableCamera, enableCamera])
    useEffect(() => onStateChange(state), [onStateChange, state])

    return (
      <aside className={`camera-panel ${mobileExpanded ? 'is-mobile-expanded' : 'is-mobile-collapsed'}`} aria-labelledby="camera-title">
        <div className="section-heading">
          <div><span>01</span><h2 id="camera-title">AI Hand Tracking</h2></div>
          <span className="privacy-chip">Local only</span>
          <div className="camera-panel__mobile-actions">
            <button
              type="button"
              aria-label={mobileExpanded ? 'Minimize camera panel' : 'Expand camera panel'}
              aria-expanded={mobileExpanded}
              onClick={() => setMobileExpanded((expanded) => !expanded)}
            >
              <Icon name={mobileExpanded ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </div>

        <div
          className={`camera-viewport camera-viewport--${state.status}`}
          aria-busy={isTransitioning}
        >
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
          {isRunning && <span className="camera-live-badge">Live</span>}
          {state.status === 'no-hands' && (
            <div className="camera-hand-prompt" role="status">
              <Icon name="hand" size={16} />
              <span><strong>Place your hand in frame</strong><small>Keep fingers visible</small></span>
            </div>
          )}
        </div>

        <div className="camera-panel__details">
          <HandTrackingStatus state={state} />
          <GestureIndicator state={gestureState} />
          <button
            className={`camera-button ${isRunning ? 'camera-button--stop' : ''}`}
            type="button"
            disabled={isTransitioning}
            onClick={isRunning ? disableCamera : () => void enableCamera()}
          >
            <Icon name="camera" size={15} />
            {isTransitioning ? 'Starting camera…' : isRunning ? 'Turn off camera' : 'Enable Camera'}
          </button>
          <p className="camera-consent">
            Processed on this device · Never recorded
          </p>
        </div>
      </aside>
    )
  },
)

export default CameraPreview
