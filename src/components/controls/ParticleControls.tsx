import { useState } from 'react'
import type { ParticleSettings } from '../../types/particles'
import ColorPalettePicker from './ColorPalettePicker'
import Icon from '../ui/Icon'

interface ParticleControlsProps {
  settings: ParticleSettings
  onChange: (changes: Partial<Omit<ParticleSettings, 'revision'>>) => void
  onReset: () => void
}

interface SliderRowProps {
  id: string
  label: string
  value: number
  minimum: number
  maximum: number
  step: number
  display: string
  onChange: (value: number) => void
  onCommit?: () => void
}

function SliderRow({
  id, label, value, minimum, maximum, step, display, onChange, onCommit,
}: SliderRowProps) {
  return (
    <label className="slider-row" htmlFor={id}>
      <span><strong>{label}</strong><output htmlFor={id}>{display}</output></span>
      <input
        id={id}
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
      />
    </label>
  )
}

export default function ParticleControls({ settings, onChange, onReset }: ParticleControlsProps) {
  return (
    <section className="control-section" aria-labelledby="particle-controls-title">
      <div className="section-heading">
        <div><span>03</span><h2 id="particle-controls-title">Particle Appearance</h2></div>
        <button className="text-action" type="button" onClick={onReset}>
          <Icon name="reset" size={13} /> Reset
        </button>
      </div>
      <ParticleCountSlider
        key={settings.particleCount}
        committedCount={settings.particleCount}
        onCommit={(particleCount) => onChange({ particleCount })}
      />
      <SliderRow
        id="particle-size"
        label="Particle size"
        value={settings.particleSize}
        minimum={0.6}
        maximum={1.8}
        step={0.1}
        display={`${settings.particleSize.toFixed(1)}×`}
        onChange={(particleSize) => onChange({ particleSize })}
      />
      <SliderRow
        id="animation-speed"
        label="Animation speed"
        value={settings.animationSpeed}
        minimum={0.4}
        maximum={1.8}
        step={0.1}
        display={`${settings.animationSpeed.toFixed(1)}×`}
        onChange={(animationSpeed) => onChange({ animationSpeed })}
      />
      <SliderRow
        id="interaction-sensitivity"
        label="Interaction sensitivity"
        value={settings.interactionSensitivity}
        minimum={0.5}
        maximum={1.5}
        step={0.1}
        display={`${settings.interactionSensitivity.toFixed(1)}×`}
        onChange={(interactionSensitivity) => onChange({ interactionSensitivity })}
      />
      <p className="control-hint">Sensitivity scales effect intensity without changing gesture classification.</p>
      <ColorPalettePicker
        value={settings.palette}
        onChange={(palette) => onChange({ palette })}
      />
    </section>
  )
}

function ParticleCountSlider({ committedCount, onCommit }: { committedCount: number; onCommit: (value: number) => void }) {
  const [draftCount, setDraftCount] = useState(committedCount)
  return (
    <SliderRow
      id="particle-count" label="Particle count" value={draftCount}
      minimum={3_000} maximum={15_000} step={500} display={draftCount.toLocaleString()}
      onChange={setDraftCount} onCommit={() => onCommit(draftCount)}
    />
  )
}
