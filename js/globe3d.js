/* Roast & Ritual: the six origins on a real 3D globe (Three.js). Paper theme: a cream planet, land as dots,
   the coffee belt in the accent colour, a pin per origin. Turns to the chosen origin, can be dragged. */
import * as THREE from 'three';

const cv = document.getElementById('globe3d');
try {
  if (!cv) throw new Error('no canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 50); cam.position.set(0, 0, 6.4);
  const R = 1.55, rad = Math.PI / 180, world = new THREE.Group(); scene.add(world);
  const toV = (lat, lon, r = R) => new THREE.Vector3(r * Math.cos(lat * rad) * Math.sin(lon * rad), r * Math.sin(lat * rad), r * Math.cos(lat * rad) * Math.cos(lon * rad));

  /* the planet: white with a soft grey rim */
  world.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - max(dot(vN, vV), 0.), 2.2); float l = .55 + .45 * max(dot(vN, normalize(vec3(-.4,.6,.8))), 0.); vec3 c = mix(vec3(.985,.958,.91), vec3(.79,.70,.57), f) * mix(.9, 1., l); gl_FragColor = vec4(c, 1.); }'
  })));
  /* a faint warm halo */
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.1, 64, 48), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide,
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'varying vec3 vN; void main(){ float a = pow(.72 - dot(vN, vec3(0.,0.,1.)), 3.); gl_FragColor = vec4(.55,.36,.2, clamp(a,0.,1.) * .28); }'
  })));

  /* land as round dots, the belt in coffee brown */
  const dot = document.createElement('canvas'); dot.width = dot.height = 64;
  { const g = dot.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 30); q.addColorStop(0, '#fff'); q.addColorStop(.7, '#fff'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.beginPath(); g.arc(32, 32, 30, 0, 6.283); g.fill(); }
  const L = window.RR_LAND || [], pos = [], col = [], ink = new THREE.Color(0x3a3029), belt = new THREE.Color(0x8a5a3c);
  for (let i = 0; i < L.length; i += 2) { const v = toV(L[i], L[i + 1], R * 1.004); pos.push(v.x, v.y, v.z); const c = Math.abs(L[i]) <= 24 ? belt : ink; col.push(c.r, c.g, c.b); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  world.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: .05, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, alphaTest: .3, depthWrite: true })));

  /* the six pins */
  const PINS = [[9.1, 40.5], [5.2, -74.5], [-19.5, -45.5], [12.5, 108], [13, 76], [-0.4, 37.3]];
  const pinMat = new THREE.MeshBasicMaterial({ color: 0x9b3d22 }), ringMat = new THREE.MeshBasicMaterial({ color: 0x9b3d22, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const pins = PINS.map(([la, lo]) => {
    const g = new THREE.Group(), p = toV(la, lo, R * 1.01); g.position.copy(p); g.lookAt(p.clone().multiplyScalar(2));
    const head = new THREE.Mesh(new THREE.SphereGeometry(.032, 16, 12), pinMat); g.add(head);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.05, .062, 40), ringMat.clone()); g.add(ring);
    world.add(g); return { g, head, ring };
  });

  /* where the globe looks */
  let act = window.RR_ogIndex || 0, tx = 0, ty = 0, cx = 0, cy = 0, dragX = 0, dragY = 0, down = null, visible = true, running = false, last = 0;
  const aim = i => { const [la, lo] = PINS[i]; tx = la * rad * .75; ty = -lo * rad; };
  aim(act); cx = tx; cy = ty;
  addEventListener('rr-og', e => { act = e.detail; aim(act); kick(); });
  cv.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, dx: dragX, dy: dragY }; cv.setPointerCapture(e.pointerId); kick(); });
  cv.addEventListener('pointermove', e => { if (!down) return; dragY = down.dx + (e.clientX - down.x) * .008; dragX = clamp(down.dy + (e.clientY - down.y) * .006, -.9, .9); });
  const up = () => { down = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  const size = () => { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);
  const frame = now => {
    running = false;
    const t = now / 1000, dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    if (!down) { dragX *= .94; dragY *= .96; }
    let dy = ty - cy; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    cy += dy * Math.min(1, dt * 3); cx += (tx - cx) * Math.min(1, dt * 3);
    world.rotation.set(cx + dragX, cy + dragY + (reduce ? 0 : Math.sin(t * .25) * .12), 0, 'XYZ');
    pins.forEach((p, i) => {
      const on = i === act, ph = (t * .7 + i * .13) % 1;
      p.head.scale.setScalar(on ? 1.6 : 1);
      p.ring.visible = on && !reduce; p.ring.scale.setScalar(1 + ph * 2.2); p.ring.material.opacity = .7 * (1 - ph);
    });
    renderer.render(scene, cam);
    if (visible && !document.hidden) { running = true; requestAnimationFrame(frame); }
  };
  function kick() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) kick(); }, { rootMargin: '100px' }).observe(cv);
  document.addEventListener('visibilitychange', kick);
  window.RRGlobe = { focus: i => { act = i; aim(i); kick(); } };
  kick();
} catch (err) {
  if (cv) cv.parentElement.style.display = 'none';
  console.warn('3D globe skipped:', err && err.message);
}
