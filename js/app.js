/* Roast & Ritual: an Apple-like product page for coffee */
(() => {
  const D = window.RR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, hasG = !!G && !!window.ScrollTrigger;
  if (hasG) G.registerPlugin(ScrollTrigger);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const state = { lenis: null };
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ---------- smooth scroll ---------- */
  if (hasG && window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1 });
    state.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, immediate) => {
    if (state.lenis) state.lenis.scrollTo(el, { immediate: !!immediate, offset: el.id === 'top' ? 0 : -50, duration: 1.3 });
    else el.scrollIntoView({ behavior: immediate || reduce ? 'auto' : 'smooth' });
  };
  const lock = on => { if (state.lenis) (on ? state.lenis.stop() : state.lenis.start()); else document.body.style.overflow = on ? 'hidden' : ''; };

  /* ---------- data ---------- */
  const all = [];
  Object.entries(D.recipes).forEach(([kind, groups]) => Object.entries(groups).forEach(([g, list]) => list.forEach(r => all.push({ ...r, kind, g }))));
  const byId = id => all.find(r => r.id === id);
  const kindOf = id => id[0] === 'c' ? 'cold' : id[0] === 's' ? 'snack' : 'hot';
  const countOf = k => k === 'pairs' ? D.pairs.length : D.recipes[k].a.length + D.recipes[k].b.length;
  const counts = { origins: D.regions.length, coffees: countOf('hot') + countOf('cold'), snacks: countOf('snacks') };
  $$('[data-n]').forEach(e => e.textContent = counts[e.dataset.n] != null ? counts[e.dataset.n] : countOf(e.dataset.n));
  const tagFor = (kind, g) => g === 'a' ? (kind === 'snacks' ? 'No oven needed' : 'No machine needed') : (kind === 'snacks' ? 'Oven or microwave' : 'Machine or equipment');

  /* ---------- hero: the real pour as a frame sequence ---------- */
  const SEQ_N = 95;
  const seq = (() => {
    const cv = $('#heroSeq'); if (!cv) return null;
    const ctx = cv.getContext('2d'), DPR = Math.min(devicePixelRatio || 1, 2), frames = [];
    let W = 0, H = 0, want = 0, drawn = -1, drawnImg = null;
    const ok = im => im && im.complete && im.naturalWidth;
    const nearest = i => { for (let d = 0; d < SEQ_N; d++) { if (ok(frames[i - d])) return frames[i - d]; if (ok(frames[i + d])) return frames[i + d]; } return null; };
    const draw = i => {
      want = i; const im = nearest(i); if (!im || !W) return;
      if (i === drawn && im === drawnImg) return; drawn = i; drawnImg = im;
      const ir = im.naturalWidth / im.naturalHeight, cr = W / H; let dw, dh;
      if (cr > ir) { dw = W; dh = W / ir; } else { dh = H; dw = H * ir; }
      ctx.clearRect(0, 0, W, H); ctx.drawImage(im, (W - dw) * .56, (H - dh) * .5, dw, dh);
    };
    const size = () => { const r = cv.getBoundingClientRect(); W = Math.round(r.width * DPR); H = Math.round(r.height * DPR); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } drawn = -1; draw(want); };
    const load = i => new Promise(res => { if (i < 0 || i >= SEQ_N || frames[i]) return res(); const im = new Image(); im.decoding = 'async'; im.onload = () => { if (Math.abs(i - want) < 4) { drawn = -1; draw(want); } res(); }; im.onerror = res; im.src = `images/pour/p${String(i).padStart(3, '0')}.webp`; frames[i] = im; });
    if (window.ResizeObserver) new ResizeObserver(size).observe(cv); else addEventListener('resize', size);
    size();
    (async () => {
      await load(reduce ? SEQ_N - 1 : 0); draw(reduce ? SEQ_N - 1 : 0);
      if (reduce) return;
      for (let i = 1; i < SEQ_N; i += 4) await Promise.all([load(i), load(i + 1), load(i + 2), load(i + 3)]);
    })();
    return { show: p => draw(Math.round(clamp(p, 0, 1) * (SEQ_N - 1))) };
  })();

  /* ---------- highlights: a self-playing track of big cards ---------- */
  (() => {
    const track = $('#hlTrack'), cards = $$('.hl-card', track), dotsBox = $('#hlDots'), play = $('#hlPlay');
    if (!track || !cards.length) return;
    const DUR = 5000; let idx = 0, playing = !reduce, t0 = performance.now(), inView = false, lock2 = 0;
    dotsBox.innerHTML = cards.map((_, i) => `<button aria-label="Highlight ${i + 1}"></button>`).join('');
    const dots = $$('button', dotsBox);
    const mark = () => { dots.forEach((d, i) => { d.classList.toggle('on', i === idx); if (i !== idx) d.style.removeProperty('--p'); }); cards.forEach((c, i) => c.classList.toggle('on', i === idx)); };
    const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const go = i => { idx = (i + cards.length) % cards.length; lock2 = performance.now(); track.scrollTo({ left: cards[idx].offsetLeft - pad(), behavior: reduce ? 'auto' : 'smooth' }); t0 = performance.now(); mark(); };
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    play.addEventListener('click', () => { playing = !playing; play.classList.toggle('paused', !playing); play.setAttribute('aria-label', playing ? 'Pause the highlights' : 'Play the highlights'); t0 = performance.now(); });
    if (!playing) { play.classList.add('paused'); play.setAttribute('aria-label', 'Play the highlights'); }
    track.addEventListener('scroll', () => {
      if (performance.now() - lock2 < 900) return;
      const x = track.scrollLeft + pad(); let best = 0, bd = 1e9;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - x); if (d < bd) { bd = d; best = i; } });
      if (best !== idx) { idx = best; t0 = performance.now(); mark(); }
    }, { passive: true });
    new IntersectionObserver(e => { inView = e[0].isIntersecting; t0 = performance.now(); }, { threshold: .4 }).observe(track);
    const tick = now => {
      if (playing && inView) { const p = (now - t0) / DUR; if (dots[idx]) dots[idx].style.setProperty('--p', Math.min(1, p)); if (p >= 1) go(idx + 1); }
      requestAnimationFrame(tick);
    };
    mark(); requestAnimationFrame(tick);
  })();

  /* ---------- origins: tabs, details, the 3D globe ---------- */
  const ogTabs = $('#ogTabs'), ogInfo = $('#ogInfo');
  ogTabs.innerHTML = D.regions.map((r, i) => `<button role="tab" data-i="${i}">${r.name}</button>`).join('');
  let ogIdx = -1;
  const showRegion = i => {
    if (i === ogIdx) return; ogIdx = i; window.RR_ogIndex = i;
    const r = D.regions[i];
    $$('button', ogTabs).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', String(k === i)); });
    const bar = (l, v) => `<div class="bar"><span>${l}</span><div><i data-w="${v * 20}"></i></div></div>`;
    ogInfo.innerHTML = `<h3 class="og-name">${r.name}</h3><p class="og-tag">${r.tag}</p><p class="og-text">${r.text}</p>
      <div class="chips">${r.notes.map(n => `<span>${n}</span>`).join('')}</div>
      <dl class="og-meta"><div><dt>Altitude</dt><dd>${r.alt}</dd></div><div><dt>Process</dt><dd>${r.process}</dd></div><div><dt>Best for</dt><dd>${r.best}</dd></div></dl>
      <div class="bars">${bar('Acidity', r.bars.acidity)}${bar('Body', r.bars.body)}${bar('Sweetness', r.bars.sweetness)}</div>
      <div class="og-coffees"><p>Coffees from ${r.name}</p>${r.coffees.map(id => { const c = byId(id); return `<button class="og-c" data-id="${id}"><span>${c.name} ›</span><small>${c.time}</small></button>`; }).join('')}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', ogInfo).forEach(b => b.style.width = b.dataset.w + '%')));
    if (hasG) G.fromTo(ogInfo.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .04, ease: 'power3.out', overwrite: true });
    dispatchEvent(new CustomEvent('rr-og', { detail: i }));
  };
  ogTabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showRegion(+b.dataset.i); });
  ogInfo.addEventListener('click', e => { const b = e.target.closest('.og-c'); if (b) openModal([b.dataset.id]); });
  showRegion(0);

  /* ---------- recipe sheet with timers ---------- */
  const modal = $('#modal'), mCard = $('#mCard');
  let lastFocus = null, timers = [];
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const normSteps = r => r.steps.map(s => Array.isArray(s) ? { t: s[0], s: s[1] } : { t: s, s: 0 });
  const block = r => {
    const k = kindOf(r.id), steps = normSteps(r), timed = steps.some(s => s.s > 0);
    return `<section class="rblock" data-rid="${r.id}"><p class="r-k">${k === 'snack' ? 'Snack' : k === 'cold' ? 'Cold coffee' : 'Hot coffee'}</p>
      <h3 class="rname">${r.name}</h3><div class="rmeta"><span>${r.time}</span><span>${tagFor(r.kind, r.g)}</span><span>${r.gear}</span></div>
      <h4>Ingredients</h4><ul class="ing">${r.ing.map(x => `<li>${x}</li>`).join('')}</ul>
      <h4>Method</h4><ol>${steps.map(s => `<li>${s.t}</li>`).join('')}</ol>
      ${timed ? `<div class="m-timer"><div class="tt">00:00</div><div class="tmsg"></div><button data-t="start">Start timer</button><button data-t="reset">Reset</button></div>` : ''}</section>`;
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
      el0 = (now - t0) / 1000; let acc = 0, k = segs.length;
      for (let j = 0; j < segs.length; j++) { if (el0 < acc + segs[j].s) { k = j; break; } acc += segs[j].s; }
      if (k >= segs.length) { run = false; tt.textContent = '00:00'; msg.textContent = 'Ready. Enjoy!'; bS.textContent = 'Again'; lis.forEach(l => l.className = 'done'); return; }
      if (k !== seg) { seg = k; msg.textContent = segs[k].t; lis.forEach((l, j) => l.className = j === segs[k].i ? 'act' : (j < segs[k].i ? 'done' : '')); }
      tt.textContent = fmt(Math.ceil(segs[k].s - (el0 - acc))); raf = requestAnimationFrame(tick);
    };
    bS.addEventListener('click', () => {
      if (run) { run = false; cancelAnimationFrame(raf); bS.textContent = 'Resume'; return; }
      if (bS.textContent === 'Again') reset();
      t0 = performance.now() - el0 * 1000; run = true; bS.textContent = 'Pause'; raf = requestAnimationFrame(tick);
    });
    bR.addEventListener('click', reset); reset();
    timers.push(() => { run = false; cancelAnimationFrame(raf); });
  };
  function openModal(ids, pair) {
    const rs = ids.map(byId).filter(Boolean); if (!rs.length) return;
    lastFocus = document.activeElement; timers = [];
    mCard.innerHTML = `<button class="close" aria-label="Close">✕</button>` +
      (rs.length > 1 ? `<div class="m-head"><h3>${rs[0].name} <i>+</i> ${rs[1].name}</h3><p class="m-why">${pair.why}</p></div><div style="height:26px"></div>` : '') +
      rs.map(block).join('');
    $$('.rblock', mCard).forEach((el, i) => initTimer(el, rs[i]));
    mCard.scrollTop = 0; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); lock(true); $('.close', mCard).focus();
  }
  const closeModal = () => { timers.forEach(f => f()); timers = []; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); lock(false); if (lastFocus) lastFocus.focus(); };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close')) closeModal(); });

  /* ---------- science facts and photo credits ---------- */
  $('#facts').innerHTML = D.facts.map(([a, b]) => `<div class="rv"><b>${a}</b><span>${b}</span></div>`).join('');
  const C = window.RR_CREDITS || {};
  const labels = { 'j-cherry': 'Cherry', 'j-process': 'Process', 'j-roast': 'Roast', 'j-brew': 'Brew', ceremony: 'Ethiopia', 'sec-hot': 'Hot coffee', 'sec-cold': 'Cold coffee', 'sec-snacks': 'Snacks', 'sec-pairs': 'Perfect pairs' };
  $('#creditList').innerHTML = Object.entries(C).filter(([k]) => labels[k]).map(([k, v]) => `<li>${labels[k]}: <a href="${v.page}" target="_blank" rel="noopener">${v.title || 'Photo'}</a> by ${v.artist || 'Unknown'} (${v.license}), via ${v.via || 'Wikimedia Commons'}</li>`).join('');

  /* ---------- recipe pages ---------- */
  const PAGES = {
    hot: { eye: 'Hot coffee', title: 'Served hot.', sub: 'Start with what is in your kitchen. No machine? You can still make a great cup.', labels: ['No machine', 'With machine'], next: 'cold' },
    cold: { eye: 'Cold coffee', title: 'Poured cold.', sub: 'Jar shakes, whipped foam and slow cold brew. Most need nothing more than a glass.', labels: ['No machine', 'With machine'], next: 'snacks' },
    snacks: { eye: 'Snacks', title: 'On the side.', sub: 'Simple, vegetarian and egg-free. Tawa and kadhai, or oven and microwave.', labels: ['No oven', 'Oven or microwave'], next: 'pairs' },
    pairs: { eye: 'Perfect pairs', title: 'Better together.', sub: 'A coffee and a bite that belong together. Open one to see both recipes.', next: 'hot' }
  };
  const NAMES = { hot: 'Hot coffee', cold: 'Cold coffee', snacks: 'Snacks', pairs: 'Perfect pairs' };
  const rpage = $('#rpage'), mainEl = $('main'), rpBody = $('#rpBody'), rpSeg = $('#rpSeg'), rpCount = $('#rpCount');
  let cur = null, grp = 'a';
  const renderGrid = key => {
    if (key === 'pairs') {
      rpBody.innerHTML = `<div class="pairs-grid">${D.pairs.map((p, i) => { const c = byId(p.coffee), s = byId(p.snack), k = kindOf(p.coffee);
        return `<button class="pair" data-i="${i}"><span class="c-tag">${k === 'cold' ? 'Cold' : 'Hot'} coffee + a snack</span><span class="p-row"><span>${c.name}</span><span class="pp">with</span><span>${s.name}</span></span><p>${p.why}</p><span class="c-foot"><span>${c.time} · ${s.time}</span><i class="c-go">View both ›</i></span></button>`; }).join('')}</div>`;
      rpCount.textContent = `${D.pairs.length} pairs`;
    } else {
      rpBody.innerHTML = `<div class="rec-grid">${D.recipes[key][grp].map(r => `<button class="card" data-id="${r.id}"><span class="c-tag">${tagFor(key, grp)}</span><h3>${r.name}</h3><p>${r.desc}</p><span class="c-foot"><span>${r.time}</span><span>${r.gear}</span><i class="c-go">View ›</i></span></button>`).join('')}</div>`;
      rpCount.textContent = `${D.recipes[key][grp].length} recipes`;
    }
    if (hasG && !reduce) G.fromTo($$('.card, .pair', rpBody), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .035, ease: 'power3.out' });
  };
  const applyPage = key => {
    cur = key;
    if (key) {
      const p = PAGES[key]; grp = 'a';
      $('#rpEye').textContent = p.eye; $('#rpTitle').textContent = p.title; $('#rpSub').textContent = p.sub;
      $('#rpImg').src = `images/nat/sec-${key}.webp`; $('#rpImg').alt = NAMES[key];
      $('#rpNextT').textContent = NAMES[p.next]; $('#rpNext').setAttribute('href', '#recipes-' + p.next);
      rpSeg.hidden = !p.labels;
      rpSeg.innerHTML = p.labels ? `<button class="on" data-g="a">${p.labels[0]}</button><button data-g="b">${p.labels[1]}</button>` : '';
      renderGrid(key);
      rpage.hidden = false; mainEl.hidden = true; document.body.classList.add('on-page');
    } else { rpage.hidden = true; mainEl.hidden = false; document.body.classList.remove('on-page'); }
    if (state.lenis) { state.lenis.resize(); state.lenis.scrollTo(0, { immediate: true }); } else scrollTo(0, 0);
    if (hasG) ScrollTrigger.refresh();
  };
  rpSeg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.dataset.g === grp) return; grp = b.dataset.g; $$('button', rpSeg).forEach(x => x.classList.toggle('on', x === b)); renderGrid(cur); });
  rpBody.addEventListener('click', e => {
    const c = e.target.closest('.card'); if (c) return openModal([c.dataset.id]);
    const p = e.target.closest('.pair'); if (p) { const q = D.pairs[+p.dataset.i]; openModal([q.coffee, q.snack], q); }
  });
  const swap = fn => {
    if (reduce || !hasG) return fn();
    const out = cur ? rpage : mainEl;
    G.to(out, { opacity: 0, duration: .25, ease: 'power1.in', onComplete: () => { fn(); G.set(out, { opacity: 1 }); G.fromTo(cur ? rpage : mainEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', clearProps: 'transform' }); } });
  };
  const goTo = sel => { const t = $(sel); if (t) requestAnimationFrame(() => requestAnimationFrame(() => scrollToEl(t, true))); };
  const openPage = key => { closeMenu(); history.pushState(null, '', '#recipes-' + key); swap(() => applyPage(key)); };
  const go = t => {
    if (t.startsWith('page:')) return openPage(t.slice(5));
    history.pushState(null, '', t === '#top' ? location.pathname : t);
    if (cur) swap(() => { applyPage(null); goTo(t); }); else { const el = $(t); if (el) scrollToEl(el); }
  };
  document.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (!a) return; e.preventDefault(); closeMenu(); go(a.dataset.go); });
  $('#rpBack').addEventListener('click', () => { history.pushState(null, '', '#recipes'); swap(() => { applyPage(null); goTo('#recipes'); }); });
  $('#rpNext').addEventListener('click', e => { e.preventDefault(); openPage(PAGES[cur].next); });
  const keyFromHash = () => { const m = /^#recipes-(hot|cold|snacks|pairs)$/.exec(location.hash); return m ? m[1] : null; };
  addEventListener('popstate', () => { const k = keyFromHash(); if (k === cur) return; swap(() => { applyPage(k); if (!k && location.hash.length > 1) goTo(location.hash); }); });
  { const k0 = keyFromHash(); if (k0) applyPage(k0); }

  /* ---------- mobile menu ---------- */
  const menuOv = $('#menuOv'), navBtn = $('#navBtn');
  function closeMenu() { if (!menuOv.classList.contains('open')) return; menuOv.classList.remove('open'); menuOv.setAttribute('aria-hidden', 'true'); navBtn.setAttribute('aria-expanded', 'false'); lock(false); }
  navBtn.addEventListener('click', () => { const open = !menuOv.classList.contains('open'); menuOv.classList.toggle('open', open); menuOv.setAttribute('aria-hidden', String(!open)); navBtn.setAttribute('aria-expanded', String(open)); lock(open); });
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (modal.classList.contains('open')) closeModal(); else closeMenu(); });

  /* ---------- the statement: words light up as you read ---------- */
  const sayT = $('#sayT');
  sayT.innerHTML = sayT.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');

  /* ---------- no animation library: show everything ---------- */
  if (!hasG) { document.documentElement.classList.remove('js'); if (seq) seq.show(1); $$('#molSvg .bonds path').forEach(p => p.style.strokeDashoffset = 0); $('#molFormula').style.opacity = 1; $$('.say-t .w').forEach(w => w.style.color = '#f5f5f7'); return; }

  /* ---------- hero: the copy rises, the pour starts, the scroll finishes it ---------- */
  const heroAuto = { v: 0 }; let heroTarget = 0, heroP = 0;
  const heroRender = () => { if (seq) seq.show(heroAuto.v + (1 - heroAuto.v) * heroP); };
  if (!reduce) G.from('.hero-copy > *', { y: 30, opacity: 0, duration: 1.1, stagger: .1, ease: 'power3.out', delay: .15 });
  if (seq && !reduce) {
    G.to(heroAuto, { v: .16, duration: 2.6, ease: 'power2.out', delay: .4, onUpdate: heroRender });
    G.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: () => '+=' + Math.round(innerHeight * 1.4), pin: true, scrub: .5, invalidateOnRefresh: true, onUpdate: s => { heroTarget = s.progress; } } })
      .to('.hero-copy', { y: -50, opacity: 0, ease: 'none', duration: .3 }, 0)
      .fromTo('#hEnd', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none', duration: .25 }, .72);
    G.ticker.add(() => { const d = heroTarget - heroP; if (Math.abs(d) > .0004) { heroP += d * .18; heroRender(); } });
  }
  /* the light local nav appears once the hero is done */
  ScrollTrigger.create({ trigger: '#highlights', start: 'top 52px', onEnter: () => $('#lnav').classList.add('show'), onLeaveBack: () => $('#lnav').classList.remove('show') });

  /* ---------- quiet reveals ---------- */
  ScrollTrigger.batch('main .rv', { start: 'top 90%', once: true, onEnter: els => G.to(els, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'power3.out' }) });

  /* ---------- story: the photo changes with the step you read ---------- */
  const frameImgs = $$('#stFrame img'), stepEls = $$('.st-step');
  const setStep = i => { stepEls.forEach((s, k) => s.classList.toggle('on', k === i)); frameImgs.forEach((im, k) => im.classList.toggle('on', k === i)); };
  setStep(0);
  stepEls.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 60%', end: 'bottom 40%', onToggle: self => { if (self.isActive) setStep(i); } }));

  /* ---------- statement colour ---------- */
  G.to('#sayT .w', { color: '#f5f5f7', stagger: .05, ease: 'none', scrollTrigger: { trigger: '#sayT', start: 'top 80%', end: 'bottom 45%', scrub: true } });

  /* ---------- science: the caffeine molecule draws as you scroll ---------- */
  const bonds = $$('#molSvg .bonds path'), atoms = $$('#molSvg .atoms text'), molName = $('#molName'), molFormula = $('#molFormula');
  bonds.forEach(p => { p._L = p.getTotalLength(); p.style.strokeDasharray = p._L; p.style.strokeDashoffset = p._L; });
  atoms.forEach(a => a.style.opacity = 0);
  const molRender = p => {
    const n = bonds.length;
    bonds.forEach((b, i) => { const t = clamp((p * (n + 2) - i) / 2, 0, 1); b.style.strokeDashoffset = b._L * (1 - t); });
    atoms.forEach((a, i) => a.style.opacity = clamp((p - .35) * 2.4 - i * .05, 0, 1));
    molFormula.style.opacity = clamp((p - .85) * 7, 0, 1);
    molName.textContent = p < .04 ? 'Scroll to build the molecule' : p < .98 ? 'Building caffeine…' : 'Caffeine';
  };
  molRender(0);
  ScrollTrigger.create({ trigger: '.sc-grid', start: 'top 80%', end: 'top 20%', scrub: .2, onUpdate: s => molRender(s.progress) });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
