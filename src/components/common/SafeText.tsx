import Link from "next/link";

const urlPattern = /(https?:\/\/[^\s]+)/g;
export function SafeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {text.split(urlPattern).map((part, index) =>
        part.match(/^https?:\/\//) ? (
          <Link
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary underline underline-offset-2"
          >
            {part}
          </Link>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </span>
  );
}
