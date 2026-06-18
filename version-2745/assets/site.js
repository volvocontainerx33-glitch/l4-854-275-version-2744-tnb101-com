(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenus() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }
    var queryInput = panel.querySelector("[data-filter-query]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var empty = document.querySelector("[data-empty-state]");
    var items = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-item]"));

    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var category = normalize(categorySelect && categorySelect.value);
      var visible = 0;

      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-year"),
          item.getAttribute("data-type"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-tags"),
          item.textContent
        ].join(" "));
        var match = true;
        if (query && haystack.indexOf(query) === -1) {
          match = false;
        }
        if (year && normalize(item.getAttribute("data-year")) !== year) {
          match = false;
        }
        if (region && normalize(item.getAttribute("data-region")) !== region) {
          match = false;
        }
        if (type && normalize(item.getAttribute("data-type")) !== type) {
          match = false;
        }
        if (category && normalize(item.getAttribute("data-category")) !== category) {
          match = false;
        }
        item.style.display = match ? "" : "none";
        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [queryInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }
    apply();
  }

  ready(function () {
    setupMenus();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
