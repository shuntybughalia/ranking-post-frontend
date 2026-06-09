export function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseArticleContent(content: string): string[] {
  const trimmed = content.trim();

  if (!trimmed || stripHtml(trimmed).length === 0) {
    throw new Error("Article content is required.");
  }

  if (isHtmlContent(trimmed)) {
    return [trimmed];
  }

  const paragraphs = trimmed
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    throw new Error("Article content is required.");
  }

  return paragraphs;
}

export function contentToEditorHtml(content: string[]): string {
  if (content.length === 0) return "";

  if (content.length === 1 && isHtmlContent(content[0])) {
    return content[0];
  }

  return content
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
