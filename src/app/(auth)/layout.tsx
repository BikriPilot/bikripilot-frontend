import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-primary/20">
      {/* Fixed Fullscreen Background Image */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <Image
          src="/images/auth-bg.webp"
          alt="BikriPilot Authentication Background"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        {/* Ambient Dark Overlay and Gradients for Text Contrast & Visual Hierarchy */}
        <div className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/70 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/75" />
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(2,6,23,0.55)_100%]" />
      </div>

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 hover:bg-slate-900/80 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white backdrop-blur-md transition-all shadow-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeToggle className="bg-slate-900/60 hover:bg-slate-900/80 border-white/10 text-slate-200" />
        </div>
      </header>

      {/* Main Content Area (Form sits comfortably with top and bottom spacing so the image shines through) */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-5 sm:py-12 z-10">
        <div className="w-full max-w-[460px]">
          {/* Logo Header */}
          <div className="mb-4 sm:mb-6 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-card/90 dark:bg-slate-900/80 px-4 py-2 backdrop-blur-md border border-border/60 dark:border-white/10 shadow-lg">
              <Logo />
            </div>
          </div>

          {/* Auth Card Slot */}
          {children}
        </div>
      </main>

      {/* Bottom Footer Area */}
      <footer className="w-full max-w-5xl mx-auto px-4 pt-2 sm:pt-4 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-slate-400 z-10">
        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-slate-300">
            <BadgeCheck className="size-3.5 text-primary" />
            <span>Official Meta Tech Provider</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-slate-300">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>AES-256 Secured</span>
          </span>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
          <Link href="/privacy" className="hover:text-slate-200 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-200 transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-slate-200 transition-colors">
            Contact
          </Link>
          <span>© {new Date().getFullYear()} BikriPilot</span>
        </div>
      </footer>
    </div>
  );
}
