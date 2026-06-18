(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      body.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-unavailable');
    });
  });

  function fillFilterOptions(cards, selector, attr) {
    var select = document.querySelector(selector);
    if (!select) return;
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attr);
      if (value && values.indexOf(value) === -1) values.push(value);
    });
    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length) return;

    fillFilterOptions(cards, '[data-region-filter]', 'data-region');
    fillFilterOptions(cards, '[data-type-filter]', 'data-type');
    fillFilterOptions(cards, '[data-year-filter]', 'data-year');

    var searchInput = document.querySelector('[data-search-input]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        var matchType = !type || card.getAttribute('data-type') === type;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var shouldShow = matchQuery && matchRegion && matchType && matchYear;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visible += 1;
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
      if (control) control.addEventListener('input', applyFilters);
      if (control) control.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      if (!video || !overlay) return;

      var source = video.getAttribute('data-stream');
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !source) return;
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }

      overlay.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) overlay.classList.remove('is-hidden');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) hls.destroy();
      });
    });
  }

  setupFilters();
  setupPlayers();
})();
