import { getChapterBySlug, getMangaBySlug } from "@/functions";
import ClientPage from "./ClientPage";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import axios from "axios";

async function getSubscriber(userId) {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_MONGO_DB_URL + "subscriber/" + userId
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function MangaRead({ params }) {
  const chapter = await getChapterBySlug(params.chapter, params.id);
  const user = await currentUser();

  // If chapter is not published yet, check for subscriber
  const publishDate = new Date(chapter.chapter.publishDate);
  if (publishDate > new Date()) {
    if (!user) {
      redirect("/pricing");
    }
    const subscriber = await getSubscriber(user.id);
    if (!subscriber || new Date(subscriber.expireAt) <= new Date()) {
      redirect("/pricing");
    }
  }

  return <ClientPage params={params} />;
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
