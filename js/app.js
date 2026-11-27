/* Roast & Ritual: a coffee house on kraft paper. GSAP + ScrollTrigger + Lenis. */
(() => {
  const D = window.RR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
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
    const off = el.id === 'top' ? 0 : -70;
    if (state.lenis) state.lenis.scrollTo(el, { immediate: !!immediate, offset: off, duration: 1.4 });
    else scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: immediate || reduce ? 'auto' : 'smooth' });
  };
  const lock = on => { if (state.lenis) (on ? state.lenis.stop() : state.lenis.start()); document.documentElement.style.overflow = on ? 'hidden' : ''; };

  /* ---------- data ---------- */
  const all = [];
  Object.entries(D.recipes).forEach(([kind, groups]) => Object.entries(groups).forEach(([g, list]) => list.forEach(r => all.push({ ...r, kind, g }))));
  const byId = id => all.find(r => r.id === id);
  const kindOf = id => id[0] === 'c' ? 'cold' : id[0] === 's' ? 'snack' : 'hot';
  const countOf = k => k === 'pairs' ? D.pairs.length : D.recipes[k].a.length + D.recipes[k].b.length;
  const counts = { origins: D.regions.length, coffees: countOf('hot') + countOf('cold'), snacks: countOf('snacks') };
  $$('[data-n]').forEach(e => e.textContent = counts[e.dataset.n] != null ? counts[e.dataset.n] : countOf(e.dataset.n));
  const tagFor = (kind, g) => g === 'a' ? (kind === 'snacks' ? 'No oven needed' : 'No machine needed') : (kind === 'snacks' ? 'Oven or microwave' : 'Machine or equipment');

  /* ---------- header: paper strip once you scroll ---------- */
  const nav = $('#nav'), toTop = $('#toTop'), tpFill = $('#tpFill'), RING = 2 * Math.PI * 27;
  const onScroll = () => {
    nav.classList.toggle('stuck', scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight, p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    tpFill.style.strokeDashoffset = (RING * (1 - p)).toFixed(2);
    toTop.classList.toggle('show', scrollY > innerHeight * .6);
  };
  toTop.addEventListener('click', () => {
    history.replaceState(null, '', location.pathname);
    if (state.lenis) state.lenis.scrollTo(0, { duration: 1.6 }); else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- origins: tabs, details, the 3D globe ---------- */
  const ogTabs = $('#ogTabs'), ogInfo = $('#ogInfo');
  ogTabs.innerHTML = D.regions.map((r, i) => `<button role="tab" data-i="${i}" aria-selected="false">${r.name}</button>`).join('');
  let ogIdx = -1;
  const showRegion = (i, quiet) => {
    if (i === ogIdx) return; ogIdx = i; window.RR_ogIndex = i;
    const r = D.regions[i];
    $$('button', ogTabs).forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', String(k === i)); });
    const bar = (l, v) => `<div class="bar"><span>${l}</span><div><i data-w="${v * 20}"></i></div></div>`;
    ogInfo.innerHTML = `<h3 class="og-name">${r.name}</h3><p class="og-tag">${r.tag}</p><p class="og-text">${r.text}</p>
      <div class="chips">${r.notes.map(n => `<span>${n}</span>`).join('')}</div>
      <dl class="og-meta"><div><dt>Altitude</dt><dd>${r.alt}</dd></div><div><dt>Process</dt><dd>${r.process}</dd></div><div><dt>Best for</dt><dd>${r.best}</dd></div></dl>
      <div class="bars">${bar('Acidity', r.bars.acidity)}${bar('Body', r.bars.body)}${bar('Sweetness', r.bars.sweetness)}</div>
      <div class="og-coffees"><p>Coffees from ${r.name}</p>${r.coffees.map(id => { const c = byId(id); return c ? `<button class="og-c" data-id="${id}"><span>${c.name}</span><small>${c.time}</small></button>` : ''; }).join('')}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', ogInfo).forEach(b => b.style.width = b.dataset.w + '%')));
    if (hasG && !reduce && !quiet) G.fromTo(ogInfo.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .04, ease: 'power3.out', overwrite: true });
    dispatchEvent(new CustomEvent('rr-og', { detail: i }));
  };
  ogTabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showRegion(+b.dataset.i); });
  ogInfo.addEventListener('click', e => { const b = e.target.closest('.og-c'); if (b) openModal([b.dataset.id]); });
  showRegion(0, true);

  /* ---------- the menu: four lists, a photo in the middle ---------- */
  const MENU = {
    hot: { img: 'm-hot', alt: 'A white cup of black coffee on a saucer beside roasted beans', cap: 'Start with what is in your kitchen.', labels: ['No machine', 'With machine'] },
    cold: { img: 'm-cold', alt: 'Cream pouring into a glass of iced coffee', cap: 'Jar shakes, whipped foam and slow cold brew.', labels: ['No machine', 'With machine'] },
    snacks: { img: 'm-snacks', alt: 'A cup of coffee with biscuits on a wooden tray', cap: 'Vegetarian, egg-free, made on a tawa or in an oven.', labels: ['No oven', 'Oven or microwave'] },
    pairs: { img: 'm-pairs', alt: 'A latte with heart art next to cookies', cap: 'A coffee and a bite that belong together.' }
  };
  const mnTabs = $('#mnTabs'), mnSeg = $('#mnSeg'), mnL = $('#mnL'), mnR = $('#mnR'), mnImg = $('#mnImg'), mnCap = $('#mnCap');
  let mKey = 'hot', mGrp = 'a';
  const item = (attrs, name, time, desc) => `<li><button class="mn-item" ${attrs}><span class="mn-row"><span class="mn-name">${name}</span><span class="mn-dots"></span><span class="mn-time">${time}</span></span><span class="mn-desc">${desc}</span></button></li>`;
  const renderMenu = animate => {
    const m = MENU[mKey];
    let rows;
    if (mKey === 'pairs') rows = D.pairs.map((p, i) => { const c = byId(p.coffee), s = byId(p.snack); return item(`data-pair="${i}"`, `${c.name} <i>+</i> ${s.name}`, c.time, p.why); });
    else rows = D.recipes[mKey][mGrp].map(r => item(`data-id="${r.id}"`, r.name, r.time, r.desc));
    const half = Math.ceil(rows.length / 2);
    mnL.innerHTML = rows.slice(0, half).join(''); mnR.innerHTML = rows.slice(half).join('');
    mnSeg.innerHTML = m.labels ? `<button data-g="a" class="${mGrp === 'a' ? 'on' : ''}">${m.labels[0]}</button><span>·</span><button data-g="b" class="${mGrp === 'b' ? 'on' : ''}">${m.labels[1]}</button>` : '';
    mnCap.textContent = m.cap;
    const src = `images/px/${m.img}.webp`;
    if (!mnImg.src.endsWith(src)) {
      mnImg.style.opacity = 0;
      const im = new Image(); im.onload = im.onerror = () => { mnImg.src = src; mnImg.alt = m.alt; mnImg.style.opacity = 1; }; im.src = src;
    }
    if (animate && hasG && !reduce) G.fromTo($$('.mn-item', $('.mn-grid')), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .03, ease: 'power3.out' });
  };
  const setTab = (k, animate) => {
    if (!MENU[k]) return; mKey = k; mGrp = 'a';
    $$('button', mnTabs).forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
    renderMenu(animate);
  };
  mnTabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.k !== mKey) { setTab(b.dataset.k, true); history.replaceState(null, '', '#recipes-' + b.dataset.k); } });
  mnSeg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.dataset.g === mGrp) return; mGrp = b.dataset.g; renderMenu(true); });
  $('.mn-grid').addEventListener('click', e => {
    const b = e.target.closest('.mn-item'); if (!b) return;
    if (b.dataset.id) openModal([b.dataset.id]);
    else { const p = D.pairs[+b.dataset.pair]; openModal([p.coffee, p.snack], p); }
  });
  setTab('hot', false);

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
      (rs.length > 1 ? `<div class="m-head"><p class="r-k">Perfect pair</p><h3 style="margin-top:10px">${rs[0].name} <i>+</i> ${rs[1].name}</h3><p class="m-why">${pair.why}</p></div><div style="height:34px"></div>` : '') +
      rs.map(block).join('');
    $$('.rblock', mCard).forEach((el, i) => initTimer(el, rs[i]));
    mCard.scrollTop = 0; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); lock(true); $('.close', mCard).focus();
  }
  const closeModal = () => { timers.forEach(f => f()); timers = []; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); lock(false); if (lastFocus) lastFocus.focus(); };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close')) closeModal(); });

  /* ---------- science facts and photo credits ---------- */
  $('#facts').innerHTML = D.facts.map(([a, b]) => `<div class="rv"><b>${a}</b><span>${b}</span></div>`).join('');
  $('#creditList').innerHTML = (Array.isArray(window.RR_CREDITS) ? window.RR_CREDITS : []).map(([k, t, a, u]) => `<li>${k}: <a href="${u}" target="_blank" rel="noopener">${t}</a> by ${a}, via Pexels</li>`).join('');

  /* ---------- links: scroll, or open a menu list ---------- */
  const menuOv = $('#menuOv'), navBtn = $('#navBtn');
  function closeMenu() { if (!menuOv.classList.contains('open')) return; menuOv.classList.remove('open'); menuOv.setAttribute('aria-hidden', 'true'); navBtn.setAttribute('aria-expanded', 'false'); lock(false); }
  navBtn.addEventListener('click', () => { const open = !menuOv.classList.contains('open'); menuOv.classList.toggle('open', open); menuOv.setAttribute('aria-hidden', String(!open)); navBtn.setAttribute('aria-expanded', String(open)); lock(open); });
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (modal.classList.contains('open')) closeModal(); else closeMenu(); });
  const go = t => {
    if (t.startsWith('tab:')) { const k = t.slice(4); setTab(k, true); history.replaceState(null, '', '#recipes-' + k); return scrollToEl($('#recipes')); }
    history.replaceState(null, '', t === '#top' ? location.pathname : t);
    const el = $(t); if (el) scrollToEl(el);
  };
  document.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (!a) return; e.preventDefault(); const wasOpen = menuOv.classList.contains('open'); closeMenu(); if (wasOpen) setTimeout(() => go(a.dataset.go), 60); else go(a.dataset.go); });
  { const m = /^#recipes-(hot|cold|snacks|pairs)$/.exec(location.hash); if (m) { setTab(m[1], false); addEventListener('load', () => scrollToEl($('#recipes'), true)); } }

  /* ---------- no animation library: show everything ---------- */
  if (!hasG) { document.documentElement.classList.remove('js'); $$('#molSvg .bonds path').forEach(p => p.style.strokeDashoffset = 0); return; }
  if (reduce) { G.set('.rv', { opacity: 1 }); return; }

  /* ---------- hero: the table is set ---------- */
  G.set('.fb img', { rotation: i => [-24, 38, -62, 14, 80][i] || 0 });
  const intro = G.timeline({ defaults: { ease: 'power3.out' }, delay: .1 });
  intro.from('.hb', { x: -180, y: 80, rotation: -10, opacity: 0, duration: 1.8 }, 0)
    .from('.hc', { x: 200, y: -30, rotation: 48, opacity: 0, duration: 1.9 }, .1)
    .from('.h-eye', { y: 20, opacity: 0, duration: 1 }, .45)
    .from('.h-title .ln', { y: 46, opacity: 0, letterSpacing: '.42em', duration: 1.5, stagger: .14, ease: 'expo.out' }, .5)
    .from('.h-copy .divider i', { scaleX: 0, duration: 1.1, ease: 'power2.inOut' }, .95)
    .from('.h-copy .divider svg', { scale: 0, rotation: -120, duration: .9, ease: 'back.out(2)' }, 1.05)
    .from('.h-sub, .h-cta', { y: 24, opacity: 0, duration: 1, stagger: .12 }, 1.15)
    .from('.fb', { scale: 0, opacity: 0, duration: 1, stagger: .09, ease: 'back.out(2.2)' }, .9)
    .from('.h-scroll', { opacity: 0, duration: 1 }, 1.6);
  /* beans drift on their own */
  $$('.fb img').forEach((im, i) => G.to(im, { y: i % 2 ? 10 : -12, rotation: `+=${i % 2 ? 14 : -12}`, duration: 3.2 + i * .45, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
  /* the scene answers the pointer */
  if (fine) {
    const movers = $$('.hero .pm').map(el => ({ d: +el.dataset.d, x: G.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }), y: G.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }) }));
    $('#hero').addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      movers.forEach(m => { m.x(nx * m.d); m.y(ny * m.d); });
    });
  }
  /* scroll: the cup turns, the beans slide away, the words lift */
  const hs = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true };
  G.to('.hc-img', { rotation: 34, ease: 'none', scrollTrigger: hs });
  G.to('.hc', { yPercent: 26, ease: 'none', scrollTrigger: hs });
  G.to('.hb', { yPercent: -16, ease: 'none', scrollTrigger: hs });
  $$('.fb').forEach((f, i) => G.to(f, { yPercent: -(140 + i * 90), ease: 'none', scrollTrigger: hs }));
  G.to('.h-copy', { yPercent: 18, opacity: .15, ease: 'none', scrollTrigger: { ...hs, start: 'top top', end: 'bottom 20%' } });

  /* ---------- quiet reveals ---------- */
  G.set('.rv', { y: 40 });
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: els => G.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: .1, ease: 'power3.out', overwrite: true }) });
  /* every section divider draws itself */
  $$('main .divider').forEach(d => {
    if (d.closest('.h-copy')) return;
    G.timeline({ scrollTrigger: { trigger: d, start: 'top 90%', once: true } })
      .from($$('i', d), { scaleX: 0, duration: 1.1, ease: 'power2.inOut' }, .15)
      .from($('svg', d), { scale: 0, rotation: -120, duration: .9, ease: 'back.out(2)' }, .3);
  });

  /* ---------- journey: photos open like a curtain, frames slide into place ---------- */
  $$('.step').forEach((s, i) => {
    const clip = $('.s-clip', s), img = $('img', clip), frame = $('.s-frame', s), dir = i % 2 ? 1 : -1;
    G.timeline({ scrollTrigger: { trigger: s, start: 'top 78%', once: true } })
      .fromTo(clip, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0)
      .from(img, { scale: 1.3, duration: 2, ease: 'expo.out' }, .2)
      .from(frame, { x: 26 * dir, y: -26, opacity: 0, duration: 1.4, ease: 'power3.out' }, .6);
    G.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- photo bands: slow parallax ---------- */
  $$('.band').forEach(b => G.fromTo($('.bn-img', b), { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- menu photo frame ---------- */
  G.from('.mn-fig .s-frame', { scale: .9, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.mn-fig', start: 'top 80%', once: true } });
  ScrollTrigger.create({ trigger: '.mn-grid', start: 'top 85%', once: true, onEnter: () => G.fromTo($$('.mn-item', $('.mn-grid')), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .04, ease: 'power3.out' }) });

  /* ---------- science: the caffeine molecule draws as you scroll ---------- */
  const bonds = $$('#molSvg .bonds path'), atoms = $$('#molSvg .atoms text'), molName = $('#molName'), molFormula = $('#molFormula');
  bonds.forEach(p => { p._L = p.getTotalLength(); p.style.strokeDasharray = p._L; p.style.strokeDashoffset = p._L; });
  const molRender = p => {
    const n = bonds.length;
    bonds.forEach((b, i) => { const t = clamp((p * (n + 2) - i) / 2, 0, 1); b.style.strokeDashoffset = b._L * (1 - t); });
    atoms.forEach((a, i) => a.style.opacity = clamp((p - .35) * 2.4 - i * .05, 0, 1));
    molFormula.style.opacity = clamp((p - .85) * 7, 0, 1);
    molName.textContent = p < .04 ? 'Scroll to build the molecule' : p < .98 ? 'Building caffeine…' : 'Caffeine';
  };
  molRender(0);
  ScrollTrigger.create({ trigger: '.sc-grid', start: 'top 80%', end: 'top 25%', scrub: .2, onUpdate: s => molRender(s.progress) });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
