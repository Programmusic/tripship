import * as THREE from 'three'

const MOVE_SPEED = 4.2
const LOOK_SENSITIVITY = 0.0022
const PITCH_LIMIT = Math.PI / 2 - 0.1

export class FPSController {
  constructor(camera, domElement, bounds) {
    this.camera = camera
    this.domElement = domElement
    this.bounds = bounds
    this.keys = { w: false, a: false, s: false, d: false }
    this.yaw = Math.PI
    this.pitch = 0
    this.enabled = false
    this.touchMove = { x: 0, y: 0, active: false }
    this.touchLook = { x: 0, y: 0, active: false }
    this.mobileInput = { forward: 0, strafe: 0 }

    this._onKeyDown = this.onKeyDown.bind(this)
    this._onKeyUp = this.onKeyUp.bind(this)
    this._onPointerMove = this.onPointerMove.bind(this)
    this._onPointerDown = this.onPointerDown.bind(this)
    this._onPointerUp = this.onPointerUp.bind(this)
  }

  enable(spawn, yaw = Math.PI) {
    this.enabled = true
    this.yaw = yaw
    this.pitch = 0
    this.camera.position.copy(spawn)
    this.applyRotation()
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    this.domElement.addEventListener('pointermove', this._onPointerMove)
    this.domElement.addEventListener('pointerdown', this._onPointerDown)
    this.domElement.addEventListener('pointerup', this._onPointerUp)
  }

  disable() {
    this.enabled = false
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    this.domElement.removeEventListener('pointermove', this._onPointerMove)
    this.domElement.removeEventListener('pointerdown', this._onPointerDown)
    this.domElement.removeEventListener('pointerup', this._onPointerUp)
  }

  setMobileInput(forward, strafe) {
    this.mobileInput.forward = forward
    this.mobileInput.strafe = strafe
  }

  onKeyDown(e) {
    if (!this.enabled) return
    const k = e.key.toLowerCase()
    if (k in this.keys) this.keys[k] = true
  }

  onKeyUp(e) {
    const k = e.key.toLowerCase()
    if (k in this.keys) this.keys[k] = false
  }

  onPointerDown(e) {
    if (!this.enabled) return
    const rect = this.domElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x > rect.width * 0.45) {
      this.touchLook.active = true
      this.touchLook.x = e.clientX
      this.touchLook.y = e.clientY
    }
  }

  onPointerUp() {
    this.touchLook.active = false
  }

  onPointerMove(e) {
    if (!this.enabled) return
    if (document.pointerLockElement === this.domElement) {
      this.yaw -= e.movementX * LOOK_SENSITIVITY
      this.pitch -= e.movementY * LOOK_SENSITIVITY
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch))
      this.applyRotation()
      return
    }
    if (this.touchLook.active) {
      const dx = e.clientX - this.touchLook.x
      const dy = e.clientY - this.touchLook.y
      this.touchLook.x = e.clientX
      this.touchLook.y = e.clientY
      this.yaw -= dx * LOOK_SENSITIVITY * 1.5
      this.pitch -= dy * LOOK_SENSITIVITY * 1.5
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch))
      this.applyRotation()
    }
  }

  requestPointerLock() {
    this.domElement.requestPointerLock?.()
  }

  applyRotation() {
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.y = this.yaw
    this.camera.rotation.x = this.pitch
  }

  update(delta) {
    if (!this.enabled) return

    const forward =
      (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0) + this.mobileInput.forward
    const strafe =
      (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0) + this.mobileInput.strafe

    if (forward === 0 && strafe === 0) return

    const direction = new THREE.Vector3(strafe, 0, -forward)
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
    direction.normalize()

    this.camera.position.addScaledVector(direction, MOVE_SPEED * delta)
    this.clampPosition()
  }

  clampPosition() {
    const { minX, maxX, minZ, maxZ } = this.bounds
    this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x))
    this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z))
    this.camera.position.y = 1.65
  }

  getForwardRay() {
    const dir = new THREE.Vector3(0, 0, -1)
    dir.applyQuaternion(this.camera.quaternion)
    return dir
  }
}
