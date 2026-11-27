/* ===== Dev-preview features: RSVP, schedule, parking, registry, Korean =====
   Everything marked [data-dev-only] stays hidden for normal visitors.
   It shows on localhost, or in a browser where you opened the site with ?dev=1.
   Turn it off again with ?dev=0. To launch, delete this gate (see README). */
(function () {
  // Apps Script web app URL (see tools/rsvp/README.md). Empty = not connected.
  var RSVP_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzn5Xpi3FxwWerCW2_KNO0fGwWPWdxg_YWnqtD13NstrCGC6A0ua4B2HUYoLeSmiISjOQ/exec";

  var FLAG = "weddingDev";
  var LANG_KEY = "weddingLang";

  function store(k, v) {
    try {
      if (v === null) localStorage.removeItem(k);
      else if (v !== undefined) localStorage.setItem(k, v);
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }

  // --- 1. Dev gate ---
  // Invite-only parts (schedule, RSVP, wedding party, honeymoon fund, Korean)
  // show only on localhost / the local network and under /preview/.
  // The live site never shows them; the old ?dev=1 switch is gone.
  var params = new URLSearchParams(window.location.search);
  store(FLAG, null); // clear any flag left by the old ?dev=1 switch
  var isLocal =
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname) ||
    /^(192\.168|10)\./.test(window.location.hostname);
  // the GitHub Pages copy of feature/rsvp lives under /preview/
  var isPreview = /\/preview\//.test(window.location.pathname);
  if (!isLocal && !isPreview) return;

  // rsvp.css only styles under .is-dev, so live pages are untouched by it
  document.documentElement.classList.add("is-dev");
  document.querySelectorAll("[data-dev-only]").forEach(function (el) {
    el.hidden = false;
  });
  // live wording that the dev preview replaces
  document.querySelectorAll("[data-live-only]").forEach(function (el) {
    el.hidden = true;
  });

  // --- 2. Language ---
  var KO = window.SITE_KO || {};
  var EN = {
    "rsvp.sending": "Sending…",
    "rsvp.thanks": "Thank you. Your RSVP has been received.",
    "rsvp.fund": "Want to help with our honeymoon? →",
    "rsvp.thanksNo": "Thank you for letting us know. We will miss you.",
    "rsvp.fail": "Something went wrong. Please try again in a moment.",
    "rsvp.notReady": "RSVP is not connected yet (no endpoint set).",
    "rsvp.needName": "Please enter your name.",
    "rsvp.thanksParty": "Thank you. Both of your replies have been received.",
    "rsvp.thanksNoParty":
      "Thank you for letting us know. We will miss you both.",
    "rsvp.needAttend": "Please tell us if you can attend.",
    "rsvp.needEntree": "Please choose a dinner.",
    "rsvp.needName2": "Please enter your +1’s name.",
    "rsvp.needAttend2": "Please tell us if your +1 can attend.",
    "rsvp.needEntree2": "Please choose a dinner for your +1.",
    "registry.copied": "Copied",
  };
  var lang = "en";
  var fontsLoaded = false;

  function detectLang() {
    var q = params.get("lang");
    if (q === "ko" || q === "en") return q;
    // ko.html (the Korean share link) always opens in Korean
    var pageDefault =
      document.documentElement.getAttribute("data-default-lang");
    var switched = false;
    try {
      switched = !!sessionStorage.getItem(LANG_KEY);
    } catch (e) {}
    if (pageDefault === "ko" && !switched) return "ko";
    var saved = store(LANG_KEY);
    if (saved === "ko" || saved === "en") return saved;
    var langs = navigator.languages || [navigator.language || ""];
    var tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (e) {}
    var ko =
      langs.some(function (l) {
        return /^ko\b/i.test(l);
      }) || tz === "Asia/Seoul";
    return ko ? "ko" : "en";
  }

  function t(key) {
    return lang === "ko" && KO[key] ? KO[key] : EN[key] || "";
  }

  function loadKoreanFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Gowun+Batang&display=swap";
    document.head.appendChild(l);
    var p = document.createElement("link");
    p.rel = "stylesheet";
    p.href =
      "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
    document.head.appendChild(p);
  }

  // English wording that changes in the dev preview only (live keeps the HTML)
  var EN_DEV = {
    "intro.std": "You’re Invited",
  };

  function translateEl(el) {
    var key = el.getAttribute("data-i18n");
    if (!("en" in el.dataset)) el.dataset.en = el.innerHTML;
    if (lang === "ko" && KO[key]) el.innerHTML = KO[key];
    else el.innerHTML = EN_DEV[key] || el.dataset.en;
  }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = lang;
    if (lang === "ko") loadKoreanFonts();
    document.querySelectorAll("[data-i18n]").forEach(translateEl);
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      if (!("en" in el.dataset)) el.dataset.en = el.getAttribute("placeholder");
      var key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute(
        "placeholder",
        lang === "ko" && KO[key] ? KO[key] : el.dataset.en,
      );
    });
    var btn = document.getElementById("langBtn");
    if (btn) {
      btn.textContent = lang === "ko" ? "English" : "한국어";
      btn.setAttribute(
        "aria-label",
        lang === "ko" ? "Switch to English" : "한국어로 보기",
      );
    }
    store(LANG_KEY, lang);
    if (typeof translateTemp === "function") translateTemp();
    if (typeof convertTemp === "function") convertTemp();
  }

  // the weather label is filled in later by script.js; translate it when it lands
  var tempLabel = document.getElementById("tempLabel");
  var TEMP_KO = {
    "Typical evening": "평균 저녁 기온",
    "Evening forecast": "저녁 예보",
  };
  function translateTemp() {
    if (!tempLabel) return;
    var cur = tempLabel.textContent;
    if (TEMP_KO[cur]) tempLabel.dataset.enTemp = cur; // script.js wrote English
    var en = tempLabel.dataset.enTemp || cur;
    var want = lang === "ko" && TEMP_KO[en] ? TEMP_KO[en] : en;
    if (tempLabel.textContent !== want) tempLabel.textContent = want;
  }
  if (tempLabel && window.MutationObserver) {
    new MutationObserver(translateTemp).observe(tempLabel, { childList: true });
  }

  // temperatures: script.js writes "79° / 67°" in Fahrenheit; Korean shows °C
  var tempValue = document.getElementById("tempValue");
  function toC(f) {
    return Math.round(((f - 32) * 5) / 9);
  }
  function convertTemp() {
    if (!tempValue) return;
    var cur = tempValue.textContent;
    var m = cur.match(/^(-?\d+)°\s*\/\s*(-?\d+)°$/);
    if (m) tempValue.dataset.f = m[1] + "," + m[2]; // script.js wrote °F
    if (!tempValue.dataset.f) return;
    var f = tempValue.dataset.f.split(",").map(Number);
    var want =
      lang === "ko"
        ? toC(f[0]) + "°C / " + toC(f[1]) + "°C"
        : f[0] + "° / " + f[1] + "°";
    if (cur !== want) tempValue.textContent = want;
  }
  if (tempValue && window.MutationObserver) {
    new MutationObserver(convertTemp).observe(tempValue, { childList: true });
  }

  var langBtn = document.getElementById("langBtn");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      try {
        sessionStorage.setItem(LANG_KEY, "1"); // a manual switch wins this visit
      } catch (e) {}
      applyLang(lang === "ko" ? "en" : "ko");
    });
  }
  applyLang(detectLang());

  // --- 3. RSVP form ---
  // One reply per party (1 or 2 guests). Each guest answers on their own;
  // fields are sent as p1_* and p2_* (see tools/rsvp/README.md).
  var form = document.getElementById("rsvpForm");
  if (form) {
    var statusEl = document.getElementById("rsvpStatus");
    var submitBtn = document.getElementById("rsvpSubmit");
    var againBtn = document.getElementById("rsvpAgain");
    var valetHint = document.getElementById("rsvpValet");
    var carBlock = document.getElementById("rsvpCar");
    var person2 = document.getElementById("rsvpPerson2");

    function say(key, isError) {
      statusEl.textContent = t(key);
      statusEl.classList.toggle("is-error", !!isError);
    }
    function val(name) {
      var el = form.elements[name];
      return el && el.value ? el.value.trim() : "";
    }
    function fail(key, el) {
      say(key, true);
      if (el && el.focus) el.focus();
    }
    function size() {
      return val("party") === "2" ? 2 : 1;
    }
    function anyYes() {
      for (var i = 1; i <= size(); i++) {
        if (val("p" + i + "_attending") === "yes") return true;
      }
      return false;
    }

    // show or hide each guest's meal block, the +1 block and the car question
    function refresh() {
      var two = size() === 2;
      person2.hidden = !two;
      document.getElementById("rsvpHead1").hidden = !two;
      document.getElementById("rsvpHead2").hidden = !two;
      for (var i = 1; i <= 2; i++) {
        document.getElementById("rsvpYes" + i).hidden =
          val("p" + i + "_attending") !== "yes" || (i === 2 && !two);
      }
      var cars = anyYes();
      carBlock.hidden = !cars;
      valetHint.hidden = !(cars && val("car") === "yes");
    }
    form.addEventListener("change", refresh);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = size();
      for (var i = 1; i <= n; i++) {
        var p = "p" + i + "_";
        var sfx = i === 2 ? "2" : "";
        if (!val(p + "name"))
          return fail("rsvp.needName" + sfx, form.elements[p + "name"]);
        if (!val(p + "attending")) return fail("rsvp.needAttend" + sfx, null);
        if (val(p + "attending") === "yes" && !val(p + "entree"))
          return fail("rsvp.needEntree" + sfx, null);
      }

      var thanksKey =
        n === 2
          ? anyYes()
            ? "rsvp.thanksParty"
            : "rsvp.thanksNoParty"
          : anyYes()
            ? "rsvp.thanks"
            : "rsvp.thanksNo";
      if (val("website")) {
        // spam trap filled: pretend it worked, send nothing
        say(thanksKey);
        return;
      }
      if (!RSVP_ENDPOINT) {
        say("rsvp.notReady", true);
        if (window.console) console.info("RSVP payload (not sent):", payload());
        return;
      }

      say("rsvp.sending");
      submitBtn.disabled = true;
      fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors", // Apps Script sends no CORS headers; success is not readable
        body: new URLSearchParams(payload()),
      })
        .then(function () {
          say(thanksKey);
          if (anyYes()) addFundLink();
          form.classList.add("is-done");
          againBtn.hidden = false;
        })
        .catch(function () {
          say("rsvp.fail", true);
          submitBtn.disabled = false;
        });
    });

    // after a "yes", a gentle pointer to the honeymoon fund
    function addFundLink() {
      if (!document.getElementById("registry")) return;
      statusEl.appendChild(document.createElement("br"));
      var a = document.createElement("a");
      a.href = "#registry";
      a.className = "rsvp__fund";
      a.textContent = t("rsvp.fund");
      statusEl.appendChild(a);
    }
    function payload() {
      var n = size();
      var out = { party: String(n) };
      for (var i = 1; i <= n; i++) {
        var p = "p" + i + "_";
        var yes = val(p + "attending") === "yes";
        out[p + "name"] = val(p + "name");
        out[p + "attending"] = val(p + "attending");
        out[p + "entree"] = yes ? val(p + "entree") : "";
        out[p + "dietary"] = yes ? val(p + "dietary") : "";
      }
      out.car = anyYes() ? val("car") : "";
      out.lang = lang;
      return out;
    }

    againBtn.addEventListener("click", function () {
      form.reset();
      refresh();
      form.classList.remove("is-done");
      againBtn.hidden = true;
      submitBtn.disabled = false;
      statusEl.textContent = "";
      form.elements.p1_name.focus();
    });
  }

  // --- 4. Copy buttons (honeymoon fund) ---
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {}
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.querySelector("[data-i18n]");
      copyText(btn.getAttribute("data-copy")).then(function () {
        if (!label) return;
        label.textContent =
          lang === "ko" ? KO["registry.copied"] : EN["registry.copied"];
        window.setTimeout(function () {
          translateEl(label);
        }, 1600);
      });
    });
  });
})();
