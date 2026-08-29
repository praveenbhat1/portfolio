import Emitter from './utils/Emitter.js'
import Ticker from './utils/Ticker.js'
import { prefersReducedMotion } from './utils/motion.js'

import { gsap } from 'gsap'
import { SlowMo } from 'gsap/EasePack'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, SlowMo)

export class WorkSection {
  /**
   * Constructor
   */
  constructor() {
    // Elements
    this.el = document.querySelector('.s-work')
    if (!this.el) return

    this.container = this.el.querySelector('.js-container')
    this.ruler = this.el.querySelector('.js-ruler')
    this.scene = this.container.querySelector('.js-scene')
    this.canvas = this.container.querySelector('.js-canvas')
    this.ctx = this.canvas.getContext('2d')
    this.title = this.container.querySelector('.js-title')
    this.videos = this.container.querySelectorAll('video')

    // Properties
    this.mask = {
      width: 0,
      height: 0,
      maxScale: 1,
      lines: [],
      el: this.el.querySelector('.js-mask'),
      svg: this.el.querySelector('.js-mask-svg'),
      pathOuter: this.el.querySelector('.js-mask-path-outer'),
      pathInner: this.el.querySelector('.js-mask-path-inner'),
      pathLines: this.el.querySelector('.js-mask-path-lines'),
    }

    this.letters = []
    this.title.querySelectorAll('.js-letter').forEach((_letter) => {
      const letter = {
        el: _letter,
        ghosts: [],
      }

      this.letters.push(letter)
    })

    this.works = []
    this.container.querySelectorAll('.js-work').forEach((_work) => {
      const work = {
        el: _work,
      }

      this.works.push(work)
    })

    this.points = []

    this.scrollProgress = 0
    this.smoothScrollProgress = 0
    this.pointsProgress = 0
    this.state = 0
    this.animationProgress = 0
    this.last = {
      animationProgress: 0,
      pointsProgress: 0,
    }

    this.isPaused = true
    this.loadIsStarted = false

    // Init
    if (document.readyState === 'complete') {
      Ticker.nextTick(this.init, this)
    } else {
      Emitter.once('siteLoaded', this.init, this)
    }
  }

  /**
   * Init
   */
  init() {
    this.setCtxStyle()
    this.setSize()
    this.setMask()
    this.setPoints()
    this.setLetters()
    this.setWorks()
    this.setTimeline()
    this.bindEvents()

    if (prefersReducedMotion()) {
      Ticker.nextTick(() => {
        this.pointsProgress = 1
        this.drawPoints()
      }, this)
    }

    if (window.lenis) {
      window.lenis.resize()
    }
    ScrollTrigger.refresh()
  }

