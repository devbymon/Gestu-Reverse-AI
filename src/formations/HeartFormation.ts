import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class HeartFormation implements ParticleFormation {
  readonly id = 'HEART' as const

  generate(targets: Float32Array, context: FormationContext): void {
    for (let index = 0; index < context.count; index += 1) {
      const angle = (index / context.count) * Math.PI * 2
      const fill = 0.55 + hash01(index, 23) * 0.45
      const x = 16 * Math.pow(Math.sin(angle), 3)
      const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) - Math.cos(4 * angle)
      const depth = (hash01(index, 29) - 0.5) * 1.25 * (0.5 + fill * 0.5)
      writePosition(targets, index, x * 0.15 * fill, y * 0.15 * fill - 0.25, depth)
    }
  }
}
