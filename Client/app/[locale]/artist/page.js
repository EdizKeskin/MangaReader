"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getMangaByArtist } from "@/functions";
import Title from "@/components/Title";
import Card from "@/components/Card";
import { useTranslations } from "next-intl";

export default function Artist() {
  const [mangas, setMangas] = useState([]);
  const [error, setError] = useState();
  const artist = useSearchParams().get("artist");
  const t = useTranslations("Artist");

  useEffect(() => {
    getMangaByArtist(artist).then((res) => {
      if (res.status === 404) {
        setError(res.status);
      } else {
        setMangas(res);
      }
    });
  }, [artist]);

  return (
    <div className="flex flex-col items-center justify-center mt-3 mb-6">
      <Title text={artist} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-8 justify-items-center">
        {mangas.map((item, i) => (
          <Card item={item} key={i} />
        ))}
      </div>
      {error === 404 ? (
        <p className="mx-8 text-3xl font-bold text-center text-red-500">
          {t("notFound")}
        </p>
      ) : (
        error && (
          <p className="mx-8 text-3xl font-bold text-center text-red-500">
            {t("error")}
          </p>
        )
      )}
    </div>
  );
}
