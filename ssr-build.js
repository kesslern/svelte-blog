const fs = require('fs')
const { default: slugify } = require('slugify')
const { stripHtml } = require('string-strip-html')
const logger = require('./scripts/logger.js')
const md2html = require('./scripts/md2html')
const rollup = require('./scripts/rollup')

const outdir = process.env['outdir'] || 'public'
const postsDir = process.env['postsdir'] || 'posts'

const log = new logger()

async function build() {
  log.start('Starting build process')

  await log.run('Ensuring build directories exist', () => {
    ensureDirExists(outdir)
    ensureDirExists(`${outdir}/post`)
  })

  let postsPaths
  await log.run('Finding posts', () => {
    postsPaths = getPosts()
    log.success(`Found ${postsPaths.length} posts`)
  })

  let posts
  await log.run('Building posts', async () => {
    posts = await Promise.all(
      postsPaths.map(async (postPath) => await md2html(postPath)),
    )
  })

  let Index, Post
  await log.run('Building svelte components', async () => {
    Index = await rollup('Index')
    Post = await rollup('Post')
  })

  await log.run('Writing posts', () => {
    posts.forEach((post) => {
      post.slug = slugify(stripHtml(post.title).result)
      const postPath = `${outdir}/post/${post.slug}.html`
      fs.writeFileSync(postPath, Post.render({ ...post }).html)
      post.url = `/post/${post.slug}.html`
    })
  })

  let index
  await log.run('Rendering index', () => {
    index = Index.render({ posts })
  })

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
