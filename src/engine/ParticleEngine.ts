import * as THREE from 'three'
import { createInitialCloud } from './ParticleFormations'
import { FormationRegistry } from './FormationRegistry'
import { FormationTransition } from './FormationTransition'
import { getEffectPreset } from './EffectPresets'
import {
  applyDirectionalImpulse,
  applyOrbitalForce,
  applyRadialImpulse,
  applyRepulsion,
  limitVelocities,
} from './ParticleForces'
import { stepParticlePhysics } from './ParticlePhysics'
import type { ParticlePerformance } from '../types/particles'
import type { ParticleSettings } from '../types/particles'
import { DEFAULT_PARTICLE_SETTINGS } from '../types/particles'
import type {
  FormationContext,
  ParticleEffectCommand,
} from '../types/particleEffects'
import { DEFAULT_EFFECT_COMMAND } from '../types/particleEffects'
import { normalizedHandToWorld } from '../utils/coordinateMapping'
import { clamp01 } from '../utils/easing'
import { getParticlePalette } from './ColorPalettes'

const INITIAL_PARTICLE_COUNT = 10_000
const BALANCED_PARTICLE_COUNT = 7_500
const LOW_FPS_THRESHOLD = 42
const LOW_FPS_SAMPLE_LIMIT = 4

const vertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform float uEnergy;

  void main() {
    vColor = aColor;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (1.0 + uEnergy * 0.3) * (150.0 / -viewPosition.z);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  uniform float uEnergy;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.16, distanceToCenter);
    float halo = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float alpha = core * 0.9 + halo * (0.28 + uEnergy * 0.12);
    gl_FragColor = vec4(vColor * (1.0 + core * (1.8 + uEnergy)), alpha);
  }
