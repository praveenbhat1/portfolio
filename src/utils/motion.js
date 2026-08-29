/**
 * Single source of truth for the user's motion preference.
 * Every entrance/scroll/idle animation in the site funnels through this so the
 * setting is honoured consistently — including Lenis smooth scroll, which is
 * the single thing `prefers-reduced-motion` is most specifically about.
 */
const query = window.matchMedia('(prefers-reduced-motion: reduce)')

export function prefersReducedMotion() {
  return query.matches
}

export function onMotionPreferenceChange(handler) {
  query.addEventListener('change', () => handler(query.matches))
}
