import { getTranslations } from "next-intl/server";
import { PublicNavbarClient } from "./PublicNavbarClient";

export async function PublicNavbar() {
  const t = await getTranslations("landing");

  return (
    <PublicNavbarClient
      t={{
        navFeatures: t("navFeatures"),
        navWorkflows: t("navWorkflows"),
        navHow: t("navHow"),
        navPricing: t("navPricing"),
        navDocs: t("navDocs"),
        navFaq: t("navFaq"),
        navLogin: t("navLogin"),
        startFree: t("startFree"),
        startTotallyFree: t("startTotallyFree"),
        supportBtn: t("supportBtn"),
        navResources: t("navResources"),
        navTrackOrders: t("navTrackOrders"),
        navContact: t("navContact"),
        navDataDeletion: t("navDataDeletion"),
        navDashboard: t("navDashboard"),
        navLogout: t("navLogout"),
      }}
    />
  );
}
