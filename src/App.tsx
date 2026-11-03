import { useCallback, useEffect, useRef, useState } from 'react'
import ParticleScene from './components/ParticleScene'
import type { CameraPanelHandle } from './components/CameraPreview'
import AppHeader from './components/layout/AppHeader'
import AppSidebar from './components/layout/AppSidebar'
import StatusBar from './components/layout/StatusBar'
import ViewportOverlay from './components/layout/ViewportOverlay'
import HelpPanel from './components/help/HelpPanel'
import WelcomeDialog from './components/onboarding/WelcomeDialog'
import PresentationControls from './components/presentation/PresentationControls'
import { useDashboardState } from './hooks/useDashboardState'
import { useGestureRecognition } from './hooks/useGestureRecognition'
import { useParticleEffects } from './hooks/useParticleEffects'
import { usePresentationMode } from './hooks/usePresentationMode'
import type { InteractionMode } from './types/dashboard'
import type { HandTrackingState } from './types/handTracking'
import type { ParticlePerformance } from './types/particles'
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
  const particleEffects = useParticleEffects(gestureRecognition.commandRef, gestureRecognition.state.gesture)
  const mode: InteractionMode = particleEffects.manualMode ? 'MANUAL' : 'AI'
  const { settings, visibility, updateSettings, resetSettings, getSettings, setVisible, dismissWelcome } = dashboard
  const { presentationMode, requestFullscreen, enterPresentation, exitPresentation } = presentation
  const { activeEffect, enableGestureControl, enableManualControl, resetSphere, selectEffect, getEffectCommand } = particleEffects

  const handlePerformance = useCallback((metrics: ParticlePerformance) => setPerformance(metrics), [])
  const handleEngineError = useCallback((message: string | null) => setEngineError(message), [])
  const handleTrackingState = useCallback((state: HandTrackingState) => setTrackingState(state), [])
  const closeSidebar = useCallback(() => setVisible('sidebar', false), [setVisible])

  const handleModeChange = useCallback((nextMode: InteractionMode) => {
    if (nextMode === 'AI') enableGestureControl()
    else enableManualControl()
  }, [enableGestureControl, enableManualControl])

  const handleReset = useCallback(() => {
    resetSettings()
    resetSphere()
  }, [resetSettings, resetSphere])

  const startCamera = useCallback(() => {
    dismissWelcome()
    enableGestureControl()
    void cameraRef.current?.enableCamera()
  }, [dismissWelcome, enableGestureControl])

  const exploreDemo = useCallback(() => {
    dismissWelcome()
    selectEffect('SPHERE')
  }, [dismissWelcome, selectEffect])

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
        mode={mode} cameraStatus={trackingState.status} presentationMode={presentationMode}
        onMenu={() => setVisible('sidebar', !visibility.sidebar)}
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
          <ViewportOverlay
            formation={activeEffect} gesture={gestureRecognition.state} mode={mode}
            particleCount={performance?.particleCount ?? null} compact={presentationMode}
          />
          {presentationMode && (
            <PresentationControls
              onExit={() => void exitPresentation()}
              onHelp={() => setVisible('help', true)}
            />
          )}
        </section>
        {visibility.sidebar && <button className="sidebar-backdrop" type="button" aria-label="Close controls" onClick={closeSidebar} />}
        <AppSidebar
          open={visibility.sidebar} cameraRef={cameraRef} mode={mode}
          activeEffect={activeEffect} settings={settings}
          gestureState={gestureRecognition.state} trackingState={trackingState}
          showPreview={visibility.cameraPreview} showLandmarks={visibility.landmarks}
          onClose={closeSidebar} onModeChange={handleModeChange} onSelectEffect={selectEffect}
          onSettingsChange={updateSettings} onReset={handleReset}
          onPreviewChange={(visible) => setVisible('cameraPreview', visible)}
          onLandmarksChange={(visible) => setVisible('landmarks', visible)}
          onTrackingFrame={gestureRecognition.processFrame} onTrackingReset={gestureRecognition.reset}
          onTrackingState={handleTrackingState}
        />
      </div>
      <StatusBar performance={performance} mode={mode} tracking={trackingState} engineError={engineError} />
      <WelcomeDialog open={visibility.welcome} onStartCamera={startCamera} onExploreDemo={exploreDemo} onClose={dismissWelcome} />
      <HelpPanel open={visibility.help} onClose={() => setVisible('help', false)} />
    </main>
  )
}

export default App
