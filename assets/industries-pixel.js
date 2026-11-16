/* =====================================================================
   Beyond Tech pixel art – animated dot-matrix illustrations
   Usage: <canvas class="bt-pixel-art" data-motif="manufacturing|financial|logistics|professional">
   Each canvas animates only while on screen; hovering speeds it up.
   ===================================================================== */
(() => {
  const DW = 1600, DH = 1000;      // design space
  const GAP = 14;                  // dot spacing in design units
  const COLS = Math.floor(DW / GAP), ROWS = Math.floor(DH / GAP);
  const MK = 0.25;                 // mask resolution (design → mask)
  const MW = DW * MK, MH = DH * MK;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);

  /* ---------- shape helpers (draw into the alpha mask, design units) ---------- */
  function gear(m, cx, cy, r, teeth, depth, hole, ang) {
    const n = teeth * 4;
    m.beginPath();
    for (let i = 0; i < n; i++) {
      const a = ang + TAU * i / n;
      const rr = r + ((i % 4 === 1 || i % 4 === 2) ? depth : 0);
      const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
      i ? m.lineTo(x, y) : m.moveTo(x, y);
    }
    m.closePath();
    m.moveTo(cx + hole, cy);
    m.arc(cx, cy, hole, 0, TAU, true);
    m.fill('evenodd');
  }
  function polyPoint(pts, t) {           // point at fraction t along a polyline
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]); L.push(l); tot += l; }
    let d = clamp(t) * tot;
    for (let i = 0; i < L.length; i++) {
      if (d <= L[i]) { const f = d / L[i]; return [pts[i][0] + (pts[i+1][0] - pts[i][0]) * f, pts[i][1] + (pts[i+1][1] - pts[i][1]) * f]; }
      d -= L[i];
    }
    return pts[pts.length - 1];
  }

  /* ---------- motifs ----------
     draw(m, t, s) paints white into the mask m (alpha = dot brightness).
     Returns glints: [[x, y, size, alpha], …] drawn as soft lights on top.
     s.intro is 0→1 after the art first comes into view.                     */
  const MOTIFS = {
    manufacturing: {
      glow: [980, 430],
      init() { return { smoke: [], spawn: 0 }; },
      draw(m, t, s, st, dt) {
        const a = t * 0.35;
        m.fillStyle = '#fff';
        m.globalAlpha = 1;
        gear(m, 980, 430, 230, 12, 46, 80, a);
        m.save(); m.globalCompositeOperation = 'destination-out';
        m.lineWidth = 26; m.beginPath(); m.arc(980, 430, 150, 0, TAU); m.stroke(); m.restore();
        gear(m, 1330, 700, 120, 9, 34, 42, -a * 12 / 9 + 0.2);
        gear(m, 700, 760, 90, 8, 28, 32, -a * 12 / 8 + 0.1);
        // factory
        const base = 930;
        m.globalAlpha = 0.85;
        for (let i = 0, x = 120; i < 6; i++, x += 116) {
          m.beginPath(); m.moveTo(x, base); m.lineTo(x, base - 90); m.lineTo(x + 110, base - 150); m.lineTo(x + 110, base); m.fill();
        }
        m.fillRect(120, base - 20, 700, 60);
        m.fillRect(300, base - 330, 50, 210);
        // windows blink along the roofline
        m.save(); m.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 6; i++) {
          if (Math.sin(t * 1.3 + i * 1.7) > 0.2) m.fillRect(150 + i * 116, base - 70, 40, 34);
        }
        m.restore();
        // smoke from the chimney
        st.spawn -= dt;
        if (st.spawn <= 0) { st.smoke.push({ x: 325, y: 590, r: 14, life: 0 }); st.spawn = 0.35 + Math.random() * 0.3; }
        for (const p of st.smoke) {
          p.life += dt * 0.28; p.y -= dt * 70; p.x += dt * 28; p.r += dt * 18;
          m.globalAlpha = 0.7 * (1 - p.life);
          m.beginPath(); m.arc(p.x, p.y, p.r, 0, TAU); m.fill();
        }
        st.smoke = st.smoke.filter(p => p.life < 1);
        m.globalAlpha = 1;
        const tw = 0.6 + 0.4 * Math.sin(t * 2);
        return [[980, 430, 1, tw], [1330, 700, 0.8, 1 - tw * 0.5], [700, 760, 0.6, 0.7]];
      }
    },

    financial: {
      glow: [1100, 420],
      init() { return {}; },
      draw(m, t, s) {
        const base = 860;
        const xs = [260, 420, 580, 740, 900, 1060, 1220];
        const hs = [170, 240, 210, 330, 300, 450, 560];
        m.fillStyle = '#fff';
        const tops = [];
        xs.forEach((x, i) => {
          const g = easeOut(clamp(s.intro * 1.6 - i * 0.09));
          const h = hs[i] * g * (1 + 0.035 * Math.sin(t * 1.6 + i * 0.9));
          m.globalAlpha = 0.6;
          m.fillRect(x, base - h, 96, h);
          tops.push([x + 48, base - h - 90]);
        });
        m.globalAlpha = 1;
        m.fillRect(200, base, 1200, 8);
        // trend line draws in after the bars, then a pulse rides it
        const lineT = easeOut(clamp(s.intro * 1.6 - 0.75));
        if (lineT > 0) {
          m.strokeStyle = '#fff'; m.lineWidth = 16; m.lineJoin = 'round'; m.lineCap = 'round';
          m.beginPath();
          const n = Math.max(1, Math.round(lineT * 60));
          for (let k = 0; k <= n; k++) { const p = polyPoint(tops, k / 60); k ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
          m.stroke();
          tops.forEach((p, i) => { if (i / (tops.length - 1) <= lineT + 0.001) { m.beginPath(); m.arc(p[0], p[1], 20, 0, TAU); m.fill(); } });
          if (lineT >= 1) {
            const [ex, ey] = tops[tops.length - 1];
            m.beginPath(); m.moveTo(ex + 30, ey - 40); m.lineTo(ex + 110, ey - 110); m.lineTo(ex + 60, ey + 10); m.fill();
          }
        }
        const glints = [];
        if (lineT >= 1) {
          const pt = polyPoint(tops, (t * 0.22) % 1);
          m.beginPath(); m.arc(pt[0], pt[1], 34, 0, TAU); m.fill();
          glints.push([pt[0], pt[1], 1.1, 1]);
          const last = tops[tops.length - 1];
          glints.push([last[0], last[1], 0.8, 0.6 + 0.4 * Math.sin(t * 3)]);
        }
        return glints;
      }
    },

    logistics: {
      glow: [1100, 640],
      init() {
        const pts = [];
        for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push([140 + t * 660, 760 - Math.sin(t * Math.PI) * 420 - t * 60]); }
        return { pts };
      },
      draw(m, t, s, st) {
        const pts = st.pts;
        m.fillStyle = '#fff'; m.strokeStyle = '#fff';
        // marching route
        m.lineWidth = 12; m.lineCap = 'butt';
        m.setLineDash([26, 26]); m.lineDashOffset = -t * 70;
        m.beginPath(); pts.forEach((p, i) => i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1])); m.stroke();
        m.setLineDash([]);
        // nodes
        [pts[0], pts[20], pts[40]].forEach(p => {
          m.beginPath(); m.arc(p[0], p[1], 26, 0, TAU); m.moveTo(p[0] + 10, p[1]); m.arc(p[0], p[1], 10, 0, TAU, true); m.fill('evenodd');
        });
        // packet travelling the route; containers light up when it arrives
        const cyc = (t * 0.3) % 1;
        const pk = polyPoint(pts, cyc);
        m.beginPath(); m.arc(pk[0], pk[1], 30, 0, TAU); m.fill();
        const arrive = cyc > 0.9 ? (cyc - 0.9) / 0.1 : (cyc < 0.25 ? 1 - cyc / 0.25 : 0);
        // container stack with a scanning light
        const cw = 330, ch = 150, bx = 820, by = 880;
        const scan = 820 + ((t * 260) % 1300) - 150;
        const rows = [3, 2, 1];
        rows.forEach((cols, row) => {
          for (let c = 0; c < cols; c++) {
            const x = bx + c * (cw + 16) + row * (cw + 16) / 2, y = by - (row + 1) * (ch + 14);
            const near = clamp(1 - Math.abs(x + cw / 2 - scan) / 260);
            const first = (row === 0 && c === 0) ? arrive : 0;
            m.globalAlpha = clamp(((row + c) % 2 ? 0.55 : 0.8) + near * 0.25 + first * 0.4);
            m.fillRect(x, y, cw, ch);
            m.save(); m.globalCompositeOperation = 'destination-out'; m.globalAlpha = 1;
            for (let rx = x + 22; rx < x + cw - 10; rx += 30) m.fillRect(rx, y + 14, 8, ch - 28);
            m.restore();
          }
        });
        m.globalAlpha = 1;
        return [[pk[0], pk[1], 1, 1], [pts[0][0], pts[0][1], 0.7, 0.6], [pts[40][0], pts[40][1], 0.8, 0.5 + arrive * 0.5]];
      }
    },

    professional: {
      glow: [800, 560],
      init() { return {}; },
      draw(m, t, s) {
        const P = [[800, 420, 1.25], [460, 600, 1.0], [1140, 600, 1.0], [620, 820, 0.8], [980, 820, 0.8]];
        const links = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [0, 3], [0, 4]];
        m.fillStyle = '#fff'; m.strokeStyle = '#fff';
        m.globalAlpha = 0.45; m.lineWidth = 10;
        links.forEach(([a, b]) => { m.beginPath(); m.moveTo(P[a][0], P[a][1]); m.lineTo(P[b][0], P[b][1]); m.stroke(); });
        m.globalAlpha = 1;
        // clear halos, then draw people with rotating dotted rings
        P.forEach(([x, y, sc], i) => {
          const r = 140 * sc;
          m.save(); m.globalCompositeOperation = 'destination-out';
          m.beginPath(); m.arc(x, y, r + 4, 0, TAU); m.fill(); m.restore();
          const hr = 40 * sc;
          m.beginPath(); m.arc(x, y - 50 * sc, hr, 0, TAU); m.fill();
          m.beginPath(); m.moveTo(x - 80 * sc, y + 90 * sc); m.arc(x, y + 90 * sc, 80 * sc, Math.PI, 0); m.fill();
          m.lineWidth = 10 * sc;
          m.setLineDash([22 * sc, 12 * sc]); m.lineDashOffset = (i % 2 ? 1 : -1) * t * 30;
          m.beginPath(); m.arc(x, y, r, 0, TAU); m.stroke();
          m.setLineDash([]);
        });
        // signals passing between people
        const glints = [];
        links.forEach(([a, b], k) => {
          const ph = (t * 0.4 + k * 0.29) % 1;
          const dir = k % 2 ? [P[b], P[a]] : [P[a], P[b]];
          // skip the part of the link hidden inside the rings
          const f = 0.18 + ph * 0.64;
          const x = dir[0][0] + (dir[1][0] - dir[0][0]) * f, y = dir[0][1] + (dir[1][1] - dir[0][1]) * f;
          m.beginPath(); m.arc(x, y, 18, 0, TAU); m.fill();
          glints.push([x, y, 0.7, Math.sin(ph * Math.PI)]);
        });
        return glints;
      }
    }
  };

  /* ---------- renderer ---------- */
  class PixelArt {
    constructor(canvas) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.motif = MOTIFS[canvas.dataset.motif] || MOTIFS.manufacturing;
      this.st = this.motif.init();
      this.mask = document.createElement('canvas'); this.mask.width = MW; this.mask.height = MH;
      this.m = this.mask.getContext('2d', { willReadFrequently: true });
      this.bg = document.createElement('canvas');
      this.t = 0; this.speed = 1; this.target = 1; this.intro = reduce ? 1 : 0; this.seen = false; this.visible = false;
      this.phase = new Float32Array(COLS * ROWS).map(() => Math.random() * TAU);
      this.streaks = Array.from({ length: 34 }, () => ({ x: Math.random() * DW, y: Math.random() * DH, l: 30 + Math.random() * 190, v: 20 + Math.random() * 60, a: 0.05 + Math.random() * 0.2 }));
      canvas.addEventListener('mouseenter', () => this.target = 3.2);
      canvas.addEventListener('mouseleave', () => this.target = 1);
      const card = canvas.closest('.service-card, .bt-card');
      if (card) { card.addEventListener('mouseenter', () => this.target = 3.2); card.addEventListener('mouseleave', () => this.target = 1); }
      new ResizeObserver(() => this.resize()).observe(canvas);
      this.resize();
    }
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.W = this.c.clientWidth; this.H = this.c.clientHeight;
      if (!this.W) return;
      this.c.width = Math.round(this.W * dpr); this.c.height = Math.round(this.H * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.sx = this.W / DW; this.sy = this.H / DH;
      // static background: tint glow, faint dot field, vignette
      const b = this.bg; b.width = this.c.width; b.height = this.c.height;
      const g = b.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = '#000'; g.fillRect(0, 0, this.W, this.H);
      const [gx, gy] = this.motif.glow;
      const rg = g.createRadialGradient(gx * this.sx, gy * this.sy, 0, gx * this.sx, gy * this.sy, this.W * 0.55);
      rg.addColorStop(0, 'rgba(255,255,255,0.14)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, this.W, this.H);
      const fr = Math.max(0.5, 1.5 * this.sx);
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        g.fillStyle = 'rgba(255,255,255,' + (Math.random() < 0.85 ? 0.08 : 0.16) + ')';
        g.beginPath(); g.arc((c + 0.5) * GAP * this.sx, (r + 0.5) * GAP * this.sy, fr, 0, TAU); g.fill();
      }
      const vg = g.createRadialGradient(this.W / 2, this.H / 2, this.W * 0.3, this.W / 2, this.H / 2, this.W * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.75)');
      g.fillStyle = vg; g.fillRect(0, 0, this.W, this.H);
      // colour gradient for motif dots: deep blue → sky → white
      this.grad = this.ctx.createLinearGradient(0, 0, this.W, 0);
      this.grad.addColorStop(0, '#6a6a6a'); this.grad.addColorStop(0.45, '#c8c8c8'); this.grad.addColorStop(1, '#ffffff');
      this.frame(0);
    }
    frame(dt) {
      if (!this.W) return;
      this.speed += (this.target - this.speed) * Math.min(1, dt * 4);
      this.t += dt * this.speed;
      if (this.seen && !reduce) this.intro = Math.min(1, this.intro + dt * 0.5);

      // 1. paint the motif into the alpha mask
      const m = this.m;
      m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, MW, MH);
      m.setTransform(MK, 0, 0, MK, 0, 0);
      m.globalAlpha = 1; m.globalCompositeOperation = 'source-over';
      const glints = this.motif.draw(m, this.t, { intro: this.intro }, this.st, dt * this.speed) || [];
      const data = m.getImageData(0, 0, MW, MH).data;

      // 2. compose
      const ctx = this.ctx, sx = this.sx, sy = this.sy;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.bg, 0, 0, this.W, this.H);

      // speed streaks (faster on hover)
      ctx.lineCap = 'round';
      for (const s of this.streaks) {
        s.x += s.v * dt * this.speed * this.speed;
        if (s.x - s.l > DW) { s.x = -20; s.y = Math.random() * DH; }
        const len = s.l * (0.6 + 0.4 * this.speed);
        const lg = ctx.createLinearGradient((s.x - len) * sx, 0, s.x * sx, 0);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,' + s.a + ')');
        ctx.strokeStyle = lg; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo((s.x - len) * sx, s.y * sy); ctx.lineTo(s.x * sx, s.y * sy); ctx.stroke();
      }

      // 3. dots, bucketed by brightness so each bucket is a single fill
      const B = 10, paths = Array.from({ length: B }, () => new Path2D());
      const reveal = reduce ? 2 : this.intro * 1.4;
      const tw = this.t * 2.2;
      const rBase = Math.max(1.2, 3.6 * sx), rEdge = Math.max(0.6, 1.4 * sx);
      for (let r = 0; r < ROWS; r++) {
        const y = (r + 0.5) * GAP;
        const my = Math.min(MH - 1, Math.round(y * MK));
        for (let c = 0; c < COLS; c++) {
          const x = (c + 0.5) * GAP;
          const v = data[(my * MW + Math.min(MW - 1, Math.round(x * MK))) * 4 + 3] / 255;
          if (v < 0.1) continue;
          const appear = clamp((reveal - x / DW) * 5);
          if (appear <= 0) continue;
          const k = r * COLS + c;
          let a = (0.5 + 0.5 * v) * appear;
          if (!reduce) a *= 0.82 + 0.18 * Math.sin(tw + this.phase[k]);
          const bi = Math.min(B - 1, Math.floor(a * B));
          const rad = rBase + rEdge * (v > 0.9 ? 0.35 : 0);
          const p = paths[bi];
          p.moveTo(x * sx + rad, y * sy);
          p.arc(x * sx, y * sy, rad, 0, TAU);
        }
      }
      ctx.fillStyle = this.grad;
      for (let i = 0; i < B; i++) { ctx.globalAlpha = (i + 1) / B; ctx.fill(paths[i]); }
      ctx.globalAlpha = 1;

      // 4. glints
      ctx.globalCompositeOperation = 'lighter';
      for (const [gx, gy, size, a] of glints) {
        if (a <= 0.01 || gx / DW > reveal) continue;
        const R = 46 * size * sx;
        const rg = ctx.createRadialGradient(gx * sx, gy * sy, 0, gx * sx, gy * sy, R);
        rg.addColorStop(0, 'rgba(255,255,255,' + (0.95 * a) + ')');
        rg.addColorStop(0.25, 'rgba(220,220,220,' + (0.35 * a) + ')');
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(gx * sx, gy * sy, R, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  /* ---------- run only what's on screen ---------- */
  const arts = [...document.querySelectorAll('canvas.bt-pixel-art')].map(c => new PixelArt(c));
  const io = new IntersectionObserver(es => es.forEach(e => {
    const a = arts.find(x => x.c === e.target);
    a.visible = e.isIntersecting;
    if (e.isIntersecting) a.seen = true;
  }), { threshold: 0.2 });
  arts.forEach(a => io.observe(a.c));

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    for (const a of arts) if (a.visible && !reduce) a.frame(dt);
    requestAnimationFrame(loop);
  }
  if (reduce) arts.forEach(a => { a.seen = true; a.frame(0); });
  requestAnimationFrame(loop);
})();