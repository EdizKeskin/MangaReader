import dynamic from "next/dynamic";
import { fetchAnnouncements } from "@/functions";
import React from "react";
import { currentUser } from "@clerk/nextjs";

const AnnouncementsTable = dynamic(
  () => import("@/components/AnnouncementsTable"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full mt-20">
        Yükleniyor...
      </div>
    ),
  }
);
const INITIAL_VISIBLE_COLUMNS = ["title", "uploader", "actions"];

export default async function Genres({ params }) {
  const announcements = await fetchAnnouncements(0);
  const user = await currentUser();
  const locale = params.locale;
  const columns = [
    { name: "ID", uid: "_id" },
    { name: locale === "en" ? "Title" : "Başlık", uid: "title" },
    { name: locale === "en" ? "Contents" : "İçerik", uid: "contents" },
    { name: locale === "en" ? "Date" : "Tarih", uid: "uploadDate" },
    { name: locale === "en" ? "Uploader" : "Yükleyen", uid: "uploader" },
    { name: "ACTIONS", uid: "actions" },
  ];
  return (
    <>
      <AnnouncementsTable
        announcements={announcements.announcements}
        columns={columns}
        INITIAL_VISIBLE_COLUMNS={INITIAL_VISIBLE_COLUMNS}
        username={user.username}
        email={user.emailAddresses[0].emailAddress}
      />
    </>
  );
}
