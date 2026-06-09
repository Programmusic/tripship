import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getDb } from '../db/index.js'
import { requireAuth, requireDj } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isVercel = !!process.env.VERCEL
const uploadsDir = path.join(__dirname, '../../uploads')

if (!isVercel && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: uploadsDir,
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
        cb(null, `${unique}${path.extname(file.originalname)}`)
      },
    })

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      cb(null, true)
    } else {
      cb(new Error('Only audio files are allowed'))
    }
  },
})

const router = Router()

function formatMix(row) {
  let audioUrl = row.audio_url
  if (!audioUrl && row.audio_path) {
    audioUrl = row.audio_path.startsWith('http')
      ? row.audio_path
      : `/uploads/${path.basename(row.audio_path)}`
  }
  return {
    id: row.id,
    userId: row.user_id,
    djName: row.dj_name || row.display_name,
    title: row.title,
    description: row.description,
    genre: row.genre,
    duration: row.duration,
    audioUrl,
    createdAt: row.created_at,
  }
}

async function storeAudioFile(file) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob')
    const filename = `mixes/${Date.now()}-${file.originalname}`
    const blob = await put(filename, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { url: blob.url, path: null }
  }

  if (isVercel) {
    throw new Error('File uploads on Vercel require BLOB_READ_WRITE_TOKEN. Link an audio URL instead, or add Vercel Blob storage.')
  }

  return { url: null, path: file.path }
}

router.get('/', async (req, res) => {
  const db = await getDb()

  const sql = `SELECT m.*, u.display_name AS dj_name
    FROM mixes m JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC`

  let rows
  if (db.type === 'postgres') {
    const result = await db.query(sql)
    rows = result.rows
  } else {
    rows = db.prepare(sql).all()
  }

  res.json(rows.map(formatMix))
})

router.post('/', requireAuth, requireDj, upload.single('audio'), async (req, res) => {
  const { title, description, genre, duration, audioUrl } = req.body

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Mix title is required' })
  }

  let storedUrl = audioUrl?.trim() || null
  let audioPath = null

  if (req.file) {
    try {
      const stored = await storeAudioFile(req.file)
      storedUrl = stored.url || storedUrl
      audioPath = stored.path
    } catch (err) {
      return res.status(400).json({ error: err.message })
    }
  }

  if (!storedUrl && !audioPath) {
    return res.status(400).json({ error: 'Provide an audio file or URL' })
  }

  const db = await getDb()

  try {
    let mix

    if (db.type === 'postgres') {
      const result = await db.query(
        `INSERT INTO mixes (user_id, title, description, genre, duration, audio_url, audio_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.user.id, title.trim(), description || null, genre || null, duration || null, storedUrl, audioPath]
      )
      const userResult = await db.query('SELECT display_name FROM users WHERE id = $1', [req.user.id])
      mix = { ...result.rows[0], dj_name: userResult.rows[0].display_name }
    } else {
      const result = await db.query(
        `INSERT INTO mixes (user_id, title, description, genre, duration, audio_url, audio_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, title.trim(), description || null, genre || null, duration || null, storedUrl, audioPath]
      )
      mix = db.prepare(
        `SELECT m.*, u.display_name AS dj_name
         FROM mixes m JOIN users u ON m.user_id = u.id WHERE m.id = ?`
      ).get(result.lastInsertRowid)
    }

    res.status(201).json(formatMix(mix))
  } catch (err) {
    console.error('Mix create error:', err)
    res.status(500).json({ error: 'Failed to post mix' })
  }
})

export default router
