import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { useHandTracking } from '../hooks/useHandTracking'
import HandLandmarkOverlay, {
  type HandLandmarkOverlayHandle,
} from './HandLandmarkOverlay'
import HandTrackingStatus from './HandTrackingStatus'
import type { HandTrackingFrame, HandTrackingState } from '../types/handTracking'
import Icon from './ui/Icon'

export interface CameraPanelHandle {
  enableCamera: () => Promise<void>
  disableCamera: () => void
}

interface CameraPreviewProps {
  showPreview: boolean
  showLandmarks: boolean
  onPreviewChange: (visible: boolean) => void
  onLandmarksChange: (visible: boolean) => void
  onTrackingFrame: (frame: HandTrackingFrame) => void
  onTrackingReset: () => void
  onStateChange: (state: HandTrackingState) => void
}

const CameraPreview = forwardRef<CameraPanelHandle, CameraPreviewProps>(
  function CameraPreview({
    showPreview,
    showLandmarks,
    onPreviewChange,
    onLandmarksChange,
    onTrackingFrame,
    onTrackingReset,
    onStateChange,
  }, forwardedRef) {
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
      <section className="camera-module control-section" aria-labelledby="camera-title">
        <div className="section-heading">
          <div><span>03</span><h2 id="camera-title">AI Hand Tracking</h2></div>
          <span className="privacy-chip">Local only</span>
        </div>

        <div
          className={`camera-viewport camera-viewport--${state.status} ${showPreview ? '' : 'is-preview-hidden'}`}
          aria-busy={isTransitioning}
        >
          <video
            ref={videoRef}
            className="camera-video"
            muted
            playsInline
            aria-label="Mirrored camera preview"
          />
          <HandLandmarkOverlay ref={overlayRef} visible={showLandmarks} />
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
        </div>

        <HandTrackingStatus state={state} />
        <div className="camera-visibility-controls" role="group" aria-label="Camera visibility">
          <button
            type="button"
            aria-pressed={showPreview}
            onClick={() => onPreviewChange(!showPreview)}
          >
            <Icon name={showPreview ? 'eye' : 'eyeOff'} size={14} />
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
          <button
            type="button"
            aria-pressed={showLandmarks}
            onClick={() => onLandmarksChange(!showLandmarks)}
          >
            <Icon name="hand" size={14} />
            {showLandmarks ? 'Hide landmarks' : 'Show landmarks'}
          </button>
        </div>
        <button
          className={`camera-button ${isRunning ? 'camera-button--stop' : ''}`}
          type="button"
          disabled={isTransitioning}
          onClick={isRunning ? disableCamera : () => void enableCamera()}
        >
          <Icon name="camera" size={15} />
          {isTransitioning ? 'Starting camera…' : isRunning ? 'Disable Camera' : 'Enable Camera'}
        </button>
        <p className="camera-consent">
          Camera access is explicit. Frames are processed locally and never recorded.
        </p>
      </section>
    )
  },
)

export default CameraPreview
