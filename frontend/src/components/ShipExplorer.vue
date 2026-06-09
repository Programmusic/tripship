<template>
  <div class="explorer" ref="containerRef">
    <canvas ref="canvasRef" class="explorer__canvas" />
    <div ref="labelsRef" class="explorer__labels" />

    <div
      class="explorer__fade"
      :class="{ 'explorer__fade--active': enterFade > 0 }"
      :style="{ opacity: enterFade }"
    />

    <div
      class="explorer__vignette"
      :class="{
        'explorer__vignette--peek': viewMode === 'peek',
        'explorer__vignette--interior': viewMode === 'interior',
      }"
    />

    <div class="explorer__chrome">
      <RouterLink v-if="viewMode !== 'interior'" to="/" class="explorer__back btn btn--ghost">← Back to Port</RouterLink>
      <button v-else class="explorer__back btn btn--ghost" @click="exitInterior">← Back to Deck</button>
      <div class="explorer__hints">
        <template v-if="viewMode === 'orbit'">
          <span>Drag to spin</span><span>·</span><span>Scroll to zoom</span><span>·</span><span>Tap a door</span>
        </template>
        <template v-else-if="viewMode === 'flying'">
          <span>Sailin' to the door...</span>
        </template>
        <template v-else-if="viewMode === 'peek'">
          <span>Peep inside</span><span>·</span><span>Enter when ready</span>
        </template>
        <template v-else-if="viewMode === 'interior'">
          <span>WASD move</span><span>·</span><span>Mouse look</span><span>·</span><span>E interact</span>
        </template>
      </div>
    </div>

    <Transition name="panel">
      <div v-if="selected && viewMode === 'peek'" class="explorer__panel card">
        <button class="panel-close" @click="releaseRoom" aria-label="Close">✕</button>
        <p class="panel-eyebrow">☠ Below decks ☠</p>
        <h2>{{ selected.label }}</h2>
        <p>{{ selected.desc }}</p>
        <div class="panel-actions">
          <button class="btn btn--ghost" @click="releaseRoom">Step Back</button>
          <button class="btn btn--pink" @click="enterRoom">
            Walk Inside →
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="hud">
      <div v-if="viewMode === 'interior' && interactPrompt" class="explorer__interact">
        <span class="interact-key">E</span>
        <span>{{ interactPrompt }}</span>
      </div>
    </Transition>

    <div v-if="viewMode === 'interior' && isMobile" class="explorer__touch">
      <div class="touch-pad touch-pad--move">
        <button class="touch-btn touch-btn--up" @pointerdown.prevent="setMove(1,0)" @pointerup.prevent="setMove(0,0)" @pointerleave.prevent="setMove(0,0)">▲</button>
        <button class="touch-btn touch-btn--left" @pointerdown.prevent="setMove(0,-1)" @pointerup.prevent="setMove(0,0)" @pointerleave.prevent="setMove(0,0)">◀</button>
        <button class="touch-btn touch-btn--right" @pointerdown.prevent="setMove(0,1)" @pointerup.prevent="setMove(0,0)" @pointerleave.prevent="setMove(0,0)">▶</button>
        <button class="touch-btn touch-btn--down" @pointerdown.prevent="setMove(-1,0)" @pointerup.prevent="setMove(0,0)" @pointerleave.prevent="setMove(0,0)">▼</button>
      </div>
      <button
        v-if="interactPrompt"
        class="touch-action btn btn--pink"
        @click="doInteract"
      >
        {{ interactPrompt }}
      </button>
    </div>

    <div v-if="!ready" class="explorer__loading">Boardin' the galleon...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { buildGalleon, animateGalleon } from '@/three/buildGalleon.js'
