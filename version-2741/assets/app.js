(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var page = document.querySelector("[data-filter-page]");

    if (!page) {
      return;
    }

    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var sort = document.querySelector("[data-sort]");
    var grid = document.querySelector(".movie-grid");
    var current = "all";

    function filterCards() {
      cards.forEach(function (card) {
        var category = card.getAttribute("data-category") || "";
        var isVisible = current === "all" || category === current;
        card.classList.toggle("hidden-card", !isVisible);
      });
    }

    function sortCards() {
      if (!sort || !grid) {
        return;
      }

      var mode = sort.value;
      var ordered = cards.slice().sort(function (a, b) {
        if (mode === "rating") {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        }

        if (mode === "views") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }

        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      });

      ordered.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        current = button.getAttribute("data-filter") || "all";

        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });

        filterCards();
      });
    });

    if (sort) {
      sort.addEventListener("change", sortCards);
    }

    sortCards();
    filterCards();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector(".search-empty");

    if (!input || cards.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (initial) {
      input.value = initial;
    }

    function run() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var matched = !query || text.indexOf(query) !== -1;
        card.classList.toggle("hidden-card", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", run);
    run();
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearch();
  });
})();
