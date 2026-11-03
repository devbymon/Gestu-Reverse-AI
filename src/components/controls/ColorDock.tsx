import type { CSSProperties } from 'react'
import { useState } from 'react'
import { PARTICLE_PALETTES } from '../../engine/ColorPalettes'
import type { ParticleSettings } from '../../types/particles'
import Icon from '../ui/Icon'

interface ColorDockProps {
  settings: ParticleSettings
  onChange: (changes: Partial<Omit<ParticleSettings, 'revision'>>) => void
}

export default function ColorDock({ settings, onChange }: ColorDockProps) {
  const [open, setOpen] = useState(false)
  const setCustomColor = (index: number, value: string) => {
    const customColors = [...settings.customColors] as ParticleSettings['customColors']
    customColors[index] = value
    onChange({ palette: 'CUSTOM', customColors })
  }

  return (
    <div className={`color-dock ${open ? 'is-open' : ''}`}>
      <button
        className="color-dock__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="color-studio"
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="palette" size={17} /> <span>Colors</span>
      </button>
      <section id="color-studio" className="color-studio" aria-hidden={!open}>
        <div className="color-studio__heading"><div><small>Particle light</small><strong>Color studio</strong></div><button type="button" onClick={() => setOpen(false)} aria-label="Close colors"><Icon name="close" size={15} /></button></div>
        <div className="color-presets" aria-label="Color presets">
          {PARTICLE_PALETTES.map((palette) => (
            <button
              key={palette.id}
              type="button"
              className={settings.palette === palette.id ? 'is-active' : ''}
              onClick={() => onChange({ palette: palette.id })}
              aria-label={`${palette.name} palette`}
              aria-pressed={settings.palette === palette.id}
            >
              <span style={{ '--swatch-a': palette.colors[0], '--swatch-b': palette.colors[2] } as CSSProperties} />
              {palette.name}
            </button>
          ))}
        </div>
        <div className="custom-colors">
          <span>Custom blend</span>
          <div>
            {settings.customColors.map((color, index) => (
              <label key={index} style={{ '--picker-color': color } as CSSProperties}>
                <input type="color" value={color} onChange={(event) => setCustomColor(index, event.target.value)} aria-label={`Custom particle color ${index + 1}`} />
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
