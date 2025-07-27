"use client";
import { Card, CardBody, Checkbox, Chip } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next13-progressbar";
import { dateForChapters } from "@/utils";
import { TbClock, TbEye } from "react-icons/tb";

export default function ChapterCard({
  chapter,
  readedChapters,
  mangaStatus,
  isLastChapter,
}) {
  const [checked, setChecked] = useState(readedChapters.includes(chapter._id));

  const router = useRouter();
  const pathname = usePathname();
  const date = dateForChapters(chapter.publishDate);

  const isVipOnly = useMemo(
    () => new Date(chapter.publishDate) > new Date(),
    [chapter.publishDate]
  );

  const onChange = useCallback(
    (value) => {
      const updatedChapters = value
        ? [...readedChapters, chapter._id]
        : readedChapters.filter((item) => item !== chapter._id);

      localStorage.setItem("readChapters", JSON.stringify(updatedChapters));
      setChecked(value);
    },
    [readedChapters, chapter._id]
  );

  const handleCardPress = useCallback(() => {
    router.push(`${pathname}/${chapter.slug}`);
  }, [router, pathname, chapter.slug]);

  return (
    <div className="relative w-full">
      <Card
        onPress={handleCardPress}
        className={`
          relative w-full h-32 transition-all duration-300 cursor-pointer group
          ${
            checked
              ? "bg-zinc-800/60 border-zinc-600/50 opacity-70"
              : "bg-zinc-900/90 border-zinc-700/50 hover:border-purple-500/50 hover:bg-zinc-800/90"
          }
          backdrop-blur-sm border shadow-lg hover:shadow-xl hover:scale-[1.02]
          rounded-xl overflow-hidden
        `}
        isPressable
      >
        <CardBody className="flex flex-col justify-between h-full p-4">
          {/* Header with Checkbox */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`
                font-semibold text-sm leading-tight transition-colors duration-200
                ${
                  checked
                    ? "text-gray-500 line-through"
                    : "text-white group-hover:text-purple-300"
                }
                line-clamp-2 mb-1
              `}
              >
                {chapter.title}
              </h3>

              {/* Status Tags for Last Chapter */}
              {isLastChapter &&
                (mangaStatus === "güncel" || mangaStatus === "completed") && (
                  <div className="mb-1">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={mangaStatus === "güncel" ? "success" : "secondary"}
                      className="h-5 px-2 py-1 text-xs"
                    >
                      {mangaStatus === "güncel" ? "Güncel" : "Final"}
                    </Chip>
                  </div>
                )}
            </div>

            <Checkbox
              color="secondary"
              size="sm"
              isSelected={checked}
              onValueChange={onChange}
              className="flex-shrink-0 mt-0.5"
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-1 mt-auto">
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <TbClock size={12} className="flex-shrink-0 text-gray-400" />
              <span className="text-xs text-gray-400 truncate">{date}</span>
            </div>

            {/* Read Status */}
            {checked && (
              <div className="flex items-center gap-1.5">
                <TbEye size={12} className="flex-shrink-0 text-green-500" />
                <span className="text-xs font-medium text-green-500">
                  Okundu
                </span>
              </div>
            )}

            {/* VIP Status for non-VIP chapters */}
            {!isVipOnly && (
              <div className="flex items-center gap-1.5">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-400">
                  Ücretsiz
                </span>
              </div>
            )}
            {isVipOnly && (
              <div className="flex items-center gap-1.5">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs font-medium text-yellow-400">VIP</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
