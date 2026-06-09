import * as THREE from 'three'
import {
  buildRoomShell,
  createTerminal,
  createRoomMeta,
  addMesh,
  woodMat,
  neonMat,
} from './buildRoom.js'

const ROOM_SIZE = { w: 9, d: 11, h: 3.4 }

function buildCaptainsCabin(accent) {
  const { w, d, h } = ROOM_SIZE
  const room = buildRoomShell(w, d, h, { accent, wallColor: 0x1a1410, floorColor: 0x2a1a0a })

  const desk = addMesh(room, new THREE.BoxGeometry(2.2, 0.85, 1.0), woodMat(0x3a2818), [0, 0.425, -d / 2 + 1.8])
  addMesh(room, new THREE.BoxGeometry(2.0, 0.04, 0.8), woodMat(0x5a4030), [0, 0.87, -d / 2 + 1.8])

  for (let i = 0; i < 4; i++) {
    addMesh(
      room,
      new THREE.PlaneGeometry(0.9, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.95 }),
      [-2.5 + i * 1.6, 1.6, -d / 2 + 0.08],
      [0, 0, 0]
    )
  }

  addMesh(room, new THREE.CylinderGeometry(0.35, 0.4, 0.6, 16), woodMat(0x4a3020), [2.5, 0.3, -d / 2 + 2.2])
  addMesh(room, new THREE.SphereGeometry(0.28, 16, 12), neonMat(accent, 0.6), [2.5, 0.75, -d / 2 + 2.2])

  addMesh(room, new THREE.BoxGeometry(1.8, 2.2, 0.35), woodMat(0x3a2818), [-w / 2 + 0.55, 1.1, -1])
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      addMesh(
        room,
        new THREE.BoxGeometry(0.12, 0.28, 0.08),
        new THREE.MeshStandardMaterial({ color: [0x8b0000, 0x1a3a5c, 0x2a4a2a][row % 3] }),
        [-w / 2 + 0.35, 0.5 + row * 0.35, -1.5 + col * 0.35]
      )
    }
  }

  addMesh(room, new THREE.BoxGeometry(0.7, 1.0, 0.7), woodMat(0x4a3020), [1.8, 0.5, 1.5])
  addMesh(room, new THREE.BoxGeometry(0.65, 0.08, 0.65), woodMat(0x5a4030), [1.8, 1.02, 1.5])

  const wheel = addMesh(room, new THREE.TorusGeometry(0.5, 0.06, 8, 24), neonMat(accent, 0.5), [0, 1.8, -d / 2 + 0.2], [0, 0, 0])
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    addMesh(
      room,
      new THREE.BoxGeometry(0.04, 0.5, 0.04),
      woodMat(0x6a5030),
      [Math.sin(angle) * 0.35, 1.8, -d / 2 + 0.2 + Math.cos(angle) * 0.35],
      [0, -angle, 0]
    )
  }
  wheel.rotation.x = Math.PI / 2

  const lantern = new THREE.PointLight(accent, 8, 10)
  lantern.position.set(0, h - 0.4, 0)
  room.add(lantern)

  createTerminal(room, [0, 0, -d / 2 + 3.2], "Captain's Log", accent)

  return { room, meta: createRoomMeta(w, d) }
}

function buildArtifacts(accent) {
  const { w, d, h } = ROOM_SIZE
  const room = buildRoomShell(w, d, h, { accent, wallColor: 0x120a18, floorColor: 0x1a0a20 })

  const posterColors = [0xff00ff, 0x00ffcc, 0xc9a227, 0x9d4edd, 0xff3366, 0x33ff99]
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const colr = posterColors[(row * 4 + col) % posterColors.length]
      addMesh(
        room,
        new THREE.PlaneGeometry(1.4, 1.9),
        neonMat(colr, 0.7),
        [-w / 2 + 0.12, 1.5 + row * 1.0, -d / 2 + 1.5 + col * 2.2],
        [0, Math.PI / 2, 0]
      )
    }
  }

  for (let i = 0; i < 3; i++) {
    const caseG = addMesh(room, new THREE.BoxGeometry(1.6, 1.8, 0.6), woodMat(0x2a1a0a), [-2 + i * 2, 0.9, -d / 2 + 1.5])
    addMesh(caseG, new THREE.BoxGeometry(1.4, 1.6, 0.02), new THREE.MeshStandardMaterial({
      color: 0x111122,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
    }), [0, 0, 0.31])
    addMesh(caseG, new THREE.PlaneGeometry(1.0, 1.2), neonMat(posterColors[i], 0.5), [0, 0.1, 0.15])
  }

  addMesh(room, new THREE.BoxGeometry(3, 0.5, 1.2), woodMat(0x3a2818), [0, 0.25, d / 2 - 2])
  for (let i = 0; i < 5; i++) {
    addMesh(
      room,
      new THREE.BoxGeometry(0.5, 0.35, 0.02),
      neonMat(posterColors[i + 1], 0.4),
      [-2 + i * 1, 0.55, d / 2 - 2.6]
    )
  }

  const uv = new THREE.PointLight(0xff00ff, 6, 8)
  uv.position.set(0, h - 0.3, -2)
  room.add(uv)

  createTerminal(room, [0, 0, -d / 2 + 3.5], 'Vault Terminal', accent)

  return { room, meta: createRoomMeta(w, d) }
}

