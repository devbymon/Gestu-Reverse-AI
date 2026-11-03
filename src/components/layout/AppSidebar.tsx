import type { RefObject } from 'react'
import type { InteractionMode } from '../../types/dashboard'
import type { HandTrackingFrame, HandTrackingState } from '../../types/handTracking'
import type { GestureRecognitionState } from '../../types/gestures'
import type { FormationType } from '../../types/particleEffects'
import type { ParticleSettings } from '../../types/particles'
import CameraPreview, { type CameraPanelHandle } from '../CameraPreview'
import GestureIndicator from '../GestureIndicator'
import FormationSelector from '../controls/FormationSelector'
import InteractionModeSelector from '../controls/InteractionModeSelector'
import ParticleControls from '../controls/ParticleControls'
import Icon from '../ui/Icon'

interface AppSidebarProps {
  open: boolean
  cameraRef: RefObject<CameraPanelHandle | null>
  mode: InteractionMode
  activeEffect: FormationType
  settings: ParticleSettings
  gestureState: GestureRecognitionState
  trackingState: HandTrackingState
  showPreview: boolean
  showLandmarks: boolean
  onClose: () => void
  onModeChange: (mode: InteractionMode) => void
  onSelectEffect: (effect: FormationType) => void
  onSettingsChange: (changes: Partial<Omit<ParticleSettings, 'revision'>>) => void
  onReset: () => void
  onPreviewChange: (visible: boolean) => void
  onLandmarksChange: (visible: boolean) => void
  onTrackingFrame: (frame: HandTrackingFrame) => void
  onTrackingReset: () => void
  onTrackingState: (state: HandTrackingState) => void
}

export default function AppSidebar({
  open, cameraRef, mode, activeEffect, settings, gestureState, trackingState,
  showPreview, showLandmarks, onClose, onModeChange, onSelectEffect,
  onSettingsChange, onReset, onPreviewChange, onLandmarksChange,
  onTrackingFrame, onTrackingReset, onTrackingState,
}: AppSidebarProps) {
  const cameraAvailable = trackingState.status === 'active' || trackingState.status === 'no-hands'
  return (
    <aside className={`app-sidebar ${open ? 'is-open' : ''}`} aria-label="Experience controls">
      <div className="sidebar-heading">
        <div><span>Control Surface</span><strong>Experience Lab</strong></div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close controls">
          <Icon name="close" />
        </button>
      </div>
      <InteractionModeSelector
        mode={mode}
        cameraAvailable={cameraAvailable}
        onChange={onModeChange}
      />
      <FormationSelector activeEffect={activeEffect} onSelect={onSelectEffect} />
      <ParticleControls
        settings={settings}
        onChange={onSettingsChange}
        onReset={onReset}
      />
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
        <div className="section-heading"><div><span>04</span><h2 id="gesture-panel-title">Gesture State</h2></div></div>
        <GestureIndicator state={gestureState} />
      </section>
    </aside>
  )
}
