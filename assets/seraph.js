// '천상의 여섯 날개' — 게임 SeraphWings.java 와 똑같은 공식(날개 · 수정 그림 + 모양). 그림 종류는 ui/aura.js 의 것을 같이 쓴다(Aura.tex).
// Seraph.items(t, out, lod) = WebGL(gl3d.js) 항목들. 좌표는 몸 기준 모델 픽셀(목 = 0 · 아래 +y · 등 = +z).
(function () {
  const WW = 128, WH = 64, HN = 64, GLOW = 1, SHARD = 4, STAR = 5, RING2 = 7, FEATHER = 9, CIRCLE = 10, BOLT = 12;
  const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h & 0x7fffffff) / 2147483647; };
  const frac = (v) => v - Math.floor(v), cl = (v) => Math.max(0, Math.min(1, v));
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // ── 날개 그림 ──
  const sm = (a, b, x) => { const k = cl((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const top = (u) => 0.06 + 0.10 * u + 0.18 * sm(0.55, 1, u);
  const bot = (u) => { const span = (0.5 + 0.5 * Math.sin((Math.PI / 2) * Math.min(1, u / 0.4))) * Math.pow(1 - sm(0.5, 1, u), 0.7); return top(u) + 0.9 * span - 0.06 * Math.abs(Math.sin(u * Math.PI * 11)); };
  function paintWing(bd, gd) {
    for (let y = 0; y < WH; y++)
      for (let x = 0; x < WW; x++) {
        const j = (y * WW + x) * 4, u = (x + 0.5) / WW, v = (y + 0.5) / WH, tp = top(u), bt = bot(u);
        if (u > 0.995 || v < tp || v > bt || bt - tp < 0.02) { bd[j + 3] = 0; gd[j + 3] = 0; continue; }
        const w = (v - tp) / (bt - tp);
        let R, G, B, gr = 0, gg = 0, gb = 0;
        if (w < 0.10) {
          const sh = 0.85 + 0.15 * Math.cos(x * 0.9);
          R = 226 * sh; G = 196 * sh; B = 128 * sh;
          if ((x + y * 2) % 5 === 0) { R += 28; G += 26; B += 18; gr += 60; gg += 50; gb += 20; }
          gr += 30; gg += 24; gb += 10;
        } else {
          let row, r0, r1, n;
          if (w < 0.38) { row = 0; r0 = 0.10; r1 = 0.38; n = 22; }
          else if (w < 0.68) { row = 1; r0 = 0.38; r1 = 0.68; n = 14; }
          else { row = 2; r0 = 0.68; r1 = 1.0; n = 9; }
          const wr = (w - r0) / (r1 - r0), k = u * n + (row === 0 ? wr * 1.5 : wr * 0.6), a = frac(k), fi = Math.floor(k) + row * 100;
          const sh = 0.86 + 0.12 * (1 - wr) - 0.06 * row;
          R = 242 * sh; G = 242 * sh; B = 250 * sh;
          if (a < 0.07 || a > 0.93) { R = 196; G = 202; B = 218; }
          else if (row > 0 && Math.abs(a - 0.5) < 0.035) {
            R = 255; G = 252; B = 240;
            if (hash(fi, 2) < 0.5) { gr += 40; gg += 110; gb += 230; }
          }
          if (wr > (row === 0 ? 0.78 : 0.86)) { R = 230; G = 200; B = 132; gr += 70; gg += 56; gb += 22; }
          if (row === 2 && hash(fi, 3) < 0.35) {
            const gx = (a - 0.5) * 6, gy = (wr - 0.18) * 8, g2 = gx * gx + gy * gy;
            if (g2 < 1) { const c = 1 - g2; R = 40 + 200 * c * c; G = 110 + 140 * c * c; B = 230 + 25 * c; gr += 60 * c + 30; gg += 140 * c + 40; gb += 255 * c; }
          }
          if (Math.abs(frac(a * 3 + wr * 2) - 0.5) < 0.03 && hash(fi, 5) < 0.4) { gr += 20; gg += 50; gb += 110; }
        }
        bd[j] = c8(R); bd[j + 1] = c8(G); bd[j + 2] = c8(B); bd[j + 3] = 255;
        gd[j] = c8(gr); gd[j + 1] = c8(gg); gd[j + 2] = c8(gb); gd[j + 3] = 255;
      }
  }

  // ── 수정 그림 ──
  const heartF = (X, Y) => { const q = X * X + Y * Y - 1; return q * q * q - X * X * Y * Y * Y; };
  function paintHeart(bd, gd) {
    for (let y = 0; y < HN; y++)
      for (let x = 0; x < HN; x++) {
        const j = (y * HN + x) * 4, X = (x + 0.5 - 32) / 22, Y = -(y + 0.5 - 34) / 22, f = heartF(X, Y), f2 = heartF(X / 1.14, Y / 1.14);
        if (f < 0) {
          const c = Math.exp(-(X * X + (Y - 0.1) * (Y - 0.1)) * 1.8);
          let R = 30 + 150 * c, G = 80 + 140 * c, B = 210 + 45 * c;
          if (Math.abs(frac((X * 1.3 + Y) * 3) - 0.5) < 0.06 || Math.abs(frac((-X * 1.3 + Y) * 3) - 0.5) < 0.06) { R += 25; G += 25; B += 15; }
          bd[j] = c8(R); bd[j + 1] = c8(G); bd[j + 2] = c8(B); bd[j + 3] = 255;
          gd[j] = c8(20 + 130 * c); gd[j + 1] = c8(50 + 130 * c); gd[j + 2] = c8(120 + 130 * c); gd[j + 3] = 255;
        } else if (f2 < 0) {
          const sh = 0.85 + 0.15 * Math.cos(Math.atan2(Y, X) * 2 + 0.8);
          let R = 225 * sh, G = 190 * sh, B = 110 * sh;
          if ((x + y) % 4 === 0) { R += 25; G += 22; B += 14; }
          bd[j] = c8(R); bd[j + 1] = c8(G); bd[j + 2] = c8(B); bd[j + 3] = 255;
          gd[j] = 50; gd[j + 1] = 40; gd[j + 2] = 16; gd[j + 3] = 255;
        } else { bd[j + 3] = 0; gd[j + 3] = 0; }
      }
  }

  let TEX = null;
  function tex() {
    if (TEX) return TEX;
    const out = [];
    for (const [w, h, fn] of [[WW, WH, paintWing], [HN, HN, paintHeart]]) {
      const b = mk(w, h), g = mk(w, h), bx = b.getContext('2d'), gx = g.getContext('2d'), bi = bx.createImageData(w, h), gi = gx.createImageData(w, h);
      fn(bi.data, gi.data);
      bx.putImageData(bi, 0, 0); gx.putImageData(gi, 0, 0);
      out.push(b, g);
    }
    return (TEX = out);      // 0 날개 · 1 날개 빛 · 2 수정 · 3 수정 빛
  }

  // ── 모양(게임 SeraphWings.emit 과 같다) ──
  const CX = 0, CY = 4, CZ = 6, V_ROOT = 0.3, D = Math.PI / 180;
  const WINGS = [[-30, 22, 13, -3.0, 1.4, 0.0], [2, 25, 12, 0.5, 1.0, 0.7], [32, 17, 10, 3.5, 0.6, 1.4]];
  const wingPt = (W, side, u, v, t) => {
    const flap = Math.sin(t * 1.8 + W[5] - u * 0.9), th = (W[0] + 9 * flap) * D, lx = u * W[1], ly = (v - V_ROOT) * W[2];
    const px = lx * Math.cos(th) - ly * Math.sin(th), py = lx * Math.sin(th) + ly * Math.cos(th), phi = (22 + 12 * u + 26 * flap) * D;
    return [side * (1.5 + px * Math.cos(phi)), CY + W[3] + py, CZ - 1.5 + W[4] + Math.max(0, px) * Math.sin(phi)];
  };
  const card = (x, y, z, size, spinDeg) => {
    const h = size / 2, a = spinDeg * D, c = Math.cos(a) * h, s = Math.sin(a) * h;
    return [[x - c + s, y - s - c, z], [x + c + s, y + s - c, z], [x + c - s, y + s + c, z], [x - c - s, y - s + c, z]];
  };
  function tiltRing(S, r, w, spinDeg, rx, ry, col) {
    const seg = 36, sp = spinDeg * D, ax = rx * D, ay = ry * D;
    for (let i = 0; i < seg; i++) {
      const rr = [r - w / 2, r - w / 2, r + w / 2, r + w / 2], a0 = sp + (Math.PI * 2 * i) / seg, a1 = sp + (Math.PI * 2 * (i + 1)) / seg, aa = [a0, a1, a1, a0];
      const q = [];
      for (let k = 0; k < 4; k++) {
        const x = Math.cos(aa[k]) * rr[k], y = Math.sin(aa[k]) * rr[k];
        const y1 = y * Math.cos(ax), z1 = y * Math.sin(ax), x2 = x * Math.cos(ay) + z1 * Math.sin(ay), z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
        q.push([CX + x2, CY + y1, CZ + z2]);
      }
      S.quad(RING2, q, col);
    }
  }
  function emit(t, lod, S) {
    const seg = lod <= 0 ? 6 : lod === 1 ? 4 : 2, shimmer = 0.55 + 0.25 * Math.sin(t * 1.6);
    for (const W of WINGS)
      for (const side of [-1, 1])
        for (let g = 0; g < seg; g++) {
          const u0 = g / seg, u1 = (g + 1) / seg, q = [wingPt(W, side, u0, 0, t), wingPt(W, side, u1, 0, t), wingPt(W, side, u1, 1, t), wingPt(W, side, u0, 1, t)];
          const uv = [[u0, 0], [u1, 0], [u1, 1], [u0, 1]];
          S.tex(0, q, uv, [1, 1, 1, 1]);
          if (lod <= 1) S.tex(1, q, uv, [1, 1, 1, shimmer]);
        }
    const uvF = [[0, 0], [1, 0], [1, 1], [0, 1]];
    S.tex(2, card(CX, CY, CZ + 0.4, 8, 0), uvF, [1, 1, 1, 1]);
    if (lod <= 1) S.tex(3, card(CX, CY, CZ + 0.45, 8, 0), uvF, [1, 1, 1, 0.45 + 0.25 * Math.sin(t * 2.2)]);
    if (lod >= 2) return;
    S.quad(GLOW, card(CX, CY, CZ + 0.2, 18, 0), [0.75, 0.85, 1, 0.16 + 0.05 * Math.sin(t * 2.2)]);
    S.quad(CIRCLE, card(CX, CY, CZ - 1.2, 40, t * 6), [1, 0.92, 0.7, 0.55]);
    tiltRing(S, 5.0, 0.7, t * 40, 70, 0, [1, 0.9, 0.62, 0.9]);
    tiltRing(S, 6.2, 0.6, -t * 28, 0, 70, [1, 0.94, 0.75, 0.8]);
    tiltRing(S, 7.4, 0.45, t * 18, 45, 45, [0.85, 0.92, 1, 0.65]);
    for (let k = 0; k < 6; k++) {
      const a = t * (0.6 + 0.1 * k) * (k % 2 === 0 ? 1 : -1) + (k * Math.PI) / 3, r = 8.5 + (k % 3);
      S.quad(SHARD, card(CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.6, CZ + Math.sin(a) * 1.2, 1.4, t * 60 + k * 30), k % 3 === 0 ? [1, 1, 1, 0.95] : [0.35, 0.6, 1, 0.95]);
    }
    for (const W of WINGS)
      for (const side of [-1, 1]) {
        S.strip([[CX, CY, CZ + 0.2], wingPt(W, side, 0.45, 0.35, t)], 0.25, [1, 0.92, 0.7, cl(0.35 + 0.25 * Math.sin(t * 3 + W[5] + side))]);
        if (lod <= 0) {
          const n = 9, rb = [];
          for (let m = 0; m < n; m++) { const u = 0.25 + (0.75 * m) / (n - 1); rb.push(wingPt(W, side, u, bot(u) + 0.04, t)); }
          const flow = frac(t * 0.4 + W[5] * 0.3);
          S.strip(rb, 0.7, [0.8, 0.92, 1, 0.25 + 0.35 * Math.sin(Math.PI * flow)]);
        }
      }
    const nF = lod <= 0 ? 10 : 5;
    for (let i = 0; i < nF; i++) {
      const p = frac(t / 6 + hash(i, 1)), side = i % 2 === 0 ? 1 : -1, x = side * (6 + hash(i, 2) * 22), y = CY - 8 + hash(i, 3) * 10 + p * 14;
      S.quad(FEATHER, card(x + Math.sin(t + i) * 1.5, y, CZ + hash(i, 4) * 3, 1.6, t * 30 + i * 47), [1, 0.97, 0.88, cl(Math.sin(Math.PI * p) * 0.9)]);
    }
    const nS = lod <= 0 ? 18 : 8;
    for (let i = 0; i < nS; i++) {
      const p = frac(t / 5 + hash(i, 11)), a = hash(i, 12) * Math.PI * 2 + t * 0.15, r = 4 + hash(i, 13) * 24;
      S.quad(STAR, card(CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.5 - p * 4, CZ + (hash(i, 14) - 0.5) * 4, 0.7 + hash(i, 15) * 0.5, t * 40), [1, 0.88, 0.55, cl(Math.sin(Math.PI * p) * 0.85)]);
    }
  }

  /** 이 시각의 날개 전체를 WebGL 항목으로(lod 0 가까이 · 1 중간 · 2 멀리). */
  function items(t, out, lod) {
    const T = tex(), A = window.Aura, UV = [[0, 0], [1, 0], [1, 1], [0, 1]];
    emit(t, lod || 0, {
      tex: (which, q, uv, col) => out.push({ pts: q, uv, src: T[which], col, mode: which % 2 === 1 ? 'a' : 'o' }),
      quad: (kind, q, col) => { if (A) out.push({ pts: q, uv: UV, src: A.tex(kind), col, mode: 'a' }); },
      strip: (pts, w, col) => {
        if (!A) return;
        for (let i = 0; i + 1 < pts.length; i++) {
          const [ax, ay, az] = pts[i], [bx, by, bz] = pts[i + 1], h = w / 2;
          let dx = bx - ax, dy = by - ay, dz = bz - az; const l = Math.hypot(dx, dy, dz) || 1; dx /= l; dy /= l; dz /= l;
          let s1x = dz, s1z = -dx; const l1 = Math.hypot(s1x, s1z); if (l1 < 1e-3) { s1x = 1; s1z = 0; } else { s1x /= l1; s1z /= l1; }
          const s1 = [s1x * h, 0, s1z * h], s2 = [dy * s1z * h, (dz * s1x - dx * s1z) * h, -dy * s1x * h];
          for (const o of [s1, s2]) out.push({ pts: [[ax - o[0], ay - o[1], az - o[2]], [bx - o[0], by - o[1], bz - o[2]], [bx + o[0], by + o[1], bz + o[2]], [ax + o[0], ay + o[1], az + o[2]]], uv: UV, src: A.tex(BOLT), col, mode: 'a' });
        }
      },
    });
    return out;
  }
  let snap = '';
  /** 카드 그림: 가운데 수정을 두고 날개를 좌우로 펼친 모습. */
  function snapshot() {
    if (snap) return snap;
    const T = tex(), c = mk(256, 96), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    for (const [dy, sc] of [[-14, 0.85], [6, 1], [24, 0.72]]) {
      const w = 124 * sc, h = 62 * sc, y = 18 + dy;
      x.drawImage(T[0], 128, y, w, h);
      x.save(); x.translate(128, 0); x.scale(-1, 1); x.drawImage(T[0], 0, y, w, h); x.restore();
    }
    x.drawImage(T[2], 112, 30, 32, 32);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.6;
    x.drawImage(T[3], 112, 30, 32, 32);
    snap = c.toDataURL('image/png');
    return snap;
  }
  window.Seraph = { items, snapshot, time: () => (Date.now() % 10000000) / 1000 };
})();
