import {
  ARTIFACTS_YOUTUBE_ID,
  preloadYoutubePlayer,
  startYoutubeAudio,
  isYoutubePlaying,
  pauseYoutubeAudio,
  stopYoutubeAudio,
  destroyYoutubePlayer,
} from './youtubePlayer.js'

const KEY = 'artifacts'

export { ARTIFACTS_YOUTUBE_ID }

export function preloadArtifactsPlayer() {
  return preloadYoutubePlayer(KEY, ARTIFACTS_YOUTUBE_ID)
}

export function startArtifactsAudio(volume = 65) {
  return startYoutubeAudio(KEY, ARTIFACTS_YOUTUBE_ID, volume)
}

export function isArtifactsAudioPlaying() {
  return isYoutubePlaying(KEY)
}

export function pauseArtifactsAudio() {
  pauseYoutubeAudio(KEY)
}

export function stopArtifactsAudio() {
  stopYoutubeAudio(KEY)
}

export function destroyArtifactsPlayer() {
  destroyYoutubePlayer(KEY)
}
