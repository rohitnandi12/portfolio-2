(() => {
  // Configuration
  const FRAME_COUNT = 238;
  const LERP_FACTOR = 0.08; // Buttery smooth easing factor (0.05 - 0.12)
  const getFramePath = (index) =>
    `./ezgif-11e2c1f5c2354685-png-split/ezgif-frame-${String(index).padStart(3, '0')}.png`;

  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  // Preloaded image storage
  const images = new Array(FRAME_COUNT + 1);

  // State
  let targetFrame = 1;
  let currentFrame = 1;
  let lastDrawnFrame = -1;
  let isRunning = false;

  // Resize canvas to match display with devicePixelRatio for crisp rendering
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Force redraw after resizing
    lastDrawnFrame = -1;
    drawFrame(Math.round(currentFrame));
  }

  // Draw image to canvas using "cover" logic (centered, no distortion, fills viewport)
  function drawImageCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Calculate scale to cover canvas
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
    return true;
  }

  // Find nearest loaded frame if current frame is still buffering
  function getNearestLoadedImage(frameIndex) {
    if (images[frameIndex]?.complete && images[frameIndex]?.naturalWidth > 0) {
      return images[frameIndex];
    }

    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = frameIndex - offset;
      if (prev >= 1 && images[prev]?.complete && images[prev]?.naturalWidth > 0) {
        return images[prev];
      }
      const next = frameIndex + offset;
      if (next <= FRAME_COUNT && images[next]?.complete && images[next]?.naturalWidth > 0) {
        return images[next];
      }
    }

    return null;
  }

  // Render a specific frame index
  function drawFrame(frameIndex) {
    const clampedIndex = Math.max(1, Math.min(FRAME_COUNT, frameIndex));
    const img = getNearestLoadedImage(clampedIndex);

    if (img) {
      drawImageCover(img);
      lastDrawnFrame = clampedIndex;
    }
  }

  // Calculate scroll fraction between 0.0 and 1.0
  function getScrollFraction() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return 0;
    return Math.min(Math.max(scrollTop / maxScroll, 0), 1);
  }

  const navbar = document.getElementById('main-navbar') || document.querySelector('.navbar');

  function updateNavbarFixed() {
    if (!navbar) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 50) {
      if (!navbar.classList.contains('is-fixed')) {
        navbar.classList.add('is-fixed');
      }
    } else {
      if (navbar.classList.contains('is-fixed')) {
        navbar.classList.remove('is-fixed');
      }
    }
  }

  // Update target frame from scroll position
  function onScroll() {
    const fraction = getScrollFraction();
    targetFrame = 1 + fraction * (FRAME_COUNT - 1);

    updateNavbarFixed();

    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(renderLoop);
    }
  }

  // Main animation / interpolation loop
  function renderLoop() {
    // Smooth lerp interpolation towards targetFrame
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.005) {
      currentFrame += diff * LERP_FACTOR;
    } else {
      currentFrame = targetFrame;
    }

    const roundedFrame = Math.round(currentFrame);
    if (roundedFrame !== lastDrawnFrame) {
      drawFrame(roundedFrame);
    }

    // Continue loop if still interpolating
    if (Math.abs(targetFrame - currentFrame) > 0.005) {
      requestAnimationFrame(renderLoop);
    } else {
      isRunning = false;
    }
  }

  // Preload all frames
  function preloadImages() {
    // 1. Prioritize loading frame 1 immediately
    const firstImg = new Image();
    firstImg.src = getFramePath(1);
    firstImg.onload = () => {
      images[1] = firstImg;
      resizeCanvas();
      drawFrame(1);
    };
    images[1] = firstImg;

    // 2. Preload remaining frames
    for (let i = 2; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        // If current frame was waiting for this specific frame, redraw
        if (Math.round(currentFrame) === i) {
          drawFrame(i);
        }
      };
      images[i] = img;
    }
  }

  // Initialize
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial setup based on current scroll position
  const initialFraction = getScrollFraction();
  targetFrame = 1 + initialFraction * (FRAME_COUNT - 1);
  currentFrame = targetFrame;

  // Interactive Word Cloud Hover & Proximity Glow Effect
  const cloudContainer = document.getElementById('skills-cloud');
  if (cloudContainer) {
    const cloudWords = cloudContainer.querySelectorAll('.cloud-word');

    cloudContainer.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      cloudWords.forEach(word => {
        // If user is directly hovering the word, let CSS :hover take full precedence
        if (word.matches(':hover')) {
          word.style.transform = '';
          word.style.boxShadow = '';
          return;
        }

        const rect = word.getBoundingClientRect();
        const wordCenterX = rect.left + rect.width / 2;
        const wordCenterY = rect.top + rect.height / 2;

        const dist = Math.hypot(mouseX - wordCenterX, mouseY - wordCenterY);
        const maxDist = 140;

        if (dist < maxDist) {
          const proximity = (1 - dist / maxDist);
          const scale = 1 + proximity * 0.18;
          word.style.transform = `scale(${scale.toFixed(3)}) translateY(-${(proximity * 3).toFixed(1)}px)`;
          word.style.boxShadow = `0 0 ${Math.round(10 + proximity * 25)}px rgba(255, 87, 34, ${(0.25 + proximity * 0.35).toFixed(2)})`;
        } else {
          word.style.transform = '';
          word.style.boxShadow = '';
        }
      });
    });

    cloudContainer.addEventListener('mouseleave', () => {
      cloudWords.forEach(word => {
        word.style.transform = '';
        word.style.boxShadow = '';
      });
    });
  }

  updateNavbarFixed();
  resizeCanvas();
  preloadImages();
})();

// Hamburger menu toggle for mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    document.body.classList.toggle('nav-open');
  });
  // Close menu when a link is clicked (optional)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });
  // Ensure menu is closed on larger screens
  const handleResize = () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
  };
  window.addEventListener('resize', handleResize);
}

// Close button functionality for mobile navigation
const navClose = document.querySelector('.nav-close');
if (navClose && navLinks) {
  navClose.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.classList.remove('nav-open');
  });
}

// Close menu when clicking outside of it
document.addEventListener('click', (e) => {
  if (navLinks && navLinks.classList.contains('open')) {
    if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
  }
});

// Scroll‑to‑top button functionality
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
  // Show button after scrolling down 200px
  const toggleScrollTop = () => {
    if (window.scrollY > 200) {
      scrollTopBtn.style.display = 'flex';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  };
  window.addEventListener('scroll', toggleScrollTop);
  // Click scrolls smoothly to top
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
