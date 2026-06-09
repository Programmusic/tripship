import * as THREE from 'three'
import { addMesh, woodMat, neonMat } from './buildRoom.js'

const metalMat = (color = 0x334455) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide })

const skinMat = (color = 0x3d5a4a) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.15, side: THREE.DoubleSide })

const coatMat = () =>
  new THREE.MeshStandardMaterial({ color: 0x1a0a28, roughness: 0.9, emissive: 0x220033, emissiveIntensity: 0.15, side: THREE.DoubleSide })

function createNeonSignMat(text, colorA = '#ff00ff', colorB = '#00ffcc') {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 96
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0a0614'
  ctx.fillRect(0, 0, 512, 96)
  const grad = ctx.createLinearGradient(0, 0, 512, 0)
  grad.addColorStop(0, colorA)
  grad.addColorStop(0.5, '#ffffff')
  grad.addColorStop(1, colorB)
  ctx.font = 'bold 42px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = grad
  ctx.shadowColor = colorA
  ctx.shadowBlur = 20
  ctx.fillText(text, 256, 48)

  const tex = new THREE.CanvasTexture(canvas)
  return new THREE.MeshStandardMaterial({
    map: tex,
    emissive: 0xffffff,
    emissiveMap: tex,
    emissiveIntensity: 1.8,
    transparent: true,
    side: THREE.DoubleSide,
  })
}

/** Procedural mutant AI pirate DJ — "DJ Krakenbyte" */
export function createMutantPirateDJ() {
  const dj = new THREE.Group()
  dj.name = 'dj-krakenbyte'
  dj.userData.animType = 'dj'

  const body = addMesh(dj, new THREE.CylinderGeometry(0.32, 0.38, 0.75, 10), coatMat(), [0, 0.95, 0])
  body.userData.bobPart = true

  addMesh(dj, new THREE.BoxGeometry(0.55, 0.65, 0.28), coatMat(), [0, 1.0, 0.08])
  addMesh(dj, new THREE.BoxGeometry(0.7, 0.12, 0.35), woodMat(0x2a1a0a), [0, 0.62, 0.05])

  const head = addMesh(dj, new THREE.SphereGeometry(0.28, 14, 12), skinMat(0x2a4a3a), [0, 1.55, 0])
  head.userData.bobPart = true

  addMesh(head, new THREE.BoxGeometry(0.52, 0.08, 0.42), woodMat(0x1a1a1a), [0, 0.18, 0], [-0.15, 0, 0])
  addMesh(head, new THREE.ConeGeometry(0.32, 0.18, 3), woodMat(0x1a1a1a), [0, 0.32, 0], [0, 0, 0])

  addMesh(head, new THREE.CylinderGeometry(0.09, 0.09, 0.02, 12), new THREE.MeshStandardMaterial({ color: 0x111111 }), [0.1, 0.05, 0.22])
  const aiEye = addMesh(head, new THREE.SphereGeometry(0.055, 10, 10), neonMat(0xff0044, 3), [0.1, 0.05, 0.25])
  aiEye.userData.pulse = 0

  addMesh(head, new THREE.BoxGeometry(0.14, 0.06, 0.02), woodMat(0x2a1a0a), [-0.12, 0.05, 0.24])

  const jaw = addMesh(head, new THREE.BoxGeometry(0.22, 0.08, 0.12), metalMat(0x556677), [0, -0.12, 0.18])
  jaw.userData.animType = 'jaw'

  const armL = addMesh(dj, new THREE.CylinderGeometry(0.07, 0.08, 0.55, 8), skinMat(), [-0.38, 1.05, 0.1], [0.4, 0, 0.3])
  armL.userData.animType = 'armL'

  const tentacle = new THREE.Group()
  tentacle.position.set(0.42, 1.1, 0.15)
  tentacle.userData.animType = 'tentacle'
  for (let i = 0; i < 4; i++) {
    const seg = addMesh(
      tentacle,
      new THREE.CylinderGeometry(0.05 - i * 0.008, 0.055 - i * 0.008, 0.18, 8),
      neonMat(i % 2 ? 0x00ffcc : 0xff00ff, 1.5),
      [0, i * 0.16, 0]
    )
    seg.rotation.z = -0.3 - i * 0.15
    seg.rotation.x = 0.2
  }
  addMesh(tentacle, new THREE.ConeGeometry(0.03, 0.1, 6), neonMat(0xff00ff, 2), [0.05, 0.62, 0.05], [0.5, 0, 0])
  dj.add(tentacle)

  const pegLeg = addMesh(dj, new THREE.CylinderGeometry(0.06, 0.05, 0.55, 8), woodMat(0x5a4030), [-0.12, 0.28, 0])
  pegLeg.userData.bobPart = true
  addMesh(dj, new THREE.CylinderGeometry(0.09, 0.1, 0.5, 8), coatMat(), [0.12, 0.25, 0])

  const halo = addMesh(dj, new THREE.TorusGeometry(0.35, 0.015, 8, 32), neonMat(0x00ffcc, 2), [0, 1.95, 0], [Math.PI / 2, 0, 0])
  halo.userData.animType = 'halo'

  const eyeLight = new THREE.PointLight(0xff0044, 4, 3)
  eyeLight.position.set(0.1, 1.6, 0.4)
  dj.add(eyeLight)
  dj.userData.eyeLight = eyeLight

  return dj
}

