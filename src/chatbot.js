import gsap from 'gsap'

/**
 * "Ask about Praveen" — smart local knowledge-base chatbot.
 * No API key, no network calls: intents are scored against the visitor's
 * message with weighted keyword matching, so answers are instant, free,
 * and can't be rate-limited or abused on a static deploy.
 */

const CONTACT = {
  email: 'sowkurpraveenbhat@gmail.com',
  phone: '8431295640',
  linkedin: 'linkedin.com/in/praveenbhat',
  github: 'github.com/praveenbhat',
}

// ── Knowledge base ─────────────────────────────────────────────
// keywords: [word, weight] — higher weight wins ties. Word-boundary matched.
const INTENTS = [
  {
    id: 'greeting',
    keywords: [['hi', 2], ['hello', 3], ['hey', 3], ['yo', 2], ['namaste', 3], ['morning', 2], ['afternoon', 2], ['evening', 2], ['sup', 2], ['start', 1]],
    replies: [
      "Hey there! 👋 I can tell you about Praveen's projects, skills, education, or how to reach him. What would you like to know?",
      "Hi! Ask me anything about Praveen — his work, tech stack, achievements, or contact info.",
    ],
  },
  {
    id: 'about',
    keywords: [['who', 2], ['about', 2], ['introduce', 3], ['introduction', 3], ['praveen', 1], ['yourself', 2], ['himself', 2], ['summary', 2], ['bio', 3]],
    replies: [
      "Praveen (Sowkur Praveen Bhat) is an AI & Data Science student at NMAM Institute of Technology, VP of the IDEA Club, and a freelance product engineer. He builds AI systems and full-stack products — from SaaS platforms to medical AI tools.",
    ],
  },
  {
    id: 'projects',
    keywords: [['project', 4], ['projects', 4], ['portfolio', 2], ['built', 3], ['build', 2], ['made', 2], ['work', 2], ['works', 2], ['showcase', 2], ['best', 1]],
    replies: [
      "Praveen's flagship projects: Revora (SaaS review-automation platform), RetinaAI (diabetic-retinopathy detection), Sri Vinayaka Temple Platform (online seva booking), VEC Atelier (e-commerce platform), and AgriTech (crop prediction ML). Ask me about any of them by name!",
    ],
  },
  {
    id: 'revora',
    keywords: [['revora', 6], ['saas', 3], ['review', 3], ['booking', 2], ['twilio', 3], ['celery', 3]],
    replies: [
      "Revora (2025) is Praveen's multi-tenant SaaS platform that automates customer review collection with AI-driven workflows. Built with FastAPI, Celery, Redis, Twilio, SendGrid and Google APIs — it was his first freelance client project with a real invoice. 🚀",
    ],
  },
  {
    id: 'retinaai',
    keywords: [['retinaai', 6], ['retina', 5], ['eye', 3], ['diabetic', 4], ['retinopathy', 5], ['medical', 3], ['diagnostic', 3], ['health', 2], ['opencv', 2]],
    replies: [
      "RetinaAI is an AI diagnostic platform that detects diabetic retinopathy from retinal images. Praveen built it with FastAPI and OpenCV, and it's used by real users in ophthalmology — one of his proudest 'real impact' projects.",
    ],
  },
  {
    id: 'vecatelier',
    keywords: [['vec', 5], ['atelier', 5], ['ecommerce', 4], ['commerce', 3], ['shop', 2]],
    replies: [
      "VEC Atelier (2024) is a full-stack e-commerce platform Praveen built with React, Node.js and MongoDB — polished product pages, cart flows and a clean, fast UI.",
    ],
  },
  {
    id: 'agritech',
    keywords: [['agritech', 6], ['agri', 4], ['crop', 4], ['farm', 3], ['agriculture', 4], ['prediction', 2]],
    replies: [
      "AgriTech Intelligence (2023–24) predicts optimal crops using a Random Forest model served through a Flask API, with a friendly front-end for farmers. It's where Praveen's code first started having real-world purpose.",
    ],
  },
  {
    id: 'srivinayaka',
    keywords: [['vinayaka', 6], ['temple', 5], ['seva', 5], ['sri', 2]],
    replies: [
      "The Sri Vinayaka Temple Platform (2025) is a full-stack temple management system with online seva booking, Firebase backend and PDF receipts — built with Next.js, React, TypeScript and Tailwind for a real client.",
    ],
  },
  {
    id: 'resq',
    keywords: [['resq', 6], ['disaster', 5], ['emergency', 3], ['rescue', 3]],
    replies: [
      "Resq-Connect (2023) is a full-stack disaster management portal Praveen built to coordinate help during emergencies — an early project where shipping became his habit.",
    ],
  },
  {
    id: 'skills',
    keywords: [['skill', 4], ['skills', 4], ['stack', 3], ['tech', 2], ['technology', 3], ['technologies', 3], ['language', 3], ['languages', 3], ['framework', 3], ['frameworks', 3], ['tools', 2], ['react', 2], ['python', 2], ['javascript', 2], ['fastapi', 2], ['node', 2], ['database', 2], ['ml', 2], ['ai', 1]],
    replies: [
      "Praveen's stack: JavaScript/TypeScript, Python and C++ · React, Next.js, Node.js, Express, FastAPI · ML with Scikit-learn, Pandas, NumPy, OpenCV · MongoDB, PostgreSQL, Firebase, Redis · plus Git, Postman and JWT. Full-stack and AI, comfortably both.",
    ],
  },
  {
    id: 'education',
    keywords: [['education', 5], ['study', 3], ['studies', 3], ['college', 4], ['university', 4], ['degree', 4], ['cgpa', 5], ['gpa', 4], ['school', 3], ['nmamit', 5], ['nmam', 5], ['btech', 4], ['branch', 2], ['year', 1]],
    replies: [
      "Praveen is pursuing a B.Tech in Artificial Intelligence & Data Science at NMAM Institute of Technology, Nitte (2022–2026). Before that: Jnanasudha PU College and Vidyodaya Public School, Udupi.",
    ],
  },
  {
    id: 'experience',
    keywords: [['experience', 5], ['job', 3], ['freelance', 4], ['freelancer', 4], ['intern', 3], ['internship', 3], ['client', 3], ['professional', 2], ['career', 3]],
    replies: [
      "Praveen has worked as a freelance developer / product engineer since Jan 2025 — shipping Revora (SaaS review automation) and the Sri Vinayaka Temple Platform for real clients. Before that he built RetinaAI, VEC Atelier, Resq-Connect and AgriTech. He's now open to full-time and startup roles.",
    ],
  },
  {
    id: 'achievements',
    keywords: [['achievement', 5], ['achievements', 5], ['award', 4], ['prize', 4], ['won', 3], ['hackathon', 4], ['club', 3], ['vp', 4], ['president', 4], ['leader', 3], ['leadership', 3], ['incridea', 5], ['sih', 5], ['sap', 3]],
    replies: [
      "Highlights: 2nd Prize at 'Locked in Reality' (Incridea 2025), Vice President of the IDEA (AI & DS) Club at NMAMIT, selected for Smart India Hackathon and SAP Hackfest, and part of the Event Management & PROnite committees for Incridea.",
    ],
  },
  {
    id: 'contact',
    keywords: [['contact', 5], ['email', 5], ['mail', 4], ['reach', 4], ['phone', 5], ['call', 3], ['number', 3], ['linkedin', 5], ['github', 5], ['connect', 3], ['social', 3]],
    replies: [
      `You can reach Praveen at ${CONTACT.email}, call ${CONTACT.phone}, or connect on LinkedIn (${CONTACT.linkedin}) and GitHub (${CONTACT.github}). He replies fast!`,
    ],
  },
  {
    id: 'hire',
    keywords: [['hire', 6], ['hiring', 6], ['available', 4], ['availability', 4], ['opportunity', 3], ['recruit', 5], ['join', 2], ['offer', 3], ['fulltime', 4], ['position', 3], ['role', 3], ['startup', 3], ['collaborate', 3], ['collab', 3]],
    replies: [
      `Yes — Praveen is open to full-time roles, startup teams and collaborations as an AI / full-stack engineer. The fastest way to talk: ${CONTACT.email}. He'd love to hear what you're building.`,
    ],
  },
  {
    id: 'thanks',
    keywords: [['thanks', 5], ['thank', 5], ['awesome', 3], ['great', 2], ['cool', 2], ['nice', 2], ['perfect', 2]],
    replies: [
      "You're welcome! Anything else you'd like to know about Praveen? 😊",
    ],
  },
  {
    id: 'bye',
    keywords: [['bye', 5], ['goodbye', 5], ['later', 2], ['cya', 4]],
    replies: [
      `See you! If anything comes up, Praveen is one email away: ${CONTACT.email} 👋`,
    ],
  },
]

