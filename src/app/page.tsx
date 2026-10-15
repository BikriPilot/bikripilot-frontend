import { LandingPage } from "@/components/landing/LandingPage";
import { PublicFooter } from "@/components/landing/PublicFooter";
import { PublicNavbar } from "@/components/landing/PublicNavbar";
import { publicServerApi } from "@/lib/api/public.api";

export default async function Home() {
  const config = await publicServerApi.getConfig();
  return (
    <>
      <PublicNavbar />
      <LandingPage />
      <PublicFooter config={config} />
    </>
  );
}
