import Icon from '../ui/Icon'

interface WelcomeDialogProps {
  open: boolean
  onStartCamera: () => void
  onContinueWithoutCamera: () => void
}

export default function WelcomeDialog({ open, onStartCamera, onContinueWithoutCamera }: WelcomeDialogProps) {
  if (!open) return null
  return (
    <div className="camera-gate" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <section className="camera-gate__intro">
        <span className="dialog-kicker">Gestu Reverse AI · Interactive particle system</span>
        <h1 id="welcome-title">Programmed,<br />engineered, and<br /><em>waiting for you.</em></h1>
        <p>An AI-powered particle universe that translates local hand gestures into formations, motion, and light—directly in your browser.</p>
        <span className="camera-gate__motto">World class. Our class.</span>
      </section>
      <section className="camera-gate__panel">
        <span className="camera-access__icon"><Icon name="camera" size={22} /></span>
        <span className="dialog-kicker">Gestu Reverse AI · Camera access</span>
        <h2>Bring the universe<br />to your hands.</h2>
        <p>Enable your camera to track up to two hands. Frames stay on this device and are never recorded or uploaded.</p>
        <button className="primary-button" type="button" onClick={onStartCamera}><Icon name="camera" /> Enable camera & start</button>
        <button className="camera-access__skip" type="button" onClick={onContinueWithoutCamera}>Continue without camera</button>
      </section>
    </div>
  )
}
