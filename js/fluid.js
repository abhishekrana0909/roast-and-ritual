/* Roast & Ritual: liquid photos.
   The photos stay real. WebGL only bends them: a bow with scroll speed, a ripple under the cursor,
   a short settle when they first appear, and a dissolve when the Kitchen photo changes.
   Each canvas draws only while something moves, so an idle page costs nothing. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const DPR = Math.min(devicePixelRatio || 1, fine ? 2 : 1.5);
  const VS = 'attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
varying vec2 vUv;
uniform sampler2D uA, uB;
uniform vec2 uRes, uImgA, uImgB, uMouse, uDir;
uniform float uTime, uVel, uHover, uSettle, uMix, uFocus;
vec2 cover(vec2 uv, vec2 img){
  float ra = uRes.x / uRes.y, ia = img.x / img.y;
  vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
  vec2 o = vec2(uFocus, 0.5);
  return (uv - o) * s + o;
}
float hash(vec2 q){ return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 q){ vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
vec3 rgb(sampler2D t, vec2 c, float sh){ return vec3(texture2D(t, c + vec2(sh, 0.0)).r, texture2D(t, c).g, texture2D(t, c - vec2(sh, 0.0)).b); }
void main(){
  vec2 uv = (vUv - 0.5) * 0.96 + 0.5;
  float amp = uVel + uSettle;
  uv.y += sin(vUv.x * 3.14159) * amp * 0.05;
  uv.x += sin(vUv.y * 7.0 + uTime * 1.3) * amp * 0.008;
  uv += uDir * sin(vUv.y * 3.14159) * 0.045;
  vec2 d = vUv - uMouse; float asp = uRes.x / uRes.y; float dist = length(vec2(d.x * asp, d.y));
  uv += (d / (dist + 1e-4)) * sin(dist * 34.0 - uTime * 6.0) * exp(-dist * 7.0) * uHover * 0.008;
  uv = (uv - 0.5) * (1.0 - uHover * 0.035) + 0.5;
  float sh = abs(amp) * 0.007 + length(uDir) * 0.018 + uHover * 0.001;
  vec3 col = rgb(uA, cover(uv, uImgA), sh);
  if (uMix > 0.0) {
    vec3 b = rgb(uB, cover(uv, uImgB), sh);
    float n = noise(vUv * 5.0 + uTime * 0.3) * 0.6 + noise(vUv * 13.0) * 0.4;
    float m = smoothstep(n - 0.12, n + 0.12, uMix * 1.24 - 0.12);
    col = mix(col, b, m);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

  const items = [];
  let vel = 0;
  const t0 = performance.now();

  const program = gl => {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const L = {}; ['uA', 'uB', 'uRes', 'uImgA', 'uImgB', 'uMouse', 'uDir', 'uTime', 'uVel', 'uHover', 'uSettle', 'uMix', 'uFocus'].forEach(n => L[n] = gl.getUniformLocation(pr, n));
    gl.uniform1i(L.uA, 0); gl.uniform1i(L.uB, 1);
    return L;
  };
  const texture = (gl, img) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    return t;
  };
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });

  const make = (canvas, extra) => {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) return null;
    let L; try { L = program(gl); } catch (e) { return null; }
    const it = Object.assign({ canvas, gl, L, texA: null, texB: null, imgA: [1, 1], imgB: [1, 1], mix: 0, hover: 0, th: 0, mouse: [.5, .5], dir: [0, 0], settle: 0, vis: false, dirty: true, focus: .5, always: false, ready: false }, extra || {});
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); it.ready = false; canvas.style.display = 'none'; if (it.box) it.box.classList.remove('gl-on'); });
    new IntersectionObserver(e => { it.vis = e[0].isIntersecting; if (it.vis && it.firstSeen === false) { it.firstSeen = true; it.settle = .9; } it.dirty = true; }, { rootMargin: '60px' }).observe(it.box || canvas);
    items.push(it);
    return it;
  };

  const draw = (it, t) => {
    const { gl, L, canvas } = it;
    const w = Math.max(1, Math.round(canvas.clientWidth * DPR)), h = Math.max(1, Math.round(canvas.clientHeight * DPR));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.texA);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, it.texB || it.texA);
    gl.uniform2f(L.uRes, w, h); gl.uniform2f(L.uImgA, it.imgA[0], it.imgA[1]); gl.uniform2f(L.uImgB, it.imgB[0], it.imgB[1]);
    gl.uniform2f(L.uMouse, it.mouse[0], it.mouse[1]); gl.uniform2f(L.uDir, it.dir[0], it.dir[1]);
    gl.uniform1f(L.uTime, t); gl.uniform1f(L.uVel, it.noVel ? 0 : vel); gl.uniform1f(L.uHover, it.hover); gl.uniform1f(L.uSettle, it.settle);
    gl.uniform1f(L.uMix, it.mix); gl.uniform1f(L.uFocus, it.focus);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const frame = now => {
    const t = (now - t0) / 1000;
    vel += ((window.RR_vel || 0) - vel) * .12;
    for (const it of items) {
      if (!it.ready || !it.vis) continue;
      it.hover += (it.th - it.hover) * .08;
      it.settle *= .955; if (it.settle < .002) it.settle = 0;
      const moving = it.always || Math.abs(vel) > .003 || it.hover > .003 || it.th > 0 || it.settle > 0 || it.mixing;
      if (moving || it.dirty) { draw(it, t); it.dirty = false; }
    }
    requestAnimationFrame(frame);
  };

  window.RRFluid = {
    /* a photo inside a box: the canvas sits over the img, the img stays as the fallback */
    attach(box) {
      if (reduce) return null;
      const img = box.querySelector('img'); if (!img) return null;
      const canvas = document.createElement('canvas'); canvas.className = 'fl-gl'; canvas.setAttribute('aria-hidden', 'true'); box.appendChild(canvas);
      const it = make(canvas, { box, firstSeen: false, focus: parseFloat(box.dataset.focus || '.5') });
      if (!it) { canvas.remove(); return null; }
      loadImg(img.currentSrc || img.src).then(im => {
        it.texA = texture(it.gl, im); it.imgA = [im.naturalWidth, im.naturalHeight]; it.ready = true; it.dirty = true; box.classList.add('gl-on');
      }).catch(() => {});
      if (fine) {
        box.addEventListener('pointermove', e => { const r = box.getBoundingClientRect(); it.mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; it.th = 1; });
        box.addEventListener('pointerleave', () => { it.th = 0; });
      }
      return it;
    },
    /* the Kitchen photo: four textures, a dissolve between them, a bend along the cursor path */
    float(canvas, urls) {
      if (reduce) return null;
      const it = make(canvas, { box: null, always: true, noVel: true, firstSeen: true });
      if (!it) return null;
      const tex = {}, size = {};
      let cur = null, tween = null;
      Promise.all(Object.entries(urls).map(([k, u]) => loadImg(u).then(im => { tex[k] = texture(it.gl, im); size[k] = [im.naturalWidth, im.naturalHeight]; }))).then(() => {
        const k0 = Object.keys(urls)[0]; cur = k0; it.texA = tex[k0]; it.imgA = size[k0]; it.ready = true; it.dirty = true;
      }).catch(() => {});
      return {
        ok: () => it.ready,
        show(k) {
          if (!it.ready || k === cur || !tex[k]) return;
          if (tween) { cancelAnimationFrame(tween); it.texA = it.texB; it.imgA = it.imgB; }
          it.texB = tex[k]; it.imgB = size[k]; it.mix = 0; it.mixing = true; cur = k;
          const s = performance.now();
          const step = now => {
            const p = Math.min(1, (now - s) / 650); it.mix = 1 - Math.pow(1 - p, 3);
            if (p < 1) tween = requestAnimationFrame(step);
            else { it.texA = it.texB; it.imgA = it.imgB; it.mix = 0; it.mixing = false; tween = null; it.dirty = true; }
          };
          tween = requestAnimationFrame(step);
        },
        bend(dx, dy) { it.dir = [dx, dy]; },
        setVisible(v) { it.vis = v; }
      };
    }
  };
  if (!reduce) requestAnimationFrame(frame);
})();
