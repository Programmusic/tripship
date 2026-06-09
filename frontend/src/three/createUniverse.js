import * as THREE from 'three'

export function createStarLayer(count, spread, size, color, opacity) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const c = new THREE.Color(color)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread - spread * 0.3

    const brightness = 0.5 + Math.random() * 0.5
    colors[i * 3] = c.r * brightness
    colors[i * 3 + 1] = c.g * brightness
    colors[i * 3 + 2] = c.b * brightness
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })

  const points = new THREE.Points(geo, mat)
  points.userData.spread = spread
  points.userData.isStarLayer = true
  return points
}

function createNebula(color1, color2, position, scale) {
  const group = new THREE.Group()

  for (let i = 0; i < 6; i++) {
    const geo = new THREE.SphereGeometry(scale * (0.5 + Math.random() * 0.5), 16, 16)
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? color1 : color2,
      transparent: true,
      opacity: 0.04 + Math.random() * 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const cloud = new THREE.Mesh(geo, mat)
    cloud.position.set(
      (Math.random() - 0.5) * scale,
      (Math.random() - 0.5) * scale * 0.5,
      (Math.random() - 0.5) * scale
    )
    group.add(cloud)
  }

  group.position.copy(position)
  group.userData.isNebula = true
  group.userData.drift = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.001,
    0.003 + Math.random() * 0.002
  )
  return group
}

function createDistantGalaxy(position) {
  const group = new THREE.Group()
  const armCount = 120
  const positions = new Float32Array(armCount * 3)
  const colors = new Float32Array(armCount * 3)

  for (let i = 0; i < armCount; i++) {
    const angle = (i / armCount) * Math.PI * 4
    const radius = (i / armCount) * 3
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3
    positions[i * 3 + 2] = Math.sin(angle) * radius

    const t = i / armCount
    colors[i * 3] = 0.8 * (1 - t) + 0.2 * t
    colors[i * 3 + 1] = 0.3 * (1 - t) + 0.9 * t
    colors[i * 3 + 2] = 1.0
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  )
  group.add(points)
  group.position.copy(position)
  group.rotation.x = Math.random() * 0.5
  group.userData.isGalaxy = true
  return group
}

function createRingedPlanet(position) {
  const group = new THREE.Group()

  const planetGeo = new THREE.SphereGeometry(4, 32, 32)
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x1a2844,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x0a1530,
    emissiveIntensity: 0.5,
  })
  const planet = new THREE.Mesh(planetGeo, planetMat)
  group.add(planet)

  const atmosGeo = new THREE.SphereGeometry(4.3, 32, 32)
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
  group.add(new THREE.Mesh(atmosGeo, atmosMat))

  const ringGeo = new THREE.RingGeometry(5.5, 9, 64)
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xc9a227,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2.2
  group.add(ring)

  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(5.2, 8.5, 64),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  )
  ring2.rotation.x = Math.PI / 2.2
  ring2.rotation.z = 0.1
  group.add(ring2)

  group.position.copy(position)
  group.userData.isPlanet = true
  return group
}

function createCosmicRing(position, radius, color) {
  const geo = new THREE.TorusGeometry(radius, 0.02, 8, 128)
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
  })
  const ring = new THREE.Mesh(geo, mat)
  ring.position.copy(position)
  ring.rotation.x = Math.PI / 2
  ring.userData.isCosmicRing = true
  return ring
}

function createWarpStreaks(count) {
  const positions = new Float32Array(count * 6)
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 40
    const y = (Math.random() - 0.5) * 25
    const z = -20 - Math.random() * 80
    positions[i * 6] = x
    positions[i * 6 + 1] = y
    positions[i * 6 + 2] = z
    positions[i * 6 + 3] = x
    positions[i * 6 + 4] = y
    positions[i * 6 + 5] = z - 2 - Math.random() * 6
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    })
  )
  lines.userData.isWarpStreaks = true
  return lines
}

