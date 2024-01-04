"use client";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { fetchMangaList } from "@/functions";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

export default function Bookmarks() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Bookmarks");

  useEffect(() => {
    setLoading(true);
    fetchMangaList().then((res) => {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
      if (bookmarks) {
        const newMangas = res.filter((manga) => bookmarks.includes(manga._id));
        setMangas(newMangas);
        setLoading(false);
      } else {
        setMangas([]);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-6 mb-6">
        <Title text={t("title")} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-8 justify-items-center">
          {mangas.map((item, i) => (
            <Card item={item} key={i} />
          ))}
        </div>
        {mangas.length === 0 ? (
          <p className="mx-8 text-3xl font-bold text-center text-red-500">
            {t("noBookmarks")}
          </p>
        ) : null}
      </div>
    </>
  );
}
