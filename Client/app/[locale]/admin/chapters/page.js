import React from "react";
import dynamic from "next/dynamic";
import { getChapterList, getMangaNames } from "@/functions";
import { deleteChapter } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
import BackButton from "@/components/BackButton";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const ChaptersTable = dynamic(() => import("@/components/ChaptersTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      <Loading />
    </div>
  ),
});

export default async function Chapters({ params }) {
  const chapters = await getChapterList();
  const mangaNames = await getMangaNames();
  const locale = params.locale;

  return (
    <div className="m-5 md:m-10">
      <div className="mb-10">
        <BackButton href={"/admin"} />
      </div>
      <ChaptersTable
        chapters={chapters}
        mangaNames={mangaNames}
        statusColorMap={statusColorMap}
        locale={locale}
        onDeleteChapter={deleteChapter}
      />
    </div>
  );
}
