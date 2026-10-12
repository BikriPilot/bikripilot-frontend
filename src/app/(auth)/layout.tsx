import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Logo } from "@/components/common/Logo";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--primary-soft),transparent_42%),var(--background)] p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-[440px]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BikriPilot
        </p>
      </div>
    </main>
  );
}
