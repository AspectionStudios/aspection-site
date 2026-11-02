// Tab vs the Monk (Rift Rascal section): a looping cinematic video. Tiny on purpose: without JavaScript the stage stays
// hidden, so the section looks exactly as before. Nothing is fetched until the stage is about to scroll into view; the
// video then plays muted (as browsers require for autoplay), pauses off screen or when the tab is hidden, and the small
// speaker button is the only thing that takes a tap. Reduced motion: the still poster, no video, no button.
(() => {
  const host = document.querySelector('[data-rr-fight]');
  if (!host || !('IntersectionObserver' in window)) return;
  const video = host.querySelector('video');
  const btn = host.querySelector('.rr-fight-sound');
  if (!video || !video.canPlayType) return;
  host.hidden = false;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { host.classList.add('still'); return; }
  let loaded = false, visible = false;
  const sync = () => {
    if (!loaded) return;
    if (visible && !document.hidden) { const p = video.play(); if (p && p.catch) p.catch(() => {}); } else video.pause();
  };
  const load = () => {
    loaded = true;
    video.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; s.removeAttribute('data-src'); });
    video.muted = true;
    video.addEventListener('playing', () => { host.classList.add('on'); if (btn) btn.hidden = false; }, { once: true });
    const srcs = video.querySelectorAll('source'); if (srcs.length) srcs[srcs.length - 1].addEventListener('error', () => { io.disconnect(); video.pause(); });
    video.load();
  };
  const io = new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible && !loaded) load();
    sync();
  }, { rootMargin: '200px 0px' });
  io.observe(host);
  document.addEventListener('visibilitychange', sync);
  if (btn) btn.addEventListener('click', () => {
    const on = video.muted;   // muted now → turn sound on
    video.muted = !on;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? "Turn off the fight's sound" : "Turn on the fight's sound");
    if (on) sync();
  });
})();
