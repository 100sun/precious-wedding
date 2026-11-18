/* ===== Sofia & Blake — Wedding Site Interactions ===== */

/* ------------------------------------------------------------
   PROPOSAL PHOTOS — to add photos, drop JPGs into images/proposal/
   and list their filenames here, in the order you want them shown.
   A plain filename is enough. For alt text / a caption, use an object:
     { file: "proposal-03.jpg", alt: "Describe the photo", caption: "Optional" }
   Leave the list empty to show the "Photo coming soon" placeholders.
   ------------------------------------------------------------ */
var PROPOSAL_PHOTOS = [
  // "proposal-01.jpg",
  // "proposal-02.jpg",
  // { file: "proposal-03.jpg", alt: "Sofia and Blake on the day of the proposal", caption: "" },
];
var PROPOSAL_DIR = "images/proposal/";
var PLACEHOLDER_COUNT = 6;

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Opening-the-letter intro ---
  var intro = document.getElementById("intro");
  var envelope = document.getElementById("envelope");
  var skipBtn = document.getElementById("introSkip");
  var introState = "idle"; // idle -> open -> done
  var introTimers = [];

  function introLater(fn, ms) {
    introTimers.push(window.setTimeout(fn, ms));
  }
  function finishIntro() {
    if (introState === "done") return;
    introState = "done";
    introTimers.forEach(window.clearTimeout);
    document.body.classList.remove("intro-playing", "is-locked");
    if (intro) intro.classList.add("intro--hidden");
    window.scrollTo(0, 0);
  }
  function openEnvelope() {
    if (introState !== "idle") return;
    introState = "open";
    introTimers.forEach(window.clearTimeout);
    intro.classList.add("intro--open");
    // card slides out, then card scales up while the intro fades
    introLater(function () {
      intro.classList.add("intro--leaving");
      document.body.classList.remove("intro-playing");
    }, 2200);
    introLater(finishIntro, 3200);
  }
  if (intro && envelope) {
    if (reduceMotion) {
      intro.classList.add("intro--hidden");
      introState = "done";
    } else {
      document.body.classList.add("intro-playing", "is-locked");
      envelope.addEventListener("click", openEnvelope);
      // press feedback, and drag upward to break the seal
      var dragY = null;
      envelope.addEventListener("pointerdown", function (e) {
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
      if (skipBtn) skipBtn.addEventListener("click", finishIntro);
      document.addEventListener("keydown", function (e) {
        if (introState !== "done" && e.key === "Escape") finishIntro();
      });
      introLater(openEnvelope, 6000); // auto-open fallback
      envelope.focus({ preventScroll: true });
    }
  }

  // --- Sticky nav styling on scroll ---
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 60) nav.classList.add("nav--scrolled");
    else nav.classList.remove("nav--scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Subtle parallax on hero scene (sun, palms) ---
  var sun = document.querySelector(".hero__sun");
  var palmL = document.querySelector(".palm--left");
  var palmR = document.querySelector(".palm--right");
  if (!reduceMotion && (sun || palmL || palmR)) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          var y = window.scrollY;
          if (sun)
            sun.style.transform =
              "translateX(-50%) translateY(" + y * 0.25 + "px)";
          if (palmL) palmL.style.transform = "translateY(" + y * 0.12 + "px)";
          if (palmR) palmR.style.transform = "translateY(" + y * 0.12 + "px)";
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  // --- Mobile menu toggle ---
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // --- Countdown to the wedding ---
  // August 5, 2027 at 5:00 PM Pacific (UTC-7 during PDT)
  // PLACEHOLDER: the ceremony time is not confirmed yet.
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
  function set(unit, value) {
    var el = cd.querySelector('[data-unit="' + unit + '"]');
    if (el) el.textContent = value < 10 ? "0" + value : String(value);
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
  var RATIOS = [
    [4, 5],
    [1, 1],
    [3, 4],
    [4, 3],
    [2, 3],
    [5, 4],
  ];
  var items = PROPOSAL_PHOTOS.map(function (p, i) {
    var o = typeof p === "string" ? { file: p } : p;
    var r = RATIOS[i % RATIOS.length];
    return {
      src: PROPOSAL_DIR + o.file,
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
    li.className = "gallery__item reveal" + (cls ? " " + cls : "");
    li.style.setProperty("--i", String(i % 6));
    li.appendChild(child);
    gallery.appendChild(li);
    observeReveal(li);
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
      return;
    }
    items.forEach(function (it, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__btn";
      btn.style.aspectRatio = it.w + " / " + it.h;
      btn.setAttribute("aria-label", "View photo " + (i + 1) + " larger");
      var img = document.createElement("img");
      img.src = it.src;
      img.alt = it.alt;
      img.width = it.w * 200;
      img.height = it.h * 200;
      img.loading = "lazy";
      img.decoding = "async";
      img.style.height = "100%";
      img.style.objectFit = "cover";
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

  // --- Photo strip (first photos from the same manifest) ---
  var strip = document.getElementById("strip");
  if (strip) {
    var stripItems = items.slice(0, 6);
    var n = stripItems.length || 5;
    for (var si = 0; si < n; si++) {
      var sli = document.createElement("li");
      sli.className = "strip__item";
      var it0 = stripItems[si];
      if (it0) {
        var sb = document.createElement("button");
        sb.type = "button";
        sb.className = "strip__btn";
        sb.setAttribute("aria-label", "View photo " + (si + 1) + " larger");
        var sim = document.createElement("img");
        sim.src = it0.src;
        sim.alt = it0.alt;
        sim.width = 160;
        sim.height = 200;
        sim.loading = "lazy";
        sim.decoding = "async";
        sb.appendChild(sim);
        sb.addEventListener(
          "click",
          (function (x, b) {
            return function () {
              openLightbox(x, b);
            };
          })(it0, sb),
        );
        sim.addEventListener(
          "error",
          (function (x, li) {
            return function () {
              x.failed = true;
              li.innerHTML = "";
              li.appendChild(placeholderTile(4, 5));
            };
          })(it0, sli),
        );
        sli.appendChild(sb);
      } else {
        sli.appendChild(placeholderTile(4, 5));
      }
      strip.appendChild(sli);
    }
  }

  // --- Add to calendar (all-day until the ceremony time is confirmed) ---
  var EVENT = {
    title: "Sofia & Blake's Wedding",
    start: "20270805",
    end: "20270806", // all-day events end on the next day (exclusive)
    startIso: "2027-08-05",
    endIso: "2027-08-06",
    location:
      "Bel-Air Bay Club, 16801 Pacific Coast Hwy, Pacific Palisades, CA 90272",
    details: "Save the date. Formal invitation to follow.",
  };
  var calGoogle = document.getElementById("calGoogle");
  var calOutlookWeb = document.getElementById("calOutlookWeb");
  if (calGoogle) {
    calGoogle.href =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(EVENT.title) +
      "&dates=" +
      EVENT.start +
      "/" +
      EVENT.end +
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
      EVENT.startIso +
      "&enddt=" +
      EVENT.endIso +
      "&allday=true" +
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
      "DTSTART;VALUE=DATE:" + EVENT.start,
      "DTEND;VALUE=DATE:" + EVENT.end,
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
  var STATIC_WEATHER = { kind: "static", high: 75, low: 63, evening: 66 };
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
    sunsetEl.textContent = sunsetText
      ? "About " + sunsetText + " PT"
      : "Around 7:50 PM PT";
  }
  var weatherCache = null;
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function avg(list) {
    var v = list.filter(function (x) {
      return typeof x === "number";
    });
    if (!v.length) return null;
    return (
      v.reduce(function (s, x) {
        return s + x;
      }, 0) / v.length
    );
  }
  function getJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function eveningTemps(hourly) {
    var out = [];
    hourly.time.forEach(function (t, i) {
      var hr = parseInt(t.slice(11, 13), 10);
      if (hr >= 18 && hr <= 20) out.push(hourly.temperature_2m[i]);
    });
    return out;
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
      "&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles" +
      "&daily=temperature_2m_max,temperature_2m_min&hourly=temperature_2m";
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
        return {
          kind: "forecast",
          high: j.daily.temperature_2m_max[0],
          low: j.daily.temperature_2m_min[0],
          evening: avg(eveningTemps(j.hourly)),
        };
      });
    } else {
      // Archive data lags a few days, so use the last three complete Augusts.
      var now = new Date();
      var last =
        now.getMonth() > 7 || (now.getMonth() === 7 && now.getDate() > 20)
          ? now.getFullYear()
          : now.getFullYear() - 1;
      var years = [last, last - 1, last - 2];
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
        var hi = [];
        var lo = [];
        var ev = [];
        res.forEach(function (j) {
          hi = hi.concat(j.daily.temperature_2m_max);
          lo = lo.concat(j.daily.temperature_2m_min);
          ev = ev.concat(eveningTemps(j.hourly));
        });
        return {
          kind: "typical",
          high: avg(hi),
          low: avg(lo),
          evening: avg(ev),
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
    function f(n) {
      return Math.round(n) + "°F";
    }
    if (w.kind === "forecast") {
      tempLabel.textContent = "Forecast for August 5";
      tempNote.textContent = "Live forecast from Open-Meteo.";
    } else {
      tempLabel.textContent = "Typical for early August";
      tempNote.textContent =
        (w.kind === "typical"
          ? "Average of Aug 1–10 in recent years (Open-Meteo archive), not a forecast. "
          : "Approximate typical conditions, not a forecast. ") +
        "The live forecast will appear within 16 days of the wedding.";
    }
    tempEl.textContent =
      "High " +
      f(w.high) +
      " · Low " +
      f(w.low) +
      (w.evening != null ? " · Evening " + f(w.evening) : "");
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
