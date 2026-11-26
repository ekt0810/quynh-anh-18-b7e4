import { state, copy, on, emit, openGift, celebrate, moreConfetti, reset } from './state.js';

export function createUI(music) {
  const primary = document.querySelector('#primary-action');
  const label = document.querySelector('#primary-label');
  const title = document.querySelector('#greeting-title');
  const text = document.querySelector('#greeting-text');
  const hint = document.querySelector('#greeting-hint');
  const eyebrow = document.querySelector('#eyebrow');
  const letterButton = document.querySelector('#letter-action');
  const dialog = document.querySelector('#letter-dialog');
  const toastElement = document.querySelector('#toast');
  let toastTimer;

  for (const paragraph of copy.letter) {
    const p = document.createElement('p');
    p.textContent = paragraph;
    document.querySelector('#letter-copy').append(p);
  }
  function toast(message) {
    clearTimeout(toastTimer);
    toastElement.textContent = message;
    toastElement.classList.add('visible');
    toastTimer = setTimeout(() => toastElement.classList.remove('visible'), 3400);
  }
  function openLetter() {
    if (state.phase === 'wrapped') { toast('Mở quà trước nha, em guộc!'); return; }
    if (!dialog.open) dialog.showModal();
  }
  function closeLetter() { dialog.close(); letterButton.focus(); }
  letterButton.addEventListener('click', openLetter);
  document.querySelector('#letter-close').addEventListener('click', closeLetter);
  document.querySelector('#letter-done').addEventListener('click', () => { closeLetter(); moreConfetti(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeLetter();
  });
  document.querySelector('#replay').addEventListener('click', () => {
    reset();
    if (dialog.open) dialog.close();
    toast('Gói quà lại rồi. Mở thêm lần nữa nha!');
  });
  function primaryAction() {
    if (state.phase === 'wrapped') { music.start({ fromGift: true }); openGift(); }
    else if (state.phase === 'wish') celebrate();
    else if (state.phase === 'celebrating') moreConfetti();
  }
  primary.addEventListener('click', primaryAction);
  function updatePhase(phase) {
    document.body.dataset.phase = phase;
    primary.disabled = phase === 'opening';
    letterButton.hidden = phase === 'wrapped' || phase === 'opening';
    const greeting = document.querySelector('#greeting');
    greeting.classList.remove('changing');
    void greeting.offsetWidth;
    greeting.classList.add('changing');
    const stage = phase === 'wrapped' || phase === 'opening' ? 0 : phase === 'wish' ? 1 : 2;
    document.querySelectorAll('.steps>span').forEach((el, i) => {
      el.classList.toggle('active', i === stage);
      el.classList.toggle('done', i < stage);
    });
    if (phase === 'wrapped') {
      eyebrow.textContent = 'SINH NHẬT EM GÁI · LEVEL 18';
      title.textContent = 'Ê, em guộc!';
      text.textContent = 'Anh có quà sinh nhật cho em nè.';
      hint.textContent = '18 rồi nhé. Mở quà thôi!';
      label.textContent = 'Mở quà & bật nhạc';
    } else if (phase === 'opening') {
      eyebrow.textContent = 'QUÀ TỚI RỒI!';
      title.textContent = 'Bánh của em đây!';
      text.textContent = 'Bánh 18 tuổi, khỏi đếm nến cho mệt.';
      hint.textContent = 'Ước một điều rồi thổi nến nha.';
      label.textContent = 'Ú òa…';
    } else if (phase === 'wish') {
      eyebrow.textContent = 'QUỲNH ANH · LEVEL 18';
      title.textContent = 'Chúc em guộc Quỳnh Anh';
      text.textContent = 'Tuổi 18 lớn hơn tuổi 17 🎂';
      hint.textContent = 'Nhắm mắt, ước một điều. Rồi thổi nến nào!';
      label.textContent = 'Ước xong rồi · thổi nến';
    } else {
      eyebrow.textContent = 'CHÍNH THỨC LÊN LEVEL 18';
      title.textContent = 'Sinh nhật vui vẻ, em gái!';
      text.textContent = copy.greeting + '!';
      hint.textContent = 'Tuổi mới khỏe, vui, học hành ổn áp nha.';
      label.textContent = 'Bung pháo giấy nữa';
    }
  }
  on('phase', updatePhase);
  on('music', playing => {
    if (state.phase === 'wrapped') label.textContent = playing ? 'Mở quà sinh nhật' : 'Mở quà & bật nhạc';
  });
  on('photo', () => { if (state.phase === 'wrapped') toast('Quỳnh Anh · hôm nay lên 18!'); else openLetter(); });
  on('celebrate', () => {
    if (navigator.vibrate) navigator.vibrate([30, 40, 50]);
    toast('Nến tắt rồi. Sinh nhật vui vẻ nha! 🎉');
  });
  updatePhase(state.phase);
  return { toast, primaryAction, openLetter, dispatchPhoto: () => emit('photo') };
}
