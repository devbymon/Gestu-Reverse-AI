
import ParticleScene from './components/ParticleScene'
import CameraPreview from './components/CameraPreview'
import './App.css'

function App() {
  return (
    <main className="app">
      <header className="header" aria-label="Gestu Reverse AI">
        <div className="brand-mark" aria-hidden="true"><span /></div>
        <div>
          <span className="eyebrow">GESTURAL PARTICLE LAB</span>
          <h1>Gestu Reverse <em>AI</em></h1>
        </div>
        <span className="phase-label">PHASE 02 / AI VISION</span>
      </header>

      <section className="scene">
        <ParticleScene />
        <div className="hero-copy">
          <span className="hero-index">VISION SYSTEM ONLINE</span>
          <h2>See motion.<br />Understand <i>intent.</i></h2>
          <p>
            On-device hand tracking identifies 21 landmarks per hand while
            the particle engine remains fluid and independent.
          </p>
        </div>
        <CameraPreview />
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
