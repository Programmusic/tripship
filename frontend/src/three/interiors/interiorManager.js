import * as THREE from 'three'
import { buildInteriorScene } from './interiorScenes.js'

const interiorCache = new Map()

export function getOrBuildInterior(location) {
  if (interiorCache.has(location.id)) {
    return interiorCache.get(location.id)
  }
  const scene = buildInteriorScene(location)
  if (scene) interiorCache.set(location.id, scene)
  return scene
}

export function createInteriorLighting(scene) {
  const group = new THREE.Group()
  group.name = 'interior-lighting'

  const hemi = new THREE.HemisphereLight(0x8899bb, 0x1a1410, 0.85)
  group.add(hemi)

  const ambient = new THREE.AmbientLight(0x334455, 0.55)
  group.add(ambient)

  scene.add(group)
  return group
}

export function enterInteriorMode({
  scene,
  ship,
  hotspots,
  interiorPeekRooms,
  labelElements,
  interiorData,
  lightingGroup,
}) {
  ship.visible = false
  hotspots.visible = false
  hidePeekRooms(interiorPeekRooms)

  labelElements?.forEach((el) => {
    el.style.opacity = '0'
    el.style.pointerEvents = 'none'
  })

  scene.fog = new THREE.FogExp2(0x12101a, 0.018)
  scene.background = new THREE.Color(0x12101a)

  if (lightingGroup) lightingGroup.visible = true

  const { group } = interiorData
  group.visible = true
  scene.add(group)

  return group
}

export function exitInteriorMode({
  scene,
  ship,
  hotspots,
  labelElements,
  interiorGroup,
  lightingGroup,
}) {
  if (interiorGroup) {
    scene.remove(interiorGroup)
  }

  if (lightingGroup) lightingGroup.visible = false

  ship.visible = true
  hotspots.visible = true

  labelElements?.forEach((el) => {
    el.style.opacity = '1'
    el.style.pointerEvents = 'auto'
  })

  scene.fog = new THREE.FogExp2(0x020408, 0.022)
  scene.background = new THREE.Color(0x020408)
}

function hidePeekRooms(interiorPeekRooms) {
  interiorPeekRooms?.rooms?.forEach((entry) => {
    if (entry.userData.room) {
      entry.userData.room.visible = false
    }
  })
}
