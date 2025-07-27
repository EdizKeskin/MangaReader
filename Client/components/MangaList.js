"use client";
import { Pagination } from "@nextui-org/react";
import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  useEffect,
  useRef,
} from "react";
import MotionDiv from "./MotionDiv";
import Card from "./Card";
import { fetchMangaListHome } from "@/functions";

const MemoizedCard = memo(Card);

const MangaCardSkeleton = () => (
  <div className="w-[170px] min-w-[170px] h-full rounded-lg bg-gray-800/50 animate-pulse">
    <div className="p-0">
      <div className="w-full h-[200px] bg-gray-700/50 rounded-md mb-3"></div>
    </div>
    <div className="p-3 space-y-3">
      <div className="w-3/4 h-4 mx-auto rounded bg-gray-700/50"></div>
      <div className="space-y-2">
        <div className="h-6 rounded bg-gray-700/50"></div>
        <div className="h-6 rounded bg-gray-700/50"></div>
      </div>
    </div>
  </div>
);

const MangaGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-5 mx-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 justify-items-center">
    {Array.from({ length: 8 }, (_, i) => (
      <MangaCardSkeleton key={i} />
    ))}
  </div>
);

export default function MangaList() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  {
    /* const filteredMangas = useMemo(() => {
    return data.filter(
      (manga) => manga.lastTwoChapters && manga.lastTwoChapters.length > 0
    );
  }, [data]);*/
  }

  const fetchData = useCallback(async (pageNumber) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = `page-${pageNumber}`;
    if (cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      setData(cachedData.mangaList);
      setPages(cachedData.pagination.totalPages);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetchMangaListHome(pageNumber);

      cacheRef.current.set(cacheKey, res);

      setData(res.mangaList);
      setPages(res.pagination.totalPages);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Manga listesi yüklenirken hata oluştu");
        console.error("Fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, fetchData]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    const element = document.getElementById("mangas");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleRetry = useCallback(() => {
    fetchData(page);
  }, [page, fetchData]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mx-6 space-y-6 text-center">
        <div className="mb-4 text-6xl">😔</div>
        <h3 className="text-xl font-semibold text-gray-300">Bir hata oluştu</h3>
        <p className="max-w-md text-red-400">{error}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-3 font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-purple-500/25"
        >
          🔄 Tekrar Dene
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full gap-6">
        <MangaGridSkeleton />

        <div className="flex items-end justify-end mr-3 md:mr-6">
          <div className="w-48 h-10 rounded-lg bg-gray-700/50 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <div
        className="grid grid-cols-2 gap-5 mx-6 transition-all duration-300 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 lg:gap-8 justify-items-center"
        id="mangas"
      >
        {data.length > 0 ? (
          data.map((item, i) => (
            <MotionDiv
              key={`${item.id || item.slug}-${i}`}
              i={i}
              className="transition-all duration-300 transform hover:scale-105"
            >
              <MemoizedCard item={item} />
            </MotionDiv>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center col-span-full">
            <div className="mb-4 text-6xl">📚</div>
            <h3 className="text-xl font-semibold text-gray-300">
              Henüz manga yok
            </h3>
            <p className="text-gray-500">
              Bu sayfada henüz görüntülenecek manga bulunmuyor.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center px-6 py-4 md:justify-end">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={pages}
            onChange={handlePageChange}
          />
        </div>
      )}

      {data.length > 8 && (
        <div className="fixed z-30 bottom-6 right-6 lg:hidden">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center justify-center w-12 h-12 text-white transition-all duration-200 transform rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-purple-500/25 hover:scale-110"
            aria-label="Scroll to top"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
}
