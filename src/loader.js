export function runPreloader(onComplete) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    const loader = document.getElementById('preloader');
    if (loader) loader.remove();
    document.body.classList.remove('is-loading');
    onComplete();
    return;
  }

  const counter = document.getElementById('preCounter');
  const bar     = document.getElementById('preBar');
  const loader  = document.getElementById('preloader');
  const status  = document.getElementById('preStatus');

  // Live clock ticking
  function updateClock() {
    const clockEl = document.getElementById('preClock');
    if (!clockEl) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }

  const startTime = performance.now();
  const duration = 3200; // 3.2 seconds count up

  function update() {
    const now = performance.now();
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);

    // Easing: fast -> slow -> fast
    // p + 0.12 * sin(2 * pi * p)
    const easedP = progress + 0.12 * Math.sin(2 * Math.PI * progress);
    const val = Math.min(100, Math.floor(easedP * 100));
    
    if (counter) {
      counter.textContent = String(val).padStart(3, '0');
    }
    if (bar) {
      bar.style.width = val + '%';
    }

    // Status text cycles
    let statusTxt = 'Initialising';
    if (progress >= 0.9) {
      statusTxt = 'Welcome';
    } else if (progress >= 0.7) {
      statusTxt = 'Rendering world';
    } else if (progress >= 0.45) {
      statusTxt = 'Compiling';
    } else if (progress >= 0.25) {
      statusTxt = 'Loading assets';
    }
    if (status) {
      status.textContent = statusTxt;
    }

    updateClock();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);

  // At 3600ms (3200ms count + 400ms pause) -> start split curtain exit
  setTimeout(() => {
    if (loader) {
      loader.classList.add('split-active');
    }
  }, 3600);

  // At 4450ms (3600ms + 850ms duration) -> preloader unmounts
  setTimeout(() => {
    if (loader) {
      loader.remove();
    }
    document.body.classList.remove('is-loading');
    onComplete();
  }, 4450);
}
