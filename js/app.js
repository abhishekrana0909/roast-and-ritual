/* Roast & Ritual — interactions and effects */
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
  const state = { cold: false, coldInView: false, lenis: null };

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

  /* ---------- progress + nav ---------- */
  const prog = $('#progress'), nav = $('#nav');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    nav.classList.toggle('scrolled', scrollY > 60);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- content rendering ---------- */
  // Origins
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
      <div class="bars">${bar('Acidity', r.bars.acidity)}${bar('Body', r.bars.body)}${bar('Sweetness', r.bars.sweetness)}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.bar i', ogCard).forEach(b => b.style.width = b.dataset.w + '%')));
    if (hasG) G.fromTo(ogCard.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06, ease: 'power3.out', overwrite: true });
  };
  ogList.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showRegion(+b.dataset.i); });
  ogList.addEventListener('mouseover', e => { const b = e.target.closest('button'); if (b && fine) showRegion(+b.dataset.i); });
  showRegion(0);
  if (fine && hasG && !reduce) {
    ogCard.addEventListener('mousemove', e => {
      const b = ogCard.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      G.to(ogCard, { rotateY: x * 5, rotateX: -y * 5, transformPerspective: 900, duration: .5, ease: 'power2.out' });
    });
    ogCard.addEventListener('mouseleave', () => G.to(ogCard, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power3.out' }));
  }

  // Roast
  const rRange = $('#rRange'), rBody = $('#rbBody');
  $('#rBars').innerHTML = ['Acidity', 'Body', 'Sweetness'].map(l => `<div class="bar"><span>${l}</span><div><i></i></div></div>`).join('');
  const rBarEls = $$('#rBars .bar i');
  let rLast = -1;
  const roastRender = () => {
    const v = +rRange.value, a = Math.floor(v), b = Math.min(3, a + 1), t = v - a;
    const A = D.roasts[a], B = D.roasts[b];
    rBody.setAttribute('fill', mix(A.color, B.color, t));
    [['acid'], ['body'], ['sweet']].forEach(([k], i) => rBarEls[i].style.width = (lerp(A[k], B[k], t) * 20) + '%');
    const n = Math.round(v);
    if (n !== rLast) {
      rLast = n; const R = D.roasts[n];
      $('#rName').textContent = R.name + ' Roast'; $('#rTemp').textContent = R.temp;
      $('#rText').textContent = R.text; $('#rNote').textContent = R.note;
    }
  };
  rRange.addEventListener('input', roastRender); roastRender();

  // Brew
  const bTabs = $('#bTabs'), bInfo = $('#bInfo');
  D.brews.forEach((b, i) => { const t = document.createElement('button'); t.textContent = b.name; t.dataset.i = i; t.setAttribute('role', 'tab'); bTabs.appendChild(t); });
  const T = { idx: 0, seg: -1, run: false, t0: 0, elapsed: 0, raf: 0 };
  const tFill = $('#tcFill'), tTime = $('#tTime'), tStep = $('#tStep'), tStart = $('#tStart');
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const timed = () => D.brews[T.idx].steps.map((s, i) => ({ ...s, i })).filter(s => s.s > 0);
  const setFill = p => tFill.setAttribute('y', 180 - p * 100);
  const timerReset = () => {
    cancelAnimationFrame(T.raf); T.run = false; T.elapsed = 0; T.seg = -1; tStart.textContent = 'Start';
    setFill(0); $$('li', bInfo).forEach(l => l.className = '');
    const ts = timed(), total = ts.reduce((a, s) => a + s.s, 0);
    if (!ts.length) { tTime.textContent = '12–16h'; tStep.textContent = 'Is guide ka timer nahi, fridge me chhod do.'; tStart.disabled = true; tStart.style.opacity = .4; }
    else { tTime.textContent = fmt(total); tStep.textContent = 'Start dabao, main step-by-step batata rahunga.'; tStart.disabled = false; tStart.style.opacity = 1; }
  };
  const showBrew = i => {
    T.idx = i; const b = D.brews[i];
    $$('button', bTabs).forEach((x, k) => x.classList.toggle('on', k === i));
    bInfo.innerHTML = `<div class="specs"><div><b>Ratio</b><span>${b.ratio}</span></div><div><b>Dose</b><span>${b.dose}</span></div><div><b>Temp</b><span>${b.temp}</span></div><div><b>Grind</b><span>${b.grind}</span></div><div><b>Time</b><span>${b.time}</span></div></div>
      <ol class="steps">${b.steps.map(s => `<li>${s.t}</li>`).join('')}</ol>`;
    if (hasG) G.fromTo(bInfo.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .08, ease: 'power3.out' });
    timerReset();
  };
  bTabs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showBrew(+b.dataset.i); });
  const tick = now => {
    if (!T.run) return;
    T.elapsed = (now - T.t0) / 1000;
    const ts = timed(), total = ts.reduce((a, s) => a + s.s, 0);
    let acc = 0, seg = ts.length;
    for (let k = 0; k < ts.length; k++) { if (T.elapsed < acc + ts[k].s) { seg = k; break; } acc += ts[k].s; }
    if (seg >= ts.length) { // done
      T.run = false; setFill(1); tTime.textContent = '00:00'; tStep.textContent = 'Taiyar hai! Pehla ghoont lo.'; tStart.textContent = 'Again';
      $$('li', bInfo).forEach(l => l.className = 'done');
      if (hasG) G.fromTo('.t-steam', { scale: 1 }, { scale: 1.25, transformOrigin: '50% 100%', repeat: 3, yoyo: true, duration: .5 });
      return;
    }
    if (seg !== T.seg) {
      T.seg = seg; tStep.textContent = ts[seg].t;
      $$('li', bInfo).forEach((l, k) => l.className = k === ts[seg].i ? 'act' : (k < ts[seg].i ? 'done' : ''));
    }
    tTime.textContent = fmt(Math.ceil(ts[seg].s - (T.elapsed - acc)));
    setFill(T.elapsed / total);
    T.raf = requestAnimationFrame(tick);
  };
  tStart.addEventListener('click', () => {
    if (T.run) { T.run = false; cancelAnimationFrame(T.raf); tStart.textContent = 'Resume'; return; }
    if (tStart.textContent === 'Again') timerReset();
    T.t0 = performance.now() - T.elapsed * 1000; T.run = true; tStart.textContent = 'Pause'; T.raf = requestAnimationFrame(tick);
  });
  $('#tReset').addEventListener('click', timerReset);
  showBrew(0);

  // Pairings
  const prGrid = $('#prGrid'), prSec = $('#pairings'), toggle = $('#modeToggle');
  let mode = 'hot';
  const renderPairs = animate => {
    prGrid.innerHTML = D.pairings[mode].map((p, i) => `<button class="card" data-id="${p.id}" data-cur="Recipe">
      <span class="num">0${i + 1} · ${mode === 'hot' ? 'Hot' : 'Cold'}</span>
      <div class="pair"><span>${p.coffee}</span><i>+</i><span>${p.snack}</span></div>
      <p>${p.why}</p><div class="foot2"><span>${p.time}</span><b>Recipe dekho →</b></div></button>`).join('');
    if (animate && hasG) G.fromTo('.card', { y: 40, opacity: 0, rotateX: -12 }, { y: 0, opacity: 1, rotateX: 0, duration: .8, stagger: .07, ease: 'power3.out', transformPerspective: 800 });
  };
  renderPairs(false);
  toggle.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.dataset.m === mode) return;
    mode = b.dataset.m; state.cold = mode === 'cold';
    $$('button', toggle).forEach(x => x.classList.toggle('on', x === b));
    prSec.dataset.mode = mode; renderPairs(true);
  });
  prGrid.addEventListener('mousemove', e => {
    const c = e.target.closest('.card'); if (!c) return; const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // Recipe modal
  const modal = $('#modal'), mCard = $('#mCard');
  let lastFocus = null;
  const openModal = id => {
    const p = [...D.pairings.hot, ...D.pairings.cold].find(x => x.id === id); if (!p) return;
    const m = id[0] === 'h' ? 'hot' : 'cold';
    lastFocus = document.activeElement; mCard.dataset.mode = m;
    mCard.innerHTML = `<button class="close" aria-label="Close">✕</button>
      <p class="eyebrow" style="color:var(--acc,var(--copper))">${m === 'hot' ? 'Hot' : 'Cold'} pairing · ${p.time}</p>
      <h3>${p.coffee} <i>+</i> ${p.snack}</h3><p class="why">${p.why}</p>
      <h4>Coffee</h4><p>${p.coffeeHow}</p>
      <h4>Snack ke liye saamaan</h4><ul class="ing">${p.ing.map(x => `<li>${x}</li>`).join('')}</ul>
      <h4>Banane ka tareeka</h4><ol>${p.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    if (state.lenis) state.lenis.stop(); else document.body.style.overflow = 'hidden';
    $('.close', mCard).focus();
  };
  const closeModal = () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    if (state.lenis) state.lenis.start(); else document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  prGrid.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) openModal(c.dataset.id); });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close')) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // Facts + credits
  $('#facts').innerHTML = D.facts.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('');
  const C = window.RR_CREDITS || {};
  const labels = { hero: 'Hero', ceremony: 'Ethiopia', shelf: 'Kenya', drum: 'Roaster', beans: 'Beans', 'moody-cup': 'Cup', latte: 'Latte', cherries: 'Brazil', filter: 'India', levels: 'Roast levels', grinder: 'Grinder', origin: 'Colombia', pourover: 'Vietnam' };
  $('#creditList').innerHTML = Object.entries(C).map(([k, v]) => `<li>${labels[k] || k}: <a href="${v.page}" target="_blank" rel="noopener">${v.title || 'Photo'}</a> by ${v.artist || 'Unknown'} (${v.license}), via Wikimedia Commons</li>`).join('');

  if (!hasG) { // no animation library: show everything and stop here
    $('#loader').remove(); $$('.reveal').forEach(e => e.classList.remove('reveal')); $$('.ln .ch').forEach(e => e.style.transform = 'none');
    $$('.ln').forEach(l => l.style.cssText += ';opacity:1'); return;
  }

  /* ---------- hero title split ---------- */
  $$('#heroTitle .ln').forEach(l => {
    if (l.classList.contains('amp')) { l.innerHTML = `<span class="ch">${l.textContent}</span>`; return; }
    l.innerHTML = [...l.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  });

  /* ---------- loader ---------- */
  const ldFill = $('#ldFill'), ldNum = $('#ldNum'), loader = $('#loader');
  const cnt = { v: 0 };
  const intro = () => {
    G.timeline()
      .to('#heroTitle .ch', { y: 0, duration: 1.1, stagger: .045, ease: 'expo.out' })
      .to('.hero .reveal', { opacity: 1, y: 0, duration: .9, stagger: .12, ease: 'power3.out' }, '-=.7')
      .from('.badge', { scale: .4, opacity: 0, rotate: -90, duration: 1.4, ease: 'expo.out' }, '-=1');
  };
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
    const id = a.getAttribute('href'); const tgt = $(id); if (!tgt) return;
    e.preventDefault();
    if (reduce) return scrollToEl(tgt, true);
    G.timeline()
      .set(pour, { yPercent: 0, y: '100%' })
      .to(pour, { y: '0%', duration: .65, ease: 'power3.in' })
      .add(() => scrollToEl(tgt, true))
      .to(pour, { y: '-100%', duration: .7, ease: 'power3.out', delay: .1 });
  }));

  /* ---------- reveals ---------- */
  $$('section:not(.hero) .eyebrow, .h-med, .h-big.sm, .pr-sub, .toggle, .tabs, .brew-info, .brew-timer, .roast-grid, .levels, .mol-art, .mol-text > *, .og-list li, .stat')
    .forEach(e => e.classList.add('reveal'));
  ScrollTrigger.batch('section:not(.hero) .reveal', {
    start: 'top 90%', once: true,
    onEnter: els => G.to(els, { opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out' })
  });
  $$('[data-count]').forEach(el => ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => { const o = { v: 0 }; G.to(o, { v: +el.dataset.count, duration: 1.8, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }); }
  }));

  /* ---------- hero parallax ---------- */
  G.to('.hero-bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  if (fine && !reduce) {
    const layers = $$('[data-depth]');
    const qs = layers.map(l => [G.quickTo(l, 'x', { duration: .9, ease: 'power3' }), G.quickTo(l, 'y', { duration: .9, ease: 'power3' }), +l.dataset.depth]);
    $('#hero').addEventListener('mousemove', e => {
      const x = e.clientX - innerWidth / 2, y = e.clientY - innerHeight / 2;
      qs.forEach(([qx, qy, d]) => { qx(x * d); qy(y * d); });
    });
  }

  /* ---------- journey (pinned) ---------- */
  const stages = [
    ['Cherry', 'Coffee asal me ek phal ka beej hai. Pakke laal cherries haath se chuni jaati hain, aur ek ped saal bhar me bas thodi si coffee (aadha-ek kilo ke kareeb) deta hai.'],
    ['Process', 'Cherry ka gooda hata ke beans ko dhoop me sukhaya ya paani me dhoya jaata hai. Fruity ya meetha swaad yahin tay hota hai.'],
    ['Roast', 'Hare beans aag me bhune jaate hain. Rang badalta hai, khushboo phailti hai, aur pehli "crack" ki awaaz aati hai.'],
    ['Grind & Brew', 'Taaza peeso, sahi paani, sahi samay. Aur phir pehla ghoont: ritual poora.']
  ];
  const jrDots = $('#jrDots'); jrDots.innerHTML = stages.map(() => '<i></i>').join('');
  const jrNum = $('#jrNum'), jrTitle = $('#jrTitle'), jrText = $('#jrText');
  const jcFill = $('#jcFill'), jcCrema = $('#jcCrema'), jcSteam = $('#jcSteam'), jcBeans = $('#jcBeans');
  let jrStage = -1;
  const setStage = i => {
    jrStage = i; $$('i', jrDots).forEach((d, k) => d.classList.toggle('on', k <= i));
    G.timeline().to('#jrStage', { opacity: 0, y: -10, duration: .2, onComplete() { jrNum.textContent = '0' + (i + 1); jrTitle.textContent = stages[i][0]; jrText.textContent = stages[i][1]; } })
      .to('#jrStage', { opacity: 1, y: 0, duration: .45, ease: 'power2.out' });
  };
  const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const jrRender = p => {
    const i = Math.min(3, Math.floor(p * 4)); if (i !== jrStage) setStage(i);
    jcBeans.setAttribute('transform', `translate(0 ${p * 120})`);
    jcBeans.style.opacity = 1 - ss(.45, .72, p);
    const f = ss(.5, .95, p);
    jcFill.setAttribute('y', 285 - f * 150);
    jcCrema.setAttribute('cy', 285 - f * 150); jcCrema.style.opacity = f > .98 ? .9 : 0;
    jcSteam.style.opacity = ss(.92, 1, p);
  };
  jrRender(0);
  ScrollTrigger.create({ trigger: '#journey', start: 'top top', end: () => '+=' + (small ? 2200 : 3200), pin: true, scrub: true, onUpdate: s => jrRender(s.progress) });
  G.to('.jr-photo', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '#journey', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- molecule drawing ---------- */
  const paths = $$('#molSvg .bonds path');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  G.set('#molSvg .atoms text', { opacity: 0 });
  ScrollTrigger.create({
    trigger: '#molSvg', start: 'top 75%', once: true,
    onEnter: () => {
      G.to(paths, { strokeDashoffset: 0, duration: 1.6, stagger: .11, ease: 'power2.inOut' });
      G.to('#molSvg .atoms text', { opacity: 1, duration: .8, stagger: .08, delay: 1, ease: 'power2.out' });
    }
  });

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('[data-mag]').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('mouseleave', () => G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' }));
  });

  /* ---------- cursor ---------- */
  const dot = $('#cur-dot'), ring = $('#cur-ring'), ringLbl = $('span', ring);
  const mouse = { x: -100, y: -100, rx: -100, ry: -100 };
  const trail = [];
  if (fine && !reduce) {
    document.body.classList.add('has-cursor');
    addEventListener('mousemove', e => {
      mouse.x = e.clientX; mouse.y = e.clientY; dot.style.opacity = 1; ring.style.opacity = 1;
      if (Math.random() < .5) trail.push({ x: e.clientX, y: e.clientY, r: 4 + Math.random() * 6, a: .35, vx: (Math.random() - .5) * .5, vy: -.4 - Math.random() * .5 });
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a,button,input,.card');
      ring.classList.toggle('hov', !!t && !t.matches('input,.tabs button,.toggle button'));
      ringLbl.textContent = t ? (t.dataset.cur || (t.matches('[data-pour]') ? 'Go' : t.matches('.btn') ? '' : '')) : '';
    });
  }

  /* ---------- falling beans / ice (canvas) ---------- */
  const cv = $('#fall'), ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  size(); addEventListener('resize', size);
  const N = small ? 8 : 16;
  const mk = (top) => ({ x: Math.random() * W, y: top ? -40 : Math.random() * H, s: 6 + Math.random() * 14, r: Math.random() * 6.28, vr: (Math.random() - .5) * .02, vy: .25 + Math.random() * .7, vx: (Math.random() - .5) * .25, k: Math.random() * 10 });
  const ps = Array.from({ length: N }, () => mk(false));
  let cold = 0; // 0 hot → 1 cold (eased)
  ScrollTrigger.create({ trigger: '#pairings', start: 'top 70%', end: 'bottom 30%', onToggle: s => state.coldInView = s.isActive });
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
  let vel = 0;
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    const want = state.cold && state.coldInView ? 1 : 0; cold = lerp(cold, want, .04);
    const sv = state.lenis ? state.lenis.velocity : 0; vel = lerp(vel, sv, .1);
    for (const p of ps) {
      p.y += p.vy + Math.abs(vel) * .35; p.x += p.vx + Math.sin(p.y / 90 + p.k) * .25; p.r += p.vr + vel * .002;
      if (p.y > H + 40) Object.assign(p, mk(true), { x: Math.random() * W });
      const a = .16 + (p.s / 20) * .3;
      if (cold > .5) drawIce(p, a); else drawBean(p, a);
    }
    for (let i = trail.length - 1; i >= 0; i--) { // cursor smoke
      const t = trail[i]; t.x += t.vx; t.y += t.vy; t.r += .25; t.a -= .008;
      if (t.a <= 0) { trail.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r); g.addColorStop(0, `rgba(241,228,208,${t.a})`); g.addColorStop(1, 'rgba(241,228,208,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 6.29); ctx.fill();
    }
    ctx.globalAlpha = 1;
    mouse.rx = lerp(mouse.rx, mouse.x, .18); mouse.ry = lerp(mouse.ry, mouse.y, .18);
    dot.style.transform = `translate(${mouse.x}px,${mouse.y}px)`; ring.style.transform = `translate(${mouse.rx}px,${mouse.ry}px)`;
    requestAnimationFrame(loop);
  };
  if (!reduce) loop();

  addEventListener('load', () => ScrollTrigger.refresh());
})();
