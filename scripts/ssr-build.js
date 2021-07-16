import fs from 'fs'
import slugify from 'slugify'
import { stripHtml } from 'string-strip-html'
import rollup from './rollup.js'

import md2html from './md2html.js'
import log from './logger.js'

const outdir = process.env['outdir'] || 'public'
const postsDir = process.env['postsdir'] || 'posts'

async function build() {
  log.start('Starting build process')

  await log.run('Ensuring build directories exist', () => {
    ensureDirExists(outdir)
    ensureDirExists(`${outdir}/post`)
  })

  const postsPaths = await log.run('Finding posts', () => {
    const result = getPosts()
    log.success(`Found ${result.length} posts`)
    return result
  })

  const posts = await log.run(
    'Building posts',
    async () =>
      await Promise.all(
        postsPaths.map(async (postPath) => await md2html(postPath)),
      ),
  )

  const { Index, Post } = await log.run(
    'Building svelte components',
    async () => ({
      Index: await rollup('Index'),
      Post: await rollup('Post'),
    }),
  )

  posts.forEach((post) => {
    post.slug = slugify(stripHtml(post.title).result)
    post.path = `${outdir}/post/${post.slug}.html`
  })

  await log.run(`Writing posts to ${outdir}/post/`, () => {
    posts.forEach((post) => {
      fs.writeFileSync(post.path, Post.render({ ...post }).html)
      post.url = `/post/${post.slug}.html`
    })
  })

  const index = await log.run('Rendering index', () => Index.render({ posts }))

  await log.run('Copying static files', copyStatic)

  await log.run('Writing index.html', () => {
    fs.writeFileSync(`${outdir}/index.html`, index.html)
  })
}

// List all files in the posts directory.
function getPosts() {
  const posts = []
  fs.readdirSync(postsDir).forEach((file) => {
    posts.push(`${postsDir}/${file}`)
  })
  return posts
}

// Copy files in static/ to outdir/
function copyStatic() {
  const staticDir = 'static'
  const staticFiles = fs.readdirSync(staticDir)
  staticFiles.forEach((file) => {
    const src = `${staticDir}/${file}`
    const dest = `${outdir}/${file}`
    fs.copyFileSync(src, dest)
  })
}

// Ensure a directory exists.
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

build()
