import * as THREE from 'three'
import { addMesh, woodMat } from '../buildRoom.js'

const GOLD = 0xc9a227

export const CAPTAINS_LOG_LINES = [
  'Ahoy me hearties,',
  '',
  'Welcome aboard the Trip Ship.',
  '',
  'If ye be readin\' this, yer name made The List —',
  'or someone vouched for ye. Either way, ye\'re family now.',
  '',
  'No algorithms. No randos. No landlubbers.',
  'Just the crew who remember when the subs hit',
  'and the whole deck bounced.',
  '',
  'Welcome aboard, me hearties.',
  'Stay seaworthy.',
  '',
  '— Captain Flystyle ☠',
]

export const CAPTAINS_LOG_ECHOES = [
  { text: 'ME HEARTIES', at: 0.12 },
  { text: 'THE LIST', at: 0.38 },
  { text: 'TRIP SHIP', at: 0.55 },
  { text: 'STAY SEAWORTHY', at: 0.88 },
]

const LOG_FULL_TEXT = CAPTAINS_LOG_LINES.join('\n')
const LOG_REVEAL_SPEED = 28

export function getLogRevealState(startTime, time) {
  const elapsed = Math.max(0, time - (startTime || 0))
  const revealChars = Math.min(LOG_FULL_TEXT.length, Math.floor(elapsed * LOG_REVEAL_SPEED))
  return {
    revealChars,
    progress: revealChars / LOG_FULL_TEXT.length,
    isComplete: revealChars >= LOG_FULL_TEXT.length - 2,
  }
}

export function getRevealedLogText(revealChars) {
  return LOG_FULL_TEXT.slice(0, revealChars)
}

function logSignTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, 512, 128)
  ctx.font = 'bold 52px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#c9a227'
  ctx.shadowColor = '#ffee88'
  ctx.shadowBlur = 24
  ctx.fillText("CAPTAIN'S LOG", 256, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createCaptainsLogDeskSign() {
  const tex = logSignTexture()
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.55),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissive: GOLD,
      emissiveMap: tex,
      emissiveIntensity: 2.5,
      transparent: true,
      side: THREE.DoubleSide,
    })
  )
  sign.userData.pulse = 0.3
  return sign
}

export function createCaptainsLogArtifact() {
  const artifact = new THREE.Group()
  artifact.name = 'captains-log-artifact'
  artifact.userData.isRoomArtifact = true
  artifact.userData.artifactType = 'captains-log'
  artifact.userData.artifactLabel = "Open the Captain's Log"

  addMesh(artifact, new THREE.BoxGeometry(1.1, 0.22, 1.5), woodMat(0x3a2818), [0, 0.11, 0])
  const pages = addMesh(
    artifact,
    new THREE.BoxGeometry(0.96, 0.14, 1.36),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc8, emissive: GOLD, emissiveIntensity: 1.4, roughness: 0.9 }),
    [0, 0.28, 0.04]
  )
  pages.userData.pulse = 0

  addMesh(artifact, new THREE.BoxGeometry(0.16, 0.34, 1.5), woodMat(0x2a1a0a), [-0.56, 0.08, 0])

  const ring = addMesh(
    artifact,
    new THREE.TorusGeometry(0.85, 0.022, 8, 48),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending }),
    [0, 0.42, 0],
    [Math.PI / 2, 0, 0]
  )
  ring.userData.animType = 'artifactRing'

  const glow = new THREE.PointLight(GOLD, 14, 9)
  glow.position.set(0, 0.5, 0.3)
  artifact.add(glow)
  artifact.userData.artifactGlow = glow

  return artifact
}

