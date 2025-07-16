import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { fetchMangaListAdmin } from "@/functions";
import { deleteManga } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
import BackButton from "@/components/BackButton";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const MangasTable = dynamic(() => import("@/components/MangasTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      <Loading />
    </div>
  ),
});

export default async function Mangas({ params }) {
  const mangaList = await fetchMangaListAdmin();
  const locale = params.locale;

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
        <MangasTable
          mangaList={mangaList}
          statusColorMap={statusColorMap}
          locale={locale}
          onDeleteManga={deleteManga}
        />
      </Suspense>
    </div>
  );
}
