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
    pivot.add(at(cylZ(0.12, 0.12, 0.05, new T.MeshBasicMaterial({ color: 0x000000 })), 0, 0, 1.62));
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

    return { pivot, stand, ledM };
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
    const { pivot, stand, ledM } = buildCamera(T);
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
      if (interactive(e.target) || !hit(e.clientX, e.clientY)) return;
      const m = nextMessage();
      say(m.text, e.clientX, e.clientY);
      kick = 1;
      if (m.spin) spin = Math.PI * 2;
    });
    window.addEventListener("pointermove", e => {
      document.documentElement.classList.toggle("cam-hover", !interactive(e.target) && hit(e.clientX, e.clientY));
    }, { passive: true });

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
      if (mouse.active) {
        const r = host.getBoundingClientRect();
        ({ yaw, pitch } = aimAngles(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2), 500));
      } else { // курсора нет — камера лениво осматривается
        yaw = 0.35 + Math.sin(now / 1700) * 0.25;
        pitch = Math.sin(now / 2300) * 0.08;
      }
      aim.rotation.set(-pitch, yaw, 0);
      pivot.quaternion.slerp(aim.quaternion, 1 - Math.exp(-dt * 8));

      // реакция на клик: подпрыгивание-тряска и (раз в десять кликов) «бочка»
      kick = Math.max(0, kick - dt * 2.2);
      spin = Math.max(0, spin - dt * Math.PI * 2.4);
      wrap.scale.setScalar(1 + kick * 0.1);
      wrap.rotation.z = Math.sin(now / 35) * kick * 0.12 + spin;

      const ledOn = kick > 0.2 || Math.floor(now / 600) % 2 === 0; // мигает как REC, на клик горит
      ledM.color.setHex(ledOn ? 0xff3b3b : 0x4a1010);
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  }

  if (mq.matches) start();
  else if (mq.addEventListener) mq.addEventListener("change", e => { if (e.matches) start(); });
  else mq.addListener(e => { if (e.matches) start(); });
})();