export function createUniverse(isMobile = false) {
  const universe = new THREE.Group()
  universe.name = 'universe'

  const starCount = isMobile ? 2000 : 6000
  const farStars = createStarLayer(starCount, 120, isMobile ? 0.08 : 0.12, 0xffffff, 0.9)
  const midStars = createStarLayer(Math.floor(starCount * 0.6), 80, 0.15, 0xaaddff, 0.8)
  const nearStars = createStarLayer(Math.floor(starCount * 0.3), 50, 0.2, 0xffccff, 0.7)

  universe.add(farStars, midStars, nearStars)
  universe.userData.starLayers = [farStars, midStars, nearStars]

  const nebulae = [
    createNebula(0xff00ff, 0x6600aa, new THREE.Vector3(-25, 8, -60), 18),
    createNebula(0x00ffcc, 0x0066aa, new THREE.Vector3(30, -5, -80), 22),
    createNebula(0xc9a227, 0xff4400, new THREE.Vector3(5, 12, -100), 25),
    createNebula(0x9d4edd, 0xff00ff, new THREE.Vector3(-15, -10, -45), 14),
  ]
  nebulae.forEach((n) => universe.add(n))
  universe.userData.nebulae = nebulae

  const galaxies = [
    createDistantGalaxy(new THREE.Vector3(-35, 15, -120)),
    createDistantGalaxy(new THREE.Vector3(40, -8, -90)),
  ]
  galaxies.forEach((g) => {
    g.scale.setScalar(2)
    universe.add(g)
  })
  universe.userData.galaxies = galaxies

  const warpStreaks = createWarpStreaks(isMobile ? 60 : 150)
  universe.add(warpStreaks)
  universe.userData.warpStreaks = warpStreaks

  const planet = createRingedPlanet(new THREE.Vector3(18, -6, -70))
  planet.scale.setScalar(0.8)
  universe.add(planet)
  universe.userData.planet = planet

  if (!isMobile) {
    universe.add(createCosmicRing(new THREE.Vector3(-12, 4, -55), 8, 0xff00ff))
    universe.add(createCosmicRing(new THREE.Vector3(8, -3, -40), 5, 0x00ffcc))
  }

  return universe
}

export function animateUniverse(universe, time, speed = 1) {
  universe.userData.starLayers?.forEach((layer, i) => {
    const pos = layer.geometry.attributes.position.array
    const rate = (0.03 + i * 0.02) * speed
    for (let j = 0; j < pos.length / 3; j++) {
      pos[j * 3 + 2] += rate
      if (pos[j * 3 + 2] > 20) {
        pos[j * 3 + 2] = -layer.userData.spread * 0.5
      }
    }
    layer.geometry.attributes.position.needsUpdate = true
    layer.rotation.z = time * 0.01 * (i + 1)
  })

  universe.userData.nebulae?.forEach((neb) => {
    neb.position.add(neb.userData.drift)
    neb.rotation.y += 0.0003
    if (neb.position.z > 30) neb.position.z = -100
  })

  universe.userData.galaxies?.forEach((gal, i) => {
    gal.rotation.z += 0.0002 * (i + 1)
  })

  if (universe.userData.planet) {
    universe.userData.planet.rotation.y += 0.0004
  }

  universe.children.forEach((child) => {
    if (child.userData?.isCosmicRing) {
      child.rotation.z += 0.001
    }
  })

  if (universe.userData.warpStreaks) {
    const pos = universe.userData.warpStreaks.geometry.attributes.position.array
    for (let i = 0; i < pos.length / 6; i++) {
      pos[i * 6 + 2] += 0.8 * speed
      pos[i * 6 + 5] += 0.8 * speed
      if (pos[i * 6 + 2] > 20) {
        const x = (Math.random() - 0.5) * 40
        const y = (Math.random() - 0.5) * 25
        const z = -60 - Math.random() * 60
        pos[i * 6] = x
        pos[i * 6 + 1] = y
        pos[i * 6 + 2] = z
        pos[i * 6 + 3] = x
        pos[i * 6 + 4] = y
        pos[i * 6 + 5] = z - 2 - Math.random() * 6
      }
    }
    universe.userData.warpStreaks.geometry.attributes.position.needsUpdate = true
  }
}
