
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ParticleScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#050510')

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    // Crear 10.000 partículas distribuidas en una esfera
    const particleCount = 10000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    const colorA = new THREE.Color('#00e5ff')
    const colorB = new THREE.Color('#a855f7')

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 2.5 * Math.cbrt(Math.random())

      positions[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta)

      positions[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta)

      positions[i * 3 + 2] =
        radius * Math.cos(phi)

      const color = colorA.clone().lerp(colorB, Math.random())

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    )

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const clock = new THREE.Clock()
    let animationId = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const elapsed = clock.getElapsedTime()

      particles.rotation.y = elapsed * 0.12
      particles.rotation.x = Math.sin(elapsed * 0.3) * 0.2

      const pulse = 1 + Math.sin(elapsed * 1.5) * 0.04
      particles.scale.setScalar(pulse)

      renderer.render(scene, camera)
    }

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth
      const height = container.clientHeight

      if (!width || !height) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    })

    resizeObserver.observe(container)
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}