class AWork extends HTMLElement {
  static get observedAttributes() {
    return ['progress']
  }

  constructor() {
    super()
    this.link = null
    this.video = null
    this.isPlaying = false
  }

  /**
   * Init
   */
  connectedCallback() {
    // Elements
    this.video = this.querySelector('.js-video')
    this.link = this.querySelector('a')

    // Properties
    this.isPlaying = false

    // Events
    if (this.link) {
      this.link.addEventListener('click', this.onClick.bind(this))
    }
  }

  /**
   * Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'progress') {
      this.style.setProperty('--progress', newValue)

      const p = parseFloat(newValue)
      if (isNaN(p) || Math.abs(p) >= 0.98) {
        if (this.isPlaying) {
          this.outView()
        }
      } else {
        if (!this.isPlaying) {
          this.inView()
        }
      }
    }
  }

  /**
   * Gets in view
   */
  inView() {
    if (this.video) {
      this.video.play().catch(err => {
        // Safe check for autoplay blockages
      })
      this.isPlaying = true
    }
    this.classList.add('is-inview')
  }

  /**
   * Gets out view
   */
  outView() {
    if (this.video) {
      this.video.pause()
      this.isPlaying = false
    }
    this.classList.remove('is-inview')
  }

  /**
   * On click
   */
  onClick(event) {
    if (this.link && this.link.href.includes('#')) {
      event.preventDefault()
      return false
    }
  }
}

customElements.define('a-work', AWork)
export default AWork
