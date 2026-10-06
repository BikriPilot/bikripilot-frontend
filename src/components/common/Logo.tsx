import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
    >
      <Image
        src="/images/bikrio.png"
        alt="Bikrio"
        width={36}
        height={36}
        priority
        className="size-9 rounded-lg object-cover"
      />
      {!compact ? <span>Bikrio</span> : null}
    </Link>
  );
}
