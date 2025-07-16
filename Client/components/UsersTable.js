"use client";
import React, { useCallback, useMemo } from "react";
import { User, Chip } from "@nextui-org/react";
import BaseTable from "./BaseTable";
import { getDayDifference, unixTimeStampToDateTime } from "@/utils";
import { useTranslations } from "next-intl";
import { TbReload, TbTrash } from "react-icons/tb";
import { BiPlus } from "react-icons/bi";
import { useRouter } from "next13-progressbar";
import toast from "react-hot-toast";

const UsersTable = React.memo(
  ({
    users,
    subscribers,
    statusColorMap,
    locale,
    onDeleteUser,
    onUpdateUser,
  }) => {
    const t = useTranslations("CustomTable");
    const router = useRouter();

    const columns = useMemo(
      () => [
        { name: "ID", uid: "id" },
        {
          name: locale === "en" ? "Username" : "Kullanıcı Adı",
          uid: "username",
        },
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
      ],
      [locale]
    );

    const visibleColumns = useMemo(
      () => ["username", "email_addresses", "actions", "private_metadata"],
      []
    );

    const statusOptions = useMemo(
      () => [
        { name: "Active", uid: "active" },
        { name: "Paused", uid: "paused" },
        { name: "Vacation", uid: "vacation" },
      ],
      []
    );

    const handleUpdateUser = useCallback(
      async (userId, isAdmin) => {
        try {
          await toast.promise(onUpdateUser(userId, !isAdmin), {
            loading: t("updating"),
            success: t("updated"),
            error: t("updateError"),
          });
        } catch (error) {
          console.error("Update user error:", error);
        }
      },
      [onUpdateUser, t]
    );

    const actions = useMemo(
      () => [
        {
          name: locale === "en" ? "Change Role" : "Rolü değiştir",
          uid: "updateUser",
          icon: <TbReload size="1.3em" />,
          onAction: (user) =>
            handleUpdateUser(user.id, user.private_metadata?.isAdmin),
        },
        {
          name: locale === "en" ? "Create subscription" : "Abonelik oluştur",
          uid: "addSubscriber",
          icon: <BiPlus size="1.3em" />,
          onAction: (user) => {
            router.push(
              `/admin/users/add/?userId=${user.id}&email=${user.email_addresses[0].email_address}`
            );
          },
        },
        {
          name: locale === "en" ? "Delete" : "Sil",
          uid: "delete",
          icon: <TbTrash size="1.3em" />,
        },
      ],
      [locale, handleUpdateUser, router]
    );

    const renderCell = useCallback(
      (user, columnKey) => {
        const cellValue = user[columnKey];

        switch (columnKey) {
          case "username":
            return (
              <User
                avatarProps={{ radius: "lg", src: user.image_url }}
                description={user.email_addresses[0]?.email_address}
                name={cellValue}
              >
                {user.email_addresses[0]?.email_address}
              </User>
            );

          case "email_addresses":
            return <p>{user.email_addresses[0]?.email_address}</p>;

          case "private_metadata":
            const isSubscribed = subscribers?.find(
              (subscriber) => subscriber.userId === user.id
            );

            const isAdmin = user.private_metadata?.isAdmin === true;
            const hasValidSubscription =
              isSubscribed && new Date(isSubscribed.expireAt) > new Date();

            let status, content;
            if (isAdmin) {
              status = "active";
              content = "Admin";
            } else if (hasValidSubscription) {
              status = "secondary";
              content = t("remainingDays", {
                count: getDayDifference(isSubscribed.expireAt) + 1,
              });
            } else {
              status = "paused";
              content = t("user");
            }

            return (
              <Chip
                className="capitalize"
                color={statusColorMap[status]}
                size="sm"
                variant="flat"
              >
                {content}
              </Chip>
            );

          case "created_at":
            const date = unixTimeStampToDateTime(cellValue);
            return <p>{date}</p>;

          default:
            return cellValue;
        }
      },
      [subscribers, statusColorMap, t]
    );

    return (
      <BaseTable
        data={users}
        columns={columns}
        visibleColumns={visibleColumns}
        tableName={locale === "en" ? "User" : "Kullanıcı"}
        searchFields={["username", "email_addresses"]}
        statusOptions={statusOptions}
        statusColorMap={statusColorMap}
        onDelete={onDeleteUser}
        renderCell={renderCell}
        actions={actions}
      />
    );
  }
);

UsersTable.displayName = "UsersTable";

export default UsersTable;
