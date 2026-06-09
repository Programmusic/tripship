<template>
  <div class="universe-wrap" ref="containerRef">
    <canvas ref="canvasRef" class="universe-wrap__canvas" />
    <div class="universe-wrap__vignette" aria-hidden="true" />
    <div class="universe-wrap__hud" aria-hidden="true">
      <span class="hud-coords">RA 14h 32m · DEC +42° · WARP {{ warpDisplay }}</span>
    </div>
    <div v-if="!ready" class="universe-wrap__loading">
      <span>Hoistin' the galleon into the void...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { buildGalleon, animateGalleon } from '@/three/buildGalleon.js'
import { createUniverse, animateUniverse } from '@/three/createUniverse.js'

const containerRef = ref(null)
const canvasRef = ref(null)
const ready = ref(false)
const warpDisplay = ref('7.2')

let renderer, composer, scene, camera, ship, universe
let animId = 0
let clock
let resizeObserver

function init() {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020408, 0.012)

  camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300)
  camera.position.set(2.5, 1.8, 6)
  camera.lookAt(0, 0.5, -5)

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Lighting
  scene.add(new THREE.AmbientLight(0x1a1a3e, 0.4))

  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2)
  keyLight.position.set(5, 8, 5)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.8)
  rimLight.position.set(-5, 2, -3)
  scene.add(rimLight)

  const fillPink = new THREE.DirectionalLight(0xff00ff, 0.4)
  fillPink.position.set(0, -3, 2)
  scene.add(fillPink)

  universe = createUniverse(isMobile)
  scene.add(universe)

  ship = buildGalleon()
  ship.position.set(0, 0, 0)
  scene.add(ship)

  // Bloom post-processing
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    isMobile ? 1.0 : 1.6,
    0.55,
    0.12
  )
  composer.addPass(bloom)

  clock = new THREE.Clock()
  ready.value = true
  animate()
}

function animate() {
  animId = requestAnimationFrame(animate)
  const time = clock.getElapsedTime()
  const speed = 1 + Math.sin(time * 0.3) * 0.15

  animateGalleon(ship, time)
  animateUniverse(universe, time, speed)

  // Cinematic camera sway
  camera.position.x = 2.5 + Math.sin(time * 0.4) * 0.4
  camera.position.y = 1.8 + Math.cos(time * 0.35) * 0.25
  camera.lookAt(
    Math.sin(time * 0.2) * 0.3,
    0.5 + Math.sin(time * 0.5) * 0.1,
    -8
  )

  warpDisplay.value = (6.5 + Math.sin(time * 0.8) * 0.8).toFixed(1)

  composer.render()
}

function onResize() {
  const container = containerRef.value
  if (!container || !renderer || !camera || !composer) return

  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
}

function cleanup() {
  cancelAnimationFrame(animId)
  resizeObserver?.disconnect()

  composer?.dispose()
  renderer?.dispose()

  scene?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material.dispose()
    }
  })
}

onMounted(() => {
  init()
  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(containerRef.value)
})

onUnmounted(cleanup)
</script>

<style scoped>
.universe-wrap {
  position: relative;
  width: 100%;
  height: min(70vh, 560px);
  min-height: 320px;
  margin: 0 auto 1.5rem;
  border: 2px solid rgba(201, 162, 39, 0.4);
  border-radius: 4px;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0a1020 0%, #020408 100%);
  box-shadow:
    0 0 60px rgba(0, 255, 204, 0.1),
    0 0 120px rgba(255, 0, 255, 0.05),
    inset 0 0 80px rgba(0, 0, 0, 0.8);
}

.universe-wrap__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.universe-wrap__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(2, 4, 8, 0.85) 100%);
}

.universe-wrap__hud {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  pointer-events: none;
}

.hud-coords {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(0, 255, 204, 0.5);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.universe-wrap__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 4, 8, 0.9);
  color: var(--gold);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  animation: pulse-load 1.5s ease-in-out infinite;
}

@keyframes pulse-load {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
