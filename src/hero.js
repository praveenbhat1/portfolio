import gsap from 'gsap'
import { prefersReducedMotion } from './utils/motion.js'
import { qs, qsa, show, showAll } from './utils/dom.js'

let isTiltActive = false

/**
 * Text scramble / decode reveal — the signature intro.
 * Cycles each glyph through random characters, then locks them in left-to-right.
 */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&@*'

function scrambleReveal(el, duration = 900) {
  if (!el) return
  const finalText = el.dataset.text || el.textContent
  el.dataset.text = finalText
  const len = finalText.length
  const start = performance.now()

  function frame(now) {
    const p = Math.min(1, (now - start) / duration)
    const resolved = Math.floor(p * len)
    let out = ''
    for (let i = 0; i < len; i++) {
      const ch = finalText[i]
      if (ch === ' ' || i < resolved) {
        out += ch
      } else {
        out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
      }
    }
    el.textContent = out
    if (p < 1) {
      requestAnimationFrame(frame)
    } else {
      el.textContent = finalText
    }
  }
  requestAnimationFrame(frame)
}

/**
 * The hero entrance, as data rather than a dozen hand-tuned setTimeouts.
 *
 * `at` is milliseconds from the moment the preloader hands over — no longer
 * coupled to a hardcoded "4450ms from load" in loader.js. Reduced-motion runs
 * the exact same list with every delay collapsed to zero, so the two paths can
 * never drift apart the way they used to.
 */
function entranceSequence() {
  return [
    { at: 0, reveal: ['.nav-bar', '.bg-initials'] },
    { at: 100, reveal: ['.char-img-wrap'] },
    { at: 1200, run: activateTilt },
    { at: 1500, reveal: ['.hero-tag'] },
    {
      at: 1700,
      reveal: ['.h-praveen'],
      run: () => scrambleReveal(qs('.h-praveen span'), 850),
    },
    {
      at: 1850,
      reveal: ['.h-bhat'],
      run: () => scrambleReveal(qs('.h-bhat span'), 950),
    },
    { at: 2000, reveal: ['.h-developer'], run: () => initTypewriter(0) },
    { at: 2150, reveal: ['.h-portfolio'] },
    { at: 2300, reveal: ['.hero-sub'] },
    { at: 2500, reveal: ['.hero-cta-row'] },
    { at: 2600, reveal: ['.code-float'] },
    { at: 2700, reveal: ['.hero-stats'] },
    { at: 2800, reveal: ['.spark-icon'], run: revealBadges },
  ]
}

function activateTilt() {
  isTiltActive = true
  show('#charWrap', 'active')
}

function revealBadges() {
  qsa('.float-tag').forEach((badge, idx) => {
    setTimeout(() => {
      badge.classList.add('show')
      setTimeout(() => badge.classList.add(`float-loop-${idx + 1}`), 500)
    }, idx * 100)
  })
}

export function initHero() {
  const reduced = prefersReducedMotion()

  entranceSequence().forEach((step) => {
    const apply = () => {
      // `show` is null-safe: a renamed class is now a no-op instead of a
      // TypeError that took out the rest of init.
      if (step.reveal) step.reveal.forEach((selector) => show(selector, 'show'))
      if (step.run) step.run()
    }
    if (reduced) apply()
    else setTimeout(apply, step.at)
  })

  if (reduced) {
    // Badges are revealed without the per-badge stagger or the float loop.
    showAll('.float-tag', 'show')
    // Typewriter cycling is motion too — leave the static fallback word.
    const typer = qs('#typewriter')
    if (typer) typer.classList.add('is-static')
  }

  initParticles()
  initParallax()
  initMagneticButtons()
  initCharTilt()
  initStatsObserver()
}