import { createStarLayer } from '@/three/createUniverse.js'
import { createHotspotMarkers, animateHotspots, SHIP_LOCATIONS } from '@/three/shipHotspots.js'
import { createShipInteriors, showInteriorPeek, hideAllInteriors } from '@/three/shipInteriors.js'
import {
  createDoorFlight,
  updateFlight,
  advanceFlightPhase,
  startEnterFlight,
} from '@/three/cameraFlight.js'
import { FPSController } from '@/three/interiors/fpsController.js'
import { getOrBuildInterior, enterInteriorMode, exitInteriorMode } from '@/three/interiors/interiorManager.js'
import { animateInterior, findInteractable, isNearExit } from '@/three/interiors/interiorScenes.js'

const router = useRouter()
const containerRef = ref(null)
const canvasRef = ref(null)
const labelsRef = ref(null)
const ready = ref(false)
const selected = ref(null)
const viewMode = ref('orbit')
const enterFade = ref(0)
const interactPrompt = ref('')
const isMobile = ref(false)

let renderer, labelRenderer, composer, scene, camera, ship, controls, hotspots, clock
let interiorRooms, interiorGroup, interiorMeta, fpsController
let animId = 0
let resizeObserver
let activeFlight = null
let raycaster, pointer
let labelElements = []
let savedOrbitPos, savedOrbitTarget
let stars

function init() {
  const container = containerRef.value
  const canvas = canvasRef.value
  const labelsEl = labelsRef.value
  if (!container || !canvas || !labelsEl) return

  isMobile.value = window.matchMedia('(max-width: 768px)').matches
  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020408)
  scene.fog = new THREE.FogExp2(0x020408, 0.022)

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
  camera.position.set(5, 3, 5)

  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile.value })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile.value ? 1.5 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(width, height)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelsEl.appendChild(labelRenderer.domElement)

  scene.add(new THREE.AmbientLight(0x334466, 0.55))
  const key = new THREE.DirectionalLight(0xffeedd, 1.5)
  key.position.set(6, 10, 4)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x00ffcc, 0.45)
  rim.position.set(-4, 2, -3)
  scene.add(rim)

  stars = createStarLayer(isMobile.value ? 1500 : 3000, 80, 0.1, 0xffffff, 0.8)
  scene.add(stars)

  const dock = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.5, 0.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.9 })
  )
  dock.position.y = -0.85
  scene.add(dock)

  ship = buildGalleon()
  ship.rotation.y = Math.PI / 4
  scene.add(ship)

  hotspots = createHotspotMarkers(ship)
  interiorRooms = createShipInteriors(ship, SHIP_LOCATIONS)

  SHIP_LOCATIONS.forEach((loc) => {
    const el = document.createElement('button')
    el.className = 'hotspot-label'
    el.textContent = loc.label
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      selectRoom(loc)
    })
    labelElements.push(el)
    const label = new CSS2DObject(el)
    label.position.copy(loc.position)
    label.position.y += 0.45
    ship.add(label)
  })

  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 2.2
  controls.maxDistance = 14
  controls.maxPolarAngle = Math.PI / 1.55
  controls.target.set(0, 0.5, 0)

  fpsController = new FPSController(camera, canvas, { minX: -4, maxX: 4, minZ: -5, maxZ: 5 })

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(width, height),
    isMobile.value ? 0.9 : 1.35,
    0.5,
    0.15
  ))

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  canvas.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('keydown', onKeyDown)

  clock = new THREE.Clock()
  ready.value = true
  animate()
}

function selectRoom(loc) {
  if (viewMode.value === 'flying' || viewMode.value === 'entering' || viewMode.value === 'interior') return

  hideAllInteriors(interiorRooms.rooms)
  selected.value = loc
  viewMode.value = 'flying'
  controls.enabled = false

  activeFlight = createDoorFlight(camera, controls, ship, loc)
  activeFlight.progress = 0
}

function releaseRoom() {
  hideAllInteriors(interiorRooms.rooms)
  selected.value = null
  viewMode.value = 'orbit'
  activeFlight = null
  controls.enabled = true
  enterFade.value = 0
}

function enterRoom() {
  if (!selected.value || !activeFlight) return
  viewMode.value = 'entering'
  startEnterFlight(activeFlight)
}

