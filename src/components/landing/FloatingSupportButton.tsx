import { MessageCircle, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { PublicConfig } from "@/types/publicConfig";

export async function FloatingSupportButton({
  config,
}: {
  config: PublicConfig | null;
}) {
  if (!config?.supportWhatsapp && !config?.supportPhone) return null;
  const t = await getTranslations("common");
  return (
    <div className="fixed bottom-5 right-5 z-30 flex gap-2">
      {config.supportWhatsapp ? (
        <a
          aria-label={t("whatsappSupport")}
          href={`https://wa.me/${config.supportWhatsapp.replace(/\D/g, "")}`}
          className="grid size-12 place-items-center rounded-full bg-success text-white shadow-lg"
        >
          <MessageCircle className="size-5" />
        </a>
      ) : null}
      {config.supportPhone ? (
        <a
          aria-label={t("callSupport")}
          href={`tel:${config.supportPhone}`}
          className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Phone className="size-5" />
        </a>
      ) : null}
    </div>
  );
}
