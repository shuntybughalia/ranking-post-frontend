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
    // Disallow data: URLs in body HTML — base64 images inflate Mongo writes
    // and make /api/posts hang for minutes on slow networks.
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      img: (tagName, attribs) => {
        const src = attribs.src ?? "";
        if (src.startsWith("data:") || src.length > 2048) {
          return {
            tagName,
            attribs: {
              ...attribs,
              src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
            },
          };
        }
        return { tagName, attribs };
      },
    },
  });
}
