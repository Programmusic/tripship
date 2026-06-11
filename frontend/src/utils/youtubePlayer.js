/** Main galleon fly-through — https://youtu.be/YANW7wef-po */
export const SHIP_YOUTUBE_ID = 'YANW7wef-po'

/** Deck Sessions set — https://youtu.be/WF6TMVkPg2k */
export const DECK_YOUTUBE_ID = 'WF6TMVkPg2k'

/** Arrrrrtifacts vault — https://youtu.be/RkfwoAr-zPI */
export const ARTIFACTS_YOUTUBE_ID = 'RkfwoAr-zPI'

const PLAYERS = new Map()
let apiPromise = null

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

function createHost(key) {
  const host = document.createElement('div')
  host.id = `youtube-host-${key}`
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = [
    'position:fixed',
    'width:1px',
    'height:1px',
    'opacity:0',
    'pointer-events:none',
    'bottom:0',
    'left:0',
    'overflow:hidden',
  ].join(';')
  document.body.appendChild(host)
  return host
}

export async function preloadYoutubePlayer(key, videoId) {
  await loadYouTubeApi()
  const entry = PLAYERS.get(key)
  if (entry?.instance?.getPlayerState) return entry.instance
  if (entry?.loading) return entry.loading

  const host = entry?.host ?? createHost(key)
  const loading = new Promise((resolve) => {
    new window.YT.Player(host, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        loop: 1,
        playlist: videoId,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          PLAYERS.set(key, { instance: event.target, host, videoId })
          resolve(event.target)
        },
      },
    })
  })

  PLAYERS.set(key, { host, videoId, loading })
  return loading
}

export async function startYoutubeAudio(key, videoId, volume = 65) {
  const player = await preloadYoutubePlayer(key, videoId)
  player.unMute()
  player.setVolume(volume)
  player.playVideo()
  return player
}

export function isYoutubePlaying(key) {
  const player = PLAYERS.get(key)?.instance
  if (!player?.getPlayerState) return false
  return player.getPlayerState() === window.YT.PlayerState.PLAYING
}

export function pauseYoutubeAudio(key) {
  PLAYERS.get(key)?.instance?.pauseVideo?.()
}

export function stopYoutubeAudio(key) {
  PLAYERS.get(key)?.instance?.stopVideo?.()
}

export function destroyYoutubePlayer(key) {
  const entry = PLAYERS.get(key)
  if (!entry) return
  entry.instance?.stopVideo?.()
  entry.instance?.destroy?.()
  entry.host?.remove()
  PLAYERS.delete(key)
}

export function destroyAllYoutubePlayers() {
  ;[...PLAYERS.keys()].forEach(destroyYoutubePlayer)
}
