import type { RefObject } from 'react'
import type { HandTrackingFrame, HandTrackingState } from '../../types/handTracking'
import type { GestureRecognitionState } from '../../types/gestures'
import type { ParticleSettings } from '../../types/particles'
import CameraPreview, { type CameraPanelHandle } from '../CameraPreview'
import GestureIndicator from '../GestureIndicator'
import ParticleControls from '../controls/ParticleControls'
import Icon from '../ui/Icon'

interface AppSidebarProps {
  open: boolean
  cameraRef: RefObject<CameraPanelHandle | null>
  settings: ParticleSettings
  gestureState: GestureRecognitionState
  showPreview: boolean
  showLandmarks: boolean
  onClose: () => void
  onSettingsChange: (changes: Partial<Omit<ParticleSettings, 'revision'>>) => void
  onReset: () => void
  onPreviewChange: (visible: boolean) => void
  onLandmarksChange: (visible: boolean) => void
  onTrackingFrame: (frame: HandTrackingFrame) => void
  onTrackingReset: () => void
  onTrackingState: (state: HandTrackingState) => void
}

export default function AppSidebar({
  open, cameraRef, settings, gestureState,
  showPreview, showLandmarks, onClose,
  onSettingsChange, onReset, onPreviewChange, onLandmarksChange,
  onTrackingFrame, onTrackingReset, onTrackingState,
}: AppSidebarProps) {
  return (
    <aside className={`app-sidebar ${open ? 'is-open' : ''}`} aria-label="Experience controls">
      <div className="sidebar-heading">
        <div><span>Gestu Reverse AI</span><strong>Controls</strong></div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close controls">
          <Icon name="close" />
        </button>
      </div>
      <CameraPreview
        ref={cameraRef}
        showPreview={showPreview}
        showLandmarks={showLandmarks}
        onPreviewChange={onPreviewChange}
        onLandmarksChange={onLandmarksChange}
        onTrackingFrame={onTrackingFrame}
        onTrackingReset={onTrackingReset}
        onStateChange={onTrackingState}
      />
      <section className="control-section gesture-module" aria-labelledby="gesture-panel-title">
        <div className="section-heading"><div><span>02</span><h2 id="gesture-panel-title">Gesture State</h2></div></div>
        <GestureIndicator state={gestureState} />
      </section>
      <ParticleControls
        settings={settings}
        onChange={onSettingsChange}
        onReset={onReset}
      />
    </aside>
  )
}