/** Full DJ booth with spinning decks, mixer, and signage */
export function createDJRig(zPosition) {
  const rig = new THREE.Group()
  rig.position.set(0, 0, zPosition)
  rig.userData.animType = 'rig'

  const booth = addMesh(rig, new THREE.BoxGeometry(3.6, 1.05, 1.4), woodMat(0x1a1020), [0, 0.52, 0])
  addMesh(rig, new THREE.BoxGeometry(3.4, 0.06, 1.2), neonMat(0xff00ff, 0.8), [0, 1.06, 0])

  const deckL = createTurntable([-0.85, 1.1, 0], 0xff00ff)
  const deckR = createTurntable([0.85, 1.1, 0], 0x00ffcc)
  rig.add(deckL, deckR)
  rig.userData.deckL = deckL
  rig.userData.deckR = deckR

  const mixer = addMesh(rig, new THREE.BoxGeometry(0.9, 0.08, 0.55), metalMat(0x222233), [0, 1.08, 0])
  for (let i = 0; i < 5; i++) {
    addMesh(mixer, new THREE.BoxGeometry(0.04, 0.12, 0.04), neonMat(i % 2 ? 0xff00ff : 0x00ffcc, 1.8), [-0.3 + i * 0.15, 0.08, 0.15])
  }

  const screenL = addMesh(rig, new THREE.PlaneGeometry(0.7, 0.45), neonMat(0x00ffcc, 1.2), [-1.4, 1.7, 0])
  const screenR = addMesh(rig, new THREE.PlaneGeometry(0.7, 0.45), neonMat(0xff00ff, 1.2), [1.4, 1.7, 0])
  screenL.userData.waveform = 0
  screenR.userData.waveform = 1.5

  const sign = addMesh(rig, new THREE.PlaneGeometry(2.8, 0.55), createNeonSignMat('DJ KRAKENBYTE', '#ff00ff', '#00ffcc'), [0, 2.35, 0])
  sign.userData.animType = 'sign'

  addMesh(rig, new THREE.BoxGeometry(2.6, 0.08, 0.04), neonMat(0xff00ff, 1), [0, 2.1, 0])

  return rig
}

function createTurntable(pos, color) {
  const deck = new THREE.Group()
  deck.position.set(...pos)
  deck.userData.animType = 'turntable'

  addMesh(deck, new THREE.CylinderGeometry(0.42, 0.44, 0.06, 24), metalMat(0x222222), [0, 0, 0])
  const platter = addMesh(deck, new THREE.CylinderGeometry(0.34, 0.34, 0.02, 24), metalMat(0x111111), [0, 0.04, 0])
  platter.userData.spin = true

  addMesh(platter, new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), neonMat(color, 1.5), [0, 0.02, 0])
  addMesh(platter, new THREE.BoxGeometry(0.04, 0.25, 0.01), neonMat(0xffffff, 0.5), [0.12, 0.03, 0])

  return deck
}

