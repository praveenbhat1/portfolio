import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

let isTiltActive = false;

/**
 * Text scramble / decode reveal — the signature intro from the reference video.
 * Cycles each glyph through random characters, then locks them in left-to-right.
 */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&@*';

function scrambleReveal(el, duration = 900) {
  if (!el) return;
  const finalText = el.dataset.text || el.textContent;
  el.dataset.text = finalText;
  const len = finalText.length;
  const start = performance.now();

  function frame(now) {
    const p = Math.min(1, (now - start) / duration);
    const resolved = Math.floor(p * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (ch === ' ' || i < resolved) {
        out += ch;
      } else {
        out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      }
    }
    el.textContent = out;
    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      el.textContent = finalText;
    }
  }
  requestAnimationFrame(frame);
}

export function initHero() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelector('.nav-bar').classList.add('show');
    document.querySelector('.bg-initials').classList.add('show');
    document.querySelector('.hero-tag').classList.add('show');
    document.querySelectorAll('.hero-heading .line').forEach(el => el.classList.add('show'));
    document.querySelector('.hero-sub').classList.add('show');
    document.querySelector('.hero-cta-row').classList.add('show');
    document.querySelector('.hero-stats').classList.add('show');
    document.querySelector('.char-img-wrap').classList.add('show');
    document.querySelector('.code-float').classList.add('show');
    document.querySelectorAll('.float-tag').forEach(el => el.classList.add('show'));
    document.querySelector('.spark-icon').classList.add('show');

    // Count stats up immediately
    document.querySelectorAll('.stat-num[data-target]').forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });

    initParticles();
    initParallax();
    initMagneticButtons();
    initCharTilt();
    initTypewriter(0);
    return;
  }

  // 1. Curtains fully gone (4450ms from load) -> reveal nav-bar & bg-initials immediately (0ms delay)
  setTimeout(() => {
    document.querySelector('.nav-bar').classList.add('show');
    document.querySelector('.bg-initials').classList.add('show');
  }, 0);

  // 2. Character starts rising (4550ms from load) -> 100ms relative delay
  setTimeout(() => {
    document.querySelector('.char-img-wrap').classList.add('show');
  }, 100);

  // Activate tilt interaction precisely after character rise animation finishes (5650ms from load -> 1200ms relative delay)
  setTimeout(() => {
    isTiltActive = true;
    const charWrapEl = document.getElementById('charWrap');
    if (charWrapEl) charWrapEl.classList.add('active');
  }, 1200);

  // 3. Staggered Hero text / elements after character is fully in place (5650ms from load)
  // - "AVAILABLE FOR WORK" pill (5950ms from load) -> 1500ms relative delay
  setTimeout(() => {
    document.querySelector('.hero-tag').classList.add('show');
  }, 1500);

  // - Heading Line 1 (6150ms from load) -> 1700ms relative delay
  setTimeout(() => {
    document.querySelector('.h-praveen').classList.add('show');
    scrambleReveal(document.querySelector('.h-praveen span'), 850);
  }, 1700);

  // - Heading Line 2 (6300ms from load) -> 1850ms relative delay
  setTimeout(() => {
    document.querySelector('.h-bhat').classList.add('show');
    scrambleReveal(document.querySelector('.h-bhat span'), 950);
  }, 1850);

  // - Heading Line 3 + Typewriter start (6450ms from load) -> 2000ms relative delay
  setTimeout(() => {
    document.querySelector('.h-developer').classList.add('show');
    initTypewriter(0);
  }, 2000);

  // - Heading Line 4 (6600ms from load) -> 2150ms relative delay
  setTimeout(() => {
    document.querySelector('.h-portfolio').classList.add('show');
  }, 2150);

  // - Subtitle paragraph (6750ms from load) -> 2300ms relative delay
  setTimeout(() => {
    document.querySelector('.hero-sub').classList.add('show');
  }, 2300);

  // - CTA buttons (6950ms from load) -> 2500ms relative delay
  setTimeout(() => {
    document.querySelector('.hero-cta-row').classList.add('show');
  }, 2500);

  // - Code snippet card (7050ms from load) -> 2600ms relative delay
  setTimeout(() => {
    document.querySelector('.code-float').classList.add('show');
  }, 2600);

  // - Stats row count up (7150ms from load) -> 2700ms relative delay
  setTimeout(() => {
    document.querySelector('.hero-stats').classList.add('show');
    animateCounters();
  }, 2700);

  // - Floating skill badges pop in (staggered 0.1s each, delay 7250ms from load) -> 2800ms relative delay
  setTimeout(() => {
    const badges = document.querySelectorAll('.float-tag');
    badges.forEach((badge, idx) => {
      setTimeout(() => {
        badge.classList.add('show');
        setTimeout(() => {
          badge.classList.add(`float-loop-${idx + 1}`);
        }, 500);
      }, idx * 100);
    });
    document.querySelector('.spark-icon').classList.add('show');
  }, 2800);

  // Initialize all interactive effects
  initParticles();
  initParallax();
  initMagneticButtons();
  initCharTilt();
}


