"use client";

import { useInView } from "react-intersection-observer";
import { memo, useEffect, useState } from "react";
import MotionDiv from "./MotionDiv";
const MemoizedCard = memo(Card);
import Card from "./Card";
import { fetchMangaListHome } from "@/functions";
import Loading from "./Loading";
import { useTranslations } from "next-intl";

function InfiniteScroll() {
  const { ref, inView } = useInView();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("InfiniteScroll");

  useEffect(() => {
    if (inView) {
      setIsLoading(true);

      const delay = 500;
      if (error) {
        return;
      }

      const timeoutId = setTimeout(() => {
        fetchMangaListHome(page, 8).then((res) => {
          if (res.status === 404) {
            setError(res.status);
            setIsLoading(false);
            return;
          }
          setData((prevData) => [...prevData, ...res.mangaList]);
          setPage((prevPage) => prevPage + 1);
        });

        setIsLoading(false);
      }, delay);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <section className="grid grid-cols-2 gap-5 mx-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 justify-items-center">
        {data.map((item, i) => (
          <MotionDiv key={i} i={i}>
            <MemoizedCard item={item} />
          </MotionDiv>
        ))}
      </section>
      <section className="flex items-center justify-center w-full">
        <div ref={ref}>
          {inView && isLoading && (
            <div className="my-10">
              <Loading />
            </div>
          )}
        </div>
        {error && error === 404 && (
          <div className="my-10">
            <h1 className="text-2xl text-center text-slate-300">
              {t("noMoreDataToLoad")}
            </h1>
          </div>
        )}
      </section>
    </div>
  );
}

export default InfiniteScroll;
