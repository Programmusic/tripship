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
        'explorer__vignette--artifact': viewMode === 'artifact' || viewMode === 'artifact-enter',
      }"
    />

    <div class="explorer__chrome">
      <RouterLink v-if="!isInsideShip" to="/" class="explorer__back btn btn--ghost">← Back to Port</RouterLink>
      <button v-else-if="viewMode === 'artifact' || viewMode === 'artifact-enter'" class="explorer__back btn btn--ghost" @click="exitArtifact">← Leave the Log</button>
      <button v-else class="explorer__back btn btn--ghost" @click="exitInterior">← Back to Deck</button>
      <div class="explorer__hints">
        <template v-if="viewMode === 'orbit'">
          <span>Drag to spin</span><span>·</span><span>Scroll to zoom</span><span>·</span><span>Tap a door</span>
          <span v-if="shipAudioBlocked">·</span>
          <button v-if="shipAudioBlocked" class="deck-audio-btn" @click="resumeShipAudio">▶ Start ship audio</button>
        </template>
        <template v-else-if="viewMode === 'flying'">
          <span>Sailin' to the door...</span>
        </template>
        <template v-else-if="viewMode === 'peek'">
          <span>Peep inside</span><span>·</span><span>Enter when ready</span>
        </template>
        <template v-else-if="viewMode === 'artifact' && logComplete">
          <span>Log complete</span><span>·</span><span>E to open full log</span><span>·</span><span>Esc to leave</span>
        </template>
        <template v-else-if="viewMode === 'artifact' || viewMode === 'artifact-enter'">
          <span>☠ Captain Flystyle writes...</span><span>·</span><span>Esc to leave</span>
        </template>
        <template v-else-if="viewMode === 'interior' && selected?.id === 'mixes'">
          <span>☠ DJ Krakenbyte on the decks</span><span>·</span><span>E to open mixes</span>
          <span v-if="deckAudioBlocked">·</span>
          <button v-if="deckAudioBlocked" class="deck-audio-btn" @click="resumeDeckAudio">▶ Start deck audio</button>
        </template>
        <template v-else-if="viewMode === 'interior' && selected?.id === 'aaaarrifacts'">
          <span>☠ Arrrrrtifacts vault</span><span>·</span><span>E to open vault</span>
          <span v-if="artifactsAudioBlocked">·</span>
          <button v-if="artifactsAudioBlocked" class="deck-audio-btn" @click="resumeArtifactsAudio">▶ Start vault audio</button>
        </template>
        <template v-else-if="viewMode === 'interior' && selected?.id === 'captains-cabin'">
          <span>Walk to the back wall — golden log under the sign</span><span>·</span><span>E to read</span>
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
      <div
        v-if="(viewMode === 'interior' || (viewMode === 'artifact' && logComplete && !isMobile)) && interactPrompt"
        class="explorer__interact"
      >
        <span class="interact-key">E</span>
        <span>{{ interactPrompt }}</span>
      </div>
    </Transition>

    <Transition name="echo">
      <div v-if="isEchoRoom" class="echo-room">
        <div class="echo-room__frame">
          <p class="echo-room__eyebrow">☠ Echo Room ☠</p>
          <h2 class="echo-room__title">Captain's Log</h2>
        </div>
        <div class="echo-room__parchment">
          <pre class="echo-room__text">{{ logRevealText }}<span v-if="!logComplete" class="echo-room__cursor">|</span></pre>
          <Transition name="hud">
            <button
              v-if="logComplete"
              class="echo-room__continue btn"
              @click="openFullLog"
            >
              Continue to full log →
            </button>
          </Transition>
        </div>
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

    <button
      v-if="viewMode === 'interior' && selected?.id === 'mixes' && deckAudioBlocked && isMobile"
      class="deck-audio-fab btn btn--pink"
      @click="resumeDeckAudio"
    >
      ▶ Start deck audio
    </button>

    <button
      v-if="viewMode === 'interior' && selected?.id === 'aaaarrifacts' && artifactsAudioBlocked && isMobile"
      class="deck-audio-fab btn btn--pink"
      @click="resumeArtifactsAudio"
    >
      ▶ Start vault audio
    </button>

    <TransitionGroup name="slogan" tag="div" class="room-slogans" aria-hidden="true">
      <p
        v-for="slogan in floatingSlogans"
        :key="slogan.id"
        class="room-slogan"
        :style="{
          left: `${slogan.left}%`,
          color: slogan.color,
          animationDelay: `${slogan.delay}s`,
          '--rot': `${slogan.rot}deg`,
        }"
      >
        {{ slogan.text }}
      </p>
    </TransitionGroup>

    <div v-if="!ready" class="explorer__loading">Boardin' the galleon...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import { pickRoomSlogans } from '@/three/roomSlogans.js'
