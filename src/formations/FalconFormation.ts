import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class FalconFormation implements ParticleFormation {
  readonly id = 'FALCON' as const

  generate(targets: Float32Array, context: FormationContext): void {
    const wingLimit = Math.floor(context.count * 0.68)
    const bodyLimit = Math.floor(context.count * 0.86)
    const headLimit = Math.floor(context.count * 0.93)

    for (let index = 0; index < context.count; index += 1) {
      const depth = (hash01(index, 71) - 0.5) * 0.32

      if (index < wingLimit) {
        const side = index % 2 === 0 ? -1 : 1
        const span = Math.sqrt(hash01(index, 73))
        const centerY = 0.42 + Math.sin(span * Math.PI) * 0.82 - span * 0.5
        const halfThickness = 0.08 + Math.pow(1 - span, 0.7) * 0.62
        const feather = span > 0.52
          ? Math.sin(span * 46 + hash01(index, 79) * 3) * 0.12 * span
          : 0
        const x = side * (0.3 + span * 3.05)
        const y = centerY + (hash01(index, 83) * 2 - 1) * halfThickness + feather
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < bodyLimit) {
        const vertical = hash01(index, 89)
        const y = -1.18 + vertical * 2.32
        const taper = 1 - Math.abs(vertical - 0.55) * 1.18
        const x = (hash01(index, 97) * 2 - 1) * (0.16 + Math.max(0, taper) * 0.28)
        writePosition(targets, index, x, y, depth * 1.4)
        continue
      }

      if (index < headLimit) {
        const angle = hash01(index, 101) * Math.PI * 2
        const radius = Math.sqrt(hash01(index, 103))
        const x = Math.cos(angle) * radius * 0.43
        const y = 1.12 + Math.sin(angle) * radius * 0.38
        writePosition(targets, index, x, y, depth * 1.25)
        continue
      }

      const featherIndex = index % 3 - 1
      const length = hash01(index, 107)
      const x = featherIndex * (0.18 + length * 0.16) + (hash01(index, 109) - 0.5) * 0.16
      const y = -0.96 - length * (featherIndex === 0 ? 1.22 : 1.02)
      writePosition(targets, index, x, y, depth)
    }
  }
}
