"use client";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { fetchGenres, getMangaByGenreId } from "@/functions";
import { Card as NextCard, Chip } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Card = dynamic(() => import("@/components/Card"), { ssr: false });

export default function Category() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mangas, setMangas] = useState([]);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const t = useTranslations("Category");

  const search = searchParams.get("id");

  useEffect(() => {
    setLoading(true);
    const getGenres = async () => {
      const genresFromServer = await fetchGenres();
      setGenres(genresFromServer);
      setLoading(false);
      if (search) {
        const searchGenre = genresFromServer.find(
          (genre) => genre._id === search
        );
        if (searchGenre) {
          getMangas(searchGenre);
        }
      }
    };

    getGenres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  if (loading) {
    return <Loading />;
  }

  const getMangas = async (genre) => {
    setMangaLoading(true);
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
    setMangaLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <NextCard
        className={"flex justify-center items-center w-fit mx-10 mt-10 p-10"}
      >
        <p className="mb-5 text-3xl font-bold">{t("title")}</p>
        <div className="flex flex-row flex-wrap items-center justify-center gap-4">
          {genres.map((genre) => (
            <Chip
              color="secondary"
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

      {mangas && (
        <div className="flex flex-col justify-center m-2">
          <Title text={category} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-8 justify-items-center">
            {mangas.map((manga) => (
              <Card key={manga._id} item={manga} />
            ))}
          </div>
        </div>
      )}
      {error ? (
        <p className="mx-8 text-3xl font-bold text-center text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
