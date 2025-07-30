import { getMangaBySlug } from "@/functions";

import "@/styles/bookmark.css";
import ClientPage from "./ClientPage";

export default function Manga({ params }) {
  return (
    <>
      <ClientPage params={params} />
    </>
  );
}
export async function generateMetadata({ params }) {
  const manga = await getMangaBySlug(params.id);

  // Build optimized keywords array
  const keywords = [
    // Manga specific (8-12 keywords)
    manga.name,
    manga.name + " manga",
    manga.name + " türkçe",
    manga.name + " oku",
    ...(manga.otherNames || []).slice(0, 2), // Limit to 2 other names

    // Author/Artist based (if available)
    ...(manga.author ? [manga.author, manga.name + " " + manga.author] : []),
    ...(manga.artist ? [manga.artist] : []),

    // Type and status specific
    manga.type || "manga",
    manga.type === "webtoon" ? "webtoon türkçe" : null,

    // Release year (if available)
    ...(manga.releaseYear ? [manga.releaseYear + " manga"] : []),

    // Adult content (if applicable)
    ...(manga.isAdult ? ["18+ manga"] : []),

    // Core manga keywords (15 keywords)
    "manga oku",
    "türkçe manga",
    "ücretsiz manga",
    "manga okuma",
    "online manga",
    "dijital manga",
    "mobil manga",
    "webtoon",
    "manhwa",
    "light novel",
    "popüler manga",
    "yeni manga",
    "manga sitesi",
    "Monomanga",
    "otaku",

    // Platform specific (5 keywords)
    "manga okuma sitesi",
    "türkiye manga",
    "manga arşivi",
    "manga platformu",
    "reklamsız manga",

    // Experience keywords (5 keywords)
    "hd manga",
    "kaliteli manga",
    "mobil uyumlu manga",
    "hızlı manga",
    "favori manga",
  ]
    .filter(Boolean)
    .slice(0, 50); // Limit to 50 keywords maximum

  return {
    title: `${manga.name} Oku- Mono manga`,
    description: `Mono Manga'da ${manga.name} manga serisini ücretsiz ve reklamsız olarak okuyun."}`,
    keywords: keywords,
    openGraph: {
      title: `${manga.name} Oku | Mono Manga`,
      description: manga.summary,
      images: [{ url: manga.coverImage, alt: manga.name }],
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.id}`,
      siteName: "Monomanga",
    },
    locale: "tr_TR",
    type: "website",
    Canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.id}`,
    alternates: {
      en: `${process.env.NEXT_PUBLIC_BASE_URL}/en/${params.id}`,
    },
  };
}
