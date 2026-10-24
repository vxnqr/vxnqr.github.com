/* invoidhunter — app logic: i18n RU/EN, works grid, reveal-on-scroll, hover-движение услуг */
(() => {
  "use strict";

  const MEDIA_DIR = "media/"; // где лежат .mp4 / .jpg. Если файлы в корне сайта — поставь ""
  const STAMP = window.__BUST || Date.now();
  const kBustMedia = false; // true = и видео/постеры перекачиваются при каждом заходе (тяжело по трафику)

  const I18N = {
    ru: {
      nav_works: "работы",
      nav_services: "услуги",
      nav_about: "о канале",
      hero_l1: "МОНТАЖ",
      hero_l2: "ВИДЕО · ИГР",
      hero_sub: "Плотный рез без воды. Бит в синхроне, хук в первые три секунды, крафт в каждом кадре.",
      cta_order: "ЗАКАЗАТЬ МОНТАЖ ➤",
      cta_works: "СМОТРЕТЬ РАБОТЫ ↓",
      works_h: "РАБОТЫ",
      works_empty_1: "Пока пусто. Закинь файлы (.mp4 / .webm / .png / .jpg) в папку <b>media</b> рядом с сайтом и обнови страницу.",
      services_h: "УСЛУГИ",
      s1_t: "КЛИПЫ И РОЛИКИ",
      s1_d: "Плотный рез, динамика под бит, цвет и та самая грязь — видео, которое дожимают до конца.",
      s1_p: "от 1 000 ₽",
      s2_t: "ИГРОВОЙ МОНТАЖ",
      s2_d: "Летсплеи, скилл-мешапы, клипы по моментам: тайминги под эмоции, а не по шаблону.",
      s2_p: "от 1 500 ₽",
      s3_t: "ТРЕЙЛЕРЫ",
      s3_d: "Кинематографический подход: темп, саунд-дизайн, титры, финальный удар под стингер.",
      s3_p: "от 3 000 ₽",
      s4_t: "ПРЕВЬЮ И АВАТАРЫ",
      s4_d: "Стикеры, авы, миниатюры — визуал, который не отлипает от ленты.",
      s4_p: "от 300 ₽",
      footer_tag: "Монтаж видео и игр: клипы, шорты, трейлеры.",
      footer_about_h: "О КАНАЛЕ",
      footer_about_d: "InvoidHunter — канал про монтаж видео и игровых роликов. Здесь свежие работы и приём заказов: клипы, шортсы, трейлеры, превью. Подпишись и напиши в Telegram — обсудим задачу и сроки.",
      footer_hint: "Новые работы и заказы — в Telegram.",
      cta_join: "ПОДПИСАТЬСЯ ➤",
      ticker: "МОНТАЖ ВИДЕО ✦ ИГРОВЫЕ ТРЕЙЛЕРЫ ✦ ЭКШН-РЕЗЫ ✦ SFX ✦ ШОРТС И РЕЛЫ ✦ ПРЕВЬЮ ✦ ДАВИНЧИ ✦ СИНХРОН БИТА ✦ "
    },
    en: {
      nav_works: "works",
      nav_services: "services",
      nav_about: "about",
      hero_l1: "EDITING",
      hero_l2: "VIDEO · GAMES",
      hero_sub: "Tight cuts, zero filler. Beat-synced, hooked in the first three seconds, crafted in every frame.",
      cta_order: "ORDER A CUT ➤",
      cta_works: "SEE THE WORKS ↓",
      works_h: "WORKS",
      works_empty_1: "Empty for now. Drop files (.mp4 / .webm / .png / .jpg) into the <b>media</b> folder next to the site and refresh.",
      services_h: "SERVICES",
      s1_t: "CLIPS & EDITS",
      s1_d: "Tight pacing, beat-driven dynamics, color and clean distortion — video people watch to the end.",
      s1_p: "from $10",
      s2_t: "GAME EDITS",
      s2_d: "Gameplay montages, skill mashups, moment clips: timing driven by emotion, not habit.",
      s2_p: "from $15",
      s3_t: "TRAILERS",
      s3_d: "Cinematic approach: tempo, sound design, titles, the final hit on the stinger.",
      s3_p: "from $30",
      s4_t: "THUMBS & AVATARS",
      s4_d: "Stickers, avatars, thumbnails — visuals that refuse to leave your feed.",
      s4_p: "from $3",
      footer_tag: "Video & game editing: clips, shorts, trailers.",
      footer_about_h: "ABOUT",
      footer_about_d: "InvoidHunter is a channel about video and game editing. Fresh works and open orders: clips, shorts, trailers, thumbnails. Subscribe and message on Telegram — we'll sort out the task and the timing.",
      footer_hint: "New works and orders — on Telegram.",
      cta_join: "SUBSCRIBE ➤",
      ticker: "VIDEO EDITING ✦ GAME TRAILERS ✦ ACTION CUTS ✦ SFX ✦ SHORTS & REELS ✦ THUMBNAILS ✦ DAVINCI ✦ BEAT SYNC ✦ "
    }
  };

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;

  /* ---------- i18n ---------- */
  let lang = "ru";
  try {
    const saved = localStorage.getItem("ivh-lang");
    lang = saved === "en" || saved === "ru"
      ? saved
      : ((navigator.language || "").startsWith("ru") ? "ru" : "en");
  } catch (e) { /* storage may be blocked — default ru */ }

  function buildTicker() {
    const tr = $("#ticker-track");
    if (!tr) return; // бегущей строки на странице больше нет
    const t = I18N[lang].ticker;
    tr.innerHTML = `<span>${t.repeat(2)}</span><span>${t.repeat(2)}</span>`;
  }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(el => {
      const v = I18N[lang][el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    buildTicker();
    ["ru", "en"].forEach(l => {
      const b = $("#lang-" + l);
      b.classList.toggle("active", lang === l);
      b.setAttribute("aria-pressed", String(lang === l));
    });
    try { localStorage.setItem("ivh-lang", lang); } catch (e) { /* non-critical */ }
  }

  $("#lang-ru").addEventListener("click", () => applyLang("ru"));
  $("#lang-en").addEventListener("click", () => applyLang("en"));
  applyLang(lang);

  $("#year").textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ----------
     Главный баг раньше: карточки работ создавались ПОСЛЕ того, как observer собрал цели,
     поэтому оставались с opacity:0 навсегда. Теперь reveal() вызывается и для них после render(). */
  const revealIO = hasIO && !prm
    ? new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); revealIO.unobserve(en.target); }
        });
      }, { threshold: 0.12 })
    : null;

  function reveal(els) {
    els.forEach(el => (revealIO ? revealIO.observe(el) : el.classList.add("is-visible")));
  }

  /* ---------- works grid ---------- */
  const grid = $("#works-grid");
  const emptyBox = $("#works-empty");
  const VIDEO_EXT = ["mp4", "webm", "mov"];
  const IMG_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg"];

  const extOf = name => {
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  };
  const baseOf = name => {
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.slice(0, dot) : name;
  };
  const niceName = name => baseOf(name); // подпись = имя файла без расширения, как есть
  const mediaUrl = name => MEDIA_DIR + encodeURIComponent(name) + (kBustMedia ? "?v=" + STAMP : "");

  /* ---------- громкость: один уровень на все видео, запоминается ---------- */
  let volume = 1;
  try {
    const sv = parseFloat(localStorage.getItem("ivh-vol"));
    if (isFinite(sv) && sv > 0 && sv <= 1) volume = sv;
  } catch (e) { /* storage may be blocked */ }
  const saveVol = () => { try { localStorage.setItem("ivh-vol", String(volume)); } catch (e) { /* non-critical */ } };
  const canSetVol = (() => { // iOS Safari не даёт менять video.volume — там ползунок не нужен
    const probe = document.createElement("video");
    probe.volume = 0.5;
    return probe.volume === 0.5;
  })();
  function setVolume(x) {
    volume = Math.max(0, Math.min(1, x));
    saveVol();
    $$(".work video", grid).forEach(el => { el.volume = volume; });
  }

  function muteOthers(active) {
    $$(".work video", grid).forEach(v => { if (v !== active) v.muted = true; });
  }

  // автоплей видео в зоне видимости (один observer на все карточки)
  const playIO = hasIO && !prm
    ? new IntersectionObserver(entries => {
        entries.forEach(en => {
          const v = en.target;
          if (en.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      }, { threshold: 0.35 })
    : null;

  // ---- полный экран ----
  function openFullscreen(v) {
    v.muted = false;               // в полном экране логично со звуком
    muteOthers(v);
    const req = v.requestFullscreen || v.webkitRequestFullscreen;
    if (req) req.call(v);
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS Safari
    if (v.paused) v.play().catch(() => {});
  }
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  function onFsChange() {
    const cur = fsElement();
    // в полном экране включаем нативные контролы (пауза, громкость, перемотка)
    $$("video", grid).forEach(v => { v.controls = v === cur; });
  }
  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);

  function createVideoCard(item, posterName) {
    const card = document.createElement("article");
    card.className = "work";

    const v = document.createElement("video");
    v.src = item.tg || mediaUrl(item.name);
    v.preload = "metadata";
    v.loop = true;
    v.muted = true;
    v.setAttribute("muted", "");       // без атрибута часть браузеров блокирует автоплей
    v.volume = volume;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    if (posterName) v.poster = mediaUrl(posterName);

    const snd = document.createElement("button");
    snd.type = "button";
    snd.className = "work-sound is-off";
    snd.textContent = "🔇";
    snd.setAttribute("aria-label", "sound");
    const vol = document.createElement("input");
    vol.type = "range";
    vol.className = "work-vol";
    vol.min = "0"; vol.max = "100"; vol.step = "1";
    vol.setAttribute("aria-label", "volume");
    ["pointerdown", "pointermove", "click", "touchstart"].forEach(ev =>
      vol.addEventListener(ev, e => e.stopPropagation()));
    vol.addEventListener("input", () => {
      const x = parseFloat(vol.value) / 100;
      if (x > 0) {
        setVolume(x);
        v.muted = false;
        muteOthers(v);                   // звучит одно видео за раз
        if (v.paused) v.play().catch(() => {});
      } else {
        v.muted = true;                  // ползунок в ноль = mute (уровень остаётся в памяти)
      }
    });
    const syncVol = () => {
      const off = v.muted || v.volume === 0;
      snd.classList.toggle("is-off", off);
      snd.textContent = off ? "🔇" : "🔊";
      const lvl = Math.round((v.muted ? 0 : v.volume) * 100);
      vol.value = String(lvl);
      vol.style.setProperty("--p", lvl + "%");
      if (!v.muted && v.volume > 0 && v.volume !== volume) { volume = v.volume; saveVol(); } // нативные контролы в полном экране
    };
    v.addEventListener("volumechange", syncVol);
    snd.addEventListener("click", e => {
      e.stopPropagation();
      v.muted = !v.muted;
      if (!v.muted) {
        if (volume < 0.05) setVolume(0.6);
        muteOthers(v);
        if (v.paused) v.play().catch(() => {});
      }
    });
    syncVol();

    const fs = document.createElement("button");
    fs.type = "button";
    fs.className = "work-fs";
    fs.textContent = "⛶";
    fs.setAttribute("aria-label", "fullscreen");
    fs.addEventListener("click", e => {
      e.stopPropagation();
      openFullscreen(v);
    });

    const badge = document.createElement("span");
    badge.className = "play-badge";
    badge.textContent = "▶";
    const showBadge = () => { if (!v.dataset.failed) badge.classList.remove("hide"); };
    const hideBadge = () => { if (!v.dataset.failed) badge.classList.add("hide"); };
    v.addEventListener("playing", hideBadge);
    v.addEventListener("pause", showBadge);
    v.addEventListener("waiting", showBadge);
    v.addEventListener("stalled", showBadge);
    v.addEventListener("error", () => {
      if (item.tg && !v.dataset.tgFallback) { // ссылка телеги протухла → локальный файл
        v.dataset.tgFallback = "1";
        v.src = mediaUrl(item.name);
        v.load();
        return;
      }
      v.dataset.failed = "1";
      badge.textContent = "⚠";
      badge.classList.remove("hide");
      badge.classList.add("fail");
    });

    // таймлайн
    const time = document.createElement("input");
    time.type = "range";
    time.className = "vtime";
    time.min = "0"; time.max = "100"; time.step = "0.1"; time.value = "0";
    time.setAttribute("aria-label", "timeline");
    ["pointerdown", "pointermove", "click", "touchstart"].forEach(ev =>
      time.addEventListener(ev, e => e.stopPropagation()));
    time.addEventListener("input", () => {
      if (isFinite(v.duration) && v.duration > 0) {
        v.currentTime = (parseFloat(time.value) / 100) * v.duration;
      }
    });
    const syncTime = () => {
      if (isFinite(v.duration) && v.duration > 0) {
        const p = Math.min(100, Math.max(0, (v.currentTime / v.duration) * 100));
        time.value = String(p);
        time.style.setProperty("--p", p + "%");
      }
    };
    v.addEventListener("timeupdate", syncTime);
    v.addEventListener("loadedmetadata", syncTime);

    card.addEventListener("click", () => {
      if (v.paused) v.play().catch(() => { v.muted = true; });
      else v.pause();
    });

    card.append(v, snd, fs, badge, time);
    if (canSetVol) card.append(vol);
    if (playIO) playIO.observe(v);
    return card;
  }

  function createImageCard(item) {
    const card = document.createElement("article");
    card.className = "work";
    const img = document.createElement("img");
    img.src = mediaUrl(item.name);
    img.loading = "lazy";
    img.alt = niceName(item.name);
    card.appendChild(img);
    return card;
  }

  function render(list) {
    grid.innerHTML = "";
    if (!list.length) { emptyBox.hidden = false; return; }
    emptyBox.hidden = true;

    const names = new Set(list.map(x => x.name));
    const videoBases = new Set(
      list.filter(x => VIDEO_EXT.includes(extOf(x.name))).map(x => baseOf(x.name).toLowerCase())
    );

    const cards = [];
    for (const item of list) {
      const ext = extOf(item.name);
      let card = null;

      if (VIDEO_EXT.includes(ext)) {
        const posterName = baseOf(item.name) + ".jpg";
        card = createVideoCard(item, names.has(posterName) ? posterName : null);
      } else if (IMG_EXT.includes(ext)) {
        // .jpg с именем видео — это постер, отдельной карточкой не показываем
        if (["jpg", "jpeg"].includes(ext) && videoBases.has(baseOf(item.name).toLowerCase())) continue;
        card = createImageCard(item);
      } else {
        continue;
      }

      const label = document.createElement("span");
      label.className = "work-label";
      label.textContent = niceName(item.name);
      card.appendChild(label);
      grid.appendChild(card);
      cards.push(card);
    }
    reveal(cards);
  }

  const FALLBACK_LIST = (() => {
    try { return JSON.parse($("#media-list-fallback").textContent); }
    catch (e) { return []; }
  })();

  function renderWithTg(list) {
    return fetch("media_manifest.json?v=" + STAMP, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then(tg => {
        render(list.map(x => {
          const u = tg[x.name];
          return u ? { ...x, tg: typeof u === "string" ? u : u.url } : x;
        }));
      });
  }

  /* Как сайт узнаёт, какие файлы лежат в media/ (по порядку):
     1) листинг папки — работает на локальном сервере и там, где включён autoindex;
     2) media_list.json — его пересобирает update_media.py / update_media.bat;
     3) вшитый список из index.html. */
  const MEDIA_EXT = VIDEO_EXT.concat(IMG_EXT);

  function listFromDir() {
    if (!MEDIA_DIR) return Promise.reject(new Error("no dir"));
    return fetch(MEDIA_DIR, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(html => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const seen = new Set();
        const out = [];
        $$("a[href]", doc).forEach(a => {
          let name = (a.getAttribute("href") || "").split(/[?#]/)[0].split("/").pop();
          try { name = decodeURIComponent(name); } catch (e) { /* оставляем как есть */ }
          if (name && MEDIA_EXT.includes(extOf(name)) && !seen.has(name)) { seen.add(name); out.push({ name }); }
        });
        if (!out.length) throw new Error("empty listing");
        return out.sort((x, y) => x.name.localeCompare(y.name, undefined, { numeric: true }));
      });
  }

  function listFromJson() {
    const ctrl = new AbortController();
    const kill = setTimeout(() => ctrl.abort(), 9000);
    return fetch("media_list.json?nocache=" + Date.now(), { cache: "no-store", signal: ctrl.signal })
      .then(r => { clearTimeout(kill); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }

  listFromDir()
    .catch(() => listFromJson())
    .catch(e => { console.warn("список медиа не загрузился, беру вшитый:", e); return FALLBACK_LIST; })
    .then(list => (list.length ? renderWithTg(list) : (emptyBox.hidden = false)));

  /* ---------- services: карточка тянется за курсором ----------
     Раньше: inline animation:none после первого ухода курсора больше не сбрасывался,
     и вайл переставал работать. Теперь — CSS-переменные, никакого inline-animation. */
  const services = $$(".service");
  if (!prm) {
    services.forEach(s => {
      s.addEventListener("pointermove", e => {
        const r = s.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        s.style.setProperty("--dx", (px * 16).toFixed(1) + "px");
        s.style.setProperty("--dy", (py * 12).toFixed(1) + "px");
        s.style.setProperty("--rz", (px * 3).toFixed(2) + "deg");
      });
      s.addEventListener("pointerleave", () => {
        s.style.setProperty("--dx", "0px");
        s.style.setProperty("--dy", "0px");
        s.style.setProperty("--rz", "0deg");
      });
    });
  }
  reveal(services);

  /* ---------- боковые рейки: скролл = playhead на таймлайне ---------- */
  const tc = $("#timecode");
  const TOTAL_SEC = 90, FPS = 24;
  const pad = n => String(n).padStart(2, "0");
  let ticking = false;
  function updateRails() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const root = document.documentElement.style;
    root.setProperty("--prog", (f * 100).toFixed(2));
    const frames = Math.round(f * TOTAL_SEC * FPS);
    tc.textContent = pad(Math.floor(frames / FPS / 60)) + ":" + pad(Math.floor(frames / FPS) % 60) + ":" + pad(frames % FPS);
  }
  if (!prm) {
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateRails); }
    }, { passive: true });
    window.addEventListener("resize", updateRails);
    updateRails();
  }
})();
