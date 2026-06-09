import * as THREE from 'three'
import { addMesh, woodMat, neonMat } from './buildRoom.js'
import {
  createMutantPirateDJ,
  createDJRig,
  createBassStack,
  createLaserTripods,
  createHoloGlobe,
  createGhostCaptain,
  createQuillBot,
} from './characters.js'

/** Deck Sessions — mutant AI pirate DJ on the rig */
export function populateDeckSessions(room, w, d, h) {
  const rigZ = -d / 2 + 2.8
  const rig = createDJRig(rigZ)
  room.add(rig)

  const dj = createMutantPirateDJ()
  dj.position.set(0, 0, rigZ + 0.85)
  dj.rotation.y = Math.PI
  room.add(dj)
  room.userData.dj = dj
  room.userData.rig = rig

  room.add(createBassStack(-w / 2 + 1.2, 0, 0xff00ff))
  room.add(createBassStack(w / 2 - 1.2, 0, 0x00ffcc))

  const stacks = []
  for (let i = 0; i < 3; i++) {
    stacks.push(createBassStack(-3 + i * 3, d / 2 - 2.5, i % 2 ? 0xff00ff : 0x00ffcc))
  }
  stacks.forEach((s) => room.add(s))

  room.add(createLaserTripods(room, d))
  room.add(createHoloGlobe([0, 0, rigZ - 1.5]))

  for (let i = 0; i < 8; i++) {
    addMesh(
      room,
      new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x220022, emissiveIntensity: 0.3 }),
      [-3.5 + i * 1.0, 1.4 + (i % 3) * 0.15, -d / 2 + 0.15]
    )
  }

  addMesh(
    room,
    new THREE.PlaneGeometry(4, 0.6),
    neonMat(0xff00ff, 1.2),
    [0, 0.15, -d / 2 + 0.08]
  )

  const strobe = new THREE.PointLight(0xff00ff, 18, 20)
  strobe.position.set(0, h - 0.2, rigZ)
  room.add(strobe)
  room.userData.strobe = strobe

  const strobeCyan = new THREE.PointLight(0x00ffcc, 12, 18)
  strobeCyan.position.set(0, 2, rigZ - 2)
  room.add(strobeCyan)
  room.userData.strobeCyan = strobeCyan

  const vinylCrate = addMesh(room, new THREE.BoxGeometry(1.2, 0.5, 0.8), woodMat(0x2a1a0a), [w / 2 - 1.5, 0.25, 2])
  for (let i = 0; i < 6; i++) {
    addMesh(vinylCrate, new THREE.CylinderGeometry(0.14, 0.14, 0.02, 12), neonMat(i % 2 ? 0xff00ff : 0x00ffcc, 0.5), [-0.3 + (i % 3) * 0.3, 0.28, -0.2 + Math.floor(i / 3) * 0.35])
  }
}

export function populateCaptainsCabin(room, w, d) {
  room.add(createGhostCaptain())

  const mapTable = addMesh(room, new THREE.CylinderGeometry(0.9, 1.0, 0.7, 16), woodMat(0x4a3020), [2, 0.35, 1.5])
  addMesh(mapTable, new THREE.CylinderGeometry(0.75, 0.75, 0.02, 16), new THREE.MeshStandardMaterial({
    color: 0xe8dcc8,
    emissive: 0xc9a227,
    emissiveIntensity: 0.1,
  }), [0, 0.36, 0])

  for (let i = 0; i < 3; i++) {
    const bottle = addMesh(room, new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8), neonMat([0x00ffcc, 0xff00ff, 0xc9a227][i], 0.8), [
      -2.5 + i * 0.4,
      0.9,
      -d / 2 + 1.7,
    ])
    bottle.userData.pulse = i * 0.5
  }
}

export function populateArtifacts(room, w, d) {
  const chest = addMesh(room, new THREE.BoxGeometry(1.2, 0.7, 0.8), woodMat(0x3a2818), [0, 0.35, 2])
  addMesh(chest, new THREE.BoxGeometry(1.25, 0.1, 0.85), woodMat(0x5a4030), [0, 0.72, 0])
  const glow = new THREE.PointLight(0xff00ff, 4, 4)
  glow.position.set(0, 0.8, 2)
  chest.add(glow)

  addMesh(room, new THREE.TorusKnotGeometry(0.25, 0.06, 48, 8), neonMat(0xc9a227, 1.5), [0, 1.0, 0.3])
}

export function populateMemories(room, d) {
  const campfire = new THREE.Group()
  campfire.position.set(0, 0, 0.5)
  for (let i = 0; i < 5; i++) {
    const log = addMesh(campfire, new THREE.CylinderGeometry(0.06, 0.08, 0.8, 6), woodMat(0x4a3020), [0, 0.15, 0], [0, 0, (i / 5) * Math.PI])
    log.rotation.x = Math.PI / 2
  }
  const flame = addMesh(campfire, new THREE.ConeGeometry(0.2, 0.5, 8), neonMat(0x00ffcc, 2), [0, 0.45, 0])
  flame.userData.pulse = 0
  campfire.userData.animType = 'campfire'
  room.add(campfire)
  room.userData.campfire = campfire

  const fireLight = new THREE.PointLight(0x00ffcc, 6, 6)
  fireLight.position.set(0, 0.8, 0.5)
  room.add(fireLight)
  room.userData.fireLight = fireLight
}

export function populateTheList(room, d) {
  room.add(createQuillBot())
}
