import require from "./require.ts";
import log from "./logger.ts";
import md2html from "./md2html.ts";
// import rollup from './rollup.ts'

const fs = require("fs");
// const slugify = require('slugify')
// const { stripHtml } = require('string-strip-html')

const outdir = Deno.env.get("outdir") || "public";

async function build() {
  log.start("Starting build process");

  await log.run("Ensuring build directories exist", async () => {
    await ensureDirExists(outdir);
  });

  const fileTree = await log.run("Building file tree", async () => {
    return await log.success(undefined, new FileTree());
  }) as FileTree;

  const markdownTree = await log.run("Building markdown tree", async () => {
    return await log.success(undefined, new MarkdownTree(fileTree));
  }) as MarkdownTree;

  await log.run("Writing markdown files", async () => {
    await log.success(undefined, markdownTree.write());
  });

  Deno.exit(1);

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
    fs.mkdirSync(directoryPath);
  }
}

build();

type FileTreeEntry = {
  name: string;
  path: string;
  type: "directory" | "file";
  children?: FileTreeEntry[];
};

class FileTree {
  content: FileTreeEntry[];

  constructor() {
    const contentPath = Deno.env.get("contentdir") || "content";
    this.content = [
      {
        name: contentPath,
        path: contentPath,
        type: "directory",
        children: FileTree.scanDir(contentPath),
      },
    ];
  }

  // Add all directory files to content and traverse down subdirectories
  static scanDir(directoryPath: string) {
    console.log("Scanning " + directoryPath);
    const content: FileTreeEntry[] = [];
    const files = Deno.readDirSync(directoryPath);
    for (const file of files) {
      console.log(file);
      const filePath = `${directoryPath}/${file.name}`;
      if (file.isDirectory) {
        content.push({
          name: file.name,
          path: filePath,
          type: "directory",
          children: FileTree.scanDir(filePath),
        });
      } else {
        content.push({
          name: file.name,
          path: filePath,
          type: "file",
        });
      }
    }
    return content;
  }
}

type MarkdownPost = {
  html: string;
  attributes: Record<string, string | Date>;
};

type MarkdownTreeBase = {
  name: string;
  path: string;
  type: "directory" | "file";
};

type MarkdownTreeDirectory = MarkdownTreeBase & {
  children: MarkdownTreeEntry[];
};

type MarkdownTreeFile = MarkdownTreeBase & {
  post: MarkdownPost;
};

type MarkdownTreeEntry = MarkdownTreeDirectory | MarkdownTreeFile;

class MarkdownTree {
  content: MarkdownTreeEntry[];

  constructor(fileTree: FileTree) {
    this.content = MarkdownTree.scanDir(fileTree.content) || [];
  }

  write() {
    this.writeEntries(this.content);
  }

  private writeEntries(entries: MarkdownTreeEntry[]) {
    for (const entry of entries) {
      if (entry.type === "directory") {
        const dirEntry = entry as MarkdownTreeDirectory;
        ensureDirExists("public/" + entry.path);
        this.writeEntries(dirEntry.children);
      } else {
        const markdownFile = entry as MarkdownTreeFile;
        console.log(
          "Writing markdown: " + entry.name + " to " + "public/" +
            markdownFile.path,
        );
        fs.writeFileSync(
          "public/" + markdownFile.path.replace(/\.md$/, ".html"),
          markdownFile.post.html,
        );
      }
    }
  }

  private static scanDir(directory: FileTreeEntry[]): MarkdownTreeEntry[] {
    const content: MarkdownTreeEntry[] = [];
    for (const file of directory) {
      if (file.type === "directory") {
        const directoryFile = file as MarkdownTreeDirectory;
        content.push({
          name: directoryFile.name,
          path: directoryFile.path,
          type: "directory",
          children: MarkdownTree.scanDir(directoryFile.children),
        });
      } else {
        console.log("Compiling markdown: " + file.path);
        content.push({
          name: file.name,
          path: file.path,
          type: "file",
          post: md2html(file.path),
        });
      }
    }

    return content;
  }
}

// Parse a string into a date.
// @param {string} date A YYYY-MM-DD date string.
// @return {date} the date or null if parsing fails.
function parseDate(date?: string): Date | undefined {
  const match = date?.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);

  if (match) {
    const result = new Date(+match[1], +match[2] - 1, +match[3]);
    if (result.getMonth() === +match[2] - 1) return result;
  }

  return undefined;
}
