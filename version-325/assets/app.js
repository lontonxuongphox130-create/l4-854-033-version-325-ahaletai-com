(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var box = document.querySelector('.hero-feature-box');
    if (!box) {
      return;
    }
    var items = all('.hero-feature', box);
    if (items.length < 2) {
      return;
    }
    var index = 0;
    window.setInterval(function () {
      items[index].classList.remove('is-active');
      index = (index + 1) % items.length;
      items[index].classList.add('is-active');
    }, 4200);
  }

  function setupFiltering() {
    all('.filter-panel').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('.movie-search');
      var selects = all('.filter-select', panel);
      var list = scope.querySelector('.movie-list');
      if (!list) {
        list = document.querySelector('.movie-list');
      }
      if (!list) {
        return;
      }
      var cards = all('[data-title]', list);
      var empty = scope.querySelector('.no-results');

      function matchValue(card, field, wanted) {
        if (!wanted) {
          return true;
        }
        var value = (card.getAttribute('data-' + field) || '').toLowerCase();
        return value.indexOf(wanted.toLowerCase()) !== -1;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var ok = !keyword || haystack.indexOf(keyword) !== -1;
          selects.forEach(function (select) {
            var field = select.getAttribute('data-filter');
            if (field === 'category') {
              ok = ok && (select.value === '' || haystack.indexOf(select.value.toLowerCase()) !== -1);
            } else {
              ok = ok && matchValue(card, field, select.value);
            }
          });
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  function setupPlayers() {
    all('video[data-stream]').forEach(function (video) {
      var streamUrl = video.getAttribute('data-stream');
      var wrap = video.closest('.player-wrap');
      var overlay = wrap ? wrap.querySelector('.player-overlay') : null;
      var loaded = false;
      var hlsInstance = null;

      function attachStream() {
        if (loaded || !streamUrl) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        attachStream();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
