import * as THREE from 'three'
import { addMesh, woodMat, neonMat } from './buildRoom.js'

const PINK = 0xff00ff
const CYAN = 0x00ffcc
const GOLD = 0xc9a227

function metal(color = 0x2a2a3a) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.9, side: THREE.DoubleSide })
}

function coat() {
  return new THREE.MeshStandardMaterial({
    color: 0x12081e,
    roughness: 0.85,
    emissive: 0x330044,
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide,
  })
}

function canvasMat(draw, w = 256, h = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d'), w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return {
    mat: new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: 0xffffff,
      emissiveIntensity: 1.2,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
    canvas,
    tex,
  }
}

function neonSign(text, sub = '') {
  const { mat } = canvasMat((ctx, w, h) => {
    ctx.fillStyle = '#06030c'
    ctx.fillRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, '#ff00ff')
    g.addColorStop(0.5, '#fff')
    g.addColorStop(1, '#00ffcc')
    ctx.font = 'bold 52px monospace'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#ff00ff'
    ctx.shadowBlur = 28
    ctx.fillStyle = g
    ctx.fillText(text, w / 2, h * 0.45)
    if (sub) {
      ctx.font = '22px monospace'
      ctx.fillStyle = '#00ffcc'
      ctx.shadowBlur = 12
      ctx.fillText(sub, w / 2, h * 0.72)
    }
  }, 640, 160)
  return mat
}

