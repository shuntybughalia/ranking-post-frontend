import Image from "next/image";

interface FeaturedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function FeaturedImage({
  src,
  alt,
  priority = false,
}: FeaturedImageProps) {
  if (src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      priority={priority}
      sizes="100vw"
    />
  );
}
