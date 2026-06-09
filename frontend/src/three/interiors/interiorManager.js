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

export function enterInteriorMode({
  scene,
  ship,
  hotspots,
  interiorPeekRooms,
  labelElements,
  interiorData,
}) {
  ship.visible = false
  hotspots.visible = false
  hidePeekRooms(interiorPeekRooms)

  labelElements?.forEach((el) => {
    el.style.opacity = '0'
    el.style.pointerEvents = 'none'
  })

  scene.fog = new THREE.FogExp2(0x0a0810, 0.045)
  scene.background = new THREE.Color(0x0a0810)

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
}) {
  if (interiorGroup) {
    scene.remove(interiorGroup)
  }

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