function faceTexture() {
  const { mat } = canvasMat((ctx, w, h) => {
    ctx.fillStyle = '#1a3a2a'
    ctx.beginPath()
    ctx.ellipse(w / 2, h / 2, w * 0.42, h * 0.46, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#111'
    ctx.fillRect(w * 0.12, h * 0.28, w * 0.22, h * 0.14)
    ctx.fillStyle = '#ff1133'
    ctx.shadowColor = '#ff0044'
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.arc(w * 0.62, h * 0.36, w * 0.09, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.strokeStyle = '#00ffcc'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(w * 0.55, h * 0.5)
    ctx.lineTo(w * 0.78, h * 0.58)
    ctx.lineTo(w * 0.52, h * 0.62)
    ctx.stroke()

    ctx.fillStyle = '#8899aa'
    ctx.fillRect(w * 0.32, h * 0.58, w * 0.36, h * 0.1)
    ctx.fillStyle = '#aaccdd'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(w * 0.34 + i * 0.08 * w, h * 0.59, w * 0.04, h * 0.02)
    }

    ctx.fillStyle = '#2a1a0a'
    ctx.beginPath()
    ctx.moveTo(w * 0.2, h * 0.12)
    ctx.lineTo(w * 0.5, h * 0.02)
    ctx.lineTo(w * 0.8, h * 0.12)
    ctx.lineTo(w * 0.72, h * 0.22)
    ctx.lineTo(w * 0.28, h * 0.22)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#c9a227'
    ctx.lineWidth = 4
    ctx.stroke()
  }, 256, 256)
  return mat
}

function ledWallTexture() {
  const { mat, canvas, tex } = canvasMat((ctx, w, h) => {
    ctx.fillStyle = '#08041a'
    ctx.fillRect(0, 0, w, h)
  }, 512, 192)
  return { mat, canvas, tex }
}

/** Hero stage — platform, rig, DJ Krakenbyte, lighting */
export function createKrakenbyteStage(stageZ = -3.8) {
  const stage = new THREE.Group()
  stage.name = 'krakenbyte-stage'
  stage.position.set(0, 0, stageZ)
  stage.userData.animType = 'stage'

  const platform = addMesh(stage, new THREE.BoxGeometry(5.5, 0.35, 3.2), woodMat(0x1a1028), [0, 0.18, 0])
  addMesh(stage, new THREE.BoxGeometry(5.6, 0.06, 3.3), neonMat(PINK, 1.2), [0, 0.38, 0])
  addMesh(stage, new THREE.BoxGeometry(5.6, 0.04, 3.3), neonMat(CYAN, 0.8), [0, 0.01, 0])

  const led = ledWallTexture()
  const ledWall = addMesh(stage, new THREE.PlaneGeometry(5.2, 1.8), led.mat, [0, 2.6, -1.45])
  stage.userData.ledCanvas = led.canvas
  stage.userData.ledTex = led.tex

  const sign = addMesh(
    stage,
    new THREE.PlaneGeometry(4.2, 1.0),
    neonSign('DJ KRAKENBYTE', 'MUTANT AI PIRATE'),
    [0, 3.55, -0.2]
  )
  sign.userData.animType = 'sign'

  const booth = buildDJBooth()
  booth.position.set(0, 0.35, 0.35)
  stage.add(booth)
  stage.userData.rig = booth

  const dj = buildKrakenbyteDJ()
  dj.position.set(0, 0.35, 1.05)
  stage.add(dj)
  stage.userData.dj = dj

  const spotPink = new THREE.SpotLight(PINK, 80, 18, Math.PI / 6, 0.4, 1)
  spotPink.position.set(-2.5, 5.5, 4)
  spotPink.target.position.set(0, 1.8, 0.5)
  stage.add(spotPink, spotPink.target)

  const spotCyan = new THREE.SpotLight(CYAN, 60, 18, Math.PI / 6, 0.4, 1)
  spotCyan.position.set(2.5, 5.5, 4)
  spotCyan.target.position.set(0, 1.8, 0.5)
  stage.add(spotCyan, spotCyan.target)

  const key = new THREE.PointLight(0xffeedd, 25, 12)
  key.position.set(0, 3, 2.5)
  stage.add(key)

  const rim = new THREE.PointLight(PINK, 15, 10)
  rim.position.set(0, 2, -1)
  stage.add(rim)
  stage.userData.rimLight = rim

  return stage
}

function buildDJBooth() {
  const rig = new THREE.Group()
  rig.userData.animType = 'rig'

  const desk = addMesh(rig, new THREE.BoxGeometry(4.2, 0.9, 1.5), woodMat(0x12081a), [0, 0.45, 0])
  addMesh(rig, new THREE.BoxGeometry(4.0, 0.05, 1.35), neonMat(PINK, 1.0), [0, 0.92, 0])

  const deckL = buildCDJ([-1.35, 0.95, 0.1], PINK)
  const deckR = buildCDJ([1.35, 0.95, 0.1], CYAN)
  rig.add(deckL, deckR)

  const mixer = addMesh(rig, new THREE.BoxGeometry(1.1, 0.1, 0.7), metal(0x1a1a2a), [0, 0.98, 0.05])
  for (let i = 0; i < 6; i++) {
    const fader = addMesh(mixer, new THREE.BoxGeometry(0.05, 0.18, 0.05), neonMat(i % 2 ? PINK : CYAN, 2), [-0.4 + i * 0.16, 0.1, 0.2])
    fader.userData.faderIndex = i
  }

  const vuL = addMesh(rig, new THREE.PlaneGeometry(0.35, 0.5), neonMat(CYAN, 0.8), [-0.55, 1.15, 0.76])
  const vuR = addMesh(rig, new THREE.PlaneGeometry(0.35, 0.5), neonMat(PINK, 0.8), [0.55, 1.15, 0.76])
  vuL.userData.vu = 0
  vuR.userData.vu = 1

  return rig
}

function buildCDJ(pos, color) {
  const deck = new THREE.Group()
  deck.position.set(...pos)
  deck.userData.animType = 'turntable'

  addMesh(deck, new THREE.BoxGeometry(0.95, 0.12, 0.75), metal(0x111118), [0, 0, 0])
  addMesh(deck, new THREE.BoxGeometry(0.85, 0.04, 0.65), neonMat(color, 0.5), [0, 0.08, 0])

  const platter = addMesh(deck, new THREE.CylinderGeometry(0.38, 0.39, 0.03, 32), metal(0x0a0a10), [0, 0.14, 0])
  platter.userData.spin = true

  addMesh(platter, new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), neonMat(color, 1.8), [0, 0.02, 0])
  addMesh(platter, new THREE.BoxGeometry(0.03, 0.32, 0.01), neonMat(0xffffff, 0.4), [0.16, 0.03, 0])

  addMesh(deck, new THREE.PlaneGeometry(0.55, 0.35), neonMat(color, 1.0), [0, 0.28, -0.28])
  const glow = new THREE.PointLight(color, 4, 3)
  glow.position.set(0, 0.2, 0)
  deck.add(glow)

  return deck
}

