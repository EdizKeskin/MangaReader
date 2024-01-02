"use client";
import { Pagination } from "@nextui-org/react";
import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import MotionDiv from "./MotionDiv";
import Card from "./Card";
import { fetchMangaListHome } from "@/functions";
import Loading from "./Loading";

const MemoizedCard = memo(Card);

export default function MangaList() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMangaListHome(page).then((res) => {
      setData(res.mangaList);
      setPages(res.pagination.totalPages);
    });

    setLoading(false);
  }, [page]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    const element = document.getElementById("mangas");
    element.scrollIntoView({ behavior: "smooth" });
  }, []);
  const filteredMangas = useMemo(() => {
    return data.filter(
      (manga) => manga.lastTwoChapters && manga.lastTwoChapters.length > 0
    );
  }, [data]);

  if (!data || loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div
        className="grid grid-cols-2 gap-5 mx-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 justify-items-center"
        id="mangas"
      >
        {filteredMangas.map((item, i) => (
          <MotionDiv key={i} i={i}>
            <MemoizedCard item={item} />
          </MotionDiv>
        ))}
      </div>
      {pages !== 1 && (
        <div className="flex items-end justify-end">
          <Pagination
            className="mr-3 md:mr-6"
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
    </div>
  );
}
