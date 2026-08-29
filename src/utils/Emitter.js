/**
 * Tiny pub/sub.
 *
 * Backed by a Map of real arrays. The previous version used an *array* as a
 * string-keyed map and removed handlers with `delete arr[i]`, which leaves a
 * permanent hole rather than compacting. WorkSection subscribes/unsubscribes
 * from 'tick' every time it crosses the viewport, so that list grew by one hole
 * on every scroll-past and never shrank. `splice` keeps it bounded.
 */
class Emitter {
  constructor() {
    this.events = new Map()
  }

  /**
   * Attach handler to event
   * @param {String} name Event name
   * @param {Function} callback Handler function
   * @param {Object} context Context
   * @param {Boolean} once Call handler only once
   */
  on(name, callback, context, once = false) {
    if (!this.events.has(name)) {
      this.events.set(name, [])
    }

    const handlers = this.events.get(name)
    const exists = handlers.some(
      (object) => object.cb === callback && object.context === context
    )
    if (exists) return

    handlers.push({ cb: callback, context, once })
  }

  /**
   * Single event handler
   */
  once(name, callback, context) {
    this.on(name, callback, context, true)
  }

  /**
   * Emit event
   */
  emit(name, ...data) {
    const handlers = this.events.get(name)
    if (!handlers || handlers.length === 0) return

    // Iterate a copy so a handler that subscribes or unsubscribes during
    // dispatch cannot corrupt the walk.
    handlers.slice().forEach((object) => {
      if (object.once) this.remove(name, object.cb, object.context)
      object.cb.apply(object.context, data)
    })
  }

  /**
   * Detach handler from event
   */
  off(name, callback, context) {
    this.remove(name, callback, context)
  }

  remove(name, callback, context) {
    const handlers = this.events.get(name)
    if (!handlers) return

    const index = handlers.findIndex(
      (object) => object.cb === callback && object.context === context
    )
    if (index !== -1) handlers.splice(index, 1)

    if (handlers.length === 0) this.events.delete(name)
  }
}

export default new Emitter()
