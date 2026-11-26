// 'GLITCH POP' 망토 그림 — 게임 GlitchArt.java 와 똑같은 공식이라 게임과 런처 · 웹 상점의 모양이 같다.
// Glitch.frame(t) = { base, glow } 캔버스(80×128). 같은 시각이면 다시 그리지 않는다.
(function () {
  const W = 80, H = 128;
  const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h & 0x7fffffff) / 2147483647; };
  const c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  const FONT = {
    G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '#####'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    P: ['.####', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  };
  const TOP = 'GLITCH', BOT = 'POP';
  const L1 = { x: 5, y: 34, sx: 2, sy: 3, gap: 2, s: TOP }, L2 = { x: 14, y: 60, sx: 3, sy: 4, gap: 3, s: BOT };
  const line = (y) => (y >= L1.y && y < L1.y + 7 * L1.sy ? 1 : y >= L2.y && y < L2.y + 7 * L2.sy ? 2 : 0);
  function text(x, y) {
    const ln = line(y);
    if (!ln) return false;
    const L = ln === 1 ? L1 : L2, cw = 5 * L.sx + L.gap, lx = x - L.x;
    if (lx < 0) return false;
    const cell = Math.floor(lx / cw), ox = lx % cw;
    if (cell >= L.s.length || ox >= 5 * L.sx) return false;
    return FONT[L.s[cell]][Math.floor((y - L.y) / L.sy)][Math.floor(ox / L.sx)] === '#';
  }
  function shift(y, f) {
    const burst = hash(f, 991) > 0.82, band = Math.floor(y / 3);
    if (hash(band, f * 7 + 3) <= (burst ? 0.6 : 0.9)) return 0;
    return Math.round((hash(band * 3 + 1, f) - 0.5) * (burst ? 6 : 3));
  }
  function mask(x, y, f) {
    if (!line(y)) return false;
    if (hash(y, f * 13 + 5) > 0.975) return false;
    return text(x - shift(y, f), y);
  }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = mk(), glow = mk(), bctx = base.getContext('2d'), gctx = glow.getContext('2d');
  const MAG = [255, 43, 214], CYA = [46, 242, 255], VIO = [128, 56, 255], WHI = [245, 245, 255];

  function paint(t) {
    const f = Math.floor(t * 8);
    const bi = bctx.createImageData(W, H), gi = gctx.createImageData(W, H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const j = (y * W + x) * 4;
        const n = hash(x, y) * 6;
        let R = 11 + n, G = 10 + n, B = 16 + n, gr = 0, gg = 0, gb = 0;
        if (y % 2 === 0) { R += 2; G += 2; B += 2; }
        if (x >= 2 && x <= 3 && y >= 8 && y <= 70) {
          const k = Math.max(0, 1 - Math.abs(y - 39) / 31) * 0.85;
          R += 255 * k; G += 43 * k; B += 214 * k; gr += 200 * k; gg += 30 * k; gb += 170 * k;
        }
        const d = Math.hypot(W - x, H - y) / 52;
        if (d < 1) { const k = (1 - d) * (1 - d); R += 70 * k; G += 18 * k; B += 125 * k; gb += 30 * k; gr += 14 * k; }
        if ((y === 5 || y === 6) && x >= 50 && x <= 76 && x % 5 !== 4) { R = 46; G = 242; B = 255; gr = 30; gg = 190; gb = 210; }
        const cx = Math.floor(x / 4), cy = Math.floor(y / 4);
        const edge = x < 12 || x >= 68 || y < 26 || y >= 100;
        if (edge && x % 4 < 3 && y % 4 < 3 && hash(cx + 101, cy + 57) > 0.84 && hash(cx * 5, cy + f * 3) <= 0.93) {
          const c = hash(cx, cy + 9), col = c < 0.4 ? MAG : c < 0.75 ? CYA : c < 0.95 ? VIO : WHI, b = hash(cx, cy + f) > 0.85 ? 1 : 0.62;
          R = col[0] * b; G = col[1] * b; B = col[2] * b; gr = R * 0.7; gg = G * 0.7; gb = B * 0.7;
        }
        for (let k = 0; k < 6; k++) {
          const fy = 30 + Math.floor(hash(k, f * 3) * 62), fx = Math.floor(hash(k + 11, f * 3) * 70), len = 4 + Math.floor(hash(k + 23, f) * 10);
          if (y === fy && x >= fx && x < fx + len) {
            const c = k % 2 === 0 ? CYA : MAG;
            R = c[0]; G = c[1]; B = c[2]; gr = R * 0.6; gg = G * 0.6; gb = B * 0.6;
          }
        }
        const ln = line(y), m = mask(x, y, f);
        if (!m && ln) {
          let c = null;
          if (mask(x - 1, y, f)) c = ln === 1 ? MAG : [140, 60, 255];
          else if (mask(x + 1, y, f)) c = ln === 1 ? VIO : CYA;
          if (c) { R = c[0] * 0.9; G = c[1] * 0.9; B = c[2] * 0.9; gr = R * 0.7; gg = G * 0.7; gb = B * 0.7; }
          else if (mask(x - 1, y - 1, f)) { R = 52; G = 18; B = 96; gr = 10; gg = 0; gb = 24; }
        }
        if (m) {
          const c = !mask(x, y - 1, f) ? WHI : ln === 1 ? CYA : MAG, s = y % 4 === 1 ? 0.78 : 1;
          R = c[0] * s; G = c[1] * s; B = c[2] * s; gr = R * 0.8; gg = G * 0.8; gb = B * 0.8;
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
  /** 카드용 멈춘 그림(글리치가 거의 없는 순간 — 글자가 또렷하게). */
  function snapshot() {
    if (snap) return snap;
    const f = frame(0.0), c = mk(), x = c.getContext('2d');
    x.drawImage(f.base, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.5;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Glitch = { W, H, frame, snapshot };
})();
