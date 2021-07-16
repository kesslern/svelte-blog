import fs from 'fs'
import marked from 'marked'

// Parse a string into a date.
// @param {string} date A YYYY-MM-DD date string.
// @return {date} the date or null if parsing fails.
function parseDate(date) {
  if ((date = date.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/))) {
    date[0] = new Date(+date[1], +date[2] - 1, +date[3])
    if (date[0].getMonth() === +date[2] - 1) return date[0]
  } else {
    return null
  }
}

// Compile a markdown file into HTML.
// @param {string} filename The path to the markdown file.
// @return {{date, html, title}} The HTML of the post, title, and an extracted date, if any
async function md2html(filename) {
  var inDateField = false
  var title = null
  var date = null

  const renderer = {
    heading(text, level) {
      if (text === 'Date') {
        inDateField = true
        return ''
      }

      if (level == 1 && title == null) {
        title = text
      }

      return `<h${level}>${text}</h${level}>`
    },
    paragraph(text) {
      if (inDateField) {
        date = text
        inDateField = false
        return ''
      }
      return `<p>${text}</p>`
    },
  }

  const post = fs.readFileSync(`${filename}`, 'utf-8', function (err, result) {
    if (err) console.log('error', err)
  })

  marked.use({ renderer })
  const html = marked(post)
  date = parseDate(date)

  return { date, html, title }
}

export default md2html
