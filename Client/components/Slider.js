"use client";
import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useTranslations } from "next-intl";
import { Image } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useRouter } from "next13-progressbar";

const Title = dynamic(() => import("./Title"), { ssr: false });

export default function Slider({ data }) {
  const t = useTranslations("Slider");
  const router = useRouter();

  const slideLeft = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft - 500;
  };
  const slideRight = () => {
    var slider = document.getElementById("slider");
    slider.scrollLeft = slider.scrollLeft + 500;
  };

  return (
    <>
      <div className="z-20 mt-6 ml-6 -mb-10 bg-black">
        <Title text={t("populerSeries")} color={"#9353d3"} />
      </div>
      <div className="relative z-20 flex items-center overflow-visible">
        <MdChevronLeft
          className="hidden opacity-50 cursor-pointer hover:opacity-100 sm:block"
          onClick={slideLeft}
          size={40}
        />
        <div
          id="slider"
          className="flex w-full h-full gap-6 overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide"
        >
          {data.mangaList.map((item, i) => (
            <div
              key={i}
              className="w-[170px] min-w-[170px] h-full my-10 cursor-pointer"
              onClick={() => {
                router.push(`/manga/${item.slug}`);
              }}
            >
              <Image
                shadow="sm"
                radius="lg"
                width="100%"
                alt={"alt"}
                className={`object-cover h-[250px] w-[170px] `}
                src={item.coverImage}
                loading="lazy"
                isZoomed
                isBlurred
              />
            </div>
          ))}
        </div>
        <MdChevronRight
          className="hidden opacity-50 cursor-pointer hover:opacity-100 sm:block"
          onClick={slideRight}
          size={40}
        />
      </div>
    </>
  );
}
