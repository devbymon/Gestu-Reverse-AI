import Icon from '../ui/Icon'

interface HelpPanelProps { open: boolean; onClose: () => void }

const gestures = [
  ['Fist', 'Sphere'], ['Open palm', 'Energy burst'], ['Point', 'Vortex'],
  ['Peace sign', 'Wave'], ['Pinch', 'Implosion'],
  ['Two hands', 'Expansion'],
]

export default function HelpPanel({ open, onClose }: HelpPanelProps) {
  if (!open) return null
  return (
    <div className="modal-backdrop modal-backdrop--side" role="presentation" onMouseDown={onClose}>
      <aside className="help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="help-header">
          <div><span className="dialog-kicker">Quick guide</span><h2 id="help-title">Control the experience</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close help"><Icon name="close" /></button>
        </div>
        <p>Enable the camera and keep your full hand inside the preview. Your gesture selects the particle formation automatically.</p>
        <div className="gesture-guide">
          {gestures.map(([gesture, effect]) => <div key={gesture}><span>{gesture}</span><strong>{effect}</strong></div>)}
        </div>
        <div className="help-note"><Icon name="hand" /><p><strong>Tracking tip</strong><br />Use even lighting, keep your full hand visible, and hold each pose briefly while it stabilizes.</p></div>
        <p className="help-privacy">All vision inference runs locally. No image or video is uploaded or stored.</p>
      </aside>
    </div>
  )
}
