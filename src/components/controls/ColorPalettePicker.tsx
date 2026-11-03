import { PARTICLE_PALETTES } from '../../engine/ColorPalettes'
import type { ParticlePaletteId } from '../../types/particles'

interface ColorPalettePickerProps {
  value: ParticlePaletteId
  onChange: (value: ParticlePaletteId) => void
}

export default function ColorPalettePicker({ value, onChange }: ColorPalettePickerProps) {
  return (
    <fieldset className="palette-picker">
      <legend>Color palette</legend>
      <div>
        {PARTICLE_PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            className={value === palette.id ? 'is-active' : ''}
            aria-label={`${palette.name} palette`}
            aria-pressed={value === palette.id}
            title={palette.name}
            onClick={() => onChange(palette.id)}
          >
            {palette.colors.map((color) => (
              <i key={color} style={{ backgroundColor: color }} />
            ))}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
