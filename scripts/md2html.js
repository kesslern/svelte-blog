import fs from 'fs'
import marked from 'marked'

// Parse a string into a date.
// @param {string} date A YYYY-MM-DD date string.
// @return {date} the date or null if parsing fails.
function parseDate(date) {
  if (date == null) {
    return null
  } else if (
    (date = date.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/))
  ) {
    date[0] = new Date(+date[1], +date[2] - 1, +date[3])
    if (date[0].getMonth() === +date[2] - 1) return date[0]
  } else {
    return null
  }
}

// Compile a markdown file into HTML.
// @param {string} filename The path to the markdown file.
// @return {{date, html, title}} The HTML of the post, title, and an extracted date, if any
function md2html(filename) {
  const attributeStatus = {
    in: false,
    name: null,
  }

  const attributes = {}

  const renderer = {
    heading(text, level) {
      if (text.startsWith('--')) {
        attributeStatus.in = true
        return ''
      }

      if (level == 1 && attributes.title == null) {
        attributes.title = text
      }

      return `<h${level}>${text}</h${level}>`
    },
    paragraph(text) {
      if (attributeStatus.in) {
        attributes[attributeStatus.name] = text
        attributeStatus.in = false
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
  if (attributes.date) {
    attributes.date = parseDate(attributes.date)
  }

  return { html, attributes }
}

export default md2html
