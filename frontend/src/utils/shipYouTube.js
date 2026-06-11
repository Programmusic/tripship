import {
  SHIP_YOUTUBE_ID,
  preloadYoutubePlayer,
  startYoutubeAudio,
  isYoutubePlaying,
  pauseYoutubeAudio,
  stopYoutubeAudio,
  destroyYoutubePlayer,
} from './youtubePlayer.js'

const KEY = 'ship'

export { SHIP_YOUTUBE_ID }

export function preloadShipPlayer() {
  return preloadYoutubePlayer(KEY, SHIP_YOUTUBE_ID)
}

export function startShipAudio(volume = 60) {
  return startYoutubeAudio(KEY, SHIP_YOUTUBE_ID, volume)
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
  destroyYoutubePlayer(KEY)
}
