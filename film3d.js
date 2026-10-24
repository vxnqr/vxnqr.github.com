/* invoidhunter — 3D-кинопленка по бокам + левитирующие предметы (штатив, хлопушка, окна монтажки…): за фоном, в блюре, живёт от скролла (three.js r128, лежит рядом: three.min.js) */
(() => {
  "use strict";

  /* ---------- config ---------- */
  const kIgnoreReducedMotion = true; // true = анимируется, даже если в системе отключены анимации
  const kTiles = 8;        // кадров в ленте (кольцо, бесконечная прокрутка)
  const kStripW = 2.0;     // ширина ленты, ед. сцены
  const kTileH = 2.5;      // высота одного кадра
  const kSide = 0.84;      // 0..1: как близко к краю экрана (1 = у самого края)
  const kScrollK = 0.0045; // ед. ленты на пиксель скролла
  const kIdle = 0.12;      // ед/с: ленивый дрейф без скролла
  const kTwistScroll = 0.0015; // фаза скручивания на пиксель скролла
  const kLean = 0.12;      // наклон лент к центру, рад
  const kMinWidth = 700;   // уже — не запускаем
  const kProps = true;     // левитирующие предметы между камерой и лентами
  const kPropOpacity = 0.4; // прозрачность предметов (0..1), плёнку и камеру не трогает
  const kPropScroll = 0.0022; // ед. на пиксель скролла (медленнее плёнки — эффект глубины)
  const kPropDrift = 0.05; // ед/с: дрейф без скролла

  const host = document.getElementById("film3d");
  const T = window.THREE;
  if (!host || !T || typeof document === "undefined") return;

  const mq = window.matchMedia("(min-width: " + kMinWidth + "px)");
  const prm = !kIgnoreReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let started = false;

  /* ---------- «кадры» плёнки: абстрактные неоновые картинки ---------- */
  const PAL = [
    ["#ff2bd6", "#8a2bff"], ["#22e5ff", "#8a2bff"], ["#b6ff2e", "#22e5ff"],
    ["#ff2bd6", "#22e5ff"], ["#8a2bff", "#07010c"], ["#ff9ee9", "#22e5ff"]
  ];
  function frameTexture(i) {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 200;
    const g = c.getContext("2d");
    const [a, b] = PAL[i % PAL.length];
    const gr = g.createLinearGradient(0, 0, 128, 200);
    gr.addColorStop(0, a); gr.addColorStop(1, b);
    g.fillStyle = gr; g.fillRect(0, 0, 128, 200);
    g.globalAlpha = 0.55; g.fillStyle = "#fff";
    const v = i % 3;
    if (v === 0) { g.beginPath(); g.arc(64, 80, 34, 0, Math.PI * 2); g.fill(); }
    else if (v === 1) { g.beginPath(); g.moveTo(10, 190); g.lineTo(64, 40); g.lineTo(118, 190); g.closePath(); g.fill(); }
    else { for (let k = 0; k < 6; k++) g.fillRect(0, 20 + k * 30, 128, 8); }
    return new T.CanvasTexture(c);
  }

  /* ---------- одна лента (кольцо из кадров с перфорацией) ---------- */
  function buildStrip(side, texs, baseGeo, winGeo, edgeGeo, baseM, edgeM) {
    const group = new T.Group();
    const tiles = [];
    for (let i = 0; i < kTiles; i++) {
      const tile = new T.Group();
      tile.add(new T.Mesh(baseGeo, baseM));
      const win = new T.Mesh(winGeo, new T.MeshBasicMaterial({ map: texs[(i * 2 + (side > 0 ? 1 : 0)) % texs.length] }));
      win.position.z = 0.03;
      tile.add(win);
      const edge = new T.LineSegments(edgeGeo, edgeM);
      edge.position.z = 0.032;
      tile.add(edge);
      group.add(tile);
      tiles.push(tile);
    }
    return { group, tiles };
  }

  /* ---------- левитирующие предметы ---------- */
  function buildProps(T) {
    const std = (color, o) => new T.MeshStandardMaterial(Object.assign({ color, metalness: 0.5, roughness: 0.5 }, o || {}));
    const glow = (color, k) => std(color, { emissive: color, emissiveIntensity: k || 0.75, metalness: 0.2 });
    const M = {
      body: std(0x1b1230), dark: std(0x0c0814, { roughness: 0.65 }),
      pink: glow(0xff2bd6), cyan: glow(0x22e5ff), lime: glow(0xb6ff2e, 0.6), violet: glow(0x8a2bff),
      line: std(0x3a2a66, { emissive: 0x3a2a66, emissiveIntensity: 0.4 })
    };
    Object.values(M).forEach(m => { m.transparent = true; m.opacity = kPropOpacity; m.depthWrite = false; });
    const at = (o, x, y, z) => { o.position.set(x || 0, y || 0, z || 0); return o; };
    const box = (w, h, d, m, x, y, z) => at(new T.Mesh(new T.BoxGeometry(w, h, d), m), x, y, z);
    const cyl = (rt, rb, h, m, x, y, z, seg) => at(new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 24), m), x, y, z);
    const ball = (r, m, x, y, z) => at(new T.Mesh(new T.SphereGeometry(r, 14, 14), m), x, y, z);
    const ring = (r, t, m, x, y, z) => at(new T.Mesh(new T.TorusGeometry(r, t, 10, 40), m), x, y, z);
    const centered = (g, dy, spin) => { const o = new T.Group(); g.position.y = dy || 0; o.add(g); if (spin) o.userData.spin = spin; return o; };
    const appWin = (w, h) => { // общее «окно приложения»: корпус, заголовок, три точки
      const g = new T.Group();
      g.add(box(w, h, 0.07, M.body));
      g.add(box(w, 0.2, 0.09, M.dark, 0, h / 2 - 0.1, 0));
      [M.pink, M.lime, M.cyan].forEach((m, i) => g.add(ball(0.04, m, -w / 2 + 0.16 + i * 0.12, h / 2 - 0.1, 0.06)));
      return g;
    };

    const tripod = () => {
      const g = new T.Group();
      for (let i = 0; i < 3; i++) {
        const leg = new T.Group();
        leg.rotation.order = "YXZ"; leg.rotation.y = i * Math.PI * 2 / 3; leg.rotation.x = 0.4;
        leg.add(cyl(0.045, 0.035, 2.0, M.body, 0, -1.0, 0, 10), ball(0.07, M.pink, 0, -2.0, 0));
        g.add(leg);
      }
      g.add(cyl(0.24, 0.24, 0.08, M.dark, 0, 0.04, 0));
      const cam = new T.Group(); cam.position.y = 0.4;
      cam.add(box(0.5, 0.36, 0.8, M.body));
      const lens = cyl(0.13, 0.13, 0.3, M.dark, 0, 0, 0.5); lens.rotation.x = Math.PI / 2;
      cam.add(lens, ring(0.13, 0.02, M.cyan, 0, 0, 0.66), ball(0.04, M.pink, 0.17, 0.2, 0.2));
      g.add(cam);
      return centered(g, 0.75);
    };

    const clapper = () => {
      const g = new T.Group();
      g.add(box(1.7, 1.1, 0.08, M.body, 0, -0.2, 0));
      [0.15, -0.15, -0.45, -0.75].forEach((y, i) =>
        g.add(box(i % 2 ? 1.1 : 1.4, 0.05, 0.02, i % 2 ? M.cyan : M.pink, i % 2 ? -0.15 : 0, y, 0.05)));
      const bar = (x0, y) => {
        const b = new T.Group(); b.position.set(x0, y, 0);
        b.add(box(1.7, 0.26, 0.09, M.dark, 0.85, 0.13, 0));
        for (let i = 0; i < 6; i++) b.add(box(0.15, 0.26, 0.1, i % 2 ? M.dark : M.pink, 0.18 + i * 0.28, 0.13, 0));
        return b;
      };
      g.add(bar(-0.85, 0.37));
      const flap = bar(-0.85, 0.66); flap.rotation.z = 0.38; g.add(flap); // верхняя планка приоткрыта
      return centered(g, -0.4);
    };

    const timeline = () => {
      const g = appWin(2.6, 1.7);
      const rows = [
        [[-0.95, 0.7, "pink"], [0.0, 0.9, "violet"], [0.95, 0.3, "cyan"]],
        [[-0.6, 1.0, "cyan"], [0.55, 0.6, "lime"]],
        [[-1.0, 0.45, "violet"], [-0.35, 0.5, "pink"], [0.35, 0.8, "cyan"]],
        [[-0.2, 1.4, "lime"]]
      ];
      rows.forEach((row, r) => {
        const y = 0.38 - r * 0.3;
        g.add(box(2.35, 0.22, 0.02, M.dark, 0, y, 0.05));
        row.forEach(([x, w, c]) => g.add(box(w, 0.16, 0.03, M[c], x + w / 2, y, 0.07)));
      });
      g.add(box(0.03, 1.25, 0.02, M.pink, 0.15, -0.05, 0.1), box(0.14, 0.09, 0.02, M.pink, 0.15, 0.6, 0.1));
      return centered(g, 0);
    };

    const graph = () => {
      const g = appWin(2.4, 1.7);
      for (let i = 0; i < 4; i++) g.add(box(2.1, 0.01, 0.01, M.line, 0, -0.5 + i * 0.35, 0.05));
      for (let i = -2; i <= 2; i++) g.add(box(0.01, 1.2, 0.01, M.line, i * 0.5, -0.1, 0.05));
      const v = (x, y) => new T.Vector3(x, y, 0.08);
      const p0 = v(-0.95, -0.4), p1 = v(-0.2, 0.8), p2 = v(0.2, -0.8), p3 = v(0.95, 0.4);
      g.add(new T.Mesh(new T.TubeGeometry(new T.CubicBezierCurve3(p0, p1, p2, p3), 40, 0.03, 6, false), M.pink));
      [p0, p3].forEach(p => { const k = new T.Mesh(new T.OctahedronGeometry(0.1), M.cyan); k.position.copy(p); k.scale.set(1, 1, 0.5); g.add(k); });
      [[p0, p1], [p3, p2]].forEach(([a, b]) => {
        g.add(new T.Line(new T.BufferGeometry().setFromPoints([a, b]), new T.LineBasicMaterial({ color: 0x22e5ff, transparent: true, opacity: kPropOpacity })));
        g.add(ball(0.05, M.lime, b.x, b.y, b.z));
      });
      return centered(g, -0.05);
    };

    const reel = () => {
      const g = new T.Group();
      const d = new T.Group(); d.rotation.x = Math.PI / 2; // ось диска — вдоль Z
      const s = new T.Group(); d.add(s);
      s.add(cyl(0.9, 0.9, 0.12, M.body), cyl(0.22, 0.22, 0.2, M.cyan));
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        s.add(cyl(0.17, 0.17, 0.14, M.dark, Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55));
      }
      g.add(d, ring(0.9, 0.05, M.pink));
      return centered(g, 0, t => { s.rotation.y = t * 0.6; });
    };

    const play = () => {
      const g = new T.Group();
      const d = cyl(0.95, 0.95, 0.14, M.dark); d.rotation.x = Math.PI / 2;
      g.add(d, ring(0.95, 0.06, M.cyan));
      const sh = new T.Shape();
      sh.moveTo(-0.28, -0.44); sh.lineTo(0.5, 0); sh.lineTo(-0.28, 0.44);
      const tri = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false }), M.pink);
      tri.position.z = 0.08; g.add(tri);
      return centered(g, 0);
    };

    const keys = () => { // ромбики кейфреймов
      const g = new T.Group(), items = [];
      [[-0.55, 0.35, M.lime], [0.15, -0.2, M.pink], [0.7, 0.45, M.cyan]].forEach(([x, y, m]) => {
        const o = new T.Mesh(new T.OctahedronGeometry(0.3), m);
        o.scale.set(1, 1.4, 0.55); o.position.set(x, y, 0); g.add(o); items.push(o);
      });
      return centered(g, 0, t => items.forEach((o, i) => { o.rotation.y = t * (0.5 + i * 0.3); }));
    };

    const phones = () => {
      const g = new T.Group();
      g.add(new T.Mesh(new T.TorusGeometry(0.8, 0.07, 12, 40, Math.PI), M.pink));
      [-1, 1].forEach(sx => {
        const cup = cyl(0.32, 0.32, 0.24, M.body, sx * 0.8, 0, 0); cup.rotation.z = Math.PI / 2;
        const pad = cyl(0.28, 0.28, 0.1, M.dark, sx * 0.66, 0, 0); pad.rotation.z = Math.PI / 2;
        const rg = ring(0.2, 0.035, M.cyan, sx * 0.93, 0, 0); rg.rotation.y = Math.PI / 2;
        g.add(cup, pad, rg);
      });
      return centered(g, -0.3);
    };

    /* side: -1 слева / +1 справа · slot — место в кольце по высоте · xf — доля полуширины экрана · s — масштаб */
    const defs = [
      { b: tripod,   side: -1, slot: 0.0, xf: 0.50, s: 1.0, z: -1.0 },
      { b: timeline, side: -1, slot: 1.0, xf: 0.62, s: 1.0, z: -2.0 },
      { b: reel,     side: -1, slot: 2.0, xf: 0.48, s: 1.0, z: -0.5 },
      { b: keys,     side: -1, slot: 3.0, xf: 0.60, s: 1.2, z: -1.5 },
      { b: clapper,  side: 1,  slot: 0.5, xf: 0.52, s: 1.0, z: -1.0 },
      { b: graph,    side: 1,  slot: 1.5, xf: 0.62, s: 1.0, z: -2.0 },
      { b: play,     side: 1,  slot: 2.5, xf: 0.48, s: 1.0, z: -0.5 },
      { b: phones,   side: 1,  slot: 3.5, xf: 0.60, s: 1.1, z: -1.5 }
    ];
    return defs.map((d, i) => {
      const obj = d.b();
      obj.scale.setScalar(d.s);
      return { obj, side: d.side, slot: d.slot, xf: d.xf, z: d.z, ph: i * 1.7 };
    });
  }

  function start() {
    if (started) return;
    started = true;

    let renderer;
    try {
      const canvas = document.createElement("canvas");
      host.appendChild(canvas);
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false }); // всё равно в блюре
    } catch (e) { host.hidden = true; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(40, 1, 0.1, 100);
    cam.position.set(0, 0, 14);
    const halfH = Math.tan((cam.fov * Math.PI / 180) / 2) * cam.position.z;

    scene.add(new T.AmbientLight(0xffffff, 0.8));
    const key = new T.DirectionalLight(0xffffff, 0.7); key.position.set(2, 3, 6); scene.add(key);
    const pink = new T.PointLight(0xff2bd6, 1.4, 30); pink.position.set(-6, 2, 5); scene.add(pink);
    const cyan = new T.PointLight(0x22e5ff, 1.2, 30); cyan.position.set(6, -2, 5); scene.add(cyan);

    /* геометрия кадра: полоса с дырками-перфорацией, окно-картинка, неоновая рамка */
    const w = kStripW / 2, h = kTileH / 2;
    const shape = new T.Shape();
    shape.moveTo(-w, -h); shape.lineTo(w, -h); shape.lineTo(w, h); shape.lineTo(-w, h); shape.lineTo(-w, -h);
    [-1, 1].forEach(sx => [-1, 0, 1].forEach(k => {
      const cx = sx * (w - 0.17), cy = k * kTileH / 3, hw = 0.07, hh = 0.11;
      const hole = new T.Path();
      hole.moveTo(cx - hw, cy - hh); hole.lineTo(cx + hw, cy - hh);
      hole.lineTo(cx + hw, cy + hh); hole.lineTo(cx - hw, cy + hh); hole.lineTo(cx - hw, cy - hh);
      shape.holes.push(hole);
    }));
    const baseGeo = new T.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
    baseGeo.translate(0, 0, -0.02);
    const winGeo = new T.PlaneGeometry(kStripW * 0.6, kTileH * 0.78);
    const edgeGeo = new T.EdgesGeometry(winGeo);
    const baseM = new T.MeshStandardMaterial({ color: 0x1a1030, emissive: 0x1a0838, metalness: 0.3, roughness: 0.6, side: T.DoubleSide });
    const edgeM = new T.LineBasicMaterial({ color: 0xff2bd6 });

    const texs = PAL.map((_, i) => frameTexture(i));
    const L = buildStrip(-1, texs, baseGeo, winGeo, edgeGeo, baseM, edgeM);
    const R = buildStrip(1, texs, baseGeo, winGeo, edgeGeo, baseM, edgeM);
    L.group.rotation.z = -kLean; // верх к центру — ленты «сходятся»
    R.group.rotation.z = kLean;
    scene.add(L.group, R.group);

    const props = kProps ? buildProps(T) : [];
    props.forEach(p => scene.add(p.obj));
    const P = 2 * halfH * 1.35; // высота кольца, по которому ездят предметы (чуть больше экрана — разрыв за кадром)

    let halfW = 1;
    function resize() {
      const W = window.innerWidth, H = window.innerHeight;
      if (W < 2 || H < 2) return;
      renderer.setSize(W, H, false);
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
      halfW = halfH * cam.aspect;
      L.group.position.x = -halfW * kSide;
      R.group.position.x = halfW * kSide;
    }
    window.addEventListener("resize", () => { resize(); if (prm) render(0, 0, 0); });
    resize();

    const total = kTiles * kTileH;
    const K = 0.45; // «шаг» винта вдоль ленты

    /* off — смещение ленты, ph — фаза скрутки, amp — амплитуда качания кадров */
    function place(strip, off, ph, amp) {
      strip.tiles.forEach((t, i) => {
        const y = ((i * kTileH + off) % total + total) % total - total / 2; // кольцо
        const a = y * K + ph;
        t.position.set(Math.sin(a) * 0.35, y, Math.cos(a) * 0.6 - 0.6);
        t.rotation.y = Math.sin(a) * amp;
      });
    }

    function render(scrollCur, lag, time) {
      const amp = 0.55 + Math.min(0.9, Math.abs(lag) * 0.004); // быстрый скролл — сильнее раскачивает
      const ph = time * 0.3 + scrollCur * kTwistScroll;
      const off = scrollCur * kScrollK + time * kIdle;
      place(L, off, ph, amp);
      place(R, -off, -ph, amp); // правая живёт в противофазе
      props.forEach(p => {
        const o = -p.side * (scrollCur * kPropScroll + time * kPropDrift); // левые вверх, правые вниз
        const y = ((p.slot * P / 4 + o) % P + P) % P - P / 2;
        p.obj.position.set(
          p.side * halfW * p.xf + Math.sin(time * 0.35 + p.ph) * 0.25,
          y + Math.sin(time * 0.9 + p.ph) * 0.2, // левитация
          p.z);
        p.obj.rotation.set(Math.sin(time * 0.5 + p.ph) * 0.15, Math.sin(time * 0.4 + p.ph) * 0.55, Math.sin(time * 0.3 + p.ph) * 0.08);
        const sp = p.obj.userData.spin; if (sp) sp(time);
      });
      renderer.render(scene, cam);
    }

    if (prm) { render(0, 0, 0); return; } // статичный кадр

    let cur = window.scrollY, last = performance.now(), time = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      time += dt;
      const target = window.scrollY;
      cur += (target - cur) * (1 - Math.exp(-dt * 6)); // плавное догонение
      render(cur, target - cur, time);
    }
    requestAnimationFrame(frame);
  }

  if (mq.matches) start();
  else if (mq.addEventListener) mq.addEventListener("change", e => { if (e.matches) start(); });
  else mq.addListener(e => { if (e.matches) start(); });
})();
