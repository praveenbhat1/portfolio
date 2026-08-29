/**
 * Null-safe DOM helpers.
 *
 * The hero entrance previously chained `.classList` straight off
 * `document.querySelector(...)`, so renaming a single class in the markup threw
 * a TypeError that took out the rest of init — including everything main.js
 * runs afterwards. These helpers make a missing node a no-op instead.
 */

export function qs(selector, scope = document) {
  return scope.querySelector(selector)
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector))
}

/** Add classes to the first match, if it exists. */
export function show(selector, ...classes) {
  const el = qs(selector)
  if (el) el.classList.add(...classes)
  return el
}

/** Add classes to every match. */
export function showAll(selector, ...classes) {
  const els = qsa(selector)
  els.forEach((el) => el.classList.add(...classes))
  return els
}
