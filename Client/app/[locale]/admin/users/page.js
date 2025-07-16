import React from "react";
import dynamic from "next/dynamic";
import { getSubscriberList, getUsers } from "@/functions";
import { deleteUser, patchUser } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
import BackButton from "@/components/BackButton";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
  secondary: "secondary",
};

const UsersTable = dynamic(() => import("@/components/UsersTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      <Loading />
    </div>
  ),
});

export default async function Users({ params }) {
  const users = await getUsers();
  const subscribers = await getSubscriberList();
  const locale = params.locale;

  return (
    <div className="m-5 md:m-10">
      <div className="mb-10">
        <BackButton href={"/admin"} />
      </div>
      <UsersTable
        users={users}
        subscribers={subscribers}
        statusColorMap={statusColorMap}
        locale={locale}
        onDeleteUser={deleteUser}
        onUpdateUser={patchUser}
      />
    </div>
  );
}