/** Atmospheric candlelit backdrop — text lives in the HTML Echo Room overlay */
export function createCaptainsLogExperience() {
  const exp = new THREE.Group()
  exp.name = 'captains-log-experience'
  exp.visible = false
  exp.userData.experienceType = 'captains-log'
  exp.userData.startTime = 0

  addMesh(
    exp,
    new THREE.SphereGeometry(10, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x0a0604, side: THREE.BackSide }),
    [0, 1.1, 0]
  )

  addMesh(exp, new THREE.PlaneGeometry(14, 10), new THREE.MeshBasicMaterial({
    color: 0x120a06,
    transparent: true,
    opacity: 0.85,
  }), [0, 1.1, -2])

  addMesh(exp, new THREE.BoxGeometry(2.2, 0.05, 1.2), woodMat(0x1a1008), [0, 0.68, 0.2])
  addMesh(exp, new THREE.BoxGeometry(1.6, 0.02, 0.9), new THREE.MeshBasicMaterial({ color: 0x2a1810 }), [0, 0.71, 0.15])

  addMesh(exp, new THREE.CylinderGeometry(0.025, 0.03, 0.1, 8), new THREE.MeshBasicMaterial({ color: 0xe8dcc8 }), [-0.55, 0.77, 0.35])
  const flame = addMesh(
    exp,
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffbb55, transparent: true, opacity: 0.85 }),
    [-0.55, 0.84, 0.35]
  )
  exp.userData.flame = flame

  const quill = addMesh(
    exp,
    new THREE.ConeGeometry(0.01, 0.14, 5),
    new THREE.MeshBasicMaterial({ color: 0x2a1810 }),
    [0.35, 0.8, 0.28],
    [0.55, -0.2, -0.35]
  )
  exp.userData.quill = quill

  const inkGeo = new THREE.BufferGeometry()
  const inkCount = 60
  const inkPos = new Float32Array(inkCount * 3)
  for (let i = 0; i < inkCount; i++) {
    inkPos[i * 3] = (Math.random() - 0.5) * 3
    inkPos[i * 3 + 1] = 0.4 + Math.random() * 2.2
    inkPos[i * 3 + 2] = (Math.random() - 0.5) * 2
  }
  inkGeo.setAttribute('position', new THREE.BufferAttribute(inkPos, 3))
  const ink = new THREE.Points(
    inkGeo,
    new THREE.PointsMaterial({ color: 0x1a1410, size: 0.04, transparent: true, opacity: 0.35 })
  )
  exp.add(ink)
  exp.userData.inkMist = ink

  const candleLight = new THREE.PointLight(0xffaa66, 0.8, 5)
  candleLight.position.set(-0.55, 0.88, 0.45)
  exp.add(candleLight)
  exp.userData.candleLight = candleLight

  const fill = new THREE.AmbientLight(0x2a1810, 0.35)
  exp.add(fill)

  return exp
}

export function getLogExperienceCamera() {
  return {
    position: new THREE.Vector3(0, 1.08, 2.1),
    lookAt: new THREE.Vector3(0, 0.78, 0.1),
    fov: 38,
  }
}

export function getLogExperienceAnchor(room) {
  const artifact = room?.userData?.roomArtifact
  if (artifact) {
    const pos = new THREE.Vector3()
    artifact.getWorldPosition(pos)
    return pos
  }
  return new THREE.Vector3(0, 0, -3.7)
}

export function animateCaptainsLogExperience(exp, time) {
  if (!exp?.visible) return

  const { progress } = getLogRevealState(exp.userData.startTime, time)
  exp.userData.revealProgress = progress

  const quill = exp.userData.quill
  if (quill) {
    const line = Math.floor(progress * CAPTAINS_LOG_LINES.length)
    quill.position.x = -0.35 + (progress * 12) % 0.7
    quill.position.y = 0.82 - line * 0.018
    quill.rotation.z = -0.35 + Math.sin(time * 5) * 0.1
  }

  if (exp.userData.candleLight) {
    exp.userData.candleLight.intensity = 0.65 + Math.sin(time * 8) * 0.2
  }
  if (exp.userData.flame) {
    exp.userData.flame.scale.setScalar(1 + Math.sin(time * 11) * 0.15)
    exp.userData.flame.material.opacity = 0.7 + Math.sin(time * 9) * 0.15
  }

  const ink = exp.userData.inkMist
  if (ink) {
    ink.rotation.y = time * 0.03
    const pos = ink.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3 + 1] += Math.sin(time + i) * 0.0004
    }
    pos.needsUpdate = true
  }
}

export function isLogExperienceComplete(exp) {
  return (exp?.userData.revealProgress ?? 0) >= 0.95
}
