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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://monomanga.com.tr/"
  ),
  title: "Manga Oku | En Yeni, Popüler ve Ücretsiz Mangalar - Monomanga",
  description:
    "Monomanga ile en yeni, popüler ve ücretsiz manga, webtoon ve webnovel'leri çevrimiçi okuyun. Türkçe ve İngilizce manga arşivi, güncel bölümler, favori seriler, anime, manhwa, çizgi roman, light novel ve çok daha fazlası. Mobil uyumlu, hızlı ve reklamsız okuma deneyimi.",
  keywords: [
    "manga oku",
    "monomanga",
    "mono manga",
    "mono manga oku",
    "monomanga.com.tr",
    "monomanga.com",
    "ücretsiz manga",
    "türkçe manga",
    "türkçe webtoon",
    "türkçe webnovel",
    "türkçe light novel",
    "türkçe çizgi roman",
    "türkçe anime",
    "türkçe manhwa",
    "türkçe çizgi roman",
    "türkçe light novel",
    "türkçe webnovel",
    "türkçe manga oku",
    "popüler manga",
    "yeni manga",
    "webtoon oku",
    "webnovel oku",
    "manga indir",
    "manga sitesi",
    "manga listesi",
    "anime manga",
    "çevrimiçi manga",
    "manga önerileri",
    "manga platformu",
    "Türkçe manga",
    "İngilizce manga",
    "Monomanga",
    "manga güncel",
    "manga bölümleri",
    "manga okuma sitesi",
    "webtoon platformu",
    "webnovel platformu",
    "manhwa oku",
    "light novel oku",
    "çizgi roman oku",
    "manga arşivi",
    "mobil manga",
    "reklamsız manga",
    "hızlı manga",
    "favori manga",
    "en iyi manga",
    "manga topluluğu",
    "anime izle",
    "manga forum",
    "manga haberleri",
    "manga inceleme",
    "manga paylaşım",
    "manga çeviri",
    "manga güncelleme",
    "manga öneri",
    "manga karakterleri",
    "manga türleri",
    "manga serileri",
  ],
  author: "Monomanga",
  publisher: "Monomanga",
  openGraph: {
    title: "Manga Oku | En Yeni, Popüler ve Ücretsiz Mangalar - Monomanga",
    description:
      "Monomanga ile en yeni, popüler ve ücretsiz manga, webtoon, manhwa ve webnovel'leri çevrimiçi okuyun. Mobil uyumlu, reklamsız ve hızlı okuma deneyimi.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://monomanga.com.tr/",
    siteName: "Monomanga",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Monomanga Logo",
      },
    ],
    locale: "tr_TR",
    type: "website",
    authors: ["Monomanga"],
    publishedTime: "2023-01-01T00:00:00+03:00",
    modifiedTime: "2025-07-25T00:00:00+03:00",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manga Oku | En Yeni, Popüler ve Ücretsiz Mangalar - Monomanga",
    description:
      "Monomanga ile en yeni, popüler ve ücretsiz manga, webtoon, manhwa ve webnovel'leri çevrimiçi okuyun. Mobil uyumlu, reklamsız ve hızlı okuma deneyimi.",
    images: [process.env.NEXT_PUBLIC_BASE_URL + "/og-image.png"],
    site: "@monomanga",
    creator: "@monomanga",
    domain: "monomanga.com.tr",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
    bingBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://monomanga.com.tr/",
    languages: {
      tr: process.env.NEXT_PUBLIC_BASE_URL + "/tr",
      en: process.env.NEXT_PUBLIC_BASE_URL + "/en",
    },
  },
  themeColor: "#18181b",
  category: "Entertainment",
};

export default async function RootLayout({ children, params: { locale } }) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  // const randomNumber = Math.floor(Math.random() * 2);

  return (
    <html
      lang={locale}
      className={`dark dark-theme bg-grid-white/[0.02]`}
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
