import { projectsData } from './work-data.js'

export function mountWorkSection() {
  const scene = document.querySelector('.js-scene')
  if (!scene) return

  // Duplicate the 5 projects 2 times to make 10 works total
  const repeatedProjects = []
  const repeats = 2
  
  for (let r = 0; r < repeats; r++) {
    projectsData.forEach((project, idx) => {
      repeatedProjects.push({
        ...project
      })
    })
  }

  // Shuffle projects slightly to make it feel organic
  const shuffled = [...repeatedProjects]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const html = shuffled.map((work, index) => {
    const key = Math.random().toString(36).slice(2, 6) + '-' + String(index + 1).padStart(2, '0') + '/' + String(shuffled.length).padStart(2, '0')
    return `
      <a-work class="s__scene__work s__scene__work--video js-work">
        <div class="a__inner">
          <a href="${work.site}" target="_blank">
            <video
              data-src="${work.src}"
              class="a__video js-video"
              loop
              muted
              playsinline
              width="1082"
              height="636"
            ></video>

            <div class="a__caption">
              <div class="a__caption__text">
                ${work.caption || work.title}
              </div>
              <div class="a__caption__key">
                ${work.tags || ''}
              </div>
            </div>
          </a>
        </div>
      </a-work>
    `
  }).join('')

  scene.innerHTML = html
}
