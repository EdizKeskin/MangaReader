"use client";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import React from "react";

export default function Title({ text, className }) {
  const t = useTranslations("Title");

  switch (text) {
    case "admin":
      text = t("admin");
      break;
    case "new":
      text = t("newSeries");
      break;
    case "announcements":
      text = t("announcements");
      break;
    case "featured":
      text = t("featured");
      break;
    default:
      break;
  }

  return (
    <div className={cn("flex", className)}>
      <p
        className={`mb-6 text-3xl font-bold underline underline-offset-8 decoration-8 decoration-[#9353d3] leading-relaxed z-20`}
      >
        {text}
      </p>
    </div>
  );
}
