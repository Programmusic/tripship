import * as THREE from 'three'

function makeRoomMaterial(color, emissive = 0x000000, emissiveIntensity = 0.3) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    emissive,
    emissiveIntensity,
    side: THREE.BackSide,
  })
}

function addProp(group, geometry, material, position, rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.scale.set(...scale)
  group.add(mesh)
  return mesh
}

function createRoomBox(width, height, depth, wallColor, accentColor) {
  const room = new THREE.Group()
  const wallMat = makeRoomMaterial(wallColor)
  const floorMat = makeRoomMaterial(0x1a1410, accentColor, 0.15)

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0
  room.add(floor)

  const back = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat)
  back.position.set(0, height / 2, -depth / 2)
  room.add(back)

  const left = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat)
  left.position.set(-width / 2, height / 2, 0)
  left.rotation.y = Math.PI / 2
  room.add(left)

  const right = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat)
  right.position.set(width / 2, height / 2, 0)
  right.rotation.y = -Math.PI / 2
  room.add(right)

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), makeRoomMaterial(0x0a0a12))
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = height
  room.add(ceiling)

  const light = new THREE.PointLight(accentColor, 3, 6)
  light.position.set(0, height * 0.7, -depth * 0.3)
  room.add(light)
  room.userData.interiorLight = light

  return room
}

function decorateCaptainsCabin(room) {
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.8 })
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.8, roughness: 0.3 })

  addProp(room, new THREE.BoxGeometry(0.5, 0.08, 0.3), wood, [0, 0.35, -0.5])
  addProp(room, new THREE.BoxGeometry(0.15, 0.2, 0.02), gold, [0, 0.5, -0.75])
  addProp(room, new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), gold, [-0.2, 0.45, -0.55], [0, 0, Math.PI / 2])

  const scroll = new THREE.Mesh(
    new THREE.PlaneGeometry(0.25, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xe8dcc8 })
  )
  scroll.position.set(0.15, 0.55, -0.74)
  room.add(scroll)
}

function decorateArtifacts(room) {
  const posterColors = [0xff00ff, 0x00ffcc, 0xc9a227, 0x9d4edd]
  posterColors.forEach((col, i) => {
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.3),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 })
    )
    poster.position.set(-0.35 + i * 0.22, 0.65, -0.72)
    room.add(poster)
  })
  addProp(room, new THREE.BoxGeometry(0.6, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x2a1a0a }), [0, 0.25, -0.55])
}

function decorateMemories(room) {
  for (let i = 0; i < 3; i++) {
    addProp(
      room,
      new THREE.BoxGeometry(0.35, 0.5, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a }),
      [-0.3 + i * 0.3, 0.55, -0.7]
    )
  }
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ffcc })
  )
  glow.position.set(0, 0.4, -0.4)
  room.add(glow)
}

function decorateMixes(room) {
  const pink = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 1.2 })
  const cyan = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc, emissiveIntensity: 1.2 })
  addProp(room, new THREE.BoxGeometry(0.25, 0.45, 0.2), pink, [-0.2, 0.3, -0.5])
  addProp(room, new THREE.BoxGeometry(0.25, 0.45, 0.2), cyan, [0.2, 0.3, -0.5])
  addProp(room, new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), pink, [0, 0.55, -0.6], [Math.PI / 2, 0, 0])
}

function decorateTheList(room) {
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.06, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x4a3020 })
  )
  table.position.set(0, 0.35, -0.45)
  room.add(table)

  const scroll = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.25),
    new THREE.MeshBasicMaterial({ color: 0xe8dcc8 })
  )
  scroll.position.set(0, 0.42, -0.45)
  scroll.rotation.x = -Math.PI / 2
  room.add(scroll)

  const quill = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, 0.12, 6),
    new THREE.MeshStandardMaterial({ color: 0xc9a227 })
  )
  quill.position.set(0.15, 0.44, -0.4)
  quill.rotation.z = -0.5
  room.add(quill)
}

const ROOM_THEMES = {
  'captains-cabin': { wall: 0x1a1410, accent: 0xc9a227, decorate: decorateCaptainsCabin },
  aaaarrifacts: { wall: 0x120a18, accent: 0xff00ff, decorate: decorateArtifacts },
  memories: { wall: 0x0a1418, accent: 0x00ffcc, decorate: decorateMemories },
  mixes: { wall: 0x140a18, accent: 0xff00ff, decorate: decorateMixes },
  'the-list': { wall: 0x101418, accent: 0x00ffcc, decorate: decorateTheList },
}

function createDoorFrame(color) {
  const frame = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({
    color: 0xc9a227,
    metalness: 0.7,
    roughness: 0.35,
    emissive: color,
    emissiveIntensity: 0.2,
  })

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.08), mat)
  top.position.y = 0.55
  frame.add(top)

  const left = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.08), mat)
  left.position.set(-0.245, 0.275, 0)
  frame.add(left)

  const right = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.08), mat)
  right.position.set(0.245, 0.275, 0)
  frame.add(right)

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.5),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  )
  glow.position.z = 0.05
  glow.position.y = 0.28
  frame.add(glow)
  frame.userData.doorGlow = glow

  return frame
}

export function createShipInteriors(ship, locations) {
  const rooms = new Map()

  locations.forEach((loc) => {
    const theme = ROOM_THEMES[loc.id]
    if (!theme) return

    const entry = new THREE.Group()
    entry.position.copy(loc.position)
    entry.rotation.y = loc.interiorRotation ?? 0

    const door = createDoorFrame(loc.color)
    entry.add(door)

    const room = createRoomBox(0.9, 0.85, 0.75, theme.wall, theme.accent)
    room.position.set(0, 0, -0.35)
    room.scale.setScalar(0.01)
    room.visible = false
    theme.decorate(room)
    entry.add(room)

    entry.userData.location = loc
    entry.userData.door = door
    entry.userData.room = room
    entry.userData.doorGlow = door.userData.doorGlow

    ship.add(entry)
    rooms.set(loc.id, entry)
  })

  return { rooms }
}

export function showInteriorPeek(roomEntry, progress) {
  const room = roomEntry.userData.room
  if (!room) return

  room.visible = progress > 0.05
  const scale = Math.min(1, progress) * 1.2
  room.scale.setScalar(Math.max(0.01, scale))

  const glow = roomEntry.userData.doorGlow
  if (glow) {
    glow.material.opacity = 0.15 + progress * 0.45
  }

  const light = room.userData.interiorLight
  if (light) {
    light.intensity = 2 + progress * 4
  }
}

export function hideAllInteriors(rooms) {
  rooms?.forEach((entry) => {
    if (entry.userData.room) {
      entry.userData.room.visible = false
      entry.userData.room.scale.setScalar(0.01)
    }
    if (entry.userData.doorGlow) {
      entry.userData.doorGlow.material.opacity = 0.15
    }
  })
}