function startInteriorWalk() {
  const loc = selected.value
  if (!loc) return

  const interiorData = getOrBuildInterior(loc)
  if (!interiorData) return

  savedOrbitPos = camera.position.clone()
  savedOrbitTarget = controls.target.clone()

  interiorGroup = enterInteriorMode({
    scene,
    ship,
    hotspots,
    interiorPeekRooms: interiorRooms,
    labelElements,
    interiorData,
  })
  interiorMeta = interiorData.meta
  stars.visible = false

  fpsController.bounds = interiorMeta.bounds
  fpsController.enable(interiorMeta.spawn, interiorMeta.spawnYaw)
  if (!isMobile.value) fpsController.requestPointerLock()

  viewMode.value = 'interior'
  activeFlight = null
  controls.enabled = false
  enterFade.value = 0
}

function exitInterior() {
  enterFade.value = 1

  setTimeout(() => {
    fpsController.disable()
    document.exitPointerLock?.()

    exitInteriorMode({
      scene,
      ship,
      hotspots,
      labelElements,
      interiorGroup,
    })
    interiorGroup = null
    interiorMeta = null
    stars.visible = true

    if (savedOrbitPos) camera.position.copy(savedOrbitPos)
    if (savedOrbitTarget) controls.target.copy(savedOrbitTarget)
    controls.enabled = true
    camera.rotation.set(0, 0, 0)

    hideAllInteriors(interiorRooms.rooms)
    selected.value = null
    viewMode.value = 'orbit'
    interactPrompt.value = ''
    enterFade.value = 0
  }, 350)
}

function doInteract() {
  if (viewMode.value !== 'interior' || !interiorGroup) return

  if (isNearExit(interiorGroup, camera, interiorMeta)) {
    exitInterior()
    return
  }

  const target = findInteractable(interiorGroup, camera)
  if (target?.userData.isTerminal) {
    const route = selected.value?.route
    if (route) router.push(route)
  }
}

function onKeyDown(e) {
  if (viewMode.value === 'interior' && (e.key === 'e' || e.key === 'E')) {
    doInteract()
  }
  if (viewMode.value === 'interior' && e.key === 'Escape') {
    exitInterior()
  }
}

function setMove(forward, strafe) {
  fpsController?.setMobileInput(forward, strafe)
}

function onPointerDown(event) {
  if (viewMode.value === 'interior') {
    if (!isMobile.value) fpsController.requestPointerLock()
    return
  }
  if (viewMode.value !== 'orbit') return

  const rect = canvasRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(hotspots.children, true)
  if (hits.length > 0) {
    let obj = hits[0].object
    while (obj.parent && !obj.userData.location) obj = obj.parent
    if (obj.userData.location) selectRoom(obj.userData.location)
  }
}

function updateInteractPrompt() {
  if (viewMode.value !== 'interior' || !interiorGroup) {
    interactPrompt.value = ''
    return
  }

  if (isNearExit(interiorGroup, camera, interiorMeta)) {
    interactPrompt.value = 'Exit to deck'
    return
  }

  const target = findInteractable(interiorGroup, camera)
  if (target?.userData.isTerminal) {
    interactPrompt.value = `Open ${target.userData.terminalLabel}`
    return
  }

  interactPrompt.value = ''
}

