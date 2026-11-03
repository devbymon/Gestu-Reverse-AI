import { useCallback, useEffect, useRef, useState } from 'react'
import ParticleScene from './components/ParticleScene'
import CameraPreview, { type CameraPanelHandle } from './components/CameraPreview'
import AppHeader from './components/layout/AppHeader'
import StatusBar from './components/layout/StatusBar'
import ViewportOverlay from './components/layout/ViewportOverlay'
import HelpPanel from './components/help/HelpPanel'
import WelcomeDialog from './components/onboarding/WelcomeDialog'
import PresentationControls from './components/presentation/PresentationControls'
import { useDashboardState } from './hooks/useDashboardState'
import { useGestureRecognition } from './hooks/useGestureRecognition'
import { useParticleEffects } from './hooks/useParticleEffects'
import { usePresentationMode } from './hooks/usePresentationMode'
import type { HandTrackingState } from './types/handTracking'
import type { ParticlePerformance } from './types/particles'
import { getGestureFormation } from './utils/gestureEffects'
import './App.css'

const INITIAL_TRACKING_STATE: HandTrackingState = {
  status: 'off', modelStatus: 'idle', backend: null, handCount: 0, handedness: [], error: null,
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
  const activeEffect = getGestureFormation(gestureState.gesture, gestureState.candidate)
  const { visibility, getSettings, setVisible, dismissWelcome } = dashboard
  const { presentationMode, requestFullscreen, enterPresentation, exitPresentation } = presentation
  const { getEffectCommand } = particleEffects

  const handlePerformance = useCallback((metrics: ParticlePerformance) => setPerformance(metrics), [])
  const handleEngineError = useCallback((message: string | null) => setEngineError(message), [])
  const handleTrackingState = useCallback((state: HandTrackingState) => setTrackingState(state), [])
  const startCamera = useCallback(() => {
    dismissWelcome()
    void cameraRef.current?.enableCamera()
  }, [dismissWelcome])

  const exploreDemo = useCallback(() => {
    dismissWelcome()
  }, [dismissWelcome])

  const togglePresentation = useCallback(() => {
    if (presentationMode) void exitPresentation()
    else void enterPresentation()
  }, [enterPresentation, exitPresentation, presentationMode])

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
        cameraStatus={trackingState.status} presentationMode={presentationMode}
        onHelp={() => setVisible('help', true)}
        onFullscreen={() => void requestFullscreen()}
        onPresentation={togglePresentation}
      />
      <div className="dashboard-shell">
        <section className="particle-viewport" aria-label="Interactive particle viewport">
          <ParticleScene
            getEffectCommand={getEffectCommand} getSettings={getSettings}
            onPerformance={handlePerformance} onEngineError={handleEngineError}
          />
          <div className="hero-copy">
            <span className="hero-index">01 — PARTICLE ENGINE</span>
            <h1>A universe<br />waiting for <em>you.</em></h1>
            <p>Ten thousand points of light, suspended in motion and prepared for real-time gestural input.</p>
          </div>
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
          <CameraPreview
            ref={cameraRef}
            gestureState={gestureState}
            onTrackingFrame={processFrame}
            onTrackingReset={resetGestures}
            onStateChange={handleTrackingState}
          />
        </section>
      </div>
      <StatusBar performance={performance} tracking={trackingState} engineError={engineError} />
      <WelcomeDialog open={visibility.welcome} onStartCamera={startCamera} onExploreDemo={exploreDemo} onClose={dismissWelcome} />
      <HelpPanel open={visibility.help} onClose={() => setVisible('help', false)} />
    </main>
  )
}

export default App
