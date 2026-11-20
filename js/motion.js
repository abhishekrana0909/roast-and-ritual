/* Roast & Ritual: quiet motion layer (hero steam, bean-to-cup track, origins globe) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width:820px)').matches;
  const G = window.gsap, hasG = !!G && !!window.ScrollTrigger;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, '0')).join('');

  /* a canvas that only runs while it is on screen and the tab is open */
  const visible = (el, on) => {
    let v = false, loop = null;
    const tick = t => { if (v && !document.hidden) { on(t); loop = requestAnimationFrame(tick); } else loop = null; };
    const go = () => { if (!loop && v && !document.hidden) loop = requestAnimationFrame(tick); };
    new IntersectionObserver(e => { v = e[0].isIntersecting; go(); }, { rootMargin: '80px' }).observe(el);
    document.addEventListener('visibilitychange', go);
  };

  /* ---------- hero: slow settle and a little steam over the cup ---------- */
  if (hasG && !reduce) G.fromTo('.hero-bg', { scale: 1.07 }, { scale: 1, duration: 3.2, ease: 'power2.out', delay: .3 });

  const sc = $('#steam'), hero = $('#hero');
  if (sc && hero && !reduce) {
    const ctx = sc.getContext('2d'), pc = $('#pourfx'), pctx = pc.getContext('2d'), IW = 1920, IH = 1280, FX = .54, FY = .31, FW = .2;
    let W = 0, H = 0, src = { x: 0, y: 0, w: 0 };
    const size = () => {
      W = hero.clientWidth; H = hero.clientHeight; sc.width = W * DPR; sc.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      pc.width = W * DPR; pc.height = H * DPR; pctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const bw = W * 1.08, bh = H * 1.08, s = Math.max(bw / IW, bh / IH);
      const ox = -W * .04 + (bw - IW * s) * .7, oy = -H * .04 + (bh - IH * s) * .5;
      src = { x: ox + FX * IW * s, y: oy + FY * IH * s, w: FW * IW * s };
    };
    size(); addEventListener('resize', size);
    /* intro pour: a stream of coffee falls into the cup, ripples spread across the surface, a few drops jump */
    window.RR_pour = () => {
      const t0 = performance.now(), FALL = .85, HOLD = 1.3, TAIL = .5, drops = [];
      let hit = false, prev = 0;
      const frame = now => {
        const t = (now - t0) / 1000, dt = Math.min(.05, t - prev); prev = t;
        const ix = src.x, iy = src.y, k = src.w / (FW * IW), sw = Math.max(7, src.w * .034);
        pctx.clearRect(0, 0, W, H);
        const head = t < FALL ? -20 + (iy + 20) * (t / FALL) ** 2 : iy;
        const kt = clamp((t - FALL - HOLD) / TAIL, 0, 1), tail = -20 + (iy + 20) * kt * kt;
        if (head > tail + 1 && kt < 1) {
          const wob = y => Math.sin(y / 46 + t * 8) * 1.4, thin = 1 - .22 * kt;
          const g = pctx.createLinearGradient(ix - sw, 0, ix + sw, 0);
          g.addColorStop(0, '#24120a'); g.addColorStop(.38, '#6b4126'); g.addColorStop(.5, '#b57a4a'); g.addColorStop(.7, '#4a2a16'); g.addColorStop(1, '#1d0e07');
          pctx.fillStyle = g; pctx.globalAlpha = .96; pctx.beginPath();
          const n = 14;
          for (let i = 0; i <= n; i++) { const y = lerp(tail, head, i / n); pctx.lineTo(ix + wob(y) - sw * thin / 2, y); }
          for (let i = n; i >= 0; i--) { const y = lerp(tail, head, i / n); pctx.lineTo(ix + wob(y) + sw * thin / 2, y); }
          pctx.closePath(); pctx.fill(); pctx.globalAlpha = 1;
        }
        if (t >= FALL && !hit) {
          hit = true;
          for (let i = 0; i < 16; i++) { const a = -Math.PI * (.12 + .76 * Math.random()), v = (70 + Math.random() * 150) * k; drops.push({ x: ix, y: iy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: (1 + Math.random() * 1.6) * k, life: 0 }); }
        }
        if (hit) {
          pctx.save(); pctx.beginPath(); pctx.ellipse(ix, iy, 255 * k, 150 * k, 0, 0, 6.2832); pctx.clip();
          for (let i = 0; i < 8; i++) {
            const birth = FALL + i * .3; if (birth > FALL + HOLD + TAIL) break;
            const r = clamp((t - birth) / 2.4, 0, 1); if (r <= 0 || r >= 1) continue;
            const e = 1 - (1 - r) ** 2.2, rx = 270 * k * e;
            pctx.strokeStyle = `rgba(226,190,130,${.5 * (1 - r) ** 1.6})`; pctx.lineWidth = 1.6 * k + 1;
            pctx.beginPath(); pctx.ellipse(ix, iy, rx, rx * .6, 0, 0, 6.2832); pctx.stroke();
          }
          if (t < FALL + HOLD + TAIL) { pctx.fillStyle = 'rgba(226,190,130,.3)'; pctx.beginPath(); pctx.ellipse(ix, iy, sw * 1.5, sw * .9, 0, 0, 6.2832); pctx.fill(); }
          pctx.restore();
        }
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i]; d.life += dt; d.vy += 560 * k * dt; d.x += d.vx * dt; d.y += d.vy * dt;
          if (d.life > .8) { drops.splice(i, 1); continue; }
          pctx.fillStyle = `rgba(190,130,84,${.8 * (1 - d.life / .8)})`; pctx.beginPath(); pctx.arc(d.x, d.y, d.r, 0, 6.2832); pctx.fill();
        }
        if (t < FALL + HOLD + TAIL + 2.6) requestAnimationFrame(frame); else pctx.clearRect(0, 0, W, H);
      };
      requestAnimationFrame(frame);
    };
    const ps = []; let last = 0, acc = 0;
    visible(hero, t => {
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
      if (hero.classList.contains('is-video')) { const vs = window.RR_steamSrc && window.RR_steamSrc(); if (vs) src = vs; else { ctx.clearRect(0, 0, W, H); return; } }
      acc += dt; if (acc > (small ? .5 : .28) && ps.length < 26) { acc = 0; ps.push({ x: src.x + (Math.random() - .5) * src.w * .5, y: src.y, t: 0, life: 5 + Math.random() * 2.5, ph: Math.random() * 6.28 }); }
      ctx.clearRect(0, 0, W, H);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.t += dt; const k = p.t / p.life;
        if (k >= 1) { ps.splice(i, 1); continue; }
        const x = p.x + Math.sin(p.ph + k * 3.4) * src.w * .09 * (.4 + k), y = p.y - k * src.w * 1.15, r = src.w * (.1 + .22 * k);
        const a = .15 * Math.sin(Math.PI * Math.min(1, k * 1.15));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(236,216,186,${a})`); g.addColorStop(1, 'rgba(236,216,186,0)');
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });
  }

  /* ---------- journey: a bean travels from cherry to cup as you scroll ---------- */
  const track = $('#jrTrack');
  if (track && hasG) {
    const fill = $('#jrFill'), tok = $('#jrTok'), bean = $('#jrBean'), crease = $('#jrCrease'), lis = [...track.querySelectorAll('li')];
    const cols = ['#8c3326', '#7a8250', '#6b4126', '#3b2213'];
    const render = p => {
      fill.style.transform = `scaleX(${p})`; tok.style.left = (p * 100) + '%';
      const s = p * 3, i = Math.min(2, Math.floor(s));
      bean.style.fill = mix(cols[i], cols[i + 1], s - i);
      crease.style.opacity = clamp(s - .5, 0, 1);
      const on = Math.round(s); lis.forEach((li, k) => li.classList.toggle('on', k <= on));
    };
    render(0);
    ScrollTrigger.create({ trigger: '.jsteps', start: 'top 55%', end: 'bottom 70%', onUpdate: s => render(s.progress) });
  }

  /* ---------- origins: a dotted globe that turns to the chosen origin ---------- */
  const gc = $('#ogGlobe'), L = window.RR_LAND, list = $('#ogList');
  if (gc && L && list) {
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
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
      const act = Math.max(0, [...list.children].findIndex(li => li.classList.contains('on'))), pin = PINS[act];
      const tl = (pin[1] - 32) * rad, k = 1 - Math.exp(-dt * 2.4);
      let d = tl - lon0; d = Math.atan2(Math.sin(d), Math.cos(d));
      lon0 += d * k + (reduce ? 0 : dt * .012);
      lat0 = lerp(lat0, (14 + pin[0] * .35) * rad, k);
      const R = S * .42, cx = S / 2; ctx.clearRect(0, 0, S, S);
      const bg = ctx.createRadialGradient(cx - R * .3, cx - R * .35, R * .1, cx, cx, R);
      bg.addColorStop(0, 'rgba(201,139,90,.10)'); bg.addColorStop(1, 'rgba(201,139,90,.01)');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cx, R, 0, 6.2832); ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(201,139,90,.3)'; ctx.stroke();
      ctx.strokeStyle = 'rgba(241,228,208,.06)';
      for (let la = -60; la <= 60; la += 30) line(la * rad, -Math.PI, la * rad, Math.PI, R, cx, 90);
      for (let lo = -180; lo < 180; lo += 30) line(-80 * rad, lo * rad, 80 * rad, lo * rad, R, cx, 40);
      ctx.strokeStyle = 'rgba(201,139,90,.32)'; ctx.setLineDash([2, 6]);
      for (const la of [-23.4, 23.4]) line(la * rad, -Math.PI, la * rad, Math.PI, R, cx, 120);
      ctx.setLineDash([]);
      const c0 = Math.cos(lat0), s0 = Math.sin(lat0);
      for (const p of dots) {
        const dd = p.lo - lon0, cd = Math.cos(dd), z = s0 * p.s + c0 * p.c * cd;
        if (z <= .02) continue;
        const x = cx + R * p.c * Math.sin(dd), y = cx - R * (c0 * p.s - s0 * p.c * cd), a = .12 + .5 * z;
        ctx.fillStyle = p.belt ? `rgba(214,152,98,${a + .1})` : `rgba(241,228,208,${a * .85})`;
        ctx.fillRect(x - .9, y - .9, 1.8 * (.6 + z * .5), 1.8 * (.6 + z * .5));
      }
      PINS.forEach((q, i) => {
        const [x, y, z] = proj(q[0] * rad, q[1] * rad, R, cx); if (z < .05) return;
        const on = i === act;
        if (on) {
          const ph = (t / 1600) % 1; ctx.strokeStyle = `rgba(226,190,130,${.55 * (1 - ph)})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, 5 + ph * 22, 0, 6.2832); ctx.stroke();
        }
        ctx.fillStyle = on ? '#e2be82' : 'rgba(214,152,98,.85)'; ctx.beginPath(); ctx.arc(x, y, on ? 4.5 : 2.8, 0, 6.2832); ctx.fill();
      });
    });
  }
})();