/** 2. Canvas Particles Background drifting and drawing connections */
function initParticles() {
  const canvas = document.getElementById('heroParticles')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let w = (canvas.width = canvas.offsetWidth)
  let h = (canvas.height = canvas.offsetHeight)

  window.addEventListener('resize', () => {
    w = (canvas.width = canvas.offsetWidth)
    h = (canvas.height = canvas.offsetHeight)
  })

  const particles = []
  const count = 60
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5
    })
  }

  // Pause the particle field when the hero is scrolled out of view
  let heroVisible = true
  const heroEl = document.getElementById('hero')
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting
    }, { threshold: 0 }).observe(heroEl)
  }

  function animate() {
    requestAnimationFrame(animate)

    if (!heroVisible) return

    ctx.clearRect(0, 0, w, h)

    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fill()
    })

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const p1 = particles[i]
        const p2 = particles[j]
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          const alpha = (1 - dist / 120) * 0.05
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }
  }

  animate()
}


/** 4. Scroll-based Parallax — hooks into Lenis for smooth scroll sync */
function initParallax() {
  function update(scrollY) {
    gsap.set('.bg-initials', { y: scrollY * 0.1 })
    gsap.set('.char-img',    { y: scrollY * 0.25 })
    gsap.set('.float-tag',   { y: scrollY * 0.4 })
    gsap.set('.char-glow',   { y: scrollY * 0.18 })
  }

  // Hook into Lenis if available, otherwise fall back to native scroll
  if (window.lenis) {
    window.lenis.on('scroll', ({ scroll }) => update(scroll))
  } else {
    window.addEventListener('scroll', () => update(window.scrollY), { passive: true })
  }
}

/** 5. Custom Cursor with LERP (smooth lag) */
export function initCursor() {
  const dot = document.getElementById('cursorDot')
  if (!dot) return

  let mx = 0, my = 0
  let cx = 0, cy = 0

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX
    my = e.clientY
  })

  function animateCursor() {
    cx += (mx - cx) * 0.15 // lerp 0.15
    cy += (my - cy) * 0.15
    gsap.set(dot, { x: cx, y: cy })
    requestAnimationFrame(animateCursor)
  }
  animateCursor()

  const hoverTargets = document.querySelectorAll(
    'a, button, .nav-cta, .cta-primary, .cta-ghost, .nav-links a'
  )
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hover')
    })
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hover')
    })
  })
}

/** 6. Magnetic CTA buttons (within 60px, elastic spring back) */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.cta-primary, .cta-ghost, .nav-cta')

  buttons.forEach(btn => {
    document.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect()
      const btnX = rect.left + rect.width / 2
      const btnY = rect.top + rect.height / 2

      const dx = e.clientX - btnX
      const dy = e.clientY - btnY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 60) {
        const angle = Math.atan2(dy, dx)
        const intensity = (1 - dist / 60) * 10 // max 10px translate
        const tx = Math.cos(angle) * intensity
        const ty = Math.sin(angle) * intensity

        gsap.to(btn, {
          x: tx,
          y: ty,
          duration: 0.2,
          overwrite: 'auto'
        })
      }
    })

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.3)',
        overwrite: 'auto'
      })
    })
  })
}

/** 7. IntersectionObserver stat counter animation */
function initStatsObserver() {
  const statsSection = document.querySelector('.hero-stats')
  if (!statsSection) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters()
        observer.unobserve(entry.target) // Trigger only once
      }
    })
  }, { threshold: 0.1 })

  observer.observe(statsSection)
}

