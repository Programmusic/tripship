import * as THREE from 'three'

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

function getDoorForward(ship, location) {
  const forward = new THREE.Vector3(0, 0, 1)
  const interiorQ = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    location.interiorRotation ?? 0
  )
  forward.applyQuaternion(interiorQ)
  forward.applyQuaternion(ship.quaternion)
  return forward.normalize()
}

export function createDoorFlight(camera, controls, ship, location) {
  const doorWorld = location.position.clone()
  ship.localToWorld(doorWorld)

  const forward = getDoorForward(ship, location)

  const approachPos = doorWorld.clone()
    .add(forward.clone().multiplyScalar(1.6))
    .add(new THREE.Vector3(0, 0.55, 0))

  const peekPos = doorWorld.clone()
    .add(forward.clone().multiplyScalar(0.75))
    .add(new THREE.Vector3(0, 0.32, 0))

  const insidePos = doorWorld.clone()
    .add(forward.clone().multiplyScalar(0.25))
    .add(new THREE.Vector3(0, 0.28, 0))

  const doorLookAt = doorWorld.clone().add(new THREE.Vector3(0, 0.28, 0))
  const insideLookAt = doorWorld.clone()
    .add(forward.clone().multiplyScalar(-0.5))
    .add(new THREE.Vector3(0, 0.35, 0))

  return {
    startPos: camera.position.clone(),
    startTarget: controls.target.clone(),
    approachPos,
    peekPos,
    insidePos,
    doorLookAt,
    insideLookAt,
    phase: 'approach',
    progress: 0,
    duration: 1.6,
    peekDuration: 1.2,
    enterDuration: 0.9,
    location,
  }
}

export function updateFlight(flight, delta) {
  if (!flight) return { done: true, peekProgress: 0, phase: 'idle' }

  flight.progress += delta / flight.duration

  if (flight.phase === 'approach') {
    const t = easeInOutCubic(Math.min(flight.progress, 1))
    return {
      position: flight.startPos.clone().lerp(flight.approachPos, t),
      target: flight.startTarget.clone().lerp(flight.doorLookAt, t),
      done: flight.progress >= 1,
      peekProgress: 0,
      phase: 'approach',
    }
  }

  if (flight.phase === 'peek') {
    const t = easeInOutCubic(Math.min(flight.progress, 1))
    return {
      position: flight.approachPos.clone().lerp(flight.peekPos, t),
      target: flight.doorLookAt.clone().lerp(flight.insideLookAt, t),
      done: flight.progress >= 1,
      peekProgress: t,
      phase: 'peek',
    }
  }

  if (flight.phase === 'enter') {
    const t = easeOutQuart(Math.min(flight.progress, 1))
    return {
      position: flight.peekPos.clone().lerp(flight.insidePos, t),
      target: flight.insideLookAt,
      done: flight.progress >= 1,
      peekProgress: 1,
      phase: 'enter',
      enterProgress: t,
    }
  }

  return { done: true, peekProgress: 0, phase: 'idle' }
}

export function advanceFlightPhase(flight) {
  if (!flight) return null
  if (flight.phase === 'approach') {
    flight.phase = 'peek'
    flight.progress = 0
    flight.duration = flight.peekDuration
    return flight
  }
  return flight
}

export function startEnterFlight(flight) {
  if (!flight) return null
  flight.phase = 'enter'
  flight.progress = 0
  flight.duration = flight.enterDuration
  return flight
}
