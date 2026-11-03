
import ParticleScene from './components/ParticleScene'
import CameraPreview from './components/CameraPreview'
import { useGestureRecognition } from './hooks/useGestureRecognition'
import { useParticleEffects } from './hooks/useParticleEffects'
import DemoControls from './components/DemoControls'
import './App.css'

function App() {
  const gestureRecognition = useGestureRecognition()
  const particleEffects = useParticleEffects(gestureRecognition.commandRef)

  return (
    <main className="app">
      <header className="header" aria-label="Gestu Reverse AI">
        <div className="brand-mark" aria-hidden="true"><span /></div>
        <div>
          <span className="eyebrow">GESTURAL PARTICLE LAB</span>
          <h1>Gestu Reverse <em>AI</em></h1>
        </div>
        <span className="phase-label">PHASE 04 / ADVANCED EFFECTS</span>
      </header>

      <section className="scene">
        <ParticleScene getEffectCommand={particleEffects.getEffectCommand} />
        <div className="hero-copy">
          <span className="hero-index">FORMATION ENGINE ONLINE</span>
          <h2>Eight worlds.<br />One fluid <i>system.</i></h2>
          <p>
            Procedural formations, interruptible transitions and lightweight
            physics respond to gestures—or run entirely without a camera.
          </p>
        </div>
        <CameraPreview
          gestureState={gestureRecognition.state}
          onTrackingFrame={gestureRecognition.processFrame}
          onTrackingReset={gestureRecognition.reset}
        />
        <DemoControls
          manualMode={particleEffects.manualMode}
          selectedEffect={particleEffects.selectedEffect}
          onSelectEffect={particleEffects.selectEffect}
          onReset={particleEffects.resetSphere}
          onGestureControl={particleEffects.enableGestureControl}
        />
      </section>

      <footer className="footer">
        <span>THREE.JS + MEDIAPIPE</span>
        <span className="footer-status"><i /> SYSTEM ONLINE</span>
        <span>LOCAL PROCESSING</span>
      </footer>
    </main>
  )
}

export default App
