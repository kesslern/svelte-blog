import log from './logger.js'
import md2html from './md2html.js'
import rollup from './rollup.js'

import { createRequire } from 'https://deno.land/std@0.103.0/node/module.ts'
const require = createRequire(import.meta.url)

const fs = require('fs')
const slugify = require('slugify')
const { stripHtml } = require('string-strip-html')

const outdir = Deno.env['outdir'] || 'public'

async function build() {
  log.start('Starting build process')

  await log.run('Ensuring build directories exist', () => {
    ensureDirExists(outdir)
  })

  const fileTree = await log.run('Building file tree', () => {
    return log.success(null, new FileTree())
  })
  console.log(JSON.stringify(fileTree))

  const markdownTree = await log.run('Building markdown tree', () => {
    return log.success(null, new MarkdownTree(fileTree))
  })

  await log.run('Writing markdown files', () => {
    log.success(null, markdownTree.write())
  })

  console.log(JSON.stringify(markdownTree))
  Deno.exit(1)

  // --------------------------------------------------------

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

class FileTree {
  constructor() {
    const contentPath = Deno.env['contentdir'] || 'content'
    this.content = [
      {
        name: contentPath,
        path: contentPath,
        type: 'directory',
        children: FileTree.scanDir(contentPath),
      },
    ]
  }

  // Add all directory files to content and traverse down subdirectories
  static scanDir(directoryPath) {
    const content = []
    const files = fs.readdirSync(directoryPath)
    files.forEach((file) => {
      const filePath = `${directoryPath}/${file}`
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        content.push({
          name: file,
          path: filePath,
          type: 'directory',
          children: FileTree.scanDir(filePath),
        })
      } else {
        content.push({
          name: file,
          path: filePath,
          type: 'file',
        })
      }
    })
    return content
  }
}

class MarkdownTree {
  constructor(fileTree) {
    this.content = MarkdownTree.scanDir(fileTree.content)
  }

  write() {
    const contentKeys = Object.keys(this.content)
    contentKeys.forEach((key) => {
      const file = this.content[key]
      if (file.type === 'directory') {
        const filePath = `${file.path}/${file.name}.html`
        fs.writeFileSync(filePath, '')
      }
    })
  }

  static scanDir(directory) {
    console.log('Directory')
    console.log(directory)
    const content = []
    directory.children.forEach((file) => {
      if (file.type === 'directory') {
        content[file.name] = {
          name: file.name,
          path: file.path,
          type: 'directory',
          children: MarkdownTree.scanDir(file),
        }
      } else {
        console.log('Compiling markdown: ' + file.path)
        content[file.name] = {
          path: file.path,
          type: 'file',
          post: md2html(file.path),
        }
      }
    })
    return content
  }
}
