import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALES, type LocaleValue } from "@/constants/enums";

export default getRequestConfig(async () => {
  const value = (await cookies()).get("bk_locale")?.value;
  const locale: LocaleValue = LOCALES.includes(value as LocaleValue)
    ? (value as LocaleValue)
    : DEFAULT_LOCALE;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