function buildMemories(accent) {
  const { w, d, h } = ROOM_SIZE
  const room = buildRoomShell(w, d, h, { accent, wallColor: 0x0a1418, floorColor: 0x0a1a20 })

  for (let i = 0; i < 6; i++) {
    const frame = addMesh(room, new THREE.BoxGeometry(1.0, 1.3, 0.08), woodMat(0x4a3020), [
      -w / 2 + 0.2,
      1.4 + (i % 3) * 0.05,
      -d / 2 + 1.5 + Math.floor(i / 3) * 3.5,
    ], [0, Math.PI / 2, 0])
    addMesh(
      frame,
      new THREE.PlaneGeometry(0.8, 1.0),
      new THREE.MeshStandardMaterial({
        color: [0x224466, 0x442266, 0x226644, 0x664422, 0x334455, 0x553344][i],
        emissive: accent,
        emissiveIntensity: 0.15,
      }),
      [0, 0, 0.05]
    )
  }

  for (let i = 0; i < 4; i++) {
    addMesh(room, new THREE.BoxGeometry(1.8, 0.45, 0.8), woodMat(0x3a2818), [-2.5 + i * 1.7, 0.225, 1])
  }

  for (let i = 0; i < 5; i++) {
    const orb = addMesh(
      room,
      new THREE.SphereGeometry(0.12, 12, 12),
      neonMat(accent, 1.2),
      [-2 + i * 1, 0.7, -1]
    )
    orb.userData.pulse = i * 0.7
  }

  const mist = new THREE.PointLight(accent, 5, 12)
  mist.position.set(0, 1.5, 0)
  room.add(mist)

  createTerminal(room, [0, 0, -d / 2 + 3.2], 'Tale Terminal', accent)

  return { room, meta: createRoomMeta(w, d) }
}

function buildMixes(accent) {
  const { w, d, h } = ROOM_SIZE
  const room = buildRoomShell(w, d, h, { accent, wallColor: 0x140a18, floorColor: 0x1a0a1a })

  const pink = neonMat(0xff00ff, 1.2)
  const cyan = neonMat(0x00ffcc, 1.2)

  addMesh(room, new THREE.BoxGeometry(2.5, 0.9, 1.2), woodMat(0x2a1a2a), [0, 0.45, -d / 2 + 2.5])
  addMesh(room, new THREE.BoxGeometry(0.8, 0.05, 0.5), pink, [-0.5, 0.93, -d / 2 + 2.5])
  addMesh(room, new THREE.BoxGeometry(0.8, 0.05, 0.5), cyan, [0.5, 0.93, -d / 2 + 2.5])

  for (let i = 0; i < 2; i++) {
    addMesh(room, new THREE.CylinderGeometry(0.35, 0.4, 1.6, 12), pink, [-2.5 + i * 5, 0.8, 0])
    addMesh(room, new THREE.CylinderGeometry(0.5, 0.55, 0.15, 16), woodMat(0x1a1a1a), [-2.5 + i * 5, 0.1, 0])
  }

  for (let i = 0; i < 6; i++) {
    addMesh(
      room,
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      new THREE.MeshStandardMaterial({ color: [0x111111, 0x222222, 0x1a0a1a][i % 3] }),
      [-2 + (i % 3) * 2, 0.175, d / 2 - 2 - Math.floor(i / 3) * 1.2]
    )
  }

  addMesh(room, new THREE.TorusGeometry(0.6, 0.04, 8, 32), cyan, [0, 2.2, -d / 2 + 0.3], [Math.PI / 2, 0, 0])

  const strobe = new THREE.PointLight(0xff00ff, 10, 14)
  strobe.position.set(0, h - 0.2, -2)
  room.add(strobe)
  room.userData.strobe = strobe

  createTerminal(room, [0, 0, -d / 2 + 4], 'Deck Rig', accent)

  return { room, meta: createRoomMeta(w, d) }
}

