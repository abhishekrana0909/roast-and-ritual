/* Roast & Ritual: 3D hero. One glossy coffee bean that follows the pointer, with floating beans and gold dust. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const hero = document.getElementById('hero'), canvas = document.getElementById('hero3d');

try {
  if (!hero || !canvas) throw new Error('no hero');
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) throw new Error('low end device');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = innerWidth < 900, DPR = Math.min(devicePixelRatio || 1, mobile ? 1.6 : 2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x09090a, 7, 16);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.6;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60); camera.position.set(0, 0, 9);
  const key = new THREE.DirectionalLight(0xffe4bd, 3.4); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(0xe9b45a, 70, 18, 2); rim.position.set(3.4, 1.6, -3); scene.add(rim);
  const cool = new THREE.PointLight(0x7fa6ff, 16, 16, 2); cool.position.set(-4.4, -1.2, -2); scene.add(cool);

  const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 4);

  /* a coffee bean: an ellipsoid with an S-shaped crease down its face */
  const beanGeo = (() => {
    let g = new THREE.SphereGeometry(1, 96, 64); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
    const p = g.attributes.position, sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    for (let i = 0; i < p.count; i++) {
      const ox = p.getX(i), oy = p.getY(i), oz = p.getZ(i); let x = ox * 0.62, y = oy, z = oz * 0.44;
      const d = x - 0.07 * Math.sin(y * 2.8), face = sm(0.02, 0.35, oz), ends = 1 - Math.pow(Math.abs(y), 3) * 0.85;
      z -= 0.15 * Math.exp(-(d * d) / (2 * 0.032 * 0.032)) * ends * face;
      z += 0.028 * Math.exp(-Math.pow(Math.abs(d) - 0.115, 2) / (2 * 0.04 * 0.04)) * ends * face;
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals(); return g;
  })();

  const group = new THREE.Group(); scene.add(group);
  const hero3 = new THREE.Mesh(beanGeo, new THREE.MeshPhysicalMaterial({ color: 0x1a0b04, roughness: 0.44, metalness: 0, specularColor: new THREE.Color(0xe9b45a), specularIntensity: 1, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.8 }));
  const spin = new THREE.Group(); spin.add(hero3); group.add(spin);

  /* floating beans around it */
  const NB = mobile ? 12 : 26, beans = new THREE.InstancedMesh(beanGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 }), NB);
  const tones = [0x2a160b, 0x3a2010, 0x1b0f08, 0x4a2a14, 0x5a3a1a].map(c => new THREE.Color(c));
  const bd = [], dummy = new THREE.Object3D();
  for (let i = 0; i < NB; i++) {
    let x, y, z;
    do { x = (Math.random() - .5) * 11; y = (Math.random() - .5) * 6.4; z = -4 + Math.random() * 6; } while (Math.hypot(x - 1.9, y) < 2.1 && z > -1.5);
    const s = 0.1 + ((z + 4) / 6) * 0.22 + Math.random() * 0.05;
    bd.push({ x, y, z, s, ph: Math.random() * 6.28, sp: 0.25 + Math.random() * 0.5, ax: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(), ws: 0.2 + Math.random() * 0.5, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)) });
    beans.setColorAt(i, tones[i % tones.length].clone().multiplyScalar(0.9 + Math.random() * 0.5));
  }
  scene.add(beans);

  /* gold dust */
  const ND = mobile ? 70 : 150, dg = new THREE.BufferGeometry(), dp = new Float32Array(ND * 3), dv = new Float32Array(ND);
  for (let i = 0; i < ND; i++) { dp[i * 3] = (Math.random() - .5) * 11; dp[i * 3 + 1] = (Math.random() - .5) * 7; dp[i * 3 + 2] = -3 + Math.random() * 5; dv[i] = 0.06 + Math.random() * 0.18; }
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xf0c070, size: 0.035, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  /* layout: bean on the right on wide screens, above the title on phones */
  const lay = { x: 0, y: 0, s: 1 };
  const layout = () => {
    const w = hero.clientWidth, h = hero.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(camera.fov * Math.PI / 360), vw = vh * camera.aspect;
    if (w >= 900) { lay.x = vw * 0.23; lay.y = -0.05; lay.s = clamp(h / 640, 0.8, 1.45) * 1.1; }
    else { lay.x = vw * 0.04; lay.y = vh * 0.25; lay.s = clamp(vw / 2.5, 0.6, 1.05); }
  };
  layout(); addEventListener('resize', layout);

  /* pointer and scroll */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mouse.tx = ((e.clientX - r.left) / r.width - .5) * 2; mouse.ty = ((e.clientY - r.top) / r.height - .5) * 2; });
  hero.addEventListener('pointerleave', () => { mouse.tx = 0; mouse.ty = 0; });

  let t0 = -1, clock = 0, last = 0, visible = true, running = false;
  const start = () => { if (t0 < 0) { t0 = clock; canvas.classList.add('on'); } };
  if (window.RR_introDone) start(); else addEventListener('rr-intro', start, { once: true });
  setTimeout(start, 6000);

  const frame = t => {
    running = false;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; clock += dt;
    const p = clamp(window.RR_heroP || 0, 0, 1);
    const it = t0 < 0 ? 0 : easeOut((clock - t0) / 2.2);
    mouse.x = lerp(mouse.x, mouse.tx, 0.06); mouse.y = lerp(mouse.y, mouse.ty, 0.06);

    group.position.set(lay.x + mouse.x * 0.18, lay.y + p * 1.3 - (1 - it) * 0.8, 0);
    group.scale.setScalar(lay.s * (0.55 + 0.45 * it) * (1 - p * 0.35));
    group.rotation.set(-0.18 + mouse.y * 0.28 + p * 1.1, mouse.x * 0.35, 0.42 + p * 0.5);
    spin.rotation.y = (reduce ? 0.3 : Math.sin(clock * 0.45) * 0.85) + (1 - it) * Math.PI * 3;
    hero3.position.y = Math.sin(clock * 0.9) * 0.06;
    rim.position.x = 3.4 + mouse.x * 1.4; rim.position.y = 1.6 - mouse.y * 1.2;

    for (let i = 0; i < NB; i++) {
      const b = bd[i], k = (reduce ? 0 : clock);
      dummy.position.set(b.x + mouse.x * b.z * 0.08, b.y + Math.sin(k * b.sp + b.ph) * 0.18 - p * 1.4, b.z);
      b.q.multiply(new THREE.Quaternion().setFromAxisAngle(b.ax, reduce ? 0 : dt * b.ws));
      dummy.quaternion.copy(b.q); dummy.scale.setScalar(b.s * it); dummy.updateMatrix(); beans.setMatrixAt(i, dummy.matrix);
    }
    beans.instanceMatrix.needsUpdate = true;

    if (!reduce) {
      const a = dg.attributes.position.array;
      for (let i = 0; i < ND; i++) { a[i * 3 + 1] += dv[i] * dt; a[i * 3] += Math.sin(clock * 0.4 + i) * 0.002; if (a[i * 3 + 1] > 3.6) a[i * 3 + 1] = -3.6; }
      dg.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
    if (visible && !document.hidden && !reduce) { running = true; requestAnimationFrame(frame); }
  };
  const kick = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } };
  new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) kick(); }, { rootMargin: '80px' }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); canvas.style.display = 'none'; });
  kick();
  if (reduce) setTimeout(() => { start(); clock = t0 + 3; frame(performance.now()); }, 400);
} catch (err) {
  if (canvas) canvas.style.display = 'none';
  console.warn('3D hero skipped:', err && err.message);
}
