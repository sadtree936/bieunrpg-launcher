// 펫 '아기 용 미르' — 게임 BabyDragon.java 와 똑같은 공식(그림 · 모양 · 보여 주기 자세). 행동(DragonBrain)은 게임에만 있다.
// Dragon.items(t, out, where) = WebGL(gl3d.js) 항목들. where: 'view'(가운데 크게) · 'fig'(내 모습 오른쪽 어깨 옆) · 'card'(카드 정지 그림).
// 용 좌표(x · y 위 · z 앞) → 모델 좌표(x · y 아래 · z 앞이 -)로 바꿔 넣는다.
(function () {
  const TW = 256, TH = 128;
  const SC = 0xFF7AD7AE, SC_L = 0xFFA8EDCB, SC_D = 0xFF4FAE87;
  const BELLY = 0xFFFFEBC4, BELLY_D = 0xFFEFCF98, HORN = 0xFFFFF1D2, HORN_D = 0xFFE3C489;
  const CHEEK = 0xFFFF9DB4, MEM = 0xFFF7B8D4, MEM_L = 0xFFFFD9E8, MEM_D = 0xFFD982AE, PAD = 0xFFFFB3C4;
  const NOSE = 0xFF2F6E55, MOUTH = 0xFF2C4A3E, TONGUE = 0xFFFF7A93, MOUTH_IN = 0xFFB8405E;
  const M_BODY = 0, M_HEAD = 1, M_SNOUT = 2, M_JAW = 3, M_HORN = 4, M_LEG = 5, M_CLAW = 6, M_TAIL = 7, M_BONE = 8, M_SPIKE = 9;
  const B_BODY = 0, B_HEAD = 1, B_SNOUT = 2, B_JAW = 3, B_HORN1 = 4, B_HORN2 = 5, B_SPIKE = 6, B_LEGF = 7, B_LEGB = 8, B_CLAW = 9,
    B_TAIL1 = 10, B_TAIL2 = 11, B_TAIL3 = 12, B_BONE1 = 13, B_BONE2 = 14, B_THUMB = 15, B_BELLY = 16;
  const BOX = [
    [7, 6, 8, M_BODY, 2], [8, 7, 7, M_HEAD, 2], [5, 2.5, 2.6, M_SNOUT, 4], [4.2, 1, 2.2, M_JAW, 4], [1.2, 2.2, 1.2, M_HORN, 4], [0.9, 1.6, 0.9, M_HORN, 4],
    [1, 1.3, 1.6, M_SPIKE, 4], [2.2, 4.2, 2.2, M_LEG, 4], [2.6, 4.4, 3, M_LEG, 4], [2.4, 0.7, 0.8, M_CLAW, 6], [3.6, 3.2, 4, M_TAIL, 2], [2.6, 2.4, 3.6, M_TAIL, 2],
    [1.7, 1.6, 3.2, M_TAIL, 3], [5.5, 0.6, 0.6, M_BONE, 4], [4.6, 0.5, 0.5, M_BONE, 4], [0.6, 0.6, 1.0, M_CLAW, 6], [5.6, 4.2, 1, M_BODY, 2]];
  const F_FRONT = 0, F_BACK = 1, F_RIGHT = 2, F_LEFT = 3, F_TOP = 4, F_BOTTOM = 5;
  const Q_MEM1 = 0, Q_MEM2 = 1, Q_SPADE = 2, Q_EYE_OPEN = 3, Q_EYE_CLOSED = 4, Q_EYE_HAPPY = 5, Q_HEART = 6, Q_Z = 7, Q_CRUMB = 8, Q_PUFF = 9, Q_SNACK = 10, Q_SPARK = 11, Q_EYE_HALF = 12;
  const QSIZE = [[28, 26], [26, 24], [18, 16], [20, 21], [20, 21], [20, 21], [16, 16], [16, 16], [8, 8], [16, 16], [16, 16], [16, 16], [20, 21]];
  const EYE_OPEN = 0, EYE_CLOSED = 1, EYE_HAPPY = 2, EYE_HALF = 3;

  // ── 그림 칸 나누기(게임과 같은 순서 · 같은 자리) ──
  const fround = (v) => Math.fround(v);
  const px = (v, den) => Math.max(1, Math.round(fround(v) * den));
  const BRECT = [], BUV = [], QRECT = [], QUV = [];
  (function layout() {
    const cur = [0, 0, 0];
    const alloc = (w, h) => {
      if (cur[0] + w > TW) { cur[0] = 0; cur[1] += cur[2] + 1; cur[2] = 0; }
      const r = [cur[0], cur[1], w, h];
      cur[0] += w + 1; cur[2] = Math.max(cur[2], h);
      return r;
    };
    const uv = (r) => [r[0] / TW, r[1] / TH, (r[0] + r[2]) / TW, (r[1] + r[3]) / TH];
    for (let b = 0; b < BOX.length; b++) {
      const [w, h, d, , den] = BOX[b], W = px(w, den), H = px(h, den), D = px(d, den);
      const sz = [[W, H], [W, H], [D, H], [D, H], [W, D], [W, D]];
      BRECT[b] = []; BUV[b] = [];
      for (let f = 0; f < 6; f++) { BRECT[b][f] = alloc(sz[f][0], sz[f][1]); BUV[b][f] = uv(BRECT[b][f]); }
    }
    for (let q = 0; q < QSIZE.length; q++) { QRECT[q] = alloc(QSIZE[q][0], QSIZE[q][1]); QUV[q] = uv(QRECT[q]); }
  })();

  // ── 색 · 무늬 ──
  const mix = (a, b, t) => {
    t = Math.max(0, Math.min(1, t));
    const f = (s) => [(a >>> s) & 255, (b >>> s) & 255];
    let out = 0;
    for (const s of [24, 16, 8, 0]) { const [x, y] = f(s); out = out * 256 + Math.round(x + (y - x) * t); }
    return out >>> 0;
  };
  const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 0xFFFF) / 65535; };
  const fmod = (a, n) => ((a % n) + n) % n;
  function scale(i, j, cw, ch, base, light, dark) {
    const row = Math.floor(j / ch), u = fmod(i + (row & 1) * Math.trunc(cw / 2), cw), v = fmod(j, ch);
    const x = ((u + 0.5) / cw) * 2 - 1, y = (v + 0.5) / ch;
    let c = base;
    if (y > 0.62 + 0.3 * x * x) c = mix(base, dark, 0.32);
    else if (y < 0.36 && Math.abs(x) < 0.45) c = mix(base, light, 0.35);
    return mix(c, hash(i, j) < 0.5 ? light : dark, 0.05);
  }
  const stripe = (j, den) => (fmod(j, Math.max(3, Math.round(fround(1.6) * den))) === 0 ? BELLY_D : BELLY);
  function boxTexel(b, f, i, j, W, H) {
    const mat = BOX[b][3], den = BOX[b][4], s = (i + 0.5) / W, t = (j + 0.5) / H;
    const cw = Math.max(3, Math.round(2 * den)), ch = Math.max(2, Math.round(fround(1.5) * den));
    const side = f === F_RIGHT || f === F_LEFT || f === F_BACK || f === F_FRONT;
    switch (mat) {
      case M_BODY: {
        if (b === B_BELLY) return mix(stripe(j, den), 0xFFFFFFFF, f === F_FRONT ? 0.12 * (1 - t) : 0);
        if (f === F_BOTTOM || f === F_FRONT) return stripe(j, den);
        let c = scale(i, j, cw, ch, SC, SC_L, SC_D);
        if (f === F_TOP) return mix(c, SC_L, 0.25);
        c = mix(c, SC_L, (1 - t) * 0.3);
        if (f === F_RIGHT || f === F_LEFT) {
          const edge = 0.66 + 0.08 * Math.cos((s - 0.5) * Math.PI * 2);
          if (t > edge) return stripe(j, den);
          if (t > edge - 0.08) return mix(c, BELLY, 0.5);
        }
        return c;
      }
      case M_HEAD: {
        if (f === F_BOTTOM) return BELLY;
        if (f === F_FRONT) {
          let c = mix(SC_L, SC, t * 0.8);
          for (const k of [-1, 1]) { const cx = 0.5 + k * 0.4, cy = 0.64, r = Math.hypot((s - cx) / 0.1, (t - cy) / 0.08); if (r < 1) c = mix(c, CHEEK, 0.75 * (1 - r * r) + 0.15); }
          return c;
        }
        const c = scale(i, j, cw, ch, SC, SC_L, SC_D);
        if (f === F_TOP) return mix(c, SC_L, 0.3);
        return mix(c, SC_L, (1 - t) * 0.3);
      }
      case M_SNOUT: {
        if (f === F_BOTTOM) return BELLY;
        if (f === F_TOP) return mix(SC_L, SC, t * 0.5);
        const c = mix(SC_L, SC, t * 0.7);
        if (f === F_FRONT) {
          for (const k of [-1, 1]) if (Math.hypot((s - 0.5 - k * 0.2) / 0.07, (t - 0.32) / 0.09) < 1) return NOSE;
          if (t > 0.86) return MOUTH;
          if (t > 0.74) return mix(c, BELLY, 0.6);
          return c;
        }
        if (side && (f === F_LEFT || f === F_RIGHT)) {
          const line = 0.84 - (f === F_RIGHT ? 1 - s : s) * 0.12;
          if (Math.abs(t - line) < 0.07) return MOUTH;
          if (t > line) return mix(c, BELLY, 0.6);
        }
        return c;
      }
      case M_JAW:
        if (f === F_TOP) return Math.abs(s - 0.5) < 0.24 && t > 0.25 ? TONGUE : MOUTH_IN;
        return f === F_BOTTOM ? BELLY_D : BELLY;
      case M_HORN: case M_SPIKE: {
        const k = f === F_TOP ? 1 : f === F_BOTTOM ? 0 : 1 - t;
        let c = mix(HORN, HORN_D, k * 0.8);
        if (mat === M_HORN && side && fmod(j, Math.max(2, Math.trunc(H / 3))) === 0) c = mix(c, HORN_D, 0.35);
        return c;
      }
      case M_LEG: {
        if (f === F_BOTTOM) {
          if (Math.hypot((s - 0.5) / 0.32, (t - 0.62) / 0.26) < 1) return PAD;
          for (let k = -1; k <= 1; k++) if (Math.hypot((s - 0.5 - k * 0.3) / 0.12, (t - 0.2) / 0.12) < 1) return PAD;
          return mix(BELLY, SC, 0.3);
        }
        return mix(scale(i, j, cw, ch, SC, SC_L, SC_D), SC_D, t * 0.35);
      }
      case M_CLAW: {
        let c = mix(0xFFFFF8EC, 0xFFE9D6B4, t);
        if ((f === F_FRONT || f === F_TOP) && b === B_CLAW && (Math.abs(s - 1 / 3) < 0.04 || Math.abs(s - 2 / 3) < 0.04)) c = 0xFFC9B48E;
        return c;
      }
      case M_TAIL: {
        if (f === F_BOTTOM) return fmod(i, Math.max(3, Math.round(fround(1.6) * den))) === 0 ? BELLY_D : BELLY;
        const c = scale(i, j, cw, ch, SC, SC_L, SC_D);
        if (f === F_TOP) return Math.abs(s - 0.5) < 0.12 ? mix(c, SC_D, 0.4) : mix(c, SC_L, 0.2);
        return mix(c, SC_L, (1 - t) * 0.25);
      }
      case M_BONE: return mix(SC, SC_D, f === F_TOP ? 0.2 : f === F_BOTTOM ? 0.9 : 0.4 + t * 0.4);
      default: return SC;
    }
  }
  const frac = (v) => v - Math.floor(v);
  const segDist = (px0, py0, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, k = l === 0 ? 0 : Math.max(0, Math.min(1, ((px0 - ax) * dx + (py0 - ay) * dy) / l)); return Math.hypot(px0 - ax - dx * k, py0 - ay - dy * k); };
  const zIn = (s, t) => { if (s < 0.18 || s > 0.82 || t < 0.14 || t > 0.86) return false; if (t < 0.32 || t > 0.68) return true; const k = (t - 0.32) / 0.36, cx = 0.78 - k * 0.56; return Math.abs(s - cx) < 0.12; };
  function quadTexel(q, i, j, W, H) {
    const s = (i + 0.5) / W, t = (j + 0.5) / H;
    switch (q) {
      case Q_MEM1: case Q_MEM2: {
        let edge;
        if (q === Q_MEM1) edge = 1 - 0.2 * Math.sin(Math.PI * frac(s * 2));
        else edge = Math.pow(Math.max(0, 1 - s), 0.75) * (1 - 0.18 * Math.sin(Math.PI * frac(s * 3)));
        if (t > edge) return 0;
        let c = mix(MEM, MEM_L, (t / Math.max(0.05, edge)) * 0.8);
        if (t < 0.07) c = mix(c, MEM_D, 0.6);
        const veins = q === Q_MEM1 ? [[0.18, 0.5], [0.62, 1.0]] : [[0.05, 0.33], [0.12, 0.66]];
        for (const v of veins) { const ex = v[1], ey = q === Q_MEM1 ? 1 : Math.pow(Math.max(0, 1 - ex), 0.75); if (segDist(s, t, v[0], 0, ex, ey) < 0.035) c = mix(c, MEM_D, 0.85); }
        if (t > edge - 0.05) c = mix(c, MEM_D, 0.55);
        return c;
      }
      case Q_SPADE: {
        const x = (s - 0.5) * 2, y = t * 2 - 1, r = Math.abs(x) + Math.abs(y + 0.15) * 1.15;
        if (r > 1) return 0;
        let c = mix(MEM, MEM_L, 1 - r);
        if (Math.abs(x) < 0.08) c = mix(c, MEM_D, 0.7);
        if (r > 0.86) c = mix(c, MEM_D, 0.6);
        return c;
      }
      case Q_EYE_OPEN: {
        const r = Math.hypot((s - 0.5) / 0.5, (t - 0.52) / 0.48);
        if (r > 1) return 0;
        if (r > 0.84) return 0xFF1B1530;
        let c = mix(0xFF231945, 0xFF6F64F0, Math.pow(t, 1.3));
        if (Math.hypot((s - 0.5) / 0.27, (t - 0.5) / 0.31) < 1) c = 0xFF100C1C;
        if (Math.hypot((s - 0.33) / 0.16, (t - 0.3) / 0.15) < 1) c = 0xFFFFFFFF;
        if (Math.hypot((s - 0.67) / 0.08, (t - 0.7) / 0.08) < 1) c = 0xFFFFFFFF;
        if (Math.hypot((s - 0.58) / 0.05, (t - 0.28) / 0.05) < 1) c = 0xFFE8E4FF;
        return c;
      }
      case Q_EYE_HALF: {
        const r = Math.hypot((s - 0.5) / 0.5, (t - 0.52) / 0.48);
        if (r > 1 || t < 0.5) return 0;
        if (r > 0.84 || t < 0.58) return 0xFF1B1530;
        let c = mix(0xFF3A2C6E, 0xFF6F64F0, t);
        if (Math.hypot((s - 0.5) / 0.26, (t - 0.62) / 0.2) < 1) c = 0xFF100C1C;
        if (Math.hypot((s - 0.38) / 0.08, (t - 0.68) / 0.07) < 1) c = 0xFFFFFFFF;
        return c;
      }
      case Q_EYE_CLOSED: case Q_EYE_HAPPY: {
        const x = (s - 0.5) * 2;
        if (Math.abs(x) > 0.92) return 0;
        const line = q === Q_EYE_CLOSED ? 0.5 + 0.16 * (1 - x * x) : 0.66 - 0.3 * (1 - x * x);
        if (Math.abs(t - line) < 0.075) return 0xFF1B1530;
        if (q === Q_EYE_CLOSED && Math.abs(x) > 0.7 && t > line && t < line + 0.16 && Math.abs(t - line - (Math.abs(x) - 0.7) * 0.6) < 0.05) return 0xFF1B1530;
        return 0;
      }
      case Q_HEART: {
        const x = (s - 0.5) * 2.5, y = (0.56 - t) * 2.5, a = x * x + y * y - 1;
        if (a * a * a - x * x * y * y * y > 0) return 0;
        let c = mix(0xFFFF8FB1, 0xFFE8336A, t);
        if (Math.hypot((s - 0.34) / 0.1, (t - 0.32) / 0.08) < 1) c = 0xFFFFE6EE;
        return c;
      }
      case Q_Z: {
        const inn = zIn(s, t), edge = !inn && (zIn(s - 0.07, t) || zIn(s + 0.07, t) || zIn(s, t - 0.07) || zIn(s, t + 0.07));
        return inn ? 0xFFEAF2FF : edge ? 0xFF4F5FA8 : 0;
      }
      case Q_CRUMB: return Math.hypot(s - 0.5, t - 0.5) < 0.42 ? mix(0xFFE9B872, 0xFFB57A3E, t) : 0;
      case Q_PUFF: { const r = Math.hypot(s - 0.5, t - 0.5) * 2; if (r > 1) return 0; return ((Math.trunc(255 * Math.pow(1 - r, 0.8)) << 24) | 0xF4F7FA) >>> 0; }
      case Q_SNACK: {
        if (t < 0.32 && Math.abs(s - 0.5) < 0.28 - t * 0.3 && t > 0.08) return 0xFF5BC26A;
        const r = Math.hypot((s - 0.5) / 0.4, (t - 0.6) / 0.38);
        if (r > 1) return 0;
        let c = mix(0xFFFF6F7D, 0xFFC92F4A, t);
        if (Math.hypot((s - 0.38) / 0.09, (t - 0.48) / 0.08) < 1) c = 0xFFFFE0E6;
        if (hash(i, j) < 0.08 && r < 0.8) c = 0xFFFFE9A0;
        return c;
      }
      case Q_SPARK: {
        const x = Math.abs(s - 0.5) * 2, y = Math.abs(t - 0.5) * 2, v = Math.max(0, 1 - Math.pow(x, 0.5) - Math.pow(y, 0.5)) * 2.2;
        if (v <= 0.02) return 0;
        return ((Math.trunc(Math.min(1, v) * 255) << 24) | 0xFFF2B3) >>> 0;
      }
      default: return 0;
    }
  }

  let TEX = null;
  function tex() {
    if (TEX) return TEX;
    const c = document.createElement('canvas');
    c.width = TW; c.height = TH;
    const g = c.getContext('2d'), im = g.createImageData(TW, TH), d = im.data;
    const put = (x, y, v) => { const o = (y * TW + x) * 4; d[o] = (v >>> 16) & 255; d[o + 1] = (v >>> 8) & 255; d[o + 2] = v & 255; d[o + 3] = (v >>> 24) & 255; };
    for (let b = 0; b < BOX.length; b++) for (let f = 0; f < 6; f++) { const r = BRECT[b][f]; for (let j = 0; j < r[3]; j++) for (let i = 0; i < r[2]; i++) put(r[0] + i, r[1] + j, boxTexel(b, f, i, j, r[2], r[3])); }
    for (let q = 0; q < QSIZE.length; q++) { const r = QRECT[q]; for (let j = 0; j < r[3]; j++) for (let i = 0; i < r[2]; i++) put(r[0] + i, r[1] + j, quadTexel(q, i, j, r[2], r[3])); }
    g.putImageData(im, 0, 0);
    return (TEX = c);
  }

  // ── 자세 ──
  const lerp = (a, b, k) => a + (b - a) * k;
  function newPose() {
    return { rootY: 6.4, bodyPitch: 0, bodyRoll: 0, breathe: 1, stretch: 1, headYaw: 0, headPitch: 0, headRoll: 0, jaw: 0, eyes: EYE_OPEN,
      wing: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]], leg: [0, 0, 0, 0], tailYaw: [0, 0, 0], tailPitch: [-18, 10, 16], spade: 0, snack: 0 };
  }
  function flap(p, phase, amp, base) {
    for (const w of p.wing) {
      w[0] = base + 46 * amp * Math.sin(phase); w[1] = 14 * amp * Math.cos(phase); w[2] = -10 * amp * Math.cos(phase);
      w[3] = 4 + 26 * amp * Math.sin(phase - 1.1); w[4] = -6 * amp * Math.cos(phase - 0.8); w[5] = 0;
    }
  }
  function showcase(t) {
    const p = newPose(), ph = t * Math.PI * 2 * 2.1;
    flap(p, ph, 0.9, 12);
    p.rootY = 6.4 + -Math.sin(ph) * 0.35;
    p.bodyPitch = 10 + Math.sin(t * 0.9) * 3;
    p.leg[0] = p.leg[1] = -18 + Math.sin(ph + 1) * 6;
    p.leg[2] = p.leg[3] = 30 + Math.sin(ph + 1.4) * 8;
    for (let k = 0; k < 3; k++) {
      p.tailYaw[k] = Math.sin(t * 2.2 - k * 0.7) * (10 + k * 6);
      p.tailPitch[k] = (k === 0 ? -24 : k === 1 ? 6 : 14) + Math.sin(t * 1.7 - k * 0.6) * 5;
    }
    const cyc = t % 7;
    if (cyc > 4.6 && cyc < 6.2) { const k = Math.sin(((cyc - 4.6) / 1.6) * Math.PI); p.headRoll = 18 * k; p.headYaw = 10 * k; p.eyes = EYE_HAPPY; }
    p.headPitch = -6 + Math.sin(t * 0.8) * 4;
    if (cyc > 2.0 && cyc < 2.13) p.eyes = EYE_CLOSED;
    p.breathe = 1 + Math.sin(t * 2.6) * 0.02;
    return p;
  }
  function cardPose() {
    const p = showcase(0.49);
    p.eyes = EYE_OPEN; p.headRoll = 8; p.headYaw = 12;
    for (const w of p.wing) { w[0] = 34; w[1] = -8; w[2] = 30; w[3] = 16; w[4] = 4; w[5] = 0; }
    return p;
  }

  // ── 모양(3×4 행렬 더미) ──
  let M = null;
  const stack = [];
  const ident = () => { M = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]; stack.length = 0; };
  const push = () => stack.push(M.slice());
  const pop = () => { M = stack.pop(); };
  const translate = (x, y, z) => { M[3] += M[0] * x + M[1] * y + M[2] * z; M[7] += M[4] * x + M[5] * y + M[6] * z; M[11] += M[8] * x + M[9] * y + M[10] * z; };
  const scl = (x, y, z) => { for (let r = 0; r < 3; r++) { M[r * 4] *= x; M[r * 4 + 1] *= y; M[r * 4 + 2] *= z; } };
  function rot(axis, deg) {
    if (!deg) return;
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    let p = axis === 0 ? 1 : 0, q = axis === 2 ? 1 : 2;
    if (axis === 1) { p = 2; q = 0; }
    for (let r = 0; r < 3; r++) { const a1 = M[r * 4 + p], a2 = M[r * 4 + q]; M[r * 4 + p] = a1 * c + a2 * s; M[r * 4 + q] = -a1 * s + a2 * c; }
  }
  const tf = (x, y, z) => [M[0] * x + M[1] * y + M[2] * z + M[3], M[4] * x + M[5] * y + M[6] * z + M[7], M[8] * x + M[9] * y + M[10] * z + M[11]];
  const det = () => M[0] * (M[5] * M[10] - M[6] * M[9]) - M[1] * (M[4] * M[10] - M[6] * M[8]) + M[2] * (M[4] * M[9] - M[5] * M[8]);
  let SINK = null;
  function face(pts, r, both) {
    let q = [tf(pts[0], pts[1], pts[2]), tf(pts[3], pts[4], pts[5]), tf(pts[6], pts[7], pts[8]), tf(pts[9], pts[10], pts[11])];
    let uv = [[r[0], r[3]], [r[2], r[3]], [r[2], r[1]], [r[0], r[1]]];
    const a = [q[1][0] - q[0][0], q[1][1] - q[0][1], q[1][2] - q[0][2]], b = [q[3][0] - q[0][0], q[3][1] - q[0][1], q[3][2] - q[0][2]];
    let n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const l = Math.hypot(n[0], n[1], n[2]);
    if (l < 1e-6) return;
    n = n.map((v) => v / l);
    if (!both && det() < 0) { q = q.reverse(); uv = uv.reverse(); n = n.map((v) => -v); }
    SINK(q, uv, n);
    if (both) SINK(q.slice().reverse(), uv.slice().reverse(), n.map((v) => -v));
  }
  function box(b, x0, y0, z0) {
    const x1 = x0 + BOX[b][0], y1 = y0 + BOX[b][1], z1 = z0 + BOX[b][2], U = BUV[b];
    face([x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], U[F_FRONT]);
    face([x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], U[F_BACK]);
    face([x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], U[F_RIGHT]);
    face([x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], U[F_LEFT]);
    face([x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0], U[F_TOP]);
    face([x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1], U[F_BOTTOM]);
  }
  const plateZ = (q, cx, cy, z, w, h) => face([cx - w / 2, cy - h / 2, z, cx + w / 2, cy - h / 2, z, cx + w / 2, cy + h / 2, z, cx - w / 2, cy + h / 2, z], QUV[q], false);
  const plateY = (q, x0, x1, z0, len) => face([x0, 0, z0 - len, x1, 0, z0 - len, x1, 0, z0, x0, 0, z0], QUV[q], true);

  function emit(p) {
    ident();
    translate(0, p.rootY, 0); rot(0, -p.bodyPitch); rot(2, p.bodyRoll); scl(1, 1, p.stretch);
    push(); scl(1 + (p.breathe - 1) * 0.6, p.breathe, 1); box(B_BODY, -3.5, -3, -4); box(B_BELLY, -2.8, -3.05, 3.6); pop();
    for (let k = 0; k < 3; k++) { push(); translate(0, 2.7 * p.breathe, 1.6 - k * 2.5); rot(0, -22); box(B_SPIKE, -0.5, 0, -0.8); pop(); }
    push();
    translate(0, 2.0, 3.0); rot(1, p.headYaw); rot(0, -p.headPitch); rot(2, p.headRoll);
    box(B_HEAD, -4, -1.5, -1.5);
    box(B_SNOUT, -2.5, -1.5, 5.0);
    push(); translate(0, -1.3, 5.0); rot(0, p.jaw); box(B_JAW, -2.1, -1, 0.1); pop();
    const eq = p.eyes === EYE_CLOSED ? Q_EYE_CLOSED : p.eyes === EYE_HAPPY ? Q_EYE_HAPPY : p.eyes === EYE_HALF ? Q_EYE_HALF : Q_EYE_OPEN;
    plateZ(eq, 2.05, 3.35, 5.53, 3.0, 3.2);
    plateZ(eq, -2.05, 3.35, 5.53, 3.0, 3.2);
    for (const sd of [-1, 1]) { push(); translate(sd * 2.3, 5.3, 0.4); rot(2, -sd * 12); rot(0, -28); box(B_HORN1, -0.6, 0, -0.6); translate(0, 2.0, 0); rot(0, -38); box(B_HORN2, -0.45, 0, -0.45); pop(); }
    pop();
    for (let k = 0; k < 4; k++) {
      const front = k < 2, sd = (k & 1) === 0 ? 1 : -1;
      push();
      if (front) translate(sd * 2.2, -2.2, 2.3); else translate(sd * 2.4, -2.0, -2.4);
      rot(0, p.leg[k]);
      if (front) { box(B_LEGF, -1.1, -4.2, -1.1); box(B_CLAW, -1.2, -4.2, 0.7); } else { box(B_LEGB, -1.3, -4.4, -1.5); box(B_CLAW, -1.2, -4.4, 1.1); }
      pop();
    }
    push();
    translate(0, -0.6, -3.6); rot(1, p.tailYaw[0]); rot(0, p.tailPitch[0]); box(B_TAIL1, -1.8, -1.6, -4);
    translate(0, 0, -3.6); rot(1, p.tailYaw[1]); rot(0, p.tailPitch[1]); box(B_TAIL2, -1.3, -1.2, -3.6);
    translate(0, 0, -3.3); rot(1, p.tailYaw[2]); rot(0, p.tailPitch[2]); box(B_TAIL3, -0.85, -0.8, -3.2);
    translate(0, 0, -2.9); rot(0, p.spade); plateY(Q_SPADE, -1.9, 1.9, 0.3, 3.4);
    pop();
    for (let sd = 0; sd < 2; sd++) {
      const w = p.wing[sd];
      push();
      translate(sd === 0 ? 3.1 : -3.1, 2.3, 0.9);
      if (sd === 1) scl(-1, 1, 1);
      rot(1, w[1]); rot(2, w[0]); rot(0, w[2]);
      box(B_BONE1, 0, -0.3, -0.3);
      plateY(Q_MEM1, 0.2, 5.6, 0, 5.8);
      translate(5.4, 0, 0); rot(1, w[4]); rot(2, w[3]); rot(0, w[5]);
      box(B_THUMB, -0.3, 0.1, 0.1);
      box(B_BONE2, 0, -0.25, -0.25);
      plateY(Q_MEM2, 0, 5.0, 0.05, 5.4);
      pop();
    }
  }

  /**
   * WebGL 항목으로 넣는다. where = 'view'(가운데 · 크게) · 'fig'(내 모습 오른쪽 어깨 옆에서 퍼덕) · 'card'(카드 정지 자세).
   * 모델 좌표: x 그대로 · y 아래 · z 앞이 - (용이 보는 사람 쪽을 보게).
   */
  function items(t, out, where) {
    const p = where === 'card' ? cardPose() : showcase(t);
    const T = tex();
    let s = 1, ox = 0, oy = 0, oz = 0, yaw = 0;
    if (where === 'fig') { s = 0.52; ox = 13; oy = 5 + Math.sin(t * 1.3) * 0.6; oz = -1; yaw = -25; }
    const cy = Math.cos((yaw * Math.PI) / 180), sy = Math.sin((yaw * Math.PI) / 180);
    SINK = (q, uv, n) => {
      // 마인크래프트 엔티티와 비슷한 그늘(위 밝게 · 아래 어둡게)
      const sh = Math.max(0.5, Math.min(1, 0.8 + 0.2 * n[1] - 0.12 * Math.abs(n[0])));
      out.push({
        pts: q.map((v) => { const x = v[0] * cy + v[2] * sy, z = -v[0] * sy + v[2] * cy; return [ox + x * s, oy - v[1] * s, oz - z * s]; }),
        uv, src: T, col: [sh, sh, sh, 1], mode: 'o',
      });
    };
    emit(p);
    SINK = null;
    return out;
  }
  /** 크게 보기 · 카드의 가운데 · 크기(모델 좌표). */
  const BOUNDS = { center: [0, -8, 3], size: 30 };
  window.Dragon = { items, tex, BOUNDS, time: () => (Date.now() % 10000000) / 1000 };
})();
