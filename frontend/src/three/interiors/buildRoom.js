import * as THREE from 'three'

export function woodMat(color = 0x4a3020) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.08, side: THREE.DoubleSide })
}

export function wallMat(color, emissive = 0x000000, ei = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    emissive,
    emissiveIntensity: ei,
    side: THREE.DoubleSide,
  })
}

export function neonMat(color, intensity = 1.5) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.25,
    side: THREE.DoubleSide,
  })
}

export function addMesh(parent, geo, mat, pos, rot = [0, 0, 0], scale = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(...pos)
  m.rotation.set(...rot)
  m.scale.set(...scale)
  parent.add(m)
  return m
}

/** Walkable room shell with door gap at +Z (front). Uses inward-facing planes. */
export function buildRoomShell(width, depth, height, opts = {}) {
  const {
    wallColor = 0x1a1410,
    floorColor = 0x2a1a0a,
    accent = 0xc9a227,
    doorWidth = 1.6,
  } = opts

  const room = new THREE.Group()
  const w = width
  const d = depth
  const h = height

  const floor = addMesh(
    room,
    new THREE.PlaneGeometry(w, d),
    wallMat(floorColor, accent, 0.08),
    [0, 0, 0],
    [-Math.PI / 2, 0, 0]
  )
  floor.receiveShadow = true

  addMesh(room, new THREE.PlaneGeometry(w, d), wallMat(0x0a0a12, accent, 0.05), [0, h, 0], [Math.PI / 2, 0, 0])

  addMesh(room, new THREE.PlaneGeometry(w, h), wallMat(wallColor, accent, 0.12), [0, h / 2, -d / 2])
  addMesh(room, new THREE.PlaneGeometry(d, h), wallMat(wallColor, accent, 0.12), [-w / 2, h / 2, 0], [0, Math.PI / 2, 0])
  addMesh(room, new THREE.PlaneGeometry(d, h), wallMat(wallColor, accent, 0.12), [w / 2, h / 2, 0], [0, -Math.PI / 2, 0])

  const sideW = (w - doorWidth) / 2
  addMesh(
    room,
    new THREE.PlaneGeometry(sideW, h),
    wallMat(wallColor, accent, 0.12),
    [-(doorWidth / 2 + sideW / 2), h / 2, d / 2],
    [0, Math.PI, 0]
  )
  addMesh(
    room,
    new THREE.PlaneGeometry(sideW, h),
    wallMat(wallColor, accent, 0.12),
    [doorWidth / 2 + sideW / 2, h / 2, d / 2],
    [0, Math.PI, 0]
  )
  addMesh(
    room,
    new THREE.PlaneGeometry(doorWidth, h * 0.25),
    wallMat(wallColor, accent, 0.12),
    [0, h * 0.875, d / 2],
    [0, Math.PI, 0]
  )

  const doorFrame = addMesh(
    room,
    new THREE.BoxGeometry(doorWidth + 0.2, h * 0.05, 0.12),
    neonMat(accent, 1.2),
    [0, h * 0.78, d / 2 + 0.05]
  )
  doorFrame.userData.isExitDoor = true

  const mainLight = new THREE.PointLight(accent, 30, 30)
  mainLight.position.set(0, h - 0.4, 0)
  room.add(mainLight)

  const fill = new THREE.PointLight(0xffeedd, 12, 20)
  fill.position.set(0, 2, 0)
  room.add(fill)

  const rim = new THREE.PointLight(accent, 8, 16)
  rim.position.set(0, 1.5, -d * 0.35)
  room.add(rim)

  return room
}

export function createTerminal(parent, position, label, accent) {
  const group = new THREE.Group()
  group.position.set(...position)

  addMesh(group, new THREE.BoxGeometry(0.8, 1.0, 0.45), woodMat(0x3a2818), [0, 0.5, 0])
  const screen = addMesh(
    group,
    new THREE.PlaneGeometry(0.55, 0.4),
    neonMat(accent, 2.5),
    [0, 0.85, 0.24]
  )
  screen.userData.isTerminal = true
  screen.userData.terminalLabel = label

  const glow = new THREE.PointLight(accent, 6, 5)
  glow.position.set(0, 0.9, 0.3)
  group.add(glow)

  parent.add(group)
  return screen
}

export function createRoomMeta(width, depth) {
  const margin = 0.45
  return {
    spawn: new THREE.Vector3(0, 1.65, depth / 2 - 1.8),
    exitZ: depth / 2 - 0.6,
    bounds: {
      minX: -width / 2 + margin,
      maxX: width / 2 - margin,
      minZ: -depth / 2 + margin,
      maxZ: depth / 2 - margin,
    },
    spawnYaw: Math.PI,
  }
}
