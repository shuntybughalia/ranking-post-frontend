import Link from "next/link";
import StatusMessage, {
  primaryButton,
  secondaryButton,
} from "@/app/components/ui/StatusMessage";

export default function NotFound() {
  return (
    <StatusMessage
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
    >
      <Link href="/blog" className={primaryButton}>
        Browse the blog
      </Link>
      <Link href="/" className={secondaryButton}>
        Go to homepage
      </Link>
    </StatusMessage>
  );
}
