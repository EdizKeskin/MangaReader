import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { fetchMangaListAdmin } from "@/functions";
import { MdOutlineAddBox } from "react-icons/md";
import { TbEdit, TbTrash } from "react-icons/tb";

import { deleteManga } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
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

const INITIAL_VISIBLE_COLUMNS = ["name", "author", "uploader", "actions"];

export default async function Mangas({ params }) {
  const mangaList = await fetchMangaListAdmin();
  const locale = params.locale;
  const columns = [
    { name: "ID", uid: "_id", sortable: true },
    { name: locale === "en" ? "Name" : "İsim", uid: "name", sortable: true },
    {
      name: locale === "en" ? "Author" : "Yazar",
      uid: "author",
      sortable: true,
    },
    {
      name: locale === "en" ? "Date" : "Tarih",
      uid: "uploadDate",
      sortable: true,
    },
    { name: locale === "en" ? "Uploader" : "Yükleyen", uid: "uploader" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const statusOptions = [
    { name: "Active", uid: "active" },
    { name: "Paused", uid: "paused" },
    { name: "Vacation", uid: "vacation" },
  ];

  const actions = [
    {
      name: locale === "en" ? "Add New Chapter" : "Yeni Bölüm Ekle",
      uid: "addChild",
      icon: <MdOutlineAddBox size={"1.3em"} />,
    },
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
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full mt-20">
            <Loading />
          </div>
        }
      >
        <CustomTable
          data={mangaList}
          statusOptions={statusOptions}
          columns={columns}
          INITIAL_VISIBLE_COLUMNS={INITIAL_VISIBLE_COLUMNS}
          statusColorMap={statusColorMap}
          tableName={"Manga"}
          addItemHref={"/admin/mangas/add"}
          actions={actions}
          deleteFunction={deleteManga}
          addChildHref={"/admin/chapters/add"}
          editHref={"/admin/mangas"}
        />
      </Suspense>
    </div>
  );
}
