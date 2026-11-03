import { BurstFormation } from '../formations/BurstFormation'
import { GalaxyFormation } from '../formations/GalaxyFormation'
import { HeartFormation } from '../formations/HeartFormation'
import { ImplosionFormation } from '../formations/ImplosionFormation'
import { SphereFormation } from '../formations/SphereFormation'
import { SpiralFormation } from '../formations/SpiralFormation'
import { VortexFormation } from '../formations/VortexFormation'
import { WaveFormation } from '../formations/WaveFormation'
import { WorldFormation } from '../formations/WorldFormation'
import type {
  FormationContext,
  FormationType,
  ParticleFormation,
} from '../types/particleEffects'

export class FormationRegistry {
  private readonly formations = new Map<FormationType, ParticleFormation>()

  constructor() {
    this.register(new WorldFormation())
    this.register(new SphereFormation())
    this.register(new GalaxyFormation())
    this.register(new HeartFormation())
    this.register(new SpiralFormation())
    this.register(new WaveFormation())
    this.register(new BurstFormation())
    this.register(new ImplosionFormation())
    this.register(new VortexFormation())
  }

  generate(
    type: FormationType,
    targets: Float32Array,
    context: FormationContext,
  ): void {
    this.resolve(type).generate(targets, context)
  }

  update(
    type: FormationType,
    targets: Float32Array,
    context: FormationContext,
  ): boolean {
    const formation = this.resolve(type)
    if (!formation.dynamic || !formation.update) return false
    formation.update(targets, context)
    return true
  }

  register(formation: ParticleFormation): void {
    this.formations.set(formation.id, formation)
  }

  private resolve(type: FormationType): ParticleFormation {
    return this.formations.get(type) ?? this.formations.get('SPHERE')!
  }
}
