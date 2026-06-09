import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { getDb } from './db/index.js'
import authRoutes from './routes/auth.js'
import memoriesRoutes from './routes/memories.js'
import mixesRoutes from './routes/mixes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function createApp() {
  await getDb()

  const app = express()

  app.use(cors())
  app.use(express.json())

  const uploadsDir = path.join(__dirname, '../uploads')
  if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  if (!process.env.VERCEL) {
    app.use('/uploads', express.static(uploadsDir))
  }

  app.use('/api/auth', authRoutes)
  app.use('/api/memories', memoriesRoutes)
  app.use('/api/mixes', mixesRoutes)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'tripship-api' })
  })

  const frontendDist = path.join(__dirname, '../../frontend/dist')
  if (!process.env.VERCEL && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
      res.sendFile(path.join(frontendDist, 'index.html'))
    })
  }

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  })

  return app
}
