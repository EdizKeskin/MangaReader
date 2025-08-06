"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import {
  fetchGenres,
  getMangaByGenreId,
  fetchMangaListHome,
  getMangaByStatus,
} from "@/functions";
import { Card as NextCard, Chip, Pagination } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
const Card = dynamic(() => import("@/components/Card"), { ssr: false });

const MangaCardSkeleton = () => (
  <div className="w-[150px] min-w-[150px] sm:w-[160px] sm:min-w-[160px] md:w-[170px] md:min-w-[170px] h-full rounded-lg bg-gray-800/50 animate-pulse">
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
  <div className="grid grid-cols-2 gap-3 mx-3 transition-all duration-300 sm:gap-4 sm:mx-4 md:gap-5 md:mx-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 justify-items-center">
    {Array.from({ length: 8 }, (_, i) => (
      <MangaCardSkeleton key={i} />
    ))}
  </div>
);

export default function Manga() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mangas, setMangas] = useState([]);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [showAllMangas, setShowAllMangas] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showByStatus, setShowByStatus] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("Category");

  // Status options
  const statusOptions = [
    { key: "ongoing", label: "Devam Ediyor", color: "success" },
    { key: "completed", label: "Tamamlandı", color: "primary" },
    { key: "dropped", label: "Bırakıldı", color: "danger" },
    { key: "hiatus", label: "Ara", color: "warning" },
    { key: "güncel", label: "Güncel", color: "secondary" },
  ];

  const search = searchParams.get("id");
  const statusParam = searchParams.get("status");
  const pageParam = searchParams.get("page");

  // Function to fetch all mangas with pagination
  const fetchAllMangas = useCallback(
    async (pageNumber = 1) => {
      setMangaLoading(true);
      setError("");
      try {
        const response = await fetchMangaListHome(pageNumber, 16);
        setMangas(response.mangaList);
        setTotalPages(response.pagination.totalPages);
        setPage(pageNumber);
        setCategory("Tüm Mangalar");
        setShowAllMangas(true);
        setShowByStatus(false);
        setSelectedGenreId(null);
        setSelectedStatus(null);

        // Update URL with page parameter
        const currentParams = new URLSearchParams(searchParams.toString());
        if (pageNumber > 1) {
          currentParams.set("page", pageNumber.toString());
        } else {
          currentParams.delete("page");
        }
        currentParams.delete("id");
        currentParams.delete("status");

        const newUrl = currentParams.toString()
          ? `?${currentParams.toString()}`
          : window.location.pathname;

        router.push(newUrl, { scroll: false });
      } catch (err) {
        setError("Manga listesi yüklenirken hata oluştu");
        console.error("Fetch error:", err);
      } finally {
        setMangaLoading(false);
      }
    },
    [searchParams, router]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (showAllMangas) {
        fetchAllMangas(newPage);
        const element = document.getElementById("mangas");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [showAllMangas, fetchAllMangas]
  );

  const getMangas = async (genre) => {
    setMangaLoading(true);
    setError("");
    try {
      const res = await getMangaByGenreId(genre._id);

      console.log(res);
      if (res === 404) {
        setError(t("notFound"));
        setMangas([]);
      } else {
        setError("");
        setMangas(res);
      }

      setCategory(genre.name);
      setShowAllMangas(false);
      setShowByStatus(false);
      setSelectedGenreId(genre._id);
      setSelectedStatus(null);
      setPage(1);
      setTotalPages(1);

      // Update URL with genre ID
      const currentParams = new URLSearchParams();
      currentParams.set("id", genre._id);
      router.push(`?${currentParams.toString()}`, { scroll: false });
    } catch (err) {
      setError("Manga listesi yüklenirken hata oluştu");
      console.error("Fetch error:", err);
    } finally {
      setMangaLoading(false);
    }
  };

  const getMangasByStatus = async (status) => {
    setMangaLoading(true);
    setError("");
    try {
      const res = await getMangaByStatus(status.key);

      console.log(res);
      if (res === 404 || (res.mangaList && res.mangaList.length === 0)) {
        setError(`${status.label} statüsünde manga bulunamadı`);
        setMangas([]);
      } else {
        setError("");
        setMangas(res);
      }

      setCategory(status.label);
      setShowAllMangas(false);
      setShowByStatus(true);
      setSelectedGenreId(null);
      setSelectedStatus(status.key);
      setPage(1);
      setTotalPages(1);

      // Update URL with status parameter
      const currentParams = new URLSearchParams();
      currentParams.set("status", status.key);
      router.push(`?${currentParams.toString()}`, { scroll: false });
    } catch (err) {
      setError("Manga listesi yüklenirken hata oluştu");
      console.error("Fetch error:", err);
    } finally {
      setMangaLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const getGenres = async () => {
      const genresFromServer = await fetchGenres();
      // Sort genres alphabetically
      const sortedGenres = genresFromServer.sort((a, b) =>
        a.name.localeCompare(b.name, "tr", { sensitivity: "base" })
      );
      setGenres(sortedGenres);
      setLoading(false);

      if (search) {
        const searchGenre = sortedGenres.find((genre) => genre._id === search);
        if (searchGenre) {
          getMangas(searchGenre);
        }
      } else if (statusParam) {
        const status = statusOptions.find((s) => s.key === statusParam);
        if (status) {
          getMangasByStatus(status);
        } else {
          // If invalid status, load all mangas
          fetchAllMangas(1);
        }
      } else {
        // Load all mangas by default, check for page parameter
        const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
        fetchAllMangas(initialPage);
      }
    };

    getGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusParam, pageParam, fetchAllMangas]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <NextCard
        className={"flex justify-center items-center w-fit mx-10 mt-10 p-10"}
      >
        <p className="mb-5 text-3xl font-bold">{t("title")}</p>

        {/* All Mangas Button */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-4 mb-4">
          <Chip
            color={showAllMangas ? "primary" : "secondary"}
            className="cursor-pointer"
            onClick={() => {
              router.push(window.location.pathname, { scroll: false });
              fetchAllMangas(1);
            }}
          >
            Tüm Mangalar
          </Chip>
        </div>

        {/* Status Filters */}
        <div className="mb-4">
          <p className="mb-3 text-lg font-semibold text-center">
            Duruma Göre Filtrele
          </p>
          <div className="flex flex-row flex-wrap items-center justify-center gap-4">
            {statusOptions.map((status) => (
              <Chip
                color={selectedStatus === status.key ? status.color : "default"}
                className="cursor-pointer"
                onClick={() => getMangasByStatus(status)}
                key={status.key}
              >
                {status.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Genre Filters */}
        <div>
          <p className="mb-3 text-lg font-semibold text-center">
            Türe Göre Filtrele
          </p>
          <div className="flex flex-row flex-wrap items-center justify-center gap-4">
            {genres.map((genre) => (
              <Chip
                color={selectedGenreId === genre._id ? "primary" : "secondary"}
                className="cursor-pointer"
                onClick={() => getMangas(genre)}
                key={genre._id}
              >
                {genre.name}
              </Chip>
            ))}
          </div>
        </div>
      </NextCard>

      {mangaLoading && <MangaGridSkeleton />}

      {!mangaLoading && error ? (
        <div className="flex flex-col items-center justify-center p-12 mx-6 space-y-6 text-center">
          <div className="mb-4 text-6xl">😔</div>
          <h3 className="text-xl font-semibold text-gray-300">
            Bir hata oluştu
          </h3>
          <p className="max-w-md text-red-400">{error}</p>
          <button
            onClick={() => {
              if (showAllMangas) {
                fetchAllMangas(page);
              } else if (showByStatus && selectedStatus) {
                const status = statusOptions.find(
                  (s) => s.key === selectedStatus
                );
                if (status) getMangasByStatus(status);
              } else {
                fetchAllMangas(1);
              }
            }}
            className="px-6 py-3 font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-purple-500/25"
          >
            🔄 Tekrar Dene
          </button>
        </div>
      ) : null}

      {!mangaLoading && mangas && mangas.length > 0 && !error && (
        <div className="flex flex-col w-full gap-6">
          <div className="flex flex-col justify-center m-2">
            <Title className={"ml-8 mb-5"} text={category} />
            <div
              className="grid grid-cols-2 gap-5 mx-6 transition-all duration-300 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 lg:gap-8 justify-items-center"
              id="mangas"
            >
              {mangas.map((manga, i) => (
                <div
                  key={`${manga._id || manga.slug}-${i}`}
                  className="transition-all duration-300 transform hover:scale-105"
                >
                  <Card item={manga} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination - only show for all mangas view */}
          {showAllMangas && totalPages > 1 && (
            <div className="flex items-center justify-center px-6 py-4 md:justify-end">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={totalPages}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {mangas && mangas.length === 0 && !error && !mangaLoading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h3 className="text-xl font-semibold text-gray-300">
            Manga bulunamadı
          </h3>
          <p className="text-gray-500">Bu kategoride henüz manga bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}
