// 전설 망토 '천상의 유산' 그림 — 게임 CelestialCape.java 와 같은 공식(정수 계산까지 맞춤).
// Celestial.frame() = { outer, inner, glow } 캔버스(80×128, 초당 20번까지) · wing(64×64 빛의 날개) · fly(16×16 나비 날개 한 장).
(function () {
  const W = 80, H = 128, WG = 64, BF = 16;
  const hash = (i, j) => {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h & 0x7fffffff) / 2147483647;
  };
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  function hsv(h, s, v) {
    h = (((h % 360) + 360) % 360) / 60;
    const i = Math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - s * f), u = v * (1 - s * (1 - f));
    const c = [[v, u, p], [q, v, p], [p, v, u], [p, q, v], [u, p, v], [v, p, q]][i] || [v, p, q];
    return [c[0] * 255, c[1] * 255, c[2] * 255];
  }
  const N = W * H, PO = new Float32Array(N * 3), PI = new Float32Array(N * 3), PG = new Float32Array(N * 3);
  const set = (A, i, r, g, b) => { A[i * 3] = r; A[i * 3 + 1] = g; A[i * 3 + 2] = b; };

  function paint(t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
    for (let y = 0; y < H; y++) {
      const k = y / (H - 1);
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const side = 0.5 + 0.5 * Math.sin(x * 0.08 + t * 0.4), lr = mix(178, 214, side), lg = mix(220, 196, side), lb = 255;
        const g = sm(0.42, 1.0, k) * 0.78;
        let R = mix(247, lr, g), G = mix(248, lg, g), B = mix(252, lb, g);
        const ch = sm(0.86, 1.0, k) * 0.55;
        R = mix(R, 246, ch); G = mix(G, 226, ch); B = mix(B, 170, ch);
        const sh = 0.5 + 0.5 * Math.sin(x * 0.22 + Math.sin(y * 0.03 + t * 0.7) * 1.8 + t * 0.5), f = 0.92 + 0.08 * sh;
        R *= f; G *= f; B *= f;
        if (((x + y) & 15) === 0 || ((x - y + 256) & 15) === 0) { R = mix(R, 214, 0.1); G = mix(G, 200, 0.1); }
        let gr = 255 * sm(0.55, 1.0, k) * 0.16, gg = gr * 0.95, gb = gr;
        const e = Math.min(Math.min(x, W - 1 - x), Math.min(y, H - 1 - y));
        if (e <= 4) {
          if (e === 0 || e === 4) { R = 176; G = 138; B = 64; }
          else if (((x + y) & 3) === 0) { R = 243; G = 222; B = 160; }
          else { R = 217; G = 185; B = 106; }
          const along = y === e || y === H - 1 - e ? x : y;
          if (e >= 1 && e <= 3 && along % 12 >= 5 && along % 12 <= 6 && e !== 1) {
            const sky = Math.trunc(along / 12) % 2 === 0;
            R = sky ? 130 : 196; G = sky ? 200 : 160; B = 255;
            const tw = 0.5 + 0.5 * Math.sin(t * 2.4 + along * 0.7);
            gr += R * 0.6 * tw; gg += G * 0.6 * tw; gb += B * 0.6 * tw;
          } else { gr += R * 0.08; gg += G * 0.08; gb += B * 0.08; }
        } else if (e === 7 && (x + y) % 6 < 4) {
          R = mix(R, 217, 0.85); G = mix(G, 185, 0.85); B = mix(B, 106, 0.85);
        }
        if (e > 5) {
          const arc = 17 - 8 * Math.sin((Math.PI * (x - 8)) / 64);
          let gold = x >= 8 && x <= 72 && Math.abs(y - arc) < 0.75;
          if (!gold && x >= 10 && x <= 70 && (x - 10) % 6 === 0 && Math.abs(y - (arc + 3)) < 0.75) gold = true;
          const lu = (x - 5) % 10, lcy = H - 17;
          if (!gold && y >= lcy && y <= H - 9 && Math.abs(Math.hypot(lu - 5 + 0.5, y + 0.5 - lcy) - 4.5) < 0.7) gold = true;
          if (!gold && y === H - 10 && x > 5 && x < W - 6) gold = true;
          if (gold) { R = 222; G = 190; B = 112; gr += 40; gg += 34; gb += 18; }
        }
        const dx = x + 0.5 - 40, dy = y + 0.5 - 52, rr = Math.abs(dx) / 10.5 + Math.abs(dy) / 15.5;
        if (rr <= 1.0) {
          const fc = rr < 0.45 ? [250, 252, 255] : dy < 0 ? (dx < 0 ? [232, 244, 255] : [190, 220, 255]) : dx < 0 ? [205, 190, 255] : [160, 175, 250];
          const shine = Math.exp(-Math.pow(dx + dy - ((t * 9) % 60 - 30), 2) / 6) * 0.6;
          R = Math.min(255, fc[0] + 120 * shine); G = Math.min(255, fc[1] + 120 * shine); B = Math.min(255, fc[2] + 60 * shine);
          const gl = (0.55 + 0.45 * pulse) * (rr < 0.45 ? 1 : 0.7);
          gr += R * gl; gg += G * gl; gb += B * gl;
        } else if (rr <= 1.2) {
          R = 205; G = 170; B = 92;
          if (rr <= 1.1) { R = 236; G = 208; B = 132; }
          gr += 60; gg += 50; gb += 25;
        } else {
          const halo = Math.pow(1 / (1 + (rr - 1.2) * 5), 2) * (0.25 + 0.45 * pulse);
          R = Math.min(255, R + 40 * halo); G = Math.min(255, G + 60 * halo);
          gr += 160 * halo; gg += 200 * halo; gb += 255 * halo;
        }
        set(PO, i, c8(R), c8(G), c8(B));
        set(PG, i, c8(gr), c8(gg), c8(gb));
        const hue = x * 0.9 + y * 0.6 + 40 * Math.sin(y * 0.04 + t * 0.5) + t * 20;
        const a = 0.5 + 0.5 * Math.sin(y * 0.09 + Math.sin(x * 0.07 + t * 0.6) * 2 + t * 0.8), c = hsv(hue, 0.32, 1.0);
        let IR = mix(238, c[0], 0.45 * a), IG = mix(236, c[1], 0.45 * a), IB = mix(248, c[2], 0.45 * a);
        if (e <= 1) { IR = 217; IG = 185; IB = 106; }
        set(PI, i, c8(IR), c8(IG), c8(IB));
      }
    }
    const put = (x, y, r, g, b, v) => {
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      const i = y * W + x;
      set(PO, i, c8(mix(PO[i * 3], r, v)), c8(mix(PO[i * 3 + 1], g, v)), c8(mix(PO[i * 3 + 2], b, v)));
      set(PG, i, c8(PG[i * 3] + r * v), c8(PG[i * 3 + 1] + g * v), c8(PG[i * 3 + 2] + b * v));
    };
    for (let s = 0; s < 70; s++) {
      const h = hash(s, 41), x = 6 + Math.trunc(hash(s, 17) * (W - 12));
      const y = s < 40 ? 6 + Math.trunc(hash(s, 29) * (H - 12)) : Math.trunc((hash(s, 29) * H + t * (4 + h * 6)) % (H - 8)) + 4;
      const tw = Math.max(0, Math.sin(t * (1.4 + h * 3) + h * 30));
      if (tw < 0.15) continue;
      const gold = h > 0.7, r = 255, g = gold ? 236 : 255, b = gold ? 170 : 255;
      put(x, y, r, g, b, tw);
      if (h > 0.85) for (const o of [[1, 0], [-1, 0], [0, 1], [0, -1]]) put(x + o[0], y + o[1], r, g, b, tw * 0.45);
    }
  }

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const outer = mk(W, H), inner = mk(W, H), glow = mk(W, H);
  const xs = [outer, inner, glow].map((c) => c.getContext('2d')), ims = xs.map((x) => x.createImageData(W, H));
  let drawnAt = -1;
  function frame(tSec) {
    const t = tSec == null ? (Date.now() % 10000000) / 1000 : tSec;
    if (tSec == null && Math.abs(t - drawnAt) < 0.05) return { outer, inner, glow };
    drawnAt = t;
    paint(t);
    [PO, PI, PG].forEach((A, k) => {
      const d = ims[k].data;
      for (let i = 0, j = 0; i < N; i++, j += 4) { d[j] = A[i * 3]; d[j + 1] = A[i * 3 + 1]; d[j + 2] = A[i * 3 + 2]; d[j + 3] = 255; }
      xs[k].putImageData(ims[k], 0, 0);
    });
    return { outer, inner, glow };
  }

  function wingCanvas() {
    const c = mk(WG, WG), x = c.getContext('2d'), im = x.createImageData(WG, WG);
    for (let y = 0; y < WG; y++)
      for (let xx = 0; xx < WG; xx++) {
        const px = xx + 0.5 - 3, py = WG - 1 - y + 0.5 - 3;
        let best = 0, along = 0;
        for (let f = 0; f < 7; f++) {
          const ang = ((14 + f * 11.5) * Math.PI) / 180, len = 58 - f * 4.2, ux = Math.cos(ang), uy = Math.sin(ang);
          const tt = px * ux + py * uy, d = Math.abs(-px * uy + py * ux);
          if (tt < 0 || tt > len) continue;
          const w = 6.5 * Math.pow(Math.sin((Math.PI * tt) / len), 0.6) + 0.5;
          if (d > w) continue;
          const a = Math.pow(1 - d / w, 0.6) * (1 - (0.35 * tt) / len);
          if (a > best) { best = a; along = tt / len; }
        }
        if (best <= 0) continue;
        const j = (y * WG + xx) * 4;
        im.data[j] = c8(mix(236, 186, along)); im.data[j + 1] = c8(mix(246, 206, along)); im.data[j + 2] = 255; im.data[j + 3] = c8(best * 230);
      }
    x.putImageData(im, 0, 0);
    return c;
  }
  function flyCanvas() {
    const c = mk(BF, BF), x = c.getContext('2d'), im = x.createImageData(BF, BF);
    for (let y = 0; y < BF; y++)
      for (let xx = 0; xx < BF; xx++) {
        const px = xx + 0.5, py = y + 0.5;
        const up = Math.pow((px - 7) / 7, 2) + Math.pow((py - 5.5) / 5, 2), lo = Math.pow((px - 5.5) / 5, 2) + Math.pow((py - 11.5) / 4, 2);
        const v = Math.max(1 - up, 1 - lo);
        if (v <= 0) continue;
        const edge = Math.min(1, v * 2.2), core = Math.max(0, 1 - Math.hypot(px - 1, py - 8) / 9), j = (y * BF + xx) * 4;
        im.data[j] = c8(mix(200, 255, core)); im.data[j + 1] = c8(mix(205, 255, core)); im.data[j + 2] = 255; im.data[j + 3] = c8(edge * 235);
      }
    x.putImageData(im, 0, 0);
    return c;
  }
  const wing = wingCanvas(), fly = flyCanvas();

  /** 망토 단면(모델 픽셀 · y 아래 · z 뒤) — 게임과 같은 물결. move = 0 서 있음 ~ 1 달림. */
  function spine(t, move) {
    const n = 10, L = 16 / n, amp = ((3 + 9 * move) * Math.PI) / 180, w = 2.2 + 3 * move;
    const idle = (1 - move) * ((16 * Math.PI) / 180) * (0.5 - 0.5 * Math.cos(t * 0.55));
    const p = [[0, 0]];
    let y = 0, z = 0;
    for (let i = 0; i < n; i++) {
      const f = (i + 1) / n, a = amp * Math.sin(t * w - i * 0.8) * f + idle * f * f;
      y += L * Math.cos(a);
      z += L * Math.sin(a);
      p.push([y, z]);
    }
    return p;
  }
  /** 빛의 날개 상태(14초마다): { open 0~1, alpha 0~1 } 또는 null. */
  function wings(t) {
    const p = t % 14;
    if (p > 5) return null;
    let open = p < 1.6 ? 1 - Math.pow(1 - p / 1.6, 3) : 1;
    const alpha = p < 1.2 ? p / 1.2 : p < 3.4 ? 1 : Math.max(0, 1 - (p - 3.4) / 1.6);
    if (p > 3.4) open = 1 - (0.25 * (p - 3.4)) / 1.6;
    return alpha > 0.01 ? { open, alpha } : null;
  }
  /** 나비 다섯 마리(몸 기준 모델 픽셀): [{x, y, z, yaw(라디안), flap(도)}]. */
  function butterflies(t) {
    const out = [];
    for (let k = 0; k < 5; k++) {
      const th = t * 0.45 + k * 1.2566, r = 6.5 + Math.sin(t * 0.3 + k) * 1.2;
      out.push({ x: Math.sin(th) * r, z: 5.5 + Math.cos(th) * 3.5, y: 2 + 9 * (0.5 + 0.5 * Math.sin(t * 0.37 + k * 2.1)), yaw: th + Math.PI / 2, flap: 15 + 60 * Math.abs(Math.sin(t * 7 + k * 1.7)), a: (200 + 40 * Math.sin(t * 2 + k)) / 255 });
    }
    return out;
  }
  let snap = '';
  function snapshot() {
    if (snap) return snap;
    const f = frame(2.2), c = mk(W, H), x = c.getContext('2d');
    x.drawImage(f.outer, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.35;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Celestial = { W, H, frame, wing, fly, spine, wings, butterflies, snapshot, time: () => (Date.now() % 10000000) / 1000 };
})();
