/* invoidhunter — app logic: i18n RU/EN, works grid, reveal-on-scroll */
(() => {
  "use strict";

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
      cta_join: "ПОДПИСАТЬСЯ ➤",
      footer_local: "локальная сборка · хост на этой машине · 127.0.0.1 только",
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
      cta_join: "SUBSCRIBE ➤",
      footer_local: "local build · hosted on this machine · 127.0.0.1 only",
      ticker: "VIDEO EDITING ✦ GAME TRAILERS ✦ ACTION CUTS ✦ SFX ✦ SHORTS & REELS ✦ THUMBNAILS ✦ DAVINCI ✦ BEAT SYNC ✦ "
    }
  };

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n ---------- */
  dbgEarly = function (t) {
    const d = document.getElementById("works-debug");
    if (d) { d.style.display = "block"; d.textContent = t; }
  };
  dbgEarly("app.js: живой, старт");
  let lang = "ru";
  try {
    const saved = localStorage.getItem("ivh-lang");
    lang = saved === "en" || saved === "ru" ? saved : ((navigator.language || "").startsWith("ru") ? "ru" : "en");
  } catch (e) { /* storage may be blocked — default ru */ }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(el => {
      const v = I18N[lang][el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    buildTicker();
    $("#lang-ru").classList.toggle("active", lang === "ru");
    $("#lang-en").classList.toggle("active", lang === "en");
    try { localStorage.setItem("ivh-lang", lang); } catch (e) { /* non-critical */ }
  }

  function buildTicker() {
    const t = I18N[lang].ticker;
    $("#ticker-track").innerHTML = `<span>${t.repeat(2)}</span><span>${t.repeat(2)}</span>`;
  }

  $("#lang-ru").addEventListener("click", () => applyLang("ru"));
  $("#lang-en").addEventListener("click", () => applyLang("en"));
  applyLang(lang);

  /* ---------- footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- works grid ---------- */
  const grid = $("#works-grid");
  const emptyBox = $("#works-empty");
  const VIDEO_EXT = ["mp4", "webm", "mov"];
  const IMG_EXT = ["png", "jpg", "jpeg", "webp", "gif", "svg"];

  function niceName(name) {
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    return base.replace(/[_-]+/g, " ").trim();
  }
  function extOf(name) {
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  }

  function stopAllOtherSound(active) {
    $$(".work video", grid).forEach(v => { if (v !== active) v.muted = true; });
  }

  function render(list) {
    grid.innerHTML = "";
    if (!list.length) { emptyBox.hidden = false; return; }
    emptyBox.hidden = true;

    const names = new Set(list.map(x => x.name));
    // split: video base names (для детекта poster-дублей)
    const videoBases = new Set(list.filter(x => VIDEO_EXT.includes(extOf(x.name)))
      .map(x => x.name.slice(0, x.name.lastIndexOf(".")).toLowerCase()));

    for (const item of list) {
      const ext = extOf(item.name);
      // .jpg с тем же именем, что у видео — это poster-кадр, отдельной карточкой не показываем
      if (IMG_EXT.includes(ext) && ["jpg", "jpeg"].includes(ext)) {
        const base = item.name.slice(0, item.name.lastIndexOf(".")).toLowerCase();
        if (videoBases.has(base)) continue;
      }
      const card = document.createElement("article");
      card.className = "work reveal";

      if (VIDEO_EXT.includes(ext)) {
        const v = document.createElement("video");
        v.src = item.tg || ("media/" + encodeURIComponent(item.name));
        v.preload = "metadata";
        v.loop = true;
        v.muted = true;
        v.playsInline = true;
        // poster: если рядом есть .jpg с тем же базовым именем — фото-кадр вместо чёрного поля
        const dot = item.name.lastIndexOf(".");
        const posterJpg = (dot > 0 ? item.name.slice(0, dot) : item.name) + ".jpg";
        if (names.has(posterJpg)) v.poster = "media/" + encodeURIComponent(posterJpg);
        const snd = document.createElement("button");
        snd.className = "work-sound";
        snd.textContent = "🔊";
        snd.setAttribute("aria-label", "sound");
        snd.style.filter = "grayscale(1) opacity(.55)"; // dim = звук выключен
        v.addEventListener("volumechange", () => {
          snd.style.filter = v.muted ? "grayscale(1) opacity(.55)" : "none";
        });
        snd.addEventListener("click", e => {
          e.stopPropagation();
          v.muted = !v.muted;
          if (!v.muted) {
            stopAllOtherSound(v);
            if (v.paused) v.play().catch(() => {});
          }
        });
        const play = document.createElement("span");
        play.className = "play-badge";
        play.textContent = "▶";
        v.addEventListener("playing", () => { if (!v.dataset.failed) play.classList.add("hide"); });
        v.addEventListener("pause", () => { if (!v.dataset.failed) play.classList.remove("hide"); });
        v.addEventListener("waiting", () => { if (!v.dataset.failed) play.classList.remove("hide"); });
        v.addEventListener("stalled", () => { if (!v.dataset.failed) play.classList.remove("hide"); });
        v.addEventListener("error", () => {
          // ссылка телеги протухла → тихо падаем на локальный файл
          if (item.tg && !v.dataset.tgFallback) {
            v.dataset.tgFallback = "1";
            v.src = "media/" + encodeURIComponent(item.name);
            v.load();
            return;
          }
          v.dataset.failed = "1";
          play.textContent = "⚠";
          play.classList.remove("hide");
          play.classList.add("fail");
        });

        // таймлайн: перемотка назад/вперёд
        const time = document.createElement("input");
        time.type = "range";
        time.className = "vtime";
        time.min = "0"; time.max = "100"; time.step = "0.1"; time.value = "0";
        time.setAttribute("aria-label", "timeline");
        time.style.setProperty("--p", "0%");
        ["pointerdown", "pointermove", "click", "touchstart"].forEach(ev =>
          time.addEventListener(ev, e => e.stopPropagation())); // не паузим видео кликом по полосе
        time.addEventListener("input", () => {
          if (isFinite(v.duration) && v.duration > 0) {
            v.currentTime = (parseFloat(time.value) / 100) * v.duration;
          }
        });
        const syncTime = () => {
          if (isFinite(v.duration) && v.duration > 0) {
            const p = (v.currentTime / v.duration) * 100;
            time.value = String(Math.min(100, Math.max(0, p)));
            time.style.setProperty("--p", time.value + "%");
          }
        };
        v.addEventListener("timeupdate", syncTime);
        v.addEventListener("loadedmetadata", syncTime);

        card.appendChild(v);
        card.appendChild(snd);
        card.appendChild(play);
        card.appendChild(time);
        card.addEventListener("click", () => {
          if (v.paused) {
            v.play().catch(() => { v.muted = true; });
          } else {
            v.pause();
          }
        });
      } else if (IMG_EXT.includes(ext)) {
        const img = document.createElement("img");
        img.src = "media/" + encodeURIComponent(item.name);
        img.loading = "lazy";
        img.alt = niceName(item.name);
        card.appendChild(img);
      } else {
        continue; // unsupported type — skip
      }

      const label = document.createElement("span");
      label.className = "work-label";
      label.textContent = niceName(item.name);
      card.appendChild(label);
      grid.appendChild(card);
    }

    const vids = $$("video", grid);
    if (!prm) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          const v = en.target;
          if (en.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      }, { threshold: 0.35 });
      vids.forEach(v => io.observe(v));
    }
  }

  // fallback: если список с CDN не доехал (кэш провайдера, миг между коммитами) — вшитый минимум
  const FALLBACK_LIST = function () {
    try { return JSON.parse(document.getElementById("media-list-fallback").textContent); }
    catch (e) { return []; }
  }();

  function dbgMsg(t) {
    const d = document.getElementById("works-debug");
    if (!d) return;
    d.textContent = t;
    d.style.display = t ? "block" : "none";
  }

  function renderWithTg(list) {
    return fetch("media_manifest.json")
      .then(r => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then(tg => {
        dbgMsg("");
        render(list.map(x => {
          const u = tg[x.name];
          return u ? { ...x, tg: typeof u === "string" ? u : u.url } : x;
        }));
      });
  }

  // ?nocache=x ломает кэш на пути (провайдерский CDN может держать протухший 404)
  const ctrl = new AbortController();
  const kill = setTimeout(() => ctrl.abort(), 9000);
  dbgMsg("media: загружаю список...");
  fetch("media_list.json?nocache=" + Date.now(), { cache: "no-store", signal: ctrl.signal })
    .then(r => {
      clearTimeout(kill);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(list => renderWithTg(list.length ? list : FALLBACK_LIST))
    .catch(e => {
      if (FALLBACK_LIST.length) { dbgMsg("media: CDN не отдал (" + (e && e.message || e) + "), играю из вшитого"); renderWithTg(FALLBACK_LIST); }
      else { emptyBox.hidden = false; dbgMsg("media_list: " + (e && e.message || e)); }
    });

  window.addEventListener("error", ev => dbgMsg("JS error: " + ev.message + " @" + (ev.filename || "").slice(-24) + ":" + ev.lineno));

  /* ---------- services: мягкий заход и мягкий выход из вайла ---------- */
  $$(".service").forEach(s => {
    s.addEventListener("mouseenter", () => {
      s.style.transition = "";
      s.style.transform = "";
      void s.offsetWidth;
      s.classList.add("swaying");
    });
    s.addEventListener("mouseleave", () => {
      if (!s.classList.contains("swaying")) return;
      s.classList.remove("swaying");
      const matrix = getComputedStyle(s).transform; // замираем там, где была тренировка
      if (!matrix || matrix === "none") return;
      s.style.animation = "none";
      s.style.transform = matrix;
      void s.offsetWidth; // reflow
      s.style.transition = "transform .35s ease"; // плавно докатываемся до места
      s.style.transform = "";
      setTimeout(() => { s.style.transition = ""; s.style.transform = ""; }, 400);
    });
  });

  /* ---------- reveal on scroll ---------- */
  const targets = $$(".section .glass, .work, .service");
  if (prm || !("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(t => io.observe(t));
  }
})();
