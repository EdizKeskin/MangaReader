"use client";
import React, { useEffect, useState } from "react";
import { getUnpublishedChapters } from "@/functions";
import { dateForChapters } from "@/utils";
import Title from "@/components/Title";
import { Avatar } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import Loading from "@/components/Loading";
import { useTranslations } from "next-intl";

const Calendar = () => {
  const [groupedChapters, setGroupedChapters] = useState();
  const [mangas, setMangas] = useState();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations("Calendar");
  const groupChaptersByDate = (chapters) => {
    const groupedChapters = {};

    chapters.forEach((chapter) => {
      const date = new Date(chapter.publishDate).toDateString();

      if (!groupedChapters[date]) {
        groupedChapters[date] = [];
      }

      groupedChapters[date].push(chapter);
    });

    const sortedGroupedChapters = {};
    Object.keys(groupedChapters)
      .sort()
      .forEach((date) => {
        sortedGroupedChapters[date] = groupedChapters[date];
      });

    return sortedGroupedChapters;
  };
  useEffect(() => {
    setLoading(true);
    getUnpublishedChapters().then((res) => {
      const chapters = groupChaptersByDate(res.chapters);
      setGroupedChapters(chapters);
      setMangas(res.mangas);
      setLoading(false);
    });

    getUnpublishedChapters();
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center mt-5">
        <Loading />
      </div>
    );
  }
  const findManga = (id) => {
    const manga = mangas.find((manga) => manga._id === id);

    return manga;
  };

  return (
    <div className="flex flex-col items-center justify-center mt-6 mb-6 md:m-10">
      <Title text={t("calendar")} />
      {Object.keys(groupedChapters).length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-8 justify-items-center ">
          {Object.keys(groupedChapters).map((date, index) => (
            <div
              key={index}
              className="flex flex-col gap-5 p-5 rounded-md shadow-lg bg-zinc-800 max-h-[270px] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold">{dateForChapters(date)}</h2>
              <div className="flex flex-col gap-4">
                {groupedChapters[date].map((chapter) => (
                  <div
                    key={chapter._id}
                    className="flex flex-row gap-4 p-2 rounded-md shadow-lg cursor-pointer bg-zinc-900"
                    onClick={() =>
                      router.push(`/manga/${findManga(chapter.manga).slug}`)
                    }
                  >
                    <Avatar
                      src={findManga(chapter.manga).coverImage}
                      onClick={() => findManga(chapter.manga)}
                      radius="sm"
                      size="lg"
                    />
                    <div className="flex flex-col items-start justify-start">
                      <p className="text-lg">{findManga(chapter.manga).name}</p>
                      <p className="text-sm text-gray-400">{chapter.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center mt-5">
          <p>{t("error")}</p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
