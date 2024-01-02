import dynamic from "next/dynamic";
import { fetchGenres } from "@/functions";
import React from "react";

const GenresTable = dynamic(() => import("@/components/GenresTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      Yükleniyor...
    </div>
  ),
});
const INITIAL_VISIBLE_COLUMNS = ["name", "actions"];

export default async function Genres({ params }) {
  const genres = await fetchGenres();
  const locale = params.locale;
  const columns = [
    { name: "ID", uid: "_id" },
    { name: locale === "en" ? "Title" : "Başlık", uid: "name" },
    { name: "ACTIONS", uid: "actions" },
  ];
  return (
    <>
      <GenresTable
        genres={genres}
        columns={columns}
        INITIAL_VISIBLE_COLUMNS={INITIAL_VISIBLE_COLUMNS}
      />
    </>
  );
}
