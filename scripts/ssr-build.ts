import require from "./require.ts";
import log from "./logger.ts";
import md2html from "./md2html.ts";
import { Index, Post } from "./svelte.ts";

const fs = require("fs");
const slugify = require("slugify");
const { stripHtml } = require("string-strip-html");

const outdir = Deno.env.get("outdir") || "public";

async function build() {
  log.start("Starting build process");

  await log.run("Ensuring build directories exist", async () => {
    await ensureDirExists(outdir);
  });

  const contentTree = new ContentDirectory();
  contentTree.write();
  copyStatic();
}

// Copy files in static/ to outdir/
function copyStatic() {
  const staticDir = "static";
  const staticFiles = Deno.readDirSync(staticDir);
  for (const file of staticFiles) {
    const src = `${staticDir}/${file.name}`;
    const dest = `${outdir}/${file.name}`;
    console.log({ src, dest });
    Deno.copyFileSync(src, dest);
  }
}

// Ensure a directory exists.
function ensureDirExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
}

type Content = ContentDirectory | ContentFile;

abstract class ContentBase {
  static basePath = Deno.env.get("contentdir") || "content";
  protected fullPath: string;
  protected relativePath: string;
  protected name: string;

  public url: string;
  public title: string;

  constructor(path: string, file: { name: string }, isDir: boolean = false) {
    this.name = file.name;
    this.fullPath = path + file.name;
    this.title = file.name;
    this.relativePath = this.fullPath.replace(
      new RegExp(`^${ContentBase.basePath}(\/)?`),
      "",
    );
    this.url = "/" + isDir
      ? this.relativePath
      : `${this.relativePath}/${this.name}`;
  }
}

class ContentDirectory extends ContentBase {
  private content: Content[] = [];

  constructor(
    directoryPath: string = "",
    file: { name: string } = { name: ContentDirectory.basePath },
  ) {
    super(directoryPath, file, true);
    if (!this.fullPath.endsWith("/")) {
      this.fullPath += "/";
    }

    if (!this.relativePath.endsWith("/")) {
      this.relativePath += "/";
    }

    const files = Deno.readDirSync(this.fullPath);
    for (const file of files) {
      if (file.isDirectory) {
        this.content.push(
          new ContentDirectory(this.fullPath, file),
        );
      } else {
        this.content.push(new ContentFile(this.fullPath, file));
      }
    }
  }

  write() {
    for (const item of this.content) {
      if (item instanceof ContentDirectory) {
        ensureDirExists("public/" + item.relativePath);
        item.write();
      } else if (item instanceof ContentFile) {
        item.write();
      }
    }

    const { html } = Index.render({
      posts: this.content,
    });
    console.log("public/" + this.relativePath + "index.html");
    fs.writeFileSync(
      "public/" + this.relativePath + "index.html",
      html,
    );
  }
}

class ContentFile extends ContentBase {
  private post: {
    html: string;
    attributes: Record<string, string>;
  };

  private filename: string;
  private relativeDirectory: string;

  constructor(basePath: string, file: Deno.DirEntry) {
    super(basePath, file);
    this.post = md2html(basePath + "/" + file.name);
    this.filename = this.buildFilename();
    this.title = this.post.attributes.title ?? this.name;
    this.relativeDirectory = this.buildDirectory();
    this.url = "/" + this.relativeDirectory + this.filename;
    console.log(this);
  }

  private buildFilename(): string {
    if (this.post.attributes.title) {
      return slugify(stripHtml(this.post.attributes.title).result) + ".html";
    } else {
      return this.name.replace(/\.md$/, ".html");
    }
  }

  private buildDirectory(): string {
    return this.relativePath.replace(this.name, "");
  }

  write() {
    const postDate = this.post.attributes.date
      ? parseDate(this.post.attributes.date)
      : null;
    const { html } = Post.render({
      html: this.post.html,
      date: postDate,
    });

    fs.writeFileSync(
      "public/" + this.relativeDirectory + this.filename,
      html,
    );
  }
}

build();

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
