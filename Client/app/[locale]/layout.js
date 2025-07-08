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

export default async function RootLayout({ children, params: { locale } }) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const randomNumber = Math.floor(Math.random() * 2);

  // Metadata values
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://manga-lilac.vercel.app/";
  const title = "Manga Oku | En Yeni ve Popüler Mangalar";
  const description =
    "Ücretsiz manga ve webnovel okuyabileceğiniz platform. Popüler, en çok okunan ve yeni çıkan mangaları keşfedin.";
  const keywords = [
    "manga oku",
    "webtoon",
    "manga sitesi",
    "popüler manga",
    "ücretsiz manga oku",
    "manga listesi",
    "webnovel",
  ];
  const ogImage = `${baseUrl}/og-image.png`;

  return (
    <html
      lang={locale}
      className={`dark dark-theme ${
        randomNumber === 0 ? "bg-dot-white/[0.08]" : "bg-grid-white/[0.02]"
      }`}
      suppressHydrationWarning
    >
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(", ")} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:site_name" content="MangaOku" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Manga Oku | En Yeni Mangalar" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta
          name="twitter:description"
          content="En yeni ve popüler mangaları ücretsiz oku."
        />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@mangaoku" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
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
