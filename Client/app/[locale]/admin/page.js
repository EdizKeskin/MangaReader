import Title from "@/components/Title";
import {
  fetchAnnouncements,
  fetchChapterCount,
  fetchGenres,
  fetchMangaCount,
  getUserCount,
} from "@/functions";
import { BiImages } from "react-icons/bi";
import { MdOutlineAnnouncement } from "react-icons/md";
import { TbBooks, TbCategory2, TbUsers } from "react-icons/tb";
import dynamic from "next/dynamic";

const StatsSection = dynamic(() => import("@/components/StatsSection"), {
  ssr: false,
});

export default async function Admin() {
  const mangaCount = await fetchMangaCount();
  const genres = await fetchGenres();
  const userCount = await getUserCount();
  const chapterCount = await fetchChapterCount();
  const announcements = await fetchAnnouncements();
  const stats = [
    {
      title: "manga",
      stat: mangaCount,
      icon: <TbBooks size={"3em"} />,
      href: "/admin/mangas",
    },
    {
      title: "chapter",
      stat: chapterCount,
      icon: <BiImages size={"3em"} />,
      href: "/admin/chapters",
    },

    {
      title: "user",
      stat: userCount,
      icon: <TbUsers size={"3em"} />,
      href: "/admin/users",
    },
    {
      title: "category",
      stat: genres.length,
      icon: <TbCategory2 size={"3em"} />,
      href: "/admin/genres",
    },
    {
      title: "announcements",
      stat: announcements.length,
      icon: <MdOutlineAnnouncement size={"3em"} />,
      href: "/admin/announcements",
    },
  ];

  return (
    <div className="z-20 mt-10">
      <h2 className="mx-10 my-6 mb-6 text-3xl font-semibold text-center">
        <Title text="admin" />
      </h2>
      <StatsSection stats={stats} />
    </div>
  );
}
