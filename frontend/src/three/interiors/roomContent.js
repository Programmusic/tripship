import * as THREE from 'three'
import { addMesh, woodMat, neonMat } from './buildRoom.js'
import { createKrakenbyteStage } from './deckStage.js'
import { createBassStack } from './characters.js'
import { createGhostCaptain, createQuillBot } from './characters.js'
import { createCaptainsLogArtifact, createCaptainsLogDeskSign } from './artifactExperiences/index.js'

const PINK = 0xff00ff
const CYAN = 0x00ffcc

/** Deck Sessions — hero Krakenbyte stage + side stacks only */
export function populateDeckSessions(room, w, d, h) {
  const stage = createKrakenbyteStage(-3.8)
  room.add(stage)
  room.userData.stage = stage
  room.userData.dj = stage.userData.dj
  room.userData.rig = stage.userData.rig

  room.add(createBassStack(-w / 2 + 1.0, -0.5, PINK))
  room.add(createBassStack(w / 2 - 1.0, -0.5, CYAN))

  for (let i = 0; i < 8; i++) {
    addMesh(
      room,
      new THREE.CylinderGeometry(0.32, 0.32, 0.02, 16),
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: i % 2 ? 0x220022 : 0x002222,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide,
      }),
      [-3.5 + i * 1.0, 1.5 + (i % 2) * 0.2, -d / 2 + 0.1]
    )
  }

  addMesh(room, new THREE.PlaneGeometry(w * 0.85, 1.2), neonMat(PINK, 0.5), [0, 0.02, -d / 2 + 0.06])

  const strobe = new THREE.PointLight(PINK, 20, 22)
  strobe.position.set(0, h - 0.3, -2)
  room.add(strobe)
  room.userData.strobe = strobe

  const strobeCyan = new THREE.PointLight(CYAN, 16, 20)
  strobeCyan.position.set(0, 2.5, -4)
  room.add(strobeCyan)
  room.userData.strobeCyan = strobeCyan

  createTerminal(room, [w / 2 - 1.0, 0, 1.5], 'Deck Rig', PINK)
}

function createTerminal(parent, position, label, accent) {
  const group = new THREE.Group()
  group.position.set(...position)
  addMesh(group, new THREE.BoxGeometry(0.8, 1.0, 0.45), woodMat(0x3a2818), [0, 0.5, 0])
  const screen = addMesh(group, new THREE.PlaneGeometry(0.55, 0.4), neonMat(accent, 2.5), [0, 0.85, 0.24])
  screen.userData.isTerminal = true
  screen.userData.terminalLabel = label
  const glow = new THREE.PointLight(accent, 6, 5)
  glow.position.set(0, 0.9, 0.3)
  group.add(glow)
  parent.add(group)
  return screen
}

export function populateCaptainsCabin(room, w, d) {
  room.add(createGhostCaptain())

  const deskZ = -d / 2 + 1.8
  const logArtifact = createCaptainsLogArtifact()
  logArtifact.position.set(0, 0.96, deskZ)
  room.add(logArtifact)
  room.userData.roomArtifact = logArtifact

  const sign = createCaptainsLogDeskSign()
  sign.position.set(0, 2.35, deskZ - 0.15)
  room.add(sign)
  room.userData.logSign = sign

  const deskSpot = new THREE.SpotLight(0xc9a227, 35, 14, Math.PI / 5, 0.35, 0.8)
  deskSpot.position.set(0, 3.3, deskZ + 2.5)
  deskSpot.target.position.set(0, 0.95, deskZ)
  room.add(deskSpot)
  room.add(deskSpot.target)
  room.userData.deskSpot = deskSpot

  const mapTable = addMesh(room, new THREE.CylinderGeometry(0.9, 1.0, 0.7, 16), woodMat(0x4a3020), [2, 0.35, 1.5])
  addMesh(mapTable, new THREE.CylinderGeometry(0.75, 0.75, 0.02, 16), new THREE.MeshStandardMaterial({
    color: 0xe8dcc8,
    emissive: 0xc9a227,
    emissiveIntensity: 0.1,
    side: THREE.DoubleSide,
  }), [0, 0.36, 0])

  for (let i = 0; i < 3; i++) {
    const bottle = addMesh(room, new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8), neonMat([CYAN, PINK, 0xc9a227][i], 0.8), [
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
  const glow = new THREE.PointLight(PINK, 4, 4)
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
  const flame = addMesh(campfire, new THREE.ConeGeometry(0.2, 0.5, 8), neonMat(CYAN, 2), [0, 0.45, 0])
  flame.userData.pulse = 0
  campfire.userData.animType = 'campfire'
  room.add(campfire)
  room.userData.campfire = campfire

  const fireLight = new THREE.PointLight(CYAN, 6, 6)
  fireLight.position.set(0, 0.8, 0.5)
  room.add(fireLight)
  room.userData.fireLight = fireLight
}

export function populateTheList(room, d) {
  room.add(createQuillBot())
}
