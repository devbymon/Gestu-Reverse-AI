import { useCallback, useEffect, useRef, useState } from 'react'
import ParticleScene from './components/ParticleScene'
import CameraPreview, { type CameraPanelHandle } from './components/CameraPreview'
import AppHeader from './components/layout/AppHeader'
import StatusBar from './components/layout/StatusBar'
import ViewportOverlay from './components/layout/ViewportOverlay'
import HelpPanel from './components/help/HelpPanel'
import WelcomeDialog from './components/onboarding/WelcomeDialog'
import PresentationControls from './components/presentation/PresentationControls'
import GestureGuide from './components/gestures/GestureGuide'
import ColorDock from './components/controls/ColorDock'
import { useDashboardState } from './hooks/useDashboardState'
import { useGestureRecognition } from './hooks/useGestureRecognition'
import { useParticleEffects } from './hooks/useParticleEffects'
import { usePresentationMode } from './hooks/usePresentationMode'
import type { HandTrackingState } from './types/handTracking'
import type { ParticlePerformance } from './types/particles'
import type { ParticleEffectCommand } from './types/particleEffects'
import { getGestureFormation } from './utils/gestureEffects'
import './App.css'

const INITIAL_TRACKING_STATE: HandTrackingState = {
  status: 'off', modelStatus: 'idle', backend: null, handCount: 0, handedness: [], error: null,
}

const CAMERA_PREVIEW_EFFECT: ParticleEffectCommand = {
  effect: 'WORLD', source: 'GESTURE', intensity: 0.35, triggerId: 0, timestamp: -1,
}

function App() {
  const cameraRef = useRef<CameraPanelHandle>(null)
  const [performance, setPerformance] = useState<ParticlePerformance | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [trackingState, setTrackingState] = useState(INITIAL_TRACKING_STATE)
  const dashboard = useDashboardState()
  const presentation = usePresentationMode()
  const gestureRecognition = useGestureRecognition()
  const { state: gestureState, commandRef, processFrame, reset: resetGestures } = gestureRecognition
  const particleEffects = useParticleEffects(commandRef)
  const { settings, visibility, getSettings, updateSettings, setVisible, dismissWelcome } = dashboard
  const { presentationMode, requestFullscreen, exitPresentation } = presentation
  const { getEffectCommand } = particleEffects
  const activeEffect = visibility.welcome
    ? 'WORLD'
    : getGestureFormation(gestureState.gesture, gestureState.candidate)
  const getSceneEffectCommand = useCallback(() => (
    visibility.welcome ? CAMERA_PREVIEW_EFFECT : getEffectCommand()
  ), [getEffectCommand, visibility.welcome])

  const handlePerformance = useCallback((metrics: ParticlePerformance) => setPerformance(metrics), [])
  const handleEngineError = useCallback((message: string | null) => setEngineError(message), [])
  const handleTrackingState = useCallback((state: HandTrackingState) => {
    setTrackingState(state)
    if (state.status === 'active' || state.status === 'no-hands') dismissWelcome()
  }, [dismissWelcome])
  const startCamera = useCallback(() => {
    void cameraRef.current?.enableCamera()
  }, [])

  const exploreDemo = useCallback(() => {
    dismissWelcome()
  }, [dismissWelcome])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && presentationMode) void exitPresentation()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [exitPresentation, presentationMode])

  return (
    <main className={`dashboard-app ${presentationMode ? 'is-presentation' : ''}`}>
      <AppHeader
        cameraStatus={trackingState.status}
        onHelp={() => setVisible('help', true)}
        onFullscreen={() => void requestFullscreen()}
      />
      <div className="dashboard-shell">
        <section className="particle-viewport" aria-label="Interactive particle viewport">
          <ParticleScene
            getEffectCommand={getSceneEffectCommand} getSettings={getSettings}
            onPerformance={handlePerformance} onEngineError={handleEngineError}
          />
          {!visibility.welcome && <GestureGuide state={gestureState} />}
          <ViewportOverlay
            formation={activeEffect} gesture={gestureState}
            particleCount={performance?.particleCount ?? null} compact={presentationMode}
          />
          {presentationMode && (
            <PresentationControls
              onExit={() => void exitPresentation()}
              onHelp={() => setVisible('help', true)}
            />
          )}
          {!visibility.welcome && <ColorDock settings={settings} onChange={updateSettings} />}
          <div className={`system-camera ${visibility.welcome ? 'is-gated' : ''}`}>
            <CameraPreview
              ref={cameraRef}
              gestureState={gestureState}
              onTrackingFrame={processFrame}
              onTrackingReset={resetGestures}
              onStateChange={handleTrackingState}
            />
          </div>
        </section>
      </div>
      <StatusBar performance={performance} tracking={trackingState} engineError={engineError} />
      <WelcomeDialog
        open={visibility.welcome}
        cameraStatus={trackingState.status}
        cameraError={trackingState.error}
        onStartCamera={startCamera}
        onContinueWithoutCamera={exploreDemo}
      />
      <HelpPanel open={visibility.help} onClose={() => setVisible('help', false)} />
    </main>
  )
}

export default App
