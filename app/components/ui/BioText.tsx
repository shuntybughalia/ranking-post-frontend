import { splitBioLinks } from "@/lib/profile";

/** Renders a plain-text bio with its http(s) URLs as links. */
export default function BioText({ bio, className = "" }: { bio: string; className?: string }) {
  return (
    <p className={`whitespace-pre-line break-words ${className}`}>
      {splitBioLinks(bio).map((part, index) =>
        part.href ? (
          <a
            key={index}
            href={part.href}
            target="_blank"
            // User-supplied links: don't pass ranking or the opener to them.
            rel="nofollow ugc noopener noreferrer"
            className="font-medium text-gold-dark underline-offset-2 hover:underline"
          >
            {part.text.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        ) : (
          part.text
        ),
      )}
    </p>
  );
}
