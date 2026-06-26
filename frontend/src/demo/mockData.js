export const demoUser = {
  id: 1,
  username: 'captain_flystyle',
  email: 'flystyle@tripship.com',
  displayName: 'Captain Flystyle',
  role: 'dj',
  invitesRemaining: 3,
  createdAt: '1994-08-12T00:00:00.000Z',
}

export const mockMemories = []

export const mockMixes = [
  {
    id: 1,
    djName: 'Captain Flystyle',
    title: 'Jungle Pressure Vol. VII',
    description: 'Full power amen session. Plundered from the vault — Roni Size, LTJ Bukem, Dillinja, and exclusive dubplates.',
    genre: 'Jungle / D&B',
    duration: '68 min',
    audioUrl: '#',
    createdAt: '2024-12-01T20:00:00.000Z',
  },
  {
    id: 2,
    djName: 'Dubplate Dan',
    title: 'Roots & Culture Voyage',
    description: 'Deep dub and steppers for the sound system purists. Jah Shaka vibes through a 90s spyglass.',
    genre: 'Dub / Reggae',
    duration: '74 min',
    audioUrl: '#',
    createdAt: '2024-11-15T18:30:00.000Z',
  },
  {
    id: 3,
    djName: 'Garage Queen',
    title: '2-Step Midnight Watch',
    description: 'UK garage from \'98-\'99. Vocal cuts, swing beats, bass that rolls like waves.',
    genre: 'UK Garage',
    duration: '55 min',
    audioUrl: '#',
    createdAt: '2024-10-28T23:00:00.000Z',
  },
]

export const mockArtifacts = [
  {
    id: 1,
    title: 'WAREHOUSE RAVE',
    eventName: 'Trip Ship New Year Plunder',
    year: '1996',
    type: 'Flier',
    color: 'linear-gradient(135deg, #1a0a2e, #ff00ff33)',
    description: 'Original photocopied flier. Stolen from a Bristol telephone pole, 1995.',
    createdAt: '1996-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'SOUND CLASH',
    eventName: 'Notting Hill Carnival',
    year: '1995',
    type: 'Poster',
    color: 'linear-gradient(135deg, #0a1a2e, #00ffcc33)',
    description: 'Hand-drawn skull and crossbones with sound system specs on the back.',
    createdAt: '1995-08-01T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'FREE PARTY',
    eventName: 'Hackney Wick Dock',
    year: '1993',
    type: 'Flier',
    color: 'linear-gradient(135deg, #2e1a0a, #c9a22733)',
    description: 'Word-of-mouth only. No address — just coordinates and a time.',
    createdAt: '1993-06-15T00:00:00.000Z',
  },
  {
    id: 4,
    title: 'JUNGLE PRESSURE',
    eventName: 'Trip Ship Boat Party',
    year: '1997',
    type: 'Ticket',
    color: 'linear-gradient(135deg, #0a0a1a, #9d4edd44)',
    description: 'Rare ticket stub from the legendary river session. Never scanned, only whispered.',
    createdAt: '1997-07-04T00:00:00.000Z',
  },
]

export const CAPTAIN_LOG_WELCOME_SLUG = 'welcome-aboard-me-hearties'

export const mockBlogPosts = [
  {
    id: 1,
    slug: CAPTAIN_LOG_WELCOME_SLUG,
    title: 'Welcome Aboard, Me Hearties!',
    excerpt: 'Ye found the ship. Good. Captain Flystyle welcomes ye to Trip Ship — unsocial media for the crew who were actually there.',
    featured: true,
    content: `Ahoy me hearties,

**Welcome aboard the Trip Ship.**

If ye be readin' this, yer name made **The List** — or someone vouched for ye. Either way, ye're family now. No algorithms. No randos. No landlubbers scrollin' through yer memories. Just the crew.

**What be aboard:**
- **Arrrrrtifacts** — old fliers, posters & buried rave treasure from back in the day
- **Memory Hold** — spin yer yarn about the warehouse, the carnival, the free party
- **Deck Sessions** — bass, bins & mixes rigged to the masts
- **The List** — invite yer mates. If their name ain't here, they ain't boardin'

This log be where I scribble what's happenin' now — voyages, orders, and the odd rant from the helm. Read it. Share it. Don't spill it to the press.

We built this for the ones who remember when the subs hit and the whole deck bounced. The sound system family.

**Welcome aboard, me hearties. Stay seaworthy.**

**Captain Flystyle** ☠`,
    createdAt: '2026-06-09T12:00:00.000Z',
  },
  {
    id: 4,
    slug: 'welcome-aboard-unsocial-media',
    title: 'Unsocial Media — What That Means',
    excerpt: 'This ain\'t Facebook, matey. Trip Ship be invite-only. Yer mate puts yer name on the list or ye swim home.',
    content: `Ahoy crew,

So ye found the ship. Good. This be **Unsocial Media** — no algorithms, no ads, no randos slitherin' aboard.

**The rules be simple:**
- If yer name ain't on **The List**, ye ain't comin' in
- Crew invite crew — mates from back in the day only
- Share memories, post mixes, browse the **Arrrrrtifacts**
- The **Captain's Cabin** be where Captain Flystyle scribbles the log

We built this for the family. The ones who were there when the bass bins shook the warehouse.

Stay seaworthy,
**Captain Flystyle** ☠`,
    createdAt: '2024-12-01T10:00:00.000Z',
  },
  {
    id: 2,
    slug: 'next-voyage-bristol',
    title: 'Next Voyage: Bristol Bound',
    excerpt: 'The ship sets sail for the West Country. Stackin\' the riggin\' and loadin\' the dubplates. Who\'s aboard?',
    content: `Crew,

Bristol be callin'. We\'re loadin\' the van — I mean, the galleon — with fresh pressure.

If ye were at the \'96 warehouse session, ye know what\'s comin'. If ye weren\'t... get yerself on **The List**.

More soon in the Captain's Log.

**Captain Flystyle**`,
    createdAt: '2024-11-20T18:00:00.000Z',
  },
  {
    id: 3,
    slug: 'aaaarrifacts-vault-opens',
    title: 'The Arrrrrtifacts Vault Be Open',
    excerpt: 'Old fliers, posters, tickets — buried treasure from the dancefloor. Upload yer loot, me hearties.',
    content: `Me hearties,

The **Arrrrrtifacts** section be live. Dig out them old fliers from yer mum's attic.

Photograph 'em. Upload 'em. Tell the story.

This be our museum. No curators. Just crew.

**Captain Flystyle**`,
    createdAt: '2024-11-10T12:00:00.000Z',
  },
]

export const mockInvites = []
