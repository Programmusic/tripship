/** Crew nodes on the Cosmic Communicator — linked via moleculous bonds */
export const COSMIC_CREW = [
  {
    id: 'captain_flystyle',
    name: 'Captain Flystyle',
    role: 'Helm Signal',
    signal: 'All channels route through the helm. Captain broadcasts orders across the moleculous lattice.',
    color: '#c9a227',
    x: 50,
    y: 50,
    r: 15,
  },
  {
    id: 'b_mellow',
    name: 'b mellow',
    role: 'Low Frequency Anchor',
    signal: 'Holds the sub-pressure line open. Deep signal, steady bond.',
    color: '#00ffcc',
    x: 22,
    y: 20,
    r: 11,
  },
  {
    id: 'bachon_blue',
    name: 'বচোন blue',
    role: 'Azure Relay',
    signal: 'Carries the blue-shift transmissions between decks and the void.',
    color: '#4da6ff',
    x: 78,
    y: 22,
    r: 11,
  },
  {
    id: 'phil_officer',
    name: 'Phil Officer',
    role: 'Watch Officer',
    signal: 'Keeps the watch rotation synced. First to ping when a mate boards.',
    color: '#ff00ff',
    x: 14,
    y: 52,
    r: 11,
  },
  {
    id: 'minton',
    name: 'Minton',
    role: 'Lattice Node',
    signal: 'Bridges the east-west moleculous arc. Quiet but always connected.',
    color: '#9d4edd',
    x: 86,
    y: 50,
    r: 11,
  },
  {
    id: 'tree',
    name: 'tree',
    role: 'Root Uplink',
    signal: 'Grounds the network. Old roots, deep memory, always listening.',
    color: '#33ff99',
    x: 26,
    y: 82,
    r: 11,
  },
  {
    id: 'stu_ee',
    name: 'stu-ee',
    role: 'Echo Pulse',
    signal: 'Repeats the crew heartbeat back through the chain. Never drops a signal.',
    color: '#ffe600',
    x: 74,
    y: 80,
    r: 11,
  },
]

/** Moleculous bonds — molecular connections between crew */
export const MOLECULOUS_BONDS = [
  { from: 'captain_flystyle', to: 'b_mellow', strength: 1 },
  { from: 'captain_flystyle', to: 'bachon_blue', strength: 1 },
  { from: 'captain_flystyle', to: 'phil_officer', strength: 1 },
  { from: 'captain_flystyle', to: 'minton', strength: 1 },
  { from: 'captain_flystyle', to: 'tree', strength: 1 },
  { from: 'captain_flystyle', to: 'stu_ee', strength: 1 },
  { from: 'b_mellow', to: 'tree', strength: 0.85 },
  { from: 'b_mellow', to: 'stu_ee', strength: 0.7 },
  { from: 'bachon_blue', to: 'stu_ee', strength: 0.85 },
  { from: 'bachon_blue', to: 'minton', strength: 0.75 },
  { from: 'phil_officer', to: 'minton', strength: 0.8 },
  { from: 'phil_officer', to: 'tree', strength: 0.65 },
  { from: 'tree', to: 'stu_ee', strength: 0.7 },
]

export function getCrewById(id) {
  return COSMIC_CREW.find((c) => c.id === id) ?? null
}

export function getBondsForCrew(id) {
  return MOLECULOUS_BONDS.filter((b) => b.from === id || b.to === id)
}

export function getLinkedCrew(id) {
  const ids = new Set()
  getBondsForCrew(id).forEach((b) => {
    ids.add(b.from === id ? b.to : b.from)
  })
  return COSMIC_CREW.filter((c) => ids.has(c.id))
}
