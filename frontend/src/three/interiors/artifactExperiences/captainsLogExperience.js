import * as THREE from 'three'
import { addMesh, woodMat, neonMat } from '../buildRoom.js'

const GOLD = 0xc9a227
const CYAN = 0x00ffcc

const LOG_LINES = [
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

const ECHO_PHRASES = [
  { text: 'ME HEARTIES', at: 0.12, color: GOLD },
  { text: 'THE LIST', at: 0.38, color: CYAN },
  { text: 'TRIP SHIP', at: 0.55, color: 0xff00ff },
  { text: 'STAY SEAWORTHY', at: 0.88, color: GOLD },
]

function parchmentTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return { canvas, ctx, tex }
}

function drawParchment(ctx, canvas, revealChars, time) {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, '#e8dcc8')
  grad.addColorStop(0.5, '#f0e6d0')
  grad.addColorStop(1, '#d8c8a8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(139, 100, 60, 0.2)'
  for (let y = 80; y < canvas.height - 40; y += 36) {
    ctx.beginPath()
    ctx.moveTo(60, y)
    ctx.lineTo(canvas.width - 60, y)
    ctx.stroke()
  }

  const fullText = LOG_LINES.join('\n')
  let charIndex = 0
  const lineHeight = 42
  let y = 70

  for (const line of LOG_LINES) {
    if (charIndex + line.length + 1 < revealChars || line === '') {
      const show = line === '' ? '' : line.slice(0, Math.max(0, revealChars - charIndex))
      if (show) {
        ctx.fillStyle = show.startsWith('—') ? '#5a4030' : '#1a1410'
        ctx.font = show.startsWith('—') ? 'bold 38px Georgia, serif' : 'italic 32px Georgia, serif'
        ctx.fillText(show, 72, y)
        if (show.startsWith('—') && revealChars > charIndex + line.length - 5) {
          ctx.shadowColor = '#c9a227'
          ctx.shadowBlur = 12 + Math.sin(time * 4) * 6
          ctx.fillText(show, 72, y)
          ctx.shadowBlur = 0
        }
      }
      charIndex += line.length + 1
      y += line === '' ? 20 : lineHeight
    } else {
      const partial = line.slice(0, revealChars - charIndex)
      if (partial) {
        ctx.fillStyle = '#1a1410'
        ctx.font = 'italic 32px Georgia, serif'
        ctx.fillText(partial, 72, y)
      }
      if (partial && Math.sin(time * 10) > 0) {
        const w = ctx.measureText(partial).width
        ctx.fillStyle = '#c9a227'
        ctx.fillRect(72 + w + 2, y + 4, 3, 28)
      }
      break
    }
  }
}

function createInkParticles(count = 120) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const vel = []
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 0.3
    pos[i * 3 + 1] = 0.8 + Math.random() * 0.2
    pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    vel.push({
      x: (Math.random() - 0.5) * 0.02,
      y: -0.01 - Math.random() * 0.03,
      z: (Math.random() - 0.5) * 0.02,
      life: Math.random(),
    })
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({
    color: 0x1a1410,
    size: 0.025,
    transparent: true,
    opacity: 0.7,
    blending: THREE.NormalBlending,
  })
  const pts = new THREE.Points(geo, mat)
  pts.userData.velocities = vel
  return pts
}

function createEchoWord(text, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.font = 'bold 48px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
  ctx.shadowColor = ctx.fillStyle
  ctx.shadowBlur = 24
  ctx.fillText(text, 256, 72)
  const tex = new THREE.CanvasTexture(canvas)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(1.8, 0.45, 1)
  sprite.position.set((Math.random() - 0.5) * 0.5, 1.4, -0.3)
  sprite.userData.echoText = text
  sprite.userData.echoColor = color
  sprite.userData.echoLife = 0
  return sprite
}

