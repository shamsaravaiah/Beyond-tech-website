/* Beyond Tech – interactive architecture diagram */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('bt-arch-svg');
  if (!svg) return;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SYSTEMS = [
    { name: 'SAP S/4HANA',   kind: 'ERP',  hint: 'Finance, supply chain and procurement data' },
    { name: 'Dynamics 365',  kind: 'ERP',  hint: 'Operations, sales and customer records' },
    { name: 'Salesforce',    kind: 'CRM',  hint: 'Pipeline, accounts and service cases' },
    { name: 'Workday',       kind: 'HCM',  hint: 'People, skills and workforce planning' },
    { name: 'ServiceNow',    kind: 'ITSM', hint: 'Tickets, requests and IT workflows' },
    { name: 'Data platform', kind: 'DATA', hint: 'Your warehouse or lakehouse, e.g. Snowflake or Fabric' },
  ];
  const OUTCOMES = [
    { name: 'Hours saved',      sub: 'per process' },
    { name: 'Lower cost',       sub: 'visible in the P&L' },
    { name: 'Faster decisions', sub: 'real-time insight' },
    { name: 'Risk controlled',  sub: 'full audit trail' },
  ];
  const MODES = {
    all:         { label: 'All flows',        sys: [0,1,2,3,4,5], out: [0,1,2,3], text: 'Data moves from the systems you already run, through governed AI agents, to results you can measure.' },
    finance:     { label: 'Finance close',    sys: [0,5],         out: [0,3],     text: 'Agents reconcile entries across ERP and data platform, flag exceptions for approval, and shorten the close.' },
    procurement: { label: 'Procurement',      sys: [0,1],         out: [1,3],     text: 'Agents match orders, invoices and contracts, so buyers only handle the exceptions that need judgement.' },
    service:     { label: 'Customer service', sys: [2,4],         out: [0,2],     text: 'Agents triage cases and draft resolutions from CRM and service history; people approve what goes out.' },
    workforce:   { label: 'Workforce',        sys: [3,5],         out: [2,0],     text: 'Agents combine people and business data to support planning decisions, with every step traceable.' },
  };

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const corner = (g, x, y, w, h) => {
    const L = 10, s = { stroke: '#888', 'stroke-width': 1.8, fill: 'none' };
    el('path', { ...s, d: `M${x} ${y + L}V${y}H${x + L}` }, g);
    el('path', { ...s, d: `M${x + w - L} ${y}H${x + w}V${y + L}` }, g);
    el('path', { ...s, d: `M${x} ${y + h - L}V${y + h}H${x + L}` }, g);
    el('path', { ...s, d: `M${x + w - L} ${y + h}H${x + w}V${y + h - L}` }, g);
  };

  const sysG = document.getElementById('systems');
  const sysEls = SYSTEMS.map((s, i) => {
    const y = 60 + i * 84;
    const g = el('g', { class: 'sys', tabindex: '0', role: 'button', 'aria-label': s.name + ': ' + s.hint }, sysG);
    el('rect', { class: 'frame', x: 40, y, width: 222, height: 56, rx: 6 }, g);
    corner(g, 40, y, 222, 56);
    el('circle', { class: 'led', cx: 62, cy: y + 28, r: 4 }, g);
    const t = el('text', { class: 'lbl', x: 78, y: y + 34, fill: '#f2f2f2' }, g); t.textContent = s.name;
    const k = el('text', { class: 'mono', x: 248, y: y + 33, 'text-anchor': 'end', fill: '#a8a8a8' }, g); k.textContent = s.kind;
    return g;
  });

  const outG = document.getElementById('outcomes');
  const outEls = OUTCOMES.map((o, i) => {
    const y = 60 + i * 130;
    const g = el('g', { class: 'out' }, outG);
    el('rect', { class: 'frame', x: 1000, y, width: 240, height: 96, rx: 8 }, g);
    corner(g, 1000, y, 240, 96);
    const t = el('text', { class: 'lbl', x: 1022, y: y + 36, fill: '#f2f2f2' }, g); t.textContent = o.name;
    const s2 = el('text', { class: 'sub', x: 1022, y: y + 58, fill: '#b0b0b0' }, g); s2.textContent = o.sub;
    el('rect', { class: 'meter-bg', x: 1022, y: y + 72, width: 196, height: 4, rx: 2 }, g);
    const m = el('rect', { class: 'meter', x: 1022, y: y + 72, width: 0, height: 4, rx: 2 }, g);
    return { g, meter: m, level: 0.18, _w: -1 };
  });

  const wiresIn = SYSTEMS.map((_, i) => document.getElementById('w-in-' + i));
  const wiresOut = OUTCOMES.map((_, i) => document.getElementById('w-out-' + i));
  const wCore = document.getElementById('w-core');
  const lenIn = wiresIn.map(p => p.getTotalLength());
  const lenOut = wiresOut.map(p => p.getTotalLength());
  const lenCore = wCore.getTotalLength();
  const agents = [0, 1, 2].map(i => document.getElementById('a-' + i));
  const caption = document.getElementById('bt-caption');
  const modeBtns = document.querySelectorAll('.bt-arch .bt-mode');

  let mode = MODES.all, hoverSys = null, spawnClock = 0;

  function applyHighlight() {
    const sysOn = hoverSys !== null ? [hoverSys] : mode.sys;
    const outOn = mode.out;
    const filtered = hoverSys !== null || mode !== MODES.all;
    sysEls.forEach((g, i) => {
      g.classList.toggle('dim', filtered && !sysOn.includes(i));
      g.classList.toggle('is-on', filtered && sysOn.includes(i));
    });
    wiresIn.forEach((p, i) => {
      p.classList.toggle('dim', filtered && !sysOn.includes(i));
      p.classList.toggle('hot', filtered && sysOn.includes(i));
    });
    outEls.forEach((o, i) => o.g.classList.toggle('dim', filtered && hoverSys === null && !outOn.includes(i)));
    wiresOut.forEach((p, i) => {
      p.classList.toggle('dim', filtered && hoverSys === null && !outOn.includes(i));
      p.classList.toggle('hot', filtered && hoverSys === null && outOn.includes(i));
    });
  }

  function setCaption(title, text) {
    caption.innerHTML = '';
    const b = document.createElement('b'); b.textContent = title;
    const s = document.createElement('span'); s.textContent = text;
    caption.append(b, s);
  }

  modeBtns.forEach(btn => btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    mode = MODES[btn.dataset.mode];
    hoverSys = null;
    setCaption(mode.label, mode.text);
    applyHighlight();
    spawnClock = 0;
  }));

  sysEls.forEach((g, i) => {
    const on = () => {
      hoverSys = i;
      setCaption(SYSTEMS[i].name, SYSTEMS[i].hint + ', connected without replacing anything.');
      applyHighlight();
      spawnClock = 0;
    };
    const off = () => {
      hoverSys = null;
      setCaption(mode.label, mode.text);
      applyHighlight();
    };
    g.addEventListener('mouseenter', on);
    g.addEventListener('mouseleave', off);
    g.addEventListener('focus', on);
    g.addEventListener('blur', off);
  });

  const pG = document.getElementById('particles');
  const particles = [];
  const SPEED = 180;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  // Soft agent glow without CSS class thrashing
  const agentLit = agents.map(() => 0);

  function spawn() {
    if (particles.length > 6) return;
    const sys = hoverSys !== null ? hoverSys : pick(mode.sys);
    const out = pick(mode.out);
    const g = el('g', {}, pG);
    const halo = el('circle', { r: 4.5, fill: 'url(#pGlow)', opacity: 0.5 }, g);
    const trail = [0, 1].map(k => el('circle', { r: 2 - k * 0.5, fill: '#e8e8e8', opacity: 0.45 - k * 0.15 }, g));
    const core = el('circle', { r: 2.2, fill: '#ffffff' }, g);
    particles.push({ g, halo, trail, core, sys, out, seg: 0, d: 0, wait: 0 });
  }

  function segPath(p) {
    if (p.seg === 0) return [wiresIn[p.sys], lenIn[p.sys]];
    if (p.seg === 1) return [wCore, lenCore];
    return [wiresOut[p.out], lenOut[p.out]];
  }

  let last = performance.now(), scanY = 0, meterTick = 0;
  const scan = document.getElementById('scanline');

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;

    scanY = (scanY + dt * 55) % 532;
    scan.setAttribute('y', (44 + scanY).toFixed(1));

    spawnClock -= dt;
    if (spawnClock <= 0) {
      spawn();
      spawnClock = mode === MODES.all && hoverSys === null ? 0.75 : 0.95;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.wait > 0) { p.wait -= dt; continue; }
      const [path, len] = segPath(p);
      if (!path || !len) { p.g.remove(); particles.splice(i, 1); continue; }
      p.d += SPEED * dt * (p.seg === 1 ? 0.7 : 1);
      if (p.d >= len) {
        // No box flash — only a brief pause at human approval, then continue
        if (p.seg === 1) { p.wait = 0.22; }
        if (p.seg === 2) {
          outEls[p.out].level = Math.min(1, outEls[p.out].level + 0.18);
          p.g.remove();
          particles.splice(i, 1);
          continue;
        }
        p.seg++; p.d = 0; continue;
      }
      const pt = path.getPointAtLength(p.d);
      const x = pt.x.toFixed(1), y = pt.y.toFixed(1);
      p.core.setAttribute('cx', x); p.core.setAttribute('cy', y);
      p.halo.setAttribute('cx', x); p.halo.setAttribute('cy', y);
      p.trail.forEach((c, k) => {
        const q = path.getPointAtLength(Math.max(0, p.d - (k + 1) * 9));
        c.setAttribute('cx', q.x.toFixed(1)); c.setAttribute('cy', q.y.toFixed(1));
      });
      if (p.seg === 1) {
        agents.forEach((a, ai) => {
          const ax = +a.getAttribute('cx'), ay = +a.getAttribute('cy');
          if (Math.hypot(ax - pt.x, ay - pt.y) < 14) agentLit[ai] = 1;
        });
      }
    }

    // Smooth agent node highlight (no class add/remove)
    agents.forEach((a, ai) => {
      agentLit[ai] = Math.max(0, agentLit[ai] - dt * 2.2);
      const t = agentLit[ai];
      a.setAttribute('fill', t > 0.05 ? '#3a3a3a' : '#1a1a1a');
      a.setAttribute('stroke', t > 0.05 ? '#ffffff' : '#888888');
    });

    // Throttle meter DOM writes — removes measurable-value flicker
    meterTick += dt;
    if (meterTick >= 0.05) {
      meterTick = 0;
      outEls.forEach(o => {
        o.level = Math.max(0.18, o.level - 0.05 * 0.028);
        const w = Math.round(196 * o.level);
        if (o._w !== w) {
          o._w = w;
          o.meter.setAttribute('width', String(w));
        }
      });
    }
  }

  applyHighlight();
  outEls.forEach(o => {
    o._w = Math.round(196 * o.level);
    o.meter.setAttribute('width', String(o._w));
  });
  if (reduce) {
    outEls.forEach(o => { o._w = 120; o.meter.setAttribute('width', '120'); });
  } else {
    let running = false;
    const loop = t => { if (!running) return; frame(t); requestAnimationFrame(loop); };
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
      if (!e.isIntersecting) running = false;
    }), { threshold: 0.1 }).observe(svg);
  }
})();
