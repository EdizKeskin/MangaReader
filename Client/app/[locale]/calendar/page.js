"use client";
import React, { useEffect, useState } from "react";
import { getUnpublishedChapters } from "@/functions";
import { dateForChapters } from "@/utils";
import Title from "@/components/Title";
import { Avatar, Card, CardBody } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import Loading from "@/components/Loading";
import { useTranslations } from "next-intl";
import Spotlight from "@/components/Spotlight";

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

    // Sort dates chronologically (earliest first)
    const sortedGroupedChapters = {};
    Object.keys(groupedChapters)
      .sort((a, b) => new Date(a) - new Date(b))
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
    <div className="flex flex-col items-center w-full px-4 py-8 mt-10">
      <Spotlight
        className="left-0 z-0 hidden -top-40 md:left-60 md:-top-20 md:block"
        fill="white"
      />
      <div className="w-full mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Yakında Çıkacak Bölümler
          </h2>
        </div>

        {Object.keys(groupedChapters).length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8">
            {Object.keys(groupedChapters).map((date, index) => (
              <Card
                key={index}
                className="w-full transition-all duration-300 border bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 backdrop-blur-sm border-zinc-700/30 hover:border-zinc-600/50 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10"
              >
                <CardBody className="p-6">
                  <div className="mb-4">
                    <h2 className="mb-1 text-xl font-bold text-white">
                      {dateForChapters(date)}
                    </h2>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                    {groupedChapters[date].map((chapter) => (
                      <div
                        key={chapter._id}
                        className="flex items-center gap-3 p-3 transition-all duration-200 border border-transparent rounded-lg cursor-pointer group bg-zinc-800/50 hover:bg-zinc-700/50 hover:border-zinc-600/30"
                        onClick={() =>
                          router.push(`/manga/${findManga(chapter.manga).slug}`)
                        }
                      >
                        <Avatar
                          src={findManga(chapter.manga).coverImage}
                          radius="md"
                          size="md"
                          className="transition-all duration-200 ring-2 ring-zinc-700/50 group-hover:ring-purple-500/50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate transition-colors duration-200 group-hover:text-purple-300">
                            {findManga(chapter.manga).name}
                          </p>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {chapter.title}
                          </p>
                        </div>
                        <div className="transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                          <svg
                            className="w-4 h-4 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-12">
            <div className="mb-4 text-6xl">📅</div>
            <p className="text-xl font-medium text-zinc-300">{t("error")}</p>
            <p className="mt-2 text-sm text-zinc-500">
              Henüz yakında çıkacak bölüm bulunmuyor
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
