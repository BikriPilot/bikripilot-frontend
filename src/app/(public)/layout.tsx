import { FloatingSupportButton } from "@/components/landing/FloatingSupportButton";
import { PublicFooter } from "@/components/landing/PublicFooter";
import { PublicNavbar } from "@/components/landing/PublicNavbar";
import { publicServerApi } from "@/lib/api/public.api";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await publicServerApi.getConfig();
  return (
    <>
      <PublicNavbar />
      {children}
      <PublicFooter config={config} />
      <FloatingSupportButton config={config} />
    </>
  );
}
