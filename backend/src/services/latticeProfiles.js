import { getDb } from '../db/index.js'
import { CORE_CREW_SEED } from '../data/coreCrewSeed.js'
import { getFirestore, isFirestoreEnabled, LATTICE_PROFILES_COLLECTION } from '../firestore/client.js'

function nowIso() {
  return new Date().toISOString()
}

export function formatProfile(row) {
  return {
    latticeId: row.lattice_id ?? row.latticeId,
    userId: row.user_id ?? row.userId ?? null,
    name: row.name,
    role: row.role || 'Lattice Mate',
    signal: row.signal || '',
    bio: row.bio || '',
    color: row.color || '#00ffcc',
    avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
    isCoreCrew: !!(row.is_core_crew ?? row.isCoreCrew),
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  }
}

function docToProfile(doc) {
  const data = doc.data()
  return formatProfile({ latticeId: doc.id, ...data })
}

async function seedSqlProfiles(db) {
  for (const seed of CORE_CREW_SEED) {
    const existing = db.prepare('SELECT lattice_id FROM lattice_profiles WHERE lattice_id = ?').get(seed.latticeId)
    if (existing) continue
    db.prepare(`
      INSERT INTO lattice_profiles (lattice_id, name, role, signal, bio, color, is_core_crew, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(seed.latticeId, seed.name, seed.role, seed.signal, seed.bio, seed.color, nowIso())
  }
}

async function seedPostgresProfiles(db) {
  for (const seed of CORE_CREW_SEED) {
    await db.query(
      `INSERT INTO lattice_profiles (lattice_id, name, role, signal, bio, color, is_core_crew, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7)
       ON CONFLICT (lattice_id) DO NOTHING`,
      [seed.latticeId, seed.name, seed.role, seed.signal, seed.bio, seed.color, nowIso()]
    )
  }
}

async function seedFirestoreProfiles(fs) {
  const batch = fs.batch()
  let writes = 0
  for (const seed of CORE_CREW_SEED) {
    const ref = fs.collection(LATTICE_PROFILES_COLLECTION).doc(seed.latticeId)
    const snap = await ref.get()
    if (snap.exists) continue
    batch.set(ref, {
      userId: null,
      name: seed.name,
      role: seed.role,
      signal: seed.signal,
      bio: seed.bio,
      color: seed.color,
      avatarUrl: null,
      isCoreCrew: true,
      updatedAt: nowIso(),
    })
    writes++
  }
  if (writes) await batch.commit()
}

export async function ensureLatticeProfilesSeeded() {
  if (isFirestoreEnabled()) {
    const fs = getFirestore()
    await seedFirestoreProfiles(fs)
    return
  }

  const db = await getDb()
  if (db.type === 'postgres') {
    await seedPostgresProfiles(db)
  } else {
    await seedSqlProfiles(db)
  }
}

async function listFromFirestore() {
  const fs = getFirestore()
  const snap = await fs.collection(LATTICE_PROFILES_COLLECTION).get()
  return snap.docs.map(docToProfile)
}

async function getFromFirestore(latticeId) {
  const fs = getFirestore()
  const doc = await fs.collection(LATTICE_PROFILES_COLLECTION).doc(latticeId).get()
  if (!doc.exists) return null
  return docToProfile(doc)
}

async function getByUserFromFirestore(userId, username) {
  const fs = getFirestore()
  const byId = await fs.collection(LATTICE_PROFILES_COLLECTION).where('userId', '==', userId).limit(1).get()
  if (!byId.empty) return docToProfile(byId.docs[0])
  return getFromFirestore(username)
}

async function updateFirestore(latticeId, patch) {
  const fs = getFirestore()
  const ref = fs.collection(LATTICE_PROFILES_COLLECTION).doc(latticeId)
  const snap = await ref.get()
  if (!snap.exists) return null
  const updated = { ...patch, updatedAt: nowIso() }
  await ref.update(updated)
  return docToProfile(await ref.get())
}

async function linkUserFirestore(latticeId, userId) {
  const fs = getFirestore()
  const ref = fs.collection(LATTICE_PROFILES_COLLECTION).doc(latticeId)
  const snap = await ref.get()
  if (!snap.exists) return null
  await ref.update({ userId, updatedAt: nowIso() })
  return docToProfile(await ref.get())
}

async function createFirestore(profile) {
  const fs = getFirestore()
  const ref = fs.collection(LATTICE_PROFILES_COLLECTION).doc(profile.latticeId)
  const data = {
    userId: profile.userId ?? null,
    name: profile.name,
    role: profile.role || 'Lattice Mate',
    signal: profile.signal || '',
    bio: profile.bio || '',
    color: profile.color || '#00ffcc',
    avatarUrl: profile.avatarUrl ?? null,
    isCoreCrew: !!profile.isCoreCrew,
    updatedAt: nowIso(),
  }
  await ref.set(data, { merge: true })
  return docToProfile(await ref.get())
}

async function listFromSql() {
  const db = await getDb()
  if (db.type === 'postgres') {
    const result = await db.query('SELECT * FROM lattice_profiles ORDER BY lattice_id')
    return result.rows.map(formatProfile)
  }
  return db.prepare('SELECT * FROM lattice_profiles ORDER BY lattice_id').all().map(formatProfile)
}

async function getFromSql(latticeId) {
  const db = await getDb()
  if (db.type === 'postgres') {
    const result = await db.query('SELECT * FROM lattice_profiles WHERE lattice_id = $1', [latticeId])
    return result.rows[0] ? formatProfile(result.rows[0]) : null
  }
  const row = db.prepare('SELECT * FROM lattice_profiles WHERE lattice_id = ?').get(latticeId)
  return row ? formatProfile(row) : null
}

async function getByUserFromSql(userId, username) {
  const db = await getDb()
  if (db.type === 'postgres') {
    const byUser = await db.query('SELECT * FROM lattice_profiles WHERE user_id = $1 LIMIT 1', [userId])
    if (byUser.rows[0]) return formatProfile(byUser.rows[0])
    const byLattice = await db.query('SELECT * FROM lattice_profiles WHERE lattice_id = $1', [username])
    return byLattice.rows[0] ? formatProfile(byLattice.rows[0]) : null
  }
  const byUser = db.prepare('SELECT * FROM lattice_profiles WHERE user_id = ?').get(userId)
  if (byUser) return formatProfile(byUser)
  const byLattice = db.prepare('SELECT * FROM lattice_profiles WHERE lattice_id = ?').get(username)
  return byLattice ? formatProfile(byLattice) : null
}

async function updateSql(latticeId, patch) {
  const db = await getDb()
  const map = {
    name: patch.name,
    role: patch.role,
    signal: patch.signal,
    bio: patch.bio,
    color: patch.color,
    avatar_url: patch.avatarUrl,
  }

  const entries = Object.entries(map).filter(([, v]) => v !== undefined)
  if (!entries.length) return getFromSql(latticeId)

  if (db.type === 'postgres') {
    const sets = entries.map(([col], i) => `${col} = $${i + 1}`)
    sets.push(`updated_at = $${entries.length + 1}`)
    const values = [...entries.map(([, v]) => v), nowIso(), latticeId]
    await db.query(
      `UPDATE lattice_profiles SET ${sets.join(', ')} WHERE lattice_id = $${values.length}`,
      values
    )
  } else {
    const sets = entries.map(([col]) => `${col} = ?`)
    sets.push('updated_at = ?')
    const values = [...entries.map(([, v]) => v), nowIso(), latticeId]
    db.prepare(`UPDATE lattice_profiles SET ${sets.join(', ')} WHERE lattice_id = ?`).run(...values)
  }

  return getFromSql(latticeId)
}

async function linkUserSql(latticeId, userId) {
  const db = await getDb()
  if (db.type === 'postgres') {
    await db.query('UPDATE lattice_profiles SET user_id = $1, updated_at = $2 WHERE lattice_id = $3', [userId, nowIso(), latticeId])
  } else {
    db.prepare('UPDATE lattice_profiles SET user_id = ?, updated_at = ? WHERE lattice_id = ?').run(userId, nowIso(), latticeId)
  }
  return getFromSql(latticeId)
}

async function createSql(profile) {
  const db = await getDb()
  const row = {
    lattice_id: profile.latticeId,
    user_id: profile.userId ?? null,
    name: profile.name,
    role: profile.role || 'Lattice Mate',
    signal: profile.signal || '',
    bio: profile.bio || '',
    color: profile.color || '#00ffcc',
    avatar_url: profile.avatarUrl ?? null,
    is_core_crew: profile.isCoreCrew ? 1 : 0,
    updated_at: nowIso(),
  }

  if (db.type === 'postgres') {
    await db.query(
      `INSERT INTO lattice_profiles (lattice_id, user_id, name, role, signal, bio, color, avatar_url, is_core_crew, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (lattice_id) DO UPDATE SET
         user_id = COALESCE(EXCLUDED.user_id, lattice_profiles.user_id),
         name = EXCLUDED.name,
         updated_at = EXCLUDED.updated_at`,
      [row.lattice_id, row.user_id, row.name, row.role, row.signal, row.bio, row.color, row.avatar_url, !!profile.isCoreCrew, row.updated_at]
    )
  } else {
    db.prepare(`
      INSERT INTO lattice_profiles (lattice_id, user_id, name, role, signal, bio, color, avatar_url, is_core_crew, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(lattice_id) DO UPDATE SET
        user_id = COALESCE(excluded.user_id, user_id),
        name = excluded.name,
        updated_at = excluded.updated_at
    `).run(row.lattice_id, row.user_id, row.name, row.role, row.signal, row.bio, row.color, row.avatar_url, row.is_core_crew, row.updated_at)
  }

  return getFromSql(profile.latticeId)
}

export async function listLatticeProfiles() {
  if (isFirestoreEnabled()) return listFromFirestore()
  return listFromSql()
}

export async function getLatticeProfile(latticeId) {
  if (isFirestoreEnabled()) return getFromFirestore(latticeId)
  return getFromSql(latticeId)
}

export async function getProfileForUser(userId, username) {
  if (isFirestoreEnabled()) return getByUserFromFirestore(userId, username)
  return getByUserFromSql(userId, username)
}

export async function updateLatticeProfile(latticeId, patch) {
  if (isFirestoreEnabled()) return updateFirestore(latticeId, patch)
  return updateSql(latticeId, patch)
}

export async function linkProfileToUser(latticeId, userId) {
  if (isFirestoreEnabled()) return linkUserFirestore(latticeId, userId)
  return linkUserSql(latticeId, userId)
}

export async function createLatticeProfile(profile) {
  if (isFirestoreEnabled()) return createFirestore(profile)
  return createSql(profile)
}

export async function ensureProfileForUser(user) {
  const existing = await getProfileForUser(user.id, user.username)
  if (existing) {
    if (!existing.userId) {
      return linkProfileToUser(existing.latticeId, user.id)
    }
    return existing
  }

  return createLatticeProfile({
    latticeId: user.username,
    userId: user.id,
    name: user.displayName || user.username,
    role: 'Lattice Mate',
    signal: `${user.displayName || user.username} on the equal lattice.`,
    bio: '',
    color: '#00ffcc',
    isCoreCrew: false,
  })
}
