import * as THREE from 'three'

function woodMaterial(dark = false) {
  return new THREE.MeshStandardMaterial({
    color: dark ? 0x2a1a0a : 0x5c3d1e,
    roughness: 0.85,
    metalness: 0.1,
  })
}

function goldMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xc9a227,
    roughness: 0.35,
    metalness: 0.85,
    emissive: 0x3d2a08,
    emissiveIntensity: 0.3,
  })
}

function neonMaterial(color, intensity = 2) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.2,
    metalness: 0.5,
  })
}

function createSkullFlagTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a0a1a'
  ctx.fillRect(0, 0, 256, 128)
  ctx.strokeStyle = '#c9a227'
  ctx.lineWidth = 4
  ctx.strokeRect(4, 4, 248, 120)
  ctx.fillStyle = '#e8dcc8'
  ctx.beginPath()
  ctx.arc(128, 52, 28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#0a0a12'
  ctx.beginPath()
  ctx.arc(118, 48, 6, 0, Math.PI * 2)
  ctx.arc(138, 48, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ff00ff'
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('TRIP SHIP', 128, 100)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createBassBin(width, height, color) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, width * 0.7),
    neonMaterial(color, 1.5)
  )
  group.add(body)
  const cone = new THREE.Mesh(
    new THREE.CircleGeometry(width * 0.35, 16),
    neonMaterial(color, 2.5)
  )
  cone.position.z = width * 0.36
  group.add(cone)
  const light = new THREE.PointLight(color, 3, 8)
  light.position.z = width * 0.5
  group.add(light)
  group.userData.pulseLight = light
  group.userData.pulseMat = body.material
  return group
}

export function buildGalleon() {
  const ship = new THREE.Group()
  ship.name = 'galleon'

  // Hull
  const hullShape = new THREE.Shape()
  hullShape.moveTo(-3.2, 0)
  hullShape.quadraticCurveTo(-3.5, 0.8, -2.8, 1.2)
  hullShape.lineTo(2.8, 1.2)
  hullShape.quadraticCurveTo(3.8, 0.6, 4.2, 0)
  hullShape.lineTo(3.5, -0.9)
  hullShape.quadraticCurveTo(0, -1.4, -3.2, -0.9)
  hullShape.closePath()

  const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
    depth: 1.6,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 2,
  })
  hullGeo.center()
  const hull = new THREE.Mesh(hullGeo, woodMaterial())
  hull.rotation.x = Math.PI / 2
  hull.position.y = -0.2
  ship.add(hull)

  // Gold rail
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.08, 1.7),
    goldMaterial()
  )
  rail.position.set(0, 0.55, 0)
  ship.add(rail)

  // Deck
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.1, 1.4),
    woodMaterial(true)
  )
  deck.position.set(-0.2, 0.45, 0)
  ship.add(deck)

  // Stern castle
  const stern = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.6, 1.3),
    woodMaterial(true)
  )
  stern.position.set(-2.4, 1.1, 0)
  ship.add(stern)

  // Masts
  const mastMat = woodMaterial(true)
  const mastPositions = [
    { x: 1.2, h: 4.2 },
    { x: -0.3, h: 5.5 },
    { x: -1.8, h: 3.8 },
  ]
  mastPositions.forEach(({ x, h }) => {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 8), mastMat)
    mast.position.set(x, h / 2 + 0.5, 0)
    ship.add(mast)

    const yard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.06), mastMat)
    yard.position.set(x, h * 0.55 + 0.5, 0)
    ship.add(yard)
  })

  // Sails
  const sailMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.9,
    side: THREE.DoubleSide,
    emissive: 0x0a0820,
    emissiveIntensity: 0.4,
  })
  const sailPositions = [
    { x: 1.2, y: 2.8, w: 1.6, h: 2.0, rot: 0.1 },
    { x: -0.3, y: 3.5, w: 1.8, h: 2.4, rot: -0.08 },
    { x: -1.8, y: 2.5, w: 1.3, h: 1.6, rot: 0.05 },
  ]
  const sails = []
  sailPositions.forEach(({ x, y, w, h, rot }) => {
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sailMat.clone())
    sail.position.set(x, y, 0.15)
    sail.rotation.y = rot
    sail.userData.baseRot = rot
    ship.add(sail)
    sails.push(sail)
  })
  ship.userData.sails = sails

  // Jolly Roger flag
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.5),
    new THREE.MeshStandardMaterial({
      map: createSkullFlagTexture(),
      side: THREE.DoubleSide,
      emissive: 0x220022,
      emissiveIntensity: 0.5,
    })
  )
  flag.position.set(-2.4, 2.2, 0.7)
  ship.add(flag)
  ship.userData.flag = flag

  // Sound system rig — Trip Ship bass bins on deck
  const bin1 = createBassBin(0.45, 0.7, 0xff00ff)
  bin1.position.set(0.5, 0.9, 0.3)
  ship.add(bin1)

  const bin2 = createBassBin(0.45, 0.7, 0x00ffcc)
  bin2.position.set(0.5, 0.9, -0.3)
  ship.add(bin2)

  const bin3 = createBassBin(0.35, 0.55, 0xc9a227)
  bin3.position.set(1.4, 0.85, 0)
  ship.add(bin3)

  ship.userData.bassBins = [bin1, bin2, bin3]

  // Warp drive glow at stern
  const engineGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.9,
    })
  )
  engineGlow.position.set(-3.6, 0, 0)
  ship.add(engineGlow)
  ship.userData.engineGlow = engineGlow

  const engineLight = new THREE.PointLight(0x00ffcc, 8, 15)
  engineLight.position.copy(engineGlow.position)
  ship.add(engineLight)
  ship.userData.engineLight = engineLight

    // Pink warp trail particles attached to ship
  const trailCount = 80
  const trailPositions = new Float32Array(trailCount * 3)
  for (let i = 0; i < trailCount; i++) {
    trailPositions[i * 3] = -3.8 - Math.random() * 4
    trailPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2
    trailPositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2
  }
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))
  const trail = new THREE.Points(
    trailGeo,
    new THREE.PointsMaterial({
      color: 0xff00ff,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  ship.add(trail)
  ship.userData.trail = trail

  // Cannons
  for (let i = 0; i < 4; i++) {
    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8),
      goldMaterial()
    )
    cannon.rotation.z = Math.PI / 2
    cannon.position.set(0.5 + i * 0.5, 0.65, i % 2 === 0 ? 0.75 : -0.75)
    ship.add(cannon)
  }

  // Figurehead — neon skull
  const figurehead = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    neonMaterial(0xff00ff, 1.8)
  )
  figurehead.position.set(3.8, 0.3, 0)
  ship.add(figurehead)

  const figureLight = new THREE.PointLight(0xff00ff, 4, 10)
  figureLight.position.copy(figurehead.position)
  ship.add(figureLight)

  // Halo ring around ship
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.02, 8, 64),
    new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    })
  )
  halo.rotation.x = Math.PI / 2
  halo.position.y = 0.3
  ship.add(halo)
  ship.userData.halo = halo

  ship.scale.setScalar(0.55)
  ship.rotation.z = 0.05

  return ship
}

