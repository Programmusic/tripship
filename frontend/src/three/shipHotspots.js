import * as THREE from 'three'

export const SHIP_LOCATIONS = [
  {
    id: 'captains-cabin',
    label: "Captain's Cabin",
    desc: 'Captain Flystyle\'s log — charts, scribblin\'s & orders from the helm',
    route: '/captains-cabin',
    position: new THREE.Vector3(-1.1, 0.85, 0.55),
    interiorRotation: Math.PI * 0.85,
    color: 0xc9a227,
  },
  {
    id: 'aaaarrifacts',
    label: 'Arrrrrtifacts',
    desc: 'Vault o\' old fliers, posters & buried rave treasure',
    route: '/aaaarrifacts',
    position: new THREE.Vector3(-0.35, 0.35, 0.75),
    interiorRotation: Math.PI * 0.5,
    color: 0xff00ff,
  },
  {
    id: 'memories',
    label: 'Memory Hold',
    desc: 'Crew tales from the dancefloor — spin yer yarn',
    route: '/memories',
    position: new THREE.Vector3(0.35, 0.55, 0.55),
    interiorRotation: Math.PI * 0.35,
    color: 0x00ffcc,
  },
  {
    id: 'mixes',
    label: 'Deck Sessions',
    desc: 'DJ Krakenbyte — mutant AI pirate on the rig, spinnin\' bass unto the stars',
    route: '/mixes',
    position: new THREE.Vector3(0.95, 0.55, 0.35),
    interiorRotation: Math.PI * 0.15,
    color: 0xff00ff,
  },
  {
    id: 'the-list',
    label: 'The List',
    desc: 'Invite yer mates — if their name ain\'t here, they ain\'t boardin\'',
    route: '/the-list',
    position: new THREE.Vector3(-0.95, 1.15, -0.15),
    interiorRotation: Math.PI * 1.1,
    color: 0x00ffcc,
  },
]

export function createHotspotMarkers(ship) {
  const group = new THREE.Group()
  group.name = 'hotspots'

  SHIP_LOCATIONS.forEach((loc) => {
    const markerGroup = new THREE.Group()
    markerGroup.position.copy(loc.position)
    markerGroup.userData.location = loc

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: loc.color, transparent: true, opacity: 0.9 })
    )
    markerGroup.add(core)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.2, 32),
      new THREE.MeshBasicMaterial({
        color: loc.color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    )
    ring.rotation.x = -Math.PI / 2
    markerGroup.add(ring)

    const light = new THREE.PointLight(loc.color, 2, 4)
    markerGroup.add(light)

    markerGroup.userData.core = core
    markerGroup.userData.ring = ring
    markerGroup.userData.light = light

    group.add(markerGroup)
  })

  ship.add(group)
  return group
}

export function animateHotspots(hotspotGroup, time, activeId = null) {
  hotspotGroup?.children.forEach((marker, i) => {
    const loc = marker.userData.location
    const isActive = activeId === loc?.id
    const pulse = isActive
      ? 1.2 + Math.sin(time * 6) * 0.3
      : 0.7 + Math.sin(time * 3 + i * 1.2) * 0.3

    if (marker.userData.core) {
      marker.userData.core.scale.setScalar(pulse)
    }
    if (marker.userData.ring) {
      marker.userData.ring.rotation.z = time * (isActive ? 3 : 1.5) + i
      marker.userData.ring.material.opacity = isActive ? 0.7 : 0.3 + pulse * 0.3
    }
    if (marker.userData.light) {
      marker.userData.light.intensity = isActive ? 4 + pulse * 3 : 1.5 + pulse * 2
    }
  })
}
