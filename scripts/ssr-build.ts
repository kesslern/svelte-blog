import require from './require.ts'
import log from './logger.ts'
import md2html from './md2html.ts'
// import rollup from './rollup.ts'

const fs = require('fs')
// const slugify = require('slugify')
// const { stripHtml } = require('string-strip-html')

const outdir = Deno.env.get('outdir') || 'public'

async function build() {
  log.start('Starting build process')

  await log.run('Ensuring build directories exist', async () => {
    await ensureDirExists(outdir)
  })

  const fileTree = await log.run('Building file tree', async () => {
    return await log.success(undefined, new FileTree())
  }) as FileTree

  console.log("File tree:")
  console.log(JSON.stringify(fileTree))
  console.log("")
  const markdownTree = await log.run('Building markdown tree', async () => {
    return await log.success(undefined, new MarkdownTree(fileTree))
  }) as MarkdownTree

  await log.run('Writing markdown files', async () => {
    await log.success(undefined, markdownTree.write())
  })

  console.log(JSON.stringify(markdownTree))
  Deno.exit(1)

  // const { Index, Post } = await log.run(
  //   'Building svelte components',
  //   async () => ({
  //     Index: await rollup('Index'),
  //     Post: await rollup('Post'),
  //   }),
  // )

  // posts.forEach((post) => {
  //   post.slug = slugify(stripHtml(post.title).result)
  //   post.path = `${outdir}/post/${post.slug}.html`
  // })

  // await log.run(`Writing posts to ${outdir}/post/`, () => {
  //   posts.forEach((post) => {
  //     fs.writeFileSync(post.path, Post.render({ ...post }).html)
  //     post.url = `/post/${post.slug}.html`
  //   })
  // })

  // const index = await log.run('Rendering index', () => Index.render({ posts }))

  // await log.run('Copying static files', copyStatic)

  // await log.run('Writing index.html', () => {
  //   fs.writeFileSync(`${outdir}/index.html`, index.html)
  // })
}

// Copy files in static/ to outdir/
// function copyStatic() {
//   const staticDir = 'static'
//   const staticFiles = fs.readdirSync(staticDir)
//   staticFiles.forEach((file) => {
//     const src = `${staticDir}/${file}`
//     const dest = `${outdir}/${file}`
//     fs.copyFileSync(src, dest)
//   })
// }

// Ensure a directory exists.
function ensureDirExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath)
  }
}

build()

type FileTreeEntry = {
  name: string,
  path: string,
  type: 'directory' | 'file',
  children?: FileTreeEntry[]
}

class FileTree {
  content: FileTreeEntry[]

  constructor() {
    const contentPath = Deno.env.get('contentdir') || 'content'
    this.content = [
      {
        name: contentPath,
        path: contentPath,
        type: 'directory',
        children: FileTree.scanDir(contentPath)
      },
    ]
  }

  // Add all directory files to content and traverse down subdirectories
  static scanDir(directoryPath: string) {
    console.log("Scanning " + directoryPath)
    const content: FileTreeEntry[] = []
    const files = Deno.readDirSync(directoryPath)
    for (const file of files) {
      console.log(file)
      const filePath = `${directoryPath}/${file.name}`
      if (file.isDirectory) {
        content.push({
          name: file.name,
          path: filePath,
          type: 'directory',
          children: FileTree.scanDir(filePath),
        })
      } else {
        content.push({
          name: file.name,
          path: filePath,
          type: 'file',
        })
      }
    }
    return content
  }
}

type MarkdownPost = {
  html: string,
  attributes: Record<string, string | Date>
}

type MarkdownTreeBase = {
  name: string,
  path: string
  type: 'directory' | 'file'
}

type MarkdownTreeDirectory = MarkdownTreeBase & {
  children: MarkdownTreeEntry[]
}

type MarkdownTreeFile = MarkdownTreeBase & {
  post: MarkdownPost
}

type MarkdownTreeEntry = MarkdownTreeDirectory | MarkdownTreeFile

class MarkdownTree {
  content: MarkdownTreeEntry[]

  constructor(fileTree: FileTree) {
    this.content = MarkdownTree.scanDir(fileTree.content) || []
  }

  write() {
    for (const entry of this.content) {
      if (entry.type === 'directory') {
        ensureDirExists(entry.path)
      } else {
        const markdownFile = entry as MarkdownTreeFile
        fs.writeFileSync(markdownFile.path, markdownFile.post.html)
      }
    }
  }

  static scanDir(directory: FileTreeEntry[]): MarkdownTreeEntry[] {

    console.log('Directory')
    console.log(directory)
    const content: MarkdownTreeEntry[] = []
    for (const file of directory) {
      if (file.type === 'directory') {
        const directoryFile = file as MarkdownTreeDirectory
        content.push({
          name: directoryFile.name,
          path: directoryFile.path,
          type: 'directory',
          children: MarkdownTree.scanDir(directoryFile.children),
        })
      } else {
        console.log('Compiling markdown: ' + file.path)
        content.push({
          name: file.name,
          path: file.path,
          type: 'file',
          post: md2html(file.path),
        })
      }
    }

    return content
  }
}
