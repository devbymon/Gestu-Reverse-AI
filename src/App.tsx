
import ParticleScene from './components/ParticleScene'
import './App.css'

function App() {
  return (
    <main className="app">
      <header className="header">
        <span className="eyebrow">INTERACTIVE AI EXPERIENCE</span>
        <h1>Gestu Reverse AI</h1>
        <p>Control the universe with your hands.</p>
      </header>

      <section className="scene">
        <ParticleScene />
      </section>

      <footer className="footer">
        PARTICLE ENGINE • 10,000 PARTICLES • THREE.JS
      </footer>
    </main>
  )
}

export default App