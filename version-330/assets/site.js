document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var target = "./search.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("active", index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("active", index === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var localInput = document.querySelector("[data-page-filter]");
    if (localInput) {
        localInput.addEventListener("input", function () {
            filterCards(localInput.value, null, null, null);
        });
    }

    var searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var regionFilter = document.querySelector("[data-filter-region]");
        var typeFilter = document.querySelector("[data-filter-type]");
        var yearFilter = document.querySelector("[data-filter-year]");

        searchInput.value = query;

        var updateSearch = function () {
            filterCards(
                searchInput.value,
                regionFilter ? regionFilter.value : null,
                typeFilter ? typeFilter.value : null,
                yearFilter ? yearFilter.value : null
            );
        };

        searchInput.addEventListener("input", updateSearch);
        [regionFilter, typeFilter, yearFilter].forEach(function (select) {
            if (select) {
                select.addEventListener("change", updateSearch);
            }
        });
        updateSearch();
    }

    document.querySelectorAll("[data-stream-url]").forEach(function (shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-overlay");
        var streamUrl = shell.getAttribute("data-stream-url");
        var started = false;
        var hlsInstance = null;

        var attemptPlay = function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        };

        var start = function () {
            if (!video || !streamUrl) {
                return;
            }
            shell.classList.add("is-playing");
            if (started) {
                attemptPlay();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", attemptPlay, { once: true });
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
            } else {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", attemptPlay, { once: true });
                video.load();
            }
        };

        if (button) {
            button.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    start();
                }
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("is-playing");
            });
        }
    });
});

function filterCards(query, region, type, year) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card"));
    var empty = document.querySelector("[data-empty-result]");
    var normalizedQuery = (query || "").trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchQuery = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
        var matchRegion = !region || cardRegion === region;
        var matchType = !type || cardType === type;
        var matchYear = !year || cardYear === year;
        var show = matchQuery && matchRegion && matchType && matchYear;
        card.hidden = !show;
        if (show) {
            visible += 1;
        }
    });

    if (empty) {
        empty.hidden = visible !== 0;
    }
}
