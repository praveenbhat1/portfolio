import { mountWorkSection } from './work-dom.js'
import { WorkSection } from './work-section.js'
import Emitter from './utils/Emitter.js'
import Ticker from './utils/Ticker.js'
import './work-item.js'

export function initWorkSection() {
  mountWorkSection()
  Ticker.init()
  Emitter.emit('siteLoaded')
  new WorkSection()
}
