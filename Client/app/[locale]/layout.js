import Navbar from "@/components/Navbar";
import { dark } from "@clerk/themes";
import "./globals.css";
import "@/styles/background.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";
import { enUS, trTR } from "@clerk/localizations";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Manga Oku | Popüler Mangalar",
  description: "MangaOku ile en yeni ve popüler mangaları ücretsiz okuyun.",
  keywords: ["manga oku", "webtoon", "ücretsiz manga"],
};

export default async function RootLayout({ children, params: { locale } }) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const randomNumber = Math.floor(Math.random() * 2);

  return (
    <html
      lang={locale}
      className={`dark dark-theme ${
        randomNumber === 0 ? "bg-dot-white/[0.08]" : "bg-grid-white/[0.02]"
      }`}
      suppressHydrationWarning
    >
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
          localization={locale === "en" ? enUS : trTR}
        >
          <body>
            <Providers>
              <Navbar />
              <main>{children}</main>
              <Toaster
                toastOptions={{
                  style: {
                    background: "#333",
                    color: "#fff",
                  },
                }}
              />
            </Providers>
            <SpeedInsights />
            <Analytics />
          </body>
        </ClerkProvider>
      </NextIntlClientProvider>
    </html>
  );
}
