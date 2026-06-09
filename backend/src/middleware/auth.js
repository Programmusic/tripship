import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'tripship-dev-secret-change-in-production'

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireDj(req, res, next) {
  if (req.user?.role !== 'dj') {
    return res.status(403).json({ error: 'DJ role required to post mixes' })
  }
  next()
}