export function createBassStack(x, z, color) {
  const stack = new THREE.Group()
  stack.position.set(x, 0, z)
  stack.userData.animType = 'bassStack'

  addMesh(stack, new THREE.BoxGeometry(1.1, 2.2, 0.9), woodMat(0x111111), [0, 1.1, 0])
  addMesh(stack, new THREE.BoxGeometry(0.95, 1.8, 0.05), neonMat(color, 0.6), [0, 1.1, 0.46])

  const cone = addMesh(stack, new THREE.CylinderGeometry(0.35, 0.4, 0.12, 16), neonMat(color, 1.2), [0, 0.55, 0.48])
  cone.userData.pulse = x

  const sub = addMesh(stack, new THREE.CylinderGeometry(0.5, 0.55, 0.7, 16), woodMat(0x0a0a0a), [0, 0.35, 0])
  sub.userData.pulse = x + 1

  const light = new THREE.PointLight(color, 8, 8)
  light.position.set(0, 1.5, 0.5)
  stack.add(light)
  stack.userData.stackLight = light

  return stack
}

export function createLaserTripods(room, d) {
  const lasers = new THREE.Group()
  lasers.userData.animType = 'lasers'

  const colors = [0xff00ff, 0x00ffcc, 0xff00ff]
  ;[-2.8, 0, 2.8].forEach((x, i) => {
    const base = addMesh(lasers, new THREE.CylinderGeometry(0.08, 0.12, 0.5, 8), metalMat(), [x, 0.25, -d / 2 + 0.5])
    const beam = addMesh(
      lasers,
      new THREE.CylinderGeometry(0.02, 0.02, 8, 6),
      new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      }),
      [x, 4.5, -d / 2 + 0.5]
    )
    beam.userData.laserIndex = i
    base.userData.laserPivot = beam
  })

  return lasers
}

export function createHoloGlobe(position) {
  const globe = new THREE.Group()
  globe.position.set(...position)
  globe.userData.animType = 'holoGlobe'

  const sphere = addMesh(
    globe,
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x111122,
      emissive: 0x00ffcc,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.9,
    }),
    [0, 2.4, 0]
  )

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    addMesh(
      globe,
      new THREE.BoxGeometry(0.02, 0.5, 0.02),
      neonMat(i % 2 ? 0xff00ff : 0x00ffcc, 2),
      [Math.sin(angle) * 0.5, 2.4, Math.cos(angle) * 0.5],
      [0, angle, 0]
    )
  }

  const glow = new THREE.PointLight(0x00ffcc, 6, 6)
  glow.position.set(0, 2.4, 0)
  globe.add(glow)

  return globe
}

/** Ghostly captain portrait for the cabin */
export function createGhostCaptain() {
  const ghost = new THREE.Group()
  ghost.position.set(0, 1.8, -4.8)
  ghost.userData.animType = 'ghost'

  const frame = addMesh(ghost, new THREE.BoxGeometry(1.6, 2.0, 0.1), woodMat(0x4a3020), [0, 0, 0])
  const portrait = addMesh(
    ghost,
    new THREE.PlaneGeometry(1.3, 1.7),
    new THREE.MeshStandardMaterial({
      color: 0xc9a227,
      emissive: 0xc9a227,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7,
    }),
    [0, 0, 0.06]
  )
  portrait.userData.pulse = 0

  addMesh(ghost, new THREE.ConeGeometry(0.2, 0.15, 3), woodMat(0x1a1a1a), [0, 0.75, 0.08])
  addMesh(ghost, new THREE.SphereGeometry(0.12, 8, 8), neonMat(0xc9a227, 1), [0, 0.35, 0.1])

  return ghost
}

/** Animated quill bot for The List */
export function createQuillBot() {
  const bot = new THREE.Group()
  bot.position.set(1.8, 0.82, -4.2)
  bot.userData.animType = 'quillBot'

  addMesh(bot, new THREE.BoxGeometry(0.35, 0.25, 0.35), metalMat(0x445566), [0, 0, 0])
  const arm = addMesh(bot, new THREE.BoxGeometry(0.04, 0.35, 0.04), metalMat(), [0, 0.2, 0.1], [0.5, 0, 0])
  arm.userData.animType = 'quillArm'
  addMesh(arm, new THREE.ConeGeometry(0.02, 0.2, 6), neonMat(0xc9a227, 1), [0, 0.22, 0], [0, 0, -0.4])

  const eye = addMesh(bot, new THREE.SphereGeometry(0.04, 8, 8), neonMat(0x00ffcc, 2), [0, 0.1, 0.18])
  eye.userData.pulse = 0

  return bot
}
