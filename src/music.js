import { state, emit } from './state.js';

// The edited soundtrack is served with the site, without an external player.
export function createMusic() {
  const audio = document.querySelector('#background-music');
  const button = document.querySelector('#music-toggle');
  const label = button.querySelector('.music-label');
  const equalizer = button.querySelector('.equalizer');
  const status = document.querySelector('#music-status');
  let userPaused = false;
  let pendingPlay = null;
  audio.volume = 0.68;
  audio.loop = true;
  audio.preload = 'auto';

  function reflect(playing) {
    state.soundEnabled = playing;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Tắt nhạc nền PHONECERT' : 'Bật nhạc nền PHONECERT');
    button.classList.toggle('is-playing', playing);
    equalizer.classList.toggle('active', playing);
    label.textContent = playing ? 'Đang phát nhạc' : 'Bật nhạc';
    status.textContent = playing ? 'PHONECERT · Hoàng Dũng' : 'PHONECERT · một bài hát dành cho em';
    emit('music', playing);
  }
  function start({ fromGift = false } = {}) {
    if (fromGift && userPaused) return;
    userPaused = false;
    audio.muted = false;
    // Call play synchronously in the gesture; awaiting a network request here
    // would lose user activation on Safari and mobile browsers.
    const attempt = audio.play();
    pendingPlay = attempt;
    if (attempt) attempt.then(() => {
      if (pendingPlay !== attempt) return;
      reflect(!audio.paused);
    }).catch(error => {
      if (pendingPlay !== attempt || error.name === 'AbortError') return;
      reflect(false);
      if (error.name === 'NotAllowedError') {
        button.title = 'Chạm để bật nhạc — trình duyệt cần một lần chạm';
      } else {
        status.textContent = 'Chạm nút nhạc để thử phát lại nhé';
      }
    });
  }
  function pause() {
    userPaused = true;
    pendingPlay = null;
    audio.pause();
    reflect(false);
  }
  button.addEventListener('click', () => state.soundEnabled ? pause() : start());
  audio.addEventListener('playing', () => reflect(true));
  audio.addEventListener('pause', () => reflect(false));
  audio.addEventListener('error', () => {
    reflect(false);
    status.textContent = 'Nhạc chưa tải được. Chạm nút nhạc để thử lại nhé.';
  });
  // Attempt audible autoplay immediately. A gesture anywhere else in the page
  // unlocks it if browser policy blocks that attempt. Respect manual pause.
  const unlock = event => {
    if (userPaused || state.soundEnabled || button.contains(event.target)) return;
    start({ fromGift: true });
  };
  document.addEventListener('pointerdown', unlock, { passive: true });
  document.addEventListener('keydown', unlock);
  start();
  return { start, pause, get playing() { return !audio.paused && !audio.muted; } };
}