import { createShipInteriors, showInteriorPeek, hideAllInteriors } from '@/three/shipInteriors.js'
import {
  createDoorFlight,
  updateFlight,
  advanceFlightPhase,
  startEnterFlight,
} from '@/three/cameraFlight.js'
import { FPSController } from '@/three/interiors/fpsController.js'
import {
  getOrBuildInterior,
  enterInteriorMode,
  exitInteriorMode,
  createInteriorLighting,
} from '@/three/interiors/interiorManager.js'
import { animateInterior, findInteractable, isNearExit } from '@/three/interiors/interiorScenes.js'
import {
  startDeckAudio,
  stopDeckAudio,
  isDeckAudioPlaying,
} from '@/utils/deckYouTube.js'
import {
  startArtifactsAudio,
  stopArtifactsAudio,
  isArtifactsAudioPlaying,
} from '@/utils/artifactsYouTube.js'
import {
  startShipAudio,
  pauseShipAudio,
  isShipAudioPlaying,
} from '@/utils/shipYouTube.js'
import { destroyAllYoutubePlayers } from '@/utils/youtubePlayer.js'
import {
  getArtifactExperience,
  findRoomArtifact,
  mountArtifactExperience,
  hideRoomForExperience,
  restoreRoomVisibility,
  createCameraTransition,
  updateCameraTransition,
  computeExperienceCameraWorld,
  flyCameraOut,
  getLogRevealState,
  getRevealedLogText,
} from '@/three/interiors/artifactExperiences/index.js'

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
const logRevealText = ref('')
const logProgress = ref(0)
const logComplete = ref(false)
const deckAudioBlocked = ref(false)
const artifactsAudioBlocked = ref(false)
const shipAudioBlocked = ref(false)
const floatingSlogans = ref([])

let currentInteriorId = null
let sloganTimers = []

const isEchoRoom = computed(() =>
  viewMode.value === 'artifact' || viewMode.value === 'artifact-enter'
)

let renderer, labelRenderer, composer, scene, camera, ship, controls, hotspots, clock
let interiorRooms, interiorGroup, interiorMeta, fpsController
let animId = 0
let resizeObserver
let activeFlight = null
let raycaster, pointer
let labelElements = []
let savedOrbitPos, savedOrbitTarget, savedFov
let stars, dock, interiorLighting, bloomPass
let activeExperience, activeExperienceDef, hiddenRoomChildren
let artifactCameraTransition, savedInteriorCam, artifactExitTransition, artifactCamBase, artifactCamWorld
const isInsideShip = computed(() =>
  ['interior', 'artifact', 'artifact-enter'].includes(viewMode.value)
)

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

  dock = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.5, 0.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x0a1520, roughness: 0.9 })
  )
  dock.position.y = -0.85
  scene.add(dock)

  interiorLighting = createInteriorLighting(scene)
  interiorLighting.visible = false

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
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    isMobile.value ? 0.9 : 1.35,
    0.5,
    0.15
  )
  composer.addPass(bloomPass)

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  canvas.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('keydown', onKeyDown)

  clock = new THREE.Clock()
  ready.value = true
  tryStartShipAudio()
  animate()
}

async function tryStartShipAudio({ newTrack = true } = {}) {
  if (viewMode.value !== 'orbit') return
  try {
    await startShipAudio(isMobile.value ? 50 : 60, { newTrack })
    window.setTimeout(() => {
      shipAudioBlocked.value = !isShipAudioPlaying()
    }, 800)
  } catch {
    shipAudioBlocked.value = true
  }
}

