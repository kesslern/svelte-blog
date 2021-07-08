const fs = require('fs')
const md2html = require('./scripts/md2html')
const rollup = require('./scripts/rollup')

const outdir = process.env["outdir"] || "public"
const postsDir = process.env["postsdir"] || "posts"

async function build() {
  const posts = await getPosts()
  console.log(posts);

  const Index = await rollup('Index')
  const { date, html } = await md2html('post.md')

  const params = {
    css: "",
    html,
    date,
  }

  copyStatic()
  const index = Index.render(params)

  fs.mkdir(outdir, err => {
    if (err && err.code != "EEXIST") {
      console.log('error', err);
      process.exit(1);
    }
  })

  fs.writeFileSync(`${outdir}/index.html`, index.html, err => {
    if (err) {
      console.log('error', err);
      process.exit(1);
    }
  })
}

// List all files in the posts directory.
function getPosts() {
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.log('error getting posts', err);
      process.exit(1);
    }
    return files;
  })
}

// Copy files in static/ to outdir/
function copyStatic() {
  const staticDir = 'static'
  const staticFiles = fs.readdirSync(staticDir)
  staticFiles.forEach(file =>{
    const src = `${staticDir}/${file}`
    const dest = `${outdir}/${file}`
    fs.copyFileSync(src, dest)
  })
}

build()