function buildKrakenbyteDJ() {
  const dj = new THREE.Group()
  dj.name = 'dj-krakenbyte'
  dj.userData.animType = 'dj'
  dj.scale.setScalar(1.35)

  const torso = addMesh(dj, new THREE.BoxGeometry(0.9, 1.0, 0.45), coat(), [0, 1.15, 0])
  addMesh(dj, new THREE.BoxGeometry(1.1, 0.15, 0.5), woodMat(0x2a1a0a), [0, 0.62, 0.02])

  const chestScreen = addMesh(
    dj,
    new THREE.PlaneGeometry(0.45, 0.3),
    neonSign('AI', 'ONLINE'),
    [0, 1.2, 0.24]
  )
  chestScreen.userData.pulse = 0

  const head = addMesh(dj, new THREE.BoxGeometry(0.62, 0.68, 0.5), coat(), [0, 1.85, 0.02])
  const face = addMesh(head, new THREE.PlaneGeometry(0.55, 0.58), faceTexture(), [0, 0.02, 0.26])
  face.userData.animType = 'face'

  addMesh(head, new THREE.ConeGeometry(0.55, 0.28, 3), woodMat(0x0a0a0a), [0, 0.42, 0.02])
  addMesh(head, new THREE.TorusGeometry(0.48, 0.025, 6, 3), neonMat(GOLD, 1.2), [0, 0.38, 0.05], [0, 0, 0])

  const halo = addMesh(dj, new THREE.TorusGeometry(0.55, 0.02, 8, 48), neonMat(CYAN, 2.5), [0, 2.35, 0], [Math.PI / 2, 0, 0])
  halo.userData.animType = 'halo'

  const armL = addMesh(dj, new THREE.CylinderGeometry(0.1, 0.11, 0.75, 10), metal(0x556677), [-0.55, 1.05, 0.25], [0.6, 0, 0.4])
  armL.userData.animType = 'armL'
  addMesh(armL, new THREE.SphereGeometry(0.12, 10, 10), metal(), [0, -0.38, 0], [0, 0, 0])

  const tentacle = new THREE.Group()
  tentacle.position.set(0.58, 1.15, 0.2)
  tentacle.userData.animType = 'tentacle'
  const segs = []
  for (let i = 0; i < 5; i++) {
    const seg = addMesh(
      tentacle,
      new THREE.CylinderGeometry(0.09 - i * 0.012, 0.1 - i * 0.012, 0.28, 10),
      neonMat(i % 2 ? CYAN : PINK, 2.2),
      [0, -i * 0.22, 0]
    )
    seg.rotation.z = -0.4 - i * 0.12
    seg.rotation.x = 0.15 + i * 0.05
    segs.push(seg)
  }
  addMesh(tentacle, new THREE.ConeGeometry(0.05, 0.18, 8), neonMat(PINK, 3), [0.08, -1.15, 0.15], [0.6, 0, 0.2])
  dj.add(tentacle)
  dj.userData.tentacleTip = segs[segs.length - 1]

  addMesh(dj, new THREE.CylinderGeometry(0.1, 0.09, 0.7, 10), woodMat(0x5a4030), [-0.22, 0.35, 0.05])
  addMesh(dj, new THREE.CylinderGeometry(0.14, 0.15, 0.7, 10), coat(), [0.22, 0.35, 0.05])
  addMesh(dj, new THREE.BoxGeometry(0.2, 0.12, 0.35), woodMat(0x1a1a1a), [0.22, 0.06, 0.12])

  const eyeLight = new THREE.PointLight(0xff1133, 12, 4)
  eyeLight.position.set(0.15, 1.9, 0.55)
  dj.add(eyeLight)
  dj.userData.eyeLight = eyeLight

  const aura = addMesh(
    dj,
    new THREE.TorusGeometry(0.75, 0.015, 8, 64),
    new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }),
    [0, 1.2, -0.15],
    [Math.PI / 2, 0, 0]
  )
  aura.userData.animType = 'aura'

  return dj
}

