const fs = require('fs')
const md2html = require('./scripts/md2html')
const rollup = require('./scripts/rollup')

async function build() {
  const Index = await rollup('Index')
  const { date, html } = await md2html('post.md')

  const params = {
    css: "",
    html,
    date,
  }

  const index = Index.render(params);

  fs.mkdir("public", function (err, result) {
    if (err && err.code != "EEXIST") console.log('error', err);
  })

  fs.writeFileSync("public/index.html", index.html, function (err, result) {
    if (err) console.log('error', err);
  })
}

build()