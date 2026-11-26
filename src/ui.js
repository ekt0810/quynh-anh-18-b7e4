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
    if (state.phase === 'wrapped') { toast('Mở quà trước nha, em guộc ♡'); return; }
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
      eyebrow.textContent = 'A LITTLE SURPRISE, JUST FOR YOU';
      title.textContent = 'Ê, em guộc!';
      text.textContent = 'Có một bất ngờ nho nhỏ dành cho Quỳnh Anh.';
      hint.textContent = 'Hôm nay nhân vật chính là em đó ♡';
      label.textContent = 'Mở quà & bật nhạc';
    } else if (phase === 'opening') {
      eyebrow.textContent = 'SURPRISE!';
      title.textContent = 'Nhân vật chính xuất hiện!';
      text.textContent = 'Một chiếc bánh, một điều ước, một tuổi mới.';
      hint.textContent = 'Dành riêng cho em guộc Quỳnh Anh ♡';
      label.textContent = 'Ú òa…';
    } else if (phase === 'wish') {
      eyebrow.textContent = 'MAKE A WISH, BIRTHDAY GIRL';
      title.textContent = 'Chúc em guộc Quỳnh Anh';
      text.textContent = 'Tuổi 18 lớn hơn tuổi 17 ✨';
      hint.textContent = 'Nhắm mắt, ước một điều. Rồi thổi nến nào!';
      label.textContent = 'Ước xong rồi · thổi nến';
    } else {
      eyebrow.textContent = 'HELLO EIGHTEEN, HELLO NEW MAGIC';
      title.textContent = 'Tuổi 18, cứ rực rỡ nha!';
      text.textContent = copy.greeting + ' ♡';
      hint.textContent = 'Mong mọi điều dễ thương sẽ tìm đến em.';
      label.textContent = 'Bung pháo giấy nữa';
    }
  }
  on('phase', updatePhase);
  on('music', playing => {
    if (state.phase === 'wrapped') label.textContent = playing ? 'Mở quà sinh nhật' : 'Mở quà & bật nhạc';
  });
  on('photo', () => { if (state.phase === 'wrapped') toast('Quỳnh Anh — cô gái của ngày hôm nay ♡'); else openLetter(); });
  on('celebrate', () => {
    if (navigator.vibrate) navigator.vibrate([30, 40, 50]);
    toast('Điều ước đã được gửi tới vũ trụ ✨');
  });
  updatePhase(state.phase);
  return { toast, primaryAction, openLetter, dispatchPhoto: () => emit('photo') };
}