export function createDeckSessionsMeta(width, depth) {
  return {
    spawn: new THREE.Vector3(0, 1.65, depth / 2 - 3.2),
    exitZ: depth / 2 - 0.6,
    bounds: {
      minX: -width / 2 + 0.45,
      maxX: width / 2 - 0.45,
      minZ: -depth / 2 + 0.45,
      maxZ: depth / 2 - 0.45,
    },
    spawnYaw: Math.PI,
    focusPoint: new THREE.Vector3(0, 1.6, -3.8),
  }
}

export function animateDeckStage(stage, time, beat) {
  if (!stage) return

  const dj = stage.userData.dj
  if (dj) {
    if (dj.userData.baseY === undefined) dj.userData.baseY = dj.position.y
    dj.position.y = dj.userData.baseY + Math.sin(beat) * 0.05
    dj.rotation.y = Math.sin(time * 0.4) * 0.06

    dj.traverse((obj) => {
      if (obj.userData.animType === 'armL') {
        obj.rotation.x = 0.6 + Math.sin(beat * 1.5) * 0.35
      }
      if (obj.userData.animType === 'tentacle') {
        obj.rotation.z = -0.5 + Math.sin(beat * 2) * 0.4
        obj.rotation.x = 0.2 + Math.cos(beat * 2.5) * 0.2
      }
      if (obj.userData.animType === 'halo') {
        obj.rotation.z = time * 1.2
      }
      if (obj.userData.animType === 'aura') {
        obj.material.opacity = 0.25 + Math.sin(beat * 2) * 0.15
        obj.scale.setScalar(1 + Math.sin(beat) * 0.05)
      }
      if (obj.userData.pulse !== undefined && obj.material?.emissiveIntensity !== undefined) {
        obj.material.emissiveIntensity = 1 + Math.sin(beat * 4) * 0.6
      }
    })
  }

  stage.traverse((obj) => {
    if (obj.userData.spin) {
      obj.rotation.y = time * 3.2
    }
    if (obj.userData.faderIndex !== undefined) {
      obj.position.y = 0.1 + Math.sin(beat * 3 + obj.userData.faderIndex) * 0.06
    }
    if (obj.userData.vu !== undefined) {
      obj.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(time * 8 + obj.userData.vu * 2)) * 1.4
    }
    if (obj.userData.animType === 'sign' && obj.material?.emissiveIntensity !== undefined) {
      obj.material.emissiveIntensity = 1.2 + Math.sin(time * 3) * 0.4
    }
  })

  if (dj?.userData?.eyeLight) {
    dj.userData.eyeLight.intensity = 8 + Math.sin(beat * 4) * 6
  }

  if (stage.userData.rimLight) {
    stage.userData.rimLight.intensity = 10 + Math.sin(beat * 2) * 8
  }

  const canvas = stage.userData.ledCanvas
  const tex = stage.userData.ledTex
  if (canvas && tex) {
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#08041a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const bars = 32
    for (let i = 0; i < bars; i++) {
      const h = (Math.sin(time * 6 + i * 0.4) * 0.5 + 0.5) * canvas.height * 0.75 + 8
      ctx.fillStyle = i % 2 ? '#ff00ff' : '#00ffcc'
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 8
      ctx.fillRect(i * (canvas.width / bars) + 2, canvas.height - h, canvas.width / bars - 4, h)
    }
    tex.needsUpdate = true
  }
}
