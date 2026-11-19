// '스위트 파티세리 망토' 그림 — 게임 DessertArt.java 와 똑같은 공식이라 게임과 런처 · 웹 상점의 모양이 같다.
// Dessert.frame(t) = { base, glow } 캔버스(80×128). 같은 시각이면 다시 그리지 않는다.
(function () {
  const W = 80, H = 128;
  const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h & 0x7fffffff) / 2147483647; };
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    let fx = x - ix, fy = y - iy;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  const frac = (v) => v - Math.floor(v), sq = (v) => v * v;
  function berry(px, py, cx, cy, s) {
    const u = (px - cx) / s, v = (py - cy) / s;
    if (v < -0.55 && v > -1.05 && Math.abs(u) < 0.6 * (1 - (-0.55 - v) / 0.5) + 0.12 && (Math.abs(u) > 0.2 || v > -0.8)) return [70, 150, 72];
    const w = 0.78 * (1 - 0.55 * Math.max(0, v));
    if (sq(u / w) + sq((v - 0.1) / 0.85) >= 1 || v < -0.62) return null;
    if (sq(u + 0.28) + sq(v + 0.2) < 0.03) return [255, 200, 205];
    const gx = (u + 1) * 3, gy = (v + 1) * 3 + (Math.floor((u + 1) * 3) % 2) * 0.5;
    if (s >= 4 && Math.hypot(frac(gx) - 0.5, frac(gy) - 0.5) < 0.17) return [250, 214, 120];
    const sh = 0.85 + 0.2 * (-u * 0.6 - v * 0.4);
    return [214 * sh, 30 * sh, 48 * sh];
  }
  function dollop(px, py, cx, cy, r) {
    const u = (px - cx) / r, v = (py - cy) / r, top = -0.9 + 0.5 * sq(u);
    if (Math.abs(u) > 1 || v > 0.55 || v < top) return null;
    const s = 0.9 + 0.08 * Math.sin((v * 5 + u * 1.5) * Math.PI) - 0.1 * Math.max(0, v);
    return [252 * s, 246 * s, 240 * s];
  }
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = mk(), glow = mk(), bctx = base.getContext('2d'), gctx = glow.getContext('2d');
  const bi = bctx.createImageData(W, H), gi = gctx.createImageData(W, H);

  function paint(t) {
    const sheen = frac(t / 7) * 260 - 70, tw = 0.5 + 0.5 * Math.sin(t * 2.3);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x, j = i * 4, px = x + 0.5, py = y + 0.5;
        const n = noise(x * 0.2, y * 0.14) * 0.6 + noise(x * 0.45, y * 0.45) * 0.4, fold = Math.sin(x * 0.2 + 0.7 * Math.sin(y * 0.05)) * 5, weave = ((x + y) & 1) === 0 ? 1.6 : -1.6;
        const v = 1 + (n - 0.5) * 0.18 + fold / 70 + weave / 70;
        let R = 78 * v, G = 44 * v, B = 30 * v, gr = 0, gg = 0, gb = 0;
        const dd = px + py * 0.55 - sheen, sh = Math.exp(-(dd * dd) / 60);
        let choco = true;
        const creamTop = 92 + 2.2 * Math.sin(px * 0.33) + 1.2 * Math.sin(px * 0.9 + 1), col = Math.floor(px / 8);
        const dc = px - (col * 8 + 4), dripLen = 4 + hash(col, 7) * 12, dripW = 1.6 + hash(col, 8) * 0.8;
        const drip = (py >= creamTop && py < creamTop + 5) || (Math.abs(dc) < dripW && py >= creamTop && py < creamTop + 5 + dripLen - sq(dc / dripW) * 1.5) || sq(dc / (dripW + 0.4)) + sq((py - (creamTop + 5 + dripLen)) / (dripW + 0.4)) < 1;
        if (drip) {
          const k = Math.min(1, Math.max(0, (py - creamTop) / 16)), hl = Math.abs(dc) < 0.6 ? 14 : 0;
          R = 252 - 8 * k + hl * 0.2; G = 236 - 54 * k + hl * 0.2; B = 238 - 30 * k + hl * 0.2;
          if (py < creamTop + 1.2) { R -= 20; G -= 26; B -= 24; }
          choco = false;
        }
        const hem = H - 7 + 1.8 * Math.cos((px * Math.PI) / 5);
        if (py > hem) {
          const k = (py - hem) / 7;
          R = 246 - 20 * k; G = 168 - 22 * k; B = 190 - 20 * k;
          if ((Math.floor(px / 5) + Math.floor(py)) % 7 === 0) { R += 8; G += 10; B += 10; }
          choco = false;
        } else if (py > hem - 1.4) { R = 226; G = 190; B = 118; gr += 30; gg += 24; gb += 8; choco = false; }
        const e = Math.min(Math.min(px, W - px), py);
        if (py < hem - 2 && e < 5) {
          const along = px < 5 || W - px < 5 ? py : px, bead = Math.abs(frac(along / 4) - 0.5) * 2, r = 2.2 + 0.6 * (1 - bead);
          if (e < r + 0.6) {
            const s2 = 0.82 + 0.18 * (1 - Math.abs(e - 1.8) / 2) - 0.12 * bead;
            R = 248 * s2; G = 176 * s2; B = 198 * s2;
            if (bead < 0.25 && Math.abs(e - 1.6) < 0.6) { R = 255; G = 226; B = 234; }
            choco = false;
          } else if (e < r + 1.6) { R = 222; G = 184; B = 112; gr += 26; gg += 20; gb += 6; choco = false; }
        }
        if (choco && py > 10 && py < creamTop - 3) {
          for (let side = 0; side < 2; side++) {
            const cx = side === 0 ? 10 : W - 10, cy = 14 + Math.round((py - 14) / 15) * 15;
            if (cy > creamTop - 8) continue;
            const b = berry(px, py, cx, cy, 3.2);
            if (b) { R = b[0]; G = b[1]; B = b[2]; choco = false; gr += 14; gg += 2; gb += 4; }
          }
        }
        const cx = 40, cy = 50, rr = Math.hypot(px - cx, (py - cy) * 0.92);
        if (rr < 25.5) {
          if (rr > 23.4) {
            const ang = Math.atan2(py - cy, px - cx), s2 = 0.86 + 0.14 * Math.cos(ang + 0.9);
            R = 228 * s2; G = 190 * s2; B = 118 * s2; gr += 36; gg += 28; gb += 10; choco = false;
            if (Math.abs(frac((ang / (Math.PI * 2)) * 24) - 0.5) < 0.12 && Math.abs(rr - 24.4) < 0.5) { R = 255; G = 236; B = 180; }
          } else if (rr > 22.6) { R = 52; G = 26; B = 18; choco = false; }
          else {
            R *= 0.82; G *= 0.8; B *= 0.8;
            const cl = 25, cr = 55;
            if (px > cl && px < cr) {
              if (py >= 64 && py < 66) { R = 230; G = 196; B = 126; gr += 24; gg += 18; gb += 6; choco = false; }
              else if (py >= 59 && py < 64) { const s2 = 0.92 + 0.08 * noise(x * 0.8, y * 0.8); R = 236 * s2; G = 200 * s2; B = 140 * s2; choco = false; }
              else if (py >= 56 && py < 59) { R = 250; G = 196; B = 210; choco = false; if ((Math.floor(px) + Math.floor(py) * 3) % 5 === 0) { R = 214; G = 36; B = 56; } }
              else if (py >= 51 && py < 56) { const s2 = 0.92 + 0.08 * noise(x * 0.8 + 3, y * 0.8); R = 236 * s2; G = 200 * s2; B = 140 * s2; choco = false; }
              else if (py >= 48 && py < 51) { R = 252; G = 246; B = 240; choco = false; }
              if (!choco && (px < cl + 0.9 || px > cr - 0.9)) { R *= 0.86; G *= 0.86; B *= 0.86; }
            }
            for (let k = 0; k < 4; k++) { const c = dollop(px, py, 29 + k * 7.4, 46, 3.6); if (c) { R = c[0]; G = c[1]; B = c[2]; choco = false; } }
            for (let k = 0; k < 3; k++) { const b = berry(px, py, 30 + k * 10, 41.5, 3.4); if (b && k !== 1) { R = b[0]; G = b[1]; B = b[2]; choco = false; gr += 10; } }
            const big = berry(px, py, 40, 37, 6.5);
            if (big) { R = big[0]; G = big[1]; B = big[2]; choco = false; gr += 26 * tw; gg += 4 * tw; gb += 8 * tw; }
            if (choco && hash(Math.floor(px), Math.floor(py)) > 0.985) { R = 255; G = 236; B = 200; gr += 60 * tw; gg += 50 * tw; gb += 40 * tw; }
          }
        }
        if (choco) { gr += 70 * sh; gg += 44 * sh; gb += 28 * sh; R += 26 * sh; G += 16 * sh; B += 10 * sh; }
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
  /** 카드용 멈춘 그림. */
  function snapshot() {
    if (snap) return snap;
    const f = frame(1.0), c = mk(), x = c.getContext('2d');
    x.drawImage(f.base, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.5;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Dessert = { W, H, frame, snapshot };
})();
