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
  { text: 'ME HEARTIES', at: 0.12, x: -1.2, y: 1.6 },
  { text: 'THE LIST', at: 0.38, x: 1.1, y: 1.45 },
  { text: 'TRIP SHIP', at: 0.55, x: 0, y: 1.85 },
  { text: 'STAY SEAWORTHY', at: 0.88, x: -0.8, y: 1.35 },
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

function parchmentCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearFilter
  return { canvas, ctx, tex }
}

function drawParchment(ctx, canvas, revealChars, time) {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, '#f0e6d0')
  grad.addColorStop(0.5, '#e8dcc8')
  grad.addColorStop(1, '#d4c4a4')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(139, 100, 60, 0.18)'
  for (let y = 72; y < canvas.height - 36; y += 34) {
    ctx.beginPath()
    ctx.moveTo(56, y)
    ctx.lineTo(canvas.width - 56, y)
    ctx.stroke()
  }

  let charIndex = 0
  const lineHeight = 40
  let y = 64

  for (const line of CAPTAINS_LOG_LINES) {
    if (charIndex + line.length + 1 < revealChars || line === '') {
      const show = line === '' ? '' : line.slice(0, Math.max(0, revealChars - charIndex))
      if (show) {
        const isSign = show.startsWith('—')
        ctx.fillStyle = isSign ? '#4a3020' : '#1a1410'
        ctx.font = isSign ? 'bold 34px Georgia, serif' : 'italic 28px Georgia, serif'
        ctx.fillText(show, 64, y)
      }
      charIndex += line.length + 1
      y += line === '' ? 18 : lineHeight
    } else {
      const partial = line.slice(0, revealChars - charIndex)
      if (partial) {
        ctx.fillStyle = '#1a1410'
        ctx.font = 'italic 28px Georgia, serif'
        ctx.fillText(partial, 64, y)
        if (Math.sin(time * 10) > 0) {
          const w = ctx.measureText(partial).width
          ctx.fillStyle = '#8a6020'
          ctx.fillRect(64 + w + 2, y - 24, 2, 26)
        }
      }
      break
    }
  }
}

