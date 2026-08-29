import { prefersReducedMotion } from './utils/motion.js'
import { qs } from './utils/dom.js'

/**
 * Preloader.
 *
 * Progress now tracks *real* readiness — fonts and the hero artwork — instead
 * of counting down a fixed 4450ms. MIN_VISIBLE keeps the count-up from flashing
 * past on a warm cache; MAX_WAIT guarantees the site is never held hostage by a
 * slow asset. Nothing outside this file depends on the total duration any more:
 * initHero() is handed control by callback and times its own sequence from there.
 */
const MIN_VISIBLE = 1400
const MAX_WAIT = 5000
const EXIT_DURATION = 850

const STATUS_STEPS = [
  [0, 'Initialising'],
  [0.25, 'Loading assets'],
  [0.45, 'Compiling'],
  [0.7, 'Rendering world'],
  [0.9, 'Welcome'],
]

function statusFor(progress) {
  let label = STATUS_STEPS[0][1]
  for (const [threshold, text] of STATUS_STEPS) {
    if (progress >= threshold) label = text
  }
  return label
}

/** Resolves once fonts and hero imagery are ready, or MAX_WAIT elapses. */
function assetsReady() {
  const jobs = []

  if (document.fonts && document.fonts.ready) {
    jobs.push(document.fonts.ready)
  }

  document.querySelectorAll('img').forEach((img) => {
    if (img.complete) return
    jobs.push(
      new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true })
        img.addEventListener('error', resolve, { once: true })
      })
    )
  })

  const settled = Promise.all(jobs)
  const capped = new Promise((resolve) => setTimeout(resolve, MAX_WAIT))
  return Promise.race([settled, capped])
}

export function runPreloader(onComplete) {
  const loader = qs('#preloader')

  const finish = () => {
    if (loader) loader.remove()
    document.body.classList.remove('is-loading')
    onComplete()
  }

  if (prefersReducedMotion()) {
    finish()
    return
  }

  const counter = qs('#preCounter')
  const bar = qs('#preBar')
  const status = qs('#preStatus')
  const clock = qs('#preClock')

  const startTime = performance.now()
  let ready = false
  let displayed = 0
  let done = false

  assetsReady().then(() => {
    ready = true
  })

  const complete = () => {
    if (done) return
    done = true
    if (loader) loader.classList.add('split-active')
    setTimeout(finish, EXIT_DURATION)
  }

  // Safety net: the count-up is driven by requestAnimationFrame, which Chrome
  // throttles hard (or suspends) in a background tab. Without a timer-based
  // backstop a page opened in an unfocused tab could sit behind the preloader
  // — and `is-loading` sets pointer-events:none on the body.
  const hardStop = setTimeout(complete, MAX_WAIT + 2000)

  function updateClock() {
    if (!clock) return
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}`
  }

  function frame() {
    if (done) return
    const elapsed = performance.now() - startTime

    // Creep toward 90% on a time curve; the last 10% is unlocked by readiness,
    // so the bar never sits at 100 waiting, and never jumps 0 -> 100.
    const timed = Math.min(1, elapsed / MIN_VISIBLE)
    const ceiling = ready && elapsed >= MIN_VISIBLE ? 1 : 0.9
    const target = Math.min(ceiling, timed * 0.9 + (ready ? 0.1 : 0))

    displayed += (target - displayed) * 0.12
    if (target === 1 && displayed > 0.995) displayed = 1

    const val = Math.round(displayed * 100)

    if (counter) counter.textContent = String(val).padStart(3, '0')
    if (bar) bar.style.width = val + '%'
    if (status) status.textContent = statusFor(displayed)
    updateClock()

    if (displayed >= 1) {
      clearTimeout(hardStop)
      complete()
      return
    }

    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}
