import React from "react";
import dynamic from "next/dynamic";
import { getChapterList, getMangaNames } from "@/functions";
import { deleteChapter } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
import { TbEdit, TbTrash } from "react-icons/tb";
import BackButton from "@/components/BackButton";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const CustomTable = dynamic(() => import("@/components/CustomTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      <Loading />
    </div>
  ),
});
const INITIAL_VISIBLE_COLUMNS = ["manga", "title", "uploadDate", "actions"];
export default async function Chapters({ params }) {
  const chapters = await getChapterList();
  const mangaNames = await getMangaNames();
  const locale = params.locale;

  const columns = [
    { name: "ID", uid: "_id" },
    { name: "MANGA ID", uid: "manga" },
    { name: locale === "en" ? "Title" : "Başlık", uid: "title" },
    {
      name: locale === "en" ? "Date" : "Tarih",
      uid: "uploadDate",
      sortable: true,
    },
    {
      name: locale === "en" ? "Publish Date" : "Yayınlanma Tarihi",
      uid: "publishDate",
      sortable: true,
    },
    { name: "ACTIONS", uid: "actions" },
  ];
  const statusOptions = [
    { name: "Active", uid: "active" },
    { name: "Paused", uid: "paused" },
    { name: "Vacation", uid: "vacation" },
  ];

  const actions = [
    {
      name: locale === "en" ? "Edit" : "Düzenle",
      uid: "edit",
      icon: <TbEdit size={"1.3em"} />,
    },
    {
      name: locale === "en" ? "Delete" : "Sil",
      uid: "delete",
      icon: <TbTrash size={"1.3em"} />,
    },
  ];

  return (
    <div className="m-5 md:m-10">
      <div className="mb-10">
        <BackButton href={"/admin"} />
      </div>
      <CustomTable
        data={chapters}
        statusOptions={statusOptions}
        columns={columns}
        INITIAL_VISIBLE_COLUMNS={INITIAL_VISIBLE_COLUMNS}
        statusColorMap={statusColorMap}
        tableName={locale === "en" ? "Chapter" : "Bölüm"}
        actions={actions}
        mangaNames={mangaNames}
        addItemHref={"/admin/chapters/add"}
        editHref={"/admin/chapters"}
        deleteFunction={deleteChapter}
      />
    </div>
  );
}
