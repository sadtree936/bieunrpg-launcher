// '성탄의 별빛 망토' 그림 — 게임 XmasCape.java 와 똑같은 공식이라 게임과 런처 · 웹 상점의 모양이 같다.
// Xmas.frame(t) = { base, glow } 캔버스(80×128). 같은 시각이면 다시 그리지 않는다(초당 20번까지).
(function () {
  const W = 80, H = 128, N = W * H;
  const hash = (i, j) => {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h & 0x7fffffff) / 2147483647;
  };
  const TIER = [[20, 44, 14], [34, 60, 20], [50, 78, 26], [66, 94, 32], [82, 110, 37]];
  const BG = 0, TREE = 1, TRUNK = 2, GARL = 3, STARP = 4, EDGE = 5, SNOWG = 6, ORN = 7;
  const TYPE = new Uint8Array(N), ORNI = new Uint8Array(N), RGB = new Float32Array(N * 3);
  const inTier = (k, x, y) => {
    const [top, bot, hw] = TIER[k];
    if (y < top || y > bot) return false;
    const s = (y - top) / (bot - top), half = 2 + (hw - 2) * s;
    if (Math.abs(x - 40) >= half) return false;
    return y < bot - 2.5 * Math.abs(Math.sin((x - 40) * 0.35));
  };
  const starR = (dx, dy) => {
    const a = Math.atan2(dy, dx) + Math.PI / 2, seg = (Math.PI * 2) / 5, f = Math.abs(((((a % seg) + seg) % seg) / seg - 0.5)) * 2;
    return 3 + (7 - 3) * f;
  };
  const ORNS = [];
  {
    const cols = [[0.82, 0.12, 0.16], [0.95, 0.74, 0.25], [0.55, 0.85, 1.0]];
    const fr = [[-0.4, 0.4], [-0.55, 0, 0.55], [-0.55, 0, 0.55], [-0.62, -0.22, 0.22, 0.62], [-0.62, -0.22, 0.22, 0.62]];
    let ci = 0;
    for (let k = 0; k < TIER.length; k++) {
      const [top, bot, hw] = TIER[k], y = top + (bot - top) * 0.78;
      for (let i = 0; i < fr[k].length; i++) {
        const f = fr[k][i], half = 2 + (hw - 2) * 0.78, c = cols[ci++ % 3];
        ORNS.push([40 + f * half, y + (hash(k, i) - 0.5) * 3, 2.0 + hash(i, k + 7) * 0.5, c[0], c[1], c[2]]);
      }
    }
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, px = x + 0.5, py = y + 0.5, k = y / (H - 1);
      let R = 10 + (5 - 10) * k, G = 22 + (12 - 22) * k, B = 36 + (22 - 36) * k, type = BG, tier = -1;
      for (let t = TIER.length - 1; t >= 0; t--) if (inTier(t, px, py)) { tier = t; break; }
      if (tier >= 0) {
        type = TREE;
        const [top, bot] = TIER[tier], s = (py - top) / (bot - top), v = 0.72 + 0.4 * s;
        const needle = (x * 2 + y * 3) % 5 === 0 ? 1.25 : (x * 3 - y * 2 + 300) % 7 === 0 ? 0.78 : 1;
        R = 14 * v * needle; G = 92 * v * needle; B = 56 * v * needle;
        const hw = TIER[tier][2] * 0.85, u = (px - (40 - hw)) / (2 * hw);
        if (u >= 0 && u <= 1) {
          const gy = top + (bot - top) * (0.32 + 0.42 * u) + 2.2 * Math.sin(Math.PI * u);
          if (Math.abs(py - gy) < 0.85) { type = GARL; const bead = x % 3 === 0; R = bead ? 236 : 196; G = bead ? 196 : 152; B = bead ? 92 : 54; }
        }
      }
      if (Math.abs(px - 40) < 5 && py > 108 && py < 119) { type = TRUNK; const st = x % 3 === 0 ? 0.8 : 1; R = 92 * st; G = 56 * st; B = 30 * st; }
      if (py > 117 + 2 * Math.sin(x * 0.3) + Math.sin(x * 0.77)) { type = SNOWG; const sh = 0.86 + 0.14 * Math.sin(x * 0.5 + y); R = 214 * sh; G = 228 * sh; B = 244 * sh; }
      const dx = px - 40, dy = py - 15;
      if (Math.hypot(dx, dy) < starR(dx, dy)) { type = STARP; const sh = 0.85 + (0.15 * (-dx - dy)) / 7; R = 246 * sh; G = 200 * sh; B = 72 * sh; }
      for (let o = 0; o < ORNS.length; o++) {
        const q = ORNS[o], d = Math.hypot(px - q[0], py - q[1]);
        if (d < q[2]) { type = ORN; ORNI[i] = o; const hl = d < q[2] * 0.45 && px < q[0] && py < q[1] ? 1.5 : 1; R = q[3] * 190 * hl; G = q[4] * 190 * hl; B = q[5] * 190 * hl; }
      }
      const e = Math.min(Math.min(x, W - 1 - x), Math.min(y, H - 1 - y));
      if (e === 0) { type = EDGE; R = 226; G = 182; B = 84; } else if (e === 1) { type = EDGE; R = 120; G = 88; B = 34; }
      TYPE[i] = type; RGB[i * 3] = R; RGB[i * 3 + 1] = G; RGB[i * 3 + 2] = B;
    }
  const light = (t) => {
    const c = t % 6.5, bottom = 114, top = 15;
    if (c < 3.2) return [bottom - (bottom - top) * (c / 3.2), 0.55, 1, 0];
    if (c < 3.9) return [top, 0.7, 0, Math.sin((Math.PI * (c - 3.2)) / 0.7)];
    return [top, 0.7 * Math.max(0, 1 - (c - 3.9) / 2.6), 0, 0];
  };
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = mk(), glow = mk(), bctx = base.getContext('2d'), gctx = glow.getContext('2d');
  const bi = bctx.createImageData(W, H), gi = gctx.createImageData(W, H);
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  const snow = new Float32Array(N), sparkle = new Float32Array(N);

  function paint(t) {
    const [front, lit, band, flash] = light(t);
    snow.fill(0); sparkle.fill(0);
    for (let f = 0; f < 70; f++) {
      const sp = 5 + hash(f, 1) * 9, x = hash(f, 2) * W + 1.6 * Math.sin(t * (0.6 + hash(f, 3)) + f);
      const y = ((hash(f, 4) * (H + 6) + t * sp) % (H + 6)) - 3, ix = Math.floor(x), iy = Math.floor(y), big = hash(f, 5) > 0.8, a = 0.55 + 0.35 * hash(f, 6);
      for (const o of big ? [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] : [[0, 0]]) {
        const xx = ix + o[0], yy = iy + o[1];
        if (xx < 2 || yy < 2 || xx >= W - 2 || yy >= H - 2) continue;
        const i = yy * W + xx, v = o[0] === 0 && o[1] === 0 ? a : a * 0.5;
        snow[i] = Math.max(snow[i], v);
        if (big) sparkle[i] = Math.max(sparkle[i], v * (0.4 + 0.6 * Math.max(0, Math.sin(t * 3 + f))));
      }
    }
    const ornOn = (q) => 0.25 + 0.75 * (q[1] >= front ? Math.max(lit / 0.7, band > 0 ? 1 : 0) : 0);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x, j = i * 4, type = TYPE[i], py = y + 0.5;
        let R = RGB[i * 3], G = RGB[i * 3 + 1], B = RGB[i * 3 + 2], gr = 0, gg = 0, gb = 0;
        const passed = py >= front, bandV = band * Math.exp(-Math.pow((py - front) / 4.5, 2));
        if (type === TREE || type === GARL || type === TRUNK) {
          const Lv = (passed ? lit : 0) + bandV;
          R += 70 * Lv; G += 58 * Lv; B += 12 * Lv;
          gr += 60 * bandV; gg += 46 * bandV; gb += 10 * bandV;
          if (type === GARL) { const tw = 0.3 + 0.7 * Lv, m = x % 3 === 0 ? 1 : 0.35; gr += 150 * tw * m; gg += 110 * tw * m; gb += 30 * tw; }
        }
        if (type === ORN) {
          const q = ORNS[ORNI[i]], on = ornOn(q);
          R *= 0.7 + 0.6 * on; G *= 0.7 + 0.6 * on; B *= 0.7 + 0.6 * on;
          gr += 255 * q[3] * on; gg += 255 * q[4] * on; gb += 255 * q[5] * on;
        }
        if (type === STARP) {
          const s = 0.35 + 0.65 * flash + 0.15 * (lit / 0.7);
          R = Math.min(255, R * (1 + 0.4 * flash)); G = Math.min(255, G * (1 + 0.4 * flash)); B += 60 * flash;
          gr += 255 * s; gg += 210 * s; gb += 90 * s;
        }
        if (flash > 0) {
          const dx = x + 0.5 - 40, dy = py - 15, d = Math.hypot(dx, dy);
          const ray = (Math.abs(dx) < 0.8 || Math.abs(dy) < 0.8) && d < 6 + 12 * flash ? 1 - d / (6 + 12 * flash) : 0;
          const halo = Math.exp(-(d * d) / (40 + 60 * flash)) * 0.8, v = (ray + halo) * flash;
          R += 120 * v; G += 100 * v; B += 40 * v;
          gr += 255 * v; gg += 220 * v; gb += 120 * v;
        }
        if (type === TREE || type === GARL) {
          for (const q of ORNS) {
            const d = Math.hypot(x + 0.5 - q[0], py - q[1]);
            if (d < q[2] + 2.5) { const h = (1 - (d - q[2]) / 2.5) * 0.5 * ornOn(q); gr += 200 * q[3] * h; gg += 200 * q[4] * h; gb += 200 * q[5] * h; }
          }
        }
        const sn = snow[i];
        if (sn > 0) { R += (240 - R) * sn; G += (246 - G) * sn; B += (255 - B) * sn; }
        if (sparkle[i] > 0) { gr += 200 * sparkle[i]; gg += 220 * sparkle[i]; gb += 255 * sparkle[i]; }
        bi.data[j] = c8(R); bi.data[j + 1] = c8(G); bi.data[j + 2] = c8(B); bi.data[j + 3] = 255;
        gi.data[j] = c8(gr); gi.data[j + 1] = c8(gg); gi.data[j + 2] = c8(gb); gi.data[j + 3] = 255;
      }
    bctx.putImageData(bi, 0, 0);
    gctx.putImageData(gi, 0, 0);
  }

  let drawnAt = -1;
  function frame(tSec) {
    const t = tSec == null ? (Date.now() % 10000000) / 1000 : tSec;
    if (tSec == null && Math.abs(t - drawnAt) < 0.05) return { base, glow };
    drawnAt = t;
    paint(t);
    return { base, glow };
  }
  let snap = '';
  /** 카드용 멈춘 그림: 빛이 별에 닿아 번쩍이는 순간. */
  function snapshot() {
    if (snap) return snap;
    const f = frame(3.45), c = mk(), x = c.getContext('2d');
    x.drawImage(f.base, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.5;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Xmas = { W, H, frame, snapshot };
})();
