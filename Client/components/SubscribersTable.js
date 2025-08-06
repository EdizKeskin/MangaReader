"use client";
import React, { useCallback, useMemo } from "react";
import { Chip } from "@nextui-org/react";
import BaseTable from "./BaseTable";
import { getDayDifference, unixTimeStampToDateTime } from "@/utils";
import { useTranslations } from "next-intl";
import { TbTrash, TbReload } from "react-icons/tb";
import toast from "react-hot-toast";

const SubscribersTable = React.memo(
  ({
    subscribers,
    statusColorMap,
    locale,
    onDeleteSubscriber,
    onUpdateSubscriber,
  }) => {
    const t = useTranslations("CustomTable");

    const columns = useMemo(
      () => [
        { name: "ID", uid: "_id" },
        {
          name: locale === "en" ? "Email" : "E-posta",
          uid: "email",
        },
        {
          name: locale === "en" ? "User ID" : "Kullanıcı ID",
          uid: "userId",
        },
        {
          name: locale === "en" ? "Expire Date" : "Bitiş Tarihi",
          uid: "expireAt",
          sortable: true,
        },
        {
          name: locale === "en" ? "Status" : "Durum",
          uid: "status",
          sortable: true,
        },
        {
          name: locale === "en" ? "Created At" : "Oluşturulma Tarihi",
          uid: "createdAt",
          sortable: true,
        },
        { name: "ACTIONS", uid: "actions" },
      ],
      [locale]
    );

    const visibleColumns = useMemo(
      () => ["email", "userId", "expireAt", "status", "actions"],
      []
    );

    const statusOptions = useMemo(
      () => [
        { name: "Active", uid: "active" },
        { name: "Expired", uid: "expired" },
      ],
      []
    );

    const handleUpdateSubscriber = useCallback(
      async (subscriberId, days) => {
        try {
          await toast.promise(onUpdateSubscriber(subscriberId, days), {
            loading: t("updating"),
            success: t("updated"),
            error: t("updateError"),
          });
        } catch (error) {
          console.error("Update subscriber error:", error);
        }
      },
      [onUpdateSubscriber, t]
    );

    const actions = useMemo(
      () => [
        {
          name: locale === "en" ? "Extend Subscription" : "Aboneliği Uzat",
          uid: "extendSubscription",
          icon: <TbReload size="1.3em" />,
          onAction: (subscriber) => {
            const days = prompt(
              locale === "en" 
                ? "Enter number of days to extend:" 
                : "Uzatılacak gün sayısını girin:"
            );
            if (days && !isNaN(days)) {
              handleUpdateSubscriber(subscriber.userId, parseInt(days));
            }
          },
        },
        {
          name: locale === "en" ? "Delete" : "Sil",
          uid: "delete",
          icon: <TbTrash size="1.3em" />,
        },
      ],
      [locale, handleUpdateSubscriber]
    );

    const renderCell = useCallback(
      (subscriber, columnKey) => {
        const cellValue = subscriber[columnKey];

        switch (columnKey) {
          case "email":
            return <p className="font-medium">{cellValue}</p>;

          case "userId":
            return <p className="text-sm text-gray-600">{cellValue || "-"}</p>;

          case "expireAt":
            const expireDate = new Date(cellValue);
            const formattedDate = expireDate.toLocaleDateString(
              locale === "en" ? "en-US" : "tr-TR",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );
            return <p>{formattedDate}</p>;

          case "status":
            const isExpired = new Date(subscriber.expireAt) < new Date();
            const remainingDays = getDayDifference(subscriber.expireAt);
            
            let status, content;
            if (isExpired) {
              status = "expired";
              content = locale === "en" ? "Expired" : "Süresi Dolmuş";
            } else {
              status = "active";
              content = locale === "en" 
                ? `${remainingDays} days left` 
                : `${remainingDays} gün kaldı`;
            }

            return (
              <Chip
                className="capitalize"
                color={statusColorMap[status] || "default"}
                size="sm"
                variant="flat"
              >
                {content}
              </Chip>
            );

          case "createdAt":
            const date = new Date(cellValue);
            return (
              <p>
                {date.toLocaleDateString(
                  locale === "en" ? "en-US" : "tr-TR",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            );

          default:
            return cellValue;
        }
      },
      [locale, statusColorMap]
    );

    return (
      <BaseTable
        data={subscribers}
        columns={columns}
        visibleColumns={visibleColumns}
        tableName={locale === "en" ? "Subscriber" : "Abone"}
        searchFields={["email", "userId"]}
        statusOptions={statusOptions}
        statusColorMap={statusColorMap}
        onDelete={onDeleteSubscriber}
        renderCell={renderCell}
        actions={actions}
      />
    );
  }
);

SubscribersTable.displayName = "SubscribersTable";

export default SubscribersTable; 