function resumeShipAudio() {
  tryStartShipAudio({ newTrack: false })
}

function clearEntrySlogans() {
  sloganTimers.forEach((t) => window.clearTimeout(t))
  sloganTimers = []
  floatingSlogans.value = []
}

function showEntrySlogans(loc) {
  clearEntrySlogans()
  const lines = pickRoomSlogans(loc.id, 1 + Math.floor(Math.random() * 2))
  const color = `#${loc.color.toString(16).padStart(6, '0')}`

  lines.forEach((text, i) => {
    const id = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`
    floatingSlogans.value.push({
      id,
      text,
      left: 10 + Math.random() * 80,
      rot: (Math.random() - 0.5) * 14,
      delay: i * 0.45,
      color,
    })
    sloganTimers.push(
      window.setTimeout(() => {
        floatingSlogans.value = floatingSlogans.value.filter((s) => s.id !== id)
      }, 3800 + i * 550)
    )
  })
}

function selectRoom(loc) {
  if (viewMode.value === 'flying' || viewMode.value === 'entering' || viewMode.value === 'interior') return

  hideAllInteriors(interiorRooms.rooms)
  selected.value = loc
  viewMode.value = 'flying'
  pauseShipAudio()
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
  tryStartShipAudio()
}

function stopOtherRoomAudio(roomId) {
  if (roomId !== 'mixes') {
    stopDeckAudio()
    deckAudioBlocked.value = false
  }
  if (roomId !== 'aaaarrifacts') {
    stopArtifactsAudio()
    artifactsAudioBlocked.value = false
  }
}

function enterRoom() {
  if (!selected.value || !activeFlight) return
  pauseShipAudio()
  stopOtherRoomAudio(selected.value.id)
  if (selected.value.id === 'mixes') {
    tryStartDeckAudio()
  } else if (selected.value.id === 'aaaarrifacts') {
    tryStartArtifactsAudio()
  }
  viewMode.value = 'entering'
  startEnterFlight(activeFlight)
}

async function tryStartDeckAudio() {
  try {
    await startDeckAudio(isMobile.value ? 55 : 65)
    window.setTimeout(() => {
      deckAudioBlocked.value = !isDeckAudioPlaying()
    }, 800)
  } catch {
    deckAudioBlocked.value = true
  }
}

async function tryStartArtifactsAudio() {
  try {
    await startArtifactsAudio(isMobile.value ? 55 : 65)
    window.setTimeout(() => {
      artifactsAudioBlocked.value = !isArtifactsAudioPlaying()
    }, 800)
  } catch {
    artifactsAudioBlocked.value = true
  }
}

function resumeDeckAudio() {
  tryStartDeckAudio()
}

function resumeArtifactsAudio() {
  tryStartArtifactsAudio()
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
    lightingGroup: interiorLighting,
  })
  interiorMeta = interiorData.meta
  stars.visible = false
  dock.visible = false
  const isDeck = loc.id === 'mixes'
  renderer.toneMappingExposure = isDeck ? 1.5 : 1.45
  if (bloomPass) {
    bloomPass.strength = isDeck ? (isMobile.value ? 0.6 : 0.85) : (isMobile.value ? 0.5 : 0.75)
    bloomPass.threshold = isDeck ? 0.28 : 0.35
  }

  savedFov = camera.fov
  camera.fov = interiorMeta.entryFov ?? (isMobile.value ? 60 : 56)
  camera.updateProjectionMatrix()

  fpsController.bounds = interiorMeta.bounds
  fpsController.enable(
    interiorMeta.spawn,
    interiorMeta.spawnYaw,
    interiorMeta.spawnPitch ?? 0
  )
  if (!isMobile.value) fpsController.requestPointerLock()

  viewMode.value = 'interior'
  activeFlight = null
  controls.enabled = false
  enterFade.value = 0

  currentInteriorId = loc.id
  pauseShipAudio()
  stopOtherRoomAudio(loc.id)
  if (loc.id === 'mixes' && !isDeckAudioPlaying()) {
    tryStartDeckAudio()
  } else if (loc.id === 'aaaarrifacts' && !isArtifactsAudioPlaying()) {
    tryStartArtifactsAudio()
  }

  showEntrySlogans(loc)
}

function exitInterior() {
  clearEntrySlogans()
  if (viewMode.value === 'artifact' || viewMode.value === 'artifact-enter') {
    finishExitArtifact()
  }

  if (currentInteriorId === 'mixes') {
    stopDeckAudio()
    deckAudioBlocked.value = false
  }
  if (currentInteriorId === 'aaaarrifacts') {
    stopArtifactsAudio()
    artifactsAudioBlocked.value = false
  }

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
      lightingGroup: interiorLighting,
    })
    interiorGroup = null
    interiorMeta = null
    currentInteriorId = null
    stars.visible = true
    dock.visible = true
    renderer.toneMappingExposure = 1.15
    if (bloomPass) {
      bloomPass.strength = isMobile.value ? 0.9 : 1.35
      bloomPass.threshold = 0.15
    }

    if (savedOrbitPos) camera.position.copy(savedOrbitPos)
    if (savedOrbitTarget) controls.target.copy(savedOrbitTarget)
    if (savedFov) {
      camera.fov = savedFov
      camera.updateProjectionMatrix()
      savedFov = null
    }
    controls.enabled = true
    camera.rotation.set(0, 0, 0)

    hideAllInteriors(interiorRooms.rooms)
    selected.value = null
    viewMode.value = 'orbit'
    interactPrompt.value = ''
    enterFade.value = 0
    tryStartShipAudio()
  }, 350)
}

function enterArtifactExperience(artifactType) {
  const def = getArtifactExperience(artifactType)
  if (!def || !interiorGroup) return

  fpsController.disable()
  document.exitPointerLock?.()
  pauseShipAudio()

  savedInteriorCam = {
    position: camera.position.clone(),
    quaternion: camera.quaternion.clone(),
    fov: camera.fov,
    yaw: fpsController.yaw,
    pitch: fpsController.pitch,
  }

  const mounted = mountArtifactExperience(interiorGroup, artifactType)
  if (!mounted) return

  activeExperience = mounted.exp
  activeExperienceDef = def
  activeExperience.userData.startTime = clock.getElapsedTime()
  hiddenRoomChildren = hideRoomForExperience(interiorGroup, activeExperience)

  if (interiorLighting) interiorLighting.visible = false
  scene.fog = new THREE.FogExp2(0x0a0604, 0.035)
  scene.background = new THREE.Color(0x0a0604)
  renderer.toneMappingExposure = 0.88
  if (bloomPass) {
    bloomPass.strength = 0
    bloomPass.threshold = 1
  }

  logRevealText.value = ''
  logProgress.value = 0
  logComplete.value = false

  artifactCamWorld = computeExperienceCameraWorld(mounted.anchor, def.getCamera())
  artifactCameraTransition = createCameraTransition(
    camera,
    savedInteriorCam.position,
    savedInteriorCam.quaternion,
    artifactCamWorld.position,
    artifactCamWorld.lookAt,
    artifactCamWorld.fov,
    savedInteriorCam.fov
  )

  enterFade.value = 1
  setTimeout(() => { enterFade.value = 0 }, 400)
  viewMode.value = 'artifact-enter'
}

function exitArtifact() {
  if (!savedInteriorCam || !activeExperience) {
    viewMode.value = 'interior'
    return
  }

  enterFade.value = 0.85
  artifactExitTransition = {
    fromPos: camera.position.clone(),
    toPos: savedInteriorCam.position.clone(),
    fromQuat: camera.quaternion.clone(),
    toQuat: savedInteriorCam.quaternion.clone(),
    fromFov: camera.fov,
    toFov: savedInteriorCam.fov,
    progress: 0,
    duration: 1,
  }
  viewMode.value = 'artifact-exit'
}

function finishExitArtifact() {
  activeExperience.visible = false
  restoreRoomVisibility(hiddenRoomChildren)
  hiddenRoomChildren = []

  scene.fog = new THREE.FogExp2(0x12101a, 0.018)
  scene.background = new THREE.Color(0x12101a)
  renderer.toneMappingExposure = 1.45
  if (bloomPass) {
    bloomPass.strength = isMobile.value ? 0.5 : 0.75
    bloomPass.threshold = 0.35
  }
  if (interiorLighting) interiorLighting.visible = true

  logRevealText.value = ''
  logProgress.value = 0
  logComplete.value = false

  fpsController.enable(savedInteriorCam.position, savedInteriorCam.yaw, savedInteriorCam.pitch)
  if (!isMobile.value) fpsController.requestPointerLock()

  activeExperience = null
  activeExperienceDef = null
  artifactCameraTransition = null
  artifactExitTransition = null
  artifactCamBase = null
  artifactCamWorld = null
  savedInteriorCam = null
  interactPrompt.value = ''
  enterFade.value = 0
  viewMode.value = 'interior'
}

function openFullLog() {
  if (activeExperienceDef?.route) {
    router.push(activeExperienceDef.route)
  }
}

function doInteract() {
  if (viewMode.value === 'artifact' && activeExperienceDef) {
    if (activeExperienceDef.isComplete(activeExperience)) {
      openFullLog()
    }
    return
  }

  if (viewMode.value !== 'interior' || !interiorGroup) return

  if (isNearExit(interiorGroup, camera, interiorMeta)) {
    exitInterior()
    return
  }

  const artifact = findRoomArtifact(interiorGroup, camera)
  if (artifact?.userData.artifactType) {
    enterArtifactExperience(artifact.userData.artifactType)
    return
  }

  const target = findInteractable(interiorGroup, camera)
  if (target?.userData.isTerminal) {
    const route = selected.value?.route
    if (route) router.push(route)
  }
}

function onKeyDown(e) {
  if ((viewMode.value === 'interior' || viewMode.value === 'artifact') && (e.key === 'e' || e.key === 'E')) {
    doInteract()
  }
  if (viewMode.value === 'artifact' && e.key === 'Escape') {
    exitArtifact()
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

  if (shipAudioBlocked.value) resumeShipAudio()

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

function updateLogReveal(time) {
  if (!activeExperience) return
  const state = getLogRevealState(activeExperience.userData.startTime, time)
  logRevealText.value = getRevealedLogText(state.revealChars)
  logProgress.value = state.progress
  logComplete.value = state.isComplete
}

function updateInteractPrompt() {
  if (viewMode.value === 'artifact' && activeExperienceDef) {
    interactPrompt.value = activeExperienceDef.isComplete(activeExperience)
      ? 'Continue to full log'
      : ''
    return
  }

  if (viewMode.value !== 'interior' || !interiorGroup) {
    interactPrompt.value = ''
    return
  }

  if (isNearExit(interiorGroup, camera, interiorMeta)) {
    interactPrompt.value = 'Exit to deck'
    return
  }

  const artifact = findRoomArtifact(interiorGroup, camera)
  if (artifact?.userData.artifactLabel) {
    interactPrompt.value = artifact.userData.artifactLabel
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

  if (viewMode.value === 'artifact-enter' && artifactCameraTransition) {
    const done = updateCameraTransition(artifactCameraTransition, camera, delta)
    activeExperienceDef?.animate(activeExperience, time)
    updateLogReveal(time)
    if (done) {
      artifactCamBase = {
        position: artifactCamWorld.position.clone(),
        lookAt: artifactCamWorld.lookAt.clone(),
      }
      viewMode.value = 'artifact'
    }
  }

  if (viewMode.value === 'artifact') {
    activeExperienceDef?.animate(activeExperience, time)
    updateLogReveal(time)
    updateInteractPrompt()
    if (artifactCamBase) {
      const sway = Math.sin(time * 0.45) * 0.025
      const bob = Math.sin(time * 0.32) * 0.012
      camera.position.set(
        artifactCamBase.position.x + sway,
        artifactCamBase.position.y + bob,
        artifactCamBase.position.z
      )
      camera.lookAt(artifactCamBase.lookAt)
    }
  }

  if (viewMode.value === 'artifact-exit' && artifactExitTransition) {
    const done = flyCameraOut(camera, savedInteriorCam, delta, artifactExitTransition)
    if (done) finishExitArtifact()
  }

  if (controls.enabled) controls.update()

  composer.render()
  if (!isInsideShip.value) {
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
  clearEntrySlogans()
  destroyAllYoutubePlayers()
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
  background: radial-gradient(ellipse at center, transparent 45%, rgba(2, 4, 8, 0.55) 100%);
}

.explorer__vignette--interior {
  background: radial-gradient(ellipse at center, transparent 65%, rgba(10, 8, 16, 0.4) 100%);
}

.explorer__vignette--artifact {
  background:
    linear-gradient(to bottom, transparent 0%, transparent 42%, rgba(10, 6, 4, 0.55) 72%, rgba(6, 4, 2, 0.88) 100%),
    radial-gradient(ellipse 90% 50% at 50% 28%, transparent 40%, rgba(6, 4, 2, 0.5) 100%);
  z-index: 3;
}

.echo-room {
  position: absolute;
  inset: 0;
  z-index: 12;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4.25rem 0 0;
  pointer-events: none;
}

.echo-room__frame {
  text-align: center;
  pointer-events: none;
  padding: 0 1rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
}

.echo-room__eyebrow {
  font-size: 0.58rem;
  color: rgba(232, 220, 200, 0.75);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
}

.echo-room__title {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  color: #e8dcc8;
  text-shadow: 0 0 20px rgba(255, 180, 80, 0.25);
}

.echo-room__parchment {
  position: relative;
  width: 100%;
  max-height: 42vh;
  overflow-y: auto;
  margin-top: auto;
  padding: 1.1rem 1.25rem 1.25rem;
  background: linear-gradient(to top, rgba(12, 8, 5, 0.94) 0%, rgba(12, 8, 5, 0.72) 55%, transparent 100%);
  border-top: 1px solid rgba(201, 162, 39, 0.2);
  pointer-events: auto;
  backdrop-filter: blur(4px);
}

.echo-room__text {
  position: relative;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(0.78rem, 2.8vw, 0.92rem);
  font-style: italic;
  line-height: 1.55;
  color: rgba(232, 220, 200, 0.92);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  max-width: 36rem;
  margin-inline: auto;
}

.echo-room__cursor {
  display: inline-block;
  color: #c9a227;
  font-style: normal;
  font-weight: bold;
  animation: cursor-blink 0.8s step-end infinite;
  margin-left: 1px;
}

@keyframes cursor-blink {
  50% { opacity: 0; }
}

.echo-room__continue {
  position: relative;
  display: block;
  width: 100%;
  max-width: 36rem;
  margin: 1rem auto 0;
  padding: 0.85rem 1rem;
  background: rgba(26, 20, 16, 0.85);
  border: 1px solid #c9a227;
  color: #e8dcc8;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.echo-room__continue:hover {
  background: #2a2018;
  box-shadow: 0 0 20px rgba(201, 162, 39, 0.25);
}

.echo-enter-active,
.echo-leave-active {
  transition: opacity 0.6s ease;
}

.echo-enter-from,
.echo-leave-to {
  opacity: 0;
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

.deck-audio-btn {
  background: none;
  border: none;
  color: var(--neon-cyan);
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  padding: 0;
}

.deck-audio-btn:hover {
  color: var(--gold);
}

.deck-audio-fab {
  position: absolute;
  bottom: 6.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 16;
  pointer-events: auto;
  font-size: 0.75rem;
}

.room-slogans {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 11;
  overflow: hidden;
}

.room-slogan {
  position: absolute;
  bottom: 38%;
  margin: 0;
  transform: translateX(-50%) rotate(var(--rot, -3deg));
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 5vw, 2rem);
  font-weight: 400;
  text-transform: lowercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  text-shadow:
    0 0 28px currentColor,
    0 0 8px rgba(255, 255, 255, 0.35),
    0 3px 12px rgba(0, 0, 0, 0.9);
  animation: slogan-float 3.4s ease-out forwards;
  opacity: 0;
}

@keyframes slogan-float {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(24px) rotate(var(--rot, -3deg)) scale(0.82);
  }
  14% {
    opacity: 1;
  }
  72% {
    opacity: 0.92;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-130px) rotate(calc(var(--rot, -3deg) + 5deg)) scale(1.08);
  }
}

.slogan-leave-active {
  transition: opacity 0.35s ease;
}

.slogan-leave-to {
  opacity: 0 !important;
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
