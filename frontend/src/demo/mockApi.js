import { demoUser, mockMemories, mockMixes } from './mockData.js'

let memories = [...mockMemories]
let mixes = [...mockMixes]
let nextMemoryId = memories.length + 1
let nextMixId = mixes.length + 1

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockRequest(method, url, data) {
  await delay()

  if (method === 'GET' && url === '/memories') return [...memories]
  if (method === 'GET' && url === '/mixes') return [...mixes]

  if (method === 'POST' && url === '/auth/login') {
    return { token: 'demo-token', user: demoUser }
  }

  if (method === 'POST' && url === '/auth/register') {
    return {
      token: 'demo-token',
      user: { ...demoUser, ...data, id: 99, displayName: data.displayName, role: data.role || 'member' },
    }
  }

  if (method === 'POST' && url === '/memories') {
    const memory = {
      id: nextMemoryId++,
      authorName: demoUser.displayName,
      title: data.title,
      content: data.content,
      eventYear: data.eventYear || null,
      location: data.location || null,
      createdAt: new Date().toISOString(),
    }
    memories = [memory, ...memories]
    return memory
  }

  if (method === 'POST' && url === '/mixes') {
    const mix = {
      id: nextMixId++,
      djName: demoUser.displayName,
      title: data.title || data.get?.('title'),
      description: data.description || data.get?.('description') || null,
      genre: data.genre || data.get?.('genre') || null,
      duration: data.duration || data.get?.('duration') || null,
      audioUrl: data.audioUrl || data.get?.('audioUrl') || '#',
      createdAt: new Date().toISOString(),
    }
    mixes = [mix, ...mixes]
    return mix
  }

  throw { response: { data: { error: 'Demo endpoint not found' }, status: 404 } }
}
