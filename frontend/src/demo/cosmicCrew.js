/** Core crew on the Cosmic Communicator — everyone knows everyone */
export const CORE_CREW = [
  {
    id: 'captain_flystyle',
    name: 'Captain Flystyle',
    role: 'Helm Signal',
    signal: 'On the lattice same as every mate. No throne — just another node in the moleculous.',
    color: '#c9a227',
  },
  {
    id: 'b_mellow',
    name: 'b mellow',
    role: 'Low Frequency Anchor',
    signal: 'Holds the sub-pressure line open. Deep signal, steady bond.',
    color: '#00ffcc',
  },
  {
    id: 'bachon_blue',
    name: 'বচোন blue',
    role: 'Azure Relay',
    signal: 'Carries the blue-shift transmissions between decks and the void.',
    color: '#4da6ff',
  },
  {
    id: 'phil_officer',
    name: 'Phil Officer',
    role: 'Watch Officer',
    signal: 'Keeps the watch rotation synced. First to ping when a mate boards.',
    color: '#ff00ff',
  },
  {
    id: 'minton',
    name: 'Minton',
    role: 'Lattice Node',
    signal: 'Bridges the east-west moleculous arc. Quiet but always connected.',
    color: '#9d4edd',
  },
  {
    id: 'tree',
    name: 'tree',
    role: 'Root Uplink',
    signal: 'Grounds the network. Old roots, deep memory, always listening.',
    color: '#33ff99',
  },
  {
    id: 'stu_ee',
    name: 'stu-ee',
    role: 'Echo Pulse',
    signal: 'Repeats the crew heartbeat back through the chain. Never drops a signal.',
    color: '#ffe600',
  },
]

/** Evenly space nodes on a ring — no centre hub */
export function layoutCircle2D(count, cx = 50, cy = 48, radius = 32) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      r: 10,
    }
  })
}

/** Fibonacci sphere — molecular cluster, no privileged node */
export function layoutSphere3D(count, radius = 1.05) {
  if (count <= 1) return [{ x: 0, y: 0, z: 0 }]
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    return {
      x: radius * Math.cos(theta) * ring,
      y: radius * y * 0.82,
      z: radius * Math.sin(theta) * ring,
    }
  })
}

/** Complete graph — every soul bound to every other */
export function buildCompleteBonds(ids) {
  const bonds = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const from = ids[i]
      const to = ids[j]
      bonds.push({
        from,
        to,
        strength: 1,
        pending: from.startsWith('invite_') || to.startsWith('invite_'),
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
    role: aboard ? 'Aboard' : "Awaitin' passage",
    signal: aboard
      ? `${inv.name} boarded. Full moleculous bond with the whole crew.`
      : `${inv.name} is on the manifest — signal strengthening as passage nears.`,
    color: aboard ? '#00ffcc' : '#6a7a8a',
    isInvite: true,
    inviteStatus: inv.status,
  }
}

/** Merge core crew + invitees into one fully-connected moleculous lattice */
export function buildCosmicNetwork(invites = []) {
  const inviteMembers = (invites ?? [])
    .filter((inv) => inv?.name)
    .map(inviteNode)

  const crew = [...CORE_CREW, ...inviteMembers]
  const positions2d = layoutCircle2D(crew.length)
  const positions3d = layoutSphere3D(crew.length)

  const crewWithPos = crew.map((member, i) => ({
    ...member,
    x: positions2d[i].x,
    y: positions2d[i].y,
    r: member.isInvite && member.inviteStatus !== 'accepted' ? 8 : 10,
    pos3d: positions3d[i],
  }))

  const ids = crewWithPos.map((c) => c.id)
  const bonds = buildCompleteBonds(ids)

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
export const MOLECULOUS_BONDS = buildCompleteBonds(CORE_CREW.map((c) => c.id))
