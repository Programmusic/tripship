/** Core crew on the Cosmic Communicator — equal nodes on the lattice */
export const CORE_CREW = [
  {
    id: 'captain_flystyle',
    name: 'Captain Flystyle',
    role: 'Lattice Mate',
    signal: 'Same bond, same weight, same voice as every other node on the lattice.',
    color: '#c9a227',
  },
  {
    id: 'b_mellow',
    name: 'b mellow',
    role: 'Lattice Mate',
    signal: 'Holds the sub-pressure line open. Deep signal, steady bond.',
    color: '#00ffcc',
  },
  {
    id: 'bachon_blue',
    name: 'বচোন blue',
    role: 'Lattice Mate',
    signal: 'Carries the blue-shift transmissions between decks and the void.',
    color: '#4da6ff',
  },
  {
    id: 'phil_officer',
    name: 'Phil Officer',
    role: 'Lattice Mate',
    signal: 'Keeps the watch rotation synced. First to ping when a mate boards.',
    color: '#ff00ff',
  },
  {
    id: 'minton',
    name: 'Minton',
    role: 'Lattice Mate',
    signal: 'Bridges the east-west moleculous arc. Quiet but always connected.',
    color: '#9d4edd',
  },
  {
    id: 'tree',
    name: 'tree',
    role: 'Lattice Mate',
    signal: 'Grounds the network. Old roots, deep memory, always listening.',
    color: '#33ff99',
  },
  {
    id: 'stu_ee',
    name: 'stu-ee',
    role: 'Lattice Mate',
    signal: 'Repeats the crew heartbeat back through the chain. Never drops a signal.',
    color: '#ffe600',
  },
]

/** Stable neutral order — no list-order privilege for any crew member */
export function sortLatticeCrew(members) {
  return [...members].sort((a, b) => a.id.localeCompare(b.id))
}

const NODE_RADIUS_2D = 13
const NODE_RADIUS_3D = 0.12

export function profileToNode(profile) {
  return {
    id: profile.latticeId,
    latticeId: profile.latticeId,
    name: profile.name,
    role: profile.role || 'Lattice Mate',
    signal: profile.signal || '',
    bio: profile.bio || '',
    color: profile.color || '#00ffcc',
    avatarUrl: profile.avatarUrl ?? null,
    userId: profile.userId ?? null,
    isCoreCrew: !!profile.isCoreCrew,
  }
}

/** Equal-spacing ring — every node same distance from centre */
export function layoutCircle2D(count, cx = 50, cy = 50, radius = 27) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      r: NODE_RADIUS_2D,
    }
  })
}

/** Flat equal ring in 3D — same height, same radius, same spacing */
export function layoutRing3D(count, radius = 1.0) {
  if (count <= 1) return [{ x: 0, y: 0, z: 0 }]
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    return {
      x: radius * Math.cos(angle),
      y: 0,
      z: radius * Math.sin(angle),
    }
  })
}

function bondKey(a, b) {
  return [a, b].sort().join(':')
}

function isPendingPair(a, b) {
  return a.startsWith('invite_') || b.startsWith('invite_')
}

/** Ring edges + full mesh — equal lattice, everyone bound to everyone */
export function buildLatticeBonds(ids) {
  const bonds = []
  const seen = new Set()

  for (let i = 0; i < ids.length; i++) {
    const from = ids[i]
    const to = ids[(i + 1) % ids.length]
    const key = bondKey(from, to)
    if (!seen.has(key)) {
      seen.add(key)
      bonds.push({
        from,
        to,
        strength: 1,
        ring: true,
        pending: isPendingPair(from, to),
      })
    }
  }

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 2; j < ids.length; j++) {
      const from = ids[i]
      const to = ids[j]
      const key = bondKey(from, to)
      if (seen.has(key)) continue
      seen.add(key)
      const wrapSkip = i === 0 && j === ids.length - 1
      if (wrapSkip) continue
      bonds.push({
        from,
        to,
        strength: 1,
        ring: false,
        pending: isPendingPair(from, to),
      })
    }
  }

  return bonds
}

function inviteNode(inv) {
  const aboard = inv.status === 'accepted'
  return {
    id: `invite_${inv.id}`,
    name: inv.name,
    role: 'Lattice Mate',
    signal: aboard
      ? `${inv.name} boarded. Equal bond with every node on the lattice.`
      : `${inv.name} is on the manifest — lattice slot reserved, signal warming up.`,
    color: aboard ? '#00ffcc' : '#7a8a9a',
    isInvite: true,
    inviteStatus: inv.status,
  }
}

/** Merge lattice profiles + invitees into one equal moleculous lattice */
export function buildCosmicNetwork({ invites = [], profiles = null } = {}) {
  const baseCrew = profiles?.length
    ? profiles.map(profileToNode)
    : CORE_CREW.map((member) => ({ ...member, latticeId: member.id }))

  const inviteMembers = (invites ?? [])
    .filter((inv) => inv?.name)
    .map(inviteNode)

  const crew = sortLatticeCrew([...baseCrew, ...inviteMembers])
  const positions2d = layoutCircle2D(crew.length)
  const positions3d = layoutRing3D(crew.length)

  const crewWithPos = crew.map((member, i) => ({
    ...member,
    x: positions2d[i].x,
    y: positions2d[i].y,
    r: NODE_RADIUS_2D,
    pos3d: positions3d[i],
    nodeRadius3d: NODE_RADIUS_3D,
  }))

  const ids = crewWithPos.map((c) => c.id)
  const bonds = buildLatticeBonds(ids)

  return { crew: crewWithPos, bonds }
}

export function getCrewById(crew, id) {
  return crew.find((c) => c.id === id) ?? null
}

export function getBondsForCrew(bonds, id) {
  return bonds.filter((b) => b.from === id || b.to === id)
}

export function getLinkedCrew(crew, bonds, id) {
  const ids = new Set()
  getBondsForCrew(bonds, id).forEach((b) => {
    ids.add(b.from === id ? b.to : b.from)
  })
  return crew.filter((c) => ids.has(c.id))
}

/** @deprecated use buildCosmicNetwork */
export const COSMIC_CREW = CORE_CREW
/** @deprecated use buildCosmicNetwork */
export const MOLECULOUS_BONDS = buildLatticeBonds(CORE_CREW.map((c) => c.id))
