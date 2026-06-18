(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHeaderSearch() {
    var forms = document.querySelectorAll(".top-search");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var dotsWrap = carousel.querySelector("[data-hero-dots]");
    var index = 0;
    var timer = null;

    function render() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        go(1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第" + (i + 1) + "部");
        dot.addEventListener("click", function () {
          index = i;
          render();
          restart();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(1);
        restart();
      });
    }

    render();
    restart();
  }

  function setupFilters() {
    var grid = document.querySelector(".filterable-grid");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var input = document.querySelector(".page-filter-input");
    var yearSelect = document.querySelector(".page-filter-year");
    var typeSelect = document.querySelector(".page-filter-type");
    var empty = document.querySelector(".empty-state");
    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";

    if (input && urlQuery) {
      input.value = urlQuery;
    }

    function apply() {
      var text = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var matchText = !text || haystack.indexOf(text) !== -1;
        var matchYear = !year || (card.getAttribute("data-year") || "").indexOf(year) !== -1;
        var matchType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;
        var visible = matchText && matchYear && matchType;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.bindMoviePlayer = function (source, videoId, triggerId) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    var hls = null;
    var attached = false;

    if (!video || !trigger || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = source;
      attached = true;
    }

    function start() {
      attach();
      trigger.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      trigger.classList.add("is-hidden");
    });
  };

  ready(function () {
    setupMenu();
    setupHeaderSearch();
    setupHero();
    setupFilters();
  });
})();
