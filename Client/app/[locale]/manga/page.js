"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import {
  fetchGenres,
  getMangaByGenreId,
  fetchMangaListHome,
} from "@/functions";
import { Card as NextCard, Chip, Pagination } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
const Card = dynamic(() => import("@/components/Card"), { ssr: false });

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
  const searchParams = useSearchParams();
  const t = useTranslations("Category");

  const search = searchParams.get("id");

  // Function to fetch all mangas with pagination
  const fetchAllMangas = useCallback(async (pageNumber = 1) => {
    setMangaLoading(true);
    setError("");
    try {
      const response = await fetchMangaListHome(pageNumber, 16);
      setMangas(response.mangaList);
      setTotalPages(response.pagination.totalPages);
      setPage(pageNumber);
      setCategory("Tüm Mangalar");
      setShowAllMangas(true);
      setSelectedGenreId(null);
    } catch (err) {
      setError("Manga listesi yüklenirken hata oluştu");
      console.error("Fetch error:", err);
    } finally {
      setMangaLoading(false);
    }
  }, []);

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
      setSelectedGenreId(genre._id);
      setPage(1);
      setTotalPages(1);
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
      } else {
        // Load all mangas by default
        fetchAllMangas(1);
      }
    };

    getGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, fetchAllMangas]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <NextCard
        className={"flex justify-center items-center w-fit mx-10 mt-10 p-10"}
      >
        <p className="mb-5 ml-8 text-3xl font-bold">{t("title")}</p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-4">
          <Chip
            color={showAllMangas ? "primary" : "secondary"}
            className="cursor-pointer"
            onClick={() => fetchAllMangas(1)}
          >
            Tüm Mangalar
          </Chip>
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
      </NextCard>

      {mangaLoading ? <Loading /> : null}

      {error ? (
        <div className="flex flex-col items-center justify-center p-12 mx-6 space-y-6 text-center">
          <div className="mb-4 text-6xl">😔</div>
          <h3 className="text-xl font-semibold text-gray-300">
            Bir hata oluştu
          </h3>
          <p className="max-w-md text-red-400">{error}</p>
          <button
            onClick={() =>
              showAllMangas ? fetchAllMangas(page) : fetchAllMangas(1)
            }
            className="px-6 py-3 font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-105 hover:shadow-purple-500/25"
          >
            🔄 Tekrar Dene
          </button>
        </div>
      ) : null}

      {mangas && mangas.length > 0 && !error && (
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
