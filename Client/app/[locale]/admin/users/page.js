import React from "react";
import dynamic from "next/dynamic";
import { getSubscriberList, getUsers } from "@/functions";
import { deleteUser, patchUser } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
import { TbReload, TbTrash } from "react-icons/tb";
import BackButton from "@/components/BackButton";
import { BiPlus } from "react-icons/bi";

const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
  secondary: "secondary",
};
const CustomTable = dynamic(() => import("@/components/CustomTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      <Loading />
    </div>
  ),
});
const INITIAL_VISIBLE_COLUMNS = [
  "username",
  "email_addresses",
  "actions",
  "private_metadata",
];

export default async function Users({ params }) {
  const users = await getUsers();
  const subscribers = await getSubscriberList();
  const locale = params.locale;

  const columns = [
    { name: "ID", uid: "id" },
    { name: locale === "en" ? "Username" : "Kullanıcı Adı", uid: "username" },
    { name: "E-MAIL", uid: "email_addresses" },
    {
      name: locale === "en" ? "Date" : "Tarih",
      uid: "created_at",
      sortable: true,
    },
    {
      name: locale === "en" ? "Role" : "Rol",
      uid: "private_metadata",
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
      name: locale === "en" ? "Change Role" : "Rolü değiştir",
      uid: "updateUser",
      icon: <TbReload size={"1.3em"} />,
    },
    {
      name: locale === "en" ? "Create subscription" : "Abonelik oluştur",
      uid: "addSubscriber",
      icon: <BiPlus size={"1.3em"} />,
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
        data={users}
        statusOptions={statusOptions}
        columns={columns}
        INITIAL_VISIBLE_COLUMNS={INITIAL_VISIBLE_COLUMNS}
        statusColorMap={statusColorMap}
        tableName={locale === "en" ? "User" : "Kullanıcı"}
        deleteFunction={deleteUser}
        updateFunction={patchUser}
        actions={actions}
        subscribers={subscribers}
      />
    </div>
  );
}
