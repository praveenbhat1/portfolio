import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import { prefersReducedMotion } from './utils/motion.js'

gsap.registerPlugin(SplitText, ScrollTrigger, Observer)

export function initSkills() {
  const section = document.querySelector('.skills')
  if (!section) return

  if (prefersReducedMotion()) {
    // Reveal the bento grid outright; skip the marquee skew warp and 3D tilt.
    gsap.set(section.querySelectorAll('.bento-card'), { opacity: 1, y: 0 })
    return
  }

  // 1. Heading reveal
  const split = new SplitText(section.querySelectorAll('.skills-title .st-line'), {
    type: 'lines',
  })
  gsap.from(split.lines, {
    y: 60,
    opacity: 0,
    clipPath: 'inset(0 0 100% 0)',
    stagger: 0.12,
    duration: 0.85,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.skills-title',
      start: 'top 85%',
      once: true,
    },
  })

  // 2. Bento cards stagger in
  const cards = section.querySelectorAll('.bento-card')
  gsap.set(cards, { y: 30, opacity: 0 })
  gsap.to(cards, {
    opacity: 1,
    y: 0,
    stagger: 0.08,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.skills-bento',
      start: 'top 85%',
      once: true,
    },
  })

  // 3. Marquee warp on fast scroll velocity
  const marqueeRows = gsap.utils.toArray(section.querySelectorAll('.marquee-row'))
  let warpTween
  let resetTween

  Observer.create({
    target: window,
    type: 'wheel,touch,scroll',
    onChangeY: (self) => {
      const vel = gsap.utils.clamp(-20, 20, self.velocityY / 60)

      if (warpTween) warpTween.kill()
      if (resetTween) resetTween.kill()

      warpTween = gsap.to(marqueeRows, {
        skewX: vel,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          resetTween = gsap.to(marqueeRows, { skewX: 0, duration: 0.8 })
        },
      })
    },
  })

  // 4. Bento card 3D tilt on mouse
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5

      gsap.to(card, {
        rotateY: x * 8,
        rotateX: -y * 8,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 600,
      })
    })

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
    })
  })
}