export function animateGalleon(ship, time) {
  ship.rotation.z = Math.sin(time * 0.8) * 0.06 + 0.04
  ship.rotation.x = Math.sin(time * 0.5) * 0.04
  ship.position.y = Math.sin(time * 1.2) * 0.15

  ship.userData.sails?.forEach((sail, i) => {
    sail.rotation.y = sail.userData.baseRot + Math.sin(time * 1.5 + i) * 0.08
  })

  ship.userData.flag.rotation.y = Math.sin(time * 2) * 0.3

  const pulse = 0.6 + Math.sin(time * 4) * 0.4
  ship.userData.bassBins?.forEach((bin, i) => {
    const p = 0.6 + Math.sin(time * 5 + i * 2) * 0.4
    if (bin.userData.pulseLight) bin.userData.pulseLight.intensity = 2 + p * 4
    if (bin.userData.pulseMat) bin.userData.pulseMat.emissiveIntensity = 1 + p * 2
  })

  if (ship.userData.engineGlow) {
    ship.userData.engineGlow.scale.setScalar(0.8 + pulse * 0.5)
    ship.userData.engineLight.intensity = 6 + pulse * 6
  }

  if (ship.userData.halo) {
    ship.userData.halo.rotation.z = time * 0.5
    ship.userData.halo.material.opacity = 0.15 + pulse * 0.15
  }

  if (ship.userData.trail) {
    const pos = ship.userData.trail.geometry.attributes.position.array
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3] += 0.02 + Math.random() * 0.02
      if (pos[i * 3] > -2) {
        pos[i * 3] = -3.8 - Math.random() * 4
      }
    }
    ship.userData.trail.geometry.attributes.position.needsUpdate = true
  }
}
