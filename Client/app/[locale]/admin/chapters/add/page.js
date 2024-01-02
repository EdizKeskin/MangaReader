import BackButton from "@/components/BackButton";
import ChapterForm from "@/components/ChapterForm";
import { currentUser } from "@clerk/nextjs";
import React from "react";

export default async function ChapterAdd() {
  const user = await currentUser();

  return (
    <>
      <div className="mt-3 ml-10">
        <BackButton href={`/admin/chapters`} />
      </div>

      <ChapterForm
        username={user.username}
        email={user.emailAddresses[0].emailAddress}
      />
    </>
  );
}
