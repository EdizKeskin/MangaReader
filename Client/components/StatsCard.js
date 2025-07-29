"use client";
import { Card } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next13-progressbar";
import React, { useState, useEffect } from "react";

export default function StatsCard(props) {
  const [title, setTitle] = useState(props.title);
  const router = useRouter();
  const t = useTranslations("StatsCard");

  useEffect(() => {
    switch (props.title) {
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
        setTitle(props.title);
        break;
    }
  }, [props.title, t]);

  return (
    <Card
      onPress={() => router.push(props?.href)}
      isPressable
      className="w-full px-4 py-6 transition-all duration-300 border border-gray-200 shadow-lg group rounded-xl hover:shadow-xl hover:scale-105 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 dark:border-gray-700"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium tracking-wide text-gray-600 uppercase dark:text-gray-300">
            {title}
          </div>
          <div className="text-3xl font-bold text-gray-900 transition-colors duration-300 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {props.stat}
          </div>
        </div>
        <div className="text-gray-500 transition-all duration-300 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110">
          {props.icon}
        </div>
      </div>
    </Card>
  );
}
