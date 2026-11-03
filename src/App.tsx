
import ParticleScene from './components/ParticleScene'
import CameraPreview from './components/CameraPreview'
import { useGestureRecognition } from './hooks/useGestureRecognition'
import './App.css'

function App() {
  const gestureRecognition = useGestureRecognition()

  return (
    <main className="app">
      <header className="header" aria-label="Gestu Reverse AI">
        <div className="brand-mark" aria-hidden="true"><span /></div>
        <div>
          <span className="eyebrow">GESTURAL PARTICLE LAB</span>
          <h1>Gestu Reverse <em>AI</em></h1>
        </div>
        <span className="phase-label">PHASE 03 / GESTURE CONTROL</span>
      </header>

      <section className="scene">
        <ParticleScene commandRef={gestureRecognition.commandRef} />
        <div className="hero-copy">
          <span className="hero-index">GESTURE SYSTEM ONLINE</span>
          <h2>Move naturally.<br />Shape the <i>universe.</i></h2>
          <p>
            Stable geometric recognition turns natural hand movement into
            smooth particle formations, waves and kinetic energy.
          </p>
        </div>
        <CameraPreview
          gestureState={gestureRecognition.state}
          onTrackingFrame={gestureRecognition.processFrame}
          onTrackingReset={gestureRecognition.reset}
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
