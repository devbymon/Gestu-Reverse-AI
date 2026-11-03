
import ParticleScene from './components/ParticleScene'
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
        <span className="phase-label">PHASE 01 / ENGINE</span>
      </header>

      <section className="scene">
        <ParticleScene />
        <div className="hero-copy">
          <span className="hero-index">01 — PARTICLE ENGINE</span>
          <h2>A universe<br />waiting for <i>you.</i></h2>
          <p>
            Ten thousand points of light, suspended in motion and prepared
            for real-time gestural input.
          </p>
        </div>
      </section>

      <footer className="footer">
        <span>THREE.JS / WEBGL</span>
        <span className="footer-status"><i /> SYSTEM ONLINE</span>
        <span>LOCAL PROCESSING</span>
      </footer>
    </main>
  )
}

export default App
