import BackButton from "@/components/BackButton";
import ChapterForm from "@/components/ChapterForm";
import { currentUser } from "@clerk/nextjs";
import React from "react";

export default async function EditChapter({ params }) {
  const user = await currentUser();
  console.log(`sad`);

  return (
    <>
      <div className="mt-3 ml-10">
        <BackButton href={`/admin/chapters`} />
      </div>

      <ChapterForm update chapterId={params.id} user={user} />
    </>
  );
}
