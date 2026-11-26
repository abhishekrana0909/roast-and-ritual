/* Roast & Ritual: content, pages and motion */
(() => {
  const D = window.RR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const G = window.gsap, hasG = !!G && !!window.ScrollTrigger;
  if (hasG) G.registerPlugin(ScrollTrigger);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const state = { lenis: null };
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ---------- smooth scroll ---------- */
  if (hasG && window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    state.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.add(() => { window.RR_vel = clamp(lenis.velocity / 40, -1, 1); });
    G.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, immediate) => {
    if (state.lenis) state.lenis.scrollTo(el, { immediate: !!immediate, offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: immediate || reduce ? 'auto' : 'smooth' });
  };
  const lock = on => { if (state.lenis) (on ? state.lenis.stop() : state.lenis.start()); else document.body.style.overflow = on ? 'hidden' : ''; };

  /* ---------- progress, nav, back to top ---------- */
  const prog = $('#progress'), nav = $('#nav'), toTop = $('#toTop'), ttArc = $('#ttArc');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? clamp(scrollY / h, 0, 1) : 0;
    prog.style.transform = `scaleX(${p})`;
    ttArc.style.strokeDashoffset = 132 * (1 - p);
    nav.classList.toggle('scrolled', scrollY > 60);
    toTop.classList.toggle('show', scrollY > 700);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => {
    if (state.lenis) state.lenis.scrollTo(0, { duration: 1.6 });
    else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- recipe lookups ---------- */
  const all = [];
  Object.entries(D.recipes).forEach(([kind, groups]) => Object.entries(groups).forEach(([g, list]) => list.forEach(r => all.push({ ...r, kind, g }))));
  const byId = id => all.find(r => r.id === id);
  const kindOf = id => id[0] === 'c' ? 'cold' : id[0] === 's' ? 'snack' : 'hot';
  const countOf = k => k === 'pairs' ? D.pairs.length : D.recipes[k].a.length + D.recipes[k].b.length;
  $$('[data-n]').forEach(b => b.textContent = countOf(b.dataset.n));

  /* ---------- text splitting (words stay together, letters rise) ---------- */
  const split = el => {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const wd = document.createElement('span'); wd.className = 'wd';
          [...part].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; wd.appendChild(s); });
          frag.appendChild(wd);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el); return $$('.ch', el);
  };

  /* ---------- origins: left story, turning globe, right details ---------- */
  const ogList = $('#ogList'), ogLeft = $('#ogLeft'), ogRight = $('#ogRight');
  D.regions.forEach((r, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button data-i="${i}"><small>0${i + 1}</small>${r.name}</button>`;
    ogList.appendChild(li);
  });
  let ogIdx = -1;
  const showRegion = i => {
    if (i === ogIdx) return; ogIdx = i;
    const r = D.regions[i];
    $$('li', ogList).forEach((li, k) => li.classList.toggle('on', k === i));
    const bar = (l, v) => `<div class="bar mono"><span>${l}</span><div><i data-w="${v * 20}"></i></div></div>`;
    ogLeft.innerHTML = `<p class="og-n mono">0${i + 1} / 0${D.regions.length}</p><h3 class="og-name">${r.name}</h3><p class="og-tag">${r.tag}</p><p class="og-text">${r.text}</p><div class="chips">${r.notes.map(n => `<span>${n}</span>`).join('')}</div>`;
    ogRight.innerHTML = `<dl class="og-meta"><div><dt class="mono">Altitude</dt><dd>${r.alt}</dd></div><div><dt class="mono">Process</dt><dd>${r.process}</dd></div><div><dt class="mono">Best for</dt><dd>${r.best}</dd></div></dl>
      <div class="bars">${bar('Acidity', r.bars.acidity)}${bar('Body', r.bars.body)}${bar('Sweetness', r.bars.sweetness)}</div>
      <div class="og-coffees"><p class="mono">Coffees from ${r.name}</p><div class="og-cl">${r.coffees.map(id => { const c = byId(id); return `<button class="og-c" data-id="${id}"><span>${c.name}</span><small>${c.time}</small></button>`; }).join('')}</div></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', ogRight).forEach(b => b.style.width = b.dataset.w + '%')));
    if (hasG && ogLeft.isConnected) G.fromTo([...ogLeft.children, ...ogRight.children], { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .05, ease: 'power3.out', overwrite: true });
  };
  ogList.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showRegion(+b.dataset.i); });
  ogList.addEventListener('mouseover', e => { const b = e.target.closest('button'); if (b && fine) showRegion(+b.dataset.i); });
  ogRight.addEventListener('click', e => { const b = e.target.closest('.og-c'); if (b) openModal([b.dataset.id]); });
  showRegion(0);

  /* ---------- hero: the real pour, as a frame sequence the scroll plays ---------- */
  const SEQ_N = 95;
  const seq = (() => {
    const cv = $('#heroSeq'); if (!cv) return null;
    const ctx = cv.getContext('2d'), DPR = Math.min(devicePixelRatio || 1, 2), frames = [];
    let W = 0, H = 0, want = 0, drawn = -1, drawnImg = null;
    const src = i => `images/pour/p${String(i).padStart(3, '0')}.webp`;
    const ok = im => im && im.complete && im.naturalWidth;
    const nearest = i => { for (let d = 0; d < SEQ_N; d++) { if (ok(frames[i - d])) return frames[i - d]; if (ok(frames[i + d])) return frames[i + d]; } return null; };
    const draw = i => {
      want = i; const im = nearest(i); if (!im || !W) return;
      if (i === drawn && im === drawnImg) return; drawn = i; drawnImg = im;
      const ir = im.naturalWidth / im.naturalHeight, cr = W / H; let dw, dh;
      if (cr > ir) { dw = W; dh = W / ir; } else { dh = H; dw = H * ir; }
      ctx.drawImage(im, (W - dw) * .58, (H - dh) * .5, dw, dh);
    };
    const size = () => { const r = cv.getBoundingClientRect(); W = Math.round(r.width * DPR); H = Math.round(r.height * DPR); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } drawn = -1; draw(want); };
    const load = i => new Promise(res => { if (i < 0 || i >= SEQ_N || frames[i]) return res(); const im = new Image(); im.decoding = 'async'; im.onload = () => { frames[i] = im; if (Math.abs(i - want) < 4) { drawn = -1; draw(want); } res(); }; im.onerror = res; im.src = src(i); frames[i] = im; });
    if (window.ResizeObserver) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
    size();
    (async () => {
      await load(reduce ? SEQ_N - 1 : 0); draw(reduce ? SEQ_N - 1 : 0);
      if (reduce) return;
      for (let i = 1; i < SEQ_N; i += 4) await Promise.all([load(i), load(i + 1), load(i + 2), load(i + 3)]);
    })();
    return { show: p => draw(Math.round(clamp(p, 0, 1) * (SEQ_N - 1))) };
  })();

  /* gold dust drifting up through the hero light */
  (() => {
    const c = $('#heroDust'); if (!c || reduce) return;
    const x = c.getContext('2d'), DPR = Math.min(devicePixelRatio || 1, 2); let W = 0, H = 0, P = [], run = false, last = 0;
    const size = () => { W = c.clientWidth; H = c.clientHeight; c.width = W * DPR; c.height = H * DPR; x.setTransform(DPR, 0, 0, DPR, 0, 0); };
    const mk = y => ({ x: W * (innerWidth >= 900 ? .42 + Math.random() * .58 : Math.random()), y: y == null ? H + 10 : y, r: .6 + Math.random() * 1.8, v: 8 + Math.random() * 22, ph: Math.random() * 6.28, t: 0, l: 6 + Math.random() * 6 });
    size(); addEventListener('resize', size);
    for (let i = 0; i < (innerWidth < 700 ? 26 : 46); i++) P.push(mk(Math.random() * H));
    const frame = now => {
      if (!run) return;
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now; x.clearRect(0, 0, W, H);
      for (const p of P) {
        p.t += dt; p.y -= p.v * dt; p.x += Math.sin(p.t + p.ph) * .25;
        if (p.y < -10 || p.t > p.l) Object.assign(p, mk());
        const a = Math.sin(Math.PI * Math.min(1, p.t / p.l)) * .8, g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(246,213,142,${a})`); g.addColorStop(1, 'rgba(246,213,142,0)'); x.fillStyle = g; x.fillRect(p.x - p.r * 4, p.y - p.r * 4, p.r * 8, p.r * 8);
      }
      requestAnimationFrame(frame);
    };
    new IntersectionObserver(e => { const on = e[0].isIntersecting; if (on && !run) { run = true; last = performance.now(); requestAnimationFrame(frame); } else if (!on) run = false; }).observe(c);
  })();

  /* ---------- liquid photos (Journey, Kaldi) ---------- */
  if (window.RRFluid) $$('[data-fluid]').forEach(b => RRFluid.attach(b));

  /* ---------- kitchen: a photo follows the cursor over the list ---------- */
  const kList = $('#kList'), kFloat = $('#kFloat');
  if (kList && kFloat && fine && !reduce) {
    const imgs = $$('span', kFloat); let tx = 0, ty = 0, x = 0, y = 0, vis = 0, tv = 0, rot = 0;
    const urls = {}; imgs.forEach(i => urls[i.dataset.k] = (i.style.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1]);
    const glk = window.RRFluid && RRFluid.float($('#kGl'), urls);
    kList.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    kList.addEventListener('pointerover', e => {
      const r = e.target.closest('.kl-row'); if (!r) return;
      if (vis < .05) { x = tx = e.clientX; y = ty = e.clientY; }
      tv = 1; kList.classList.add('dim'); imgs.forEach(i => i.classList.toggle('on', i.dataset.k === r.dataset.k));
      if (glk) glk.show(r.dataset.k);
    });
    kList.addEventListener('pointerleave', () => { tv = 0; kList.classList.remove('dim'); });
    const tick = () => {
      const px = x, py = y; x += (tx - x) * .13; y += (ty - y) * .13; vis += (tv - vis) * .12;
      rot += (clamp((x - px) * .4, -14, 14) - rot) * .12;
      if (glk) { if (glk.ok()) kFloat.classList.add('gl'); glk.bend(clamp((x - px) / 70, -1, 1), clamp(-(y - py) / 70, -1, 1)); glk.setVisible(vis > .01); }
      kFloat.style.opacity = vis.toFixed(3);
      kFloat.style.transform = `translate(${x}px,${y}px) translate(-50%,-55%) rotate(${rot.toFixed(2)}deg) scale(${(.72 + vis * .28).toFixed(3)})`;
    };
    if (window.gsap) gsap.ticker.add(tick); else { const l = () => { tick(); requestAnimationFrame(l); }; l(); }
  }

  /* ---------- recipe modal with timers ---------- */
  const modal = $('#modal'), mCard = $('#mCard');
  let lastFocus = null, timers = [];
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const normSteps = r => r.steps.map(s => Array.isArray(s) ? { t: s[0], s: s[1] } : { t: s, s: 0 });
  const tagFor = (kind, g) => g === 'a' ? (kind === 'snacks' ? 'No oven needed' : 'No machine needed') : (kind === 'snacks' ? 'Oven or microwave' : 'Machine or equipment');
  const block = (r, single) => {
    const k = kindOf(r.id), steps = normSteps(r), timed = steps.some(s => s.s > 0);
    return `<section class="rblock ${k}" data-rid="${r.id}">
      <p class="eyebrow mono">${k === 'snack' ? 'Snack' : k === 'cold' ? 'Cold coffee' : 'Hot coffee'}</p>
      <${single ? 'h3' : 'div'} class="rname">${r.name}</${single ? 'h3' : 'div'}>
      <div class="rmeta"><span>${r.time}</span><span>${tagFor(r.kind, r.g)}</span><span>${r.gear}</span></div>
      <h4>Ingredients</h4><ul class="ing">${r.ing.map(x => `<li>${x}</li>`).join('')}</ul>
      <h4>Method</h4><ol>${steps.map(s => `<li>${s.t}</li>`).join('')}</ol>
      ${timed ? `<div class="m-timer"><div class="tt">00:00</div><div class="tmsg"></div><button data-t="start">Start timer</button><button data-t="reset">Reset</button></div>` : ''}
    </section>`;
  };
  const initTimer = (el, r) => {
    const box = $('.m-timer', el); if (!box) return;
    const steps = normSteps(r), lis = $$('ol li', el);
    const segs = steps.map((s, i) => ({ ...s, i })).filter(s => s.s > 0), total = segs.reduce((a, s) => a + s.s, 0);
    const tt = $('.tt', box), msg = $('.tmsg', box), bS = $('[data-t=start]', box), bR = $('[data-t=reset]', box);
    let run = false, t0 = 0, el0 = 0, raf = 0, seg = -1;
    const reset = () => { cancelAnimationFrame(raf); run = false; el0 = 0; seg = -1; bS.textContent = 'Start timer'; tt.textContent = fmt(total); msg.textContent = 'Press start and follow the steps.'; lis.forEach(l => l.className = ''); };
    const tick = now => {
      if (!run) return;
      el0 = (now - t0) / 1000;
      let acc = 0, k = segs.length;
      for (let j = 0; j < segs.length; j++) { if (el0 < acc + segs[j].s) { k = j; break; } acc += segs[j].s; }
      if (k >= segs.length) { run = false; tt.textContent = '00:00'; msg.textContent = 'Ready. Enjoy!'; bS.textContent = 'Again'; lis.forEach(l => l.className = 'done'); return; }
      if (k !== seg) { seg = k; msg.textContent = segs[k].t; lis.forEach((l, j) => l.className = j === segs[k].i ? 'act' : (j < segs[k].i ? 'done' : '')); }
      tt.textContent = fmt(Math.ceil(segs[k].s - (el0 - acc)));
      raf = requestAnimationFrame(tick);
    };
    bS.addEventListener('click', () => {
      if (run) { run = false; cancelAnimationFrame(raf); bS.textContent = 'Resume'; return; }
      if (bS.textContent === 'Again') reset();
      t0 = performance.now() - el0 * 1000; run = true; bS.textContent = 'Pause'; raf = requestAnimationFrame(tick);
    });
    bR.addEventListener('click', reset);
    reset();
    timers.push(() => { run = false; cancelAnimationFrame(raf); });
  };
  function openModal(ids, pair) {
    const rs = ids.map(byId).filter(Boolean); if (!rs.length) return;
    lastFocus = document.activeElement; timers = [];
    const single = rs.length === 1;
    mCard.style.setProperty('--ac', single ? ({ hot: '#ff7a3d', cold: '#7fd3ff', snack: '#f6c445' })[kindOf(rs[0].id)] : '#e9b45a');
    mCard.innerHTML = `<button class="close" aria-label="Close">&#10005;</button>` +
      (single ? '' : `<div class="m-head"><p class="eyebrow mono">Perfect pair</p><h3>${rs[0].name} <i>+</i> ${rs[1].name}</h3><p class="m-why">${pair.why}</p></div><div style="height:1.8rem"></div>`) +
      rs.map(r => block(r, single)).join('');
    $$('.rblock', mCard).forEach((el, i) => initTimer(el, rs[i]));
    mCard.scrollTop = 0;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    lock(true);
    $('.close', mCard).focus();
  }
  const closeModal = () => {
    timers.forEach(f => f()); timers = [];
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    lock(false);
    if (lastFocus) lastFocus.focus();
  };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close')) closeModal(); });

  /* ---------- science facts, stats, credits ---------- */
  $('#facts').innerHTML = D.facts.map(([a, b]) => `<div class="reveal"><b>${a}</b><span>${b}</span></div>`).join('');
  $('#stOrigins').dataset.count = D.regions.length;
  $('#stCoffee').dataset.count = all.filter(r => r.kind !== 'snacks').length;
  $('#stSnacks').dataset.count = all.filter(r => r.kind === 'snacks').length;
  $('#stPairs').dataset.count = D.pairs.length;
  const C = window.RR_CREDITS || {};
  const labels = { 'j-cherry': 'Journey, Cherry', 'j-process': 'Journey, Process', 'j-roast': 'Journey, Roast', 'j-brew': 'Journey, Brew', ceremony: 'Kaldi section', 'sec-hot': 'Hot coffee', 'sec-cold': 'Cold coffee', 'sec-snacks': 'Snacks', 'sec-pairs': 'Pairs' };
  $('#creditList').innerHTML = Object.entries(C).filter(([k]) => labels[k]).map(([k, v]) => `<li>${labels[k]}: <a href="${v.page}" target="_blank" rel="noopener">${v.title || 'Photo'}</a> by ${v.artist || 'Unknown'} (${v.license}), via ${v.via || 'Wikimedia Commons'}</li>`).join('');

  /* ---------- recipe pages (hot, cold, snacks, pairs) ---------- */
  const PAGES = {
    hot: { n: '01', eye: 'Hot coffee', title: 'Served <em>Hot</em>', sub: 'Start with what is in your kitchen. No machine? You can still make a great cup.', ac: '#ff7a3d', img: 'images/sec-hot.webp', labels: ['No machine', 'With machine'], fx: 'ember', next: 'cold' },
    cold: { n: '02', eye: 'Cold coffee', title: 'Poured <em>Cold</em>', sub: 'Jar shakes, whipped foam and slow cold brew. Most of these need nothing more than a glass.', ac: '#7fd3ff', img: 'images/sec-cold.webp', labels: ['No machine', 'With machine'], fx: 'ice', next: 'snacks' },
    snacks: { n: '03', eye: 'Snacks', title: 'Something <em>on the side</em>', sub: 'Simple, vegetarian and egg-free. Pick the tawa and kadhai ones, or switch to oven and microwave.', ac: '#f6c445', img: 'images/sec-snacks.webp', labels: ['No oven', 'Oven or microwave'], fx: 'crumb', next: 'pairs' },
    pairs: { n: '04', eye: 'Perfect pairs', title: 'Coffee <em>and</em> a Bite', sub: 'Six combinations that work. Open one to see both recipes together.', ac: '#e9b45a', img: 'images/sec-pairs.webp', fx: 'dust', next: 'hot' }
  };
  const NAMES = { hot: 'Hot coffee', cold: 'Cold coffee', snacks: 'Snacks', pairs: 'Perfect pairs' };
  const rpage = $('#rpage'), mainEl = $('main'), rpBody = $('#rpBody'), rpSeg = $('#rpSeg'), rpCount = $('#rpCount');
  let cur = null, grp = 'a';

  /* little particle worlds behind each page title */
  const fx = (() => {
    const cv = $('#rpFx'), ctx = cv.getContext('2d'), DPR = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, ps = [], M = null, last = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const MODES = {
      ember: { n: 46, col: '255,150,80', glow: 1, make: () => ({ x: rnd(0, W), y: H + rnd(0, 60), vx: rnd(-14, 14), vy: -rnd(26, 84), r: rnd(.8, 2.6), max: rnd(4, 8) }) },
      ice: { n: 34, col: '170,225,255', glow: 1, ring: 1, make: () => ({ x: rnd(0, W), y: -rnd(10, 60), vx: rnd(-8, 8), vy: rnd(14, 40), r: rnd(1.6, 6), max: rnd(8, 14) }) },
      crumb: { n: 38, col: '246,196,69', make: () => ({ x: rnd(0, W), y: -rnd(10, 60), vx: rnd(-20, 20), vy: rnd(34, 84), r: rnd(1, 2.6), max: rnd(7, 11) }) },
      dust: { n: 52, col: '233,180,90', glow: 1, make: () => ({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-12, 12), vy: -rnd(4, 18), r: rnd(.7, 2), max: rnd(5, 10) }) }
    };
    const size = () => { const r = cv.parentElement.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    const frame = t => {
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.t += dt; if (p.t > p.max || p.y < -80 || p.y > H + 80) Object.assign(p, M.make(), { t: 0, ph: Math.random() * 6.28 });
        p.x += (p.vx + Math.sin(p.t * 1.3 + p.ph) * 10) * dt; p.y += p.vy * dt;
        const a = Math.sin(Math.PI * clamp(p.t / p.max, 0, 1)) * (M.glow ? .9 : .75);
        if (M.glow) { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5); g.addColorStop(0, `rgba(${M.col},${a})`); g.addColorStop(1, `rgba(${M.col},0)`); ctx.fillStyle = g; ctx.fillRect(p.x - p.r * 5, p.y - p.r * 5, p.r * 10, p.r * 10); }
        if (M.ring) { ctx.strokeStyle = `rgba(${M.col},${a * .7})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.stroke(); }
        else { ctx.fillStyle = `rgba(${M.col},${a})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (M.glow ? .6 : 1), 0, 6.2832); ctx.fill(); }
      }
      raf = requestAnimationFrame(frame);
    };
    return {
      start(mode) {
        cancelAnimationFrame(raf); if (reduce) return;
        M = MODES[mode]; size(); ps = Array.from({ length: innerWidth < 700 ? Math.round(M.n * .6) : M.n }, () => Object.assign(M.make(), { t: Math.random() * 4, ph: Math.random() * 6.28 }));
        ps.forEach(p => { if (mode !== 'ember' && mode !== 'dust') p.y = Math.random() * H; });
        last = 0; raf = requestAnimationFrame(frame);
      },
      stop() { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); },
      size
    };
  })();
  addEventListener('resize', () => { if (cur) fx.size(); });

  const cardsHTML = (kind, g) => D.recipes[kind][g].map((r, i) => `<button class="card${i === 0 ? ' big' : ''}" data-id="${r.id}">
      <span class="c-top"><span class="c-tag mono">${tagFor(kind, g)}</span></span><span class="c-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h3>${r.name}</h3><p>${r.desc}</p>
      <span class="c-foot mono"><span>${r.time}</span><b>${r.gear}</b><i class="c-go">&rarr;</i></span></button>`).join('');
  const pairsHTML = () => D.pairs.map((p, i) => {
    const c = byId(p.coffee), s = byId(p.snack), k = kindOf(p.coffee);
    return `<button class="pair" data-i="${i}" style="--ac:${k === 'cold' ? '#7fd3ff' : '#ff7a3d'}"><span class="p-kind mono">${k} coffee + a snack</span>
      <span class="p-row"><span>${c.name}</span><span class="pp">with</span><span>${s.name}</span></span><p>${p.why}</p>
      <span class="c-foot mono"><span>${c.time} · ${s.time}</span><i class="c-go">&rarr;</i></span></button>`;
  }).join('');

  const placeSeg = () => {
    const on = $('button.on', rpSeg), th = $('.thumb', rpSeg); if (!on || !th) return;
    th.style.width = on.offsetWidth + 'px'; th.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  };
  addEventListener('resize', placeSeg);
  let gridST = [];
  const revealGrid = sel => {
    gridST.forEach(t => t.kill()); gridST = [];
    if (!hasG) return;
    const els = $$(sel, rpBody); G.set(els, { opacity: 0, y: 46 });
    gridST = ScrollTrigger.batch(els, { start: 'top 95%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .85, stagger: .07, ease: 'power3.out', overwrite: true }) });
    ScrollTrigger.refresh();
  };
  const renderGrid = key => {
    if (key === 'pairs') { rpBody.innerHTML = `<div class="pairs-grid">${pairsHTML()}</div>`; rpCount.innerHTML = `<b>${D.pairs.length}</b> pairs`; revealGrid('.pair'); return; }
    rpBody.innerHTML = `<div class="rec-grid">${cardsHTML(key, grp)}</div>`;
    rpCount.innerHTML = `<b>${D.recipes[key][grp].length}</b> recipes`;
    revealGrid('.card');
  };
  const renderPage = key => {
    const p = PAGES[key]; grp = 'a';
    rpage.dataset.k = key; rpage.style.setProperty('--ac', p.ac);
    $('#rpEye').textContent = `${p.n} / ${p.eye}`;
    $('#rpTitle').innerHTML = p.title; split($('#rpTitle'));
    $('#rpSub').textContent = p.sub;
    $('.rp-img', rpage).style.backgroundImage = `url(${p.img})`;
    $('#rpNextT').textContent = NAMES[p.next]; $('#rpNext').setAttribute('href', '#recipes-' + p.next);
    if (p.labels) {
      rpSeg.hidden = false;
      rpSeg.innerHTML = `<button class="on" data-g="a">${p.labels[0]}</button><button data-g="b">${p.labels[1]}</button><i class="thumb"></i>`;
    } else { rpSeg.hidden = true; rpSeg.innerHTML = ''; }
    renderGrid(key);
  };
  rpSeg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.dataset.g === grp) return;
    grp = b.dataset.g; $$('button', rpSeg).forEach(x => x.classList.toggle('on', x === b)); placeSeg(); renderGrid(cur);
  });
  rpBody.addEventListener('pointermove', e => {
    const c = e.target.closest('.card, .pair'); if (!c) return; const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  rpBody.addEventListener('click', e => {
    const c = e.target.closest('.card'); if (c) return openModal([c.dataset.id]);
    const p = e.target.closest('.pair'); if (p) { const q = D.pairs[+p.dataset.i]; openModal([q.coffee, q.snack], q); }
  });

  const applyPage = key => {
    cur = key;
    if (key) {
      renderPage(key);
      rpage.hidden = false; mainEl.hidden = true;
      if (state.lenis) state.lenis.scrollTo(0, { immediate: true }); else scrollTo(0, 0);
      placeSeg(); fx.start(PAGES[key].fx);
    } else { rpage.hidden = true; mainEl.hidden = false; fx.stop(); gridST.forEach(t => t.kill()); gridST = []; }
    if (state.lenis) state.lenis.resize();
    if (hasG) ScrollTrigger.refresh();
    onScroll();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeSeg);
    if (key && hasG) {
      G.fromTo('.rp-back, #rpEye', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .08, ease: 'power3.out', overwrite: true });
      G.fromTo('#rpTitle .ch', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .03, ease: 'expo.out', overwrite: true });
      G.fromTo('#rpSub', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, delay: .3, ease: 'power3.out', overwrite: true });
      G.fromTo('#rpBar', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: .8, delay: .45, ease: 'power3.out', overwrite: true });
    }
  };

  /* ---------- wipe transition ---------- */
  const wipe = $('#wipe'), wipeTxt = $('#wipeTxt');
  const swap = (fn, label) => {
    if (reduce || !hasG) return fn();
    wipeTxt.textContent = label || '';
    G.timeline().set(wipe, { yPercent: 101, visibility: 'visible' })
      .to(wipe, { yPercent: 0, duration: .7, ease: 'power4.inOut' })
      .fromTo(wipeTxt, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' }, '-=.3')
      .add(fn)
      .to(wipe, { yPercent: -101, duration: .8, ease: 'power4.inOut' }, '+=.15')
      .set(wipe, { visibility: 'hidden' });
  };
  const goTo = sel => { try { const t = $(sel); if (t) requestAnimationFrame(() => scrollToEl(t, true)); } catch (e) {} };
  const openPage = key => { closeMenu(); history.pushState(null, '', '#recipes-' + key); swap(() => applyPage(key), NAMES[key]); };
  const go = t => {
    if (t.startsWith('page:')) return openPage(t.slice(5));
    const sel = t === '#top' ? '#top' : t;
    if (cur) { history.pushState(null, '', t === '#top' ? location.pathname : t); swap(() => { applyPage(null); goTo(sel); }, 'Roast & Ritual'); }
    else { const el = $(sel); if (el) { history.pushState(null, '', t === '#top' ? location.pathname : t); scrollToEl(el); } }
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault(); closeMenu(); go(a.dataset.go);
  });
  $('#rpBack').addEventListener('click', () => { history.pushState(null, '', '#menu'); swap(() => { applyPage(null); goTo('#menu'); }, 'The Kitchen'); });
  $('#rpNext').addEventListener('click', e => { e.preventDefault(); openPage(PAGES[cur].next); });
  const keyFromHash = () => { const m = /^#recipes-(hot|cold|snacks|pairs)$/.exec(location.hash); return m ? m[1] : null; };
  addEventListener('popstate', () => {
    const k = keyFromHash(); if (k === cur) return;
    swap(() => { applyPage(k); if (!k && location.hash.length > 1) goTo(location.hash); }, k ? NAMES[k] : 'Roast & Ritual');
  });
  { const k0 = keyFromHash(); if (k0) applyPage(k0); }

  /* ---------- mobile menu ---------- */
  const menuOv = $('#menuOv'), navBtn = $('#navBtn');
  function closeMenu() { if (!menuOv.classList.contains('open')) return; menuOv.classList.remove('open'); menuOv.setAttribute('aria-hidden', 'true'); navBtn.setAttribute('aria-expanded', 'false'); lock(false); }
  navBtn.addEventListener('click', () => {
    const open = !menuOv.classList.contains('open');
    menuOv.classList.toggle('open', open); menuOv.setAttribute('aria-hidden', String(!open)); navBtn.setAttribute('aria-expanded', String(open)); lock(open);
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (modal.classList.contains('open')) closeModal(); else closeMenu();
  });

  /* ---------- no animation library: show everything and stop ---------- */
  if (!hasG) {
    $('#loader').remove(); document.documentElement.classList.remove('js'); if (seq) seq.show(1);
    $$('#molSvg .bonds path').forEach(p => p.style.strokeDashoffset = 0); $$('#molSvg .atoms text').forEach(t => t.style.opacity = 1);
    $('#molFormula').style.opacity = 1; $$('.manifesto .w').forEach(w => w.style.opacity = 1);
    return;
  }

  /* ---------- hero title split + loader ---------- */
  split($('#heroTitle'));
  G.set('#heroTitle .ch', { yPercent: 112 });
  G.set('.reveal-h', { opacity: 0, y: 24 });
  const heroAuto = { v: 0 }; let heroTarget = 0, heroP = 0;
  const heroRender = () => { if (seq) seq.show(heroAuto.v + (1 - heroAuto.v) * heroP); };
  const ldNum = $('#ldNum'), ldBar = $('#ldBar'), loader = $('#loader'), cnt = { v: 0 };
  const intro = () => {
    window.RR_introDone = true; dispatchEvent(new Event('rr-intro'));
    if (seq && !reduce) G.to(heroAuto, { v: .2, duration: 2.4, ease: 'power2.out', onUpdate: heroRender });
    G.timeline()
      .to('#heroTitle .ch', { yPercent: 0, duration: 1.3, stagger: .04, ease: 'expo.out' }, 0)
      .to('.reveal-h', { opacity: 1, y: 0, duration: 1, stagger: .1, ease: 'power3.out' }, .45);
  };
  document.body.style.overflow = 'hidden';
  G.timeline({ delay: .15 })
    .to(cnt, { v: 100, duration: reduce ? .1 : 1.6, ease: 'power1.inOut', onUpdate() { ldNum.textContent = Math.round(cnt.v); ldBar.style.transform = `scaleX(${cnt.v / 100})`; } })
    .to('.ld-in', { opacity: 0, y: -24, duration: .45 })
    .to('.ld-curtain.t', { yPercent: -101, duration: .9, ease: 'expo.inOut' }, '<.05')
    .to('.ld-curtain.b', { yPercent: 101, duration: .9, ease: 'expo.inOut' }, '<')
    .add(() => { loader.style.pointerEvents = 'none'; document.body.style.overflow = ''; intro(); }, '-=.45')
    .set(loader, { display: 'none' }, '+=.8');

  /* ---------- hero: pinned while the scroll pours the coffee ---------- */
  if (seq && !reduce) {
    G.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: () => '+=' + Math.round(innerHeight * (innerWidth < 900 ? 1 : 1.35)), pin: true, scrub: .6, invalidateOnRefresh: true, onUpdate: s => { heroTarget = s.progress; } } })
      .to('.hf-scroll', { opacity: 0, ease: 'none', duration: .15 }, 0)
      .to('.hero-in', { y: -60, opacity: .12, ease: 'none', duration: .35 }, .65);
    G.ticker.add(() => { const d = heroTarget - heroP; if (Math.abs(d) > .0004) { heroP += d * .18; heroRender(); } });
  }

  /* ---------- section headings rise word by word ---------- */
  $$('main .h2').forEach(h => {
    h.classList.remove('reveal');
    const wrap = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) return f.append(' '); const m = document.createElement('span'); m.className = 'wm'; const i = document.createElement('span'); i.className = 'wi'; i.textContent = p; m.append(i); f.append(m); });
        c.replaceWith(f);
      } else if (c.nodeType === 1) wrap(c);
    });
    wrap(h);
    const wi = $$('.wi', h); G.set(wi, { yPercent: 110 });
    ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => G.to(wi, { yPercent: 0, duration: 1.25, stagger: .07, ease: 'expo.out' }) });
  });

  /* ---------- reveals, counters, manifesto ---------- */
  ScrollTrigger.batch('main .reveal', {
    start: 'top 92%', once: true,
    onEnter: els => G.to(els, { opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out' })
  });
  $$('[data-count]').forEach(el => ScrollTrigger.create({
    trigger: el, start: 'top 92%', once: true,
    onEnter: () => { const o = { v: 0 }; G.to(o, { v: +el.dataset.count, duration: 1.8, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }); }
  }));
  const manifesto = $('#manifesto');
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  G.fromTo('#manifesto .w', { opacity: .16 }, { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 48%', scrub: true } });

  /* ---------- marquees speed up with scroll ---------- */
  const mq = $('#mqTrack'), fm = $('#fmTrack');
  if (mq && fm) {
    const t1 = G.to(mq, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
    const t2 = G.fromTo(fm, { xPercent: -50 }, { xPercent: 0, duration: 46, ease: 'none', repeat: -1 });
    if (!reduce) ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: self => {
        const v = Math.min(Math.abs(self.getVelocity()) / 350, 6);
        G.to([t1, t2], { timeScale: 1 + v, duration: .25, overwrite: true });
        G.to([t1, t2], { timeScale: 1, duration: 1.4, delay: .25 });
      }
    }); else { t1.pause(); t2.pause(); }
  }

  /* ---------- journey: cards stack, images drift ---------- */
  const jc = $$('.jcard');
  jc.forEach((c, i) => {
    G.fromTo($('.fl', c), { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 18%', scrub: true } });
    const nx = jc[i + 1];
    if (nx) G.to(c, { scale: .93, '--dim': .62, ease: 'none', scrollTrigger: { trigger: nx, start: 'top 88%', end: 'top 24%', scrub: true } });
  });

  /* ---------- legend, kitchen list ---------- */
  G.fromTo('.lg-img', { clipPath: 'inset(16% 16% 16% 16% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.lg-img', start: 'top 85%', once: true } });
  G.fromTo('.lg-img .fl', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.lg-img', start: 'top bottom', end: 'bottom top', scrub: true } });
  G.fromTo('.lg-amh', { xPercent: -50, yPercent: -50, x: -80 }, { x: 80, ease: 'none', scrollTrigger: { trigger: '.legend', start: 'top bottom', end: 'bottom top', scrub: true } });
  ScrollTrigger.create({ trigger: '#kList', start: 'top 88%', once: true, onEnter: () => { const k = $('#kList'); k.classList.add('in'); setTimeout(() => k.classList.add('done'), 1500); } });


  /* ---------- science: caffeine molecule draws as you scroll ---------- */
  const bonds = $$('#molSvg .bonds path'), atoms = $$('#molSvg .atoms text');
  bonds.forEach(p => { p._L = p.getTotalLength(); p.style.strokeDasharray = p._L; p.style.strokeDashoffset = p._L; });
  atoms.forEach(a => a.style.opacity = 0);
  const molName = $('#molName'), molFormula = $('#molFormula');
  const molRender = p => {
    const n = bonds.length;
    bonds.forEach((b, i) => { const t = clamp((p * (n + 2) - i) / 2, 0, 1); b.style.strokeDashoffset = b._L * (1 - t); });
    atoms.forEach((a, i) => a.style.opacity = clamp((p - .35) * 2.4 - i * .05, 0, 1));
    molFormula.style.opacity = clamp((p - .85) * 7, 0, 1);
    molName.textContent = p < .04 ? 'Scroll to build the molecule' : p < .98 ? 'Building caffeine…' : 'Caffeine';
  };
  molRender(0);
  ScrollTrigger.create({ trigger: '.sci-grid', start: 'top 80%', end: 'top 20%', scrub: .2, onUpdate: s => molRender(s.progress) });

  /* ---------- magnetic buttons, cursor ring ---------- */
  if (fine && !reduce) {
    $$('[data-mag]').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: 'power3.out' }); });
      b.addEventListener('mouseleave', () => G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
    });
    const cur0 = $('#cursor'); let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    document.body.classList.add('has-cursor');
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur0.style.opacity = 1; });
    document.addEventListener('mouseleave', () => cur0.style.opacity = 0);
    document.addEventListener('mouseover', e => cur0.classList.toggle('hov', !!e.target.closest('a,button,.card,.pair,.kl-row')));
    G.ticker.add(() => { x += (tx - x) * .22; y += (ty - y) * .22; cur0.style.transform = `translate(${x}px,${y}px)`; });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
