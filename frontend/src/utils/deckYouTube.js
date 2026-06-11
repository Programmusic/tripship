/** Deck Sessions ambient set — https://youtu.be/WF6TMVkPg2k */
export const DECK_YOUTUBE_ID = 'WF6TMVkPg2k'

let apiPromise = null
let player = null
let hostEl = null

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })

  return apiPromise
}

function getHost() {
  if (hostEl) return hostEl
  hostEl = document.createElement('div')
  hostEl.id = 'deck-youtube-host'
  hostEl.setAttribute('aria-hidden', 'true')
  hostEl.style.cssText = [
    'position:fixed',
    'width:1px',
    'height:1px',
    'opacity:0',
    'pointer-events:none',
    'bottom:0',
    'left:0',
    'overflow:hidden',
  ].join(';')
  document.body.appendChild(hostEl)
  return hostEl
}

export async function preloadDeckPlayer() {
  await loadYouTubeApi()
  if (player) return player

  return new Promise((resolve) => {
    player = new window.YT.Player(getHost(), {
      videoId: DECK_YOUTUBE_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        loop: 1,
        playlist: DECK_YOUTUBE_ID,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => resolve(event.target),
      },
    })
  })
}

export async function startDeckAudio(volume = 65) {
  const p = await preloadDeckPlayer()
  p.unMute()
  p.setVolume(volume)
  p.playVideo()
  return p
}

export function isDeckAudioPlaying() {
  if (!player?.getPlayerState) return false
  return player.getPlayerState() === window.YT.PlayerState.PLAYING
}

export function pauseDeckAudio() {
  player?.pauseVideo?.()
}

export function stopDeckAudio() {
  player?.stopVideo?.()
}

export function destroyDeckPlayer() {
  stopDeckAudio()
  player?.destroy?.()
  player = null
  hostEl?.remove()
  hostEl = null
}
