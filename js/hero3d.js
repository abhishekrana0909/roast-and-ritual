/* Roast & Ritual: 3D hero. A ceramic cup of coffee that reacts to the pointer, with a real pour intro, steam and floating beans. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const hero = document.getElementById('hero'), canvas = document.getElementById('hero3d');
const done = state => { window.RR_3d = state; dispatchEvent(new Event('rr3d')); };

try {
  if (!hero || !canvas) throw new Error('no hero');
  if (window.RR_3d === 'failed') throw new Error('3d disabled');
  const mobile = innerWidth <= 820, DPR = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) throw new Error('low end');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile || DPR < 1.6, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x120d0a, 6.5, 13);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const key = new THREE.DirectionalLight(0xffd6a8, 2.8); key.position.set(-2.4, 4, 3.2); scene.add(key);
  const rim = new THREE.PointLight(0xff9a55, 38, 14, 2); rim.position.set(2.6, 1.6, -2.4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffe2c0, 0x1a0e07, 0.35));

  const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp, ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

  /* ---- cup, saucer, handle ---- */
  const cup = new THREE.Group(); scene.add(cup);
  const lathe = (pts, seg = 96) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xd8bd98, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1 });
  const body = new THREE.Mesh(lathe([[0, 0], [0.3, 0], [0.38, 0.02], [0.4, 0.06], [0.42, 0.1], [0.5, 0.22], [0.6, 0.46], [0.67, 0.7], [0.7, 0.8], [0.705, 0.815], [0.69, 0.83], [0.67, 0.828], [0.655, 0.8], [0.6, 0.62], [0.52, 0.36], [0.42, 0.2], [0.3, 0.15], [0, 0.14]]), ceramic);
  body.position.y = 0.06; cup.add(body);
  const saucer = new THREE.Mesh(lathe([[0, 0], [0.5, 0], [0.78, 0.02], [1, 0.09], [1.1, 0.13], [1.12, 0.145], [1.09, 0.152], [1.05, 0.12], [0.82, 0.062], [0.6, 0.046], [0.55, 0.06], [0, 0.06]], 112), ceramic);
  saucer.position.y = -0.02; cup.add(saucer);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 18, 44, Math.PI * 1.25), ceramic);
  handle.position.set(0.665, 0.56, 0); handle.rotation.z = -Math.PI * 0.625; handle.scale.set(1, 1.3, 1); cup.add(handle);

  /* soft contact shadow */
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  { const g = sh.getContext('2d'), r = g.createRadialGradient(64, 64, 6, 64, 64, 62); r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false, opacity: 0.8 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.03; cup.add(shadow);

  /* ---- coffee surface: shader with ripples ---- */
  const RIP = 8, rip = Array.from({ length: RIP }, () => new THREE.Vector4(0, 0, -99, 0)); let ripI = 0;
  const coffeeMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uRip: { value: rip } },
    vertexShader: /* glsl */ `
      varying vec3 vLocal; varying vec3 vWorld;
      void main() { vLocal = position; vWorld = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec4 uRip[${RIP}];
      varying vec3 vLocal; varying vec3 vWorld;
      float hgt(vec2 p) {
        float h = 0.0;
        for (int i = 0; i < ${RIP}; i++) {
          vec4 r = uRip[i]; float age = uTime - r.z;
          if (age < 0.0 || age > 5.0 || r.w <= 0.0) continue;
          float d = length(p - r.xy), w = d - age * 0.5;
          h += r.w * sin(w * 40.0) * exp(-w * w * 55.0) * exp(-age * 0.9) / (1.0 + d * 3.0);
        }
        return h + 0.0014 * sin(p.x * 17.0 + uTime * 1.2) * sin(p.y * 15.0 - uTime * 1.0);
      }
      void main() {
        vec2 p = vLocal.xy; float e = 0.004, h0 = hgt(p);
        float dx = (hgt(p + vec2(e, 0.0)) - h0) / e, dz = (hgt(p + vec2(0.0, e)) - h0) / e;
        vec3 n = normalize(vec3(-dx, 1.0, dz));
        float r = length(p) / 0.6, a = atan(p.y, p.x);
        float crema = smoothstep(0.5, 1.0, r);
        vec3 col = mix(vec3(0.045, 0.02, 0.01), vec3(0.3, 0.155, 0.07), crema * 0.85);
        col *= 0.92 + 0.08 * sin(a * 5.0 + r * 8.0 + uTime * 0.25);
        vec3 v = normalize(cameraPosition - vWorld), R = reflect(-v, n);
        float spec = pow(max(dot(R, normalize(vec3(0.4, 0.9, 0.5))), 0.0), 90.0) * 1.7 + pow(max(dot(R, normalize(vec3(-0.6, 0.7, 0.3))), 0.0), 45.0) * 0.5;
        float fres = pow(1.0 - max(dot(v, n), 0.0), 3.0);
        col += vec3(1.0, 0.82, 0.6) * spec + vec3(0.34, 0.21, 0.13) * fres * 0.55;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.605, 96), coffeeMat);
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.7; cup.add(coffee);
  const addRipple = (x, z, amp) => { rip[ripI].set(x, z, clock, amp); ripI = (ripI + 1) % RIP; };

  /* ---- steam ---- */
  const st = document.createElement('canvas'); st.width = st.height = 128;
  { const g = st.getContext('2d'); for (let i = 0; i < 16; i++) { const x = 64 + (Math.random() - .5) * 46, y = 64 + (Math.random() - .5) * 46, r = 22 + Math.random() * 26, q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, 'rgba(255,244,228,.28)'); q.addColorStop(1, 'rgba(255,244,228,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); } }
  const steamTex = new THREE.CanvasTexture(st), steam = [], NS = mobile ? 12 : 20;
  for (let i = 0; i < NS; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0, color: 0xeadcc6, fog: false }));
    s.userData = { age: Math.random() * 5, life: 4 + Math.random() * 2, ox: (Math.random() - .5) * 0.5, oz: (Math.random() - .5) * 0.4, ph: Math.random() * 6.28 };
    cup.add(s); steam.push(s);
  }

  /* ---- beans ---- */
  const beanGeo = (() => {
    let g = new THREE.SphereGeometry(1, 44, 30); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g = mergeVertices(g);
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
  const NB = mobile ? 18 : 34, beans = new THREE.InstancedMesh(beanGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0 }), NB);
  const tones = [0x5a3419, 0x6b4126, 0x442816, 0x7a4a28, 0x4d2c17].map(c => new THREE.Color(c));
  const bd = [], dummy = new THREE.Object3D(), qa = new THREE.Quaternion(), ax = new THREE.Vector3();
  for (let i = 0; i < NB; i++) {
    let x, y, z; do { x = (Math.random() - .5) * 7.2 + 0.4; y = (Math.random() - .35) * 4; z = -3.6 + Math.random() * 5; } while ((Math.abs(x) < 2.1 && y > -0.7 && y < 1.9 && z > -1.8) || Math.hypot(x, y - 0.5) < 1.5);
    const near = (z + 3.6) / 5, s = 0.09 + near * 0.11 + Math.random() * 0.04;
    bd.push({ x, y, z, s, ph: Math.random() * 6.28, sp: 0.2 + Math.random() * 0.4, w: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(), ws: 0.15 + Math.random() * 0.45, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)), delay: Math.random() * 1.4, rise: 3.5 + Math.random() * 3 });
    beans.setColorAt(i, tones[i % tones.length].clone().multiplyScalar(0.85 + Math.random() * 0.4));
  }
  beans.instanceColor.needsUpdate = true; scene.add(beans);

  /* ---- pour: a stream falls into the cup, ripples spread, drops jump ---- */
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 1, 20), new THREE.MeshPhysicalMaterial({ color: 0x6a4121, emissive: 0x371b0b, emissiveIntensity: 0.9, roughness: 0.06, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.04, fog: false }));
  stream.visible = false; cup.add(stream);
  const NP = 18, dropGeo = new THREE.BufferGeometry(), dropPos = new Float32Array(NP * 3), dv = Array.from({ length: NP }, () => new THREE.Vector3());
  dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
  const drops = new THREE.Points(dropGeo, new THREE.PointsMaterial({ color: 0xc58a56, size: 0.045, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, fog: false })); drops.visible = false; drops.frustumCulled = false; cup.add(drops);
  const SURF = 0.7, TOP = 3.6; let pourT0 = -1, hit = false, nextRip = 0, dropT = -1, introT0 = -1;
  const startPour = () => { pourT0 = clock; hit = false; nextRip = 0; introT0 = clock; cup.visible = true; };
  window.RR_pour3d = startPour;

  /* ---- layout ---- */
  let W = 1, H = 1;
  const layout = () => {
    W = hero.clientWidth; H = hero.clientHeight; renderer.setSize(W, H, false);
    const aspect = W / H; camera.aspect = aspect;
    const dist = aspect >= 1 ? 6.3 : clamp(2.55 / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * aspect), 6.3, 12);
    camera.userData.dist = dist;
    camera.setViewOffset(W, H, aspect >= 1 ? -W * 0.25 : 0, aspect >= 1 ? -H * 0.2 : -H * 0.2, W, H);
  };
  new ResizeObserver(layout).observe(hero); layout();

  /* ---- input ---- */
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, nx: 2, ny: 2 }, ray = new THREE.Raycaster(), v2 = new THREE.Vector2(); let lastRip = 0;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect(); ptr.tx = (e.clientX - r.left) / r.width * 2 - 1; ptr.ty = (e.clientY - r.top) / r.height * 2 - 1; ptr.nx = ptr.tx; ptr.ny = ptr.ty;
  });
  hero.addEventListener('pointerleave', () => { ptr.tx = ptr.ty = 0; ptr.nx = ptr.ny = 2; });

  /* ---- loop ---- */
  let clock = 0, last = performance.now(), visible = true, scrollP = 0;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  const fallbackStart = setTimeout(() => { if (pourT0 < 0) startPour(); }, 6000);
  cup.visible = false;

  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    clock += dt; coffeeMat.uniforms.uTime.value = clock;
    scrollP = clamp(scrollY / Math.max(1, H), 0, 1);
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;

    /* cup motion: intro rise, mouse tilt, scroll turn */
    const it = introT0 < 0 ? 0 : clock - introT0, ie = ease(it / 1.5);
    cup.position.y = -0.7 * (1 - ie) - scrollP * 0.2; cup.scale.setScalar(0.92 + 0.08 * ie);
    cup.rotation.y = (1 - ie) * -1.1 + ptr.x * 0.4 + Math.sin(clock * 0.35) * 0.06 + scrollP * 1.1;
    cup.rotation.x = ptr.y * 0.08 + scrollP * 0.12;
    camera.position.set(ptr.x * 0.12, 2.8 + scrollP * 0.9 - ptr.y * 0.06, camera.userData.dist - scrollP * 1.4);
    camera.lookAt(0, 0.5 - scrollP * 0.1, 0);
    canvas.style.opacity = clamp(1.25 - scrollP * 1.15, 0, 1);

    /* pointer ripples on the coffee */
    if (ptr.nx < 1.5 && introT0 >= 0 && clock - lastRip > 0.11) {
      v2.set(ptr.nx, -ptr.ny); ray.setFromCamera(v2, camera);
      const h = ray.intersectObject(coffee)[0];
      if (h) { const p = coffee.worldToLocal(h.point.clone()); addRipple(p.x, p.y, 0.012); lastRip = clock; }
    }

    /* pour sequence */
    if (pourT0 >= 0) {
      const t = clock - pourT0, FALL = 0.85, HOLD = 1.4, TAIL = 0.55;
      const low = t < FALL ? lerp(TOP + 0.4, SURF, Math.pow(t / FALL, 2)) : SURF;
      const kt = clamp((t - FALL - HOLD) / TAIL, 0, 1), up = lerp(TOP + 0.4, SURF, kt * kt);
      const len = up - low; stream.visible = len > 0.02 && kt < 1;
      if (stream.visible) { stream.scale.set(1 + Math.sin(clock * 22) * 0.06 - kt * 0.3, len, 1 + Math.cos(clock * 19) * 0.06); stream.position.set(0, (up + low) / 2, 0); }
      if (t >= FALL && !hit) { hit = true; dropT = 0; drops.visible = true; for (let i = 0; i < NP; i++) { dropPos.set([0, SURF, 0], i * 3); const a = Math.random() * 6.28, sp = 0.5 + Math.random() * 0.9; dv[i].set(Math.cos(a) * sp * 0.5, 1.4 + Math.random() * 1.3, Math.sin(a) * sp * 0.5); } }
      if (hit && t < FALL + HOLD + TAIL && clock > nextRip) { addRipple(0, 0, 0.032); nextRip = clock + 0.26; }
      if (dropT >= 0) { dropT += dt; for (let i = 0; i < NP; i++) { dv[i].y -= 6.2 * dt; dropPos[i * 3] += dv[i].x * dt; dropPos[i * 3 + 1] += dv[i].y * dt; dropPos[i * 3 + 2] += dv[i].z * dt; } dropGeo.attributes.position.needsUpdate = true; drops.material.opacity = clamp(1 - dropT / 0.9, 0, 1) * 0.9; if (dropT > 0.9) { drops.visible = false; dropT = -1; } }
      if (t > FALL + HOLD + TAIL + 1) pourT0 = -2;
    }

    /* steam */
    for (const s of steam) {
      const u = s.userData; u.age += dt; if (u.age > u.life) { u.age = 0; u.ox = (Math.random() - .5) * 0.45; u.oz = (Math.random() - .5) * 0.35; }
      const k = u.age / u.life;
      s.position.set(u.ox + Math.sin(u.ph + k * 3.2) * 0.12 * (0.4 + k), 0.78 + k * 1.7, u.oz + Math.cos(u.ph + k * 2.4) * 0.08);
      s.scale.setScalar(0.35 + k * 1.15); s.material.opacity = (ie > 0.6 ? 1 : 0) * 0.07 * Math.sin(Math.PI * Math.min(1, k * 1.1));
    }

    /* beans: rain in, then drift and tumble */
    const bt = introT0 < 0 ? -1 : clock - introT0;
    beans.visible = bt >= 0;
    for (let i = 0; i < NB; i++) {
      const b = bd[i], e = bt < 0 ? 0 : ease((bt - b.delay) / 1.7);
      dummy.position.set(b.x + Math.sin(clock * b.sp + b.ph) * 0.12, b.y + Math.cos(clock * b.sp * 0.8 + b.ph) * 0.16 + (1 - e) * b.rise + scrollP * 0.8 * (b.z + 4) * 0.2, b.z);
      qa.setFromAxisAngle(ax.copy(b.w), b.ws * dt); b.q.premultiply(qa); dummy.quaternion.copy(b.q);
      dummy.scale.setScalar(b.s * (0.3 + 0.7 * e)); dummy.updateMatrix(); beans.setMatrixAt(i, dummy.matrix);
    }
    beans.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);
  hero.classList.add('is3d'); frame(performance.now());
  done('ready');
} catch (err) {
  console.warn('3D hero skipped:', err && err.message);
  done('failed');
}