export function createCaptainsLogArtifact() {
  const artifact = new THREE.Group()
  artifact.name = 'captains-log-artifact'
  artifact.userData.isRoomArtifact = true
  artifact.userData.artifactType = 'captains-log'
  artifact.userData.artifactLabel = "Open the Captain's Log"

  addMesh(artifact, new THREE.BoxGeometry(0.55, 0.12, 0.75), woodMat(0x3a2818), [0, 0.06, 0])
  const pages = addMesh(
    artifact,
    new THREE.BoxGeometry(0.48, 0.08, 0.68),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc8, emissive: GOLD, emissiveIntensity: 0.5, roughness: 0.9 }),
    [0, 0.14, 0.02]
  )
  pages.userData.pulse = 0

  addMesh(artifact, new THREE.BoxGeometry(0.08, 0.18, 0.75), woodMat(0x2a1a0a), [-0.28, 0.04, 0])

  const ring = addMesh(
    artifact,
    new THREE.TorusGeometry(0.45, 0.012, 8, 48),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending }),
    [0, 0.2, 0],
    [Math.PI / 2, 0, 0]
  )
  ring.userData.animType = 'artifactRing'

  addMesh(artifact, new THREE.ConeGeometry(0.02, 0.22, 6), neonMat(GOLD, 1.2), [0.32, 0.2, 0.25], [0.4, 0, -0.5])

  const glow = new THREE.PointLight(GOLD, 5, 5)
  glow.position.set(0, 0.3, 0.2)
  artifact.add(glow)
  artifact.userData.artifactGlow = glow

  return artifact
}

export function createCaptainsLogExperience() {
  const exp = new THREE.Group()
  exp.name = 'captains-log-experience'
  exp.visible = false
  exp.userData.experienceType = 'captains-log'
  exp.userData.startTime = 0
  exp.userData.revealSpeed = 32

  const voidBg = addMesh(
    exp,
    new THREE.SphereGeometry(12, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x020408, side: THREE.BackSide }),
    [0, 1, 0]
  )

  for (let i = 0; i < 40; i++) {
    const star = addMesh(
      exp,
      new THREE.SphereGeometry(0.02, 4, 4),
      new THREE.MeshBasicMaterial({ color: i % 3 ? CYAN : GOLD, transparent: true, opacity: 0.5 }),
      [(Math.random() - 0.5) * 8, Math.random() * 4, (Math.random() - 0.5) * 8]
    )
    star.userData.drift = Math.random() * Math.PI * 2
  }

  addMesh(exp, new THREE.BoxGeometry(2.6, 0.08, 1.5), woodMat(0x3a2818), [0, 0.72, 0])
  addMesh(exp, new THREE.BoxGeometry(2.4, 0.95, 0.1), woodMat(0x4a3020), [0, 0.35, -0.65])

  const ghostPage = addMesh(
    exp,
    new THREE.PlaneGeometry(1.45, 1.05),
    new THREE.MeshStandardMaterial({
      color: 0xe8dcc8,
      emissive: CYAN,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    }),
    [0.04, 0.8, -0.02],
    [-0.35, 0.05, 0]
  )
  ghostPage.userData.isGhostPage = true

  const { canvas, ctx, tex } = parchmentTexture()
  addMesh(
    exp,
    new THREE.PlaneGeometry(1.55, 1.15),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      roughness: 0.95,
      side: THREE.DoubleSide,
    }),
    [0, 0.78, 0.06],
    [-0.38, 0, 0]
  )

  exp.userData.parchmentCanvas = canvas
  exp.userData.parchmentCtx = ctx
  exp.userData.parchmentTex = tex

  const quill = addMesh(
    exp,
    new THREE.ConeGeometry(0.018, 0.2, 6),
    new THREE.MeshStandardMaterial({ color: 0xc9a227, emissive: GOLD, emissiveIntensity: 1.2 }),
    [0.5, 0.88, 0.18],
    [0.5, 0, -0.3]
  )
  exp.userData.quill = quill

  const inkTrail = addMesh(
    exp,
    new THREE.SphereGeometry(0.02, 6, 6),
    neonMat(0x1a1410, 0.5),
    [0.5, 0.86, 0.16]
  )
  exp.userData.inkTrail = inkTrail

  addMesh(exp, new THREE.CylinderGeometry(0.045, 0.055, 0.14, 8), woodMat(0x5a4030), [-0.95, 0.78, 0.25])
  const flame = addMesh(exp, new THREE.SphereGeometry(0.06, 8, 8), neonMat(0xffaa44, 2.5), [-0.95, 0.9, 0.25])
  exp.userData.flame = flame

  const ink = createInkParticles(150)
  exp.add(ink)
  exp.userData.inkParticles = ink

  const echoGroup = new THREE.Group()
  ECHO_PHRASES.forEach((p) => {
    const sprite = createEchoWord(p.text, p.color)
    sprite.userData.triggerAt = p.at
    echoGroup.add(sprite)
  })
  exp.add(echoGroup)
  exp.userData.echoGroup = echoGroup

  const portal = addMesh(
    exp,
    new THREE.TorusGeometry(0.55, 0.04, 8, 32),
    neonMat(CYAN, 2),
    [0, 1.35, 0.2],
    [Math.PI / 2, 0, 0]
  )
  portal.userData.isPortal = true
  portal.visible = false
  exp.userData.portal = portal

  exp.add(new THREE.PointLight(0xffeedd, 15, 10).translateX(0).translateY(1.9).translateZ(1.3))
  const candleLight = new THREE.PointLight(0xffaa44, 10, 6)
  candleLight.position.set(-0.95, 0.95, 0.35)
  exp.add(candleLight)
  exp.userData.candleLight = candleLight

  const goldRim = new THREE.PointLight(GOLD, 8, 8)
  goldRim.position.set(0.6, 1.3, 0.5)
  exp.add(goldRim)

  return exp
}