function animate() {
  animId = requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  if (viewMode.value === 'orbit') {
    animateGalleon(ship, time * 0.2)
    ship.rotation.y += 0.0008
  }

  animateHotspots(hotspots, time, selected.value?.id)

  if (activeFlight) {
    const result = updateFlight(activeFlight, delta)

    if (result.position) camera.position.copy(result.position)
    if (result.target) controls.target.copy(result.target)

    const roomEntry = interiorRooms.rooms.get(activeFlight.location.id)
    if (roomEntry && result.peekProgress > 0) {
      showInteriorPeek(roomEntry, result.peekProgress)
    }

    if (result.done) {
      if (result.phase === 'approach') {
        advanceFlightPhase(activeFlight)
      } else if (result.phase === 'peek') {
        viewMode.value = 'peek'
        showInteriorPeek(roomEntry, 1)
      } else if (result.phase === 'enter') {
        enterFade.value = Math.min(1, (result.enterProgress ?? 1) * 1.1)
        if (result.enterProgress >= 0.92) {
          startInteriorWalk()
          return
        }
      }
    }
  }

  if (viewMode.value === 'interior') {
    fpsController.update(delta)
    animateInterior(interiorGroup, time)
    updateInteractPrompt()
  }

  if (controls.enabled) controls.update()

  composer.render()
  if (viewMode.value !== 'interior') {
    labelRenderer.render(scene, camera)
  }

  labelElements.forEach((el) => {
    const orbit = viewMode.value === 'orbit'
    el.style.opacity = orbit ? '1' : '0.35'
    el.style.pointerEvents = orbit ? 'auto' : 'none'
  })
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
  window.removeEventListener('keydown', onKeyDown)
  fpsController?.disable()
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
  cursor: grab;
}

.explorer__canvas:active {
  cursor: grabbing;
}

.explorer__labels {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.explorer__labels :deep(.hotspot-label) {
  pointer-events: auto;
  background: rgba(10, 14, 24, 0.9);
  border: 1px solid var(--gold);
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.4s, background 0.2s, transform 0.2s;
}

.explorer__labels :deep(.hotspot-label:hover) {
  background: var(--gold);
  color: var(--bg-deep);
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(201, 162, 39, 0.6);
}

.explorer__fade {
  position: absolute;
  inset: 0;
  background: #020408;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.35s ease;
  z-index: 20;
}

.explorer__fade--active {
  pointer-events: all;
}

.explorer__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(2, 4, 8, 0.5) 100%);
  transition: background 0.8s ease;
  z-index: 2;
}

.explorer__vignette--peek {
  background: radial-gradient(ellipse at center, transparent 30%, rgba(2, 4, 8, 0.85) 100%);
}

.explorer__vignette--interior {
  background: radial-gradient(ellipse at center, transparent 55%, rgba(10, 8, 16, 0.7) 100%);
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
  z-index: 10;
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
  width: min(420px, calc(100% - 2rem));
  z-index: 15;
  border: 2px solid var(--gold);
  box-shadow: 0 0 40px rgba(201, 162, 39, 0.2);
}

.panel-eyebrow {
  font-size: 0.65rem;
  color: var(--neon-cyan);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.explorer__panel h2 {
  font-size: 1.6rem;
  color: var(--gold);
  margin-bottom: 0.5rem;
  padding-right: 1.5rem;
}

.explorer__panel p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
  line-height: 1.6;
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
}

.panel-actions .btn {
  flex: 1;
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.4s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(24px);
}

.explorer__interact {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(10, 14, 24, 0.92);
  border: 1px solid var(--gold);
  padding: 0.65rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  z-index: 15;
  box-shadow: 0 0 24px rgba(201, 162, 39, 0.25);
}

.interact-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--neon-cyan);
  color: var(--neon-cyan);
  font-weight: bold;
  border-radius: 4px;
}

.hud-enter-active,
.hud-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.hud-enter-from,
.hud-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

.explorer__touch {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 12;
}

.touch-pad {
  position: absolute;
  bottom: 2rem;
  left: 1.5rem;
  width: 120px;
  height: 120px;
  pointer-events: auto;
}

.touch-btn {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(10, 14, 24, 0.8);
  border: 1px solid var(--gold);
  color: var(--gold);
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  touch-action: none;
}

.touch-btn--up { top: 0; left: 40px; }
.touch-btn--down { bottom: 0; left: 40px; }
.touch-btn--left { top: 40px; left: 0; }
.touch-btn--right { top: 40px; right: 0; }

.touch-action {
  position: absolute;
  bottom: 2rem;
  right: 1.5rem;
  pointer-events: auto;
  font-size: 0.7rem;
  padding: 0.75rem 1rem;
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
  z-index: 30;
}
</style>
