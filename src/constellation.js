export function initConstellation() {
  const stage = document.getElementById('journeyStage')
  const container = document.getElementById('journey')
  const canvas = document.getElementById('journeyCanvas')
  if (!stage || !canvas) return

  const ctx = canvas.getContext('2d')
  const cyclistGroup = document.getElementById('cyclistGroup')
  const rearSpokes = document.getElementById('rearSpokes')
  const frontSpokes = document.getElementById('frontSpokes')
  const pathEl = document.getElementById('constellationPath')
  const cardContainer = document.getElementById('milestoneCards')
  const header = document.getElementById('journeyHeader')
  const spiFill = document.querySelector('.spi-fill')
  const spiCyclist = document.querySelector('.spi-cyclist')

  // Canvas style optimization
  canvas.style.willChange = 'transform'

  let W = window.innerWidth
  let H = window.innerHeight
  const DPR = Math.min(window.devicePixelRatio || 1, 2)

  // 10 Milestones detailed data
  const nodesData = [
    {
      id: 1, year: '2022', title: 'Joined NMAMIT',
      detail1: 'AI & Data Science branch', detail2: 'Udupi',
      tagline: 'The journey starts here.', type: 'ORIGIN'
    },
    {
      id: 2, year: '2023', title: 'Teacher availability portal',
      detail1: 'Html,css', detail2: 'Web Development',
      tagline: 'First time building for someone else.', type: 'MILESTONE'
    },
    {
      id: 3, year: '2023', title: 'AgriTech',
      detail1: 'ML, front end', detail2: 'Machine Learning Model',
      tagline: 'Code started having purpose.', type: 'PROJECT'
    },
    {
      id: 4, year: '2023', title: 'Resq-connect',
      detail1: 'full stack', detail2: 'Disaster management portal',
      tagline: 'Shipping became the habit.', type: 'PROJECT'
    },
    {
      id: 5, year: '2024', title: 'VEC Atelier',
      detail1: 'Full stack', detail2: 'Portfolio for Architecture Firm',
      tagline: 'Three down. Momentum building.', type: 'PROJECT'
    },
    {
      id: 6, year: '2024', title: 'RetinaAI',
      detail1: 'AI · Full Stack', detail2: 'Ophthalmology Diagnostic Tool',
      tagline: 'Real users. Real impact.', type: 'PROJECT_MAJOR'
    },
    {
      id: 7, year: '2025', title: 'Revora — SaaS Platform',
      detail1: 'FastAPI · Redis · Twilio · Firebase', detail2: 'Real-time booking ecosystem',
      tagline: 'First client. First invoice.', type: 'FREELANCE'
    },
    {
      id: 8, year: '2025', title: 'Sri Vinayaka Temple Platform',
      detail1: 'Next.js, React, TypeScript, Tailwind', detail2: 'Firebase Seva Booking Platform',
      tagline: 'Building. Shipping. Growing.', type: 'FREELANCE'
    },
    {
      id: 9, year: '2025', title: 'Achievements Unlocked',
      detail1: '2nd Prize · Incridea 2025', detail2: 'VP · IDEA Club NMAMIT',
      tagline: 'The work started speaking.', type: 'ACHIEVEMENT'
    },
    {
      id: 10, year: '2026', title: 'Full-time / Startup',
      detail1: 'Open to the right team', detail2: 'AI / Full-stack engineer',
      tagline: 'The road is widening.', type: 'FUTURE'
    }
  ]

  // Setup 60 stars
  let stars = []
  function makeStars() {
    stars = []
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.5,
        o: 0.1 + Math.random() * 0.25
      })
    }
  }

  // Offscreen canvas for starfield background optimization
  const offscreenCanvas = document.createElement('canvas')
  const offscreenCtx = offscreenCanvas.getContext('2d')

  function drawStarsOffscreen() {
    offscreenCanvas.width = W * DPR
    offscreenCanvas.height = H * DPR
    offscreenCtx.setTransform(DPR, 0, 0, DPR, 0, 0)
    
    offscreenCtx.clearRect(0, 0, W, H)
    stars.forEach(s => {
      offscreenCtx.beginPath()
      offscreenCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      offscreenCtx.fillStyle = `rgba(247, 231, 206, ${s.o})`
      offscreenCtx.fill()
    })
  }

  // Layout positioning: vertical path
  let nodes = []
  let containerOffsetTop = 0
  let containerHeight = 600 * H / 100 // 600vh

  function updateLayout() {
    W = window.innerWidth
    H = window.innerHeight
    containerOffsetTop = container.offsetTop
    containerHeight = container.offsetHeight || (H * 6)

    canvas.width = W * DPR
    canvas.height = H * DPR
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

    const isMobile = W < 768
    const cardWidth = isMobile ? 160 : 220
    nodes = []

    // 10 nodes y coordinates: flow from top-center to bottom-center of the screen
    // starting at H * 0.08, ending at H * 0.92
    const startY = H * 0.08
    const endY = H * 0.92
    const stepY = (endY - startY) / 9

    // X positions alternate left/right swing. Swing values based on viewport width:
    // Swing: between 20vw and 80vw for desktop, 35vw and 65vw for mobile to avoid clipping.
    const leftSwing = isMobile ? W * 0.35 : W * 0.2
    const rightSwing = isMobile ? W * 0.65 : W * 0.8
    const centerSwing = W * 0.5

    const xPositions = [
      centerSwing, // Node 0
      leftSwing,   // Node 1
      rightSwing,  // Node 2
      leftSwing,   // Node 3
      rightSwing,  // Node 4
      leftSwing,   // Node 5
      rightSwing,  // Node 6
      leftSwing,   // Node 7
      rightSwing,  // Node 8
      centerSwing  // Node 9
    ]

    // Stacking Y trackers to avoid overlapping cards
    let lastLeftY = H * 0.05
    let lastRightY = H * 0.05
    const cardHeight = isMobile ? 120 : 150

    nodesData.forEach((d, i) => {
      const x = xPositions[i]
      const y = startY + stepY * i
      
      // Determine card side based on swing coordinate
      let cardSide = 'right'
      if (x < centerSwing) {
        cardSide = 'right'
      } else if (x > centerSwing) {
        cardSide = 'left'
      } else {
        // Center nodes (0 and 9)
        cardSide = (i === 0) ? 'right' : 'left'
      }

      // Calculate vertical stacking Y coordinates for cards
      let cardY = y - (isMobile ? 40 : 70)
      if (cardSide === 'left') {
        if (cardY < lastLeftY + 15) {
          cardY = lastLeftY + 15
        }
        lastLeftY = cardY + cardHeight
      } else {
        if (cardY < lastRightY + 15) {
          cardY = lastRightY + 15
        }
        lastRightY = cardY + cardHeight
      }

      // Card X coordinate:
      let cardX = 0
      if (cardSide === 'left') {
        cardX = isMobile ? 10 : W * 0.1
      } else {
        cardX = isMobile ? W - cardWidth - 10 : W * 0.9 - cardWidth
      }

      nodes.push({
        ...d,
        x,
        y,
        cardSide,
        cardX,
        cardY,
        cardWidth,
        cardHeight,
        revealed: false,
        fadeProgress: 0
      })
    })

    // Build the SVG path string (vertical Bezier curves)
    if (nodes.length > 0) {
      let pathD = `M ${nodes[0].x} ${nodes[0].y}`
      for (let i = 1; i < nodes.length; i++) {
        const p1 = nodes[i - 1]
        const p2 = nodes[i]
        
        // Control point progression along Y
        const cp = (p2.y - p1.y) * 0.4
        const cp1x = p1.x
        const cp1y = p1.y + cp
        const cp2x = p2.x
        const cp2y = p2.y - cp
        
        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
      }
      pathEl.setAttribute('d', pathD)
    }

    // Refresh offscreen canvas drawing
    drawStarsOffscreen()
  }

  // Pre-render ALL 10 cards in DOM
  function initCards() {
    cardContainer.innerHTML = ''
    nodesData.forEach((n, idx) => {
      const card = document.createElement('div')
      // Map to correct positioning classes
      const sideClass = (idx === 0 || idx === 1 || idx === 3 || idx === 5 || idx === 7) ? 'mc-right' : 'mc-left'
      card.className = `milestone-card ${sideClass}`
      card.id = `mc-${idx}`
      
      let badgeText = 'Project'
      let badgeClass = 'mc-badge--project'
      
      if (n.type === 'ORIGIN') {
        badgeText = 'Start'
        badgeClass = 'mc-badge--origin'
      } else if (n.type === 'MILESTONE') {
        badgeText = 'Milestone'
        badgeClass = 'mc-badge--milestone'
      } else if (n.type === 'FREELANCE') {
        badgeText = 'Freelance'
        badgeClass = 'mc-badge--freelance'
      } else if (n.type === 'ACHIEVEMENT') {
        badgeText = 'Achievement'
        badgeClass = 'mc-badge--achievement'
      } else if (n.type === 'FUTURE') {
        badgeText = 'Next'
        badgeClass = 'mc-badge--future'
      }

      card.innerHTML = `
        <div class="mc-header">
          <span class="mc-year">${n.year}</span>
          <span class="mc-badge ${badgeClass}">${badgeText}</span>
        </div>
        <h3 class="mc-title">${n.title}</h3>
        <p class="mc-detail">${n.detail1}<br>${n.detail2}</p>
        <div class="mc-divider"></div>
        <p class="mc-tagline">"${n.tagline}"</p>
      `
      cardContainer.appendChild(card)
    })
  }

  // Passive, throttled scroll listener
  let currentScrollY = window.scrollY
  let lastScrollY = window.scrollY

  window.addEventListener('scroll', () => {
    currentScrollY = window.scrollY
  }, { passive: true })

  // Animation values
  let scrollProgress = 0
  let targetProgress = 0
  let wheelAngle = 0
  let time = 0

  // Position and flip cyclist SVG
  let cyclistPos = { x: 0, y: 0 }
  function updateCyclist(dist, totalLength) {
    if (totalLength <= 0) return

    const pt = pathEl.getPointAtLength(Math.max(0, Math.min(totalLength, dist)))
    cyclistPos = pt

    // Determine path angle
    const sampleBack = pathEl.getPointAtLength(Math.max(0, dist - 3))
    const sampleForward = pathEl.getPointAtLength(Math.min(totalLength, dist + 3))
    const dx = sampleForward.x - sampleBack.x
    const dy = sampleForward.y - sampleBack.y
    let angleRad = Math.atan2(dy, dx)
    let angleDeg = angleRad * 180 / Math.PI

    // Spoke rotation by direct accumulation (CHANGE 5.4)
    if (rearSpokes) rearSpokes.setAttribute('transform', `rotate(${wheelAngle})`)
    if (frontSpokes) frontSpokes.setAttribute('transform', `rotate(${wheelAngle})`)

    // Position and transform bike group
    let flipTransform = ''
    if (angleDeg > 90 || angleDeg < -90) {
      flipTransform = 'scale(-1, 1)'
      angleDeg = angleDeg > 0 ? angleDeg - 180 : angleDeg + 180
    }

    if (cyclistGroup) {
      cyclistGroup.setAttribute('transform', `translate(${pt.x}, ${pt.y - 8}) rotate(${angleDeg}) ${flipTransform}`)
      cyclistGroup.style.opacity = 1
      cyclistGroup.style.display = 'block'
    }
  }

  // Handle permanent card reveal trigger
  function checkCardReveal() {
    nodes.forEach((n, idx) => {
      // Trigger card when cyclist reaches or passes the node Y coordinate
      // Map to vertical scroll progress (representing segments of path)
      const threshold = idx / 9
      if (scrollProgress >= threshold - 0.02) {
        if (!n.revealed) {
          n.revealed = true
          const card = document.getElementById(`mc-${idx}`)
          if (card) {
            // Apply positioning styles dynamically
            card.style.left = `${n.cardX}px`
            card.style.top = `${n.cardY}px`
            card.classList.add('revealed')
          }
        }
      }

      // Smoothly animate connector line fade progress in RAF loop
      if (n.revealed) {
        n.fadeProgress = Math.min(1, n.fadeProgress + 0.04)
      } else {
        n.fadeProgress = 0
      }
    })
  }

  // Update left progress sidebar
  function updateSidebarProgress() {
    const pct = scrollProgress * 100
    if (spiFill) {
      spiFill.style.height = `${pct}%`
    }
    if (spiCyclist) {
      spiCyclist.style.top = `${pct}%`
    }
  }

  // Canvas drawing loop
  function drawCanvas() {
    ctx.clearRect(0, 0, W, H)

    // 1. Draw pre-rendered stars starfield
    ctx.drawImage(offscreenCanvas, 0, 0, W, H)

    // 2. Draw low opacity dashed vertical zig-zag path
    ctx.beginPath()
    ctx.moveTo(nodes[0].x, nodes[0].y)
    for (let i = 1; i < nodes.length; i++) {
      const p1 = nodes[i - 1]
      const p2 = nodes[i]
      const cp = (p2.y - p1.y) * 0.4
      ctx.bezierCurveTo(p1.x, p1.y + cp, p2.x, p2.y - cp, p2.x, p2.y)
    }
    ctx.strokeStyle = 'rgba(216, 90, 48, 0.15)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 6])
    ctx.stroke()
    ctx.setLineDash([])

    // 3. Draw solid trail progress path behind cyclist
    const totalLength = pathEl.getTotalLength()
    const currentDist = scrollProgress * totalLength
    if (currentDist > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#D85A30'
      ctx.lineWidth = 2.5
      ctx.moveTo(nodes[0].x, nodes[0].y)
      
      const stepSize = 4
      for (let d = stepSize; d < currentDist; d += stepSize) {
        const pt = pathEl.getPointAtLength(d)
        ctx.lineTo(pt.x, pt.y)
      }
      ctx.lineTo(cyclistPos.x, cyclistPos.y)
      ctx.stroke()
    }

    // 4. Draw mountain markers and connector lines
    nodes.forEach((n, idx) => {
      // Calculate current state: Active, Visited, Unvisited
      const threshold = idx / 9
      const isVisited = scrollProgress >= threshold - 0.01
      const distToCyclist = Math.hypot(n.x - cyclistPos.x, n.y - cyclistPos.y)
      const isActive = distToCyclist < 30

      ctx.save()
      ctx.translate(n.x, n.y)

      let scale = 1.0
      if (isActive) {
        // Pulse animation at scale 1.3
        const pulse = 1.0 + 0.08 * Math.sin(time * 12)
        scale = 1.3 * pulse

        // Active State glow shadow
        ctx.shadowColor = 'rgba(216, 90, 48, 0.6)'
        ctx.shadowBlur = 12
      }

      ctx.scale(scale, scale)

      // Draw SVG Polygon points: 0,20 12,0 24,20 centered on (0, 0)
      // Since width=24, height=20, centered means:
      // Peak at (0, -10), Base corners at (-12, 10) and (12, 10)
      ctx.beginPath()
      ctx.moveTo(0, -10)
      ctx.lineTo(12, 10)
      ctx.lineTo(-12, 10)
      ctx.closePath()

      if (isActive) {
        ctx.fillStyle = '#D85A30'
        ctx.fill()
      } else if (isVisited) {
        ctx.fillStyle = '#D85A30'
        ctx.fill()
      } else {
        // Unvisited state: semi-transparent, subtle stroke
        ctx.fillStyle = 'rgba(216, 90, 48, 0.25)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(216, 90, 48, 0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw Flag on peak
      if (isActive) {
        // Animated waving flag
        ctx.beginPath()
        ctx.moveTo(0, -10)
        ctx.lineTo(0, -22)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.2
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, -22)
        const wave = Math.sin(time * 15) * 1.8
        ctx.lineTo(8, -19 + wave)
        ctx.lineTo(0, -16)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      } else if (isVisited) {
        // Static flag on conquered peaks
        ctx.beginPath()
        ctx.moveTo(0, -10)
        ctx.lineTo(0, -22)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.2
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, -22)
        ctx.lineTo(8, -19)
        ctx.lineTo(0, -16)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }

      ctx.restore()

      // 5. Draw Year label in 10px muted text below the mountain
      ctx.font = '500 10px "DM Sans", sans-serif'
      ctx.fillStyle = 'rgba(240, 236, 228, 0.5)'
      ctx.textAlign = 'center'
      ctx.fillText(n.year, n.x, n.y + 24)

      // 6. Draw dashed connector lines from mountain to card
      if (n.fadeProgress > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.strokeStyle = `rgba(216, 90, 48, ${0.3 * n.fadeProgress})`
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.moveTo(n.x, n.y)
        if (n.cardSide === 'right') {
          ctx.lineTo(n.cardX, n.cardY + 50)
        } else {
          ctx.lineTo(n.cardX + n.cardWidth, n.cardY + 50)
        }
        ctx.stroke()
        ctx.restore()
      }
    })
  }

  // Master single requestAnimationFrame loop (CHANGE 5.1)
  // Only runs while the journey section is on-screen (see IntersectionObserver below)
  let loopRunning = false

  function startLoop() {
    if (loopRunning) return
    loopRunning = true
    // Reset scroll reference so we don't get a rotation jump after being paused
    lastScrollY = currentScrollY
    requestAnimationFrame(masterLoop)
  }

  function stopLoop() {
    loopRunning = false
  }

  function masterLoop() {
    if (!loopRunning) return

    time += 0.016

    // Read scroll progress using static values (no layout thrashing)
    const scrolled = currentScrollY - containerOffsetTop
    const maxScroll = containerHeight - H
    targetProgress = Math.max(0, Math.min(1, scrolled / maxScroll))

    // Ease scroll progress
    scrollProgress += (targetProgress - scrollProgress) * 0.09
    scrollProgress = Math.max(0, Math.min(1, scrollProgress))

    // Accumulate wheel rotation based on scroll delta
    const scrollDelta = currentScrollY - lastScrollY
    wheelAngle += scrollDelta * 0.3
    lastScrollY = currentScrollY

    // Update cyclist
    const totalLength = pathEl.getTotalLength()
    updateCyclist(scrollProgress * totalLength, totalLength)

    // Check card reveals
    checkCardReveal()

    // Update sidebar UI progress
    updateSidebarProgress()

    // Draw canvas scene
    drawCanvas()

    // Fade out journey title header on scroll progress
    if (header) {
      header.style.opacity = Math.max(0, 1 - (scrollProgress / 0.1))
    }

    requestAnimationFrame(masterLoop)
  }

  // Handle resizing
  function handleResize() {
    updateLayout()
    makeStars()
    drawStarsOffscreen()
  }

  window.addEventListener('resize', handleResize)

  // Start initialization
  updateLayout()
  makeStars()
  initCards()

  // Only animate while the journey section is actually in (or near) the viewport.
  // This keeps the heavy per-frame work (getTotalLength + full canvas redraw)
  // from running the whole time the user is on other sections.
  const visObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      startLoop()
    } else {
      stopLoop()
    }
  }, { rootMargin: '200px', threshold: 0 })
  visObserver.observe(container)

  // Clean up listener
  return () => {
    window.removeEventListener('resize', handleResize)
    visObserver.disconnect()
    stopLoop()
  }
}
