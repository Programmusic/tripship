import { Router } from 'express'
import { getDb } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function formatMemory(row) {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name || row.display_name,
    title: row.title,
    content: row.content,
    eventYear: row.event_year,
    location: row.location,
    createdAt: row.created_at,
  }
}

router.get('/', async (req, res) => {
  const db = await getDb()

  const sql = db.type === 'postgres'
    ? `SELECT m.*, u.display_name AS author_name
       FROM memories m JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC`
    : `SELECT m.*, u.display_name AS author_name
       FROM memories m JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC`

  let rows
  if (db.type === 'postgres') {
    const result = await db.query(sql)
    rows = result.rows
  } else {
    rows = db.prepare(sql).all()
  }

  res.json(rows.map(formatMemory))
})

router.post('/', requireAuth, async (req, res) => {
  const { title, content, eventYear, location } = req.body

  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: 'Title and content are required' })
  }

  const db = await getDb()

  try {
    let memory

    if (db.type === 'postgres') {
      const result = await db.query(
        `INSERT INTO memories (user_id, title, content, event_year, location)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.id, title.trim(), content.trim(), eventYear || null, location || null]
      )
      const userResult = await db.query('SELECT display_name FROM users WHERE id = $1', [req.user.id])
      memory = { ...result.rows[0], author_name: userResult.rows[0].display_name }
    } else {
      const result = await db.query(
        `INSERT INTO memories (user_id, title, content, event_year, location)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, title.trim(), content.trim(), eventYear || null, location || null]
      )
      memory = db.prepare(
        `SELECT m.*, u.display_name AS author_name
         FROM memories m JOIN users u ON m.user_id = u.id WHERE m.id = ?`
      ).get(result.lastInsertRowid)
    }

    res.status(201).json(formatMemory(memory))
  } catch (err) {
    console.error('Memory create error:', err)
    res.status(500).json({ error: 'Failed to create memory' })
  }
})

export default router
