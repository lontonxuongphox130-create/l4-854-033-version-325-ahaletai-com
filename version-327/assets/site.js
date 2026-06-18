(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = qs('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var index = 0;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }
  }

  function initPlayer() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-player-start]', player);
      var message = qs('[data-player-message]', player);
      var source = player.getAttribute('data-src');
      var started = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function start() {
        if (!video || !source || started) {
          return;
        }

        started = true;
        setMessage('正在初始化 HLS 播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
          });
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setMessage('播放源已加载，请点击播放器上的播放键。');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('当前网络无法加载该 HLS 播放源，可刷新页面后重试。');
            }
          });
        } else {
          video.src = source;
          setMessage('当前浏览器不支持 HLS.js，已尝试使用原生播放。');
        }

        if (button) {
          button.classList.add('is-hidden');
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
    });
  }

  function initLibraryFilter() {
    var panel = qs('[data-library-filter]');
    var list = qs('[data-filter-list]');

    if (!panel || !list) {
      return;
    }

    var keyword = qs('[data-filter-keyword]', panel);
    var year = qs('[data-filter-year]', panel);
    var type = qs('[data-filter-type]', panel);
    var region = qs('[data-filter-region]', panel);
    var count = qs('[data-filter-count]', panel);
    var cards = qsa('.movie-card', list);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var key = normalize(keyword && keyword.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = true;

        if (key && haystack.indexOf(key) === -1) {
          matched = false;
        }
        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          matched = false;
        }
        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          matched = false;
        }
        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [keyword, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var link = document.createElement('a');
    link.className = 'movie-card-link';
    link.href = movie.url;

    var poster = document.createElement('div');
    poster.className = 'poster-wrap';

    var image = document.createElement('img');
    image.src = movie.cover;
    image.alt = movie.title + '海报';
    image.loading = 'lazy';
    image.onerror = function () {
      image.classList.add('image-missing');
    };

    var badge = document.createElement('span');
    badge.className = 'poster-badge';
    badge.textContent = movie.year || '';

    var chip = document.createElement('span');
    chip.className = 'play-chip';
    chip.textContent = '播放';

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var title = document.createElement('h3');
    title.textContent = movie.title;

    var description = document.createElement('p');
    description.textContent = movie.oneLine || movie.genre || '';

    var meta = document.createElement('div');
    meta.className = 'card-meta';

    var region = document.createElement('span');
    region.textContent = movie.region || '';

    var type = document.createElement('span');
    type.textContent = movie.type || '';

    meta.appendChild(region);
    meta.appendChild(type);
    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(meta);
    poster.appendChild(image);
    poster.appendChild(badge);
    poster.appendChild(chip);
    link.appendChild(poster);
    link.appendChild(body);
    article.appendChild(link);

    return article;
  }

  function initSearchPage() {
    var results = qs('#search-results');
    var summary = qs('[data-search-summary]');
    var input = qs('[data-search-page-input]');

    if (!results || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function render(value) {
      var key = normalize(value).trim();
      results.innerHTML = '';

      if (!key) {
        if (summary) {
          summary.textContent = '请输入关键词开始搜索。';
        }
        return;
      }

      var matched = window.MOVIE_INDEX.filter(function (movie) {
        return normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags
        ].join(' ')).indexOf(key) !== -1;
      }).slice(0, 120);

      if (summary) {
        summary.textContent = '关键词“' + value + '”找到 ' + matched.length + ' 个结果，最多展示前 120 个。';
      }

      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }

    render(query);

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initPlayer();
    initLibraryFilter();
    initSearchPage();
  });
})();
