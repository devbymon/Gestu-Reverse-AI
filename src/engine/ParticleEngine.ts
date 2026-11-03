import * as THREE from 'three'
import {
  createInitialCloud,
  createSphereTargets,
  writeExpandedSphereTargets,
  writeImplosionTargets,
  writeSphereTargets,
  writeVortexTargets,
  writeWaveTargets,
} from './ParticleFormations'
import { stepParticlePhysics } from './ParticlePhysics'
import {
  NEUTRAL_PARTICLE_INTERACTION,
  type ParticleInteraction,
  type ParticlePerformance,
} from '../types/particles'
import type { GestureCommand, GestureType } from '../types/gestures'
import { UNKNOWN_GESTURE_COMMAND } from '../types/gestures'

const INITIAL_PARTICLE_COUNT = 10_000
const BALANCED_PARTICLE_COUNT = 7_500
const SPHERE_RADIUS = 2.45
const LOW_FPS_THRESHOLD = 42
const LOW_FPS_SAMPLE_LIMIT = 4

const vertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (150.0 / -viewPosition.z);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.16, distanceToCenter);
    float halo = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    float alpha = core * 0.9 + halo * 0.28;
    gl_FragColor = vec4(vColor * (1.0 + core * 1.8), alpha);
  }
`

export class ParticleEngine {
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100)
  private readonly renderer: THREE.WebGLRenderer
  private readonly clock = new THREE.Clock()
  private readonly container: HTMLElement
  private readonly onPerformance?: (performance: ParticlePerformance) => void
  private readonly getGestureCommand?: () => GestureCommand
  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
  private velocities: Float32Array<ArrayBufferLike> = new Float32Array()
  private targets: Float32Array<ArrayBufferLike> = new Float32Array()
  private interaction: ParticleInteraction = NEUTRAL_PARTICLE_INTERACTION
  private animationFrame = 0
  private particleCount = INITIAL_PARTICLE_COUNT
  private elapsedFrames = 0
  private elapsedSampleTime = 0
  private lowFpsSamples = 0
  private quality: ParticlePerformance['quality'] = 'high'
  private currentGesture: GestureType = 'UNKNOWN'
  private currentCommand: GestureCommand = UNKNOWN_GESTURE_COMMAND
  private lastCommandTimestamp = Number.NEGATIVE_INFINITY
  private lastSwipeTimestamp = Number.NEGATIVE_INFINITY
  private formationFrame = 0

  constructor(
    container: HTMLElement,
    onPerformance?: (performance: ParticlePerformance) => void,
    getGestureCommand?: () => GestureCommand,
  ) {
    this.container = container
    this.onPerformance = onPerformance
    this.getGestureCommand = getGestureCommand
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x050510, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.domElement.setAttribute('aria-label', 'Animated 3D particle sphere')
    this.renderer.domElement.setAttribute('role', 'img')
    this.container.appendChild(this.renderer.domElement)
    this.camera.position.set(0, 0, 7.2)
    this.createParticles(this.particleCount)
    this.resize()
  }

  start(): void {
    if (this.animationFrame) return
    this.clock.start()
    this.animate()
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrame)
    this.animationFrame = 0
    this.clock.stop()
  }

  setInteraction(interaction: Partial<ParticleInteraction>): void {
    this.interaction = { ...this.interaction, ...interaction }
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
    this.disposeParticles()
    this.renderer.renderLists.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }

  private createParticles(count: number): void {
    this.disposeParticles()
    this.particleCount = count
    this.targets = createSphereTargets(count, SPHERE_RADIUS)
    const positions = createInitialCloud(this.targets, 1.65)
    this.velocities = new Float32Array(positions.length)
    const colors = new Float32Array(positions.length)
    const sizes = new Float32Array(count)
    const cyan = new THREE.Color('#00e5ff')
    const blue = new THREE.Color('#2563eb')
    const violet = new THREE.Color('#a855f7')

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3
      const palettePosition = (index % 197) / 196
      const color = palettePosition < 0.52
        ? cyan.clone().lerp(blue, palettePosition / 0.52)
        : blue.clone().lerp(violet, (palettePosition - 0.52) / 0.48)
      colors[offset] = color.r
      colors[offset + 1] = color.g
      colors[offset + 2] = color.b
      sizes[index] = 0.075 + ((index * 17) % 23) / 650
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
    )
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.points = new THREE.Points(geometry, material)
    this.scene.add(this.points)
    if (this.currentGesture !== 'UNKNOWN') {
      this.writeFormation(this.currentCommand, this.clock.elapsedTime)
    }
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
    const elapsed = this.clock.elapsedTime
    const points = this.points
    if (!points) return

    this.consumeGestureCommand(elapsed)
    this.updateDynamicFormation(elapsed)

    const positionAttribute = points.geometry.getAttribute('position')
    const positions = positionAttribute.array as Float32Array
    stepParticlePhysics(positions, this.velocities, this.targets, delta, {
      spring: 0.035,
      damping: 0.88,
      turbulence: 0.00045 + Math.max(this.interaction.energy, this.currentCommand.intensity) * 0.0015,
    })
    positionAttribute.needsUpdate = true
    const gestureRotation = this.currentGesture === 'INDEX_POINT' ? 0.72 : 0.12
    points.rotation.y += delta * (gestureRotation + this.interaction.energy * 0.12)
    points.rotation.x = Math.sin(elapsed * 0.24) * 0.15
    points.position.x = THREE.MathUtils.lerp(points.position.x, this.interaction.x * 0.5, 0.04)
    points.position.y = THREE.MathUtils.lerp(points.position.y, this.interaction.y * 0.35, 0.04)
    const gestureScale = this.currentGesture === 'TWO_HAND_EXPANSION'
      ? this.currentCommand.intensity * 0.09
      : 0
    const pulse = 1 + Math.sin(elapsed * 1.25) * 0.025 +
      this.interaction.expansion * 0.28 + gestureScale
    points.scale.setScalar(pulse)
    this.camera.position.x = Math.sin(elapsed * 0.13) * 0.16
    this.camera.position.y = Math.cos(elapsed * 0.1) * 0.08
    this.camera.lookAt(0, 0, 0)
    this.renderer.render(this.scene, this.camera)
    this.samplePerformance(delta)
  }

  private consumeGestureCommand(elapsed: number): void {
    const command = this.getGestureCommand?.()
    if (!command || command.timestamp === this.lastCommandTimestamp) return
    this.lastCommandTimestamp = command.timestamp

    if (command.gesture === 'SWIPE') {
      if (command.timestamp !== this.lastSwipeTimestamp) {
        this.lastSwipeTimestamp = command.timestamp
        this.applySwipeImpulse(command)
      }
      return
    }

    const gestureChanged = command.gesture !== this.currentGesture
    this.currentGesture = command.gesture
    this.currentCommand = command
    if (gestureChanged || command.gesture === 'PINCH' || command.gesture === 'INDEX_POINT' ||
      command.gesture === 'TWO_HAND_EXPANSION') {
      this.writeFormation(command, elapsed)
    }
  }

  private updateDynamicFormation(elapsed: number): void {
    this.formationFrame += 1
    if (this.currentGesture !== 'PEACE' || this.formationFrame % 2 !== 0) return
    writeWaveTargets(
      this.targets,
      this.particleCount,
      elapsed,
      0.45 + this.currentCommand.intensity * 0.65,
    )
  }

  private writeFormation(command: GestureCommand, elapsed: number): void {
    const positionX = (command.position?.x ?? 0) * 1.8
    const positionY = (command.position?.y ?? 0) * 1.35
    if (command.gesture === 'FIST') {
      writeSphereTargets(this.targets, this.particleCount, 1.75)
    } else if (command.gesture === 'OPEN_PALM') {
      writeExpandedSphereTargets(this.targets, this.particleCount, 4.1)
    } else if (command.gesture === 'TWO_HAND_EXPANSION') {
      writeExpandedSphereTargets(
        this.targets,
        this.particleCount,
        4.35 + command.intensity * 0.85,
      )
    } else if (command.gesture === 'INDEX_POINT') {
      writeVortexTargets(this.targets, this.particleCount, positionX, positionY)
    } else if (command.gesture === 'PEACE') {
      writeWaveTargets(this.targets, this.particleCount, elapsed, 0.9)
    } else if (command.gesture === 'PINCH') {
      writeImplosionTargets(
        this.targets,
        this.particleCount,
        positionX,
        positionY,
        command.intensity,
      )
    } else {
      writeSphereTargets(this.targets, this.particleCount, SPHERE_RADIUS)
    }
  }

  private applySwipeImpulse(command: GestureCommand): void {
    const direction = command.direction
    if (!direction) return
    const strength = 0.055 + command.intensity * 0.12
    for (let index = 0; index < this.particleCount; index += 1) {
      const offset = index * 3
      const variation = 0.72 + ((index * 31) % 47) / 100
      this.velocities[offset] += direction.x * strength * variation
      this.velocities[offset + 1] += direction.y * strength * variation
      this.velocities[offset + 2] += Math.sin(index * 0.17) * strength * 0.18
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
}
