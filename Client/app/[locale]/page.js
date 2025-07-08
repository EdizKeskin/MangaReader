import React from "react";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import Title from "@/components/Title";
import { fetchGenres, fetchMangaListHome } from "@/functions";
import Announcements from "@/components/Announcements";
import Footer from "@/components/Footer";
import MangaListArea from "@/sections/MangaListArea";
import "@/styles/background.css";
import TopContent from "@/sections/TopContent";
import { discordIframe } from "@/config";

export default async function Index() {
  const genres = await fetchGenres();
  const mangas = await fetchMangaListHome();

  return (
    <div className="z-20 overflow-hidden">
      <Hero />

      <div className="pb-5 mt-20 ">
        <TopContent data={mangas} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 ">
          <MangaListArea />
          <div className="hidden my-6 md:block">
            <Announcements />

            <div className="my-6">
              <Title text={"categories"} />
            </div>
            <Sidebar genres={genres} />
            <div className="my-6 mr-10">
              <Title text={"Discord"} />
              <iframe
                title="Discord Community"
                src={discordIframe}
                style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: "0.375rem",
                }}
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export const metadata = {
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
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
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
    images: [process.env.NEXT_PUBLIC_BASE_URL + "/logo.png"],
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
