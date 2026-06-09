import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db/index.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

function formatUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    createdAt: row.created_at,
  }
}

router.post('/register', async (req, res) => {
  const { username, email, password, displayName, role } = req.body

  if (!username || !email || !password || !displayName) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const validRole = role === 'dj' ? 'dj' : 'member'
  const db = await getDb()
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    let user

    if (db.type === 'postgres') {
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, display_name, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [username.toLowerCase(), email.toLowerCase(), passwordHash, displayName, validRole]
      )
      user = result.rows[0]
    } else {
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, display_name, role)
         VALUES (?, ?, ?, ?, ?)`,
        [username.toLowerCase(), email.toLowerCase(), passwordHash, displayName, validRole]
      )
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
    }

    const token = signToken(user)
    res.status(201).json({ token, user: formatUser(user) })
  } catch (err) {
    if (err.message?.includes('UNIQUE') || err.code === '23505') {
      return res.status(409).json({ error: 'Username or email already exists' })
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const db = await getDb()
  let user

  if (db.type === 'postgres') {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username.toLowerCase()])
    user = result.rows[0]
  } else {
    user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase())
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signToken(user)
  res.json({ token, user: formatUser(user) })
})

export default router
