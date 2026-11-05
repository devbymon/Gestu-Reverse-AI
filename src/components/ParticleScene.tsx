import { useEffect, useRef, useState } from 'react'
import { ParticleEngine } from '../engine/ParticleEngine'
import type { ParticlePerformance } from '../types/particles'
import type { ParticleSettings } from '../types/particles'
import type { ParticleEffectCommand } from '../types/particleEffects'
import type { Theme } from '../hooks/useTheme'

interface ParticleSceneProps {
  getEffectCommand: () => ParticleEffectCommand
  getSettings: () => ParticleSettings
  getTheme: () => Theme
  onPerformance: (performance: ParticlePerformance) => void
  onEngineError: (message: string | null) => void
}

export default function ParticleScene({
  getEffectCommand,
  getSettings,
  getTheme,
  onPerformance,
  onEngineError,
}: ParticleSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [engineError, setEngineError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let engine: ParticleEngine
    try {
      engine = new ParticleEngine(container, onPerformance, getEffectCommand, getSettings, getTheme)
    } catch {
      const errorTimer = window.setTimeout(() => {
        setEngineError('WebGL is unavailable. Camera tracking and appearance settings remain accessible.')
        onEngineError('WebGL unavailable')
      }, 0)
      return () => window.clearTimeout(errorTimer)
    }
    onEngineError(null)
    const resizeObserver = new ResizeObserver(() => engine.resize())
    const handleVisibility = () => {
      if (document.hidden) engine.stop()
      else engine.start()
    }

    resizeObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibility)
    engine.start()

    return () => {
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      engine.dispose()
    }
  }, [getEffectCommand, getSettings, getTheme, onEngineError, onPerformance])

  return (
    <div className="particle-stage">
      <div ref={containerRef} className="particle-canvas" />
      {engineError && <div className="particle-error" role="alert">{engineError}</div>}
      <div className="particle-orbit" aria-hidden="true" />
    </div>
  )
}
