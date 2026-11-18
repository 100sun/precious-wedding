/* ===== Sofia & Blake — Wedding Site Interactions ===== */

/* ------------------------------------------------------------
   PROPOSAL PHOTOS — to add photos, drop JPGs into images/proposal/
   and list their filenames here, in the order you want them shown.
   A plain filename is enough. For alt text / a caption, use an object:
     { file: "proposal-03.jpg", alt: "Describe the photo", caption: "Optional" }
   Leave the list empty to show the "Photo coming soon" placeholders.
   ------------------------------------------------------------ */
// Shown in filename order (sorted automatically, so 2.jpg comes before 10.jpg).
// cover.jpg is the hero photo and is not part of the gallery.
// Optional phone-sized copy: put it in images/proposal/sm/ with the same name
// and give both widths (width: original, small: the sm/ copy) so phones load
// the smaller file. See images/proposal/README.txt.
var PROPOSAL_PHOTOS = [
  {
    file: "1.jpg",
    alt: "Sofia and Blake on the day of the proposal",
    width: 1133,
    small: 760,
  },
  {
    file: "2.jpg",
    alt: "Sofia and Blake on the day of the proposal",
    width: 1123,
    small: 760,
  },
  {
    file: "3.jpg",
    alt: "Sofia and Blake on the day of the proposal",
    width: 2000,
    small: 1080,
  },
  {
    file: "4.jpg",
    alt: "Sofia and Blake on the day of the proposal",
    width: 2000,
    small: 1080,
  },
  {
    file: "5.jpg",
    alt: "Sofia and Blake on the day of the proposal",
    width: 1500,
    small: 760,
  },
  {
    file: "6.jpg",
    alt: "Sofia and Blake on the day of the proposal",
    width: 2000,
    small: 1080,
  },
];
var PROPOSAL_DIR = "images/proposal/";
var PLACEHOLDER_COUNT = 6;

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Opening: "You have mail" envelope ---
  // Sealed: page is locked on the envelope. Tap / click / Enter / Space (or a
  // swipe up / scroll) opens it: the seal lifts away, the flap opens, keepsakes
  // rise out, and the names and countdown appear below. Skip jumps ahead.
  var intro = document.getElementById("intro");
  var envelope = document.getElementById("envelope");
  var skipBtn = document.getElementById("introSkip");
  var introState = "sealed"; // sealed -> open

  function openEnvelope() {
    if (introState !== "sealed") return;
    introState = "open";
    intro.classList.remove("intro--press");
    intro.classList.add("intro--open");
    document.body.classList.remove("is-locked");
    envelope.setAttribute("aria-label", "Envelope, opened");
    envelope.setAttribute("aria-disabled", "true");
  }
  if (intro && envelope) {
    document.body.classList.add("is-locked");
    // a tap / click / Enter / Space on the envelope is a user gesture, so the
    // song can start here (Skip opens the site without music)
    envelope.addEventListener("click", function () {
      if (introState !== "sealed") return;
      openEnvelope();
      startMusicOnOpen();
    });
    // press feedback, and drag upward to open
    var dragY = null;
    envelope.addEventListener("pointerdown", function (e) {
      if (introState !== "sealed") return;
      dragY = e.clientY;
      intro.classList.add("intro--press");
    });
    envelope.addEventListener("pointermove", function (e) {
      if (dragY !== null && dragY - e.clientY > 40) {
        dragY = null;
        openEnvelope();
      }
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) {
      envelope.addEventListener(n, function () {
        dragY = null;
        intro.classList.remove("intro--press");
      });
    });
    // trying to scroll the sealed page opens the envelope
    window.addEventListener(
      "wheel",
      function (e) {
        if (introState === "sealed" && e.deltaY > 8) openEnvelope();
      },
      { passive: true },
    );
    if (skipBtn) {
      skipBtn.addEventListener("click", function () {
        openEnvelope();
        var top = document.getElementById("top");
        if (top)
          top.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
    document.addEventListener("keydown", function (e) {
      if (introState === "sealed" && e.key === "Escape") openEnvelope();
    });
  }

  // --- Music: audio/song.mp3 starts when the guest opens the envelope (unless
  // they muted on an earlier visit); the vinyl record pauses / resumes it ---
  var record = document.getElementById("record");
  var recordText = document.getElementById("recordText");
  var muteBtn = document.getElementById("muteBtn");
  var SONG = "audio/song.mp3";
  var MUTE_KEY = "sb-music-muted";
  var VOLUME = 0.3;
  var song = null;
  var fadeTimer = null;
  var muted = false;
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch (e) {}

  function fadeIn() {
    window.clearInterval(fadeTimer);
    song.volume = 0;
    // 0 -> 0.3 over about 2.4 s (iOS ignores volume; it just plays)
    fadeTimer = window.setInterval(function () {
      var v = Math.min(VOLUME, song.volume + VOLUME / 20);
      song.volume = v;
      if (v >= VOLUME) window.clearInterval(fadeTimer);
    }, 120);
  }
  function showMuted() {
    if (!muteBtn) return;
    muteBtn.classList.toggle("is-muted", muted);
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
  }
  function setMuted(m) {
    muted = m;
    if (song) song.muted = m;
    try {
      window.localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch (e) {}
    showMuted();
  }
  function startMusicOnOpen() {
    if (muted) {
      // remembered choice: no music, but keep the unmute button handy
      if (muteBtn && record && !record.disabled) muteBtn.hidden = false;
      return;
    }
    playSong();
  }
  function showPlaying(playing) {
    record.classList.toggle("is-playing", playing);
    record.setAttribute("aria-pressed", playing ? "true" : "false");
    record.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    if (recordText)
      recordText.textContent = playing ? "Tap to pause" : "Tap to play";
  }
  function playSong() {
    if (!song) {
      song = new Audio(SONG);
      song.loop = true;
      song.preload = "auto";
      song.addEventListener("play", function () {
        showPlaying(true);
        if (muteBtn) muteBtn.hidden = false;
      });
      song.addEventListener("pause", function () {
        showPlaying(false);
      });
    }
    song.muted = muted;
    var p;
    try {
      p = song.play();
    } catch (e) {
      return;
    }
    fadeIn();
    if (p && p.catch) {
      p.catch(function () {
        showPlaying(false);
      });
    }
  }
  if (record) {
    record.addEventListener("click", function () {
      if (record.disabled) return;
      if (song && !song.paused) song.pause();
      else {
        // choosing to play on the record counts as unmuting
        if (muted) setMuted(false);
        playSong();
      }
    });
    // only offer the record as a player when the song file is there
    if (window.fetch) {
      fetch(SONG, { method: "HEAD" })
        .then(function (r) {
          var type = r.headers.get("content-type") || "";
          if (r.ok && type.indexOf("text/html") === -1) {
            record.disabled = false;
          }
        })
        .catch(function () {});
    }
  }
  if (muteBtn) {
    showMuted();
    muteBtn.addEventListener("click", function () {
      if (muted) {
        setMuted(false);
        if (!song || song.paused) playSong();
      } else {
        setMuted(true);
      }
    });
  }
  // pause when the page is hidden; the guest resumes from the record
  document.addEventListener("visibilitychange", function () {
    if (song && document.hidden) song.pause();
  });

  // --- Sticky nav: hidden while the opening envelope fills the screen ---
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 60) nav.classList.add("nav--scrolled");
    else nav.classList.remove("nav--scrolled");
    var away = intro && window.scrollY < intro.offsetHeight - 80;
    nav.classList.toggle("nav--away", !!away);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // --- Mobile menu toggle ---
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      // closing the menu reflows the page, so scroll to the section ourselves
      var target = document.getElementById(a.hash.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      if (history.pushState) history.pushState(null, "", a.hash);
    });
  });

  // --- Directions / Add to calendar menus ---
  var openMenu = null; // { btn, list }
  function menuItems(list) {
    return Array.prototype.slice.call(
      list.querySelectorAll('[role="menuitem"]'),
    );
  }
  function closeMenu(returnFocus) {
    if (!openMenu) return;
    var m = openMenu;
    openMenu = null;
    m.list.hidden = true;
    m.btn.setAttribute("aria-expanded", "false");
    if (returnFocus) m.btn.focus();
  }
  document.querySelectorAll('[aria-haspopup="menu"]').forEach(function (btn) {
    var list = document.getElementById(btn.getAttribute("aria-controls"));
    if (!list) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasOpen = openMenu && openMenu.btn === btn;
      closeMenu(false);
      if (wasOpen) return;
      list.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      openMenu = { btn: btn, list: list };
      menuItems(list)[0].focus();
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest('[role="menuitem"]')) closeMenu(true);
    });
    list.addEventListener("keydown", function (e) {
      var items = menuItems(list);
      var i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var step = e.key === "ArrowDown" ? 1 : -1;
        items[(i + step + items.length) % items.length].focus();
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        items[e.key === "Home" ? 0 : items.length - 1].focus();
      } else if (e.key === "Tab") {
        closeMenu(false);
      }
    });
  });
  document.addEventListener("click", function (e) {
    if (openMenu && !openMenu.list.contains(e.target)) closeMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (openMenu && e.key === "Escape") closeMenu(true);
  });

  // --- Countdown to the wedding ---
  // August 5, 2027 at 5:00 PM Pacific (UTC-7 during PDT)
  var target = new Date("2027-08-05T17:00:00-07:00").getTime();
  var cd = document.getElementById("countdown");
  function tick() {
    var now = Date.now();
    var diff = Math.max(0, target - now);
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    set("days", days);
    set("hours", hours);
    set("minutes", minutes);
    set("seconds", seconds);
  }
  // shown as DDD : HH : MM : SS
  function set(unit, value) {
    var el = cd.querySelector('[data-unit="' + unit + '"]');
    var width = unit === "days" ? 3 : 2;
    var text = String(value);
    while (text.length < width) text = "0" + text;
    if (el) el.textContent = text;
  }
  tick();
  setInterval(tick, 1000);

  // --- Reveal on scroll (shared observer, also used by gallery tiles) ---
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
  }
  function observeReveal(el) {
    if (io) io.observe(el);
    else el.classList.add("is-visible");
  }

  // --- Proposal gallery ---
  var gallery = document.getElementById("gallery");
  var galleryNote = document.getElementById("galleryNote");
  // placeholder tiles use one portrait ratio; real photos keep their own shape
  var RATIOS = [[4, 5]];
  var items = PROPOSAL_PHOTOS.map(function (p) {
    return typeof p === "string" ? { file: p } : p;
  })
    .filter(function (o) {
      return o.file !== "cover.jpg";
    })
    .sort(function (a, b) {
      return a.file.localeCompare(b.file, "en", { numeric: true });
    })
    .map(function (o, i) {
      var r = RATIOS[i % RATIOS.length];
      return {
        src: PROPOSAL_DIR + o.file,
        srcset:
          o.width && o.small
            ? PROPOSAL_DIR +
              "sm/" +
              o.file +
              " " +
              o.small +
              "w, " +
              PROPOSAL_DIR +
              o.file +
              " " +
              o.width +
              "w"
            : "",
        alt: o.alt || "Sofia and Blake, proposal photo " + (i + 1),
        caption: o.caption || "",
        w: r[0],
        h: r[1],
        failed: false,
        li: null,
      };
    });

  function placeholderTile(w, h) {
    var d = document.createElement("div");
    d.className = "gallery__ph";
    d.style.aspectRatio = w + " / " + h;
    d.setAttribute("role", "img");
    d.setAttribute("aria-label", "Photo coming soon");
    d.innerHTML = "<span>Photo coming soon</span><small>The Proposal</small>";
    return d;
  }
  function addLi(child, i, cls) {
    var li = document.createElement("li");
    li.className = "gallery__item" + (cls ? " " + cls : "");
    li.setAttribute("aria-roledescription", "slide");
    li.appendChild(child);
    gallery.appendChild(li);
    return li;
  }
  function renderGallery() {
    if (!gallery) return;
    if (!items.length) {
      for (var k = 0; k < PLACEHOLDER_COUNT; k++) {
        var r = RATIOS[k % RATIOS.length];
        addLi(placeholderTile(r[0], r[1]), k, "gallery__item--ph");
      }
      if (galleryNote) galleryNote.hidden = false;
      setupCarousel();
      return;
    }
    items.forEach(function (it, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__btn";
      btn.setAttribute("aria-label", "View photo " + (i + 1) + " larger");
      var img = document.createElement("img");
      if (it.srcset) {
        img.srcset = it.srcset;
        img.sizes = "(min-width: 768px) 640px, 86vw";
      }
      img.src = it.src;
      img.alt = it.alt;
      // the first two slides load right away, the rest as they come near
      img.loading = i < 2 ? "eager" : "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () {
        it.failed = true;
        var ph = placeholderTile(it.w, it.h);
        it.li.replaceChild(ph, btn);
        it.li.classList.add("gallery__item--ph");
      });
      btn.appendChild(img);
      if (it.caption) {
        var cap = document.createElement("span");
        cap.className = "gallery__cap";
        cap.textContent = it.caption;
        btn.appendChild(cap);
      }
      btn.addEventListener("click", function () {
        openLightbox(it, btn);
      });
      it.li = addLi(btn, i);
    });
    setupCarousel();
  }

  // --- Photo carousel: swipe, prev/next buttons, arrow keys, "1 / 6" ---
  var galPrev = document.getElementById("galPrev");
  var galNext = document.getElementById("galNext");
  var galCount = document.getElementById("galCount");
  var galIndex = -1;
  function slides() {
    return gallery.children;
  }
  function slideLeft(el) {
    return el.offsetLeft - (gallery.clientWidth - el.offsetWidth) / 2;
  }
  function currentSlide() {
    var list = slides();
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < list.length; i++) {
      var d = Math.abs(slideLeft(list[i]) - gallery.scrollLeft);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }
  function updateCarousel() {
    var n = slides().length;
    var i = currentSlide();
    if (i === galIndex) return;
    galIndex = i;
    galCount.textContent = i + 1 + " / " + n;
    galPrev.disabled = i === 0;
    galNext.disabled = i === n - 1;
  }
  function goSlide(i) {
    var list = slides();
    if (i < 0 || i >= list.length) return;
    gallery.scrollTo({
      left: slideLeft(list[i]),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }
  function setupCarousel() {
    if (!galPrev || !galNext || !galCount) return;
    var queued = false;
    gallery.addEventListener(
      "scroll",
      function () {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(function () {
          queued = false;
          updateCarousel();
        });
      },
      { passive: true },
    );
    galPrev.addEventListener("click", function () {
      goSlide(currentSlide() - 1);
    });
    galNext.addEventListener("click", function () {
      goSlide(currentSlide() + 1);
    });
    gallery.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        goSlide(currentSlide() + (e.key === "ArrowRight" ? 1 : -1));
      }
    });
    window.addEventListener("resize", function () {
      galIndex = -1;
      updateCarousel();
    });
    updateCarousel();
  }

  // --- Lightbox ---
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var lbList = [];
  var lbIndex = 0;
  var lbTrigger = null;

  function showLb() {
    var it = lbList[lbIndex];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.textContent = it.caption;
    var single = lbList.length < 2;
    lbPrev.hidden = single;
    lbNext.hidden = single;
  }
  function openLightbox(it, trigger) {
    lbList = items.filter(function (x) {
      return !x.failed;
    });
    lbIndex = Math.max(0, lbList.indexOf(it));
    lbTrigger = trigger;
    showLb();
    lb.hidden = false;
    document.body.classList.add("is-locked");
    lbClose.focus();
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true;
    lbImg.removeAttribute("src");
    document.body.classList.remove("is-locked");
    if (lbTrigger) lbTrigger.focus();
  }
  function stepLb(d) {
    if (lbList.length < 2) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    showLb();
  }
  if (lb) {
    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", function () {
      stepLb(-1);
    });
    lbNext.addEventListener("click", function () {
      stepLb(1);
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    // swipe left/right on touch screens
    var swipeX = null;
    var swipeY = null;
    lb.addEventListener(
      "touchstart",
      function (e) {
        swipeX = e.touches[0].clientX;
        swipeY = e.touches[0].clientY;
      },
      { passive: true },
    );
    lb.addEventListener("touchend", function (e) {
      if (swipeX === null) return;
      var dx = e.changedTouches[0].clientX - swipeX;
      var dy = e.changedTouches[0].clientY - swipeY;
      swipeX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        stepLb(dx < 0 ? 1 : -1);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") stepLb(-1);
      else if (e.key === "ArrowRight") stepLb(1);
      else if (e.key === "Tab") {
        // keep focus inside the dialog
        var f = [lbClose, lbPrev, lbNext].filter(function (b) {
          return !b.hidden;
        });
        var first = f[0];
        var last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (f.indexOf(document.activeElement) === -1) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }
  renderGallery();

  // --- Add to calendar: Thursday, August 5, 2027, 5:00 PM to 11:00 PM Pacific (PDT, UTC-7) ---
  var EVENT = {
    title: "Sofia & Blake's Wedding",
    startUtc: "20270806T000000Z",
    endUtc: "20270806T060000Z",
    startIso: "2027-08-05T17:00:00-07:00",
    endIso: "2027-08-05T23:00:00-07:00",
    location:
      "Bel-Air Bay Club, 16801 Pacific Coast Hwy, Pacific Palisades, CA 90272",
    details:
      "Save the date. 5:00 PM to 11:00 PM Pacific. Formal invitation to follow.",
  };
  var calGoogle = document.getElementById("calGoogle");
  var calOutlookWeb = document.getElementById("calOutlookWeb");
  if (calGoogle) {
    calGoogle.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(EVENT.title) +
      "&dates=" +
      EVENT.startUtc +
      "/" +
      EVENT.endUtc +
      "&ctz=America%2FLos_Angeles" +
      "&details=" +
      encodeURIComponent(EVENT.details) +
      "&location=" +
      encodeURIComponent(EVENT.location);
  }
  if (calOutlookWeb) {
    calOutlookWeb.href =
      "https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent" +
      "&subject=" +
      encodeURIComponent(EVENT.title) +
      "&startdt=" +
      encodeURIComponent(EVENT.startIso) +
      "&enddt=" +
      encodeURIComponent(EVENT.endIso) +
      "&body=" +
      encodeURIComponent(EVENT.details) +
      "&location=" +
      encodeURIComponent(EVENT.location);
  }
  function icsEscape(t) {
    return t
      .replace(/\\/g, "\\\\")
      .replace(/[,;]/g, "\\$&")
      .replace(/\n/g, "\\n");
  }
  function downloadIcs() {
    var stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+/, "");
    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sofia and Blake//Save the Date//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:sofia-blake-20270805@save-the-date",
      "DTSTAMP:" + stamp,
      "DTSTART:" + EVENT.startUtc,
      "DTEND:" + EVENT.endUtc,
      "SUMMARY:" + icsEscape(EVENT.title),
      "LOCATION:" + icsEscape(EVENT.location),
      "DESCRIPTION:" + icsEscape(EVENT.details),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "sofia-and-blake-save-the-date.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }
  ["calApple", "calOutlookIcs"].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", downloadIcs);
  });

  // --- Travel: sunset (NOAA solar algorithm) + temperature (Open-Meteo) ---
  var LAT = 34.0359;
  var LON = -118.5517;
  var WED = { y: 2027, m: 8, d: 5 };
  // Quiet fallback if the weather fetch fails: average 5-11 PM high/low for
  // Aug 1-10, 2022-2026, from Open-Meteo archive hourly data (computed Nov 2026).
  var STATIC_WEATHER = { kind: "typical", high: 79, low: 67 };
  var sunsetEl = document.getElementById("sunsetTime");
  var tempEl = document.getElementById("tempValue");
  var tempLabel = document.getElementById("tempLabel");
  var tempNote = document.getElementById("tempNote");
  function rad(x) {
    return (x * Math.PI) / 180;
  }
  function deg(x) {
    return (x * 180) / Math.PI;
  }
  // Sunset in minutes after 00:00 UTC of the given date (NOAA, iterated).
  function sunsetUtcMinutes(y, m, d, lat, lon) {
    var jd0 = Date.UTC(y, m - 1, d) / 86400000 + 2440587.5; // JD at 0h UTC
    var minutes = 720 - 4 * lon + 360; // first guess
    for (var i = 0; i < 3; i++) {
      var t = (jd0 + minutes / 1440 - 2451545) / 36525;
      var L0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
      var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
      var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
      var C =
        Math.sin(rad(M)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
        Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * t) +
        Math.sin(rad(3 * M)) * 0.000289;
      var omega = 125.04 - 1934.136 * t;
      var lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega));
      var eps0 =
        23 +
        (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
      var eps = eps0 + 0.00256 * Math.cos(rad(omega));
      var decl = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
      var yy = Math.tan(rad(eps / 2));
      yy *= yy;
      var eqTime =
        4 *
        deg(
          yy * Math.sin(2 * rad(L0)) -
            2 * e * Math.sin(rad(M)) +
            4 * e * yy * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) -
            0.5 * yy * yy * Math.sin(4 * rad(L0)) -
            1.25 * e * e * Math.sin(2 * rad(M)),
        );
      var ha = deg(
        Math.acos(
          Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(rad(decl))) -
            Math.tan(rad(lat)) * Math.tan(rad(decl)),
        ),
      );
      minutes = 720 - 4 * (lon - ha) - eqTime;
    }
    return minutes;
  }
  if (sunsetEl) {
    var sunsetMs =
      Date.UTC(WED.y, WED.m - 1, WED.d) +
      sunsetUtcMinutes(WED.y, WED.m, WED.d, LAT, LON) * 60000;
    var sunsetText;
    try {
      sunsetText = new Date(sunsetMs).toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (err) {
      sunsetText = null;
    }
    sunsetEl.textContent = sunsetText || "7:50 PM";
  }
  // Weather for the event window, 5:00-11:00 PM Pacific (hours 17-23 inclusive),
  // from Open-Meteo hourly temperature_2m in Fahrenheit:
  // - within the forecast window (about 16 days out): live hourly forecast for Aug 5, 2027
  // - otherwise: archive hourly data for Aug 1-10 of the last 5 complete Augusts;
  //   each day's 5-11 PM max and min are averaged across all days and years.
  //   The archive lags a few days, so an August only counts after Aug 20.
  // Guests only see a short label and the numbers; failures fall back silently.
  var weatherCache = null;
  var EVENT_HOURS = [17, 23];
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function avg(list) {
    if (!list.length) return null;
    return (
      list.reduce(function (sum, x) {
        return sum + x;
      }, 0) / list.length
    );
  }
  function getJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  // Per-day { high, low } over the event hours from an hourly response.
  function eventWindowByDay(hourly) {
    var days = {};
    hourly.time.forEach(function (t, i) {
      var hr = parseInt(t.slice(11, 13), 10);
      var v = hourly.temperature_2m[i];
      if (hr < EVENT_HOURS[0] || hr > EVENT_HOURS[1] || typeof v !== "number")
        return;
      var key = t.slice(0, 10);
      var d = days[key] || (days[key] = { high: v, low: v });
      if (v > d.high) d.high = v;
      if (v < d.low) d.low = v;
    });
    return Object.keys(days).map(function (k) {
      return days[k];
    });
  }
  function loadWeather() {
    if (weatherCache) return Promise.resolve(weatherCache);
    var dateStr = WED.y + "-" + pad2(WED.m) + "-" + pad2(WED.d);
    var daysAhead = (Date.UTC(WED.y, WED.m - 1, WED.d) - Date.now()) / 86400000;
    var common =
      "latitude=" +
      LAT +
      "&longitude=" +
      LON +
      "&hourly=temperature_2m&temperature_unit=fahrenheit" +
      "&timezone=America%2FLos_Angeles";
    var req;
    if (daysAhead > -1 && daysAhead <= 15) {
      req = getJson(
        "https://api.open-meteo.com/v1/forecast?" +
          common +
          "&start_date=" +
          dateStr +
          "&end_date=" +
          dateStr,
      ).then(function (j) {
        var d = eventWindowByDay(j.hourly)[0];
        if (!d) throw new Error("No data");
        return { kind: "forecast", high: d.high, low: d.low };
      });
    } else {
      var now = new Date();
      var last =
        now.getMonth() > 7 || (now.getMonth() === 7 && now.getDate() > 20)
          ? now.getFullYear()
          : now.getFullYear() - 1;
      var years = [last, last - 1, last - 2, last - 3, last - 4];
      req = Promise.all(
        years.map(function (y) {
          return getJson(
            "https://archive-api.open-meteo.com/v1/archive?" +
              common +
              "&start_date=" +
              y +
              "-08-01&end_date=" +
              y +
              "-08-10",
          );
        }),
      ).then(function (res) {
        var days = [];
        res.forEach(function (j) {
          days = days.concat(eventWindowByDay(j.hourly));
        });
        return {
          kind: "typical",
          high: avg(
            days.map(function (d) {
              return d.high;
            }),
          ),
          low: avg(
            days.map(function (d) {
              return d.low;
            }),
          ),
        };
      });
    }
    return req.then(function (w) {
      if (w.high == null || w.low == null) throw new Error("No data");
      weatherCache = w;
      return w;
    });
  }
  function showWeather(w) {
    tempLabel.textContent =
      w.kind === "forecast" ? "Evening forecast" : "Typical evening";
    tempEl.textContent = Math.round(w.high) + "° / " + Math.round(w.low) + "°";
    tempNote.textContent = "";
  }
  if (tempEl && tempLabel && tempNote) {
    if (window.fetch) {
      loadWeather()
        .then(showWeather)
        .catch(function () {
          showWeather(STATIC_WEATHER);
        });
    } else {
      showWeather(STATIC_WEATHER);
    }
  }
  // --- Reveal on scroll (static elements) ---
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (!el.classList.contains("gallery__item")) observeReveal(el);
  });
})();
