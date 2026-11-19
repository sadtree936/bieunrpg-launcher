// '뇌광의 망토' 그림 — 게임 ThunderCape.java 와 똑같은 공식이라 게임과 런처 · 웹 상점의 모양이 같다.
// Thunder.frame(t) = { base, glow } 캔버스(80×128). 같은 시각이면 다시 그리지 않는다(초당 20번까지).
(function () {
  const W = 80, H = 128, N = W * H;
  const hash = (i, j) => {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h & 0x7fffffff) / 2147483647;
  };
  const EM = [[46, 30], [33, 63], [43, 63], [32, 97], [52, 57], [41, 57], [51, 30]];
  const emblem = (x, y) => {
    let inside = false;
    for (let i = 0, j = EM.length - 1; i < EM.length; j = i++)
      if ((EM[i][1] > y) !== (EM[j][1] > y) && x < ((EM[j][0] - EM[i][0]) * (y - EM[i][1])) / (EM[j][1] - EM[i][1]) + EM[i][0]) inside = !inside;
    return inside;
  };
  // 문양 · 회로는 시간과 상관없으니 한 번만 계산
  const EMB = new Uint8Array(N), CIR = new Uint8Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, cx = Math.trunc(x / 10), cy = Math.trunc(y / 10), gx = x % 10, gy = y % 10;
      EMB[i] = emblem(x + 0.5, y + 0.5) ? 1 : 0;
      const tr = (gy === 5 && hash(cx, cy) < 0.5) || (gx === 5 && hash(cx, cy + 99) < 0.4);
      const node = gx >= 4 && gx <= 5 && gy >= 4 && gy <= 5 && hash(cx, cy + 7) < 0.35;
      CIR[i] = (tr ? 1 : 0) | (node ? 2 : 0);
    }
  const core = new Float32Array(N), halo = new Float32Array(N);
  const line = (x0, y0, x1, y1, I) => {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(len / 0.5));
    for (let s = 0; s <= n; s++) {
      const px = x0 + ((x1 - x0) * s) / n, py = y0 + ((y1 - y0) * s) / n, cx = Math.floor(px), cy = Math.floor(py);
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const ddx = x + 0.5 - px, ddy = y + 0.5 - py, d2 = ddx * ddx + ddy * ddy, i = y * W + x;
          halo[i] = Math.max(halo[i], I * Math.exp(-d2 / 1.6));
          if (d2 < 0.45) core[i] = Math.max(core[i], I);
        }
    }
  };
  const CH = [[10, 38, 1.7, 0], [42, 70, 2.3, 0.9]];
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const base = mk(), glow = mk(), bctx = base.getContext('2d'), gctx = glow.getContext('2d');
  const bi = bctx.createImageData(W, H), gi = gctx.createImageData(W, H);

  function paint(t) {
    core.fill(0); halo.fill(0);
    let flash = 0;
    for (let c = 0; c < 2; c++) {
      const tt = t + CH[c][3], per = CH[c][2], n = Math.floor(tt / per), age = tt - n * per, seed = (n * 7 + c) | 0;
      if (hash(n, c + 5) < 0.22) continue;
      const head = Math.min(1, age / 0.16) * (H + 4), I = age < 0.16 ? 1 : Math.max(0, 1 - (age - 0.16) / 0.55);
      if (I <= 0) continue;
      if (age < 0.32) flash = Math.max(flash, 1 - age / 0.32);
      let x = CH[c][0] + hash(seed, 1) * (CH[c][1] - CH[c][0]), y = -2;
      const px = [x], py = [y];
      let m = 1;
      while (y < H + 2 && m < 40) {
        y += 5 + hash(seed, 10 + m) * 4;
        x = Math.max(4, Math.min(W - 5, x + (hash(seed, 30 + m) - 0.5) * 9 + ((CH[c][0] + CH[c][1]) / 2 - x) * 0.22));
        px.push(x); py.push(y); m++;
      }
      for (let i = 0; i + 1 < m; i++) {
        if (py[i] > head) break;
        const y1 = Math.min(py[i + 1], head), x1 = px[i] + ((px[i + 1] - px[i]) * (y1 - py[i])) / Math.max(0.001, py[i + 1] - py[i]);
        line(px[i], py[i], x1, y1, I);
      }
      for (let b = 0; b < 3; b++) {
        const at = 2 + Math.trunc(hash(seed, 50 + b) * Math.max(1, m - 6));
        if (at >= m) continue;
        let bx = px[at], by = py[at];
        const dir = hash(seed, 60 + b) < 0.5 ? -1 : 1, len = 3 + Math.trunc(hash(seed, 70 + b) * 3);
        for (let k = 0; k < len; k++) {
          const nx = Math.max(2, Math.min(W - 3, bx + dir * (2 + hash(seed, 80 + b * 10 + k) * 4))), ny = by + 4 + hash(seed, 90 + b * 10 + k) * 3;
          if (ny > head) break;
          line(bx, by, nx, ny, I * 0.6);
          bx = nx; by = ny;
        }
      }
    }
    for (let s = 0; s < 3; s++) {
      const per = 0.9 + s * 0.23, tt = t + s * 0.37, n = Math.floor(tt / per), age = tt - n * per;
      if (hash(n, 200 + s) > 0.45 || age > 0.15) continue;
      const sx = 6 + hash(n, 210 + s) * (W - 12), sy = H - 3 - hash(n, 220 + s) * 3, I = 1 - age / 0.15;
      line(sx - 2, sy, sx + 2, sy, I);
      line(sx, sy - 2, sx + 1, sy + 1, I);
    }
    const pulse = 0.25 + 0.75 * flash, c8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
    for (let y = 0; y < H; y++) {
      const k = y / (H - 1);
      for (let x = 0; x < W; x++) {
        const i = y * W + x, j = i * 4;
        let R = 14 + (5 - 14) * k, G = 22 + (7 - 22) * k, B = 52 + (16 - 52) * k;
        if (CIR[i] & 1) { R += 8; G += 18; B += 38; }
        if (CIR[i] & 2) { R += 16; G += 34; B += 72; }
        let gr = 0, gg = 0, gb = 0;
        if (EMB[i]) { R += 20; G += 45; B += 110; gr += 30 * pulse; gg += 90 * pulse; gb += 255 * pulse; }
        const e = Math.min(Math.min(x, W - 1 - x), Math.min(y, H - 1 - y)), edge = e === 0 ? 1 : e === 1 ? 0.45 : 0;
        R += 40 * edge; G += 110 * edge; B += 255 * edge;
        gr += 40 * edge; gg += 120 * edge; gb += 255 * edge;
        R *= 1 + flash * 0.5; G *= 1 + flash * 0.5; B *= 1 + flash * 0.6;
        R += 12 * flash; G += 30 * flash; B += 80 * flash;
        const c0 = core[i], h0 = halo[i];
        R += 30 * h0 + 170 * c0 * c0; G += 105 * h0 + 120 * c0 * c0; B += 255 * h0;
        gr += 30 * h0 + 210 * c0 * c0; gg += 120 * h0 + 200 * c0 * c0; gb += 255 * h0 + 255 * c0;
        bi.data[j] = c8(R); bi.data[j + 1] = c8(G); bi.data[j + 2] = c8(B); bi.data[j + 3] = 255;
        gi.data[j] = c8(gr); gi.data[j + 1] = c8(gg); gi.data[j + 2] = c8(gb); gi.data[j + 3] = 255;
      }
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
  /** 카드용 멈춘 그림: 왼쪽 번개가 다 내리친 순간. */
  function snapshot() {
    if (snap) return snap;
    let t = 0.2;
    for (let n = 1; n < 20; n++) if (hash(n, 5) >= 0.22) { t = n * 1.7 + 0.2; break; }
    const f = frame(t), c = mk(), x = c.getContext('2d');
    x.drawImage(f.base, 0, 0);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 0.5;
    x.drawImage(f.glow, 0, 0);
    snap = c.toDataURL('image/png');
    drawnAt = -1;
    return snap;
  }
  window.Thunder = { W, H, frame, snapshot };
})();
