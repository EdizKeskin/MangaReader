"use client";
import React, { useEffect, useState } from "react";
import { Button, Chip, Image, Tooltip } from "@nextui-org/react";
import {
  fetchGenres,
  getChaptersByMangaSlug,
  getMangaBySlug,
} from "@/functions";
import Loading from "@/components/Loading";
import ChapterCard from "@/components/ChapterCard";
import { usePathname } from "next/navigation";
import DisqusComments from "@/components/DisqusComments";
import { useRouter } from "next13-progressbar";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import "@/styles/bookmark.css";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function Manga({ params }) {
  const [manga, setManga] = useState();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [chapters, setChapters] = useState();
  const [genreNames, setGenreNames] = useState([]);
  const [readedChapters, setReadedChapters] = useState([]);
  const { width } = useWindowSize();
  const router = useRouter();
  const t = useTranslations("Manga");
  const pathname = usePathname();
  const lg = width > 1024;

  const [showFullSummary, setShowFullSummary] = useState(false);
  const slug = params.id;

  useEffect(() => {
    const readChapters = JSON.parse(localStorage.getItem("readChapters"));
    if (readChapters) {
      setReadedChapters(readChapters);
    }
  }, []);

  useEffect(() => {
    try {
      getMangaBySlug(slug).then((res) => {
        setManga(res);
        setIsBookmarked(
          JSON.parse(localStorage.getItem("bookmarks"))?.includes(res._id)
        );
      });
      getChaptersByMangaSlug(slug).then((res) => {
        setChapters(res.chapters);
      });
      fetchGenres().then((res) => {
        setGenreNames(res);
      });
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const toggleSummary = () => {
    setShowFullSummary(!showFullSummary);
  };

  if (!manga) return <Loading />;
  const genres = genreNames.filter((genre) => manga.genres.includes(genre._id));

  const addBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
    if (bookmarks) {
      const newBookmarks = [...bookmarks, manga._id];
      localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    } else {
      localStorage.setItem("bookmarks", JSON.stringify([manga._id]));
    }
  };

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
    if (bookmarks) {
      if (bookmarks.includes(manga._id)) {
        const newBookmarks = bookmarks.filter((bookmark) => {
          return bookmark !== manga._id;
        });
        localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
        toast.error(t("bookmarkRemoved"));
        setIsBookmarked(false);
      } else {
        addBookmark();
        toast.success(t("bookmarkAdded"));
        setIsBookmarked(true);
      }
    } else {
      addBookmark();
      toast.success(t("bookmarkAdded"));
      setIsBookmarked(true);
    }
  };
  const updateCursor = ({ x, y }) => {
    if (lg) {
      document.documentElement.style.setProperty("--x", x);
      document.documentElement.style.setProperty("--y", y);
    } else {
      return;
    }
  };

  document.body.addEventListener("pointermove", updateCursor);

  return (
    <div className="overflow-hidden">
      <div>
        <div className="grid grid-cols-1 gap-4 m-4 md:m-10 lg:grid-cols-4 lg:gap-8 ">
          <div className=" justify-self-center">
            <div className="p-3 rounded-lg">
              <Image
                src={manga.coverImage}
                alt=""
                className="w-full h-full rounded-md"
                isBlurred
              />
            </div>
          </div>
          <div className="z-20 p-5 rounded-lg lg:col-span-3 bg-zinc-900">
            <div>
              <h1 className="text-4xl lg:text-7xl text-slate-50">
                {manga.name}
              </h1>
              <div className="flow-root my-5 ">
                <dl className="-my-3 divide-y divide-gray-100 text-md dark:divide-gray-700">
                  {manga.author && (
                    <div className="grid items-center grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                      <dt className="text-lg font-medium text-gray-900 dark:text-white">
                        {t("author")}
                      </dt>
                      <dd
                        className="cursor-pointer text-slate-300 dark:text-gray-200 sm:col-span-2 hover:color-purple-500"
                        onClick={() =>
                          router.push(`/author?author=${manga.author}`)
                        }
                      >
                        <p className="hover:text-secondary">{manga.author}</p>
                      </dd>
                    </div>
                  )}

                  {manga.artist && (
                    <div className="grid items-center grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                      <dt className="text-lg font-medium text-gray-900 dark:text-white">
                        {t("artist")}
                      </dt>
                      <dd
                        className="cursor-pointer text-slate-300 dark:text-gray-200 sm:col-span-2 hover:color-purple-500"
                        onClick={() =>
                          router.push(`/artist?artist=${manga.artist}`)
                        }
                      >
                        <p className="hover:text-secondary">{manga.artist}</p>
                      </dd>
                    </div>
                  )}

                  <div className="grid items-center grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                      {t("categories")}
                    </dt>
                    <dd className="text-slate-300 dark:text-gray-200 sm:col-span-2">
                      {genres.map((genre, i) => (
                        <Chip
                          key={i}
                          className="mr-2 cursor-pointer"
                          color="secondary"
                          onClick={() =>
                            router.push(`/category?id=${genre._id}`)
                          }
                        >
                          {genre.name}
                        </Chip>
                      ))}
                    </dd>
                  </div>

                  <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                      {t("summary")}
                    </dt>
                    <dd
                      onClick={toggleSummary}
                      className={`text-slate-300 dark:text-gray-200 sm:col-span-2 hover:cursor-pointer ${
                        showFullSummary ? "" : "line-clamp-3"
                      }`}
                    >
                      {manga.summary}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-row items-center gap-2">
                <Button
                  size="large"
                  className="w-1/2"
                  onClick={() => {
                    router.push(`/manga/${slug}/${chapters[0].slug}`);
                  }}
                >
                  {t("goFirstChapter")}
                </Button>
                <Tooltip
                  content={
                    isBookmarked ? t("removeBookmark") : t("addBookmark")
                  }
                >
                  <label className="ui-bookmark">
                    <input
                      type="checkbox"
                      onChange={() => {
                        toggleBookmark();
                      }}
                      checked={isBookmarked}
                    />
                    <div className="bookmark">
                      <svg viewBox="0 0 32 32">
                        <g>
                          <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
                        </g>
                      </svg>
                    </div>
                  </label>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 m-4 lg:m-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {!chapters
            ? t("loading")
            : chapters
                .slice()
                .reverse()
                .map((chapter, i) => (
                  <ChapterCard
                    readedChapters={readedChapters}
                    chapter={chapter}
                    key={i}
                  />
                ))}
        </div>
        <div className="m-10">
          <DisqusComments
            post={manga._id}
            title={`${manga.name}`}
            url={process.env.NEXT_PUBLIC_WEBSITE_URL + pathname}
          />
        </div>
      </div>
    </div>
  );
}
