import { state, emit } from './state.js';

const VIDEO_ID = 'WO7qdqdXeBU';
const TRACK_TITLE = 'PHONECERT · Hoàng Dũng (Vietnamese Version)';
export function createMusic() {
  const panel = document.querySelector('#music-panel');
  const button = document.querySelector('#music-toggle');
  const status = document.querySelector('#music-status');
  const close = document.querySelector('#music-close');
  let player, ready = false, requested = true, userPaused = false, blockedTimer;

  function setPlaying(playing) {
    state.soundEnabled = playing;
    button.setAttribute('aria-pressed', String(playing));
    button.classList.toggle('is-playing', playing);
    button.querySelector('.music-label').textContent = playing ? 'Đang phát nhạc' : 'Bật nhạc';
    document.querySelector('.equalizer').classList.toggle('active', playing);
    emit('music', playing);
  }
  function hint() {
    if (!state.soundEnabled && !userPaused) status.textContent = 'Chạm ▶ trong video nếu nhạc chưa phát nhé.';
  }
  function start({ fromGift = false } = {}) {
    if (fromGift && userPaused) return;
    userPaused = false;
    requested = true;
    panel.hidden = false;
    document.body.classList.add('music-visible');
    if (ready) {
      player.unMute();
      player.setVolume(38);
      player.playVideo();
      clearTimeout(blockedTimer);
      blockedTimer = setTimeout(hint, 3000);
    } else {
      status.textContent = 'Đang mở bài hát…';
    }
  }
  function pause(hide = false) {
    requested = false;
    userPaused = true;
    if (ready) player.pauseVideo();
    setPlaying(false);
    if (hide) {
      panel.hidden = true;
      document.body.classList.remove('music-visible');
    }
    status.textContent = 'Nhạc đang tạm dừng.';
  }

  button.addEventListener('click', () => state.soundEnabled ? pause(true) : start());
  close.addEventListener('click', () => pause(true));

  function initialize() {
    player = new YT.Player('youtube-player', {
      width: '100%', height: '200', videoId: VIDEO_ID,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, playsinline: 1, controls: 1, rel: 0, loop: 1, playlist: VIDEO_ID, origin: location.origin },
      events: {
        onReady() {
          ready = true;
          const frame = player.getIframe();
          frame.title = TRACK_TITLE;
          frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
          frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          if (requested) start();
        },
        onStateChange(event) {
          if (event.data === YT.PlayerState.PLAYING) {
            clearTimeout(blockedTimer);
            setPlaying(true);
            status.textContent = TRACK_TITLE;
          } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) setPlaying(false);
          else if (event.data === YT.PlayerState.BUFFERING) status.textContent = 'Đang tải nhạc…';
        },
        onAutoplayBlocked() { hint(); },
        onError(event) {
          panel.dataset.error = String(event.data);
          clearTimeout(blockedTimer);
          setPlaying(false);
          status.textContent = 'YouTube chưa phát được. Mở bài hát bằng liên kết bên dưới nhé.';
          document.querySelector('#music-fallback').hidden = false;
        },
      },
    });
  }
  window.onYouTubeIframeAPIReady = initialize;
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  script.onerror = () => {
    status.textContent = 'Chưa kết nối được YouTube. Bạn vẫn có thể mở quà nha.';
    document.querySelector('#music-fallback').hidden = false;
  };
  document.head.append(script);
  panel.hidden = false;
  document.body.classList.add('music-visible');
  setTimeout(() => { if (!ready) { hint(); document.querySelector('#music-fallback').hidden = false; } }, 15000);
  return { start, pause, get playing() { return state.soundEnabled; } };
}
