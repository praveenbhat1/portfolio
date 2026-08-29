import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './utils/motion.js'
import { qs, qsa } from './utils/dom.js'

gsap.registerPlugin(SplitText, ScrollTrigger)

export function initContact() {
  initCopyEmail()
  initFooterYear()

  if (prefersReducedMotion()) return

  // ── 1. Heading drop-in reveal ───────────────────────────
  if (qs('.contact-title .ct-line')) {
    const split = new SplitText('.contact-title .ct-line', { type: 'chars' })
    gsap.from(split.chars, {
      y: -60,
      opacity: 0,
      stagger: 0.02,
      duration: 0.7,
      ease: 'back.out(1.5)',
      scrollTrigger: { trigger: '.contact-title', start: 'top 85%', once: true },
    })
  }

  // ── 2. Email + socials + buttons fade up ────────────────
  // `.contact-form` used to be listed here but has never existed in the markup;
  // `.contact-cta-buttons`, which does, was missing.
  const reveal = ['.contact-email', '.contact-socials', '.contact-cta-buttons'].filter(
    (selector) => qs(selector)
  )

  if (reveal.length) {
    gsap.from(reveal, {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      scrollTrigger: { trigger: '.contact-email', start: 'top 88%', once: true },
    })
  }

  // ── 3. Magnetic social links ────────────────────────────
  qsa('.social-link').forEach((link) => {
    link.addEventListener('mousemove', (e) => {
      const r = link.getBoundingClientRect()
      gsap.to(link, {
        x: (e.clientX - r.left - r.width / 2) * 0.3,
        y: (e.clientY - r.top - r.height / 2) * 0.3,
        duration: 0.3,
      })
    })
    link.addEventListener('mouseleave', () => {
      gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' })
    })
  })
}


/** Copy-to-clipboard on the contact address, with inline confirmation. */
function initCopyEmail() {
  const btn = qs('#copyEmail')
  if (!btn) return

  const label = qs('[data-copy-label]', btn)
  const original = label ? label.textContent : ''
  let resetTimer

  btn.addEventListener('click', async () => {
    const email = btn.dataset.email
    if (!email) return

    let ok = true
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      ok = false
    }

    btn.classList.toggle('is-copied', ok)
    if (label) label.textContent = ok ? 'Copied' : email

    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      btn.classList.remove('is-copied')
      if (label) label.textContent = original
    }, 2000)
  })
}

function initFooterYear() {
  const el = qs('#footerYear')
  if (el) el.textContent = String(new Date().getFullYear())
}
