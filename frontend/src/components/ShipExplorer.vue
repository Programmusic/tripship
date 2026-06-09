<template>
  <div class="explorer" ref="containerRef">
    <canvas ref="canvasRef" class="explorer__canvas" />
    <div ref="labelsRef" class="explorer__labels" />

    <div class="explorer__chrome">
      <RouterLink to="/" class="explorer__back btn btn--ghost">← Back to Port</RouterLink>
      <div class="explorer__hints">
        <span>Drag to spin</span>
        <span>·</span>
        <span>Scroll to zoom</span>
        <span>·</span>
        <span>Tap a glowin' door</span>
      </div>
    </div>

    <Transition name="panel">
      <div v-if="selected" class="explorer__panel card">
        <button class="panel-close" @click="selected = null" aria-label="Close">✕</button>
        <h2>{{ selected.label }}</h2>
        <p>{{ selected.desc }}</p>
        <div class="panel-actions">
          <button class="btn" @click="focusLocation(selected)">Zoom In</button>
          <RouterLink :to="selected.route" class="btn btn--pink">Enter Room</RouterLink>
        </div>
      </div>
    </Transition>

    <div v-if="!ready" class="explorer__loading">Boardin' the galleon...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { buildGalleon, animateGalleon } from '@/three/buildGalleon.js'
import { createStarLayer } from '@/three/createUniverse.js'
import { createHotspotMarkers, animateHotspots, SHIP_LOCATIONS } from '@/three/shipHotspots.js'

const containerRef = ref(null)
const canvasRef = ref(null)
const labelsRef = ref(null)
const ready = ref(false)
const selected = ref(null)

let renderer, labelRenderer, composer, scene, camera, ship, controls, hotspots, clock
let animId = 0
let resizeObserver
let cameraTarget = null
let raycaster, pointer

function init() {
  const container = containerRef.value
  const canvas = canvasRef.value
  const labelsEl = labelsRef.value
  if (!container || !canvas || !labelsEl) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020408)
  scene.fog = new THREE.FogExp2(0x020408, 0.025)

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
  camera.position.set(5, 3, 5)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelsEl.appendChild(labelRenderer.domElement)

  scene.add(new THREE.AmbientLight(0x334466, 0.6))
  const key = new THREE.DirectionalLight(0xffeedd, 1.4)
  key.position.set(6, 10, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x00ffcc, 0.5)
  rim.position.set(-4, 2, -3)
  scene.add(rim)

  // Subtle star backdrop — ship is the focus
  const stars = createStarLayer(isMobile ? 1500 : 3000, 80, 0.1, 0xffffff, 0.8)
  scene.add(stars)

  // Dock platform
  const dock = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.5, 0.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.9, metalness: 0.2 })
  )
  dock.position.y = -0.85
  scene.add(dock)

  ship = buildGalleon()
  ship.rotation.y = Math.PI / 4
  scene.add(ship)

  hotspots = createHotspotMarkers(ship, (loc) => {
    selected.value = loc
    focusLocation(loc)
  })

  SHIP_LOCATIONS.forEach((loc) => {
    const el = document.createElement('button')
    el.className = 'hotspot-label'
    el.textContent = loc.label
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      selected.value = loc
      focusLocation(loc)
    })
    const label = new CSS2DObject(el)
    label.position.copy(loc.position)
    label.position.y += 0.35
    ship.add(label)
  })

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 2
  controls.maxDistance = 14
  controls.maxPolarAngle = Math.PI / 1.6
  controls.target.set(0, 0.5, 0)

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(width, height),
    isMobile ? 0.8 : 1.2,
    0.45,
    0.18
  ))

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  canvas.addEventListener('pointerdown', onPointerDown)

  clock = new THREE.Clock()
  ready.value = true
  animate()
}

function focusLocation(loc) {
  const worldPos = loc.position.clone()
  ship.localToWorld(worldPos)
  cameraTarget = {
    position: worldPos.clone().add(new THREE.Vector3(1.2, 0.8, 1.2)),
    lookAt: worldPos,
    t: 0,
  }
}

function onPointerDown(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(hotspots.children, true)
  if (hits.length > 0) {
    let obj = hits[0].object
    while (obj.parent && !obj.userData.location) obj = obj.parent
    if (obj.userData.location) {
      selected.value = obj.userData.location
      focusLocation(obj.userData.location)
    }
  }
}

function animate() {
  animId = requestAnimationFrame(animate)
  const time = clock.getElapsedTime()

  animateGalleon(ship, time * 0.3)
  ship.rotation.y += 0.001
  animateHotspots(hotspots, time)

  if (cameraTarget) {
    cameraTarget.t += 0.04
    const alpha = 0.06
    camera.position.lerp(cameraTarget.position, alpha)
    controls.target.lerp(cameraTarget.lookAt, alpha)
    if (camera.position.distanceTo(cameraTarget.position) < 0.05) {
      cameraTarget = null
    }
  }

  controls.update()
  composer.render()
  labelRenderer.render(scene, camera)
}

function onResize() {
  const container = containerRef.value
  if (!container || !renderer) return
  const width = container.clientWidth
  const height = container.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
  labelRenderer.setSize(width, height)
}

function cleanup() {
  cancelAnimationFrame(animId)
  resizeObserver?.disconnect()
  canvasRef.value?.removeEventListener('pointerdown', onPointerDown)
  composer?.dispose()
  renderer?.dispose()
}

onMounted(() => {
  init()
  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(containerRef.value)
})

onUnmounted(cleanup)
</script>

<style scoped>
.explorer {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #020408;
}

.explorer__canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.explorer__labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.explorer__labels :deep(.hotspot-label) {
  pointer-events: auto;
  background: rgba(10, 14, 24, 0.85);
  border: 1px solid var(--gold);
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.explorer__labels :deep(.hotspot-label:hover) {
  background: var(--gold);
  color: var(--bg-deep);
  box-shadow: 0 0 12px rgba(201, 162, 39, 0.5);
}

.explorer__chrome {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  pointer-events: none;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.explorer__chrome > * {
  pointer-events: auto;
}

.explorer__back {
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
}

.explorer__hints {
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.explorer__panel {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(400px, calc(100% - 2rem));
  z-index: 10;
}

.explorer__panel h2 {
  font-size: 1.5rem;
  color: var(--gold);
  margin-bottom: 0.5rem;
  padding-right: 1.5rem;
}

.explorer__panel p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.panel-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
}

.panel-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.panel-actions .btn {
  flex: 1;
  min-width: 120px;
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.explorer__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020408;
  color: var(--gold);
  font-size: 0.9rem;
}
</style>
