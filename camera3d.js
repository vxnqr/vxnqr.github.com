/* invoidhunter — 3D-камера слева, следит за курсором (three.js r128, лежит рядом: three.min.js) */
(() => {
  "use strict";

  /* ---------- модель ---------- */
  function buildCamera(T) {
    const mat = (color, o) => new T.MeshStandardMaterial(Object.assign({ color, metalness: 0.55, roughness: 0.45 }, o || {}));
    const bodyM = mat(0x1b1230);
    const darkM = mat(0x0c0814, { roughness: 0.65 });
    const pinkM = mat(0xff2bd6, { emissive: 0xff2bd6, emissiveIntensity: 0.8, metalness: 0.2 });
    const cyanM = mat(0x22e5ff, { emissive: 0x22e5ff, emissiveIntensity: 0.7, metalness: 0.2 });

    // цилиндр вдоль оси Z (rt — радиус у переднего края)
    const cylZ = (rt, rb, h, m, open) => {
      const mesh = new T.Mesh(new T.CylinderGeometry(rt, rb, h, 32, 1, !!open), m);
      mesh.rotation.x = Math.PI / 2;
      return mesh;
    };
    const at = (obj, x, y, z) => { obj.position.set(x, y, z); return obj; };

    const pivot = new T.Group(); // вращается вся камера, «вперёд» = +Z

    // корпус + розовый пояс
    pivot.add(at(new T.Mesh(new T.BoxGeometry(1.1, 0.9, 1.7), bodyM), 0, 0, -0.25));
    pivot.add(at(new T.Mesh(new T.BoxGeometry(1.12, 0.07, 1.72), pinkM), 0, -0.12, -0.25));

    // объектив
    pivot.add(at(cylZ(0.42, 0.42, 0.25, darkM), 0, 0, 0.72));
    pivot.add(at(cylZ(0.32, 0.34, 0.8, darkM), 0, 0, 1.2));
    pivot.add(at(new T.Mesh(new T.TorusGeometry(0.345, 0.035, 12, 40), pinkM), 0, 0, 1.0));
    pivot.add(at(new T.Mesh(new T.TorusGeometry(0.33, 0.035, 12, 40), cyanM), 0, 0, 1.38));
    pivot.add(at(cylZ(0.26, 0.26, 0.04, cyanM), 0, 0, 1.6));
    const pupil = at(cylZ(0.12, 0.12, 0.05, new T.MeshBasicMaterial({ color: 0x000000 })), 0, 0, 1.62);
    pivot.add(pupil);
    const hood = cylZ(0.52, 0.36, 0.4, darkM, true);
    hood.material = darkM.clone(); hood.material.side = T.DoubleSide;
    pivot.add(at(hood, 0, 0, 1.75));

    // две бобины сверху
    [-0.65, 0.2].forEach(z => {
      const reel = new T.Mesh(new T.CylinderGeometry(0.45, 0.45, 0.16, 32), darkM);
      reel.rotation.z = Math.PI / 2;
      pivot.add(at(reel, 0, 0.95, z));
      const hub = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.22, 20), cyanM);
      hub.rotation.z = Math.PI / 2;
      pivot.add(at(hub, 0, 0.95, z));
      [-0.085, 0.085].forEach(x => {
        const rim = new T.Mesh(new T.TorusGeometry(0.45, 0.03, 10, 40), pinkM);
        rim.rotation.y = Math.PI / 2;
        pivot.add(at(rim, x, 0.95, z));
      });
    });

    // видоискатель сбоку
    pivot.add(at(new T.Mesh(new T.BoxGeometry(0.28, 0.3, 0.6), bodyM), 0.69, 0.15, -0.75));
    pivot.add(at(new T.Mesh(new T.BoxGeometry(0.3, 0.2, 0.05), cyanM), 0.69, 0.15, -1.07));

    // красный индикатор REC
    const ledM = new T.MeshBasicMaterial({ color: 0xff3b3b });
    pivot.add(at(new T.Mesh(new T.SphereGeometry(0.07, 16, 16), ledM), -0.38, 0.3, 0.62));

    // неподвижная стойка
    const stand = new T.Group();
    stand.add(at(new T.Mesh(new T.CylinderGeometry(0.1, 0.14, 1.0, 20), darkM), 0, -0.95, 0));
    stand.add(at(new T.Mesh(new T.CylinderGeometry(0.6, 0.64, 0.08, 40), darkM), 0, -1.5, 0));
    const baseRing = new T.Mesh(new T.TorusGeometry(0.62, 0.03, 10, 48), pinkM);
    baseRing.rotation.x = Math.PI / 2;
    stand.add(at(baseRing, 0, -1.46, 0));

    return { pivot, stand, ledM, cyanM, pinkM, pupil };
  }

  /* курсор → углы поворота (px от центра камеры; D — «глубина» сцены в px) */
  function aimAngles(dx, dy, D) {
    const clamp = (v, a) => Math.max(-a, Math.min(a, v));
    const yaw = Math.atan2(dx, D);
    const pitch = Math.atan2(-dy, Math.hypot(dx, D));
    return { yaw: clamp(yaw, 1.2), pitch: clamp(pitch, 0.7) };
  }

  if (typeof module !== "undefined") module.exports = { buildCamera, aimAngles };
  if (typeof document === "undefined") return;

  /* ---------- реплики при клике ---------- */
  const MSG = {
    ru: [
      "Тсс, идёт запись. 🔴",
      "Снято! Ну, почти. Я просто моргнул.",
      "Не трогай объектив, я только протёр!",
      "Дубль 47. Режиссёр опять недоволен.",
      "Хук за три секунды? Ты уже на второй.",
      "Ctrl+Z в жизни не работает. Проверял.",
      "Рендер ещё идёт... Он всегда идёт.",
      "Бит в синхроне. Сердце — нет.",
      "Я не фотоаппарат. Я — кино.",
      "Хочешь монтаж? Жми «Заказать», я подержу свет.",
      "Зум не работает. Подвинься ближе к монитору.",
      "Лучший ракурс на этом сайте — вот этот.",
      "Мотор! Камера! ...Ой, это же я."
    ],
    en: [
      "Shh, recording. 🔴",
      "That's a wrap! Well, almost. I just blinked.",
      "Hands off the lens, I just cleaned it!",
      "Take 47. The director is unhappy again.",
      "A hook in three seconds? You're already at two.",
      "Ctrl+Z doesn't work in real life. I checked.",
      "Still rendering... It's always rendering.",
      "Beat in sync. Heart, not so much.",
      "I'm not a camera. I'm cinema.",
      "Want an edit? Hit “Order”, I'll hold the light.",
      "Zoom is broken. Lean closer to the monitor.",
      "Best angle on this site. This one.",
      "Lights! Camera! ...Oh wait, that's me."
    ]
  };
  const SPIN = {
    ru: "Всё-всё, у меня голова кружится! 🌀",
    en: "Okay okay, I'm getting dizzy! 🌀"
  };
  const GRAB = {
    ru: {
      scold: ["Ноу, ноу, ноу! Так нельзя!", "А-ай-яй-яй! Ручками не трогать!", "Не тыкай в меня! Курсор конфискован!"],
      toss: ["Брысь! Иди погуляй!", "Лети отсюда!", "Не мешай работать!"],
      back: ["Ладно, держи. И больше не тыкай!", "Забирай. Но я за тобой слежу.", "Отдаю. Условно."]
    },
    en: {
      scold: ["No, no, no! You can't do that!", "Tsk tsk! Hands off the camera!", "Don't poke me! Cursor confiscated!"],
      toss: ["Scram! Go play somewhere else!", "Off you go!", "I'm working here!"],
      back: ["Fine, take it back. No more poking!", "Here. But I'm watching you.", "Returned. Conditionally."]
    }
  };
  const kGrabQuery = (location.search.match(/[?&]grab=(\w+)/) || [])[1]; // ?grab=1 | toss | hold — принудительно, для проверки
  const kGrabChance = kGrabQuery ? 1 : 0.2;                               // шанс «ручек» на клик по камере
  const kGrabForced = kGrabQuery === "toss" || kGrabQuery === "hold" ? kGrabQuery : null;
  /* ---------- звук: синтез на WebAudio (без файлов), тихий ---------- */
  const kSound = true;     // false = без звука
  const kSoundVol = 0.07;  // общая громкость 0..1 (держи небольшой, чтобы не раздражало)
  let actx = null, noiseBuf = null;
  function audioCtx() {
    if (!kSound) return null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = actx || new AC();
      if (actx.state === "suspended") actx.resume();
      return actx;
    } catch (e) { return null; }
  }
  function noise(ctx) {
    if (noiseBuf) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function burst(ctx, t, dur, freq, q, gain, sweepTo) { // «клик/шшш»: отфильтрованный шум
    const src = ctx.createBufferSource(); src.buffer = noise(ctx);
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain * kSoundVol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.03);
  }
  function tone(ctx, t, type, f0, f1, dur, gain, lp) { // тон с плавным скольжением частоты
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain * kSoundVol, t + Math.min(0.03, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let out = o;
    if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; o.connect(f); out = f; }
    out.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  const SFX = {
    tap() {    // мягкий двойной «клик затвора», чуть разный каждый раз
      const c = audioCtx(); if (!c) return;
      const t = c.currentTime, k = 0.92 + Math.random() * 0.16;
      burst(c, t, 0.035, 2400 * k, 3, 0.9);
      tone(c, t, "sine", 190 * k, 120 * k, 0.05, 0.7);
      burst(c, t + 0.07, 0.05, 1500 * k, 2.5, 0.65);
      tone(c, t + 0.07, "sine", 140 * k, 90 * k, 0.07, 0.5);
    },
    growl() {  // недовольное урчание, когда схватил курсор
      const c = audioCtx(); if (!c) return;
      const t = c.currentTime;
      tone(c, t, "sawtooth", 78, 52, 0.9, 0.9, 260);
      tone(c, t + 0.02, "square", 39, 31, 0.9, 0.5, 160);
    },
    whoosh() { // бросок
      const c = audioCtx(); if (!c) return;
      burst(c, c.currentTime, 0.35, 500, 1.2, 0.8, 2600);
    },
    give() {   // «ладно, держи»: вниз-вверх
      const c = audioCtx(); if (!c) return;
      const t = c.currentTime;
      tone(c, t, "triangle", 420, 300, 0.14, 0.7);
      tone(c, t + 0.15, "triangle", 300, 380, 0.14, 0.6);
    }
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const curLang = () => (document.documentElement.lang === "en" ? "en" : "ru");
  let clicks = 0, lastIdx = -1;
  function nextMessage() {
    clicks++;
    const lang = document.documentElement.lang === "en" ? "en" : "ru";
    if (clicks % 10 === 0) return { text: SPIN[lang], spin: true }; // каждый десятый клик — бочка
    const list = MSG[lang];
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (list.length > 1 && i === lastIdx);
    lastIdx = i;
    return { text: list[i], spin: false };
  }

  /* ---------- сцена ---------- */
  const host = document.getElementById("cam3d");
  const T = window.THREE;
  if (!host || !T) return;

  const mq = window.matchMedia("(min-width: 700px)");
  const kIgnoreReducedMotion = true; // true = камера следит за курсором, даже если в Windows/браузере отключены анимации
  const prm = !kIgnoreReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let started = false;

  function start() {
    if (started) return;
    started = true;

    let renderer;
    try {
      const canvas = document.createElement("canvas");
      host.appendChild(canvas);
      renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) { host.hidden = true; return; } // нет WebGL — просто без камеры
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(35, 1, 0.1, 50);
    const { pivot, stand, ledM, cyanM, pinkM, pupil } = buildCamera(T);
    const wrap = new T.Group();       // сюда навешиваем реакции на клик (тряска, «бочка»)
    wrap.add(pivot);
    scene.add(wrap, stand);

    scene.add(new T.AmbientLight(0xffffff, 0.55));
    const key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(2, 3, 4); scene.add(key);
    const pink = new T.PointLight(0xff2bd6, 1.3, 14); pink.position.set(-3, 1, 2.5); scene.add(pink);
    const cyan = new T.PointLight(0x22e5ff, 1.1, 14); cyan.position.set(3, -1, 3); scene.add(cyan);

    function resize() {
      const w = host.clientWidth, h = host.clientHeight;
      if (w < 2 || h < 2) return;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      const vf = cam.fov * Math.PI / 180;
      const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
      cam.position.set(0, 0, 2.3 / Math.sin(Math.min(vf, hf) / 2)); // вся камера влезает по ширине
      cam.lookAt(0, -0.15, 0);
      cam.updateProjectionMatrix();
    }
    window.addEventListener("resize", () => { resize(); if (prm) renderer.render(scene, cam); });
    resize();

    /* ---- клик по модели ---- */
    const ray = new T.Raycaster();
    const ndc = new T.Vector2();
    function hit(x, y) {
      const r = host.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      return ray.intersectObjects([wrap, stand], true).length > 0;
    }

    // камера «за фоном»: клики по интерактиву и стеклянным панелям её не трогают
    const interactive = t => !!(t && t.closest && t.closest("a, button, input, video, .work, .service, .glass, .chip, .ticker"));

    const bubble = document.createElement("div");
    bubble.className = "cam-bubble";
    bubble.setAttribute("aria-hidden", "true");
    document.body.appendChild(bubble);
    let hideTimer = 0;
    function say(text, x, y) { // реплика появляется у курсора
      bubble.textContent = text;
      bubble.style.left = Math.max(8, Math.min(window.innerWidth - 238, x - 30)) + "px";
      bubble.style.bottom = Math.min(window.innerHeight - 60, window.innerHeight - y + 16) + "px";
      bubble.classList.remove("show");
      void bubble.offsetWidth; // перезапуск анимации при повторном клике
      bubble.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => bubble.classList.remove("show"), 3600);
    }

    let kick = 0, spin = 0;
    window.addEventListener("click", e => {
      if (grab || interactive(e.target) || !hit(e.clientX, e.clientY)) return;
      SFX.tap();
      if (canGrab && e.pointerType !== "touch" && Math.random() < kGrabChance) { startGrab(e.clientX, e.clientY); return; }
      const m = nextMessage();
      say(m.text, e.clientX, e.clientY);
      kick = 1;
      if (m.spin) spin = Math.PI * 2;
    });
    window.addEventListener("pointermove", e => {
      if (grab) return;
      document.documentElement.classList.toggle("cam-hover", !interactive(e.target) && hit(e.clientX, e.clientY));
    }, { passive: true });

    /* ---- «ручки»: иногда камера хватает курсор, ругается и либо швыряет его, либо отдаёт ----
       Настоящий курсор двигать нельзя: на время хвата прячем его, рисуем поддельную стрелку и ловим клики слоем-«замком». */
    let grab = null, canGrab = false;
    const lock = document.createElement("div");
    lock.className = "cam-lock"; lock.style.display = "none";
    const fakeCur = document.createElement("div");
    fakeCur.className = "cam-cursor"; fakeCur.setAttribute("aria-hidden", "true"); fakeCur.style.display = "none";
    fakeCur.innerHTML = '<svg width="20" height="28" viewBox="0 0 20 28"><path d="M2 2 L2 22 L7 17.5 L10.5 25.5 L14 24 L10.5 16.5 L17 16.5 Z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    document.body.append(lock, fakeCur);
    const setFake = (x, y, rot, sc, op) => {
      fakeCur.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + rot.toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")";
      fakeCur.style.opacity = String(op);
    };

    const armM = new T.MeshStandardMaterial({ color: 0x2a1a4a, emissive: 0x8a2bff, emissiveIntensity: 0.35, metalness: 0.4, roughness: 0.5 });
    const gloveM = new T.MeshStandardMaterial({ color: 0xffe9fb, emissive: 0xff2bd6, emissiveIntensity: 0.35, metalness: 0.1, roughness: 0.6 });
    const armsGroup = new T.Group(); armsGroup.visible = false; scene.add(armsGroup);
    function makeArm() {
      const mesh = new T.Mesh(new T.BufferGeometry(), armM);
      const hand = new T.Group();
      const ball = (r, x, y, z) => { const b = new T.Mesh(new T.SphereGeometry(r, 12, 12), gloveM); b.position.set(x, y, z); hand.add(b); };
      ball(0.17, 0, 0, 0); ball(0.065, -0.1, 0.16, 0); ball(0.065, 0, 0.2, 0); ball(0.065, 0.1, 0.16, 0); ball(0.06, 0.17, 0, 0.04);
      armsGroup.add(mesh, hand);
      return { mesh, hand, sh: new T.Vector3(), ctrl: new T.Vector3(), tip: new T.Vector3() };
    }
    const armL = makeArm(), armR = makeArm();
    const SH_L = new T.Vector3(-0.56, -0.25, -0.1), SH_R = new T.Vector3(0.56, -0.25, -0.1); // «плечи» в системе камеры

    /* ---- «злая» и «большая» камера: красный объектив-щель, брови, раздувается поверх контента ---- */
    const RED = new T.Color(0xff0d0d), CY0 = cyanM.color.clone(), PK0 = pinkM.color.clone();
    const browM = new T.MeshStandardMaterial({ color: 0x0c0814, emissive: 0xff1a1a, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.5 });
    const brows = new T.Group(); brows.position.set(0, 0.58, 1.5); brows.visible = false;
    [-1, 1].forEach(s => {
      const b = new T.Mesh(new T.BoxGeometry(0.62, 0.12, 0.1), browM);
      b.position.set(s * 0.27, 0, 0); b.rotation.z = s * 0.55; // внутренние концы вниз — хмурится
      brows.add(b);
    });
    pivot.add(brows);
    let big = 0, rage = 0, hostBig = false;
    const kBigScale = 0.75, kBigBack = 1.2; // +75% размера (≈ полсайта с учётом перспективы); отодвигаем назад, чтобы не вылезало за кадр
    const gl = { stuck: 0, next: 0.8 };    // «баги» рук: залипания кисти и проваливание локтей в корпус
    const bodyC = new T.Vector3();
    function setRage(r) {
      cyanM.color.copy(CY0).lerp(RED, r); cyanM.emissive.copy(cyanM.color); cyanM.emissiveIntensity = 0.7 + r * 0.25;
      pinkM.color.copy(PK0).lerp(RED, r * 0.6); pinkM.emissive.copy(pinkM.color);
      pupil.scale.set(1 - 0.65 * r, 1, 1 + 0.8 * r); // зрачок-щель
      brows.visible = r > 0.04; brows.scale.setScalar(Math.max(0.01, r));
    }

    const easeOut = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
    const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    const vTmp = new T.Vector3(), pos = new T.Vector3(), holdP = new T.Vector3(), tgt = new T.Vector3(), mw = new T.Vector3();
    function screenToWorld(x, y, z, out) { // точка экрана → точка в плоскости z сцены
      const r = host.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const o = ray.ray.origin, d = ray.ray.direction, k = (z - o.z) / d.z;
      return out.set(o.x + d.x * k, o.y + d.y * k, o.z + d.z * k);
    }
    function worldToScreen(v) {
      const r = host.getBoundingClientRect();
      vTmp.copy(v).project(cam);
      return { x: r.left + (vTmp.x * 0.5 + 0.5) * r.width, y: r.top + (-vTmp.y * 0.5 + 0.5) * r.height };
    }

    function startGrab(x, y) {
      const toss = kGrabForced ? kGrabForced === "toss" : Math.random() < 0.55;
      grab = {
        t: 0, x, y, kind: toss ? "toss" : "hold", dir: Math.random() < 0.5 ? -1 : 1,
        retractStart: toss ? 2.25 : 3.4, // когда руки убираются
        tLock: toss ? 3.7 : 3.4          // когда возвращаем курсор и снимаем «замок»
      };
      const root = document.documentElement;
      root.classList.remove("cam-hover"); root.classList.add("cam-grab");
      lock.style.display = "block"; fakeCur.style.display = "block";
      setFake(x, y, 0, 1, 1);
      armsGroup.visible = true;
      hostBig = true; root.classList.add("cam-big");               // камера «раздувается»: хост больше, зум модели растёт в кадре
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25)); resize();
      say(pick(GRAB[curLang()].scold), x, y);
      setTimeout(SFX.growl, 140);
    }
    function unlock() {
      document.documentElement.classList.remove("cam-grab");
      lock.style.display = "none"; fakeCur.style.display = "none";
    }

    function updateGrab(dt) {
      const g = grab, t = (g.t += dt);
      pivot.updateWorldMatrix(true, false);
      if (!g.pc) g.pc = screenToWorld(g.x, g.y, 0.6, new T.Vector3());
      const Sg = 1 + big * kBigScale;                            // текущий масштаб «раздутой» камеры
      holdP.set(0, 0.1, 2.7); pivot.localToWorld(holdP);        // «перед объективом»: сюда камера тащит курсор
      pos.copy(g.pc);
      const mx = mouse.active ? mouse.x : g.x, my = mouse.active ? mouse.y : g.y;
      let wag = 0, rot = 0, sc = 1, op = 1, cx = null, cy = null;

      if (t >= 0.3) pos.lerp(holdP, smooth((t - 0.3) / 0.5));
      if (t >= 0.3 && t < 2.0) {                                 // «ноу-ноу-ноу»: трясёт курсором и собой
        wag = Math.sin((t - 0.3) * 14) * 0.3 * Math.min(1, (t - 0.3) / 0.3);
        kick = 0.7;
      }
      rot = wag * 70;

      if (g.kind === "toss") {
        if (t >= 2.0 && t < 2.25) pos.x -= g.dir * 0.5 * smooth((t - 2.0) / 0.25); // замах
        if (t >= 2.25) {
          if (!g.flying) {                                       // бросок
            g.flying = true;
            const s0 = worldToScreen(pos);
            g.fx = s0.x; g.fy = s0.y; g.rot = 0;
            g.vx = g.dir * (900 + Math.random() * 600); g.vy = -(500 + Math.random() * 500);
            say(pick(GRAB[curLang()].toss), g.x, g.y); SFX.whoosh();
          }
          g.fx += g.vx * dt; g.fy += g.vy * dt; g.vy += 1800 * dt; g.rot += 900 * dt * g.dir;
          cx = g.fx; cy = g.fy; rot = g.rot; sc = 1 - 0.5 * Math.min(1, (t - 2.25) / 1.0);
          if (cx < -60 || cx > window.innerWidth + 60 || cy > window.innerHeight + 60) op = 0;
          if (t >= 3.4) {                                        // курсор «возвращается» на место мыши
            const k = smooth((t - 3.4) / 0.3);
            cx = mx; cy = my; rot = 0; sc = 0.3 + 0.7 * k; op = 1;
          }
        }
      } else {
        if (t >= 2.0 && !g.said) { g.said = true; say(pick(GRAB[curLang()].back), g.x, g.y); SFX.give(); }
        if (t >= 2.9) {                                          // кладёт курсор обратно туда, где мышь
          screenToWorld(mx, my, 0.6, mw);
          pos.lerp(mw, smooth((t - 2.9) / 0.5));
        }
      }

      let ext = t < 0.3 ? easeOut(t / 0.3) : 1;                  // насколько вытянуты руки
      if (t > g.retractStart) ext *= 1 - easeOut((t - g.retractStart) / 0.45);
      pos.x += wag;
      const showArms = ext > 0.035;
      armsGroup.visible = showArms;
      if (showArms) {
        gl.next -= dt;
        if (gl.stuck > 0) gl.stuck -= dt;
        else if (gl.next <= 0 && ext > 0.9) { gl.stuck = 0.12 + Math.random() * 0.22; gl.next = 0.3 + Math.random() * 0.6; }
        bodyC.set(0, 0, 0.1); pivot.localToWorld(bodyC);
        [[armL, SH_L, -0.1], [armR, SH_R, 0.1]].forEach(([a, sh, ox]) => {
          a.sh.copy(sh); pivot.localToWorld(a.sh);
          a.sh.x += (Math.random() - 0.5) * 0.03 * Sg; a.sh.y += (Math.random() - 0.5) * 0.03 * Sg; // мелкая дрожь «багнутой» анимации
          tgt.set(pos.x + ox * Sg, pos.y - 0.05, pos.z + 0.02).sub(a.sh).multiplyScalar(Math.max(ext, 0.03)).add(a.sh);
          if (gl.stuck > 0) {                                      // кисть «застряла в текстурах»: залипла на старом месте и дёргается
            tgt.copy(a.tip).add(vTmp.set((Math.random() - 0.5) * 0.14 * Sg, (Math.random() - 0.5) * 0.14 * Sg, (Math.random() - 0.5) * 0.14 * Sg));
          } else a.tip.copy(tgt);
          a.ctrl.copy(a.sh).lerp(tgt, 0.5); a.ctrl.y -= 0.3 * ext * Sg; a.ctrl.x += Math.sign(sh.x) * 0.3 * Sg;
          a.ctrl.lerp(bodyC, 0.4 * ext);                           // локоть проваливается в корпус — рука пробивает его насквозь
          a.mesh.geometry.dispose();
          a.mesh.geometry = new T.TubeGeometry(new T.QuadraticBezierCurve3(a.sh, a.ctrl, tgt), 18, 0.07 * Sg, 8, false);
          a.hand.position.copy(tgt);
          a.hand.scale.setScalar(Sg * (gl.stuck > 0 ? 0.75 + Math.random() * 0.7 : 1)); // кисть «мигает» размером
        });
      }

      if (!g.unlocked) {
        const sp = cx === null ? worldToScreen(pos) : { x: cx, y: cy };
        setFake(sp.x, sp.y, rot, sc, op);
      }
      if (t >= g.tLock && !g.unlocked) { g.unlocked = true; unlock(); }
      if (g.unlocked && !showArms) { armsGroup.visible = false; grab = null; }
    }

    const aim = new T.Object3D();
    aim.rotation.order = "YXZ";
    pivot.rotation.order = "YXZ";

    if (prm) { // без анимации: один статичный кадр (клик показывает только реплику)
      pivot.rotation.y = 0.35;
      renderer.render(scene, cam);
      return;
    }

    const mouse = { x: 0, y: 0, active: false };
    window.addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { mouse.active = false; });

    let last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (host.clientWidth < 2) return; // скрыто на узком экране

      let yaw, pitch;
      if (mouse.active || grab) {
        const r = host.getBoundingClientRect();
        const ax = grab ? grab.x : mouse.x, ay = grab ? grab.y : mouse.y;
        ({ yaw, pitch } = aimAngles(ax - (r.left + r.width / 2), ay - (r.top + r.height / 2), 500));
      } else { // курсора нет — камера лениво осматривается
        yaw = 0.35 + Math.sin(now / 1700) * 0.25;
        pitch = Math.sin(now / 2300) * 0.08;
      }
      aim.rotation.set(-pitch, yaw, 0);
      pivot.quaternion.slerp(aim.quaternion, 1 - Math.exp(-dt * 8));

      if (grab) updateGrab(dt);
      // реакция на клик: подпрыгивание-тряска и (раз в десять кликов) «бочка»
      const gT = grab && !grab.unlocked ? 1 : 0;                   // пока идёт сцена — камера большая и злая
      big += (gT - big) * (1 - Math.exp(-dt * (gT ? 7 : 4)));
      rage += (gT - rage) * (1 - Math.exp(-dt * (gT ? 9 : 5)));
      if (!gT && big < 0.01) big = 0;
      if (!gT && rage < 0.01) rage = 0;
      if (!grab && hostBig && big === 0) {                          // сдулась — возвращаем хост и качество
        hostBig = false; document.documentElement.classList.remove("cam-big");
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); resize();
      }
      setRage(rage);
      const S = 1 + big * kBigScale;
      stand.scale.setScalar(S); wrap.position.z = stand.position.z = -big * kBigBack;
      kick = Math.max(0, kick - dt * 2.2);
      spin = Math.max(0, spin - dt * Math.PI * 2.4);
      wrap.scale.setScalar(S * (1 + kick * 0.1));
      wrap.rotation.z = Math.sin(now / 35) * kick * 0.12 + spin;

      const ledOn = kick > 0.2 || Math.floor(now / 600) % 2 === 0; // мигает как REC, на клик горит
      ledM.color.setHex(ledOn ? 0xff3b3b : 0x4a1010);
      renderer.render(scene, cam);
    }
    canGrab = true;
    requestAnimationFrame(frame);
  }

  if (mq.matches) start();
  else if (mq.addEventListener) mq.addEventListener("change", e => { if (e.matches) start(); });
  else mq.addListener(e => { if (e.matches) start(); });
})();
