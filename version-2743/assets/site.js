(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;

    var showSlide = function (nextIndex) {
      index = nextIndex % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 6200);
    }
  }

  var filterInput = document.getElementById('movie-filter');
  var yearFilter = document.getElementById('year-filter');
  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (filterInput && query) {
      filterInput.value = query;
    }

    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

    var applyFilter = function () {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;

        card.classList.toggle('is-hidden', !(matchKeyword && matchYear));
      });
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  var video = document.getElementById('video-player');

  if (video) {
    var shell = video.closest('.video-shell');
    var startButton = document.querySelector('.video-start');
    var source = video.getAttribute('data-stream');
    var hlsInstance = null;

    var loadVideo = function () {
      if (!source || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', '1');
    };

    var beginPlay = function () {
      loadVideo();
      var playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    };

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });

    if (startButton) {
      startButton.addEventListener('click', beginPlay);
    }

    Array.prototype.slice.call(document.querySelectorAll('.episode-button')).forEach(function (button) {
      button.addEventListener('click', function () {
        Array.prototype.slice.call(document.querySelectorAll('.episode-button')).forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        beginPlay();
      });
    });
  }
})();
