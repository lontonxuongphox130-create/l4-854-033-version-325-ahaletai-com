(() => {
  const toggle = document.querySelector("[data-mobile-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    const activate = (next) => {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, current) => slide.classList.toggle("is-active", current === index));
      dots.forEach((dot, current) => dot.classList.toggle("is-active", current === index));
    };

    dots.forEach((dot, current) => {
      dot.addEventListener("click", () => activate(current));
    });

    window.setInterval(() => activate(index + 1), 5200);
  }

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const filterCards = (root) => {
    const cards = Array.from(root.querySelectorAll("[data-card]"));
    const empty = root.querySelector("[data-empty-state]");
    const searchInput = root.querySelector("[data-local-search], [data-search-input]");
    const typeSelect = root.querySelector("[data-type-filter]");
    const yearSelect = root.querySelector("[data-year-filter]");
    const keyword = normalize(searchInput ? searchInput.value : "");
    const type = normalize(typeSelect ? typeSelect.value : "");
    const year = normalize(yearSelect ? yearSelect.value : "");
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize(card.dataset.title);
      const cardType = normalize(card.dataset.type);
      const cardYear = normalize(card.dataset.year);
      const matchedKeyword = !keyword || text.includes(keyword);
      const matchedType = !type || cardType === type;
      const matchedYear = !year || cardYear === year;
      const show = matchedKeyword && matchedType && matchedYear;
      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  };

  document.querySelectorAll("[data-filter-scope], [data-search-page]").forEach((root) => {
    root.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", () => filterCards(root));
      field.addEventListener("change", () => filterCards(root));
    });
    filterCards(root);
  });

  const searchPage = document.querySelector("[data-search-page]");

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const input = searchPage.querySelector("[data-search-input]");
    const clear = searchPage.querySelector("[data-search-clear]");

    if (input && params.get("q")) {
      input.value = params.get("q");
      filterCards(searchPage);
    }

    searchPage.querySelectorAll("[data-search-chip]").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (input) {
          input.value = chip.dataset.searchChip || chip.textContent || "";
          filterCards(searchPage);
          input.focus();
        }
      });
    });

    if (clear && input) {
      clear.addEventListener("click", () => {
        input.value = "";
        filterCards(searchPage);
        input.focus();
      });
    }
  }
})();
