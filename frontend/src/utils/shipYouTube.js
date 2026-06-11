import {
  preloadYoutubePlayer,
  startYoutubeAudio,
  isYoutubePlaying,
  pauseYoutubeAudio,
  stopYoutubeAudio,
  destroyYoutubePlayer,
} from './youtubePlayer.js'

const KEY = 'ship'

/** Random rotation for main galleon / orbit ship view */
export const SHIP_TRACKS = [
  { id: 'YANW7wef-po', label: 'Trip Ship fly-through' },
  { id: 'MwmChAlXwyI', label: 'Cosmic voyage' },
]

/** @deprecated use SHIP_TRACKS */
export const SHIP_YOUTUBE_ID = SHIP_TRACKS[0].id

let activeShipTrackId = null

export function pickRandomShipTrack() {
  if (SHIP_TRACKS.length === 0) return null
  if (SHIP_TRACKS.length === 1) return SHIP_TRACKS[0]

  const pool = activeShipTrackId
    ? SHIP_TRACKS.filter((t) => t.id !== activeShipTrackId)
    : SHIP_TRACKS

  return pool[Math.floor(Math.random() * pool.length)]
}

export function getActiveShipTrack() {
  return SHIP_TRACKS.find((t) => t.id === activeShipTrackId) ?? null
}

export async function preloadShipPlayer(videoId = activeShipTrackId ?? pickRandomShipTrack()?.id) {
  if (!videoId) return null
  return preloadYoutubePlayer(KEY, videoId)
}

export async function startShipAudio(volume = 60, { newTrack = true } = {}) {
  const track = newTrack ? pickRandomShipTrack() : SHIP_TRACKS.find((t) => t.id === activeShipTrackId) ?? pickRandomShipTrack()
  if (!track) return null

  activeShipTrackId = track.id
  return startYoutubeAudio(KEY, track.id, volume)
}

export function isShipAudioPlaying() {
  return isYoutubePlaying(KEY)
}

export function pauseShipAudio() {
  pauseYoutubeAudio(KEY)
}

export function stopShipAudio() {
  stopYoutubeAudio(KEY)
}

export function destroyShipPlayer() {
  activeShipTrackId = null
  destroyYoutubePlayer(KEY)
}