const FALLBACKS = [
  "I can only answer questions about Praveen and his work! Try asking about his projects, skills, education, or how to contact him.",
  "Hmm, that's outside what I know — I'm focused on Praveen. Ask me about Revora, RetinaAI, his tech stack, or his achievements!",
]

const CHIPS = [
  { label: 'Projects', message: 'Tell me about his projects' },
  { label: 'Skills', message: 'What are his skills?' },
  { label: 'Experience', message: 'What experience does he have?' },
  { label: 'Education', message: 'Where does he study?' },
  { label: 'Contact', message: 'How can I contact him?' },
]

// ── Matching ───────────────────────────────────────────────────
function matchIntent(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  const wordSet = new Set(words)

  let best = null
  let bestScore = 0

  INTENTS.forEach((intent) => {
    let score = 0
    intent.keywords.forEach(([kw, weight]) => {
      if (wordSet.has(kw)) score += weight
    })
    if (score > bestScore) {
      bestScore = score
      best = intent
    }
  })

  // Require a minimally confident match
  return bestScore >= 2 ? best : null
}

let fallbackIndex = 0

function getReply(text) {
  const intent = matchIntent(text)
  if (!intent) {
    const reply = FALLBACKS[fallbackIndex % FALLBACKS.length]
    fallbackIndex++
    return reply
  }
  return intent.replies[(Math.random() * intent.replies.length) | 0]
}

