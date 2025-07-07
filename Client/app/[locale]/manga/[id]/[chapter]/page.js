import {
  getChapterBySlug,
  getChaptersByMangaSlug,
  getMangaBySlug,
} from "@/functions";

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
    title: manga.name + " - " + chapter.chapter.title,
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
      title: manga.name,
      description: manga.name + " - " + chapter.chapter.title,
      images: [manga.coverImage],
      url: `https://manga-lilac.vercel.app/${params.id}/${params.chapter}`,
      siteName: "MangaOku",
    },
  };
}
