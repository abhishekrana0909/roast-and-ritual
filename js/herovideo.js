/* Roast & Ritual: hero video (real coffee poured into a mug). Falls back to the photo hero if the video cannot play. */
(() => {
  const hero = document.getElementById('hero'), vid = document.getElementById('heroVid');
  if (!hero || !vid) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pour2d = window.RR_pour;
  let ready = vid.readyState >= 3, failed = false, played = false;
  vid.addEventListener('canplaythrough', () => { ready = true; });
  vid.addEventListener('error', () => { failed = true; });
  vid.querySelector('source').addEventListener('error', () => { failed = true; });

  /* where the mug opening sits on screen, so the steam rises from it */
  const VW = 1600, VH = 844, FX = .475, FY = .215, FW = .27;
  window.RR_steamSrc = () => {
    if (!played || vid.currentTime < 8.5) return null;
    const r = vid.getBoundingClientRect(), h = hero.getBoundingClientRect(), s = Math.max(r.width / VW, r.height / VH);
    const pos = (getComputedStyle(vid).objectPosition || '50% 50%').split(' ').map(v => parseFloat(v) / 100);
    const ox = (r.width - VW * s) * (isNaN(pos[0]) ? .5 : pos[0]), oy = (r.height - VH * s) * (isNaN(pos[1]) ? .5 : pos[1]);
    return { x: r.left - h.left + ox + FX * VW * s, y: r.top - h.top + oy + FY * VH * s, w: FW * VW * s };
  };

  const play = () => {
    played = true; hero.classList.add('is-video'); vid.classList.add('on');
    try { vid.currentTime = 0; } catch (e) {}
    const p = vid.play(); if (p && p.catch) p.catch(() => {});
  };
  window.RR_pour = () => {
    if (failed) return pour2d && pour2d();
    if (ready) return play();
    let n = 0; const t = setInterval(() => {
      n++;
      if (failed || n > 40) { clearInterval(t); if (pour2d) pour2d(); } else if (ready) { clearInterval(t); play(); }
    }, 100);
  };

  /* save battery: pause while the hero is off screen */
  new IntersectionObserver(e => {
    if (!played || vid.ended) return;
    if (e[0].isIntersecting) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); } else vid.pause();
  }, { threshold: .1 }).observe(hero);

  /* reduced motion: show the finished cup as a still */
  if (reduce) { hero.classList.add('is-video'); vid.classList.add('on'); }
})();
