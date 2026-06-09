import * as THREE from 'three'

export function woodMat(color = 0x4a3020) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.08 })
}

export function wallMat(color, emissive = 0x000000, ei = 0.2) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    emissive,
    emissiveIntensity: ei,
  })
}

export function neonMat(color, intensity = 1.5) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.25,
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

/** Walkable room shell with door gap at +Z (front). */
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
  const wt = 0.15

  addMesh(room, new THREE.BoxGeometry(w, wt, d), woodMat(floorColor), [0, -wt / 2, 0])
  addMesh(room, new THREE.BoxGeometry(w, wt, wt), wallMat(0x0a0a12), [0, h, 0])

  addMesh(room, new THREE.BoxGeometry(w, h, wt), wallMat(wallColor), [0, h / 2, -d / 2])
  addMesh(room, new THREE.BoxGeometry(wt, h, d), wallMat(wallColor), [-w / 2, h / 2, 0])
  addMesh(room, new THREE.BoxGeometry(wt, h, d), wallMat(wallColor), [w / 2, h / 2, 0])

  const sideW = (w - doorWidth) / 2
  addMesh(room, new THREE.BoxGeometry(sideW, h, wt), wallMat(wallColor), [-(doorWidth / 2 + sideW / 2), h / 2, d / 2])
  addMesh(room, new THREE.BoxGeometry(sideW, h, wt), wallMat(wallColor), [doorWidth / 2 + sideW / 2, h / 2, d / 2])
  addMesh(room, new THREE.BoxGeometry(doorWidth, h * 0.25, wt), wallMat(wallColor), [0, h * 0.875, d / 2])

  const doorFrame = addMesh(
    room,
    new THREE.BoxGeometry(doorWidth + 0.2, h * 0.05, 0.12),
    neonMat(accent, 0.8),
    [0, h * 0.78, d / 2 + 0.05]
  )
  doorFrame.userData.isExitDoor = true

  const mainLight = new THREE.PointLight(accent, 12, 18)
  mainLight.position.set(0, h - 0.3, -d * 0.2)
  room.add(mainLight)

  const fill = new THREE.PointLight(0xffeedd, 4, 12)
  fill.position.set(0, 2, d * 0.3)
  room.add(fill)

  return room
}

export function createTerminal(parent, position, label, accent) {
  const group = new THREE.Group()
  group.position.set(...position)

  addMesh(group, new THREE.BoxGeometry(0.8, 1.0, 0.45), woodMat(0x3a2818), [0, 0.5, 0])
  const screen = addMesh(
    group,
    new THREE.PlaneGeometry(0.55, 0.4),
    neonMat(accent, 2),
    [0, 0.85, 0.24]
  )
  screen.userData.isTerminal = true
  screen.userData.terminalLabel = label

  const glow = new THREE.PointLight(accent, 2, 3)
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
