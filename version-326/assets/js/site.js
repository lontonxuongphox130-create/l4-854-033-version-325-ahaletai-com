
(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');

  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilterPanel(panel) {
    var scope = panel.closest('main') || document;
    var search = panel.querySelector('.js-filter-search');
    var year = panel.querySelector('.js-filter-year');
    var type = panel.querySelector('.js-filter-type');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && search) {
      search.value = query;
    }

    function apply() {
      var keyword = normalize(search && search.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var ok = true;

        if (keyword && searchText.indexOf(keyword) === -1) {
          ok = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          ok = false;
        }

        if (selectedType && cardType !== selectedType) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilterPanel);

  function setupPlayer(panel) {
    var video = panel.querySelector('.js-player');
    var button = panel.querySelector('.js-play');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;

    function loadAndPlay() {
      if (!video || !stream) {
        return;
      }

      if (video.getAttribute('data-ready') !== '1') {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }

      panel.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener('play', function () {
        panel.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        panel.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-panel')).forEach(setupPlayer);
})();
