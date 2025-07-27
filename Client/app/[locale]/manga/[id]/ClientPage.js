"use client";
import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  Button,
  Chip,
  Image,
  Tooltip,
  Skeleton,
  Progress,
  Divider,
} from "@nextui-org/react";
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
import { TbShare, TbStar, TbStarFilled, TbBook, TbEye } from "react-icons/tb";
import { BsTwitter, BsFacebook, BsWhatsapp, BsLink45Deg } from "react-icons/bs";

const MemoizedChapterCard = memo(ChapterCard);
const MemoizedDisqusComments = memo(DisqusComments);

// Rating Component
const RatingSystem = memo(({ mangaId, mangaName }) => {
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(4.2);
  const [totalRatings, setTotalRatings] = useState(156);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const savedRating = localStorage.getItem(`rating_${mangaId}`);
    if (savedRating) {
      setUserRating(parseInt(savedRating));
    }
  }, [mangaId]);

  const handleRating = useCallback(
    (rating) => {
      setUserRating(rating);
      localStorage.setItem(`rating_${mangaId}`, rating.toString());
      toast.success("Değerlendirmeniz kaydedildi!");
    },
    [mangaId]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <TbStarFilled className="text-yellow-400" size={20} />
          <span className="text-lg font-semibold text-white">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">
            ({totalRatings} değerlendirme)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-300">Bu mangayı değerlendir:</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleRating(star)}
            >
              {star <= (hoveredStar || userRating) ? (
                <TbStarFilled className="text-yellow-400" size={24} />
              ) : (
                <TbStar
                  className="text-gray-400 hover:text-yellow-400"
                  size={24}
                />
              )}
            </button>
          ))}
        </div>
        {userRating > 0 && (
          <p className="text-sm text-green-400">
            ⭐ {userRating} yıldız verdiniz
          </p>
        )}
      </div>
    </div>
  );
});

RatingSystem.displayName = "RatingSystem";

// Share Component
const ShareButtons = memo(({ manga, pathname }) => {
  const [showShare, setShowShare] = useState(false);

  const shareUrl = process.env.NEXT_PUBLIC_WEBSITE_URL + pathname;
  const shareText = `${manga.name} - Bu harika mangayı okumak ister misin?`;

  const shareOptions = [
    {
      name: "Twitter",
      icon: BsTwitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      color: "text-blue-400",
    },
    {
      name: "Facebook",
      icon: BsFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      color: "text-blue-600",
    },
    {
      name: "WhatsApp",
      icon: BsWhatsapp,
      url: `https://wa.me/?text=${encodeURIComponent(
        shareText + " " + shareUrl
      )}`,
      color: "text-green-500",
    },
  ];

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link kopyalandı!");
  }, [shareUrl]);

  return (
    <div className="relative">
      <Tooltip content="Paylaş">
        <Button
          isIconOnly
          variant="bordered"
          onClick={() => setShowShare(!showShare)}
          className="border-gray-600 hover:border-purple-400"
        >
          <TbShare size={20} />
        </Button>
      </Tooltip>

      {showShare && (
        <div className="absolute right-0 z-50 p-4 space-y-3 border rounded-lg top-12 bg-zinc-800 border-zinc-700 min-w-48">
          <p className="text-sm font-semibold text-white">Bu mangayı paylaş</p>
          <div className="space-y-2">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => window.open(option.url, "_blank")}
                className="flex items-center w-full gap-3 p-2 transition-colors rounded-lg hover:bg-zinc-700"
              >
                <option.icon className={option.color} size={18} />
                <span className="text-sm text-gray-300">{option.name}</span>
              </button>
            ))}
            <button
              onClick={copyToClipboard}
              className="flex items-center w-full gap-3 p-2 transition-colors rounded-lg hover:bg-zinc-700"
            >
              <BsLink45Deg className="text-gray-400" size={18} />
              <span className="text-sm text-gray-300">Linki Kopyala</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ShareButtons.displayName = "ShareButtons";