/** Canvas particle field with proximity links. */
function initParticles() {
  const canvas = qs('#heroParticles')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const reduced = prefersReducedMotion()

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  let w = 0
  let h = 0

  function resize() {
    w = canvas.offsetWidth
    h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const count = 60
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1.5,
  }))

  function draw() {
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    particles.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.lineWidth = 0.8
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
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 120) * 0.05})`
          ctx.stroke()
        }
      }
    }
  }

  // Reduced motion still gets the constellation — just held still.
  if (reduced) {
    draw()
    window.addEventListener('resize', draw)
    return
  }

  let heroVisible = true
  const heroEl = qs('#hero')
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting
      },
      { threshold: 0 }
    ).observe(heroEl)
  }

  function animate() {
    requestAnimationFrame(animate)
    if (!heroVisible || document.hidden) return

    particles.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = w
      if (p.x > w) p.x = 0
      if (p.y < 0) p.y = h
      if (p.y > h) p.y = 0
    })

    draw()
  }
  animate()
}

/**
 * Scroll parallax.
 *
 * Writes a `--py` custom property that the stylesheet *composes* into each
 * element's own transform. Previously this used `gsap.set(selector, { y })`,
 * which (a) re-queried the DOM on every scroll frame and (b) wrote an inline
 * transform that clobbered the entrance transforms those same elements rely on
 * — scrolling during the intro would snap the character into place early.
 */
function initParallax() {
  if (prefersReducedMotion()) return

  // Each of these is a layout box that owns its transform outright. The old
  // targets (.char-img, .bg-initials, .float-tag) all had entrance transforms or
  // keyframe loops on the same property, so parallax either clobbered them or
  // was silently clobbered by them.
  const layers = [
    { el: qs('.hero-left'), depth: 0.06 },
    { el: qs('.bg-initials'), depth: 0.1 },
    { el: qs('#heroParticles'), depth: 0.15 },
    { el: qs('.hero-center'), depth: 0.22 },
    { el: qs('.hero-right'), depth: 0.3 },
  ].filter((layer) => layer.el)

  if (!layers.length) return

  let ticking = false
  let scrollY = 0

  function render() {
    ticking = false
    layers.forEach(({ el, depth }) => {
      el.style.setProperty('--py', `${(scrollY * depth).toFixed(2)}px`)
    })
  }

  function onScroll(y) {
    scrollY = y
    if (!ticking) {
      ticking = true
      requestAnimationFrame(render)
    }
  }

  if (window.lenis) {
    window.lenis.on('scroll', ({ scroll }) => onScroll(scroll))
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), {
      passive: true,
    })
  }
}

/** Custom cursor: a fast dot with a slower ring trailing behind it. */
export function initCursor() {
  const dot = qs('#cursorDot')
  const ring = qs('#cursorRing')
  if (!dot) return

  // A cursor that lags behind the pointer is exactly the kind of motion the
  // reduced-motion setting is about — fall back to the system cursor.
  if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) {
    document.documentElement.classList.add('native-cursor')
    return
  }

  let mx = 0
  let my = 0
  let dx = 0
  let dy = 0
  let rx = 0
  let ry = 0

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX
    my = e.clientY
  })

  function animateCursor() {
    dx += (mx - dx) * 0.22
    dy += (my - dy) * 0.22
    gsap.set(dot, { x: dx, y: dy })

    if (ring) {
      rx += (mx - rx) * 0.11
      ry += (my - ry) * 0.11
      gsap.set(ring, { x: rx, y: ry })
    }

    requestAnimationFrame(animateCursor)
  }
  animateCursor()

  // Delegated, so nodes added later (chat chips, work cards) are covered too.
  const INTERACTIVE = 'a, button, input, .bento-card, .tl-card, .chat-chip, .js-work'
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(INTERACTIVE)) {
      dot.classList.add('hover')
      if (ring) ring.classList.add('hover')
    }
  })
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(INTERACTIVE)) {
      dot.classList.remove('hover')
      if (ring) ring.classList.remove('hover')
    }
  })
}

/**
 * Magnetic CTAs.
 *
 * One delegated pointermove for all buttons. This used to register a separate
 * document-wide listener *per button*, each calling getBoundingClientRect() on
 * every mouse move for the lifetime of the page — including long after the hero
 * had scrolled away.
 */
function initMagneticButtons() {
  if (prefersReducedMotion()) return

  const buttons = qsa('.cta-primary, .cta-ghost, .nav-cta, .contact-cta-btn')
  if (!buttons.length) return

  const RADIUS = 70
  const STRENGTH = 12
  let rects = []
  let measured = false

  function measure() {
    rects = buttons.map((btn) => btn.getBoundingClientRect())
    measured = true
  }

  // Rects go stale on scroll/resize rather than on every pointer move.
  const invalidate = () => {
    measured = false
  }
  window.addEventListener('scroll', invalidate, { passive: true })
  window.addEventListener('resize', invalidate)

  document.addEventListener(
    'pointermove',
    (e) => {
      if (!measured) measure()

      buttons.forEach((btn, i) => {
        const r = rects[i]
        if (!r || r.width === 0) return

        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        const dist = Math.hypot(dx, dy)

        if (dist < RADIUS) {
          const pull = (1 - dist / RADIUS) * STRENGTH
          const angle = Math.atan2(dy, dx)
          gsap.to(btn, {
            x: Math.cos(angle) * pull,
            y: Math.sin(angle) * pull,
            duration: 0.35,
            ease: 'power3.out',
            overwrite: 'auto',
          })
          btn.classList.add('is-magnetic')
        } else if (btn.classList.contains('is-magnetic')) {
          btn.classList.remove('is-magnetic')
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.35)',
            overwrite: 'auto',
          })
        }
      })
    },
    { passive: true }
  )
}

/**
 * Stat counters, driven by an IntersectionObserver so they run when the numbers
 * are actually on screen. This function existed before but was never called —
 * the counters fired from a fixed setTimeout instead.
 */
function initStatsObserver() {
  const statsSection = qs('.hero-stats')
  if (!statsSection) return

  if (!('IntersectionObserver' in window)) {
    animateCounters()
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters()
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.4 }
  )

  observer.observe(statsSection)
}

function animateCounters() {
  const reduced = prefersReducedMotion()

  qsa('.stat-num[data-target]').forEach((el) => {
    const target = parseInt(el.dataset.target, 10)
    const suffix = el.dataset.suffix || ''

    if (reduced) {
      el.textContent = target + suffix
      return
    }

    const obj = { val: 0 }
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = Math.round(obj.val) + suffix
      },
    })
  })
}

/** 3D tilt + cursor-following glare on the character. */
function initCharTilt() {
  if (prefersReducedMotion()) return

  const hero = qs('#hero')
  const charWrap = qs('#charWrap')
  if (!hero || !charWrap) return

  const charImgWrap = qs('.char-img-wrap', charWrap)
  const charGlare = qs('#charGlare')
  const heroBgBlob = qs('#heroBgBlob')
  const badgeWraps = qsa('.badge-parallax-wrap')
  const codeFloatWrap = qs('#codeFloatWrap')

  if (!charImgWrap) return

  const state = {
    char: { rotateX: 0, rotateY: 0, translateX: 0 },
    blob: { translateX: 0, translateY: 0 },
    code: { translateX: 0, translateY: 0 },
    badges: { translateX: 0, translateY: 0 },
    glare: { x: 225, y: 275, opacity: 0 },
    target: {
      mouseX: 0,
      mouseY: 0,
      rotateX: 0,
      rotateY: 0,
      glareX: 225,
      glareY: 275,
      glareOpacity: 0,
    },
  }

  let lastInputTime = Date.now()
  let isMouseOver = false

  const lerp = (current, target, factor) => current + (target - current) * factor

  hero.addEventListener('mousemove', (e) => {
    if (!isTiltActive) return
    isMouseOver = true
    lastInputTime = Date.now()

    const rect = hero.getBoundingClientRect()
    const mouseX = e.clientX - (rect.left + rect.width / 2)
    const mouseY = e.clientY - (rect.top + rect.height / 2)

    const normX = mouseX / (rect.width / 2)
    const normY = mouseY / (rect.height / 2)

    state.target.mouseX = mouseX
    state.target.mouseY = mouseY
    state.target.rotateY = normX * 12
    state.target.rotateX = -normY * 8

    const charRect = charImgWrap.getBoundingClientRect()
    state.target.glareX = e.clientX - charRect.left
    state.target.glareY = e.clientY - charRect.top
    state.target.glareOpacity = 1
  })

  hero.addEventListener('mouseleave', () => {
    isMouseOver = false
    state.target.mouseX = 0
    state.target.mouseY = 0
    state.target.rotateX = 0
    state.target.rotateY = 0
    state.target.glareOpacity = 0
  })

  window.addEventListener('deviceorientation', (e) => {
    if (!isTiltActive) return
    if (e.beta === null || e.gamma === null) return

    lastInputTime = Date.now()

    const normX = Math.max(-1, Math.min(1, e.gamma / 20))
    const normY = Math.max(-1, Math.min(1, (e.beta - 45) / 20))

    state.target.mouseX = normX * 100
    state.target.mouseY = normY * 100
    state.target.rotateY = normX * 12
    state.target.rotateX = -normY * 8
    state.target.glareX = 225 + normX * 100
    state.target.glareY = 275 + normY * 120
    state.target.glareOpacity = 0.5
  })

  let heroInView = true
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        heroInView = entries[0].isIntersecting
      },
      { threshold: 0 }
    ).observe(hero)
  }

  function tick() {
    requestAnimationFrame(tick)
    if (!heroInView || document.hidden) return

    const now = Date.now()
    const isIdle = now - lastInputTime > 3000

    if (isIdle) {
      // Slow breathing oscillation so the character never sits perfectly still.
      const time = now * 0.0015
      state.target.rotateX = Math.sin(time) * 1.5
      state.target.rotateY = Math.cos(time * 0.8) * 2.0
      state.target.mouseX = Math.cos(time * 0.5) * 25
      state.target.mouseY = Math.sin(time * 0.5) * 15
      state.target.glareX = 225 + Math.cos(time) * 35
      state.target.glareY = 275 + Math.sin(time) * 35
      state.target.glareOpacity = 0.25
    }

    const lerpFast = 0.08
    const lerpSlow = 0.06
    const lerpGlare = 0.15

    state.char.rotateX = lerp(state.char.rotateX, state.target.rotateX, lerpFast)
    state.char.rotateY = lerp(state.char.rotateY, state.target.rotateY, lerpFast)
    state.char.translateX = lerp(
      state.char.translateX,
      state.target.mouseX * 0.02,
      lerpFast
    )

    state.blob.translateX = lerp(state.blob.translateX, state.target.mouseX * 0.01, lerpFast)
    state.blob.translateY = lerp(state.blob.translateY, state.target.mouseY * 0.01, lerpFast)

    if (codeFloatWrap) {
      state.code.translateX = lerp(state.code.translateX, state.target.mouseX * 0.03, lerpFast)
      state.code.translateY = lerp(state.code.translateY, state.target.mouseY * 0.02, lerpFast)
    }

    const targetBadgeX = state.target.mouseX * 0.045 + state.target.rotateY * 2.5
    const targetBadgeY = state.target.mouseY * -0.03 + state.target.rotateX * -2.5
    state.badges.translateX = lerp(state.badges.translateX, targetBadgeX, lerpSlow)
    state.badges.translateY = lerp(state.badges.translateY, targetBadgeY, lerpSlow)

    state.glare.x = lerp(state.glare.x, state.target.glareX, lerpGlare)
    state.glare.y = lerp(state.glare.y, state.target.glareY, lerpGlare)
    state.glare.opacity = lerp(state.glare.opacity, state.target.glareOpacity, lerpFast)

    if (isTiltActive) {
      charImgWrap.style.transform = `perspective(900px) rotateX(${state.char.rotateX.toFixed(
        3
      )}deg) rotateY(${state.char.rotateY.toFixed(3)}deg) scale(1.03)`

      if (charGlare) {
        if (isMouseOver || isIdle) {
          charGlare.classList.add('active')
          charGlare.style.background = `radial-gradient(circle 135px at ${state.glare.x.toFixed(
            1
          )}px ${state.glare.y.toFixed(1)}px, rgba(255, 255, 255, 0.15) 0%, transparent 100%)`
          charGlare.style.opacity = state.glare.opacity.toFixed(3)
        } else {
          charGlare.classList.remove('active')
          charGlare.style.opacity = ''
        }
      }
    }

    charWrap.style.transform = `translate3d(${state.char.translateX.toFixed(2)}px, 0, 0)`

    if (heroBgBlob) {
      heroBgBlob.style.transform = `translate(-50%, -50%) translate3d(${state.blob.translateX.toFixed(
        2
      )}px, ${state.blob.translateY.toFixed(2)}px, 0)`
    }

    if (codeFloatWrap) {
      codeFloatWrap.style.transform = `translate3d(${state.code.translateX.toFixed(
        2
      )}px, ${state.code.translateY.toFixed(2)}px, 0)`
    }

    badgeWraps.forEach((badge) => {
      badge.style.transform = `translate3d(${state.badges.translateX.toFixed(
        2
      )}px, ${state.badges.translateY.toFixed(2)}px, 0)`
    })
  }

  requestAnimationFrame(tick)
}

/** Cycling role typewriter. */
function initTypewriter(delayStart = 2200) {
  if (prefersReducedMotion()) return

  const target = qs('#typewriter')
  if (!target) return

  const words = ['Developer', 'UI Engineer', 'Motion Designer', 'React Dev']
  let wordIndex = 0
  let charIndex = words[0].length
  let isDeleting = false

  function type() {
    const currentWord = words[wordIndex]
    let delay

    if (isDeleting) {
      charIndex--
      delay = 60
    } else {
      charIndex++
      delay = 120
    }

    target.textContent = currentWord.substring(0, charIndex)

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true
      delay = 2000
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      wordIndex = (wordIndex + 1) % words.length
      delay = 400
    }

    setTimeout(type, delay)
  }

  setTimeout(type, delayStart)
}
