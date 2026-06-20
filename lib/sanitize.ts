import "server-only";
import sanitizeHtmlLib from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "span",
      "code",
      "pre",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title"],
      span: ["style", "class"],
      code: ["class"],
      pre: ["class"],
      p: ["style", "class"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
  });
}