  /**
   * Bind events
   */
  bindEvents() {
    Emitter.on('contrastchange', this.setCtxStyle, this)
    Emitter.on('resize', this.onResize, this)

    // Set up a self-contained IntersectionObserver to handle pausing/unpausing the animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.onIntersect({ detail: { isIntersecting: entry.isIntersecting } })
      })
    }, { threshold: 0 })
    observer.observe(this.el)
  }

  /**
   * Resize handler
   */
  onResize(widthChanged) {
    if (widthChanged) {
      this.setCtxStyle()
      this.setSize()
      this.setMask()
      this.setPoints()
      this.setLetters()
      this.setWorks()
      this.setTimeline()
    }
  }

  /**
   * Intersect handler
   */
  onIntersect(e) {
    this.isPaused = !e.detail.isIntersecting

    if (this.isPaused || prefersReducedMotion()) {
      Emitter.off('tick', this.tick, this)
    } else {
      Emitter.on('tick', this.tick, this)
    }

    if (!this.loadIsStarted) {
      this.loadNextVideo()
      this.loadIsStarted = true
    }
  }

  /**
   * Set canvas style
   */
  setCtxStyle() {
    // --color-secondary, not --color-primary: primary IS this section's
    // background, so the grid was being drawn invisibly on top of itself.
    const color = getComputedStyle(this.el)
      .getPropertyValue('--color-secondary')
      .trim()

    Ticker.nextTick(() => {
      this.ctx.strokeStyle = color || '#B8A994'
      this.ctx.globalAlpha = 0.5
    })
  }

  /**
   * Set size
   */
  setSize() {
    this.el.style.setProperty('--height', this.works.length * 50 + 'vh')

    const bounding = this.container.getBoundingClientRect()

    this.bounding = {
      left: bounding.left,
      top: bounding.top,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    }

    this.canvas.width = this.bounding.width
    this.canvas.height = this.bounding.height

    this.speed = Math.hypot(this.bounding.width, this.bounding.height) * 4
  }

  /**
   * Set mask
   */
  setMask() {
    const { mask } = this

    // Use client dimensions to exclude scrollbar for perfect layout alignment
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight

    mask.width = width
    mask.height = height

    // Set SVG to exact window pixel dimensions so path coordinates match
    mask.svg.setAttribute('width', width)
    mask.svg.setAttribute('height', height)
    mask.svg.style.width = width + 'px'
    mask.svg.style.height = height + 'px'

    const elBounding = this.el.getBoundingClientRect()
    const rulerBounding = this.ruler.getBoundingClientRect()
    const rulerWidth = rulerBounding.width
    const rulerHeight = rulerBounding.height
    const offsetX = rulerBounding.left - elBounding.left
    const offsetY = rulerBounding.top - elBounding.top

    // Outer rect bleeds 10px on all 4 sides — guarantees zero gap at any screen edge
    const dOuter = `M -10 -10 L ${width + 10} -10 L ${width + 10} ${height + 10} L -10 ${height + 10} Z`

    // Mask outer
    const corners = {
      tl: { x: offsetX, y: offsetY },
      tr: { x: offsetX + rulerWidth, y: offsetY },
      br: { x: offsetX + rulerWidth, y: offsetY + rulerHeight },
      bl: { x: offsetX, y: offsetY + rulerHeight },
    }

    let size = (corners.tr.x - corners.tl.x) / 2

    const safeW = window.safeWidth || window.innerWidth
    mask.maxScale = safeW / size

    let dInner = `M ${corners.tl.x} ${corners.tl.y + size} A ${size} ${size} 0 0 1 ${corners.tr.x} ${corners.tr.y + size} L ${corners.br.x} ${corners.br.y - size} A ${size} ${size} 0 0 1 ${corners.bl.x} ${corners.bl.y - size} Z`
    const linesClip = `${dOuter} ${dInner}`

    mask.pathOuter.setAttribute('d', `${dOuter} ${dInner}`)

    // Mask inner
    const thickness = safeW > 767 ? 16 : 8
    corners.tl.x += thickness
    corners.tl.y += thickness

    corners.tr.x -= thickness
    corners.tr.y += thickness

    corners.br.x -= thickness
    corners.br.y -= thickness

    corners.bl.x += thickness
    corners.bl.y -= thickness

    size = (corners.tr.x - corners.tl.x) / 2

    dInner = `M ${corners.tl.x} ${corners.tl.y + size} A ${size} ${size} 0 0 1 ${corners.tr.x} ${corners.tr.y + size} L ${corners.br.x} ${corners.br.y - size} A ${size} ${size} 0 0 1 ${corners.bl.x} ${corners.bl.y - size} Z`

    mask.pathInner.setAttribute('d', `${dOuter} ${dInner}`)

    // Lines
    mask.lines = []

    const vLines = safeW > 767 ? 12 : 8
    const gapX = width / vLines
    const gapY = height * 0.1
    const hLines = Math.ceil(height / gapY)

    for (let i = 1; i < vLines; i++) {
      const x = gapX * i

      mask.lines.push({
        p1: { x, y: 0 },
        p2: { x, y: height },
      })
    }

    for (let i = 0; i < hLines; i++) {
      const y = gapY * i

      mask.lines.push({
        p1: { x: 0, y },
        p2: { x: width, y },
      })
    }

    let dLines = ''

    mask.lines.forEach((line) => {
      dLines += `M ${line.p1.x} ${line.p1.y} L ${line.p2.x} ${line.p2.y} `
    })

    mask.pathLines.setAttribute('d', dLines)
    mask.pathLines.style.clipPath = `path(evenodd, '${linesClip}')`
  }

  /**
   * Set letters
   */
  setLetters() {
    const { letters, scene } = this

    letters.forEach((letter, j) => {
      letter.ghosts.forEach((ghost) => {
        ghost.el.remove()
      })
      letter.ghosts = []

      // Get letter position and size
      const bounding = letter.el.getBoundingClientRect()

      letter.width = bounding.width
      letter.height = bounding.height
      letter.top = bounding.top - this.bounding.top
      letter.left = bounding.left

      letter.freq = 1 + Math.random()

      const multiplier = window.safeWidth > 767 ? 0.75 : 0.5

      // Create ghost letters
      letter.total =
        Math.round((this.bounding.width / letter.width) * multiplier) + 2

      for (let i = 0; i < letter.total; i++) {
        const el = document.createElement('span')
        el.classList.add('s__scene__letter')
        el.classList.add('js-letter')

        el.innerText = letter.el.innerText
        el.dataset.letter = letter.el.innerText

        scene.appendChild(el)

        const ghost = {
          el,
          x: letter.left,
          y: letter.top,
          z: Math.random() * 100,
          i: i - letter.total * 0.5,
          p: (i / letter.total - 0.5) * 2,
          ap: Math.abs(i / letter.total - 0.5) * 2,
          mx: 0,
          my: 0,
        }

        el.style.top = ghost.y + 'px'
        el.style.left = ghost.x + 'px'

        // Keep every letter behind the project cards (cards are z-index 2) so a
        // stray ghost never overlaps and obscures a video. The AW original pushed
        // some letters to z-index 3 for a collage look, but that clutters the cards.
        el.style.zIndex = '1'

        el.style.setProperty('--ix', String(ghost.i))
        el.style.setProperty(
          '--iy',
          String(((j + 1) / (letters.length + 1) - 0.5) * 2)
        )

        el.style.setProperty('--ap', String(ghost.ap))
        el.style.setProperty('--p', String(ghost.p))

        letter.ghosts.push(ghost)
      }
    })
  }

  /**
   * Set works
   */
  setWorks() {
    const { works } = this

    works.forEach((work, i) => {
      const el = work.el

      el.style.setProperty('--size', String(0.5 + Math.random() * 0.5))
      el.style.setProperty(
        '--y',
        String((0.5 + Math.random() * 0.5) * (i % 2 ? -1 : 1))
      )
    })
  }

  /**
   * Set timeline
   */
  setTimeline() {
    const { el, container, works, scene, mask } = this

    const worksEl = works.map((work) => work.el)

    // Tear down the previous timeline *and* its ScrollTrigger before rebuilding.
    // tl.kill() alone leaves the ScrollTrigger alive in GSAP 3.
    if (this.tl) {
      if (this.tl.scrollTrigger) this.tl.scrollTrigger.kill()
      this.tl.kill()
      this.tl = null
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top 25%',
        end: 'bottom 75%',
        scrub: 1,
      },
      onUpdate: () => {
        scene.style.setProperty('--state', String(this.state))
      },
    })

    this.tl = tl

    tl.fromTo(
      mask.el,
      {
        scale: 1,
      },
      {
        scale: mask.maxScale,
        duration: 0.75,
        ease: 'power4.in',
      },
      0
    )

    tl.fromTo(
      scene,
      {
        scale: 0.75,
      },
      {
        scale: 1,
        duration: 0.75,
        ease: 'power3.in',
      },
      0
    )

    tl.fromTo(
      container,
      {
        clipPath: 'inset(0 1rem)',
      },
      {
        clipPath: 'inset(0 0rem)',
        duration: 0.75,
        ease: 'power3.in',
      },
      0
    )

    tl.fromTo(
      this,
      {
        pointsProgress: 0,
      },
      {
        pointsProgress: 1,
        duration: 1,
        ease: 'power4.inOut',
      },
      0
    )

    tl.fromTo(
      this,
      {
        state: 0,
      },
      {
        state: 1,
        duration: 0.75,
        ease: 'power4.in',
      },
      0
    )

    tl.fromTo(
      worksEl,
      {
        attr: {
          progress: 1,
        },
      },
      {
        attr: {
          progress: -1,
        },
        ease: 'slow(0.15, 0.6)',
        stagger: 0.25,
      },
      0.75
    )

    tl.fromTo(
      this,
      {
        animationProgress: 0,
      },
      {
        animationProgress: 10000,
        duration: tl.totalDuration(),
        ease: 'power1.out',
      },
      0.75
    )

    tl.fromTo(
      this,
      {
        state: 1,
      },
      {
        state: 0,
        duration: 0.75,
        ease: 'power4.inOut',
        immediateRender: false,
      },
      '-=1'
    )

    tl.fromTo(
      mask.el,
      {
        scale: mask.maxScale,
      },
      {
        scale: 1,
        duration: 0.75,
        ease: 'power4.inOut',
        immediateRender: false,
      },
      '-=1'
    )

    tl.fromTo(
      scene,
      {
        scale: 1,
      },
      {
        scale: 0.75,
        duration: 0.75,
        ease: 'power3.inOut',
        immediateRender: false,
      },
      '-=1'
    )

    tl.fromTo(
      container,
      {
        clipPath: 'inset(0 0rem)',
      },
      {
        clipPath: 'inset(0 1rem)',
        duration: 0.75,
        ease: 'power3.inOut',
        immediateRender: false,
      },
      '-=1'
    )

    tl.fromTo(
      this,
      {
        pointsProgress: 1,
      },
      {
        pointsProgress: 0,
        duration: 1,
        ease: 'power4.inOut',
      },
      '-=1'
    )
  }

  /**
   * Load next video
   */
  loadNextVideo() {
    const video = Array.from(this.videos).find(
      (v) => !v.classList.contains('is-loaded')
    )

    if (video) {
      if (video.readyState >= 3) {
        this.videoLoaded(video)
      } else {
        let loaded = false
        const handleLoad = () => {
          if (!loaded) {
            loaded = true
            this.videoLoaded(video)
          }
        }

        const timer = setTimeout(handleLoad, 300)

        video.addEventListener(
          'canplaythrough',
          () => {
            clearTimeout(timer)
            handleLoad()
          },
          { once: true }
        )

        video.addEventListener(
          'error',
          () => {
            clearTimeout(timer)
            handleLoad()
          },
          { once: true }
        )

        video.setAttribute('src', video.getAttribute('data-src'))
        video.load()
      }
    }
  }

  /**
   * Video loaded
   */
  videoLoaded(video) {
    video.classList.add('is-loaded')
    // Set a tiny delay to yield to main thread between video loads
    setTimeout(() => {
      this.loadNextVideo()
    }, 10)
  }

  /**
   * Move letters
   */
  moveLetters() {
    const { speed, letters, animationProgress } = this

    letters.forEach((letter, i) => {
      const letterSpeed = speed * letter.freq
      letter.ghosts.forEach((ghost, index) => {
        let progress =
          (((animationProgress % letterSpeed) / letterSpeed +
            index / letter.total) %
            1) /
            0.7 -
          0.15

        ghost.el.style.setProperty('--progress', String(progress))
      })
    })
  }

  /**
   * Set points
   */
  setPoints() {
    const { bounding } = this

    this.points = []

    const gap = 24
    const cols = Math.ceil((bounding.width * 1.2) / gap)
    const rows = Math.ceil((bounding.height * 1.2) / gap)

    const offsetX = (bounding.width - cols * gap) * 0.5
    const offsetY = (bounding.height - rows * gap) * 0.5

    const hWidth = bounding.width * 0.5
    const hHeight = bounding.height * 0.5

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * gap + offsetX
        const y = j * gap + offsetY

        const dx = hWidth - x
        const dy = hHeight - y

        this.points.push({
          x,
          y,
          dx,
          dy,
          m: Math.random(),
          flowX: 0,
        })
      }
    }
  }

  /**
   * Move points
   */
  movePoints() {
    const { points, animationProgress } = this

    points.forEach((p) => {
      // Flow
      p.flowX = (animationProgress * -0.05) % 24
    })
  }

  /**
   * Draw points
   */
  drawPoints() {
    const { bounding, ctx, points, animationProgress, pointsProgress, last } =
      this

    const rAnimationProgress = Math.round(animationProgress * 100) / 100
    const rPointsProgress = Math.round(pointsProgress * 100) / 100

    if (
      rPointsProgress === last.pointsProgress &&
      rAnimationProgress === last.animationProgress
    )
      return

    ctx.clearRect(0, 0, bounding.width, bounding.height)

    ctx.beginPath()

    points.forEach((point) => {
      const x = point.x + point.dx * (1 - pointsProgress) * 0.2 + point.flowX
      const y = point.y + point.dy * (1 - pointsProgress) * 0.2

      ctx.rect(x, y, 0.5, 0.5)
    })

    ctx.stroke()

    last.pointsProgress = rPointsProgress
    last.animationProgress = rAnimationProgress
  }

  /**
   * Tick
   */
  tick() {
    // Calculate scroll progress
    this.scrollProgress =
      Math.max(
        Math.min(1, ScrollTrigger.positionInViewport(this.el, 'top')),
        0
      ) *
        -1 +
      (1 -
        Math.max(
          Math.min(1, ScrollTrigger.positionInViewport(this.el, 'bottom')),
          0
        ))
    this.smoothScrollProgress +=
      (this.scrollProgress - this.smoothScrollProgress) * 0.1

    this.el.style.setProperty(
      '--scroll-progress',
      String(this.scrollProgress)
    )

    // Movement
    this.movePoints()
    this.moveLetters()

    // Draw
    this.drawPoints()
  }
}
