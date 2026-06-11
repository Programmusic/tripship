const GENERIC = [
  'this is aaaart baby',
  'unsocial media innit',
  'no algorithms just family',
  'if ye know ye know',
  'proper trip ship vibes',
  'below decks energy',
  'certified landlubber-free zone',
  'the hull is bouncing',
  'warehouse kid forever',
  'rave archaeology',
]

const BY_ROOM = {
  'aaaarrifacts': [
    'this is aaaart baby',
    'plunder the vault',
    'poster archaeology',
    'buried flier season',
    'frame that loot',
    'gallery of chaos',
  ],
  mixes: [
    'krakenbyte on the decks',
    'sub pressure incoming',
    'bins to the crow\'s nest',
    'selector mode activated',
    'bass unto the stars',
    'deck is hot me hearties',
  ],
  'captains-cabin': [
    'orders from the helm',
    'captain flystyle was here',
    'charts & scribblin\'s',
    'helm business only',
    'read the log or walk the plank',
  ],
  memories: [
    'remember the subs',
    'spin yer yarn',
    'dancefloor folklore',
    'tales from the hold',
    'we were there mate',
  ],
  'the-list': [
    'name on the list',
    'invite yer mates',
    'crew invite crew',
    'no randos allowed',
    'vouched for or vamoosh',
  ],
}

export function pickRoomSlogan(roomId) {
  const pool = [...(BY_ROOM[roomId] ?? []), ...GENERIC]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function pickRoomSlogans(roomId, count = 2) {
  const pool = [...(BY_ROOM[roomId] ?? []), ...GENERIC]
  const picks = []
  const used = new Set()

  while (picks.length < count && used.size < pool.length) {
    const line = pool[Math.floor(Math.random() * pool.length)]
    if (used.has(line)) continue
    used.add(line)
    picks.push(line)
  }

  return picks
}
