/* Beyond Tech locations map */
(() => {
  const map = document.getElementById('bt-map');
  if (!map) return;
  const canvas = map.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const markerColor = '#ffffff';
  const dotRGB = '255, 255, 255';
  const dotAlpha = 0.28;

  const OFFICES = [
    { num: '01', name: 'Sweden', iso: 752, lat: 59.33, lon: 18.07, label: 'left' },
    { num: '02', name: 'United Arab Emirates', iso: 784, lat: 25.20, lon: 55.27, label: 'right' },
    { num: '03', name: 'Saudi Arabia', iso: 682, lat: 24.71, lon: 46.68, label: 'left' },
  ];

  function boot() {
    const GRID = {"STEP":1.6,"LAT0":82,"LON0":-180,"cols":225,"rows":89,"rle":"35,2,1,f,2,20,43,1,69,5,1,8,5,1d,12,5,1,4,2a,4,5c,2,5,1,1,1,7,5,3,21,15,3,2,1,86,3,1,1,2,2,4,2,2,3,2,2,1,2,6,1e,35,3,13,9,54,2,8,2,1,7,e,18,2f,3,11,f,11,1,5,1,36,4,1,1,5,1,2,2,1,3,2,1,1,6,d,14,30,2,f,18,3,3,43,2,1,9,3,2,1,1,2,a,c,14,2f,2,8,26,2,1,4,6,1e,c,8,2,6,a,3,3,4,b,8,14,1b,6,18,3,1,35,7,1,5,1,7,21,4,2,4,1,1,4,2,3,4,4,9,10,1c,e,3,1,4,1,1,8,1,4a,6,32,6,7,5,c,1e,11,2,1,1,f,2,42,2,3,3,32,1,1,4,6,2,1,7,7,c,5,10,6,2,6,4,57,5,1,6,2c,2,2,1,1,6,4,8,7,d,1,11,7,1,62,a,2d,8,1,1,3,e,5,1e,7,3,58,1,7,c,8,1,2,1,20,b,5,f,1,1f,8,2,3,1,4f,5,5,11,6,9,1c,9,7,1,2,2b,2,1,4,4,4a,b,2,18,2,1,1,c,1b,9,9,23,2,7,1,1,3,3,1,1,47,b,4,16,1,12,1d,5,b,22,2,7,2,6,48,c,4,28,1,1,1e,2,e,1e,2,2,1,6,3,1,4c,1,1,a,3,2c,1e,1,f,1d,1,2,4,1,57,8,1,2f,2b,21,5b,1,1,39,24,3,1,2,3,20,59,1,2,39,25,4,2,1,1,1f,58,2,1,3a,26,1,1,25,13,2,1,2,7,3,35,3d,23,1,2,27,8,2,8,6,6,2,35,4,1,3a,21,27,7,5,2,3,6,8,4,3,32,5,2,3a,20,28,7,7,2,2,6,1,4,2,5,2,1,1,2f,6,1,3b,1f,29,5,6,1,3,1,2,2,2,e,3,29,1,1,2,1,8,1,3c,1d,2a,5,8,3,3,2,1,e,3,28,5,2,6,2,3c,1d,30,6,c,1,1,1,1,35,3,2,5,2,3e,1c,2b,b,10,34,5,1,2,5,40,18,2c,d,e,36,5,3,45,16,2c,10,3,3,6,37,5,1,46,1,1,f,2,3,2d,52,4d,1,1,9,9,1,2b,26,1,2d,4d,2,1,8,9,1,1,1,28,1e,1,9,2,1,1,28,4f,1,2,7,33,1f,2,9,2,1,2,2,2,21,1,1,4f,1,2,5,33,21,2,c,6,1f,55,5,b,2,26,22,1,d,6,d,1,d,58,6,4,2,6,2,24,22,1,c,9,9,3,9,2,1,5a,6,2,3,9,3,20,22,2,a,a,7,6,8,1,1,5d,8,2d,23,2,8,b,6,8,7,9,1,5a,6,2a,23,2,6,e,4,b,6,7,1,5c,5,2a,29,10,4,b,7,7,2,5d,2,2a,26,13,4,b,1,1,5,9,1,5d,1,5,5,21,25,2,2,10,2,c,1,2,3,9,2,5e,1,1,2,1,a,1d,28,10,3,b,1,3,1,6e,c,1d,27,12,2,19,3,61,d,1d,7,2,1c,20,2,8,1,4,1,62,10,1b,1,8,1,1,18,1e,2,1,2,7,3,66,11,26,17,1f,2,1,1,5,4,66,12,25,16,22,3,4,6,3,1,1,1,5e,14,24,15,24,2,4,5,1,1,4,1,5e,17,21,14,26,2,3,4,2,1,7,1,2,1,58,1a,1f,12,27,3,5,1,2,2,2,1,3,7,55,1c,1e,11,29,1,8,1,a,6,3,1,4f,1d,1d,11,29,3,1,1,10,5,6,1,4d,1c,1e,10,2f,1,1,1,d,2,2,1,54,1a,1f,10,32,1,11,1,53,19,20,11,39,1,5,1,58,17,20,12,5,1,32,4,3,1,58,17,20,12,4,2,2f,6,4,2,59,15,20,11,3,4,2e,9,2,2,5a,14,20,10,4,3,2e,f,13,1,46,13,21,d,6,3,2d,11,59,12,22,d,6,3,2a,15,58,11,23,e,5,2,2a,17,56,f,27,c,6,2,29,19,55,e,28,b,32,19,55,e,28,b,33,18,55,e,29,9,34,18,55,d,2b,7,36,17,55,c,2c,6,37,6,5,c,55,b,2d,2,3a,3,a,1,1,8,55,a,7a,7,f,1,46,a,7b,6,56,8,93,2,43,8,94,1,44,6,83,2,f,1,47,5,92,3,46,5,92,2,48,5,db,6,db,5,dc,4,6,1,d7,2,1,1,df,4,33c","cc":"7c*11,130*20,283,7c*d,130*1d,242*9,283*4,7c*9,130*21,242*4,7c*f,130*1e,283*c,7c*b,130*18,283*14,7c*12,130*14,283*1d,7c*18,130*14,283*2f,348*c,7c*1a,130*14,242*4,f6,242,283*3a,348*10,7c*1f,130*10,242,2f0*3,f6*3,283*5b,348*d,7c*2c,130*c,242,2f0*5,f6*4,283*5c,348*10,7c*2a,130*7,160*5,242,2f0*5,f6*3,283*5a,348*d,7c*27,130*7,160,242*2,2f0*5,f6*5,283*5d,348*f,7c*22,130*5,242*4,2f0*3,f6*6,283*59,348*d,7c*22,130,242*4,2f0*4,f6*3,283*54,348*9,7c*22,242*2,2f0*4,e9*3,283*49,348*4,7c*23,33a*2,d0,2f0*3,1ac*3,283*49,348*2,7c*27,33a*2,d0*2,1b8*3,70*3,283*46,7c*2d,174,33a*2,114*3,268*5,1b8,70*4,283*13,18e*7,283*2,18e,283*29,7c*2d,174,33a*4,210*2,114*5,268*5,70*5,283*13,18e*b,283*1a,9c*3,283*c,7c*2b,33a*4,fa,38*2,114*5,cb,268*5,324*8,283*8,18e*4,283,18e,283,18e*f,283*9,1f0*2,283*b,9c*5,283*9,7c*28,fa*6,114*4,cb*3,2bf*2,268,324*a,283*5,18e*19,1f0*e,283,1f0*3,9c*9,283*8,348*17,7c*11,fa*6,2f4,114*3,28*2,15c*3,282*4,1f2,324*5,283*7,18e*17,9c*3,1f0*12,9c*a,283*3,348*19,7c*9,348,7c*4,fa*5,2f4,17c*3,2c1,bf,15c,2b0,282*5,324,283*8,18e*12,9c*5,1f0*10,9c*b,283*3,348*1a,7c*4,348*5,7c*2,fa*5,17c*3,bf,46,2b0*3,282*3,283*6,18e*3,35c*4,18e*c,9c*9,1f0*a,9c*c,283*3,188,348*1a,7c*2,348*5,2d4*5,fa*2,17c*2,1f3,0,2b0,64*3,10c*2,283*2,18e*2,35c*7,18e*3,1a1*5,18e,9c*a,1f0*8,9c*d,283,188*2,348*20,26c,2d4*6,17c*2,327*2,12c*2,318*8,33,10c,1f,31b*5,35c*3,18e*2,35c*2,1a1*3,9c*1e,198*3,188,348*1f,26c,2d4*4,17c*2,12c*2,318*b,16c,1f*2,31b*6,35c*3,2fa,1a1*3,9c*1d,198,188,348*1d,26c,2d4*4,17c*3,12c*2,318*b,16c*3,31b*8,35c,2fa,4,2fa*2,9c*1b,198,19a,188*2,348*1d,c*5,314,318*2,2f8*3,170*3,16c*a,31b*2,4*4,24a*3,9c*1c,19a*2,188*2,348*1c,1f8*3,c*7,314,2f8*3,170*3,16c*a,4*6,24a*4,164,9c*19,19a,188*5,348*18,1f8*5,c*5,314*3,1a6,2f8*2,170*4,16c*9,4*6,24a*3,164*3,9c*1a,188*3,1e4*3,348*2,1e4,348*10,1f8*4,c*8,314,1b2*6,113,190,2aa*2,170*4,16c*9,4*4,24a*4,164*3,9c*1b,188,1e4*6,348*d,1f8*2,c*9,1b2*a,332*6,190*2,2aa*4,170*3,16c*8,4*3,24a*4,164*5,20c,9c*19,1e4*8,348*3,1f8*2,c*c,1b2*9,332*6,2aa*9,16c*8,24a*6,164*5,20c*3,9c*5,164*2,9c*10,1e4*8,348*3,2c,1f8,2dc*2,1de,c*b,1b2*9,332*6,2aa*9,16c*5,24a*4,164*a,20c*2,40,164*3,68*2,9c*e,1e4*8,1f8*2,1de*4,c*a,1b2*9,332*6,2aa*8,27a,310,16c,24a*4,164*b,32,164*3,68*2,9c*d,9e,1e4*6,1f8*2,2dc,1de*4,1d2*2,c*9,1b2*8,332*7,2aa*8,310*2,200*2,164*d,32*2,164,68*3,9c*c,1e4*5,c0*2,1f8,2dc,1de*5,1d2*3,c*6,232*4,94*2,1b2*4,332*8,2aa*a,200*3,164*c,32,68*5,9c,1a2,2c0*2,9c*4,1e4*8,c0*2,1de*7,1d2*5,c*3,232*5,94*4,1b2*2,2d9*8,2aa*a,200*2,164*9,68*5,1a2*3,2c0,9c,1e4*9,14c,d6*2,1de*7,1d2*6,232*7,94*5,2d9*9,2aa*6,377,200*3,164*7,68*3,2fc*2,1a2*2,2c0,9c,1e4*6,140*2,1de*7,1d2*6,232*7,94*5,2d9*9,e8,377*7,200,164*6,68*2,2fc*4,1a2,260,1e4,140*2,154*3,2ae*2,1de*5,1d2*6,232*6,94*6,2d9*8,e8*2,377*6,164*4,2fc*4,1a2*2,260,140,de,154*2,22e,2ae*3,1d2*6,356*2,232*8,94*6,2d9*8,e7*3,e8,377*4,164*4,2fc*3,74*3,2c0,260*2,22e*2,270*2,144,1d2*5,356*4,232,236*6,78,94*5,2d9*8,e7*4,106,164*4,68,2fc,74*3,2c0,260,bc,aa*2,35e*3,144*4,1d2*2,356*2,120,300,cc*2,236*6,78,94*4,8c,2d9*7,e7*5,0*2,2c2,164*2,2fc,74,2c0*2,260*2,bc,24f*2,aa*2,35e*8,2b6*2,144,180*4,120*2,cc,236*7,94*4,8c*2,2d9,2d8*6,e7*6,0*3,2c2,164*2,90,2fc,2c0,aa*3,35e*8,148,2b6,1ae,180*4,120*2,300,236*6,78*2,94,8c*5,2d8*6,e7*8,2c2*2,90*2,260*3,aa*6,35e*4,148*3,1ae*2,180*3,120*2,236*3,78*4,8c*7,2d8*5,e7*7,2c2*2,1ca*3,260,aa*6,35e*4,4c,148,2e4*2,fa*2,1ae,236,78*4,8c*2,b4,8c*2,b4*4,2d8*3,194*2,e7*3,2c2*3,168*2,1ca*2,60,1ca*2,aa*6,35e*2,4c*3,148*2,2e4*2,fa,4c,78*3,8c,b2,b4*8,320*2,194*4,2c2*4,168*2,1ca*3,168*2,aa*6,4c*2,35e,4c*9,e2*2,10a,b2*3,b4*7,320*3,194*4,2c2*2,168*3,1ca*2,168*6,da*3,25c,aa*3,4c*d,10a*3,b2*3,b4*7,320*3,194*4,2c2,168*9,da*3,25c*2,aa*2,4c*10,10a*3,b2*2,b4*8,286,342*3,194*3,168*9,da*2,25c*4,aa,4c*13,10a,b2*2,b4*9,6c,342*4,194,168*d,256,25c*5,4c*17,b4*b,342*6,168*5,256*4,25c*5,4c*18,18*3,b4*8,342*6,168*6,256*3,5a,25c*4,4c*18,18*5,b4*5,37e,342*5,168*3,256*2,25c*3,4c*4,44,4c*12,18*5,b4*4,37e*3,1c6,342*3,168,256,25c*5,44*3,4c*11,18*6,37e*2,b4,37e*3,1c6,1fc*4,24*2,25c*4,44*5,4c*e,18*6,37e*7,1c6,1fc*4,1c2,24*5,25c*4,44*6,4c*d,18*6,37e*5,1fc*3,1c6,1fc*3,1c2*2,24*8,25c*2,44*7,4c*c,18*6,37e*4,2cc*3,1fc,1c6,1fc*2,1c2*4,24*b,25c,44*8,4c*b,204*8,2cc*5,1fc*3,1c2*3,24*f,f2,98,44*4,258*2,4c*c,204*5,48*3,2cc*4,1fc,1c2*3,24*11,98,44*4,258*2,4c*b,204*5,48*4,2cc*3,1fc,1c2*3,24*15,98*2,20*3,258*4,4c*8,204*4,48*5,2c6*2,1fc*3,1c2*2,24*17,98*2,20*5,258*4,4c*4,204*3,48*4,2c6*3,1fc*2,1c2*2,24*19,98*2,20*6,258*2,20,4c*3,204*3,48*2,2c6*5,1fc,24*19,98,20*9,4c*4,204*3,2c6*8,24*18,98,20*8,4c*5,2c6*7,1aa,2c6,24*18,98,20*7,35a,4c*4,2c6*7,24*17,98,20*7,35a*3,4c,2c6*6,24*12,98,20*7,35a*3,2c6*2,24*c,98*2,20*8,24*7,22a,98,20*9,24*6,98,20*7,22a*2,98*2,20*6,22a,98*2,20*4,24*2,22a,98,20*4,22a*3,98*2,20*3,22a*2,98*2,20*3,98*2,20*4,98*2,20*3,98*2,20*2,ee,98*5,20*2"};
    const { cols, rows, STEP, LAT0, LON0 } = GRID;
    map.style.setProperty('--ratio', cols + ' / ' + rows);

    const land = [];
    {
      let bit = 0, i = 0;
      for (const r of GRID.rle.split(',')) {
        const n = parseInt(r, 16);
        if (bit) for (let k = 0; k < n; k++) land.push(i + k);
        i += n; bit ^= 1;
      }
    }
    const codes = [];
    for (const part of GRID.cc.split(',')) {
      const [id, n] = part.split('*');
      const v = parseInt(id, 16), count = n ? parseInt(n, 16) : 1;
      for (let k = 0; k < count; k++) codes.push(v);
    }
    const byIso = new Map(OFFICES.map((o) => [o.iso, o]));
    const dots = land.map((idx, i) => ({
      c: idx % cols,
      r: Math.floor(idx / cols),
      tw: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.6,
      office: byIso.get(codes[i]) || null,
    }));

    const toGrid = (lat, lon) => ({ gx: (lon - LON0) / STEP, gy: (LAT0 - lat) / STEP + 0.5 });

    OFFICES.forEach((o, i) => {
      const { gx, gy } = toGrid(o.lat, o.lon);
      o.gx = gx; o.gy = gy; o.hover = 0;
      const b = document.createElement('button');
      b.className = 'bt-pin';
      b.type = 'button';
      b.style.left = (gx / cols * 100) + '%';
      b.style.top = (gy / rows * 100) + '%';
      b.style.setProperty('--delay', (0.5 + i * 0.35) + 's');
      b.classList.add('bt-pin--' + (o.label || 'top'));
      b.setAttribute('aria-label', o.num + ' ' + o.name);
      b.innerHTML =
        '<i class="bt-pin__ring"></i><i class="bt-pin__ring"></i><i class="bt-pin__core"></i>' +
        '<span class="bt-pin__label"><b></b><strong></strong></span>';
      b.querySelector('b').textContent = o.num;
      b.querySelector('strong').textContent = o.name;
      const on = () => { o.target = 1; };
      const off = () => { o.target = 0; };
      b.addEventListener('mouseenter', on);
      b.addEventListener('mouseleave', off);
      b.addEventListener('focus', on);
      b.addEventListener('blur', off);
      o.target = 0;
      map.appendChild(b);
    });

    let W = 0, H = 0, cw = 0, ch = 0;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cw = W / cols; ch = H / rows;
    }
    new ResizeObserver(resize).observe(canvas);
    resize();

    let revealStart = null;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && revealStart === null) {
          revealStart = performance.now();
          map.classList.add('is-visible');
        }
      });
    }, { threshold: 0.25 });
    io.observe(map);

    const hub = OFFICES[0];

    function arcPoint(a, b, t, lift) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      const cx = mx + (dy / len) * len * lift, cy = my - Math.abs(dx / len) * len * lift;
      const u = 1 - t;
      return {
        x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
        y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
      };
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const time = now / 1000;
      ctx.clearRect(0, 0, W, H);

      const rv = revealStart === null ? 0 : (reduce ? 1e9 : (now - revealStart) / 1000);
      const front = rv * 90;
      const rad = Math.max(0.7, Math.min(cw, ch) * 0.3);

      OFFICES.forEach((o) => { o.hover += (o.target - o.hover) * Math.min(1, dt * 8); });

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dist = Math.hypot(d.c + 0.5 - hub.gx, d.r + 0.5 - hub.gy);
        const appear = Math.max(0, Math.min(1, (front - dist) / 8));
        if (appear <= 0) continue;
        let a = dotAlpha;
        if (!reduce) a *= 0.75 + 0.25 * Math.sin(time * d.sp + d.tw);
        let near = 0;
        for (const o of OFFICES) {
          const od = Math.hypot(d.c + 0.5 - o.gx, d.r + 0.5 - o.gy);
          const reach = 5 + o.hover * 5;
          if (od < reach) near = Math.max(near, (1 - od / reach) * (0.5 + 0.5 * o.hover));
        }
        const edge = Math.max(0, 1 - Math.abs(front - dist) / 4) * (rv < 3 ? 1 : 0);
        if (d.office) {
          const o = d.office;
          let ha = 0.55 + 0.45 * o.hover;
          if (!reduce) ha *= 0.85 + 0.15 * Math.sin(time * 2 * d.sp + d.tw);
          ctx.fillStyle = markerColor;
          ctx.globalAlpha = Math.min(1, ha) * appear;
          ctx.beginPath();
          ctx.arc((d.c + 0.5) * cw, (d.r + 0.5) * ch, rad * (1.15 + 0.2 * o.hover), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }
        a = Math.min(1, a + near * 0.45 + edge * 0.5) * appear;
        ctx.fillStyle = 'rgba(' + dotRGB + ',' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc((d.c + 0.5) * cw, (d.r + 0.5) * ch, rad * (1 + near * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      const arcT = reduce ? 1 : Math.max(0, Math.min(1, (rv - 1.0) / 1.2));
      if (arcT > 0) {
        const A = { x: hub.gx * cw, y: hub.gy * ch };
        OFFICES.slice(1).forEach((o, k) => {
          const B = { x: o.gx * cw, y: o.gy * ch };
          const lift = 0.28;
          const ease = 1 - Math.pow(1 - arcT, 3);
          const N = 64;
          ctx.lineWidth = Math.max(1, W / 900);
          ctx.lineCap = 'round';
          const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
          grad.addColorStop(0, 'rgba(255,255,255,0.12)');
          grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
          grad.addColorStop(1, 'rgba(255,255,255,0.12)');
          ctx.strokeStyle = grad;
          ctx.beginPath();
          for (let s = 0; s <= N * ease; s++) {
            const p = arcPoint(A, B, s / N, lift);
            s ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
          }
          ctx.stroke();
          if (!reduce && arcT >= 1) {
            const t = ((time * 0.35) + k * 0.37) % 1;
            for (let j = 0; j < 14; j++) {
              const tt = t - j * 0.012;
              if (tt < 0) continue;
              const p = arcPoint(A, B, tt, lift);
              ctx.fillStyle = j === 0 ? markerColor : 'rgba(255,255,255,' + (0.5 * (1 - j / 14)).toFixed(3) + ')';
              ctx.globalAlpha = 1 - j / 14;
              ctx.beginPath();
              ctx.arc(p.x, p.y, rad * (j === 0 ? 1.4 : 1.0) * (1 - j / 20), 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
        });
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  boot();
})();
