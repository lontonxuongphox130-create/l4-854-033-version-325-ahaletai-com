(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var siteNav = document.querySelector("[data-site-nav]");

        if (menuButton && siteNav) {
            menuButton.addEventListener("click", function () {
                siteNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === activeIndex);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === activeIndex);
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                showSlide(position);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var regionFilter = document.querySelector("[data-region-filter]");
        var typeFilter = document.querySelector("[data-type-filter]");
        var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

        function filterCards() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var region = regionFilter ? regionFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";

            searchCards.forEach(function (card) {
                var text = card.getAttribute("data-filter-text") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedRegion = !region || cardRegion === region;
                var matchedType = !type || cardType === type;

                card.classList.toggle("is-hidden-card", !(matchedKeyword && matchedRegion && matchedType));
            });
        }

        if (searchCards.length) {
            if (searchInput) {
                searchInput.addEventListener("input", filterCards);
            }
            if (regionFilter) {
                regionFilter.addEventListener("change", filterCards);
            }
            if (typeFilter) {
                typeFilter.addEventListener("change", filterCards);
            }
        }
    });
}());
