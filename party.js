/* ===== The Wedding Party =====
   Two slides: bride's side and groom's side. Swipe, or tap the tabs.
   OPEN ITEM: names, lines and photos below are placeholders.
   To add a real photo: put it in images/party/ and set `photo` to the file
   name (any size; a face-forward portrait works best). Without a photo the
   card shows the person's initials. `ko` is the Korean line (optional). */
(function () {
  var PARTY = {
    bride: [
      {
        role: "moh",
        name: "Sun Baek",
        line: "The bride's oldest friend and keeper of every secret.",
        ko: "신부의 가장 오랜 친구이자 모든 비밀의 지킴이.",
        photo: "",
      },
      {
        role: "bm",
        name: "Brooke Nicholas",
        line: "College roommate who taught the bride to cook.",
        ko: "신부에게 요리를 가르쳐 준 대학 룸메이트.",
        photo: "",
      },
      {
        role: "bm",
        name: "Chloe Andy",
        line: "Sister of the bride and official hype woman.",
        ko: "신부의 동생이자 공식 응원단장.",
        photo: "",
      },
      {
        role: "bm",
        name: "Hannah Tran",
        line: "Travel buddy on every spontaneous road trip.",
        ko: "즉흥 여행의 단골 동행자.",
        photo: "",
      },
      {
        role: "bm",
        name: "Cheryl Hsiao",
        line: "First friend the bride made in Los Angeles.",
        ko: "신부가 LA에서 처음 사귄 친구.",
        photo: "",
      },
      {
        role: "bm",
        name: "Rachel Nellis",
        line: "Never misses a birthday, or a chance to dance.",
        ko: "생일도, 춤출 기회도 절대 놓치지 않는 친구.",
        photo: "",
      },
      {
        role: "bm",
        name: "Angie Nguyen",
        line: "Coworker turned lifelong friend.",
        ko: "동료에서 평생 친구가 된 사이.",
        photo: "",
      },
      {
        role: "bm",
        name: "Lydia Kim",
        line: "Childhood neighbor, still just down the street.",
        ko: "어린 시절 이웃, 지금도 가까이 사는 친구.",
        photo: "",
      },
    ],
    groom: [
      {
        role: "best",
        name: "Will Nicholas",
        line: "The groom's brother and lifelong partner in crime.",
        ko: "신랑의 형이자 평생의 단짝.",
        photo: "",
      },
      {
        role: "best",
        name: "Jay Patel",
        line: "Best friend since the first day of high school.",
        ko: "고등학교 첫날부터의 절친.",
        photo: "",
      },
      {
        role: "best",
        name: "Ryan Lagon",
        line: "College roommate and the reason the groom runs marathons.",
        ko: "대학 룸메이트이자 신랑을 마라톤에 빠지게 한 장본인.",
        photo: "",
      },
      {
        role: "best",
        name: "Lucas Wright",
        line: "Introduced the couple, and never lets them forget it.",
        ko: "두 사람을 이어 준 주인공.",
        photo: "",
      },
      {
        role: "gm",
        name: "Daniel Scott",
        line: "Cousin of the groom and family DJ.",
        ko: "신랑의 사촌이자 집안의 DJ.",
        photo: "",
      },
      {
        role: "gm",
        name: "Ryan Cooper",
        line: "Teammate from the groom's soccer days.",
        ko: "신랑의 축구 시절 팀 동료.",
        photo: "",
      },
      {
        role: "gm",
        name: "Owen Hayes",
        line: "Ski trip regular and expert grill master.",
        ko: "스키 여행 단골이자 바비큐 장인.",
        photo: "",
      },
      {
        role: "gm",
        name: "Henry Clark",
        line: "Groom's first friend at work.",
        ko: "신랑의 첫 직장 동료이자 친구.",
        photo: "",
      },
      {
        role: "gm",
        name: "Leo Turner",
        line: "Neighbor turned brother.",
        ko: "이웃에서 형제가 된 친구.",
        photo: "",
      },
    ],
  };
  var DIR = "images/party/";
  var TINTS = [
    ["#eaf3fa", "#c9dcea"],
    ["#e4eef7", "#b9cfe2"],
    ["#eef4f9", "#d3e3ef"],
  ];
  var ROLES = {
    moh: ["Maid of Honor", "메이드 오브 아너"],
    bm: ["Bridesmaid", "브라이즈메이드"],
    best: ["Best Man", "베스트맨"],
    gm: ["Groomsman", "그룸즈맨"],
  };
  var SIDES = {
    bride: ["Bride’s Side", "신부 측"],
    groom: ["Groom’s Side", "신랑 측"],
  };
  var HEAD = {
    eyebrow: ["Standing With Us", "함께 서 주는 사람들"],
    title: ["The Wedding Party", "웨딩 파티"],
  };

  var root = document.getElementById("partyGrid");
  if (!root) return;

  function ko() {
    return document.documentElement.lang === "ko";
  }
  function t(pair) {
    return pair[ko() ? 1 : 0];
  }
  function initials(name) {
    return name
      .split(/\s+/)
      .map(function (w) {
        return w.charAt(0);
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // two slides: bride's side, groom's side. Swipe, or tap the tabs.
  var SIDE_KEYS = ["bride", "groom"];
  var current = 0;
  var track = null;
  var tabs = [];

  function person(p, i, side) {
    var li = el("li", "party__person");
    if (p.role === "moh" || p.role === "best") li.classList.add("is-lead");
    var fig = el("div", "party__photo");
    // placeholder tints: three shades of sky blue
    var tint = TINTS[(i + (side === "groom" ? 1 : 0)) % TINTS.length];
    fig.style.setProperty("--tint-a", tint[0]);
    fig.style.setProperty("--tint-b", tint[1]);
    if (p.photo) {
      var img = el("img");
      img.src = DIR + p.photo;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 480;
      img.height = 600;
      img.addEventListener("error", function () {
        fig.removeChild(img);
        fig.appendChild(el("span", "party__initials", initials(p.name)));
      });
      fig.appendChild(img);
    } else {
      fig.appendChild(el("span", "party__initials", initials(p.name)));
    }
    fig.setAttribute("aria-hidden", "true");
    li.appendChild(fig);
    li.appendChild(el("p", "party__role", t(ROLES[p.role])));
    li.appendChild(el("p", "party__name", p.name));
    li.appendChild(el("p", "party__line", ko() && p.ko ? p.ko : p.line));
    return li;
  }

  // the slide area takes the height of the side being shown
  function fitHeight() {
    if (!track || !track.children[current]) return;
    track.style.height = track.children[current].offsetHeight + "px";
  }
  function setActive(i) {
    current = i;
    window.requestAnimationFrame(fitHeight);
    tabs.forEach(function (b, k) {
      b.setAttribute("aria-selected", k === i ? "true" : "false");
      b.tabIndex = k === i ? 0 : -1;
    });
    if (track) {
      Array.prototype.forEach.call(track.children, function (s, k) {
        s.setAttribute("aria-hidden", k === i ? "false" : "true");
        s.inert = k !== i;
      });
    }
  }
  function go(i, instant) {
    i = Math.max(0, Math.min(SIDE_KEYS.length - 1, i));
    track.scrollTo({
      left: i * track.clientWidth,
      behavior: instant || reduceMotion ? "auto" : "smooth",
    });
    setActive(i);
  }

  function render() {
    root.textContent = "";
    tabs = [];
    var head = document.getElementById("partyHead");
    if (head) {
      head.querySelector(".eyebrow").textContent = t(HEAD.eyebrow);
      head.querySelector("h2").textContent = t(HEAD.title);
    }

    var bar = el("div", "party__tabs");
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", t(HEAD.title));
    track = el("div", "party__track");
    SIDE_KEYS.forEach(function (side, k) {
      var b = el("button", "party__tab", t(SIDES[side]));
      b.type = "button";
      b.id = "partyTab-" + side;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", "partySlide-" + side);
      b.addEventListener("click", function () {
        go(k);
      });
      b.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          var n =
            (k + (e.key === "ArrowRight" ? 1 : -1) + SIDE_KEYS.length) %
            SIDE_KEYS.length;
          go(n);
          tabs[n].focus();
        }
      });
      tabs.push(b);
      bar.appendChild(b);

      var slide = el("div", "party__slide");
      slide.id = "partySlide-" + side;
      slide.setAttribute("role", "tabpanel");
      slide.setAttribute("aria-labelledby", b.id);
      var list = el("ul", "party__list");
      PARTY[side].forEach(function (p, i) {
        list.appendChild(person(p, i, side));
      });
      slide.appendChild(list);
      track.appendChild(slide);
    });
    root.appendChild(bar);
    root.appendChild(track);
    root.appendChild(
      el(
        "p",
        "party__hint",
        ko() ? "옆으로 넘겨 보세요" : "Swipe to see the other side",
      ),
    );

    var queued = false;
    track.addEventListener(
      "scroll",
      function () {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(function () {
          queued = false;
          var i = Math.round(track.scrollLeft / (track.clientWidth || 1));
          if (i !== current) setActive(i);
        });
      },
      { passive: true },
    );
    setActive(current);
    // keep the same side after a language switch
    window.requestAnimationFrame(function () {
      track.scrollLeft = current * track.clientWidth;
    });
  }

  render();
  window.addEventListener("resize", function () {
    if (!track) return;
    track.scrollLeft = current * track.clientWidth;
    fitHeight();
  });
  // photos and fonts can change the height after first paint
  window.addEventListener("load", fitHeight);
  // re-render when rsvp.js switches the page language
  if (window.MutationObserver) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  }
})();
