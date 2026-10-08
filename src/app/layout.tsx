import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { runtimeConfig } from "@/config/runtime";
import { VisitTracker } from "@/components/layout/VisitTracker";
import { Providers } from "./providers";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(runtimeConfig.siteUrl),
  title: "Bikrio — Facebook selling made easy",
  description: "Turn Facebook messages into delivered orders with Bikrio.",
  openGraph: {
    title: "Bikrio — Facebook selling made easy",
    description: "Turn Facebook messages into delivered orders with Bikrio.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      className={`${hindSiliguri.variable} ${inter.variable} ${locale === "bn" ? "font-bangla" : "font-english"}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <VisitTracker />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
