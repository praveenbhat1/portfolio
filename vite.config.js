import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Hashed build output goes to /static, keeping it separate from the
    // verbatim copies of public/assets. They otherwise share /assets, and the
    // two need very different cache policies: build output is content-hashed
    // and safe to cache forever, while character.png / og.png / the demo videos
    // keep their names across deploys and must stay replaceable.
    assetsDir: 'static',
  },
})
