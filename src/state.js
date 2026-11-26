export const copy = Object.freeze({
  name: 'Quỳnh Anh',
  greeting: 'Chúc em guộc Quỳnh Anh tuổi 18 lớn hơn tuổi 17',
  letter: [
    'Chúc em guộc Quỳnh Anh tuổi 18 lớn hơn tuổi 17.',
    'Anh chúc em tuổi mới khỏe mạnh, học hành thuận lợi, ăn ngon ngủ ngon và làm được những điều em thích.',
    'Lớn thêm một tuổi rồi, nhớ chăm sóc bản thân nha. Hôm nay cứ ăn bánh, nhận quà và vui hết cỡ. Sinh nhật vui vẻ, em gái! 🎂',
  ],
});

export const state = {
  running: true,
  elapsed: 0,
  delta: 0,
  phase: 'wrapped',
  openedAt: -100,
  celebratedAt: -100,
  reveal: 0,
  candleLevel: 1,
  soundEnabled: false,
  pointer: { x: 0, y: 0 },
  viewport: { width: innerWidth, height: innerHeight, mobile: innerWidth < 700 },
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  burst: 0,
};

const events = new EventTarget();
export function on(type, fn) {
  const handler = event => fn(event.detail);
  events.addEventListener(type, handler);
  return () => events.removeEventListener(type, handler);
}
export function emit(type, detail) { events.dispatchEvent(new CustomEvent(type, { detail })); }
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);

export function openGift() {
  if (state.phase !== 'wrapped') return;
  state.phase = 'opening';
  state.openedAt = state.elapsed;
  emit('phase', state.phase);
  emit('open');
}
export function celebrate() {
  if (state.phase !== 'wish') return;
  state.phase = 'celebrating';
  state.celebratedAt = state.elapsed;
  state.burst++;
  emit('phase', state.phase);
  emit('celebrate');
}
export function moreConfetti() {
  state.burst++;
  emit('confetti');
}
export function reset() {
  Object.assign(state, { phase: 'wrapped', openedAt: -100, celebratedAt: -100, reveal: 0, candleLevel: 1 });
  emit('reset');
  emit('phase', state.phase);
}
export function tick(delta) {
  state.delta = Math.min(delta, 0.05);
  // Timed reveals use wall time; particle physics keeps a bounded integration step.
  if (state.running) state.elapsed += Math.min(delta, 1);
  if (state.phase !== 'wrapped') state.reveal = easeOut((state.elapsed - state.openedAt - 0.5) / 1.9);
  if (state.phase === 'opening' && state.elapsed - state.openedAt > 2.7) {
    state.phase = 'wish';
    emit('phase', state.phase);
  }
  if (state.phase === 'celebrating') state.candleLevel = 1 - smooth((state.elapsed - state.celebratedAt) / 0.6);
}
