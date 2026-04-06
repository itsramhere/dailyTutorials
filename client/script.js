(() => {
  'use strict';

  /* ========== ELEMENTS ========== */
  const loader = document.querySelector('.loader');
  const loaderPercentage = document.querySelector('.loader-percentage');
  const loaderBar = document.querySelector('.loader-bar');
  const slidesContainer = document.querySelector('.slides-container');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.nav-arrow--prev');
  const nextBtn = document.querySelector('.nav-arrow--next');
  const currentEl = document.querySelector('.page-counter .current');
  const thumbnails = document.querySelectorAll('.thumbnail');

  const TOTAL = slides.length;
  let current = 0;
  let isAnimating = false;
  const ANIMATION_DURATION = 900; // ms — matches CSS transition

  /* ========== LOADING SCREEN ========== */
  function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
      // Accelerate near end
      const increment = progress < 70 ? Math.random() * 4 + 1 : Math.random() * 8 + 3;
      progress = Math.min(progress + increment, 100);
      const rounded = Math.floor(progress);
      loaderPercentage.textContent = `${rounded}%`;
      loaderBar.style.width = `${rounded}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add('hidden');
          // Activate first slide after loader fades
          slides[0].classList.add('active');
        }, 400);
      }
    }, 40);
  }

  /* ========== NAVIGATION ========== */
  function goToSlide(index) {
    if (isAnimating || index === current || index < 0 || index >= TOTAL) return;
    isAnimating = true;

    // Remove active from current slide
    slides[current].classList.remove('active');

    current = index;

    // Move slides container
    slidesContainer.style.transform = `translateX(-${current * 100}%)`;

    // Update counter
    currentEl.textContent = current + 1;

    // Update thumbnails
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === current);
    });

    // Update arrow states
    prevBtn.classList.toggle('disabled', current === 0);
    nextBtn.classList.toggle('disabled', current === TOTAL - 1);

    // Activate new slide after a small delay for the translate to begin
    setTimeout(() => {
      slides[current].classList.add('active');
    }, 100);

    // Reset animating lock
    setTimeout(() => {
      isAnimating = false;
    }, ANIMATION_DURATION);
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function prevSlide() {
    goToSlide(current - 1);
  }

  /* ========== EVENT LISTENERS ========== */
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      prevSlide();
    }
  });

  // Thumbnail clicks
  thumbnails.forEach((thumb, i) => {
    thumb.addEventListener('click', () => goToSlide(i));
  });

  // Mouse wheel / trackpad
  let wheelTimeout = null;
  document.addEventListener('wheel', (e) => {
    if (wheelTimeout) return;
    wheelTimeout = setTimeout(() => {
      wheelTimeout = null;
    }, ANIMATION_DURATION + 100);

    if (e.deltaY > 0 || e.deltaX > 0) {
      nextSlide();
    } else if (e.deltaY < 0 || e.deltaX < 0) {
      prevSlide();
    }
  }, { passive: true });

  // Touch swipe support
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    // Only register horizontal swipes
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) {
        nextSlide();
      } else {
        nextSlide();
        prevSlide();
      }
    }
  }, { passive: true });

  /* ========== INIT ========== */
  // Set initial arrow state
  prevBtn.classList.add('disabled');

  // Set initial thumbnail
  thumbnails[0].classList.add('active');

  // Start loader
  simulateLoading();
})();
