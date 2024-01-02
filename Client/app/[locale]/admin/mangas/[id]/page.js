import BackButton from "@/components/BackButton";
import MangaForm from "@/components/MangaForm";
import { currentUser } from "@clerk/nextjs";
import React from "react";

export default async function EditManga({ params }) {
  const user = await currentUser();
  return (
    <>
      <div className="mt-3 ml-10">
        <BackButton href={`/admin/mangas`} />
      </div>

      <MangaForm update mangaId={params.id} user={user} />
    </>
  );
}
