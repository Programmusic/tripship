import * as THREE from 'three'
import { buildCosmicNetwork } from '@/demo/cosmicCrew.js'
import { addMesh, neonMat } from './buildRoom.js'

const CYAN = 0x00ffcc

function hexToThree(hex) {
  return parseInt(hex.replace('#', ''), 16)
}

function nameLabel(text, color = '#e8f4ff') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 256, 64)
  ctx.font = 'bold 22px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.fillText(text, 128, 32)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(0.55, 0.14, 1)
  sprite.renderOrder = 2
  return sprite
}

function titleSign() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 96
  const ctx = canvas.getContext('2d')
  ctx.font = 'bold 36px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#00ffcc'
  ctx.shadowColor = '#00ffcc'
  ctx.shadowBlur = 16
  ctx.fillText('COSMIC COMMUNICATOR', 256, 36)
  ctx.font = 'italic 18px Georgia, serif'
  ctx.fillStyle = '#c9a227'
  ctx.shadowBlur = 8
  ctx.fillText('moleculous lattice', 256, 68)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.32),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  )
  sign.position.set(0, 1.55, 0)
  return sign
}

function createNode(member, index) {
  const group = new THREE.Group()
  group.name = `cosmic-node-${member.id}`
  group.userData.crewId = member.id
  group.userData.animType = 'cosmicNode'
  group.userData.phase = index * 0.9

  const color = hexToThree(member.color)
  const pending = member.isInvite && member.inviteStatus !== 'accepted'
  const radius = pending ? 0.07 : 0.09

  const core = addMesh(
    group,
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: pending ? 0.9 : 1.6,
      roughness: 0.2,
      metalness: 0.35,
    }),
    [0, 0, 0]
  )

  const ring = addMesh(
    group,
    new THREE.TorusGeometry(radius * 1.55, 0.008, 8, 24),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: pending ? 0.35 : 0.55,
      blending: THREE.AdditiveBlending,
    }),
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  )
  ring.userData.animType = 'cosmicNodeRing'

  const label = nameLabel(member.name, member.color)
  label.position.set(0, -0.22, 0)
  group.add(label)

  const light = new THREE.PointLight(color, pending ? 1.2 : 2.4, 2.2)
  light.position.set(0, 0, 0)
  group.add(light)
  group.userData.nodeLight = light
  group.userData.pending = pending
  group.userData.core = core

  return group
}

function createBond(from, to, pending) {
  const geom = new THREE.BufferGeometry().setFromPoints([from, to])
  const mat = new THREE.LineBasicMaterial({
    color: pending ? 0x556677 : CYAN,
    transparent: true,
    opacity: pending ? 0.22 : 0.38,
    blending: THREE.AdditiveBlending,
  })
  const line = new THREE.Line(geom, mat)
  line.userData.animType = 'moleculousBond'
  line.userData.phase = from.x + to.z
  line.userData.bondStrength = pending ? 0.5 : 1
  line.userData.pending = pending
  return line
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children[0]
    group.remove(child)
    child.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material.dispose()
      }
    })
  }
}

export function updateCosmicCommunicator3d(root, invites = []) {
  if (!root) return

  const { crew, bonds } = buildCosmicNetwork(invites)
  root.userData.cosmicCrew = crew
  root.userData.cosmicBonds = bonds

  let lattice = root.getObjectByName('cosmic-lattice')
  if (!lattice) {
    lattice = new THREE.Group()
    lattice.name = 'cosmic-lattice'
    root.add(lattice)
  }

  clearGroup(lattice)

  const nodeMap = new Map()
  crew.forEach((member, i) => {
    const node = createNode(member, i)
    const p = member.pos3d
    node.position.set(p.x, p.y, p.z)
    lattice.add(node)
    nodeMap.set(member.id, node.position.clone())
  })

  bonds.forEach((bond) => {
    const a = nodeMap.get(bond.from)
    const b = nodeMap.get(bond.to)
    if (!a || !b) return
    lattice.add(createBond(a, b, bond.pending))
  })
}

export function createCosmicCommunicator3d(invites = []) {
  const root = new THREE.Group()
  root.name = 'cosmic-communicator'
  root.userData.animType = 'cosmicComm'

  const halo = addMesh(
    root,
    new THREE.TorusGeometry(1.35, 0.012, 8, 64),
    new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    }),
    [0, 0, 0],
    [Math.PI / 2, 0, 0]
  )
  halo.userData.animType = 'cosmicHalo'

  const innerHalo = addMesh(
    root,
    new THREE.TorusGeometry(0.95, 0.008, 8, 48),
    new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    }),
    [0, 0, 0],
    [Math.PI / 2, 0, 0.4]
  )
  innerHalo.userData.animType = 'cosmicHaloInner'

  root.add(titleSign())

  const ambient = new THREE.PointLight(CYAN, 4, 5)
  ambient.position.set(0, 0.5, 0.8)
  root.add(ambient)
  root.userData.ambientLight = ambient

  updateCosmicCommunicator3d(root, invites)
  return root
}