// ── UI ─────────────────────────────────────────────────────────
export function initChatbot() {
  const toggle = document.getElementById('chatToggle')
  const panel = document.getElementById('chatPanel')
  const iconOpen = document.getElementById('chatIconOpen')
  const iconClose = document.getElementById('chatIconClose')
  const messages = document.getElementById('chatMessages')
  const input = document.getElementById('chatInput')
  const sendBtn = document.getElementById('chatSend')

  if (!toggle || !panel || !messages || !input || !sendBtn) return

  let isOpen = false

  // Quick-reply chips between messages and input
  const chipsRow = document.createElement('div')
  chipsRow.className = 'chat-chips'
  CHIPS.forEach((chip) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'chat-chip'
    btn.textContent = chip.label
    btn.addEventListener('click', () => {
      input.value = chip.message
      sendMessage()
    })
    chipsRow.appendChild(btn)
  })
  messages.insertAdjacentElement('afterend', chipsRow)

  toggle.addEventListener('click', () => {
    isOpen = !isOpen
    if (isOpen) {
      panel.classList.add('open')
      gsap.to(panel, { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.5, ease: 'power3.out' })
      iconOpen.style.display = 'none'
      iconClose.style.display = 'block'
    } else {
      gsap.to(panel, {
        clipPath: 'inset(0 0 100% 0)', opacity: 0, duration: 0.4, ease: 'power3.in',
        onComplete: () => panel.classList.remove('open')
      })
      iconOpen.style.display = 'block'
      iconClose.style.display = 'none'
    }
  })

  function addMessage(text, role) {
    const div = document.createElement('div')
    div.className = `chat-msg chat-msg--${role}`
    div.textContent = text
    messages.appendChild(div)
    requestAnimationFrame(() => div.classList.add('show'))
    messages.scrollTop = messages.scrollHeight
    return div
  }

  function showTyping() {
    const div = document.createElement('div')
    div.className = 'chat-typing'
    div.id = 'typingIndicator'
    div.innerHTML = '<span></span><span></span><span></span>'
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator')
    if (el) el.remove()
  }

  function sendMessage() {
    const text = input.value.trim()
    if (!text) return

    addMessage(text, 'user')
    input.value = ''
    showTyping()

    const reply = getReply(text)
    // Simulate a natural thinking pause, scaled to answer length
    const delay = Math.min(1200, 400 + reply.length * 3)

    setTimeout(() => {
      hideTyping()
      addMessage(reply, 'bot')
    }, delay)
  }

  sendBtn.addEventListener('click', sendMessage)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage()
  })
}
