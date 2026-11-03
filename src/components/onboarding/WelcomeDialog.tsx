import { useState } from 'react'
import Icon from '../ui/Icon'

interface WelcomeDialogProps {
  open: boolean
  onStartCamera: () => void
  onContinueWithoutCamera: () => void
}

export default function WelcomeDialog({ open, onStartCamera, onContinueWithoutCamera }: WelcomeDialogProps) {
  const [cameraStep, setCameraStep] = useState(false)
  if (!open) return null
  return (
    <div className={`experience-gate ${cameraStep ? 'is-camera-step' : ''}`} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="experience-gate__progress" aria-label="Introduction progress"><span className="is-active">01</span><i /><span className={cameraStep ? 'is-active' : ''}>02</span></div>
      <section className="experience-intro">
        <div className="experience-orbit" aria-hidden="true"><i /><span /></div>
        <span className="dialog-kicker">Gestu Reverse AI · Interactive particle system</span>
        <h1 id="welcome-title">Programmed,<br />engineered, and<br /><em>waiting for you.</em></h1>
        <p>An AI-powered particle universe that translates local hand gestures into formations, motion, and light—directly in your browser.</p>
        {!cameraStep && <button className="experience-enter" type="button" onClick={() => setCameraStep(true)}>Enter the experience <span aria-hidden="true">→</span></button>}
      </section>
      <section className="camera-access" aria-hidden={!cameraStep}>
        <span className="camera-access__icon"><Icon name="camera" size={22} /></span>
        <span className="dialog-kicker">Step 02 · Camera access</span>
        <h2>Bring the universe<br />to your hands.</h2>
        <p>Enable your camera to track up to two hands. Frames stay on this device and are never recorded or uploaded.</p>
        <button className="primary-button" type="button" onClick={onStartCamera}><Icon name="camera" /> Enable camera & start</button>
        <button className="camera-access__skip" type="button" onClick={onContinueWithoutCamera}>Continue without camera</button>
      </section>
    </div>
  )
}
