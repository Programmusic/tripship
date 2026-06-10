import * as THREE from 'three'
import { easeInOutCubic, easeOutQuart } from '../../cameraFlight.js'
import { getArtifactExperience } from './index.js'
import { getLogExperienceAnchor } from './captainsLogExperience.js'

export function findRoomArtifact(group, camera, maxDist = 4) {
  const interactables = group?.userData?.interactables ?? []
  const origin = camera.position.clone()
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)

  let best = null
  let bestDot = 0.5

  for (const obj of interactables) {
    if (!obj.userData.isRoomArtifact) continue
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

export function mountArtifactExperience(room, type) {
  const def = getArtifactExperience(type)
  if (!def) return null

  let exp = room.userData.activeExperience
  if (!exp || exp.userData.experienceType !== type) {
    exp = def.create()
    room.add(exp)
    room.userData.activeExperience = exp
  }

  const anchor = getLogExperienceAnchor(room)
  exp.position.copy(anchor)
  exp.visible = true
  return { exp, def, anchor }
}

export function hideRoomForExperience(room, experience) {
  const hidden = []
  room.children.forEach((child) => {
    if (child !== experience && child.visible) {
      child.visible = false
      hidden.push(child)
    }
  })
  return hidden
}

export function restoreRoomVisibility(hidden) {
  hidden?.forEach((child) => {
    child.visible = true
  })
}

export function createCameraTransition(camera, fromPos, fromQuat, toPos, toLookAt, toFov, fromFov) {
  const endQuat = new THREE.Quaternion()
  const m = new THREE.Matrix4()
  m.lookAt(toPos, toLookAt, camera.up)
  endQuat.setFromRotationMatrix(m)

  return {
    fromPos: fromPos.clone(),
    toPos: toPos.clone(),
    fromQuat: fromQuat.clone(),
    toQuat: endQuat,
    fromFov: fromFov ?? camera.fov,
    toFov: toFov ?? camera.fov,
    progress: 0,
    duration: 1.35,
    phase: 'in',
  }
}

export function updateCameraTransition(transition, camera, delta) {
  if (!transition) return false

  transition.progress += delta / transition.duration
  const t = easeInOutCubic(Math.min(transition.progress, 1))

  camera.position.lerpVectors(transition.fromPos, transition.toPos, t)
  camera.quaternion.slerpQuaternions(transition.fromQuat, transition.toQuat, t)
  camera.fov = transition.fromFov + (transition.toFov - transition.fromFov) * t
  camera.updateProjectionMatrix()

  return transition.progress >= 1
}

export function computeExperienceCameraWorld(anchor, camDef) {
  const pos = anchor.clone().add(camDef.position)
  const lookAt = anchor.clone().add(camDef.lookAt)
  return { position: pos, lookAt, fov: camDef.fov }
}

export function flyCameraOut(camera, saved, delta, state) {
  if (!state) return true
  state.progress += delta / (state.duration || 1)
  const t = easeOutQuart(Math.min(state.progress, 1))
  camera.position.lerpVectors(state.fromPos, state.toPos, t)
  camera.quaternion.slerpQuaternions(state.fromQuat, state.toQuat, t)
  camera.fov = state.fromFov + (state.toFov - state.fromFov) * t
  camera.updateProjectionMatrix()
  return state.progress >= 1
}
