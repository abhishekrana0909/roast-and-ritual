/* Roast & Ritual: the origins globe (a dotted globe that turns to the chosen origin) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const DPR = Math.min(devicePixelRatio || 1, 2);

  /* a canvas that only runs while it is on screen and the tab is open */
  const visible = (el, on) => {
    let v = false, loop = null;
    const tick = t => { if (v && !document.hidden) { on(t); loop = requestAnimationFrame(tick); } else loop = null; };
    const go = () => { if (!loop && v && !document.hidden) loop = requestAnimationFrame(tick); };
    new IntersectionObserver(e => { v = e[0].isIntersecting; go(); }, { rootMargin: '80px' }).observe(el);
    document.addEventListener('visibilitychange', go);
  };

  const gc = $('#ogGlobe'), L = window.RR_LAND, list = $('#ogList');
  if (!gc || !L || !list) return;
  const names = (window.RR && window.RR.regions || []).map(r => r.name);
  const PINS = [[9.1, 40.5], [5.2, -74.5], [-19.5, -45.5], [12.5, 108], [13, 76], [-0.4, 37.3]];
  const rad = Math.PI / 180, dots = [];
  for (let i = 0; i < L.length; i += 2) { const la = L[i] * rad; dots.push({ c: Math.cos(la), s: Math.sin(la), lo: L[i + 1] * rad, belt: Math.abs(L[i]) <= 24 }); }
  const ctx = gc.getContext('2d'); let S = 0;
  const size = () => { S = gc.clientWidth; gc.width = S * DPR; gc.height = S * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  size(); addEventListener('resize', size);
  let lon0 = -60 * rad, lat0 = 18 * rad, last = 0;
  const proj = (la, lo, R, cx) => {
    const cl = Math.cos(la), sl = Math.sin(la), d = lo - lon0, c0 = Math.cos(lat0), s0 = Math.sin(lat0);
    return [cx + R * cl * Math.sin(d), cx - R * (c0 * sl - s0 * cl * Math.cos(d)), s0 * sl + c0 * cl * Math.cos(d)];
  };
  const line = (la0, lo0, la1, lo1, R, cx, n) => {
    let pen = false; ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const t = i / n, [x, y, z] = proj(lerp(la0, la1, t), lerp(lo0, lo1, t), R, cx);
      if (z > 0) { pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; } else pen = false;
    }
    ctx.stroke();
  };
  visible(gc, t => {
    if (!S) size();
    const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
    const act = Math.max(0, [...list.children].findIndex(li => li.classList.contains('on'))), pin = PINS[act];
    const tl = (pin[1] - 32) * rad, k = 1 - Math.exp(-dt * 2.4);
    let d = tl - lon0; d = Math.atan2(Math.sin(d), Math.cos(d));
    lon0 += d * k + (reduce ? 0 : dt * .014);
    lat0 = lerp(lat0, (14 + pin[0] * .35) * rad, k);
    const R = S * .43, cx = S / 2; ctx.clearRect(0, 0, S, S);
    const glow = ctx.createRadialGradient(cx, cx, R * .9, cx, cx, R * 1.16);
    glow.addColorStop(0, 'rgba(233,180,90,.14)'); glow.addColorStop(1, 'rgba(233,180,90,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cx, R * 1.16, 0, 6.2832); ctx.fill();
    const bg = ctx.createRadialGradient(cx - R * .3, cx - R * .35, R * .1, cx, cx, R);
    bg.addColorStop(0, 'rgba(233,180,90,.10)'); bg.addColorStop(1, 'rgba(233,180,90,.015)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cx, R, 0, 6.2832); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(233,180,90,.4)'; ctx.stroke();
    ctx.strokeStyle = 'rgba(244,241,234,.07)';
    for (let la = -60; la <= 60; la += 30) line(la * rad, -Math.PI, la * rad, Math.PI, R, cx, 90);
    for (let lo = -180; lo < 180; lo += 30) line(-80 * rad, lo * rad, 80 * rad, lo * rad, R, cx, 40);
    ctx.strokeStyle = 'rgba(233,180,90,.34)'; ctx.setLineDash([2, 6]);
    for (const la of [-23.4, 23.4]) line(la * rad, -Math.PI, la * rad, Math.PI, R, cx, 120);
    ctx.setLineDash([]);
    const c0 = Math.cos(lat0), s0 = Math.sin(lat0), px = Math.max(1.3, S / 360);
    for (const p of dots) {
      const dd = p.lo - lon0, cd = Math.cos(dd), z = s0 * p.s + c0 * p.c * cd;
      if (z <= .02) continue;
      const x = cx + R * p.c * Math.sin(dd), y = cx - R * (c0 * p.s - s0 * p.c * cd), a = .12 + .55 * z, sz = px * (.6 + z * .6);
      ctx.fillStyle = p.belt ? `rgba(240,190,100,${a + .12})` : `rgba(244,241,234,${a * .8})`;
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
    PINS.forEach((q, i) => {
      const [x, y, z] = proj(q[0] * rad, q[1] * rad, R, cx); if (z < .05) return;
      const on = i === act;
      if (on) {
        const ph = (t / 1600) % 1; ctx.strokeStyle = `rgba(246,213,142,${.6 * (1 - ph)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 5 + ph * 26, 0, 6.2832); ctx.stroke();
        if (names[i]) { ctx.font = `500 ${Math.max(10, S / 52)}px "DM Mono",monospace`; ctx.fillStyle = 'rgba(246,213,142,.95)'; ctx.textAlign = x > cx ? 'left' : 'right'; ctx.fillText(names[i].toUpperCase(), x + (x > cx ? 14 : -14), y - 12); }
      }
      ctx.fillStyle = on ? '#f6d58e' : 'rgba(233,180,90,.85)'; ctx.beginPath(); ctx.arc(x, y, on ? 4.6 : 2.8, 0, 6.2832); ctx.fill();
    });
  });
})();
