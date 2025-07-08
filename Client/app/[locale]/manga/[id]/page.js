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
  return {
    title: manga.name,
    description: manga.summary,

    keywords: [
      manga.name,
      manga.name + "türkçe",
      manga.name + "türkçe oku",
      "webtoon",
      "manga sitesi",
      "manga oku",
      "manga",
      "webnovel",
    ],
    openGraph: {
      title: manga.name,
      description: manga.summary,
      images: [manga.coverImage],
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${params.id}`,
      siteName: "MangaOku",
    },
  };
}
