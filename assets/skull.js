// '해골 망토' 그림 — 게임 SkullCape.java 와 똑같은 공식이라 게임과 런처 · 웹 상점의 모양이 같다.
// Skull.frame(t) = { base, glow } 캔버스(80×128 · 찢어진 곳은 투명). 같은 시각이면 다시 그리지 않는다.
(function () {
  const W = 80, H = 128, N = W * H;
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
  const fbm = (x, y) => noise(x, y) * 0.6 + noise(x * 2.1, y * 2.1) * 0.4;
  const sq = (v) => v * v;

  function torn(x, y) {
    let d = 2 + 4 * noise(x * 0.35, 7.3);
    for (let i = 0; i < 4; i++) {
      const px = 8 + hash(i, 3) * 64, w = 3 + hash(i, 4) * 5, dd = 10 + hash(i, 5) * 14;
      d = Math.max(d, dd * (1 - Math.abs(x + 0.5 - px) / w));
    }
    if (y > H - 1 - d) return true;
    const k = y / (H - 1);
    if (k > 0.3) {
      const s = (k - 0.3) / 0.7;
      if (x + 0.5 < (1 + 2.5 * noise(y * 0.3, 2.1)) * s) return true;
      if (W - x - 0.5 < (1 + 2.5 * noise(y * 0.3, 5.7)) * s) return true;
    }
    for (let i = 0; i < 3; i++) {
      const hx = 12 + hash(i, 11) * 56, hy = 74 + hash(i, 12) * 26, r = 1.2 + hash(i, 13) * 1.1;
      const dx = x + 0.5 - hx, dy = (y + 0.5 - hy) * 0.8;
      if (Math.sqrt(dx * dx + dy * dy) < r * (0.8 + 0.4 * noise(x * 0.9, y * 0.9))) return true;
    }
    return false;
  }
  const seg = (px, py, ax, ay, bx, by) => {
    let ux = bx - ax, uy = by - ay;
    const len = Math.hypot(ux, uy);
    ux /= len; uy /= len;
    const vx = px - ax, vy = py - ay;
    return [vx * ux + vy * uy, vx * uy - vy * ux, len];
  };
  function sword(px, py, tx, ty, gx, gy, qx, qy) {
    const [along, side, len] = seg(px, py, tx, ty, gx, gy);
    if (along >= 0 && along <= len) {
      const w = 1.8 * Math.min(1, along / 5);
      if (Math.abs(side) < w) {
        if (noise(px * 0.6, py * 0.6) > 0.68) return [105, 70, 48];
        return side > w * 0.25 ? [172, 174, 180] : [124, 126, 132];
      }
      if (Math.abs(side) < w + 0.8) return [18, 18, 20];
    }
    const g = seg(px, py, gx - ((gy - ty) / len) * 4.5, gy + ((gx - tx) / len) * 4.5, gx + ((gy - ty) / len) * 4.5, gy - ((gx - tx) / len) * 4.5);
    if (g[0] >= -0.3 && g[0] <= g[2] + 0.3 && Math.abs(g[1]) < 1.0) return [122, 94, 42];
    if (g[0] >= -0.9 && g[0] <= g[2] + 0.9 && Math.abs(g[1]) < 1.7) return [20, 16, 12];
    const h = seg(px, py, gx, gy, qx, qy);
    if (h[0] >= 0 && h[0] <= h[2] && Math.abs(h[1]) < 1.1) return [62, 38, 24];
    const pd = Math.hypot(px - qx, py - qy);
    if (pd < 1.7) return [130, 100, 46];
    if (pd < 2.4 || (h[0] >= 0 && h[0] <= h[2] && Math.abs(h[1]) < 1.8)) return [20, 16, 12];
    return null;
  }
  function skull(x, y) {
    const cr = sq((x - 40) / 14) + sq((y - 44) / 13), ck = sq((x - 40) / 12) + sq((y - 53) / 6);
    const jaw = Math.abs(x - 40) < 9 && y > 54 && y < 64.5 && !(y > 62.5 && Math.abs(x - 40) > 7.5);
    if (!(cr < 1 || ck < 1 || jaw)) return cr < 1.24 || ck < 1.35 || (Math.abs(x - 40) < 10.3 && y > 53 && y < 65.8) ? 6 : 0;
    const el = sq((x - 34.5) / 4) + sq((y - 48) / 4.5), er = sq((x - 45.5) / 4) + sq((y - 48) / 4.5);
    if (el < 1 || er < 1) return 2;
    if (y > 53 && y < 57 && Math.abs(x - 40) < (57 - y) * 0.55 + 0.3) return 3;
    if (y > 58 && y < 63 && (Math.abs(y - 60.5) < 0.5 || ((Math.floor(x) - 31) % 3 === 0 && Math.abs(x - 40) < 8))) return 4;
    const c1 = seg(x, y, 44, 32, 47, 37), c2 = seg(x, y, 47, 37, 45, 41);
    if ((c1[0] >= 0 && c1[0] <= c1[2] && Math.abs(c1[1]) < 0.55) || (c2[0] >= 0 && c2[0] <= c2[2] && Math.abs(c2[1]) < 0.55)) return 5;
    return 1;
  }
  const eye = (t) => {
    let p = 0.62 + 0.28 * Math.sin(t * 2.1) + 0.1 * Math.sin(t * 7.3);
    if (hash(Math.floor(t * 1.5), 9) < 0.12) p *= 0.45;
    return Math.max(0, Math.min(1, p));
  };

  // 시간과 상관없는 부분(천 · 찢어짐 · 칼 · 해골 모양)은 한 번만 계산해 둔다
  const TORN = new Uint8Array(N), SK = new Uint8Array(N), RGB = new Float32Array(N * 3);
  for (let y = 0; y < H; y++) {
    const k = y / (H - 1);
    for (let x = 0; x < W; x++) {
      const i = y * W + x, px = x + 0.5, py = y + 0.5;
      if (torn(x, y)) { TORN[i] = 1; continue; }
      const n = fbm(x * 0.18, y * 0.12), fold = Math.sin(x * 0.22 + 0.6 * Math.sin(y * 0.05)) * 4, weave = ((x + y) & 1) === 0 ? 1.5 : -1.5;
      let v = 24 + n * 14 + fold + weave - k * 6;
      const e = Math.min(Math.min(x, W - 1 - x), Math.min(y, H - 1 - y));
      if (e < 4) v -= (4 - e) * 2.5;
      let R = v * 1.03, G = v * 0.97, B = v;
      if (y >= H - 22 && y <= H - 18) { const s = 0.8 + 0.3 * n; R = 88 * s; G = 16 * s; B = 18 * s; }
      if (y === H - 25) { R = 70; G = 12; B = 14; }
      for (let d = 0; d < 8; d++) { const cx = 5 + d * 10, cy = H - 20 + 0.5; if (Math.abs(px - cx) + Math.abs(py - cy) < 2.2) { R = 140; G = 30; B = 28; } }
      const sw = sword(px, py, 10, 18, 56, 76, 61, 82.5) || sword(px, py, 70, 18, 24, 76, 19, 82.5);
      if (sw) { R = sw[0]; G = sw[1]; B = sw[2]; }
      const s = skull(px, py);
      SK[i] = s;
      if (s === 6) { R = 14; G = 12; B = 12; }
      else if (s > 0) {
        const sh = 1 - 0.12 * ((px - 40) / 14 + (py - 44) / 13) - 0.15 * (noise(x * 0.5, y * 0.5) - 0.5);
        const bR = 196 * sh, bG = 186 * sh, bB = 160 * sh;
        if (s === 1) { R = bR; G = bG; B = bB; }
        else if (s === 3 || s === 4) { R = 34; G = 28; B = 24; }
        else if (s === 5) { R = bR * 0.45; G = bG * 0.42; B = bB * 0.4; }
      }
      RGB[i * 3] = R; RGB[i * 3 + 1] = G; RGB[i * 3 + 2] = B;
    }
  }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = mk(), glow = mk(), bctx = base.getContext('2d'), gctx = glow.getContext('2d');
  const bi = bctx.createImageData(W, H), gi = gctx.createImageData(W, H);
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

  function paint(t) {
    const p = eye(t);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x, j = i * 4;
        if (TORN[i]) { bi.data[j + 3] = 0; gi.data[j + 3] = 0; continue; }
        let R = RGB[i * 3], G = RGB[i * 3 + 1], B = RGB[i * 3 + 2], gr = 0, gg = 0, gb = 0;
        if (SK[i] === 2) {
          const px = x + 0.5, py = y + 0.5, cx = px < 40 ? 34.5 : 45.5, dist = Math.hypot(px - cx, (py - 48.5) * 0.95);
          const gv = Math.exp(-(dist * dist) / 3.2) * p;
          R = 12 + 150 * gv; G = 8 + 18 * gv; B = 8 + 14 * gv;
          gr = 255 * gv; gg = 40 * gv; gb = 30 * gv;
        }
        bi.data[j] = c8(R); bi.data[j + 1] = c8(G); bi.data[j + 2] = c8(B); bi.data[j + 3] = 255;
        gi.data[j] = c8(gr); gi.data[j + 1] = c8(gg); gi.data[j + 2] = c8(gb); gi.data[j + 3] = 255;
      }
    bctx.putImageData(bi, 0, 0);
    gctx.putImageData(gi, 0, 0);
  }

  let drawnAt = -1;
  function frame(tSec) {
    const t = tSec == null ? (Date.now() % 10000000) / 1000 : tSec;
    if (tSec == null && Math.abs(t - drawnAt) < 0.066) return { base, glow };
    drawnAt = t;
    paint(t);
    return { base, glow };
  }
  let snap = '';
  /** 카드용 멈춘 그림(눈빛이 밝은 순간). */
  function snapshot() {
    if (snap) return snap;
    const f = frame(0.75), c = mk(), x = c.getContext('2d');
    x.drawImage(f.base, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.5;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Skull = { W, H, frame, snapshot };
})();
