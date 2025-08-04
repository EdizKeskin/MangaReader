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
import Script from "next/script";
import { Inter } from "next/font/google";
import GTM from "@/components/GTM";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], weight: "400" });
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://monomanga.com.tr/"
  ),
  title: "Manga Oku Mono Manga | En Yeni, Popüler ve Ücretsiz Mangalar",
  description:
    "Monomanga ile en yeni, popüler ve ücretsiz manga, webtoon ve webnovel'leri çevrimiçi okuyun. Mono Manga ile Mobil uyumlu, hızlı ve reklamsız okuma deneyimi.",
  keywords: [
    // Primary brand keywords (8)
    "manga oku",
    "monomanga",
    "mono manga",
    "ücretsiz manga",
    "türkçe manga",
    "manga okuma",
    "manga sitesi",
    "çevrimiçi manga",

    // Content types (8)
    "manga",
    "webtoon",
    "manhwa",
    "light novel",
    "türkçe webtoon",
    "türkçe manhwa",
    "çizgi roman",
    "anime",

    // Quality keywords (8)
    "popüler manga",
    "yeni manga",
    "güncel manga",
    "en iyi manga",
    "reklamsız manga",
    "hızlı manga",
    "kaliteli manga",
    "mobil manga",

    // Genre keywords (10)
    "aksiyon manga",
    "romantik manga",
    "komedi manga",
    "fantastik manga",
    "shounen manga",
    "shoujo manga",
    "isekai manga",
    "korku manga",
    "dram manga",
    "spor manga",

    // Platform features (8)
    "manga arşivi",
    "manga arama",
    "mobil uyumlu",
    "manga topluluğu",
    "manga önerileri",
    "manga inceleme",
    "dijital manga",
    "otaku",

    // Long-tail keywords (8)
    "en iyi ücretsiz manga sitesi",
    "türkçe manga okuma sitesi",
    "mobil manga okuma",
    "reklamsız manga okuma",
    "manga çevrimiçi okuma",
    "türkiye manga",
    "manga uygulaması",
    "anime kültürü",
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
      tr: process.env.NEXT_PUBLIC_BASE_URL,
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

  return (
    <html
      lang={locale}
      className={`dark dark-theme bg-grid-white/[0.02] ${inter.className}`}
    >
      <Script
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_ID}"}`}
        strategy="afterInteractive"
      />
      <head>
        <head>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}');
          `}
          </Script>
          <Script id="gtm-script" strategy="afterInteractive">
            {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
          </Script>
        </head>
      </head>
      <body>
        <GTM />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClerkProvider
            appearance={{
              baseTheme: dark,
            }}
            localization={locale === "en" ? enUS : trTR}
          >
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
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