export function getLogExperienceCamera() {
  return {
    position: new THREE.Vector3(0, 1.05, 1.45),
    lookAt: new THREE.Vector3(0, 0.78, 0),
    fov: 40,
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
  if (!exp?.visible || !exp.userData.parchmentCtx) return

  const elapsed = time - (exp.userData.startTime || 0)
  const fullLen = LOG_LINES.join('\n').length
  const revealChars = Math.min(fullLen, Math.floor(elapsed * exp.userData.revealSpeed))
  const progress = revealChars / fullLen

  drawParchment(exp.userData.parchmentCtx, exp.userData.parchmentCanvas, revealChars, time)
  exp.userData.parchmentTex.needsUpdate = true
  exp.userData.revealProgress = progress

  const quill = exp.userData.quill
  const inkTrail = exp.userData.inkTrail
  if (quill) {
    const line = Math.floor(revealChars / 42)
    quill.position.x = -0.52 + (revealChars % 42) * 0.019
    quill.position.y = 0.94 - line * 0.026
    quill.rotation.z = -0.35 + Math.sin(time * 6) * 0.12
    if (inkTrail) inkTrail.position.copy(quill.position).add(new THREE.Vector3(0, -0.04, -0.02))
  }

  const ink = exp.userData.inkParticles
  if (ink && quill && Math.random() > 0.65) {
    const pos = ink.geometry.attributes.position
    const v = ink.userData.velocities
    const i = Math.floor(Math.random() * v.length)
    pos.array[i * 3] = quill.position.x + (Math.random() - 0.5) * 0.04
    pos.array[i * 3 + 1] = quill.position.y - 0.02
    pos.array[i * 3 + 2] = quill.position.z
    v[i].life = 1
  }
  if (ink) {
    const pos = ink.geometry.attributes.position
    ink.userData.velocities.forEach((v, i) => {
      if (v.life > 0) {
        pos.array[i * 3] += v.x
        pos.array[i * 3 + 1] += v.y
        pos.array[i * 3 + 2] += v.z
        v.life -= 0.02
        v.y -= 0.0008
      }
    })
    pos.needsUpdate = true
  }

  exp.userData.echoGroup?.children.forEach((sprite) => {
    const trigger = sprite.userData.triggerAt ?? 1
    if (progress >= trigger && progress < trigger + 0.15) {
      sprite.userData.echoLife = Math.min(1, (sprite.userData.echoLife || 0) + 0.03)
      sprite.material.opacity = sprite.userData.echoLife * 0.7
      sprite.position.y = 1.2 + sprite.userData.echoLife * 0.6
      sprite.scale.setScalar(1.8 + sprite.userData.echoLife * 0.4)
    } else if (sprite.userData.echoLife > 0) {
      sprite.userData.echoLife *= 0.98
      sprite.material.opacity = sprite.userData.echoLife * 0.5
    }
  })

  exp.traverse((obj) => {
    if (obj.userData.drift !== undefined) {
      obj.position.y += Math.sin(time + obj.userData.drift) * 0.0008
      obj.rotation.y = time * 0.2 + obj.userData.drift
    }
    if (obj.userData.isGhostPage) {
      obj.position.x = 0.04 + Math.sin(time * 0.7) * 0.02
      obj.material.opacity = 0.08 + Math.sin(time * 2) * 0.04
    }
  })

  if (exp.userData.candleLight) {
    exp.userData.candleLight.intensity = 7 + Math.sin(time * 7) * 3
  }
  if (exp.userData.flame) {
    exp.userData.flame.scale.setScalar(1 + Math.sin(time * 9) * 0.2)
  }

  const portal = exp.userData.portal
  if (portal) {
    portal.visible = progress > 0.92
    if (portal.visible) {
      portal.rotation.z = time * 1.5
      portal.scale.setScalar(1 + Math.sin(time * 3) * 0.08)
    }
  }
}

export function isLogExperienceComplete(exp) {
  return (exp?.userData.revealProgress ?? 0) >= 0.95
}
