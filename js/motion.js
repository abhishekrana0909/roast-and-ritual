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
    const ps = [], spl = []; let last = 0, acc = 0, sacc = 0;
    visible(hero, t => {
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
      const slide = hero.dataset.slide; acc += dt;
      if (slide === '2' && acc > (small ? .5 : .28) && ps.length < 26) { acc = 0; ps.push({ x: src.x + (Math.random() - .5) * src.w * .5, y: src.y, t: 0, life: 5 + Math.random() * 2.5, ph: Math.random() * 6.28 }); }
      ctx.clearRect(0, 0, W, H);
      if (slide === '1') {
        sacc += dt; const bw = W * 1.08, bh = H * 1.08, s = Math.max(bw / 1920, bh / 1920);
        const sx = -W * .04 + (bw - 1920 * s) * .65 + .657 * 1920 * s, sy = -H * .04 + (bh - 1920 * s) * .5 + .636 * 1920 * s;
        while (sacc > .07) { sacc -= .07; spl.push({ x: sx + (Math.random() - .5) * 8 * s, y: sy, vx: (Math.random() - .5) * 130 * s, vy: -(70 + Math.random() * 140) * s, r: (1 + Math.random() * 1.8) * Math.max(.7, s), t: 0 }); }
      }
      for (let i = spl.length - 1; i >= 0; i--) {
        const d = spl[i]; d.t += dt; d.vy += 520 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.t > .6) { spl.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(202,146,98,${.75 * (1 - d.t / .6)})`; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
      }
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

  /* ---------- hero slides: Bean, Brew, Cup. Bean dissolves into dust, a liquid wipe carries one slide into the next ---------- */
  const bc = $('#beanfx'), wc = $('#wipe');
  if (hasG && hero && bc && wc) {
    const SL = [...hero.querySelectorAll('.hs-copy')], BG = [...hero.querySelectorAll('.hs-bg')], DOTS = [...hero.querySelectorAll('.hs-dots button')];
    const bctx = bc.getContext('2d'), wctx = wc.getContext('2d');
    let W = 0, H = 0;
    const mobile = () => innerWidth <= 820;

    /* split the headings of slides 2 and 3 the same way as the main title */
    SL.forEach(s => {
      const t = $('.hs-title', s); if (!t) return;
      t.setAttribute('aria-label', [...t.querySelectorAll('.ln')].map(l => l.textContent).join(' '));
      t.querySelectorAll('.ln').forEach(l => { l.innerHTML = l.classList.contains('amp') ? `<span class="ch">${l.textContent}</span>` : [...l.textContent].map(c => `<span class="ch">${c}</span>`).join(''); });
    });

    /* the bean: painted once, then sampled into grains */
    const SP = 420, sprite = document.createElement('canvas'); sprite.width = sprite.height = SP;
    (() => {
      const s = sprite.getContext('2d'), rx = 118, ry = 168;
      s.translate(SP / 2, SP / 2); s.rotate(25 * Math.PI / 180);
      s.save(); s.scale(rx / ry, 1);
      let g = s.createRadialGradient(-ry * .3, -ry * .42, 8, 0, 0, ry * 1.08);
      g.addColorStop(0, '#c18450'); g.addColorStop(.32, '#8e5833'); g.addColorStop(.68, '#53301a'); g.addColorStop(1, '#2a160a');
      s.fillStyle = g; s.beginPath(); s.arc(0, 0, ry, 0, 6.2832); s.fill();
      g = s.createRadialGradient(0, 0, ry * .58, 0, 0, ry); g.addColorStop(0, 'rgba(18,9,4,0)'); g.addColorStop(1, 'rgba(18,9,4,.6)');
      s.fillStyle = g; s.beginPath(); s.arc(0, 0, ry, 0, 6.2832); s.fill();
      s.restore();
      s.save(); s.beginPath(); s.ellipse(0, 0, rx - 2, ry - 2, 0, 0, 6.2832); s.clip();
      s.lineCap = 'round';
      const crease = () => { s.beginPath(); s.moveTo(-6, -ry * .98); s.bezierCurveTo(-rx * .62, -ry * .36, rx * .62, ry * .36, 6, ry * .98); };
      crease(); s.strokeStyle = 'rgba(15,7,3,.35)'; s.lineWidth = 30; s.stroke();
      crease(); s.strokeStyle = '#0e0603'; s.lineWidth = 13; s.stroke();
      s.save(); s.translate(7, 0); crease(); s.strokeStyle = 'rgba(214,150,96,.32)'; s.lineWidth = 2.4; s.stroke(); s.restore();
      s.restore();
      g = s.createRadialGradient(-rx * .38, -ry * .42, 2, -rx * .38, -ry * .42, 86); g.addColorStop(0, 'rgba(255,226,190,.34)'); g.addColorStop(1, 'rgba(255,226,190,0)');
      s.fillStyle = g; s.beginPath(); s.ellipse(0, 0, rx, ry, 0, 0, 6.2832); s.fill();
    })();

    const STEP = mobile() ? 4 : 3;
    let N = 0, TX, TY, X, Y, VX, VY, DL, DIE, BK; const BCOL = [];
    const NB = 18;
    (() => {
      const d = sprite.getContext('2d').getImageData(0, 0, SP, SP).data, xs = [], ys = [], cs = [];
      for (let y = 0; y < SP; y += STEP) for (let x = 0; x < SP; x += STEP) {
        const i = (y * SP + x) * 4; if (d[i + 3] < 150) continue;
        const n = (Math.random() - .5) * 26; xs.push(x - SP / 2); ys.push(y - SP / 2);
        cs.push([clamp(d[i] + n, 0, 255), clamp(d[i + 1] + n * .8, 0, 255), clamp(d[i + 2] + n * .6, 0, 255)]);
      }
      N = xs.length; TX = Float32Array.from(xs); TY = Float32Array.from(ys);
      X = new Float32Array(N); Y = new Float32Array(N); VX = new Float32Array(N); VY = new Float32Array(N);
      DL = new Float32Array(N); DIE = new Float32Array(N); BK = new Uint8Array(N);
      const sum = Array.from({ length: NB }, () => [0, 0, 0, 0]);
      cs.forEach((c, i) => { const b = Math.min(NB - 1, Math.floor((c[0] * .3 + c[1] * .59 + c[2] * .11) / 256 * NB * 1.5)); BK[i] = b; const q = sum[b]; q[0] += c[0]; q[1] += c[1]; q[2] += c[2]; q[3]++; });
      sum.forEach(q => BCOL.push(q[3] ? `rgb(${Math.round(q[0] / q[3])},${Math.round(q[1] / q[3])},${Math.round(q[2] / q[3])})` : '#000'));
    })();

    const bean = { state: 'off', t: 0, cx: 0, cy: 0, S: 1, mx: -9999, my: -9999 };
    const layout = () => {
      const m = mobile();
      bean.cx = W * (m ? .5 : .7); bean.cy = H * (m ? .8 : .5);
      bean.S = Math.min(H * (m ? .27 : .64), W * (m ? .62 : .38)) / SP;
    };
    const target = (i, a, bob) => {
      const c = Math.cos(a), s = Math.sin(a), tx = TX[i] * bean.S, ty = TY[i] * bean.S;
      return [bean.cx + tx * c - ty * s, bean.cy + bob + tx * s + ty * c];
    };
    const draw = () => {
      bctx.clearRect(0, 0, W, H);
      const sz = STEP * bean.S * 1.08 + .6, bks = Array.from({ length: NB }, () => []);
      for (let i = 0; i < N; i++) { if (bean.state === 'blow' && bean.t > DIE[i]) continue; bks[BK[i]].push(i); }
      for (let b = 0; b < NB; b++) {
        const arr = bks[b]; if (!arr.length) continue;
        bctx.fillStyle = BCOL[b]; bctx.beginPath();
        for (const i of arr) { const k = bean.state === 'blow' ? 1 - .55 * clamp(bean.t / DIE[i], 0, 1) : 1, s = sz * k; bctx.rect(X[i] - s / 2, Y[i] - s / 2, s, s); }
        bctx.fill();
      }
      /* small beans orbiting the big one */
      const al = bean.state === 'blow' ? clamp(1 - bean.t / .7, 0, 1) : clamp(bean.t / 1.4, 0, 1);
      if (al > 0) [[-.62, -.5, .17, .3], [.6, .56, .12, -.5], [.4, -.68, .085, .9]].forEach(([ox, oy, k, ph], j) => {
        const t = bean.t + j * 2, s = k * SP * bean.S * 1.4;
        bctx.save(); bctx.globalAlpha = al * .9;
        bctx.translate(bean.cx + ox * SP * bean.S * .9 + Math.sin(t * .6 + ph) * 8, bean.cy + oy * SP * bean.S * .9 + Math.cos(t * .5 + ph) * 10);
        bctx.rotate(ph + t * .25); bctx.drawImage(sprite, -s / 2, -s / 2, s, s); bctx.restore();
      });
    };
    const paintStatic = () => { layout(); bean.t = 2; for (let i = 0; i < N; i++) { const [tx, ty] = target(i, 0, 0); X[i] = tx; Y[i] = ty; } draw(); };
    const size = () => {
      W = hero.clientWidth; H = hero.clientHeight;
      for (const c of [bc, wc]) { c.width = W * DPR; c.height = H * DPR; }
      bctx.setTransform(DPR, 0, 0, DPR, 0, 0); wctx.setTransform(DPR, 0, 0, DPR, 0, 0); layout();
      if (reduce && bean.state === 'home') paintStatic();
    };
    bean.assemble = () => {
      bean.state = 'home'; bean.t = 0; layout();
      for (let i = 0; i < N; i++) {
        const [tx, ty] = target(i, 0, 0), a = Math.random() * 6.2832, r = 160 + Math.random() * 520;
        X[i] = tx + Math.cos(a) * r; Y[i] = ty + Math.sin(a) * r * .8; VX[i] = VY[i] = 0; DL[i] = Math.random() * .55; DIE[i] = 9;
      }
      if (reduce) paintStatic();
    };
    bean.blow = () => { bean.state = 'blow'; bean.t = 0; for (let i = 0; i < N; i++) DIE[i] = .45 + Math.random() * 1.25; };
    addEventListener('resize', size); size();
    hero.addEventListener('pointermove', e => { const r = bc.getBoundingClientRect(); bean.mx = e.clientX - r.left; bean.my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { bean.mx = bean.my = -9999; });

    let lastB = 0;
    if (!reduce) visible(hero, now => {
      if (bean.state === 'off') return;
      const dt = Math.min(.05, (now - lastB) / 1000 || .016); lastB = now; const kk = dt * 60; bean.t += dt;
      if (bean.state === 'blow' && bean.t > 1.8) { bean.state = 'off'; bctx.clearRect(0, 0, W, H); return; }
      const a = Math.sin(bean.t * .45) * .05, bob = Math.sin(bean.t * .8) * 7, R = 120 * Math.max(.6, bean.S * 2.2), R2 = R * R;
      const damp = Math.pow(.78, kk), blow = bean.state === 'blow';
      for (let i = 0; i < N; i++) {
        if (blow) {
          if (bean.t > DIE[i]) continue;
          VX[i] += (.34 + (i % 7) * .05 + (X[i] - bean.cx) * .0012) * kk; VY[i] += (-.12 - (i % 5) * .03 + Math.sin(Y[i] * .02 + bean.t * 4) * .05 + (Y[i] - bean.cy) * .0009) * kk;
          VX[i] *= Math.pow(.985, kk); VY[i] *= Math.pow(.985, kk);
        } else {
          const [tx, ty] = target(i, a, bob), g = clamp((bean.t - DL[i]) / .5, 0, 1) * .022;
          VX[i] = (VX[i] + (tx - X[i]) * g * kk) * damp; VY[i] = (VY[i] + (ty - Y[i]) * g * kk) * damp;
          const dx = X[i] - bean.mx, dy = Y[i] - bean.my, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 1) { const d = Math.sqrt(d2), f = (1 - d / R) ** 2 * 5.2 * kk; VX[i] += dx / d * f; VY[i] += dy / d * f; }
        }
        X[i] += VX[i] * kk; Y[i] += VY[i] * kk;
      }
      draw();
    });

    /* the liquid wipe */
    const E = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const FING = Array.from({ length: 6 }, (_, j) => ({ c: (j + .5) / 6, w: 70 + 34 * Math.sin(j * 2.1), h: 90 * (.4 + .6 * Math.sin(j * 1.7 + 1) ** 2), ph: j * 1.3 }));
    const DRIP = Array.from({ length: 11 }, (_, k) => ({ c: (k + .5) / 11, w: 20 + 17 * ((k * 37) % 10) / 10, len: 55 + 170 * ((k * 53) % 10) / 10, ph: k * 3.1 }));
    const drawWipe = (p, t) => {
      wctx.clearRect(0, 0, W, H);
      const bandH = H * 1.7, topY = lerp(H + 70, -bandH - 140, E(p)), pulse = Math.sin(Math.PI * p), botY = topY + bandH, n = Math.ceil(W / 6) + 1;
      const top = [], bot = [];
      for (let i = 0; i <= n; i++) {
        const x = Math.min(W, i * 6);
        let yt = topY + 14 * Math.sin(x * .011 + t * 3.1) + 9 * Math.sin(x * .023 - t * 4.3) + 5 * Math.sin(x * .05 + t * 6);
        for (const f of FING) { const dx = (x - (f.c * W + 60 * Math.sin(t + f.ph))) / f.w; yt -= f.h * pulse * Math.exp(-dx * dx); }
        let yb = botY + 6 * Math.sin(x * .02 + t * 2);
        for (const d of DRIP) { const dx = (x - (d.c * W + 30 * Math.sin(d.ph))) / d.w; yb += d.len * pulse * Math.exp(-dx * dx); }
        top.push([x, yt]); bot.push([x, yb]);
      }
      const g = wctx.createLinearGradient(0, topY - 90, 0, botY);
      g.addColorStop(0, '#cf9560'); g.addColorStop(.012, '#7a4a28'); g.addColorStop(.05, '#3c2112'); g.addColorStop(.5, '#24130a'); g.addColorStop(1, '#150a05');
      wctx.fillStyle = g; wctx.beginPath(); wctx.moveTo(top[0][0], top[0][1]);
      for (const q of top) wctx.lineTo(q[0], q[1]);
      for (let i = bot.length - 1; i >= 0; i--) wctx.lineTo(bot[i][0], bot[i][1]);
      wctx.closePath(); wctx.fill();
      wctx.beginPath(); top.forEach((q, i) => i ? wctx.lineTo(q[0], q[1]) : wctx.moveTo(q[0], q[1]));
      wctx.strokeStyle = 'rgba(244,206,156,.5)'; wctx.lineWidth = 2.2; wctx.stroke();
      wctx.translate(0, 9); wctx.strokeStyle = 'rgba(244,206,156,.14)'; wctx.lineWidth = 6; wctx.stroke(); wctx.translate(0, -9);
      for (const d of DRIP) { const y = botY + d.len * pulse * 1.08 + 6, r = d.w * .16 * pulse; if (r > 1.2) { wctx.fillStyle = '#150a05'; wctx.beginPath(); wctx.arc(d.c * W + 30 * Math.sin(d.ph), y, r, 0, 6.2832); wctx.fill(); } }
    };
    const runWipe = (onSwap, onDone) => {
      const o = { p: 0 }; let swapped = false;
      G.to(o, { p: 1, duration: 1.5, ease: 'none', onUpdate() {
        const p = o.p; drawWipe(p, p * 1.5);
        if (!swapped && lerp(H + 70, -H * 1.7 - 140, E(p)) <= -H * .25) { swapped = true; onSwap(); }
      }, onComplete() { wctx.clearRect(0, 0, W, H); onDone(); } });
    };

    /* slide logic */
    let cur = 0, busy = false, auto = null, started = false, vis = true, hov = false; const AUTO = 7.5, pr = { v: 0 };
    const gate = () => { if (!auto) return; (started && vis && !hov && !document.hidden && !busy) ? auto.resume() : auto.pause(); };
    const startAuto = () => {
      if (auto) auto.kill(); pr.v = 0;
      const bar = DOTS[cur];
      auto = G.to(pr, { v: 1, duration: AUTO, ease: 'none', onUpdate: () => bar.style.setProperty('--p', pr.v), onComplete: () => go(cur + 1) });
      gate();
    };
    const swap = i => {
      cur = i; hero.dataset.slide = i;
      SL.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k !== i); s.querySelectorAll('a').forEach(a => { a.tabIndex = k === i ? 0 : -1; }); });
      BG.forEach((b, k) => b.classList.toggle('on', k === i));
      DOTS.forEach((d, k) => { d.classList.toggle('on', k === i); k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'); d.style.setProperty('--p', 0); });
    };
    const reveal = i => {
      const s = SL[i];
      G.fromTo(s.querySelectorAll('.ln .ch'), { y: '110%', filter: 'blur(6px)' }, { y: 0, filter: 'blur(0px)', duration: 1.1, stagger: .045, ease: 'expo.out', overwrite: true });
      G.fromTo(s.querySelectorAll('.reveal, .hs-r'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, stagger: .1, delay: .3, ease: 'power3.out', overwrite: true });
      if (i > 0) G.fromTo(BG[i], { scale: 1.08 }, { scale: 1, duration: 3.2, ease: 'power2.out', overwrite: 'auto' });
      if (i === 2 && typeof window.RR_pour === 'function') G.delayedCall(.6, window.RR_pour);
    };
    function go(i) {
      i = (i + SL.length) % SL.length; if (busy || i === cur) return;
      busy = true; if (auto) { auto.kill(); auto = null; }
      if (cur === 0 && !reduce) bean.blow();
      const apply = () => { swap(i); if (!reduce) reveal(i); if (i === 0) bean.assemble(); };
      if (reduce) { apply(); busy = false; return; }
      runWipe(apply, () => { busy = false; startAuto(); });
    }
    hero.querySelectorAll('.hs-arr').forEach(b => b.addEventListener('click', () => go(cur + +b.dataset.d)));
    DOTS.forEach(b => b.addEventListener('click', () => go(+b.dataset.i)));
    let tx0 = 0, ty0 = 0;
    hero.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
    hero.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0; if (Math.abs(dx) > 60 && Math.abs(dy) < Math.abs(dx) * .6) go(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
    $('.hs-ctl', hero).addEventListener('mouseenter', () => { hov = true; gate(); });
    $('.hs-ctl', hero).addEventListener('mouseleave', () => { hov = false; gate(); });
    new IntersectionObserver(e => { vis = e[0].isIntersecting; gate(); }, { threshold: .25 }).observe(hero);
    document.addEventListener('visibilitychange', gate);

    window.RR_heroStart = () => {
      if (started) return; started = true;
      bean.assemble();
      if (!reduce) startAuto();
    };
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
