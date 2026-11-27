/* ===== The Wedding Party =====
   Two rows: bride's side, then groom's side; swipe each row sideways.
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
        line: "The bride's sister, best friend for life, and the designer behind our wedding. The best gift from our parents.",
        ko: "신부의 자매이자 평생의 단짝, 그리고 우리 결혼식을 디자인한 사람. 부모님이 주신 최고의 선물.",
        photo: "",
      },
      {
        role: "bm",
        name: "Brooke Nicholas",
        line: "The groom's sister, and soon the bride's sister-in-law.",
        ko: "신랑의 자매이자 곧 신부의 시누이.",
        photo: "",
      },
      {
        role: "bm",
        name: "Chloe Andy",
        line: "The sweetest heart in any room.",
        ko: "누구보다 다정한 마음을 가진 친구.",
        photo: "",
      },
      {
        role: "bm",
        name: "Hannah Tran",
        line: "Our hype woman and the most fun at every party.",
        ko: "언제나 분위기를 띄우는 응원단장이자 파티의 주인공.",
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
        name: "Ryan Langon",
        line: "College roommate and the reason the groom runs marathons.",
        ko: "대학 룸메이트이자 신랑을 마라톤에 빠지게 한 장본인.",
        photo: "",
      },
      {
        role: "best",
        name: "Andrew Bach",
        line: "Introduced the couple, and never lets them forget it.",
        ko: "두 사람을 이어 준 주인공.",
        photo: "",
      },
      {
        role: "gm",
        name: "Parker Lum",
        line: "Cousin of the groom and family DJ.",
        ko: "신랑의 사촌이자 집안의 DJ.",
        photo: "",
      },
      {
        role: "gm",
        name: "Sam Holden",
        line: "Teammate from the groom's soccer days.",
        ko: "신랑의 축구 시절 팀 동료.",
        photo: "",
      },
      {
        role: "gm",
        name: "Christian Holt",
        line: "Ski trip regular and expert grill master.",
        ko: "스키 여행 단골이자 바비큐 장인.",
        photo: "",
      },
      {
        role: "gm",
        name: "Kevin Davison",
        line: "Groom's first friend at work.",
        ko: "신랑의 첫 직장 동료이자 친구.",
        photo: "",
      },
      {
        role: "gm",
        name: "Jack",
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
    moh: ["Maid of Honor", "주 들러리"],
    bm: ["Bridesmaid", "들러리"],
    best: ["Best Man", "주 들러리"],
    gm: ["Groomsman", "들러리"],
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

  // Two rows: bride's side on top, groom's side below; swipe each row.
  var SIDE_KEYS = ["bride", "groom"];

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

  function render() {
    root.textContent = "";
    var head = document.getElementById("partyHead");
    if (head) {
      head.querySelector(".eyebrow").textContent = t(HEAD.eyebrow);
      head.querySelector("h2").textContent = t(HEAD.title);
    }

    var wrap = el("div", "party__track");
    SIDE_KEYS.forEach(function (side) {
      var panel = el("div", "party__slide party__slide--" + side);
      var h = el("h3", "party__side-title", t(SIDES[side]));
      h.id = "partyTitle-" + side;
      panel.appendChild(h);
      var list = el("ul", "party__list");
      list.tabIndex = 0;
      list.setAttribute("aria-labelledby", h.id);
      PARTY[side].forEach(function (p, i) {
        list.appendChild(person(p, i, side));
      });
      panel.appendChild(list);

      // round arrows (laptops); phones swipe
      var navs = {};
      ["prev", "next"].forEach(function (dir) {
        var nb = el("button", "party__nav party__nav--" + dir);
        nb.type = "button";
        nb.setAttribute("aria-label", dir === "prev" ? "Previous" : "Next");
        nb.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' +
          (dir === "prev" ? "M14.5 6l-6 6 6 6" : "M9.5 6l6 6-6 6") +
          '" /></svg>';
        nb.addEventListener("click", function () {
          var card = list.firstElementChild;
          var step = card
            ? card.getBoundingClientRect().width + 14
            : list.clientWidth;
          list.scrollBy({
            left: (dir === "prev" ? -1 : 1) * step,
            behavior: reduceMotion ? "auto" : "smooth",
          });
        });
        navs[dir] = nb;
        panel.appendChild(nb);
      });
      function arrows() {
        var max = list.scrollWidth - list.clientWidth - 4;
        navs.prev.hidden = list.scrollLeft <= 4;
        navs.next.hidden = list.scrollLeft >= max;
      }
      list.addEventListener("scroll", arrows, { passive: true });
      window.addEventListener("resize", arrows);
      window.requestAnimationFrame(arrows);
      list.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          navs[e.key === "ArrowRight" ? "next" : "prev"].click();
        }
      });

      wrap.appendChild(panel);
    });
    root.appendChild(wrap);
    root.appendChild(
      el("p", "party__hint", ko() ? "옆으로 넘겨 보세요" : "Swipe to see everyone"),
    );
  }

  render();
  // re-render when rsvp.js switches the page language
  if (window.MutationObserver) {
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  }
})();
