(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initSearchAreas() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        inputs.forEach(function (input) {
            var targetSelector = input.getAttribute("data-search-input") || "[data-card]";
            var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            var empty = document.querySelector("[data-empty-state]");

            function apply() {
                var query = normalize(input.value);
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("visible", visibleCount === 0);
                }
            }

            input.addEventListener("input", apply);
            apply();
        });
    }

    function initFilterChips() {
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        if (!chips.length) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = chip.getAttribute("data-filter-chip");
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                cards.forEach(function (card) {
                    var type = card.getAttribute("data-filter") || "";
                    card.style.display = value === "all" || type === value ? "" : "none";
                });
            });
        });
    }

    window.setupMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !streamUrl) {
            return;
        }

        var started = false;

        function loadStream() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            loadStream();
            overlay.classList.add("hidden");
            video.setAttribute("controls", "controls");
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    video.setAttribute("controls", "controls");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initSearchAreas();
        initFilterChips();
    });
})();