const ReadingProgress = memo(({ manga, chapters, readedChapters }) => {
  const progress = useMemo(() => {
    if (!chapters || chapters.length === 0) return 0;
    const readCount = readedChapters.filter((id) =>
      chapters.some((chapter) => chapter._id === id)
    ).length;
    return (readCount / chapters.length) * 100;
  }, [chapters, readedChapters]);

  const stats = useMemo(() => {
    if (!chapters) return { read: 0, total: 0, remaining: 0 };
    const read = readedChapters.filter((id) =>
      chapters.some((chapter) => chapter._id === id)
    ).length;
    const total = chapters.length;
    const remaining = total - read;
    return { read, total, remaining };
  }, [chapters, readedChapters]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <TbBook size={20} />
          Okuma İlerlemen
        </h3>
        <span className="text-sm text-gray-400">
          {stats.read}/{stats.total} bölüm
        </span>
      </div>

      <Progress
        value={progress}
        color="secondary"
        className="w-full"
        size="md"
      />

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-green-400">{stats.read}</p>
          <p className="text-xs text-gray-400">Okunan</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-blue-400">{stats.remaining}</p>
          <p className="text-xs text-gray-400">Kalan</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-purple-400">
            {Math.round(progress)}%
          </p>
          <p className="text-xs text-gray-400">Tamamlandı</p>
        </div>
      </div>
    </div>
  );
});

ReadingProgress.displayName = "ReadingProgress";

const ContinueReading = memo(
  ({ manga, chapters, readedChapters, router, slug }) => {
    const nextChapter = useMemo(() => {
      if (!chapters || chapters.length === 0) return null;

      const readChapterIds = new Set(readedChapters);
      let lastReadIndex = -1;

      for (let i = 0; i < chapters.length; i++) {
        if (readChapterIds.has(chapters[i]._id)) {
          lastReadIndex = i;
        }
      }

      if (lastReadIndex < chapters.length - 1) {
        return chapters[lastReadIndex + 1];
      }

      return chapters[chapters.length - 1];
    }, [chapters, readedChapters]);

    const handleContinueReading = useCallback(() => {
      if (nextChapter) {
        router.push(`/manga/${slug}/${nextChapter.slug}`);
      }
    }, [nextChapter, router, slug]);

    if (!nextChapter) return null;

    const isCompleted = readedChapters.length === chapters?.length;

    return (
      <div className="p-6 space-y-4 border bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <TbEye className="text-purple-400" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isCompleted
                ? "Son Bölümü Tekrar Oku"
                : "Kaldığın Yerden Devam Et"}
            </h3>
            <p className="text-sm text-gray-300">{nextChapter.title}</p>
          </div>
        </div>

        <Button
          color="secondary"
          size="lg"
          onClick={handleContinueReading}
          className="w-full font-semibold"
        >
          {isCompleted ? "Son Bölümü Oku" : "Devam Et"}
        </Button>
      </div>
    );
  }
);

ContinueReading.displayName = "ContinueReading";

const useBookmarkManager = () => {
  const getBookmarks = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("bookmarks")) || [];
    } catch {
      return [];
    }
  }, []);

  const setBookmarks = useCallback((bookmarks) => {
    try {
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
    }
  }, []);

  const isBookmarked = useCallback(
    (mangaId) => {
      const bookmarks = getBookmarks();
      return bookmarks.includes(mangaId);
    },
    [getBookmarks]
  );

  const toggleBookmark = useCallback(
    (mangaId, t) => {
      const bookmarks = getBookmarks();
      const bookmarked = bookmarks.includes(mangaId);

      if (bookmarked) {
        const newBookmarks = bookmarks.filter((id) => id !== mangaId);
        setBookmarks(newBookmarks);
        toast.error(t("bookmarkRemoved"));
        return false;
      } else {
        setBookmarks([...bookmarks, mangaId]);
        toast.success(t("bookmarkAdded"));
        return true;
      }
    },
    [getBookmarks, setBookmarks]
  );

  return { isBookmarked, toggleBookmark };
};

const useReadingProgress = () => {
  const getReadChapters = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("readChapters")) || [];
    } catch {
      return [];
    }
  }, []);

  return { getReadChapters };
};

