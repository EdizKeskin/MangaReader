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
console.log(process.env.NEXT_PUBLIC_BASE_URL);

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://manga-lilac.vercel.app/"
  ),
  title: "Manga Oku | En Yeni ve Popüler Mangalar",
  description:
    "Ücretsiz manga ve webnovel okuyabileceğiniz platform. Popüler, en çok okunan ve yeni çıkan mangaları keşfedin.",
  keywords: [
    "manga oku",
    "webtoon",
    "manga sitesi",
    "popüler manga",
    "ücretsiz manga oku",
    "manga listesi",
    "webnovel",
  ],
  openGraph: {
    title: "Manga Oku | En Yeni ve Popüler Mangalar",
    description:
      "Ücretsiz manga ve webnovel okuyabileceğiniz platform. Popüler, en çok okunan ve yeni çıkan mangaları keşfedin.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://manga-lilac.vercel.app/",
    siteName: "MangaOku",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Manga Oku | En Yeni Mangalar",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manga Oku | En Yeni ve Popüler Mangalar",
    description: "En yeni ve popüler mangaları ücretsiz oku.",
    images: [process.env.NEXT_PUBLIC_BASE_URL + "/og-image.png"],
    site: "@mangaoku",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
