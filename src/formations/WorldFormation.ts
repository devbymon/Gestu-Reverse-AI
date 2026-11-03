import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { fibonacciDirection, hash01, writePosition } from '../utils/particleMath'

function tilt(x: number, y: number, z: number): { x: number; y: number; z: number } {
  const angle = -0.24
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  return { x: x * cosine - y * sine, y: x * sine + y * cosine, z }
}

export class WorldFormation implements ParticleFormation {
  readonly id = 'WORLD' as const

  generate(targets: Float32Array, context: FormationContext): void {
    const surfaceLimit = Math.floor(context.count * 0.72)
    const latitudeLimit = Math.floor(context.count * 0.87)
    const longitudeLimit = Math.floor(context.count * 0.98)
    const radius = 2.08

    for (let index = 0; index < context.count; index += 1) {
      let x: number
      let y: number
      let z: number

      if (index < surfaceLimit) {
        const direction = fibonacciDirection(index, surfaceLimit)
        const shell = radius + (hash01(index, 173) - 0.5) * 0.07
        x = direction.x * shell
        y = direction.y * shell
        z = direction.z * shell
      } else if (index < latitudeLimit) {
        const localIndex = index - surfaceLimit
        const band = localIndex % 5
        const latitude = -0.82 + band * 0.41
        const angle = hash01(index, 179) * Math.PI * 2
        const ringRadius = Math.cos(latitude) * radius
        x = Math.cos(angle) * ringRadius
        y = Math.sin(latitude) * radius
        z = Math.sin(angle) * ringRadius
      } else if (index < longitudeLimit) {
        const localIndex = index - latitudeLimit
        const meridian = localIndex % 7
        const longitude = (meridian / 7) * Math.PI * 2
        const latitude = (hash01(index, 181) - 0.5) * Math.PI
        const ringRadius = Math.cos(latitude) * radius
        x = Math.cos(longitude) * ringRadius
        y = Math.sin(latitude) * radius
        z = Math.sin(longitude) * ringRadius
      } else {
        const angle = hash01(index, 191) * Math.PI * 2
        const orbitRadius = radius * 1.28
        x = Math.cos(angle) * orbitRadius
        y = Math.sin(angle) * orbitRadius * 0.28
        z = Math.sin(angle) * 0.12
      }

      const position = tilt(x, y, z)
      writePosition(targets, index, position.x, position.y, position.z)
    }
  }
}
