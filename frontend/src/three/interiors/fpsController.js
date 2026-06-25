import * as THREE from 'three'

const MOVE_SPEED = 4.8
const SPRINT_MULT = 1.7
const LOOK_SENSITIVITY = 0.0026
const PITCH_LIMIT = Math.PI / 2 - 0.1

export class FPSController {
  constructor(camera, domElement, bounds, opts = {}) {
    this.camera = camera
    this.domElement = domElement
    this.bounds = bounds
    this.desktop = opts.desktop ?? false
    this.keys = { w: false, a: false, s: false, d: false }
    this.shift = false
    this.yaw = Math.PI
    this.pitch = 0
    this.velocity = { forward: 0, strafe: 0 }
    this.enabled = false
    this.touchMove = { x: 0, y: 0, active: false }
    this.touchLook = { x: 0, y: 0, active: false }
    this.dragLook = { active: false, x: 0, y: 0, pointerId: null }
    this.mobileInput = { forward: 0, strafe: 0 }

    this._onKeyDown = this.onKeyDown.bind(this)
    this._onKeyUp = this.onKeyUp.bind(this)
    this._onPointerMove = this.onPointerMove.bind(this)
    this._onPointerDown = this.onPointerDown.bind(this)
    this._onPointerUp = this.onPointerUp.bind(this)
    this._onPointerCancel = this.onPointerUp.bind(this)
  }

  enable(spawn, yaw = Math.PI, pitch = 0) {
    this.enabled = true
    this.yaw = yaw
    this.pitch = pitch
    this.velocity.forward = 0
    this.velocity.strafe = 0
    this.camera.position.copy(spawn)
    this.applyRotation()
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    this.domElement.addEventListener('pointermove', this._onPointerMove)
    this.domElement.addEventListener('pointerdown', this._onPointerDown)
    this.domElement.addEventListener('pointerup', this._onPointerUp)
    this.domElement.addEventListener('pointercancel', this._onPointerCancel)
    this.domElement.addEventListener('pointerleave', this._onPointerUp)
  }

  disable() {
    this.enabled = false
    this.dragLook.active = false
    this.touchLook.active = false
    document.exitPointerLock?.()
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    this.domElement.removeEventListener('pointermove', this._onPointerMove)
    this.domElement.removeEventListener('pointerdown', this._onPointerDown)
    this.domElement.removeEventListener('pointerup', this._onPointerUp)
    this.domElement.removeEventListener('pointercancel', this._onPointerCancel)
    this.domElement.removeEventListener('pointerleave', this._onPointerUp)
  }

  setMobileInput(forward, strafe) {
    this.mobileInput.forward = forward
    this.mobileInput.strafe = strafe
  }

  onKeyDown(e) {
    if (!this.enabled) return
    if (e.key === 'Shift') this.shift = true
    const k = e.key.toLowerCase()
    if (k in this.keys) this.keys[k] = true
  }

  onKeyUp(e) {
    if (e.key === 'Shift') this.shift = false
    const k = e.key.toLowerCase()
    if (k in this.keys) this.keys[k] = false
  }

  onPointerDown(e) {
    if (!this.enabled) return

    if (this.desktop) {
      if (e.button === 0 || e.button === 2) {
        this.dragLook.active = true
        this.dragLook.x = e.clientX
        this.dragLook.y = e.clientY
        this.dragLook.pointerId = e.pointerId
        this.domElement.setPointerCapture?.(e.pointerId)
      }
      return
    }

    const rect = this.domElement.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x > rect.width * 0.45) {
      this.touchLook.active = true
      this.touchLook.x = e.clientX
      this.touchLook.y = e.clientY
    }
  }

  onPointerUp(e) {
    if (this.dragLook.active && e.pointerId === this.dragLook.pointerId) {
      this.dragLook.active = false
      this.dragLook.pointerId = null
      this.domElement.releasePointerCapture?.(e.pointerId)
    }
    this.touchLook.active = false
  }

  onPointerMove(e) {
    if (!this.enabled) return

    if (document.pointerLockElement === this.domElement) {
      this.applyLookDelta(-e.movementX, -e.movementY)
      return
    }

    if (this.dragLook.active && e.pointerId === this.dragLook.pointerId) {
      const dx = e.clientX - this.dragLook.x
      const dy = e.clientY - this.dragLook.y
      this.dragLook.x = e.clientX
      this.dragLook.y = e.clientY
      this.applyLookDelta(-dx, -dy)
      return
    }

    if (this.touchLook.active) {
      const dx = e.clientX - this.touchLook.x
      const dy = e.clientY - this.touchLook.y
      this.touchLook.x = e.clientX
      this.touchLook.y = e.clientY
      this.applyLookDelta(-dx * 1.4, -dy * 1.4)
    }
  }

  applyLookDelta(dx, dy) {
    this.yaw += dx * LOOK_SENSITIVITY
    this.pitch += dy * LOOK_SENSITIVITY
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch))
    this.applyRotation()
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

    const targetForward =
      (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0) + this.mobileInput.forward
    const targetStrafe =
      (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0) + this.mobileInput.strafe

    const blend = 1 - Math.exp(-14 * delta)
    this.velocity.forward += (targetForward - this.velocity.forward) * blend
    this.velocity.strafe += (targetStrafe - this.velocity.strafe) * blend

    if (Math.abs(this.velocity.forward) < 0.01) this.velocity.forward = 0
    if (Math.abs(this.velocity.strafe) < 0.01) this.velocity.strafe = 0
    if (this.velocity.forward === 0 && this.velocity.strafe === 0) return

    const speed = MOVE_SPEED * (this.shift ? SPRINT_MULT : 1) * delta
    const direction = new THREE.Vector3(this.velocity.strafe, 0, -this.velocity.forward)
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
    direction.normalize()

    this.camera.position.addScaledVector(direction, speed)
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