function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10)
    const suffix = el.dataset.suffix || ''
    const obj = { val: 0 }

    gsap.to(obj, {
      val: target,
      duration: 1.5, // 1.5s animation duration
      ease: 'power2.out', // easeOut curve
      onUpdate() {
        el.textContent = Math.round(obj.val) + suffix
      }
    })
  })
}

/** 8. 3D Tilt Effect and Cursor-Following Spotlight on Character Wrap */
function initCharTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const hero = document.getElementById('hero');
  const charWrap = document.getElementById('charWrap');
  if (!hero || !charWrap) return;

  const charImgWrap = charWrap.querySelector('.char-img-wrap');
  const charGlare = document.getElementById('charGlare');
  const heroBgBlob = document.getElementById('heroBgBlob');
  const badgeWraps = document.querySelectorAll('.badge-parallax-wrap');
  const codeFloatWrap = document.getElementById('codeFloatWrap');

  if (!charImgWrap) return;

  const state = {
    // Current interpolated values
    char: { rotateX: 0, rotateY: 0, translateX: 0 },
    blob: { translateX: 0, translateY: 0 },
    code: { translateX: 0, translateY: 0 },
    badges: { translateX: 0, translateY: 0 },
    glare: { x: 225, y: 275, opacity: 0 },
    // Target values
    target: {
      mouseX: 0,
      mouseY: 0,
      rotateX: 0,
      rotateY: 0,
      glareX: 225,
      glareY: 275,
      glareOpacity: 0
    }
  };

  let lastInputTime = Date.now();
  let isMouseOver = false;

  // LERP helper
  function lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  // Handle Mouse Move
  function handleMouseMove(e) {
    if (!isTiltActive) return;
    isMouseOver = true;
    lastInputTime = Date.now();

    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const normX = mouseX / (rect.width / 2);
    const normY = mouseY / (rect.height / 2);

    state.target.mouseX = mouseX;
    state.target.mouseY = mouseY;
    state.target.rotateY = normX * 12;
    state.target.rotateX = -normY * 8;

    // Glare positioning relative to character img wrap
    const charRect = charImgWrap.getBoundingClientRect();
    state.target.glareX = e.clientX - charRect.left;
    state.target.glareY = e.clientY - charRect.top;
    state.target.glareOpacity = 1;
  }

  // Handle Mouse Leave
  function handleMouseLeave() {
    isMouseOver = false;
    // When mouse leaves, reset targets to 0
    state.target.mouseX = 0;
    state.target.mouseY = 0;
    state.target.rotateX = 0;
    state.target.rotateY = 0;
    state.target.glareOpacity = 0;
  }

  hero.addEventListener('mousemove', handleMouseMove);
  hero.addEventListener('mouseleave', handleMouseLeave);

  // Device Orientation for mobile
  window.addEventListener('deviceorientation', (e) => {
    if (!isTiltActive) return;
    if (e.beta === null || e.gamma === null) return;

    lastInputTime = Date.now();

    const baseBeta = 45;
    const baseGamma = 0;

    const diffBeta = e.beta - baseBeta;
    const diffGamma = e.gamma - baseGamma;

    const normX = Math.max(-1, Math.min(1, diffGamma / 20));
    const normY = Math.max(-1, Math.min(1, diffBeta / 20));

    state.target.mouseX = normX * 100;
    state.target.mouseY = normY * 100;
    state.target.rotateY = normX * 12;
    state.target.rotateX = -normY * 8;

    state.target.glareX = 225 + normX * 100;
    state.target.glareY = 275 + normY * 120;
    state.target.glareOpacity = 0.5;
  });

  // RAF Tick loop
  // Pause the (fairly heavy) tilt/glare interpolation when the hero is off-screen
  let heroInView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      heroInView = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }

  function tick() {
    requestAnimationFrame(tick);

    if (!heroInView) return;

    const now = Date.now();
    const isIdle = (now - lastInputTime) > 3000;

    if (isIdle) {
      // Breathing oscillation
      const time = now * 0.0015; // Speed multiplier for breathing
      state.target.rotateX = Math.sin(time) * 1.5;
      state.target.rotateY = Math.cos(time * 0.8) * 2.0;
      state.target.mouseX = Math.cos(time * 0.5) * 25;
      state.target.mouseY = Math.sin(time * 0.5) * 15;
      
      // Glare breathing
      state.target.glareX = 225 + Math.cos(time) * 35;
      state.target.glareY = 275 + Math.sin(time) * 35;
      state.target.glareOpacity = 0.25;
    }

    const lerpFast = 0.08;
    const lerpSlow = 0.06;
    const lerpGlare = 0.15;

    // Interpolations
    state.char.rotateX = lerp(state.char.rotateX, state.target.rotateX, lerpFast);
    state.char.rotateY = lerp(state.char.rotateY, state.target.rotateY, lerpFast);
    state.char.translateX = lerp(state.char.translateX, state.target.mouseX * 0.02, lerpFast);

    state.blob.translateX = lerp(state.blob.translateX, state.target.mouseX * 0.01, lerpFast);
    state.blob.translateY = lerp(state.blob.translateY, state.target.mouseY * 0.01, lerpFast);

    if (codeFloatWrap) {
      state.code.translateX = lerp(state.code.translateX, state.target.mouseX * 0.03, lerpFast);
      state.code.translateY = lerp(state.code.translateY, state.target.mouseY * 0.02, lerpFast);
    }

    const targetBadgeX = state.target.mouseX * 0.045 + (state.target.rotateY * 2.5);
    const targetBadgeY = state.target.mouseY * -0.03 + (state.target.rotateX * -2.5);
    state.badges.translateX = lerp(state.badges.translateX, targetBadgeX, lerpSlow);
    state.badges.translateY = lerp(state.badges.translateY, targetBadgeY, lerpSlow);

    state.glare.x = lerp(state.glare.x, state.target.glareX, lerpGlare);
    state.glare.y = lerp(state.glare.y, state.target.glareY, lerpGlare);
    state.glare.opacity = lerp(state.glare.opacity, state.target.glareOpacity, lerpFast);

    // Write DOM Styles
    if (isTiltActive) {
      charImgWrap.style.transform = `perspective(900px) rotateX(${state.char.rotateX.toFixed(3)}deg) rotateY(${state.char.rotateY.toFixed(3)}deg) scale(1.03)`;
      
      if (charGlare) {
        if (isMouseOver || isIdle) {
          charGlare.classList.add('active');
          charGlare.style.background = `radial-gradient(circle 135px at ${state.glare.x.toFixed(1)}px ${state.glare.y.toFixed(1)}px, rgba(255, 255, 255, 0.15) 0%, transparent 100%)`;
          charGlare.style.opacity = state.glare.opacity.toFixed(3);
        } else {
          charGlare.classList.remove('active');
          charGlare.style.opacity = '';
        }
      }
    }

    // Apply translations
    charWrap.style.transform = `translate3d(${state.char.translateX.toFixed(2)}px, 0, 0)`;

    if (heroBgBlob) {
      heroBgBlob.style.transform = `translate(-50%, -50%) translate3d(${state.blob.translateX.toFixed(2)}px, ${state.blob.translateY.toFixed(2)}px, 0)`;
    }

    if (codeFloatWrap) {
      codeFloatWrap.style.transform = `translate3d(${state.code.translateX.toFixed(2)}px, ${state.code.translateY.toFixed(2)}px, 0)`;
    }

    badgeWraps.forEach(badge => {
      badge.style.transform = `translate3d(${state.badges.translateX.toFixed(2)}px, ${state.badges.translateY.toFixed(2)}px, 0)`;
    });
  }

  requestAnimationFrame(tick);
}

/** 9. Typewriter Effect for Hero Heading */
function initTypewriter(delayStart = 2200) {
  const target = document.getElementById('typewriter')
  if (!target) return

  const words = ["Developer", "UI Engineer", "Motion Designer", "React Dev"]
  let wordIndex = 0
  let charIndex = words[0].length
  let isDeleting = false
  let delay = 2000

  function type() {
    const currentWord = words[wordIndex]
    
    if (isDeleting) {
      charIndex--
      delay = 60 // backspacing speed
    } else {
      charIndex++
      delay = 120 // typing speed
    }

    target.textContent = currentWord.substring(0, charIndex)

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true
      delay = 2000 // wait 2s when fully typed
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      wordIndex = (wordIndex + 1) % words.length
      delay = 400 // pause before starting next word
    }

    setTimeout(type, delay)
  }

  // Delay starting the typewriter until the entrance animations are complete
  setTimeout(type, delayStart)
}
