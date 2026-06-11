import {
  DECK_YOUTUBE_ID,
  preloadYoutubePlayer,
  startYoutubeAudio,
  isYoutubePlaying,
  pauseYoutubeAudio,
  stopYoutubeAudio,
  destroyYoutubePlayer,
} from './youtubePlayer.js'

const KEY = 'deck'

export { DECK_YOUTUBE_ID }

export function preloadDeckPlayer() {
  return preloadYoutubePlayer(KEY, DECK_YOUTUBE_ID)
}

export function startDeckAudio(volume = 65) {
  return startYoutubeAudio(KEY, DECK_YOUTUBE_ID, volume)
}

export function isDeckAudioPlaying() {
  return isYoutubePlaying(KEY)
}

export function pauseDeckAudio() {
  pauseYoutubeAudio(KEY)
}

export function stopDeckAudio() {
  stopYoutubeAudio(KEY)
}

export function destroyDeckPlayer() {
  destroyYoutubePlayer(KEY)
}
