import { runPreloader } from './loader.js'
import { initHero, initCursor } from './hero.js'
import { initAbout } from './about.js'
import { initSkills } from './skills.js'
import { initChatbot } from './chatbot.js'
import { initContact } from './contact.js'
import { initPageTransitions } from './transitions.js'
import { initNav } from './nav.js'
import { initSpotlight } from './spotlight.js'
import { mountWorkSection } from './work-dom.js'
import { WorkSection } from './work-section.js'
import Emitter from './utils/Emitter.js'
import Ticker from './utils/Ticker.js'
import { prefersReducedMotion } from './utils/motion.js'
import './work-item.js'

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function updateViewport() {
  window.safeWidth = window.innerWidth
  window.safeHeight = window.innerHeight
}
updateViewport()

window.addEventListener('resize', () => {
  const widthChanged = window.safeWidth !== window.innerWidth
  updateViewport()
  Emitter.emit('resize', widthChanged)
})

// Smooth scroll is itself motion — hijacking the scroll wheel is one of the
// things prefers-reduced-motion most specifically asks us not to do. Previously
// Lenis was initialised unconditionally while every other effect checked.
if (!prefersReducedMotion()) {
  window.lenis = new Lenis()
  window.lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => window.lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

window.addEventListener('DOMContentLoaded', () => {
  initCursor()
  initNav()

  runPreloader(() => {
    initHero()
    initAbout()

    mountWorkSection() // inject cards into the DOM first

    Ticker.init()

    const start = () => {
      Emitter.emit('siteLoaded')
      window.__workSection = new WorkSection() // then construct
      initSkills()
      initPageTransitions()
      initChatbot()
      initContact()
      initSpotlight()
    }

    if (document.readyState === 'complete') {
      start()
    } else {
      window.addEventListener('load', start, { once: true })
    }
  })
})
