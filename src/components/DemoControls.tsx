import { EFFECT_PRESETS } from '../engine/EffectPresets'
import type { FormationType } from '../types/particleEffects'

interface DemoControlsProps {
  manualMode: boolean
  selectedEffect: FormationType
  onSelectEffect: (effect: FormationType) => void
  onReset: () => void
  onGestureControl: () => void
}

export default function DemoControls({
  manualMode,
  selectedEffect,
  onSelectEffect,
  onReset,
  onGestureControl,
}: DemoControlsProps) {
  return (
    <section className="demo-controls" aria-label="Manual visual effects demo">
      <div className="demo-controls__heading">
        <div><span>Demo Mode</span><strong>Visual Effects</strong></div>
        <span className={manualMode ? 'is-manual' : ''}>
          {manualMode ? 'Manual Priority' : 'Gesture Priority'}
        </span>
      </div>
      <label htmlFor="effect-preset">Effect preset</label>
      <select
        id="effect-preset"
        value={selectedEffect}
        onChange={(event) => onSelectEffect(event.target.value as FormationType)}
      >
        {EFFECT_PRESETS.map((preset) => (
          <option key={preset.id} value={preset.id}>{preset.name}</option>
        ))}
      </select>
      <div className="demo-controls__actions">
        <button type="button" onClick={onReset}>Reset Sphere</button>
        <button type="button" onClick={onGestureControl} disabled={!manualMode}>
          Gesture Control
        </button>
      </div>
    </section>
  )
}
