import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class WaveFormation implements ParticleFormation {
  readonly id = 'WAVE' as const
  readonly dynamic = true

  generate(targets: Float32Array, context: FormationContext): void {
    this.write(targets, context)
  }

  update(targets: Float32Array, context: FormationContext): void {
    this.write(targets, context)
  }

  private write(targets: Float32Array, context: FormationContext): void {
    const side = Math.ceil(Math.sqrt(context.count))
    const gridDenominator = Math.max(1, side - 1)
    const amplitude = 0.45 + context.intensity * 0.95
    for (let index = 0; index < context.count; index += 1) {
      const column = index % side
      const row = Math.floor(index / side)
      const x = (column / gridDenominator - 0.5) * 6.4
      const z = (row / gridDenominator - 0.5) * 6.4
      const phase = context.position.x * 1.2 + context.time * 2.1
      const individualMotion = (hash01(index, 37) - 0.5) * 0.12
      const y = Math.sin(x * 1.55 + phase) *
        Math.cos(z * 1.35 + context.time * 1.4) * amplitude + individualMotion
      writePosition(targets, index, x, y + context.position.y * 0.2, z)
    }
  }
}
