import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listLatticeProfiles,
  getLatticeProfile,
  getProfileForUser,
  updateLatticeProfile,
} from '../services/latticeProfiles.js'

const router = Router()

const EDITABLE_FIELDS = ['name', 'role', 'signal', 'bio', 'color', 'avatarUrl']

router.get('/profiles', async (_req, res) => {
  try {
    const profiles = await listLatticeProfiles()
    res.json(profiles)
  } catch (err) {
    console.error('List lattice profiles error:', err)
    res.status(500).json({ error: 'Failed to load lattice profiles' })
  }
})

router.get('/profiles/:latticeId', async (req, res) => {
  try {
    const profile = await getLatticeProfile(req.params.latticeId)
    if (!profile) return res.status(404).json({ error: 'Lattice profile not found' })
    res.json(profile)
  } catch (err) {
    console.error('Get lattice profile error:', err)
    res.status(500).json({ error: 'Failed to load lattice profile' })
  }
})

router.get('/profile/me', requireAuth, async (req, res) => {
  try {
    const profile = await getProfileForUser(req.user.id, req.user.username)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    res.json(profile)
  } catch (err) {
    console.error('Get my profile error:', err)
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

router.patch('/profile/me', requireAuth, async (req, res) => {
  try {
    const profile = await getProfileForUser(req.user.id, req.user.username)
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const patch = {}
    for (const key of EDITABLE_FIELDS) {
      if (req.body[key] !== undefined) patch[key] = req.body[key]
    }

    if (patch.name !== undefined && !String(patch.name).trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' })
    }

    const updated = await updateLatticeProfile(profile.latticeId, patch)
    res.json(updated)
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
