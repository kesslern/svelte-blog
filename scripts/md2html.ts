import require from "./require.ts";
const marked = require("marked");

// Compile a markdown file into HTML.
// @param {string} filename The path to the markdown file.
// @return {{date, html, title}} The HTML of, 'utf-8' the post, title, and an extracted date, if any
function md2html(
  filename: string,
): { html: string; attributes: Record<string, string> } {
  const markdown = new TextDecoder().decode(Deno.readFileSync(filename));
  return compileMarkdown(markdown);
}

// Compile markdown into HTML.
function compileMarkdown(
  markdown: string,
): { html: string; attributes: Record<string, string> } {
  const attributeStatus: {
    in: boolean;
    name: string;
  } = {
    in: false,
    name: "",
  };

  const attributes: Record<string, string> = {};

  const renderer = {
    heading(text: string, level: number) {
      if (text.startsWith("--")) {
        attributeStatus.in = true;
        attributeStatus.name = text.substr(2);
        return "";
      }

      if (level == 1 && attributes.title == null) {
        attributes.title = text;
      }

      return `<h${level}>${text}</h${level}>`;
    },
    paragraph(text: string) {
      if (attributeStatus.in) {
        attributes[attributeStatus.name] = text;
        attributeStatus.in = false;
        return "";
      }

      return `<p>${text}</p>`;
    },
  };

  marked.use({ renderer });
  const html = marked(markdown);

  return { html, attributes };
}

export default md2html;
