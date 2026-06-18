(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
    });
  });

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function setupFilter(panel) {
    var input = panel.querySelector("[data-filter-input]");
    var select = panel.querySelector("[data-filter-select]");
    var scope = panel.parentElement || document;
    var items = Array.prototype.slice.call(
      scope.querySelectorAll("[data-search-item]"),
    );
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = normalize(select ? select.value : "");

      items.forEach(function (item) {
        var haystack = normalize(
          [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-year"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-category"),
            item.textContent,
          ].join(" "),
        );
        var itemYear = normalize(item.getAttribute("data-year"));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || itemYear === year;
        item.style.display = matchedKeyword && matchedYear ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    if (select) {
      select.addEventListener("change", apply);
    }

    apply();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(setupFilter);

  function setupHero(carousel) {
    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll(".hero-slide"),
    );
    var dotsWrap = carousel.querySelector("[data-hero-dots]");
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function render(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      if (dotsWrap) {
        Array.prototype.slice
          .call(dotsWrap.children)
          .forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
          });
      }
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        render(current + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第" + (index + 1) + "屏");
        dot.addEventListener("click", function () {
          render(index);
          schedule();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        render(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        render(current + 1);
        schedule();
      });
    }

    render(0);
    schedule();
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(setupHero);

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var stream = player.getAttribute("data-stream");
    var hlsInstance = null;
    var ready = false;

    if (!video || !stream) {
      return;
    }

    function bind() {
      if (ready) {
        return;
      }

      ready = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = stream;
      video.load();
    }

    function play() {
      bind();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(setupPlayer);
})();
