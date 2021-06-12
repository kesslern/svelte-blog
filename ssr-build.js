const rollup = require('rollup')
const fs = require('fs')
const marked = require('marked')
const resolve = require('@rollup/plugin-node-resolve')
const { exit } = require('process')
const svelte = require('rollup-plugin-svelte')
const commonjs = require('@rollup/plugin-commonjs')
const css = require('rollup-plugin-css-only')

async function build() {
  const bundle = await rollup.rollup({
    input: ['src/Index.svelte'],
    plugins: [
      svelte({
        compilerOptions: {
          dev: true,
          generate: "ssr",
        }
      }),
      resolve.default({
        browser: true,
        dedupe: ['svelte']
      }),
      css({ output: 'ssr.css' }),
      commonjs(),
    ]
  });

  // or write the bundle to disk
  await bundle.write({
    format: "umd",
    dir: "build",
    name: 'Index',
  });

  const Index = require('./build/Index.js')

  var inDateField = false
  var date = null

  const renderer = {
    heading(text, level) {
      if (text === "Date") {
        inDateField = true
        return ""
      }

      return `<h${level}>${text}</h${level}>`
    },
    paragraph(text) {
      if (inDateField) {
        date = text
        inDateField = false
        return ""
      }
      return `<p>${text}</p>`
    }
  };

  const post = fs.readFileSync("post.md", "utf-8", function (err, result) {
    if (err) console.log('error', err);
  })

  marked.use({ renderer })

  const html = marked(post)

  // validate year as 4 digits, month as 01-12, and day as 01-31 
  if (date = date.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)) {
    // make a date
    date[0] = new Date(+date[1], +date[2] - 1, +date[3]);
    // check if month stayed the same (ie that day number is valid)
    if (date[0].getMonth() === +date[2] - 1)
      date = date[0]
  } else {
    console.log('invalid date')
    exit(1)
  }

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