import Icon from '../ui/Icon'

interface WelcomeDialogProps {
  open: boolean
  onStartCamera: () => void
  onExploreDemo: () => void
  onClose: () => void
}

export default function WelcomeDialog({ open, onStartCamera, onExploreDemo, onClose }: WelcomeDialogProps) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close welcome dialog">
          <Icon name="close" />
        </button>
        <div className="welcome-orbit" aria-hidden="true"><span /></div>
        <span className="dialog-kicker">Interactive particle laboratory</span>
        <h1 id="welcome-title">Welcome to<br /><em>Gestu Reverse AI.</em></h1>
        <p>Control thousands of particles using your hands, or watch the ambient particle universe without a camera.</p>
        <div className="welcome-actions">
          <button className="primary-button" type="button" onClick={onStartCamera}>
            <Icon name="camera" /> Start with camera
          </button>
          <button className="secondary-button" type="button" onClick={onExploreDemo}>Explore without camera</button>
        </div>
        <small>Camera access is always optional. Video frames never leave your device.</small>
      </section>
    </div>
  )
}
