import Title from "@/components/Title";
import {
  fetchAnnouncements,
  fetchChapterCount,
  fetchGenres,
  fetchMangaCount,
  getUserCount,
  getSubscriberCount,
} from "@/functions";
import { BiImages } from "react-icons/bi";
import { MdOutlineAnnouncement } from "react-icons/md";
import { TbBooks, TbCategory2, TbUsers, TbUserCheck } from "react-icons/tb";
import dynamic from "next/dynamic";

import AdminControls from "@/components/AdminControls";

const StatsSection = dynamic(() => import("@/components/StatsSection"), {
  ssr: false,
});

export default async function Admin() {
  const mangaCount = await fetchMangaCount();
  const genres = await fetchGenres();
  const userCount = await getUserCount();
  const chapterCount = await fetchChapterCount();
  const announcements = await fetchAnnouncements();
  const subscriberCount = await getSubscriberCount();
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
    {
      title: "subscribers",
      stat: subscriberCount,
      icon: <TbUserCheck size={"3em"} />,
      href: "/admin/subscribers",
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="relative z-20 pt-8">
        <div className="flex items-center self-center justify-center mb-12">
          <h1 className="mx-6 mb-4 text-2xl font-bold md:mx-0 md:text-5xl ">
            <Title text="admin" />
          </h1>
        </div>

        <AdminControls />

        <div className=" -delay-2">
          <StatsSection stats={stats} />
        </div>
      </div>
    </div>
  );
}
