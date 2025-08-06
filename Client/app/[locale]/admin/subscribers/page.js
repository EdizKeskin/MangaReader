import React from "react";
import dynamic from "next/dynamic";
import { getSubscriberList } from "@/functions";
import { deleteSubscriber, patchSubscriber } from "@/functions/serverFunctions";
import Loading from "@/components/Loading";
import BackButton from "@/components/BackButton";

const statusColorMap = {
  active: "success",
  expired: "danger",
  secondary: "secondary",
};

const SubscribersTable = dynamic(() => import("@/components/SubscribersTable"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full mt-20">
      <Loading />
    </div>
  ),
});

export default async function Subscribers({ params }) {
  const subscribers = await getSubscriberList();
  const locale = params.locale;

  return (
    <div className="m-5 md:m-10">
      <div className="mb-10">
        <BackButton href={"/admin"} />
      </div>
      <SubscribersTable
        subscribers={subscribers}
        statusColorMap={statusColorMap}
        locale={locale}
        onDeleteSubscriber={deleteSubscriber}
        onUpdateSubscriber={patchSubscriber}
      />
    </div>
  );
}
