import type { InteractionMode } from '../../types/dashboard'
import Icon from '../ui/Icon'

interface InteractionModeSelectorProps {
  mode: InteractionMode
  cameraAvailable: boolean
  onChange: (mode: InteractionMode) => void
}

export default function InteractionModeSelector({
  mode,
  cameraAvailable,
  onChange,
}: InteractionModeSelectorProps) {
  return (
    <section className="control-section mode-section" aria-labelledby="mode-title">
      <div className="section-heading">
        <div><span>00</span><h2 id="mode-title">Interaction Mode</h2></div>
      </div>
      <div className="mode-switch" role="group" aria-label="Interaction mode">
        <button
          type="button"
          className={mode === 'AI' ? 'is-active' : ''}
          aria-pressed={mode === 'AI'}
          onClick={() => onChange('AI')}
        >
          <Icon name="hand" /> AI Gesture
        </button>
        <button
          type="button"
          className={mode === 'MANUAL' ? 'is-active' : ''}
          aria-pressed={mode === 'MANUAL'}
          onClick={() => onChange('MANUAL')}
        >
          <Icon name="presentation" /> Manual
        </button>
      </div>
      {mode === 'AI' && !cameraAvailable && (
        <p className="control-hint">Enable the camera below to begin AI control.</p>
      )}
    </section>
  )
}
