import { isHtmlContent } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";

interface ArticleContentProps {
  content: string[];
}

export default function ArticleContent({ content }: ArticleContentProps) {
  if (content.length === 1 && isHtmlContent(content[0])) {
    return (
      <div
        className="article-prose mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content[0]) }}
      />
    );
  }

  return (
    <div className="prose prose-slate mt-8 max-w-none">
      {content.map((paragraph, index) => (
        <p
          key={index}
          className="mb-5 text-base leading-relaxed text-muted last:mb-0"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
