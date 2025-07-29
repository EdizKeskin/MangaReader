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
import {
  TbBooks,
  TbCategory2,
  TbUsers,
  TbPlus,
  TbBookUpload,
} from "react-icons/tb";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@nextui-org/react";

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
    <div className="relative min-h-screen">
      <div className="relative z-20 pt-8">
        <div className="flex items-center self-center justify-center mb-12">
          <h1 className="mb-4 text-5xl font-bold ">
            <Title text="admin" />
          </h1>
        </div>

        <div className="flex justify-center mb-12 ">
          <div className="flex flex-col gap-4 px-6 sm:flex-row">
            <Button
              as={Link}
              href="/admin/mangas/add"
              color="primary"
              size="lg"
              startContent={<TbPlus size={20} />}
              className="font-semibold transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 "
            >
              Yeni Manga Ekle
            </Button>
            <Button
              as={Link}
              href="/admin/chapters/add"
              color="secondary"
              size="lg"
              startContent={<TbBookUpload size={20} />}
              className="font-semibold transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 "
            >
              Yeni Bölüm Ekle
            </Button>
          </div>
        </div>

        <div className=" -delay-2">
          <StatsSection stats={stats} />
        </div>
      </div>
    </div>
  );
}
