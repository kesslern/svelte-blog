import { createRequire } from 'https://deno.land/std@0.103.0/node/module.ts'
const require = createRequire(import.meta.url)

const fs = require('fs')
const marked = require('marked')

// Parse a string into a date.
// @param {string} date A YYYY-MM-DD date string.
// @return {date} the date or null if parsing fails.
function parseDate(date?: string): Date | undefined {
  const match = date?.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)

  if (match) {
    const result = new Date(+match[1], +match[2] - 1, +match[3])
    if (result.getMonth() === +match[2] - 1) return result
  }

  return undefined
}

// Compile a markdown file into HTML.
// @param {string} filename The path to the markdown file.
// @return {{date, html, title}} The HTML of, 'utf-8' the post, title, and an extracted date, if any
function md2html(filename: string) {
  const attributeStatus: {
    in: boolean,
    name: string,
  } = {
    in: false,
    name: '',
  }

  const attributes: Record<string, string | Date> = {}

  const renderer = {
    heading(text: string, level: number) {
      if (text.startsWith('--')) {
        attributeStatus.in = true
        return ''
      }

      if (level == 1 && attributes.title == null) {
        attributes.title = text
      }

      return `<h${level}>${text}</h${level}>`
    },
    paragraph(text: string) {
      if (attributeStatus.in) {
        attributes[attributeStatus.name] = text
        attributeStatus.in = false
        return ''
      }

      return `<p>${text}</p>`
    },
  }

  const post = Deno.readFileSync(filename)

  marked.use({ renderer })
  const html = marked(new TextDecoder().decode(post))

  const parsedDate = parseDate(attributes.date as string)
  if (parsedDate) {
    attributes.date = parsedDate
  }

  return { html, attributes }
}

export default md2html
