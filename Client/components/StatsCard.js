"use client";
import { Card } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next13-progressbar";
import React, { useState } from "react";

export default function StatsCard(props) {
  const [title, setTitle] = useState(props.title);
  const router = useRouter();
  const t = useTranslations("StatsCard");

  switch (title) {
    case "manga":
      setTitle(t("manga"));
      break;
    case "chapter":
      setTitle(t("chapter"));
      break;
    case "user":
      setTitle(t("user"));
      break;
    case "category":
      setTitle(t("category"));
      break;
    case "announcements":
      setTitle(t("announcements"));
      break;
    default:
      break;
  }

  return (
    <Card
      onPress={() => router.push(props?.href)}
      isPressable
      className="w-full px-2 py-5 rounded-md shadow-sm md:px-4 glow"
    >
      <div className="flex justify-center w-full rounded-md sm:justify-between">
        <div className="sm:pl-2 sm:mr-6 md:pl-4">
          <div className="font-medium truncate">{title}</div>
          <div className="text-2xl font-medium">{props.stat}</div>
        </div>
        <div className="hidden my-auto text-gray-800 dark:text-gray-200 sm:block">
          {props.icon}
        </div>
      </div>
    </Card>
  );
}