`

export class ParticleEngine {
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100)
  private readonly renderer: THREE.WebGLRenderer
  private readonly clock = new THREE.Clock()
  private readonly container: HTMLElement
  private readonly onPerformance?: (performance: ParticlePerformance) => void
  private readonly getEffectCommand?: () => ParticleEffectCommand
  private readonly getSettings?: () => ParticleSettings
  private readonly formations = new FormationRegistry()
  private readonly transition = new FormationTransition()
  private readonly uniforms = { uEnergy: { value: 0 } }
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  private velocities: Float32Array<ArrayBufferLike> = new Float32Array()
  private targets: Float32Array<ArrayBufferLike> = new Float32Array()
  private formationTargets: Float32Array<ArrayBufferLike> = new Float32Array()
  private currentCommand: ParticleEffectCommand = DEFAULT_EFFECT_COMMAND
  private animationFrame = 0
  private particleCount = INITIAL_PARTICLE_COUNT
  private elapsedFrames = 0
  private elapsedSampleTime = 0
  private lowFpsSamples = 0
  private formationFrame = 0
  private lastCommandTimestamp = Number.NEGATIVE_INFINITY
  private lastTriggerId = Number.NEGATIVE_INFINITY
  private energy = 0
  private simulationTime = 0
  private settings: ParticleSettings = DEFAULT_PARTICLE_SETTINGS
  private lastSettingsRevision = Number.NEGATIVE_INFINITY
  private contextLost = false
  private quality: ParticlePerformance['quality'] = 'high'

  constructor(
    container: HTMLElement,
    onPerformance?: (performance: ParticlePerformance) => void,
    getEffectCommand?: () => ParticleEffectCommand,
    getSettings?: () => ParticleSettings,
  ) {
    this.container = container
    this.onPerformance = onPerformance
    this.getEffectCommand = getEffectCommand
    this.getSettings = getSettings
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x050510, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.domElement.setAttribute('aria-label', 'Interactive 3D particle formations')
    this.renderer.domElement.setAttribute('role', 'img')
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost)
    this.renderer.domElement.addEventListener('webglcontextrestored', this.handleContextRestored)
    this.container.appendChild(this.renderer.domElement)
    this.camera.position.set(0, 0, 7.6)
    this.createParticles(this.particleCount)
    this.resize()
  }

  start(): void {
    if (this.animationFrame || this.contextLost) return
    this.clock.start()
    this.animate()
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = 0
    this.clock.stop()
  }

  resize(): void {
    const width = Math.max(this.container.clientWidth, 1)
    const height = Math.max(this.container.clientHeight, 1)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  dispose(): void {
    this.stop()
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost)
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored)
    this.disposeParticles()
    this.renderer.renderLists.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }

  private createParticles(count: number): void {
    this.disposeParticles()
    this.particleCount = count
    this.targets = new Float32Array(count * 3)
    this.formationTargets = new Float32Array(count * 3)
    this.transition.resize(count * 3)
    this.generateFormation(this.clock.elapsedTime)
    this.targets.set(this.formationTargets)
    const positions = createInitialCloud(this.formationTargets, 1.45)
    this.velocities = new Float32Array(positions.length)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
    )
    geometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(new Float32Array(positions.length), 3).setUsage(THREE.DynamicDrawUsage),
    )
    geometry.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count), 1))
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.points = new THREE.Points(geometry, material)
    this.scene.add(this.points)
    this.updateParticleStyle()
  }

  private disposeParticles(): void {
    if (!this.points) return
    this.scene.remove(this.points)
    this.points.geometry.dispose()
    this.points.material.dispose()
    this.points = null
  }

  private animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate)
    const delta = Math.min(this.clock.getDelta(), 0.05)
    this.consumeSettings()
    const simulationDelta = delta * this.settings.animationSpeed
    this.simulationTime += simulationDelta
    const elapsed = this.simulationTime
    const points = this.points
    if (!points) return
    const positionAttribute = points.geometry.getAttribute('position')
    const positions = positionAttribute.array as Float32Array

    this.consumeCommand(positions, elapsed)
    this.updateFormation(elapsed)
    this.applyContinuousForces(positions, simulationDelta)
    const isImploding = this.currentCommand.effect === 'IMPLOSION'
    stepParticlePhysics(positions, this.velocities, this.targets, simulationDelta, {
      spring: isImploding ? 0.052 : 0.034,
      damping: isImploding ? 0.9 : 0.885,
      turbulence: 0.0004 + this.currentCommand.intensity * 0.0012,
    })
    limitVelocities(this.velocities, 0.32)
    positionAttribute.needsUpdate = true

    this.energy = Math.max(0, this.energy - simulationDelta * 0.7)
    this.uniforms.uEnergy.value = this.energy
    const preset = getEffectPreset(this.currentCommand.effect)
    points.rotation.y += simulationDelta * preset.rotationSpeed
    points.rotation.x = Math.sin(elapsed * 0.2) * 0.08
    const heartbeat = this.currentCommand.effect === 'HEART'
      ? Math.pow(Math.max(0, Math.sin(elapsed * 3.1)), 8) * 0.07
      : Math.sin(elapsed * 1.25) * 0.018
    points.scale.setScalar(1 + heartbeat + this.energy * 0.025)
    this.camera.position.x = Math.sin(elapsed * 0.13) * 0.16
    this.camera.position.y = Math.cos(elapsed * 0.1) * 0.08
    this.camera.lookAt(0, 0, 0)
    this.renderer.render(this.scene, this.camera)
    this.samplePerformance(delta)
  }

  private consumeCommand(positions: Float32Array, elapsed: number): void {
    const incoming = this.getEffectCommand?.()
    if (!incoming) return
    const commandChanged = incoming.timestamp !== this.lastCommandTimestamp ||
      incoming.effect !== this.currentCommand.effect || incoming.source !== this.currentCommand.source
    const triggerChanged = incoming.triggerId !== this.lastTriggerId
    if (!commandChanged && !triggerChanged) return

    const effectChanged = incoming.effect !== this.currentCommand.effect
    this.lastCommandTimestamp = incoming.timestamp
    this.currentCommand = this.sanitizeCommand(incoming)
    if (effectChanged) {
      this.generateFormation(elapsed)
      const preset = getEffectPreset(this.currentCommand.effect)
      this.transition.begin(positions, this.formationTargets, preset.transitionDuration, elapsed)
      this.updateParticleStyle()
      this.energy = Math.max(this.energy, 0.35)
    } else if (!this.transition.isActive && this.requiresSpatialUpdate()) {
      this.generateFormation(elapsed)
      this.targets.set(this.formationTargets)
    }

    if (triggerChanged && this.currentCommand.trigger) {
      this.lastTriggerId = this.currentCommand.triggerId
      this.applyTrigger(positions)
    }
  }

  private updateFormation(elapsed: number): void {
    if (this.transition.isActive) {
      this.transition.update(this.targets, elapsed)
      return
    }
    this.formationFrame += 1
    if (this.formationFrame % 2 !== 0) return
    const updated = this.formations.update(
      this.currentCommand.effect,
      this.formationTargets,
      this.createFormationContext(elapsed),
    )
    if (updated) this.targets.set(this.formationTargets)
  }

  private applyContinuousForces(positions: Float32Array, delta: number): void {
    const center = normalizedHandToWorld(this.currentCommand.position, this.camera.aspect)
    if (this.currentCommand.effect === 'VORTEX' || this.currentCommand.effect === 'GALAXY') {
      applyOrbitalForce(positions, this.velocities, center, 0.0018, delta)
    }
    if (this.currentCommand.effect === 'ENERGY_BURST') {
      applyRepulsion(positions, this.velocities, center, 1.3, 0.0015, delta)
    }
  }

  private applyTrigger(positions: Float32Array): void {
    const center = normalizedHandToWorld(this.currentCommand.position, this.camera.aspect)
    if (this.currentCommand.trigger === 'BURST') {
      applyRadialImpulse(
        positions,
        this.velocities,
        center,
        0.075 + this.currentCommand.intensity * 0.1,
      )
      this.energy = 1
    } else if (this.currentCommand.trigger === 'RADIAL_PUSH') {
      applyRadialImpulse(
        positions,
        this.velocities,
        center,
        0.11 + this.currentCommand.intensity * 0.14,
      )
      this.energy = 0.9
    } else if (this.currentCommand.trigger === 'DIRECTIONAL_IMPULSE' && this.currentCommand.direction) {
      applyDirectionalImpulse(
        this.velocities,
        this.currentCommand.direction,
        0.09 + this.currentCommand.intensity * 0.14,
      )
      this.energy = 0.82
    }
  }

  private generateFormation(elapsed: number): void {
    this.formations.generate(
      this.currentCommand.effect,
      this.formationTargets,
      this.createFormationContext(elapsed),
    )
  }

  private requiresSpatialUpdate(): boolean {
    return this.currentCommand.effect === 'IMPLOSION' ||
      this.currentCommand.effect === 'VORTEX' ||
      this.currentCommand.effect === 'ENERGY_BURST'
  }

  private createFormationContext(elapsed: number): FormationContext {
    return {
      count: this.particleCount,
      time: elapsed,
      intensity: this.currentCommand.intensity,
      position: normalizedHandToWorld(this.currentCommand.position, this.camera.aspect),
    }
  }

  private sanitizeCommand(command: ParticleEffectCommand): ParticleEffectCommand {
    return {
      ...command,
      intensity: Number.isFinite(command.intensity)
        ? clamp01(command.intensity * this.settings.interactionSensitivity)
        : 0,
      position: command.position && Number.isFinite(command.position.x) && Number.isFinite(command.position.y)
        ? command.position
        : undefined,
      direction: command.direction && Number.isFinite(command.direction.x) && Number.isFinite(command.direction.y)
        ? command.direction
        : undefined,
    }
  }

  private updateParticleStyle(): void {
    const points = this.points
    if (!points) return
    const preset = getEffectPreset(this.currentCommand.effect)
    const palette = getParticlePalette(this.settings.palette)
    const paletteColors = this.settings.palette === 'CUSTOM'
      ? this.settings.customColors
      : palette.colors
    const colors = paletteColors.map((color) => new THREE.Color(color))
    const mixed = new THREE.Color()
    const colorAttribute = points.geometry.getAttribute('aColor') as THREE.BufferAttribute
    const sizeAttribute = points.geometry.getAttribute('aSize') as THREE.BufferAttribute
    const colorArray = colorAttribute.array as Float32Array
    const sizeArray = sizeAttribute.array as Float32Array
    for (let index = 0; index < this.particleCount; index += 1) {
      const offset = index * 3
      const palettePosition = (index % 197) / 196
      const scaled = palettePosition * (colors.length - 1)
      const startIndex = Math.floor(scaled)
      const endIndex = Math.min(colors.length - 1, startIndex + 1)
      mixed.copy(colors[startIndex]).lerp(colors[endIndex], scaled - startIndex)
      colorArray[offset] = mixed.r
      colorArray[offset + 1] = mixed.g
      colorArray[offset + 2] = mixed.b
      sizeArray[index] = (0.072 + ((index * 17) % 23) / 680) *
        preset.particleSize * this.settings.particleSize
    }
    colorAttribute.needsUpdate = true
    sizeAttribute.needsUpdate = true
  }

  private consumeSettings(): void {
    const incoming = this.getSettings?.()
    if (!incoming || incoming.revision === this.lastSettingsRevision) return
    this.lastSettingsRevision = incoming.revision
    const nextCount = Math.round(Math.min(15_000, Math.max(3_000, incoming.particleCount)) / 500) * 500
    const countChanged = nextCount !== this.particleCount
    const styleChanged = incoming.particleSize !== this.settings.particleSize ||
      incoming.palette !== this.settings.palette ||
      incoming.customColors.join() !== this.settings.customColors.join()
    this.settings = {
      ...incoming,
      particleCount: nextCount,
      particleSize: Math.min(1.8, Math.max(0.6, incoming.particleSize)),
      animationSpeed: Math.min(1.8, Math.max(0.4, incoming.animationSpeed)),
      interactionSensitivity: Math.min(1.5, Math.max(0.5, incoming.interactionSensitivity)),
    }
    if (countChanged) {
      this.createParticles(nextCount)
      this.resize()
    } else if (styleChanged) {
      this.updateParticleStyle()
    }
  }

  private samplePerformance(delta: number): void {
    this.elapsedFrames += 1
    this.elapsedSampleTime += delta
    if (this.elapsedSampleTime < 1) return
    const fps = Math.round(this.elapsedFrames / this.elapsedSampleTime)
    this.lowFpsSamples = fps < LOW_FPS_THRESHOLD
      ? this.lowFpsSamples + 1
      : Math.max(0, this.lowFpsSamples - 1)
    if (this.lowFpsSamples >= LOW_FPS_SAMPLE_LIMIT && this.quality === 'high') {
      this.quality = 'balanced'
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))
      this.createParticles(BALANCED_PARTICLE_COUNT)
      this.resize()
    }
    this.onPerformance?.({ fps, particleCount: this.particleCount, quality: this.quality })
    this.elapsedFrames = 0
    this.elapsedSampleTime = 0
  }

  private handleContextLost = (event: Event): void => {
    event.preventDefault()
    this.contextLost = true
    this.stop()
  }

  private handleContextRestored = (): void => {
    this.contextLost = false
    this.start()
  }
}
