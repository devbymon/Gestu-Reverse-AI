import { useEffect, useRef, useState } from 'react'
import { ParticleEngine } from '../engine/ParticleEngine'
import type { ParticlePerformance } from '../types/particles'

export default function ParticleScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [performance, setPerformance] = useState<ParticlePerformance>({
    fps: 60,
    particleCount: 10_000,
    quality: 'high',
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = new ParticleEngine(container, setPerformance)
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
  }, [])

  return (
    <div className="particle-stage">
      <div ref={containerRef} className="particle-canvas" />
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
