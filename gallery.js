/* ===== The Proposal: photo strip =====
   Phones: one photo at a time with the next one peeking in; swipe.
   Laptops: a continuous row of photos; scroll, drag or use the arrows.
   To change the photos: put web-sized files in images/proposal/ (1080px wide)
   and list them below in order. A video needs an .mp4 plus a .jpg still with
   the same number (its poster). See images/proposal/README.txt. */
(function () {
  var DIR = "images/proposal/";
  var POST = [
    "1.jpg",
    "2.mp4",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.jpg",
    "8.jpg",
    "9.jpg",
    "10.jpg",
    "11.jpg",
    "12.jpg",
    "13.jpg",
    "14.jpg",
  ];

  var track = document.getElementById("igTrack");
  var dots = document.getElementById("igDots");
  var count = document.getElementById("igCount");
  var live = document.getElementById("igLive");
  var prev = document.getElementById("igPrev");
  var next = document.getElementById("igNext");
  if (!track) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var total = POST.length;
  var index = 0;

  POST.forEach(function (file, i) {
    var base = file.replace(/\.[^.]+$/, "");
    var isVideo = /\.mp4$/i.test(file);
    var alt =
      "Sofia and Blake's proposal, " +
      (isVideo ? "video" : "photo") +
      " " +
      (i + 1) +
      " of " +
      total;
    var slide = document.createElement("div");
    slide.className = "ig__slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", i + 1 + " of " + total);
    if (isVideo) {
      var v = document.createElement("video");
      v.className = "ig__media";
      v.muted = true;
      v.defaultMuted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("muted", "");
      v.preload = "metadata";
      v.poster = DIR + base + ".jpg";
      v.setAttribute("aria-label", alt);
      if (reduceMotion) v.controls = true;
      var src = document.createElement("source");
      src.src = DIR + file;
      src.type = "video/mp4";
      v.appendChild(src);
      // tap to pause / play, like Instagram
      v.addEventListener("click", function () {
        if (reduceMotion) return;
        if (v.paused) {
          v.dataset.userPaused = "";
          v.play().catch(function () {});
        } else {
          v.dataset.userPaused = "1";
          v.pause();
        }
      });
      watchVideo(v);
      slide.appendChild(v);
    } else {
      var img = document.createElement("img");
      img.className = "ig__media";
      img.src = DIR + file;
      img.alt = alt;
      img.width = 1080;
      img.height = 1350;
      img.loading = i < 4 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      slide.appendChild(img);
    }
    track.appendChild(slide);
    if (dots) dots.appendChild(document.createElement("span"));
  });
  var slides = track.children;

  // play a video only while most of it is on screen (works for both layouts,
  // since the strip clips slides that are scrolled out of view)
  function watchVideo(v) {
    if (reduceMotion) return;
    if (!("IntersectionObserver" in window)) {
      v.autoplay = true;
      return;
    }
    new IntersectionObserver(
      function (entries) {
        var on = entries[0].isIntersecting && !document.hidden;
        if (on && !v.dataset.userPaused) v.play().catch(function () {});
        else if (!on) {
          v.pause();
          v.dataset.userPaused = "";
        }
      },
      { threshold: 0.6 },
    ).observe(v);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) return;
    Array.prototype.forEach.call(track.querySelectorAll("video"), function (v) {
      v.pause();
    });
  });

  function slideLeft(i) {
    return slides[i].offsetLeft - slides[0].offsetLeft;
  }
  function nearest() {
    var x = track.scrollLeft;
    var best = 0;
    for (var i = 1; i < total; i++) {
      if (Math.abs(slideLeft(i) - x) < Math.abs(slideLeft(best) - x)) best = i;
    }
    return best;
  }
  function perView() {
    var w = slides[0].getBoundingClientRect().width || 1;
    return Math.max(1, Math.floor((track.clientWidth + 8) / (w + 8)));
  }
  function atEnd() {
    return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    track.scrollTo({
      left: slideLeft(i),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  function update() {
    var i = nearest();
    index = i;
    if (count) count.textContent = i + 1 + "/" + total;
    if (live) live.textContent = slides[i].getAttribute("aria-label");
    if (dots) {
      Array.prototype.forEach.call(dots.children, function (d, k) {
        d.className = k === i ? "is-on" : Math.abs(k - i) > 3 ? "is-far" : "";
      });
    }
    if (prev) prev.hidden = track.scrollLeft <= 4;
    if (next) next.hidden = atEnd();
    // load the photos coming up so scrolling feels instant
    for (var k = i; k < Math.min(total, i + perView() + 2); k++) {
      var m = slides[k].querySelector("img");
      if (m && m.loading === "lazy") m.loading = "eager";
    }
  }

  var queued = false;
  track.addEventListener(
    "scroll",
    function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        update();
      });
    },
    { passive: true },
  );
  // arrows move one screenful on laptops
  if (prev)
    prev.addEventListener("click", function () {
      go(index - perView());
    });
  if (next)
    next.addEventListener("click", function () {
      go(index + perView());
    });
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      go(index + (e.key === "ArrowRight" ? 1 : -1));
    }
  });

  // drag to scroll with a mouse on laptops (touch already swipes)
  var drag = null;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    track.style.scrollSnapType = "none";
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    track.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return;
    var moved = drag.moved;
    drag = null;
    track.style.scrollSnapType = "";
    if (moved) {
      go(nearest());
      // a drag should not also count as a tap on the video
      track.addEventListener(
        "click",
        function (e) {
          e.stopPropagation();
          e.preventDefault();
        },
        { capture: true, once: true },
      );
    }
  });

  window.addEventListener("resize", update);
  update();
})();
