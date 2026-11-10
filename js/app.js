/* Roast & Ritual: interactions and effects */
(() => {
  const D = window.RR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const small = matchMedia('(max-width:820px)').matches;
  const G = window.gsap, hasG = !!G && !!window.ScrollTrigger;
  if (hasG) G.registerPlugin(ScrollTrigger);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(lerp(v, hex(b)[i], t)).toString(16).padStart(2, '0')).join('');
  const state = { coldInView: false, lenis: null };

  /* ---------- smooth scroll ---------- */
  if (hasG && window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    state.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el, immediate) => {
    if (state.lenis) state.lenis.scrollTo(el, { immediate: !!immediate, offset: 0 });
    else el.scrollIntoView();
  };

  /* ---------- progress, nav, back to top ---------- */
  const prog = $('#progress'), nav = $('#nav'), toTop = $('#toTop'), ttArc = $('#ttArc');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? clamp(scrollY / h, 0, 1) : 0;
    prog.style.transform = `scaleX(${p})`;
    ttArc.style.strokeDashoffset = 132 * (1 - p);
    nav.classList.toggle('scrolled', scrollY > 60);
    toTop.classList.toggle('show', scrollY > 600);
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

  /* ---------- origins ---------- */
  const ogList = $('#ogList'), ogCard = $('#ogCard'), ogBg = $('#ogBg');
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
    ogBg.classList.add('swap');
    setTimeout(() => { ogBg.style.backgroundImage = `url(${r.img})`; ogBg.classList.remove('swap'); }, 280);
    const bar = (l, v) => `<div class="bar"><span>${l}</span><div><i data-w="${v * 20}"></i></div></div>`;
    ogCard.innerHTML = `<h3>${r.name}</h3><p class="tag">${r.tag}</p><p>${r.text}</p>
      <div class="chips">${r.notes.map(n => `<span>${n}</span>`).join('')}</div>
      <div class="meta"><div><b>Altitude</b>${r.alt}</div><div><b>Process</b>${r.process}</div><div><b>Best for</b>${r.best}</div></div>
      <div class="bars">${bar('Acidity', r.bars.acidity)}${bar('Body', r.bars.body)}${bar('Sweetness', r.bars.sweetness)}</div>
      <div class="og-coffees"><b>Coffees from ${r.name}</b><div class="og-cl">${r.coffees.map(id => { const c = byId(id); return `<button class="og-c" data-id="${id}"><span>${c.name}</span><small>${c.time}</small></button>`; }).join('')}</div></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', ogCard).forEach(b => b.style.width = b.dataset.w + '%')));
    if (hasG) G.fromTo(ogCard.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06, ease: 'power3.out', overwrite: true });
  };
  ogList.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showRegion(+b.dataset.i); });
  ogCard.addEventListener('click', e => { const b = e.target.closest('.og-c'); if (b) openModal([b.dataset.id]); });
  ogList.addEventListener('mouseover', e => { const b = e.target.closest('button'); if (b && fine) showRegion(+b.dataset.i); });
  showRegion(0);
  if (fine && hasG && !reduce) {
    ogCard.addEventListener('mousemove', e => {
      const b = ogCard.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      G.to(ogCard, { rotateY: x * 5, rotateX: -y * 5, transformPerspective: 900, duration: .5, ease: 'power2.out' });
    });
    ogCard.addEventListener('mouseleave', () => G.to(ogCard, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power3.out' }));
  }

  /* ---------- roast lab ---------- */
  const rRange = $('#rRange'), rBody = $('#rbBody');
  $('#rBars').innerHTML = ['Acidity', 'Body', 'Sweetness'].map(l => `<div class="bar"><span>${l}</span><div><i></i></div></div>`).join('');
  const rBarEls = $$('#rBars .bar i');
  let rLast = -1;
  const roastRender = () => {
    const v = +rRange.value, a = Math.floor(v), b = Math.min(3, a + 1), t = v - a;
    const A = D.roasts[a], B = D.roasts[b];
    rBody.setAttribute('fill', mix(A.color, B.color, t));
    ['acid', 'body', 'sweet'].forEach((k, i) => rBarEls[i].style.width = (lerp(A[k], B[k], t) * 20) + '%');
    const n = Math.round(v);
    if (n !== rLast) {
      rLast = n; const R = D.roasts[n];
      $('#rName').textContent = R.name + ' Roast'; $('#rTemp').textContent = R.temp;
      $('#rText').textContent = R.text; $('#rNote').textContent = R.note;
    }
  };
  rRange.addEventListener('input', roastRender); roastRender();

  /* ---------- recipe sections (hot, cold, snacks) ---------- */
  $$('.rec').forEach(sec => {
    const kind = sec.dataset.kind, grid = $('.rec-grid', sec), tg = $('.toggle', sec), thumb = $('.thumb', tg);
    const labels = tg.dataset.labels.split('|'), btns = $$('button', tg);
    btns.forEach((b, i) => b.textContent = labels[i]);
    let g = 'a';
    const place = () => { const on = $('button.on', tg); thumb.style.width = on.offsetWidth + 'px'; thumb.style.transform = `translateX(${on.offsetLeft - 5}px)`; };
    const render = animate => {
      grid.innerHTML = D.recipes[kind][g].map(r => `<button class="card" data-id="${r.id}">
        <span class="tagline">${g === 'a' ? (kind === 'snacks' ? 'No oven needed' : 'No machine needed') : (kind === 'snacks' ? 'Oven or microwave' : 'Machine or equipment')}</span>
        <h3>${r.name}</h3><p>${r.desc}</p>
        <div class="foot2"><span>${r.time}</span><b>${r.gear}</b></div></button>`).join('');
      if (animate && hasG) G.fromTo($$('.card', grid), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .06, ease: 'power3.out' });
    };
    render(false);
    tg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.dataset.g === g) return;
      g = b.dataset.g; btns.forEach(x => x.classList.toggle('on', x === b)); place(); render(true);
    });
    grid.addEventListener('mousemove', e => {
      const c = e.target.closest('.card'); if (!c) return; const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    grid.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) openModal([c.dataset.id]); });
    const openBtn = $('.rec-open', sec), body = $('.rec-body', sec); let isOpen = false;
    $('.ro-count', openBtn).textContent = `· ${D.recipes[kind].a.length + D.recipes[kind].b.length} recipes`;
    const setOpen = v => {
      isOpen = v; openBtn.setAttribute('aria-expanded', v); openBtn.classList.toggle('on', v);
      $('.ro-label', openBtn).textContent = v ? 'Hide recipes' : 'See recipes';
      if (hasG && !reduce) {
        G.to(body, { height: v ? 'auto' : 0, duration: .9, ease: 'power3.inOut', onComplete() { place(); ScrollTrigger.refresh(); } });
        if (v) G.fromTo($$('.card', grid), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, delay: .35, ease: 'power3.out' });
      } else { body.style.height = v ? 'auto' : '0'; place(); }
    };
    openBtn.addEventListener('click', () => setOpen(!isOpen));
    $('.h-big', sec).addEventListener('click', () => setOpen(!isOpen));
    place(); addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  });

  /* ---------- pairs ---------- */
  $('#pairsGrid').innerHTML = D.pairs.map((p, i) => {
    const c = byId(p.coffee), s = byId(p.snack), k = kindOf(p.coffee);
    return `<button class="pair" data-i="${i}"><span class="kind"><span class="${k}">${k}</span></span>
      <span class="pr-names"><span>${c.name}</span><i>+</i><span>${s.name}</span></span><p>${p.why}</p><span class="more">See both recipes &rarr;</span></button>`;
  }).join('');
  $('#pairsGrid').addEventListener('click', e => { const b = e.target.closest('.pair'); if (!b) return; const p = D.pairs[+b.dataset.i]; openModal([p.coffee, p.snack], p); });

  /* ---------- recipe modal with timers ---------- */
  const modal = $('#modal'), mCard = $('#mCard');
  let lastFocus = null, timers = [];
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const normSteps = r => r.steps.map(s => Array.isArray(s) ? { t: s[0], s: s[1] } : { t: s, s: 0 });
  const block = (r, single) => {
    const k = kindOf(r.id), steps = normSteps(r), timed = steps.some(s => s.s > 0);
    const tag = r.g === 'a' ? (r.kind === 'snacks' ? 'No oven needed' : 'No machine needed') : (r.kind === 'snacks' ? 'Oven or microwave' : 'Machine or equipment');
    return `<section class="rblock ${k}" data-rid="${r.id}">
      <p class="eyebrow" style="color:var(--acc)">${k === 'snack' ? 'Snack' : k === 'cold' ? 'Cold coffee' : 'Hot coffee'}</p>
      <${single ? 'h3 class="rname" style="font-size:clamp(2rem,5vw,3rem);padding-right:2.6rem"' : 'div class="rname"'}>${r.name}</${single ? 'h3' : 'div'}>
      <div class="rmeta"><span>${r.time}</span><span>${tag}</span><span>${r.gear}</span></div>
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
    mCard.innerHTML = `<button class="close" aria-label="Close">&#10005;</button>` +
      (single ? '' : `<div class="m-head"><p class="eyebrow">Perfect pair</p><h3>${rs[0].name} <i>+</i> ${rs[1].name}</h3><p class="m-why">${pair.why}</p></div><div style="height:1.6rem"></div>`) +
      rs.map(r => block(r, single)).join('');
    $$('.rblock', mCard).forEach((el, i) => initTimer(el, rs[i]));
    mCard.scrollTop = 0;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    if (state.lenis) state.lenis.stop(); else document.body.style.overflow = 'hidden';
    $('.close', mCard).focus();
  }
  const closeModal = () => {
    timers.forEach(f => f()); timers = [];
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    if (state.lenis) state.lenis.start(); else document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close')) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  /* ---------- facts, stats, credits ---------- */
  $('#facts').innerHTML = D.facts.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('');
  $('#stOrigins').dataset.count = D.regions.length;
  $('#stCoffee').dataset.count = all.filter(r => r.kind !== 'snacks').length;
  $('#stSnacks').dataset.count = all.filter(r => r.kind === 'snacks').length;
  const C = window.RR_CREDITS || {};
  const labels = { hero: 'Hero', ceremony: 'Ethiopia', colombia: 'Colombia', cherries: 'Brazil and Journey', vietnam: 'Vietnam', filter: 'India', kenya: 'Kenya', origin: 'Journey', drum: 'Roaster', brew: 'Brew' };
  $('#creditList').innerHTML = Object.entries(C).map(([k, v]) => `<li>${labels[k] || k}: <a href="${v.page}" target="_blank" rel="noopener">${v.title || 'Photo'}</a> by ${v.artist || 'Unknown'} (${v.license}), via Wikimedia Commons</li>`).join('');

  /* ---------- no animation library: show everything and stop ---------- */
  if (!hasG) {
    $('#loader').remove(); $$('.reveal').forEach(e => e.classList.remove('reveal')); $$('.ln .ch').forEach(e => e.style.transform = 'none');
    $$('#molSvg .bonds path').forEach(p => p.style.strokeDashoffset = 0); $$('#molSvg .atoms text').forEach(t => t.style.opacity = 1);
    $('#molFormula').style.opacity = 1;
    return;
  }

  /* ---------- hero title split + loader ---------- */
  $$('#heroTitle .ln').forEach(l => {
    if (l.classList.contains('amp')) { l.innerHTML = `<span class="ch">${l.textContent}</span>`; return; }
    l.innerHTML = [...l.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  });
  const ldFill = $('#ldFill'), ldNum = $('#ldNum'), loader = $('#loader'), cnt = { v: 0 };
  const intro = () => G.timeline()
    .to('#heroTitle .ch', { y: 0, duration: 1.1, stagger: .045, ease: 'expo.out' })
    .to('.hero .reveal', { opacity: 1, y: 0, duration: .9, stagger: .12, ease: 'power3.out' }, '-=.7');
  document.body.style.overflow = 'hidden';
  G.timeline({ delay: .2 })
    .to(cnt, { v: 100, duration: reduce ? .1 : 1.9, ease: 'power1.inOut', onUpdate() { ldNum.textContent = Math.round(cnt.v); ldFill.setAttribute('y', 100 - cnt.v * .6); } })
    .to('.ld-inner', { opacity: 0, y: -20, duration: .5 })
    .to('.ld-curtain.l', { xPercent: -101, duration: 1, ease: 'expo.inOut' }, '<.1')
    .to('.ld-curtain.r', { xPercent: 101, duration: 1, ease: 'expo.inOut' }, '<')
    .add(() => { loader.style.pointerEvents = 'none'; document.body.style.overflow = ''; intro(); }, '-=.5')
    .set(loader, { display: 'none' }, '+=.8');

  /* ---------- page pour transition ---------- */
  const pour = $('#pour');
  $$('[data-pour]').forEach(a => a.addEventListener('click', e => {
    const tgt = $(a.getAttribute('href')); if (!tgt) return;
    e.preventDefault();
    if (reduce) return scrollToEl(tgt, true);
    G.timeline()
      .set(pour, { yPercent: 0, y: '100%' })
      .to(pour, { y: '0%', duration: .65, ease: 'power3.in' })
      .add(() => scrollToEl(tgt, true))
      .to(pour, { y: '-100%', duration: .7, ease: 'power3.out', delay: .1 });
  }));

  /* ---------- reveals and counters ---------- */
  $$('section:not(.hero) .eyebrow, .h-med, .h-big.sm, .rec-sub, .rec-open, .roast-grid, .levels, .mol-inner > *, .og-list li, .stat, .jstep, .pairs-grid')
    .forEach(e => e.classList.add('reveal'));
  ScrollTrigger.batch('section:not(.hero) .reveal', {
    start: 'top 92%', once: true,
    onEnter: els => G.to(els, { opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out' })
  });
  $$('[data-count]').forEach(el => ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => { const o = { v: 0 }; G.to(o, { v: +el.dataset.count, duration: 1.8, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }); }
  }));

  /* ---------- hero: mouse parallax + pinned scroll-drawn caffeine formula ---------- */
  if (fine && !reduce) {
    const layers = $$('[data-depth]');
    const qs = layers.map(l => [G.quickTo(l, 'x', { duration: .9, ease: 'power3' }), G.quickTo(l, 'y', { duration: .9, ease: 'power3' }), +l.dataset.depth]);
    $('#hero').addEventListener('mousemove', e => {
      const x = e.clientX - innerWidth / 2, y = e.clientY - innerHeight / 2;
      qs.forEach(([qx, qy, d]) => { qx(x * d); qy(y * d); });
    });
  }
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
  ScrollTrigger.create({ trigger: '#molSvg', start: 'top 95%', end: 'top 45%', scrub: .2, onUpdate: s => molRender(s.progress) });

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('[data-mag]').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('mouseleave', () => G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });

  /* ---------- cursor: a single coffee bean ---------- */
  const bean = $('#cur-bean');
  if (fine && !reduce) {
    document.body.classList.add('has-cursor');
    addEventListener('mousemove', e => { bean.style.opacity = 1; bean.style.transform = `translate(${e.clientX}px,${e.clientY}px) rotate(32deg)`; });
    document.addEventListener('mouseleave', () => bean.style.opacity = 0);
    document.addEventListener('mouseover', e => bean.classList.toggle('hov', !!e.target.closest('a,button,input,.card,.pair')));
  }

  /* ---------- falling beans, or ice cubes in the cold section ---------- */
  const cv = $('#fall'), ctx = cv.getContext('2d');
  let W = 0, H = 0; const DPR = Math.min(devicePixelRatio || 1, 2);
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  size(); addEventListener('resize', size);
  const N = small ? 7 : 14;
  const mk = top => ({ x: Math.random() * W, y: top ? -40 : Math.random() * H, s: 6 + Math.random() * 13, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .7, vx: (Math.random() - .5) * .25, k: Math.random() * 10 });
  const ps = Array.from({ length: N }, () => mk(false));
  let cold = 0, vel = 0;
  ScrollTrigger.create({ trigger: '#cold', start: 'top 70%', end: 'bottom 30%', onToggle: s => state.coldInView = s.isActive });
  const drawBean = (p, a) => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = a;
    ctx.fillStyle = '#6b4126'; ctx.beginPath(); ctx.ellipse(0, 0, p.s * .62, p.s, 0, 0, 6.29); ctx.fill();
    ctx.strokeStyle = '#2a170c'; ctx.lineWidth = Math.max(1, p.s * .12); ctx.beginPath();
    ctx.moveTo(0, -p.s * .9); ctx.quadraticCurveTo(p.s * .35, 0, 0, p.s * .9); ctx.stroke(); ctx.restore();
  };
  const drawIce = (p, a) => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = a; const s = p.s * 1.1;
    ctx.fillStyle = 'rgba(190,225,240,.22)'; ctx.strokeStyle = 'rgba(220,240,250,.7)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, s * .22); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(-s * .3, -s * .1); ctx.lineTo(-s * .1, -s * .3); ctx.stroke(); ctx.restore();
  };
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    cold = lerp(cold, state.coldInView ? 1 : 0, .04);
    vel = lerp(vel, state.lenis ? state.lenis.velocity : 0, .1);
    for (const p of ps) {
      p.y += p.vy + Math.abs(vel) * .35; p.x += p.vx + Math.sin(p.y / 90 + p.k) * .25; p.r += p.vr + vel * .002;
      if (p.y > H + 40) Object.assign(p, mk(true), { x: Math.random() * W });
      const a = .14 + (p.s / 19) * .26;
      if (cold > .5) drawIce(p, a); else drawBean(p, a);
    }
    requestAnimationFrame(loop);
  };
  if (!reduce) loop();

  addEventListener('load', () => ScrollTrigger.refresh());
})();
