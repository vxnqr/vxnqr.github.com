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
      nav_people: "люди",
      nav_reviews: "отзывы",
      nav_about: "о канале",
      hero_l1: "МОНТАЖ",
      hero_l2: "ВИДЕО",
      hero_sub: "Плотный рез без воды. Бит в синхроне, хук в первые три секунды, крафт в каждом кадре.",
      cta_order: "ЗАКАЗАТЬ МОНТАЖ ➤",
      cta_works: "СМОТРЕТЬ РАБОТЫ ↓",
      works_h: "РАБОТЫ",
      works_empty_1: "Пока пусто. Закинь файлы (.mp4 / .webm / .png / .jpg) в папку <b>media</b> рядом с сайтом и обнови страницу.",
      services_h: "УСЛУГИ",
      s1_t: "КЛИПЫ",
      s1_d: "Присылаешь исходники — получаешь готовый ролик: чёткий ритм, чистый звук, ничего лишнего.",
      s1_p: "500 ₽/мин",
      s2_t: "МОНТАЖ ИГР",
      s2_d: "Из твоих записей делаю нарезку с моментами, которые реально хочется пересмотреть.",
      s2_p: "500 ₽/мин",
      s3_t: "ТРЕЙЛЕРЫ",
      s3_d: "Короткое кино из твоего материала: музыка, эффекты и концовка, после которой хочется пересмотреть.",
      s3_p: "500 ₽/мин",
      s4_t: "ПРЕВЬЮ И АВАТАРЫ",
      s4_d: "Картинки для канала: обложки, аватарки, превью — чтобы на тебя кликали, а не пролистывали.",
      s4_p: "500 ₽/мин",
      footer_tag: "Монтаж видео",
      footer_about_h: "О КАНАЛЕ",
      footer_about_d: "InvoidHunter — канал про монтаж видео. Здесь свежие работы и приём заказов: клипы, шортсы, трейлеры, превью. Подпишись и напиши в Telegram — обсудим задачу и сроки.",
      footer_hint: "Новые работы и заказы — в Telegram.",
      cta_join: "ПОДПИСАТЬСЯ ➤",
      ticker: "МОНТАЖ ВИДЕО ✦ ТРЕЙЛЕРЫ ✦ ЭКШН-РЕЗЫ ✦ SFX ✦ ШОРТС И РЕЛЫ ✦ ПРЕВЬЮ ✦ ДАВИНЧИ ✦ СИНХРОН БИТА ✦ ",
      people_h: "ЛЮДИ",
      people_sub: "С кем я работал: каналы, проекты, команды.",
      pe1_t: "Mario Panamera",
      pe1_d: "Моды и контент: ТГ-канал и DC-сервер с модами. 12,4 тыс. подписчиков.",
      pe1_l: "t.me канала",
      pe2_t: "Oleha77",
      pe2_d: "Игровой контент. 231 тыс. подписчиков. С Олегом весело даже без контекста.",
      pe2_l: "t.me/oleha77",
      pe3_t: "keryllon",
      pe3_d: "Majestic RP, промо KERYCH: 50.000$ и Premium. 909 подписчиков.",
      pe3_l: "t.me/keryllon",
      pe4_t: "benzino",
      pe4_d: "Молодая канистра — DC bbenzino. 5,51 тыс. подписчиков.",
      pe4_l: "t.me/benzino24",
      pe5_t: "Апасный Канал",
      pe5_d: "Стримы на твиче, продвижения смешного контента! 3,33 млн подписчиков 293 видео",
      pe5_l: "youtube.com/@apasnayarykatv",
      pe6_t: "Ты и я",
      pe6_d: "Первый заказ — и здесь появится твоя карточка.",
      pe6_l: "Напиши в Telegram",
      reviews_h: "ОТЗЫВЫ",
      reviews_sub: "Что говорят те, кто уже заказывал.",
      reviews_empty: "Отзывов пока нет — стань первым!",
      r_form_h: "ОСТАВИТЬ ОТЗЫВ",
      r_name_ph: "Твоё имя или канал",
      r_stars_aria: "Оценка",
      r_text_ph: "Как прошла работа? Что понравилось, что нет?",
      r_submit: "ОТПРАВИТЬ ➤",
      r_hint: "Текст откроется в Telegram — вставь и отправь. Отзыв появится здесь после модерации.",
      r_clip_ok: "Скопировано — вставь в чат и отправь!",
      r_clip_fail: "Не удалось скопировать — выдели и скопируй текст вручную.",
      r_min_len: "Напиши пару слов — так отзыв живее.",
      r_vote_done: "Спасибо, отзыв отправлен!",
      wr_reviews: "отзывы",
      wr_none: "отзывов пока нет",
      wr_one: "отзыв",
      wr_few: "отзыва",
      wr_many: "отзывов",
      wr_open: "Открыть скриншот",
      wr_close: "Закрыть",
      wr_hint: "Скрины отзывов из Telegram — нажми, чтобы увеличить."
    },
    en: {
      nav_works: "works",
      nav_services: "services",
      nav_people: "people",
      nav_reviews: "reviews",
      nav_about: "about",
      hero_l1: "EDITING",
      hero_l2: "VIDEO",
      hero_sub: "Tight cuts, zero filler. Beat-synced, hooked in the first three seconds, crafted in every frame.",
      cta_order: "ORDER A CUT ➤",
      cta_works: "SEE THE WORKS ↓",
      works_h: "WORKS",
      works_empty_1: "Empty for now. Drop files (.mp4 / .webm / .png / .jpg) into the <b>media</b> folder next to the site and refresh.",
      services_h: "SERVICES",
      s1_t: "CLIPS",
      s1_d: "You send the raw files, you get a finished cut: tight rhythm, clean sound, nothing extra.",
      s1_p: "$6/min",
      s2_t: "GAME EDITS",
      s2_d: "I turn your recordings into a montage with moments people actually rewatch.",
      s2_p: "$6/min",
      s3_t: "TRAILERS",
      s3_d: "A short film out of your footage: music, effects and an ending worth rewatching.",
      s3_p: "$6/min",
      s4_t: "THUMBS & AVATARS",
      s4_d: "Pictures for the channel: covers, avatars, previews — so people click you, not scroll past.",
      s4_p: "$6/min",
      footer_tag: "Video editing",
      footer_about_h: "ABOUT",
      footer_about_d: "InvoidHunter is a channel about video editing. Fresh works and open orders: clips, shorts, trailers, thumbnails. Subscribe and message on Telegram — we'll sort out the task and the timing.",
      footer_hint: "New works and orders — on Telegram.",
      cta_join: "SUBSCRIBE ➤",
      ticker: "VIDEO EDITING ✦ TRAILERS ✦ ACTION CUTS ✦ SFX ✦ SHORTS & REELS ✦ THUMBNAILS ✦ DAVINCI ✦ BEAT SYNC ✦ ",
      people_h: "PEOPLE",
      people_sub: "Channels, projects and teams I've worked with.",
      pe1_t: "Mario Panamera",
      pe1_d: "Mods and content: TG channel and DC mod server. 12.4k subscribers.",
      pe1_l: "channel on t.me",
      pe2_t: "Oleha77",
      pe2_d: "Gaming content. 231k subscribers. Fun even without context.",
      pe2_l: "t.me/oleha77",
      pe3_t: "keryllon",
      pe3_d: "Majestic RP, KERYCH promo: $50k & Premium. 909 subscribers.",
      pe3_l: "t.me/keryllon",
      pe4_t: "benzino",
      pe4_d: "Young canister — DC bbenzino. 5.51k subscribers.",
      pe4_l: "t.me/benzino24",
      pe5_t: "Vadya Forbes",
      pe5_d: "Twitch streams, funny content promotion! 3.33M subscribers, 293 videos",
      pe5_l: "youtube.com/@apasnayarykatv",
      pe6_t: "You and me",
      pe6_d: "Your first order — and your card shows up here.",
      pe6_l: "Message me on Telegram",
      reviews_h: "REVIEWS",
      reviews_sub: "What clients say after working with me.",
      reviews_empty: "No reviews yet — be the first!",
      r_form_h: "LEAVE A REVIEW",
      r_name_ph: "Your name or channel",
      r_stars_aria: "Rating",
      r_text_ph: "How did it go? What did you like, what didn't you?",
      r_submit: "SEND ➤",
      r_hint: "The text opens in Telegram — paste and send. Your review will appear here after moderation.",
      r_clip_ok: "Copied — paste it in the chat and send!",
      r_clip_fail: "Couldn't copy — select and copy the text manually.",
      r_min_len: "Write a few words — the review feels alive.",
      r_vote_done: "Thanks, review sent!",
      wr_reviews: "reviews",
      wr_none: "no reviews yet",
      wr_one: "review",
      wr_few: "reviews",
      wr_many: "reviews",
      wr_open: "Open screenshot",
      wr_close: "Close",
      wr_hint: "Telegram review screenshots — click to enlarge."
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
    $$("[data-i18n-ph]").forEach(el => {               // placeholder'ы формы отзыва
      const v = I18N[lang][el.dataset.i18nPh];
      if (v != null) el.placeholder = v;
    });
    $$("[data-i18n-aria]").forEach(el => {             // aria-метки (звёзды)
      const v = I18N[lang][el.dataset.i18nAria];
      if (v != null) el.setAttribute("aria-label", v);
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

  /* ---------- ЛЮДИ: отзывы-скрины под карточкой + кликабельное открывание ----------
     Источник привязок — people.json:
       { "people": { "<slug из data-key>": { "avatar": "avatars/x.jpg",
                                            "reviews": ["reviews/x/1.jpg"] } } }
     Слаг = атрибут data-key у <article class="person"> в index.html.
     Ключа нет в json — карточка живёт как раньше: статичная аватарка, без отзывов. */
  let peopleData = {};

  function pluralRu(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  function reviewCountLabel(n) {
    if (!n) return t("wr_none");
    if (lang === "ru") return n + " " + pluralRu(n, t("wr_one"), t("wr_few"), t("wr_many"));
    return n + " " + (n === 1 ? t("wr_one") : t("wr_many"));
  }

  const reviewSrc = r => (typeof r === "string" ? r : ((r && (r.src || r.url || r.file)) || ""));
  const reviewList = cfg => (cfg && Array.isArray(cfg.reviews) ? cfg.reviews.map(reviewSrc).filter(Boolean) : []);

  /* ---------- лайтбокс: скрин на весь экран, листается стрелками ---------- */
  let lb = null;
  let lbItems = [];
  let lbIndex = 0;

  function ensureLightbox() {
    if (lb) return lb;

    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");

    const img = document.createElement("img");
    img.className = "lb-img";
    img.alt = "";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "lb-close";
    close.textContent = "\u00d7";
    close.setAttribute("aria-label", t("wr_close"));

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "lb-nav lb-prev";
    prev.textContent = "\u2039";

    const next = document.createElement("button");
    next.type = "button";
    next.className = "lb-nav lb-next";
    next.textContent = "\u203a";

    const counter = document.createElement("span");
    counter.className = "lb-count";

    lb.append(img, prev, next, close, counter);
    lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
    prev.addEventListener("click", e => { e.stopPropagation(); stepLightbox(-1); });
    next.addEventListener("click", e => { e.stopPropagation(); stepLightbox(1); });
    close.addEventListener("click", e => { e.stopPropagation(); closeLightbox(); });

    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") stepLightbox(-1);
      else if (e.key === "ArrowRight") stepLightbox(1);
    });

    document.body.appendChild(lb);
    lb._img = img;
    lb._prev = prev;
    lb._next = next;
    lb._count = counter;
    return lb;
  }

  function paintLightbox() {
    const box = ensureLightbox();
    const src = lbItems[lbIndex];
    if (!src) return;
    box._img.src = src;
    const many = lbItems.length > 1;
    box._prev.hidden = !many;
    box._next.hidden = !many;
    box._count.textContent = many ? (lbIndex + 1) + " / " + lbItems.length : "";
    box._count.hidden = !many;
  }
  function stepLightbox(d) {
    if (lbItems.length < 2) return;
    lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
    paintLightbox();
  }
  function openLightbox(items, index) {
    lbItems = (items || []).filter(Boolean);
    if (!lbItems.length) return;
    lbIndex = Math.max(0, Math.min(index || 0, lbItems.length - 1));
    ensureLightbox().classList.add("open");
    document.body.classList.add("lb-lock");
    paintLightbox();
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("open");
    document.body.classList.remove("lb-lock");
    lb._img.removeAttribute("src");
  }

  /* полоса превью под карточкой человека.
     Битые пути не превращаются в квадрат с alt-текстом: превью снимается с полосы,
     а если не загрузилось ни одно — карточка показывает «отзывов пока нет». */
  function buildPeopleReviews(name, shots) {
    const strip = document.createElement("div");
    strip.className = "person-reviews";

    const showEmpty = () => {
      strip.classList.add("is-empty");
      strip.removeAttribute("aria-label");
      strip.textContent = "";
      const none = document.createElement("span");
      none.className = "pr-none";
      none.textContent = t("wr_none");
      strip.appendChild(none);
    };

    if (!shots.length) { showEmpty(); return strip; }

    let alive = shots.filter(Boolean);   // что реально открывать в лайтбоксе
    strip.setAttribute("aria-label", t("wr_reviews"));

    alive.forEach(src => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pr-shot";
      const img = document.createElement("img");
      img.src = src;
      img.alt = name + " — " + t("wr_one");
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("error", () => {
        alive = alive.filter(s => s !== src);
        btn.remove();
        if (!alive.length) showEmpty();
      }, { once: true });

      btn.appendChild(img);
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(alive, Math.max(0, alive.indexOf(src)));   // клик по скрину = открыть на весь экран
      });
      strip.appendChild(btn);
    });
    return strip;
  }

  function peopleEntry(key) {
    if (!key) return null;
    if (peopleData[key]) return peopleData[key];
    const low = key.toLowerCase();
    const hit = Object.keys(peopleData).find(k => k.toLowerCase() === low);
    return hit ? peopleData[hit] : null;
  }

  function decoratePeople() {
    $$(".person").forEach(card => {
      const key = card.dataset.key;
      if (!key) return;                    // карточка-приглашение «Ты и я» — без отзывов
      const cfg = peopleEntry(key);

      if (cfg && cfg.avatar) {
        const box = $(".p-avatar", card);
        if (box) {
          const old = $("img", box);
          if (old) old.remove();
          const img = document.createElement("img");
          img.src = cfg.avatar;
          img.alt = "";
          img.loading = "lazy";
          img.decoding = "async";
          img.addEventListener("error", () => img.remove()); // файла нет — остаётся инициал
          box.appendChild(img);
        }
      }

      const shots = reviewList(cfg);
      const name = ($("h3", card) || {}).textContent || key || "";
      card.appendChild(buildPeopleReviews(name, shots));
      card.classList.toggle("has-reviews", shots.length > 0);
    });
  }

  const FALLBACK_PEOPLE = (() => {
    const el = $("#people-fallback");
    if (!el) return {};
    try { return JSON.parse(el.textContent) || {}; }
    catch (e) { return {}; }
  })();

  fetch("people.json?v=" + STAMP, { cache: "no-store" })
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null)
    .then(j => {
      peopleData = (j && j.people && typeof j.people === "object") ? j.people : FALLBACK_PEOPLE;
      decoratePeople();
    });

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

  /* ---------- люди: та же реакция карточек, что у услуг ---------- */
  const people = $$(".person");
  if (!prm) {
    people.forEach(s => {
      s.addEventListener("pointermove", e => {
        const r = s.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
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
  reveal(people);

  /* ---------- отзывы живут только под карточками людей (people.json) ----------
     Отдельной секции и формы на странице нет: скрины добавляются вручную. */
  const t = key => (I18N[lang] && I18N[lang][key]) || I18N.ru[key];

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