export default function Manga({ params }) {
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState(null);
  const [genreNames, setGenreNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] = useState(false);

  const { width } = useWindowSize();
  const router = useRouter();
  const t = useTranslations("Manga");
  const pathname = usePathname();
  const lg = width > 1024;
  const slug = params.id;

  const { isBookmarked, toggleBookmark } = useBookmarkManager();
  const { getReadChapters } = useReadingProgress();

  const readedChapters = useMemo(() => getReadChapters(), [getReadChapters]);

  const genres = useMemo(() => {
    if (!manga || !genreNames.length) return [];
    return genreNames.filter((genre) => manga.genres.includes(genre._id));
  }, [manga, genreNames]);

  const reversedChapters = useMemo(() => {
    if (!chapters) return [];
    return [...chapters].reverse();
  }, [chapters]);

  const handleToggleSummary = useCallback(() => {
    setShowFullSummary(!showFullSummary);
  }, [showFullSummary]);

  const handleBookmarkToggle = useCallback(() => {
    if (!manga) return;
    const newBookmarkStatus = toggleBookmark(manga._id, t);
    setBookmarkStatus(newBookmarkStatus);
  }, [manga, toggleBookmark, t]);

  const handleFirstChapterClick = useCallback(() => {
    if (chapters && chapters.length > 0) {
      router.push(`/manga/${slug}/${chapters[0].slug}`);
    }
  }, [chapters, router, slug]);

  const handleGenreClick = useCallback(
    (genreId) => {
      router.push(`/category?id=${genreId}`);
    },
    [router]
  );

  const handleAuthorClick = useCallback(() => {
    if (manga?.author) {
      router.push(`/author?author=${manga.author}`);
    }
  }, [manga?.author, router]);

  const handleArtistClick = useCallback(() => {
    if (manga?.artist) {
      router.push(`/artist?artist=${manga.artist}`);
    }
  }, [manga?.artist, router]);

  const updateCursor = useCallback(
    ({ clientX: x, clientY: y }) => {
      if (lg) {
        document.documentElement.style.setProperty("--x", x + "px");
        document.documentElement.style.setProperty("--y", y + "px");
      }
    },
    [lg]
  );

  useEffect(() => {
    if (!lg) return;

    document.body.addEventListener("pointermove", updateCursor, {
      passive: true,
    });

    return () => {
      document.body.removeEventListener("pointermove", updateCursor);
    };
  }, [lg, updateCursor]);

  useEffect(() => {
    if (manga) {
      setBookmarkStatus(isBookmarked(manga._id));
    }
  }, [manga, isBookmarked]);

  useEffect(() => {
    const handleClickOutside = () => setShowShare(false);
    if (showShare) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showShare]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [mangaRes, chaptersRes, genresRes] = await Promise.allSettled([
          getMangaBySlug(slug),
          getChaptersByMangaSlug(slug),
          fetchGenres(),
        ]);

        if (!isMounted) return;

        if (mangaRes.status === "fulfilled") {
          setManga(mangaRes.value);
        } else {
          console.error("Failed to fetch manga:", mangaRes.reason);
          setError("Failed to load manga information");
        }

        if (chaptersRes.status === "fulfilled") {
          setChapters(chaptersRes.value.chapters);
        } else {
          console.error("Failed to fetch chapters:", chaptersRes.reason);
        }

        if (genresRes.status === "fulfilled") {
          setGenreNames(genresRes.value);
        } else {
          console.error("Failed to fetch genres:", genresRes.reason);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Data fetching error:", error);
          setError("Failed to load page data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Loading state
  if (loading) return <Loading />;

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold text-gray-300">Bir hata oluştu</h2>
        <p className="text-gray-500">{error}</p>
        <Button color="secondary" onClick={() => window.location.reload()}>
          Sayfayı Yenile
        </Button>
      </div>
    );
  }

  // No manga found
  if (!manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-6xl">📚</div>
        <h2 className="text-2xl font-bold text-gray-300">Manga bulunamadı</h2>
        <p className="text-gray-500">Aradığınız manga mevcut değil</p>
        <Button color="secondary" onClick={() => router.back()}>
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="container px-4 mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 gap-6 my-8 lg:grid-cols-4 lg:gap-10">
          {/* Cover Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative group">
              <Image
                src={manga.coverImage}
                alt={manga.name}
                className="w-full h-auto max-w-sm transition-transform duration-300 shadow-2xl rounded-xl group-hover:scale-105"
                isBlurred
                loading="eager"
              />
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl group-hover:opacity-100" />
            </div>
          </div>

          {/* Manga Information */}
          <div className="space-y-6 lg:col-span-3">
            <div className="p-8 border shadow-2xl bg-zinc-900/80 backdrop-blur-md rounded-2xl border-zinc-800">
              {/* Title and Actions */}
              <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="text-4xl font-bold text-transparent text-white lg:text-6xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  {manga.name}
                </h1>

                <div className="flex items-center gap-3">
                  <ShareButtons manga={manga} pathname={pathname} />
                  <Tooltip
                    content={
                      bookmarkStatus ? t("removeBookmark") : t("addBookmark")
                    }
                    placement="top"
                  >
                    <label className="ui-bookmark">
                      <input
                        type="checkbox"
                        onChange={handleBookmarkToggle}
                        checked={bookmarkStatus}
                      />
                      <div className="bookmark">
                        <svg viewBox="0 0 32 32" fill="currentColor">
                          <g>
                            <path
                              d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"
                              fill="inherit"
                            ></path>
                          </g>
                        </svg>
                      </div>
                    </label>
                  </Tooltip>
                </div>
              </div>

              {/* Rating Section */}
              {/* <RatingSystem mangaId={manga._id} mangaName={manga.name} /> */}

              <Divider className="my-6 bg-zinc-700" />

              {/* Metadata */}
              <div className="space-y-4">
                {manga.author && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <dt className="text-lg font-semibold text-gray-300 min-w-24">
                      {t("author")}
                    </dt>
                    <dd
                      className="font-medium text-purple-400 transition-colors duration-200 cursor-pointer hover:text-purple-300"
                      onClick={handleAuthorClick}
                    >
                      {manga.author}
                    </dd>
                  </div>
                )}

                {manga.artist && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <dt className="text-lg font-semibold text-gray-300 min-w-24">
                      {t("artist")}
                    </dt>
                    <dd
                      className="font-medium text-purple-400 transition-colors duration-200 cursor-pointer hover:text-purple-300"
                      onClick={handleArtistClick}
                    >
                      {manga.artist}
                    </dd>
                  </div>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <dt className="text-lg font-semibold text-gray-300 min-w-24">
                    {t("categories")}
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Chip
                        key={genre._id}
                        className="transition-transform duration-200 cursor-pointer hover:scale-105"
                        color="secondary"
                        variant="flat"
                        onClick={() => handleGenreClick(genre._id)}
                      >
                        {genre.name}
                      </Chip>
                    ))}
                  </dd>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <dt className="text-lg font-semibold text-gray-300 min-w-24">
                    {t("summary")}
                  </dt>
                  <dd
                    className={`text-gray-300 leading-relaxed cursor-pointer transition-all duration-300 ${
                      showFullSummary ? "" : "line-clamp-3"
                    }`}
                    onClick={handleToggleSummary}
                  >
                    {manga.summary}
                    {/* {!showFullSummary && (
                      <span className="ml-2 text-purple-400 hover:text-purple-300">
                        Devamını oku...
                      </span>
                    )} */}
                  </dd>
                </div>
              </div>

              <Divider className="my-6 bg-zinc-700" />

              {/* Reading Progress */}
              <ReadingProgress
                manga={manga}
                chapters={chapters}
                readedChapters={readedChapters}
              />

              <Divider className="my-6 bg-zinc-700" />

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Continue Reading */}
                <ContinueReading
                  manga={manga}
                  chapters={chapters}
                  readedChapters={readedChapters}
                  router={router}
                  slug={slug}
                />

                {/* First Chapter Button */}
                <Button
                  size="lg"
                  color="secondary"
                  variant="bordered"
                  className="w-full text-lg font-semibold"
                  onClick={handleFirstChapterClick}
                  isDisabled={!chapters || chapters.length === 0}
                >
                  {t("goFirstChapter")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="my-12">
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                Bölümler
              </span>
              {chapters && (
                <span className="text-base font-normal text-gray-400 sm:text-lg">
                  ({chapters.length} bölüm)
                </span>
              )}
            </h2>
          </div>

          {!chapters ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-zinc-800/50" />
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 space-y-4 border bg-zinc-900/30 rounded-2xl border-zinc-700/30">
              <div className="text-4xl opacity-50 sm:text-6xl">📖</div>
              <h3 className="text-lg font-semibold text-center text-gray-300 sm:text-xl">
                Henüz bölüm yok
              </h3>
              <p className="max-w-md text-sm text-center text-gray-500 sm:text-base">
                Bu manga için henüz bölüm eklenmemiş. Yeni bölümler eklendiğinde
                burada görünecek.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {reversedChapters.map((chapter) => (
                <MemoizedChapterCard
                  key={chapter._id}
                  readedChapters={readedChapters}
                  chapter={chapter}
                />
              ))}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="my-12">
          <h2 className="mb-8 text-3xl font-bold text-white">
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
              Yorumlar
            </span>
          </h2>
          <MemoizedDisqusComments
            post={manga._id}
            title={manga.name}
            url={process.env.NEXT_PUBLIC_WEBSITE_URL + pathname}
          />
        </div>
      </div>
    </div>
  );
}
