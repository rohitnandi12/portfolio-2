document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('project-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const resultsCount = document.getElementById('results-count');
  const emptyState = document.getElementById('empty-state');
  const resetEmptyBtn = document.getElementById('reset-empty-btn');
  const resetFiltersBtn = document.getElementById('reset-filters');
  const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
  const filterSidebar = document.getElementById('filter-sidebar');
  
  const cards = Array.from(document.querySelectorAll('.catalogue-card'));
  const totalCount = cards.length;

  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  const techCheckboxes = document.querySelectorAll('input[name="tech"]');
  const scaleCheckboxes = document.querySelectorAll('input[name="scale"]');
  const allCatCheckbox = document.getElementById('cat-all');

  // Modal elements
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalImg = document.getElementById('modal-img');
  const modalClient = document.getElementById('modal-client');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalTags = document.getElementById('modal-tags');

  // Handle Navbar fixed state on scroll
  const navbar = document.querySelector('.navbar');
  function updateNavbar() {
    if (!navbar) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 50) {
      if (!navbar.classList.contains('is-fixed')) navbar.classList.add('is-fixed');
    } else {
      if (navbar.classList.contains('is-fixed')) navbar.classList.remove('is-fixed');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Handle "All Categories" checkbox toggle logic
  allCatCheckbox.addEventListener('change', () => {
    if (allCatCheckbox.checked) {
      categoryCheckboxes.forEach(cb => {
        if (cb !== allCatCheckbox) cb.checked = false;
      });
    }
    applyFilters();
  });

  categoryCheckboxes.forEach(cb => {
    if (cb !== allCatCheckbox) {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          allCatCheckbox.checked = false;
        } else {
          // If no categories are checked, re-check "All"
          const anyChecked = Array.from(categoryCheckboxes).some(c => c !== allCatCheckbox && c.checked);
          if (!anyChecked) allCatCheckbox.checked = true;
        }
        applyFilters();
      });
    }
  });

  // Handle Tech & Scale Checkboxes
  [...techCheckboxes, ...scaleCheckboxes].forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  // Search input typing
  searchInput.addEventListener('input', () => {
    clearSearchBtn.style.display = searchInput.value.trim() ? 'flex' : 'none';
    applyFilters();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    applyFilters();
  });

  // Reset Filters
  function resetAll() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    allCatCheckbox.checked = true;
    categoryCheckboxes.forEach(cb => {
      if (cb !== allCatCheckbox) cb.checked = false;
    });
    techCheckboxes.forEach(cb => cb.checked = false);
    scaleCheckboxes.forEach(cb => cb.checked = false);
    applyFilters();
  }

  resetFiltersBtn.addEventListener('click', resetAll);
  resetEmptyBtn.addEventListener('click', resetAll);

  // Mobile Filter Drawer Toggle
  if (mobileFilterToggle && filterSidebar) {
    mobileFilterToggle.addEventListener('click', () => {
      filterSidebar.classList.toggle('mobile-open');
      const isOpen = filterSidebar.classList.contains('mobile-open');
      mobileFilterToggle.innerHTML = isOpen 
        ? '✕ Close Filters' 
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Filter Options';
    });
  }

  // Core Filtering Algorithm
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();

    // Selected Categories
    const selectedCats = Array.from(categoryCheckboxes)
      .filter(cb => cb !== allCatCheckbox && cb.checked)
      .map(cb => cb.value);

    // Selected Tech
    const selectedTech = Array.from(techCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // Selected Scale
    const selectedScale = Array.from(scaleCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    let visibleCount = 0;

    cards.forEach(card => {
      const cardCats = (card.dataset.category || '').toLowerCase().split(' ');
      const cardTech = (card.dataset.tech || '').toLowerCase().split(' ');
      const cardScale = (card.dataset.scale || '').toLowerCase().split(' ');
      const cardText = card.textContent.toLowerCase();

      // Check category match
      let matchCat = true;
      if (selectedCats.length > 0) {
        matchCat = selectedCats.some(cat => cardCats.includes(cat));
      }

      // Check tech match
      let matchTech = true;
      if (selectedTech.length > 0) {
        matchTech = selectedTech.some(t => cardTech.includes(t));
      }

      // Check scale match
      let matchScale = true;
      if (selectedScale.length > 0) {
        matchScale = selectedScale.some(s => cardScale.includes(s));
      }

      // Check search query match
      let matchQuery = true;
      if (query) {
        matchQuery = cardText.includes(query);
      }

      const isMatch = matchCat && matchTech && matchScale && matchQuery;

      if (isMatch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update Counter & Empty State
    resultsCount.innerHTML = `Showing <strong>${visibleCount}</strong> of ${totalCount} projects`;
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  // Modal Lightbox functionality
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const client = card.querySelector('.card-client').textContent;
      const title = card.querySelector('.card-title').textContent;
      const desc = card.querySelector('.card-desc').textContent;
      const tags = Array.from(card.querySelectorAll('.card-tags span')).map(t => t.textContent);

      modalImg.src = img.src;
      modalClient.textContent = client;
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modalTags.innerHTML = tags.map(t => `<span>${t}</span>`).join('');

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Handle URL parameters (e.g. ?id=fintech)
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id');
  if (targetId) {
    const targetCard = document.querySelector(`.catalogue-card[data-id="${targetId}"]`);
    if (targetCard) {
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.click();
      }, 300);
    }
  }

  // Initial Filter Run
  applyFilters();
});

