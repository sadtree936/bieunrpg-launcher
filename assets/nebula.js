// '성운의 지배자' 망토 그림 — 게임 NebulaCape.java 와 똑같은 공식(정수 넘침까지 맞춤)이라 게임과 런처 · 웹 상점의 모양이 같다.
// Nebula.frame(t) = { base, glow } 캔버스(80×128). 같은 시각이면 다시 그리지 않는다(초당 20번까지).
(function () {
  const W = 80, H = 128;
  const hash = (i, j) => {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h & 0x7fffffff) / 2147483647;
  };
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    let fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  const fbm = (x, y) => noise(x, y) * 0.55 + noise(x * 2.03, y * 2.03) * 0.3 + noise(x * 4.1, y * 4.1) * 0.15;
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cl = (v) => Math.max(0, Math.min(1, v));
  const N = W * H, r = new Float32Array(N), g = new Float32Array(N), b = new Float32Array(N), gr = new Float32Array(N), gg = new Float32Array(N), gb = new Float32Array(N);
  const add = (x, y, vr, vg, vb) => { const i = y * W + x; r[i] += vr; g[i] += vg; b[i] += vb; gr[i] += vr; gg[i] += vg; gb[i] += vb; };

  function paint(t) {
    const ang = t * 0.06, ca = Math.cos(ang), sa = Math.sin(ang), band = ang + 0.6, cb = Math.cos(band), sb = Math.sin(band);
    for (let y = 0; y < H; y++) {
      const k = y / (H - 1);
      for (let x = 0; x < W; x++) {
        const i = y * W + x, qx = (x - W / 2) / 40, qy = (y - H / 2) / 40;
        const rx = qx * ca - qy * sa, ry = qx * sa + qy * ca, nx = rx * 1.6 + 10 + t * 0.015, ny = ry * 1.6 + 3;
        const n1 = fbm(nx, ny), n2 = fbm(nx + 5.3, ny - 2.1), n3 = fbm(nx - 7.7, ny + 9.1);
        const p = sm(0.45, 0.85, n1), c = sm(0.5, 0.9, n2), bl = sm(0.42, 0.82, n3);
        let R = 11 + (5 - 11) * k, G = 16 + (6 - 16) * k, B = 48 + (14 - 48) * k;
        R += 123 * p * 0.62 + 31 * c * 0.45 + 47 * bl * 0.5;
        G += 63 * p * 0.62 + 201 * c * 0.45 + 107 * bl * 0.5;
        B += 228 * p * 0.62 + 192 * c * 0.45 + 255 * bl * 0.5;
        const d = qx * sb - qy * cb, mw = Math.exp(-d * d * 7) * (0.45 + 0.55 * n2) * 0.42;
        R += 150 * mw; G += 160 * mw; B += 230 * mw;
        const e = Math.min(Math.min(x, W - 1 - x), Math.min(y, H - 1 - y));
        const edge = Math.exp(-e / 1.4) * (0.78 + 0.22 * Math.sin(t * 1.6 + y * 0.06 + x * 0.04));
        r[i] = R + 122 * edge * 0.7; g[i] = G + 108 * edge * 0.7; b[i] = B + 255 * edge * 0.7;
        gr[i] = 122 * edge; gg[i] = 108 * edge; gb[i] = 255 * edge;
      }
    }
    for (let s = 0; s < 70; s++) {
      const sx = hash(s, 11) * 2 - 1, sy = (hash(s, 23) * 2 - 1) * 1.6, h = hash(s, 37);
      const px = sx * ca - sy * sa, py = sx * sa + sy * ca, x = Math.round(W / 2 + px * 40), y = Math.round(H / 2 + py * 40);
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      const tw = 0.55 + 0.45 * Math.sin(t * (1.5 + h * 2.5) + h * 20), v = (h > 0.85 ? 255 : 170) * tw;
      add(x, y, v, v, v * 1.05);
      if (h > 0.85) for (const o of [[1, 0], [-1, 0], [0, 1], [0, -1]]) add(x + o[0], y + o[1], v * 0.45, v * 0.5, v * 0.6);
    }
    const ph = t % 6, flash = ph < 1.3 ? Math.sin((ph / 1.3) * Math.PI) : 0, lvl = 0.78 + 0.5 * flash, ex = W / 2, ey = 56;
    for (let y = ey - 28; y <= ey + 28; y++) {
      for (let x = ex - 28; x <= ex + 28; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const dx = x + 0.5 - ex, dy = y + 0.5 - ey, dist = Math.sqrt(dx * dx + dy * dy);
        let star = Math.max(cl(1 - Math.abs(dx) / 3.4 - Math.abs(dy) / 25), cl(1 - Math.abs(dy) / 3.4 - Math.abs(dx) / 25));
        const ux = (dx + dy) * 0.7071, uy = (dx - dy) * 0.7071;
        star = Math.max(star, 0.7 * Math.max(cl(1 - Math.abs(ux) / 2.4 - Math.abs(uy) / 13), cl(1 - Math.abs(uy) / 2.4 - Math.abs(ux) / 13)));
        const ring = Math.exp(-Math.pow(dist - 15, 2) / 1.1) * 0.6;
        const rune = Math.exp(-Math.pow(dist - 20.5, 2) / 0.8) * (Math.cos(8 * (Math.atan2(dy, dx) - t * 0.25)) > 0.2 ? 0.5 : 0.08);
        const halo = Math.exp(-(dist * dist) / 120) * 0.45, v = (star + ring + rune + halo) * lvl;
        if (v <= 0.01) continue;
        const core = Math.max(0, star - 0.6) * 2.2 * lvl;
        add(x, y, 79 * v + 200 * core, 168 * v + 200 * core, 255 * v + 120 * core);
      }
    }
    const cyc = Math.floor(t / 14);
    if (hash(cyc, 91) < 0.45) {
      const pp = (t - cyc * 14) / 1.1;
      if (pp >= 0 && pp <= 1) {
        const x0 = 6 + hash(cyc, 92) * 30, y0 = 6 + hash(cyc, 93) * 40, x1 = x0 + 46, y1 = y0 + 60, hx = x0 + (x1 - x0) * pp, hy = y0 + (y1 - y0) * pp, len = 22;
        let ux = x1 - x0, uy = y1 - y0; const ul = Math.hypot(ux, uy); ux /= ul; uy /= ul;
        const fade = Math.sin(pp * Math.PI);
        for (let y = Math.trunc(hy - len - 2); y <= hy + 2; y++)
          for (let x = Math.trunc(hx - len - 2); x <= hx + 2; x++) {
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            const vx = hx - (x + 0.5), vy = hy - (y + 0.5), along = vx * ux + vy * uy, side = Math.abs(vx * uy - vy * ux);
            if (along < -1 || along > len) continue;
            const v = Math.exp(-(side * side) / 0.45) * (1 - Math.max(0, along) / len) * fade;
            if (v > 0.02) add(x, y, 230 * v, 240 * v, 255 * v);
          }
      }
    }
  }

  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = mk(), glow = mk(), bctx = base.getContext('2d'), gctx = glow.getContext('2d');
  const bi = bctx.createImageData(W, H), gi = gctx.createImageData(W, H);
  let drawnAt = -1;
  function frame(tSec) {
    const t = tSec == null ? (Date.now() % 10000000) / 1000 : tSec;
    if (tSec == null && Math.abs(t - drawnAt) < 0.05) return { base, glow };
    drawnAt = t;
    paint(t);
    const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
    for (let i = 0, j = 0; i < N; i++, j += 4) {
      bi.data[j] = c8(r[i]); bi.data[j + 1] = c8(g[i]); bi.data[j + 2] = c8(b[i]); bi.data[j + 3] = 255;
      gi.data[j] = c8(gr[i]); gi.data[j + 1] = c8(gg[i]); gi.data[j + 2] = c8(gb[i]); gi.data[j + 3] = 255;
    }
    bctx.putImageData(bi, 0, 0);
    gctx.putImageData(gi, 0, 0);
    return { base, glow };
  }
  let snap = '';
  /** 카드용 멈춘 그림(별 문양이 밝은 순간). */
  function snapshot() {
    if (snap) return snap;
    const f = frame(0.65), c = mk(), x = c.getContext('2d');
    x.drawImage(f.base, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.5;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Nebula = { W, H, frame, snapshot };
})();