function echoSprite(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.font = 'bold 44px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(201, 162, 39, 0.85)'
  ctx.shadowColor = 'rgba(255, 220, 120, 0.6)'
  ctx.shadowBlur = 16
  ctx.fillText(text, 256, 72)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(1.4, 0.35, 1)
  return sprite
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

/** Candlelit captain's desk — open log book, quill, ink, echo sprites */
export function createCaptainsLogExperience() {
  const exp = new THREE.Group()
  exp.name = 'captains-log-experience'
  exp.visible = false
  exp.userData.experienceType = 'captains-log'
  exp.userData.startTime = 0

  addMesh(
    exp,
    new THREE.SphereGeometry(14, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x060302, side: THREE.BackSide }),
    [0, 1.4, 0]
  )

  for (let i = 0; i < 80; i++) {
    const dust = addMesh(
      exp,
      new THREE.SphereGeometry(0.008 + Math.random() * 0.012, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xffdd99, transparent: true, opacity: 0.15 + Math.random() * 0.25 }),
      [(Math.random() - 0.5) * 5, 0.6 + Math.random() * 2.5, (Math.random() - 0.5) * 4 - 1]
    )
    dust.userData.dustDrift = Math.random() * Math.PI * 2
  }

  addMesh(exp, new THREE.CylinderGeometry(2.5, 2.8, 0.02, 32), new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
  }), [0, 0.68, 0.3])

  const desk = new THREE.Group()
  desk.position.set(0, 0.65, 0.15)
  addMesh(desk, new THREE.BoxGeometry(2.8, 0.12, 1.6), woodMat(0x2a1810), [0, 0, 0])
  for (const [x, z] of [[-1.2, 0.6], [1.2, 0.6], [-1.2, -0.6], [1.2, -0.6]]) {
    addMesh(desk, new THREE.BoxGeometry(0.1, 0.65, 0.1), woodMat(0x1a1008), [x, -0.38, z])
  }
  exp.add(desk)

  const book = new THREE.Group()
  book.position.set(0, 0.74, 0.2)
  book.rotation.x = -0.55
  book.rotation.y = 0.08

  addMesh(book, new THREE.BoxGeometry(0.12, 0.9, 1.2), woodMat(0x1a1008), [-0.78, 0, 0])
  addMesh(book, new THREE.BoxGeometry(0.12, 0.9, 1.2), woodMat(0x1a1008), [0.78, 0, 0])

  const { canvas, ctx, tex } = parchmentCanvas()
  drawParchment(ctx, canvas, 0, 0)
  const page = addMesh(
    book,
    new THREE.PlaneGeometry(1.35, 0.95),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
    [0, 0.01, 0]
  )
  page.rotation.x = -Math.PI / 2
  exp.userData.parchmentCanvas = canvas
  exp.userData.parchmentCtx = ctx
  exp.userData.parchmentTex = tex
  exp.userData.pageMesh = page

  exp.add(book)
  exp.userData.book = book

  const quill = new THREE.Group()
  quill.position.set(0.42, 0.82, 0.45)
  addMesh(quill, new THREE.ConeGeometry(0.012, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.4 }), [0, 0.09, 0], [0, 0, 0.2])
  addMesh(quill, new THREE.CylinderGeometry(0.006, 0.008, 0.14, 6), new THREE.MeshStandardMaterial({ color: 0xf5f0e8 }), [0, -0.04, 0])
  exp.add(quill)
  exp.userData.quill = quill

  const inkBottle = new THREE.Group()
  inkBottle.position.set(0.75, 0.74, 0.35)
  addMesh(inkBottle, new THREE.CylinderGeometry(0.05, 0.06, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.3, metalness: 0.2 }), [0, 0.05, 0])
  addMesh(inkBottle, new THREE.CylinderGeometry(0.035, 0.04, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0x8a7048 }), [0, 0.12, 0])
  exp.add(inkBottle)

  const candle = new THREE.Group()
  candle.position.set(-0.85, 0.74, 0.38)
  addMesh(candle, new THREE.CylinderGeometry(0.04, 0.045, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.6, roughness: 0.3 }), [0, 0.02, 0])
  addMesh(candle, new THREE.CylinderGeometry(0.018, 0.022, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xf0e6d0 }), [0, 0.11, 0])
  const flame = addMesh(
    candle,
    new THREE.SphereGeometry(0.028, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffcc55, transparent: true, opacity: 0.9 }),
    [0, 0.22, 0]
  )
  exp.add(candle)
  exp.userData.flame = flame

  const lightCone = addMesh(
    exp,
    new THREE.ConeGeometry(0.9, 1.8, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }),
    [-0.85, 1.5, 0.38],
    [Math.PI, 0, 0]
  )
  lightCone.userData.lightCone = true
  exp.userData.lightCone = lightCone

  const inkGeo = new THREE.BufferGeometry()
  const inkCount = 100
  const inkPos = new Float32Array(inkCount * 3)
  const inkVel = []
  for (let i = 0; i < inkCount; i++) {
    inkPos[i * 3] = 0.4
    inkPos[i * 3 + 1] = 0.8
    inkPos[i * 3 + 2] = 0.4
    inkVel.push({ life: 0, vx: 0, vy: 0, vz: 0 })
  }
  inkGeo.setAttribute('position', new THREE.BufferAttribute(inkPos, 3))
  const inkPts = new THREE.Points(
    inkGeo,
    new THREE.PointsMaterial({ color: 0x1a1410, size: 0.025, transparent: true, opacity: 0.8 })
  )
  exp.add(inkPts)
  exp.userData.inkParticles = inkPts
  exp.userData.inkVel = inkVel

  const echoGroup = new THREE.Group()
  CAPTAINS_LOG_ECHOES.forEach((p) => {
    const sprite = echoSprite(p.text)
    sprite.position.set(p.x, p.y, -0.5)
    sprite.userData.triggerAt = p.at
    sprite.userData.echoLife = 0
    echoGroup.add(sprite)
  })
  exp.add(echoGroup)
  exp.userData.echoGroup = echoGroup

  addMesh(exp, new THREE.BoxGeometry(3.5, 2.8, 0.15), woodMat(0x0a0604), [0, 1.8, -1.8])
  for (let i = 0; i < 5; i++) {
    addMesh(exp, new THREE.BoxGeometry(0.14, 0.32, 0.1), new THREE.MeshStandardMaterial({
      color: [0x4a1818, 0x1a2848, 0x1a3828][i % 3],
      roughness: 0.9,
    }), [-1.2 + i * 0.55, 1.55 + (i % 2) * 0.38, -1.72])
  }

  const candleLight = new THREE.PointLight(0xffaa55, 2.2, 6)
  candleLight.position.set(-0.85, 0.98, 0.55)
  candleLight.castShadow = false
  exp.add(candleLight)
  exp.userData.candleLight = candleLight

  const pageLight = new THREE.PointLight(0xffeedd, 0.6, 4)
  pageLight.position.set(0.3, 1.1, 0.8)
  exp.add(pageLight)
  exp.userData.pageLight = pageLight

  exp.add(new THREE.AmbientLight(0x1a1008, 0.25))

  return exp
}

