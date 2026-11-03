import { useEffect, useRef, useState } from 'react'
import { ParticleEngine } from '../engine/ParticleEngine'
import type { ParticlePerformance } from '../types/particles'
import type { ParticleEffectCommand } from '../types/particleEffects'

interface ParticleSceneProps {
  getEffectCommand: () => ParticleEffectCommand
}

export default function ParticleScene({ getEffectCommand }: ParticleSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [performance, setPerformance] = useState<ParticlePerformance>({
    fps: 60,
    particleCount: 10_000,
    quality: 'high',
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let engine: ParticleEngine
    try {
      engine = new ParticleEngine(container, setPerformance, getEffectCommand)
    } catch {
      const errorTimer = window.setTimeout(() => {
        setEngineError('WebGL is unavailable. Manual controls and camera tracking remain accessible.')
      }, 0)
      return () => window.clearTimeout(errorTimer)
    }
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
  }, [getEffectCommand])

  return (
    <div className="particle-stage">
      <div ref={containerRef} className="particle-canvas" />
      {engineError && <div className="particle-error" role="alert">{engineError}</div>}
      <div className="particle-metrics" aria-live="polite">
        <span><strong>{performance.fps}</strong> FPS</span>
        <span><strong>{performance.particleCount.toLocaleString()}</strong> particles</span>
        <span className={`quality-dot quality-dot--${performance.quality}`}>
          {performance.quality}
        </span>
      </div>
      <div className="particle-orbit" aria-hidden="true" />
    </div>
  )
}