function buildTheList(accent) {
  const { w, d, h } = ROOM_SIZE
  const room = buildRoomShell(w, d, h, { accent, wallColor: 0x101418, floorColor: 0x1a1a14 })

  addMesh(room, new THREE.BoxGeometry(4.5, 0.08, 1.8), woodMat(0x4a3020), [0, 0.75, -d / 2 + 3])
  addMesh(
    room,
    new THREE.PlaneGeometry(3.8, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.95 }),
    [0, 0.82, -d / 2 + 3],
    [-Math.PI / 2, 0, 0]
  )

  for (let i = 0; i < 8; i++) {
    addMesh(
      room,
      new THREE.BoxGeometry(0.02, 0.02, 0.15),
      neonMat(accent, 0.8),
      [-1.5 + i * 0.4, 0.86, -d / 2 + 3.1]
    )
  }

  addMesh(room, new THREE.ConeGeometry(0.03, 0.25, 6), neonMat(0xc9a227, 0.6), [1.5, 0.88, -d / 2 + 2.8], [0, 0, -0.6])
  addMesh(room, new THREE.CylinderGeometry(0.08, 0.08, 0.06), woodMat(0x3a2818), [1.3, 0.81, -d / 2 + 2.9])

  addMesh(room, new THREE.BoxGeometry(0.6, 1.8, 0.6), woodMat(0x3a2818), [-w / 2 + 0.8, 0.9, 0])
  addMesh(room, new THREE.BoxGeometry(0.6, 1.8, 0.6), woodMat(0x3a2818), [w / 2 - 0.8, 0.9, 0])

  const seal = addMesh(room, new THREE.CylinderGeometry(0.4, 0.4, 0.06, 24), neonMat(accent, 0.8), [0, 1.5, -d / 2 + 0.15])
  seal.rotation.x = Math.PI / 2

  const candle = new THREE.PointLight(accent, 6, 8)
  candle.position.set(0, 1.2, -d / 2 + 3)
  room.add(candle)

  createTerminal(room, [0, 0, -d / 2 + 4.5], 'Guest Ledger', accent)

  return { room, meta: createRoomMeta(w, d) }
}

const BUILDERS = {
  'captains-cabin': buildCaptainsCabin,
  aaaarrifacts: buildArtifacts,
  memories: buildMemories,
  mixes: buildMixes,
  'the-list': buildTheList,
}

export function buildInteriorScene(location) {
  const builder = BUILDERS[location.id]
  if (!builder) return null

  const { room, meta } = builder(location.color)
  room.name = `interior-${location.id}`
  room.userData.location = location
  room.userData.meta = meta

  collectInteractables(room)

  return { group: room, meta, location }
}

function collectInteractables(group) {
  const interactables = []
  group.traverse((obj) => {
    if (obj.userData.isTerminal || obj.userData.isExitDoor) {
      interactables.push(obj)
    }
  })
  group.userData.interactables = interactables
}

export function animateInterior(group, time) {
  group?.traverse((obj) => {
    if (obj.userData.pulse !== undefined) {
      const s = 1 + Math.sin(time * 3 + obj.userData.pulse) * 0.2
      obj.scale.setScalar(s)
    }
  })
  const strobe = group?.userData?.strobe
  if (strobe) {
    strobe.intensity = 6 + Math.sin(time * 8) * 4
  }
}

export function findInteractable(group, camera, maxDist = 3) {
  const interactables = group?.userData?.interactables ?? []
  const origin = camera.position.clone()
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)

  let best = null
  let bestDot = 0.55

  for (const obj of interactables) {
    const worldPos = new THREE.Vector3()
    obj.getWorldPosition(worldPos)
    const toObj = worldPos.clone().sub(origin)
    const dist = toObj.length()
    if (dist > maxDist) continue

    toObj.normalize()
    const dot = forward.dot(toObj)
    if (dot > bestDot) {
      bestDot = dot
      best = obj
    }
  }

  return best
}

export function isNearExit(group, camera, meta) {
  if (!meta) return false
  return camera.position.z > meta.exitZ - 0.3
}