export function getLogExperienceCamera() {
  return {
    position: new THREE.Vector3(0.12, 1.18, 1.55),
    lookAt: new THREE.Vector3(0, 0.82, 0.15),
    fov: 44,
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

  const { revealChars, progress } = getLogRevealState(exp.userData.startTime, time)
  exp.userData.revealProgress = progress

  if (exp.userData.parchmentCtx) {
    drawParchment(exp.userData.parchmentCtx, exp.userData.parchmentCanvas, revealChars, time)
    exp.userData.parchmentTex.needsUpdate = true
  }

  const quill = exp.userData.quill
  if (quill) {
    const line = Math.floor(revealChars / 38)
    quill.position.x = 0.05 + (revealChars % 38) * 0.011
    quill.position.y = 0.86 - line * 0.022
    quill.position.z = 0.42 + line * 0.004
    quill.rotation.z = -0.4 + Math.sin(time * 7) * 0.15
    quill.rotation.x = 0.3 + Math.sin(time * 5) * 0.08
  }

  if (exp.userData.candleLight) {
    exp.userData.candleLight.intensity = 1.8 + Math.sin(time * 9) * 0.5
  }
  if (exp.userData.pageLight) {
    exp.userData.pageLight.intensity = 0.45 + Math.sin(time * 3) * 0.1
  }
  if (exp.userData.flame) {
    exp.userData.flame.scale.set(
      1 + Math.sin(time * 12) * 0.2,
      1 + Math.sin(time * 15) * 0.3,
      1 + Math.sin(time * 11) * 0.15
    )
  }
  if (exp.userData.lightCone) {
    exp.userData.lightCone.material.opacity = 0.04 + Math.sin(time * 8) * 0.02
  }

  const ink = exp.userData.inkParticles
  const inkVel = exp.userData.inkVel
  if (ink && quill && inkVel && Math.random() > 0.7) {
    const i = Math.floor(Math.random() * inkVel.length)
    const pos = ink.geometry.attributes.position
    pos.array[i * 3] = quill.position.x
    pos.array[i * 3 + 1] = quill.position.y - 0.03
    pos.array[i * 3 + 2] = quill.position.z
    inkVel[i] = {
      life: 1,
      vx: (Math.random() - 0.5) * 0.004,
      vy: -0.006 - Math.random() * 0.008,
      vz: (Math.random() - 0.5) * 0.004,
    }
  }
  if (ink && inkVel) {
    const pos = ink.geometry.attributes.position
    inkVel.forEach((v, i) => {
      if (v.life > 0) {
        pos.array[i * 3] += v.vx
        pos.array[i * 3 + 1] += v.vy
        pos.array[i * 3 + 2] += v.vz
        v.life -= 0.025
        v.vy -= 0.0002
      }
    })
    pos.needsUpdate = true
  }

  exp.userData.echoGroup?.children.forEach((sprite) => {
    const trigger = sprite.userData.triggerAt ?? 1
    if (progress >= trigger && progress < trigger + 0.16) {
      sprite.userData.echoLife = Math.min(1, (sprite.userData.echoLife || 0) + 0.025)
      sprite.material.opacity = sprite.userData.echoLife * 0.55
      sprite.position.y += 0.002
    } else if (sprite.userData.echoLife > 0) {
      sprite.userData.echoLife *= 0.97
      sprite.material.opacity = sprite.userData.echoLife * 0.35
    }
  })

  exp.traverse((obj) => {
    if (obj.userData.dustDrift !== undefined) {
      obj.position.y += Math.sin(time * 0.5 + obj.userData.dustDrift) * 0.0006
      obj.position.x += Math.cos(time * 0.3 + obj.userData.dustDrift) * 0.0003
      obj.material.opacity = 0.1 + Math.sin(time * 2 + obj.userData.dustDrift) * 0.15
    }
  })

  if (exp.userData.book) {
    exp.userData.book.rotation.z = Math.sin(time * 0.4) * 0.008
  }
}

export function isLogExperienceComplete(exp) {
  return (exp?.userData.revealProgress ?? 0) >= 0.95
}
