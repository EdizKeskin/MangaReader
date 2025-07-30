import { getChapterBySlug, getMangaBySlug } from "@/functions";

import ClientPage from "./ClientPage";

export default function MangaRead({ params }) {
  return (
    <>
      <ClientPage params={params} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const manga = await getMangaBySlug(params.id);
  const chapter = await getChapterBySlug(params.chapter, params.id);

  return {
    title: manga.name + " - " + chapter.chapter.title + " oku | Mono Manga",
    description: manga.summary,
    keywords: [
      manga.name,
      manga.name + "türkçe",
      manga.name + "türkçe oku",
      manga.name + " chapter " + chapter.chapter.chapterNumber,
      manga.name + " bölüm " + chapter.chapter.chapterNumber,
      "webtoon",
      "manga sitesi",
      "manga oku",
      "manga",
      "webnovel",
    ],
    openGraph: {
      title: `${manga.name} - ${chapter.chapter.title} oku | Mono Manga`,
      description: manga.name + " - " + chapter.chapter.title,
      images: [manga.coverImage],
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.id}/${params.chapter}`,
      siteName: "MangaOku",
    },
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.id}/${params.chapter}`,
    alternates: {
      en: `${process.env.NEXT_PUBLIC_BASE_URL}/en/${params.id}/${params.chapter}`,
    },
  };
}
