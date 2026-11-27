/* ===== The Wedding Party =====
   Bride's side and groom's side, side by side (phones too).
   OPEN ITEM: names, lines and photos below are placeholders.
   To add a real photo: put it in images/party/ and set `photo` to the file
   name (any size; a face-forward portrait works best). Without a photo the
   card shows the person's initials. `ko` is the Korean line (optional). */
(function () {
  var PARTY = {
    bride: [
      { role: "moh", name: "Emma Park", line: "The bride's oldest friend and keeper of every secret.", ko: "신부의 가장 오랜 친구이자 모든 비밀의 지킴이.", photo: "" },
      { role: "bm", name: "Olivia Chen", line: "College roommate who taught the bride to cook.", ko: "신부에게 요리를 가르쳐 준 대학 룸메이트.", photo: "" },
      { role: "bm", name: "Grace Lee", line: "Sister of the bride and official hype woman.", ko: "신부의 동생이자 공식 응원단장.", photo: "" },
      { role: "bm", name: "Sophie Kim", line: "Travel buddy on every spontaneous road trip.", ko: "즉흥 여행의 단골 동행자.", photo: "" },
      { role: "bm", name: "Mia Johnson", line: "First friend the bride made in Los Angeles.", ko: "신부가 LA에서 처음 사귄 친구.", photo: "" },
      { role: "bm", name: "Ava Nguyen", line: "Never misses a birthday, or a chance to dance.", ko: "생일도, 춤출 기회도 절대 놓치지 않는 친구.", photo: "" },
      { role: "bm", name: "Chloe Martin", line: "Coworker turned lifelong friend.", ko: "동료에서 평생 친구가 된 사이.", photo: "" },
      { role: "bm", name: "Hannah Choi", line: "Childhood neighbor, still just down the street.", ko: "어린 시절 이웃, 지금도 가까이 사는 친구.", photo: "" },
    ],
    groom: [
      { role: "best", name: "James Miller", line: "The groom's brother and lifelong partner in crime.", ko: "신랑의 형이자 평생의 단짝.", photo: "" },
      { role: "best", name: "Ethan Brooks", line: "Best friend since the first day of high school.", ko: "고등학교 첫날부터의 절친.", photo: "" },
      { role: "best", name: "Noah Davis", line: "College roommate and the reason the groom runs marathons.", ko: "대학 룸메이트이자 신랑을 마라톤에 빠지게 한 장본인.", photo: "" },
      { role: "best", name: "Lucas Wright", line: "Introduced the couple, and never lets them forget it.", ko: "두 사람을 이어 준 주인공.", photo: "" },
      { role: "gm", name: "Daniel Scott", line: "Cousin of the groom and family DJ.", ko: "신랑의 사촌이자 집안의 DJ.", photo: "" },
      { role: "gm", name: "Ryan Cooper", line: "Teammate from the groom's soccer days.", ko: "신랑의 축구 시절 팀 동료.", photo: "" },
      { role: "gm", name: "Owen Hayes", line: "Ski trip regular and expert grill master.", ko: "스키 여행 단골이자 바비큐 장인.", photo: "" },
      { role: "gm", name: "Henry Clark", line: "Groom's first friend at work.", ko: "신랑의 첫 직장 동료이자 친구.", photo: "" },
      { role: "gm", name: "Leo Turner", line: "Neighbor turned brother.", ko: "이웃에서 형제가 된 친구.", photo: "" },
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

  function render() {
    root.textContent = "";
    var head = document.getElementById("partyHead");
    if (head) {
      head.querySelector(".eyebrow").textContent = t(HEAD.eyebrow);
      head.querySelector("h2").textContent = t(HEAD.title);
    }
    ["bride", "groom"].forEach(function (side) {
      var col = el("div", "party__side party__side--" + side);
      col.appendChild(el("h3", "party__side-title", t(SIDES[side])));
      var list = el("ul", "party__list");
      PARTY[side].forEach(function (p, i) {
        var li = el("li", "party__person");
        var lead = p.role === "moh" || p.role === "best";
        if (lead) li.classList.add("is-lead");
        var fig = el("div", "party__photo");
        // soft, varied tints so placeholder cards don't look identical
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
        list.appendChild(li);
      });
      col.appendChild(list);
      root.appendChild(col);
    });
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
