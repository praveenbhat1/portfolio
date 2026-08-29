import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(SplitText, ScrollTrigger)

export function initContact() {

  // ── 1. Heading drop-in reveal ───────────────────────────
  const split = new SplitText('.contact-title .ct-line', { type: 'chars' })
  gsap.from(split.chars, {
    y: -60, opacity: 0, stagger: 0.02, duration: 0.7, ease: 'back.out(1.5)',
    scrollTrigger: { trigger: '.contact-title', start: 'top 85%', once: true }
  })

  // ── 2. Email + socials fade up ──────────────────────────
  gsap.from(['.contact-email', '.contact-socials', '.contact-form'], {
    opacity: 0, y: 20, stagger: 0.1, duration: 0.6,
    scrollTrigger: { trigger: '.contact-email', start: 'top 88%', once: true }
  })

  // ── 3. Magnetic social links ────────────────────────────
  document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const r = link.getBoundingClientRect()
      const x = e.clientX - r.left - r.width / 2
      const y = e.clientY - r.top - r.height / 2
      gsap.to(link, { x: x * 0.3, y: y * 0.3, duration: 0.3 })
    })
    link.addEventListener('mouseleave', () => {
      gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' })
    })
  })

}
