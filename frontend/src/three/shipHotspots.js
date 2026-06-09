import * as THREE from 'three'

export const SHIP_LOCATIONS = [
  {
    id: 'captains-cabin',
    label: "Captain's Cabin",
    desc: 'Scribblin\'s from the Cap\'n',
    route: '/captains-cabin',
    position: new THREE.Vector3(-1.1, 1.0, 0.5),
    color: 0xc9a227,
  },
  {
    id: 'aaaarrifacts',
    label: 'Aaaarrifacts',
    desc: 'Vault o\' old fliers & loot',
    route: '/aaaarrifacts',
    position: new THREE.Vector3(-0.3, 0.2, 0.6),
    color: 0xff00ff,
  },
  {
    id: 'memories',
    label: 'Memory Hold',
    desc: 'Crew tales from the dancefloor',
    route: '/memories',
    position: new THREE.Vector3(0.4, 0.5, 0.4),
    color: 0x00ffcc,
  },
  {
    id: 'mixes',
    label: 'Deck Sessions',
    desc: 'DJ mixes on the riggin\'',
    route: '/mixes',
    position: new THREE.Vector3(0.9, 0.6, 0.2),
    color: 0xff00ff,
  },
  {
    id: 'the-list',
    label: 'The List',
    desc: 'Invite mates aboard',
    route: '/the-list',
    position: new THREE.Vector3(-1.0, 1.4, -0.3),
    color: 0x00ffcc,
  },
]

export function createHotspotMarkers(ship, onSelect) {
  const group = new THREE.Group()
  group.name = 'hotspots'

  SHIP_LOCATIONS.forEach((loc) => {
    const markerGroup = new THREE.Group()
    markerGroup.position.copy(loc.position)
    markerGroup.userData.location = loc

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({
        color: loc.color,
        transparent: true,
        opacity: 0.9,
      })
    )
    markerGroup.add(core)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.22, 32),
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
    markerGroup.userData.onSelect = onSelect

    group.add(markerGroup)
  })

  ship.add(group)
  return group
}

export function animateHotspots(hotspotGroup, time) {
  hotspotGroup?.children.forEach((marker, i) => {
    const pulse = 0.7 + Math.sin(time * 3 + i * 1.2) * 0.3
    if (marker.userData.core) {
      marker.userData.core.scale.setScalar(pulse)
    }
    if (marker.userData.ring) {
      marker.userData.ring.rotation.z = time * 1.5 + i
      marker.userData.ring.material.opacity = 0.3 + pulse * 0.3
    }
    if (marker.userData.light) {
      marker.userData.light.intensity = 1.5 + pulse * 2
    }
  })
}
