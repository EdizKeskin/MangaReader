"use client";
import React from "react";
import {
  Card as NextCard,
  CardBody,
  CardFooter,
  Image,
  Chip,
} from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import "@/styles/glow.css";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function Card({ item, chapterless }) {
  const router = useRouter();
  const { width } = useWindowSize();
  const lg = width > 1024;
  const updateCursor = ({ x, y }) => {
    if (lg) {
      document.documentElement.style.setProperty("--x", x);
      document.documentElement.style.setProperty("--y", y);
    } else {
      return;
    }
  };

  document.body.addEventListener("pointermove", updateCursor);
  return (
    <NextCard
      shadow="sm"
      isPressable
      onPress={() => {
        router.push(`manga/${item.slug}`);
      }}
      className="w-[170px] min-w-[170px] h-full rounded-lg glow"
    >
      <CardBody className="p-0 overflow-visible ">
        <Image
          shadow="sm"
          width="100%"
          radius="md"
          alt={"alt"}
          className={`object-cover rounded-md ${
            chapterless ? "h-[250px]" : "h-[200px]"
          }`}
          src={item.coverImage}
          loading="lazy"
          isZoomed
          isBlurred
        />
      </CardBody>
      {!chapterless && (
        <CardFooter className="flex-col justify-between w-full gap-3 text-small">
          <b>{item.name}</b>
          <div className="flex flex-col gap-2">
            {item.lastTwoChapters &&
              item.lastTwoChapters.map((chapter, i) => (
                <Chip
                  key={i}
                  radius="sm"
                  onClick={() => {
                    router.push(`manga/${item.slug}/${chapter.slug}`);
                  }}
                  className="w-full px-10 overflow-hidden overflow-ellipsis whitespace-nowrap"
                >
                  {chapter.title}
                </Chip>
              ))}
          </div>
        </CardFooter>
      )}
    </NextCard>
  );
}
