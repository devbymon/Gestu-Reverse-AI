import { EFFECT_PRESETS } from '../../engine/EffectPresets'
import type { FormationType } from '../../types/particleEffects'
import Icon, { type IconName } from '../ui/Icon'

interface FormationSelectorProps {
  activeEffect: FormationType
  onSelect: (effect: FormationType) => void
}

const FORMATION_ICONS: Record<FormationType, IconName> = {
  SPHERE: 'sphere',
  GALAXY: 'galaxy',
  HEART: 'heart',
  SPIRAL: 'spiral',
  WAVE: 'wave',
  ENERGY_BURST: 'burst',
  IMPLOSION: 'implosion',
  VORTEX: 'vortex',
}

export default function FormationSelector({ activeEffect, onSelect }: FormationSelectorProps) {
  return (
    <section className="control-section" aria-labelledby="formation-title">
      <div className="section-heading">
        <div><span>01</span><h2 id="formation-title">Formations</h2></div>
        <small>8 presets</small>
      </div>
      <div className="formation-grid">
        {EFFECT_PRESETS.map((preset) => {
          const active = preset.id === activeEffect
          return (
            <button
              key={preset.id}
              className={`formation-option ${active ? 'is-active' : ''} ${preset.id === 'ENERGY_BURST' ? 'is-action' : ''}`}
              type="button"
              aria-pressed={active}
              title={preset.description}
              onClick={() => onSelect(preset.id)}
            >
              <Icon name={FORMATION_ICONS[preset.id]} size={20} />
              <span>{preset.name}</span>
              {preset.id === 'ENERGY_BURST' && <small>Trigger</small>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
