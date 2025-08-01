"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const hasListenerRef = useRef(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const updateCursor = useCallback(
    ({ x, y }) => {
      if (lg) {
        document.documentElement.style.setProperty("--x", x);
        document.documentElement.style.setProperty("--y", y);
      }
    },
    [lg]
  );

  const handleCardPress = useCallback(() => {
    router.push(`manga/${item.slug}`);
  }, [router, item.slug]);

  const handleChapterClick = useCallback(
    (chapterSlug) => {
      router.push(`manga/${item.slug}/${chapterSlug}`);
    },
    [router, item.slug]
  );

  useEffect(() => {
    if (lg && !hasListenerRef.current) {
      document.body.addEventListener("pointermove", updateCursor);
      hasListenerRef.current = true;
    } else if (!lg && hasListenerRef.current) {
      document.body.removeEventListener("pointermove", updateCursor);
      hasListenerRef.current = false;
    }

    return () => {
      if (hasListenerRef.current) {
        document.body.removeEventListener("pointermove", updateCursor);
        hasListenerRef.current = false;
      }
    };
  }, [lg, updateCursor]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  document.body.addEventListener("pointermove", updateCursor);

  return (
    <div className="relative h-full group">
      <NextCard
        shadow="sm"
        isPressable
        onPress={handleCardPress}
        className="w-[160px] min-w-[160px] sm:w-[170px] sm:min-w-[170px] md:w-[170px] md:min-w-[170px] h-full rounded-xl backdrop-blur-sm
                   border border-gray-700/50 transition-all duration-300
                   md:hover:border-purple-500/50 md:hover:shadow-xl md:hover:shadow-purple-500/20
                   md:group-hover:transform md:group-hover:scale-105"
      >
        <CardBody className="p-0 overflow-visible ">
          <div
            className={`relative ${
              chapterless ? "h-[250px]" : "h-[200px]"
            }  rounded-t-xl`}
          >
            {/* Status Tag */}
            {item.status && item.status !== "ongoing" && (
              <div className="absolute z-20 top-2 right-2">
                <Chip
                  size="sm"
                  variant="solid"
                  radius="sm"
                  color={
                    item.status === "completed"
                      ? "success"
                      : item.status === "hiatus"
                      ? "warning"
                      : item.status === "güncel"
                      ? "primary"
                      : "default"
                  }
                  className="text-xs font-medium shadow-md"
                >
                  {item.status === "completed" && "Final"}
                  {item.status === "hiatus" && "Ara"}
                  {item.status === "güncel" && "Güncel"}
                  {item.status === "dropped" && "Bırakıldı"}
                </Chip>
              </div>
            )}

            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 border-2 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            )}

            {imageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-800">
                <div className="mb-2 text-2xl">📚</div>
                <span className="text-xs">Resim yüklenemedi</span>
              </div>
            ) : (
              <Image
                shadow="sm"
                width="100%"
                radius="md"
                alt={item.name || "Manga cover"}
                className={`object-cover rounded-md ${
                  chapterless ? "h-[250px]" : "h-[200px]"
                }`}
                src={item.coverImage}
                loading="lazy"
                isZoomed
                isBlurred
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        </CardBody>
        {!chapterless && (
          <CardFooter className="flex-col w-full h-full gap-3 p-4 justify- backdrop-blur-sm">
            {/* Manga title */}
            <div className="w-full text-center">
              <h3 className="text-sm font-semibold leading-tight text-white transition-colors duration-200 line-clamp-2 md:group-hover:text-purple-300">
                {item.name}
              </h3>
            </div>

            {/* Chapters */}
            <div className="flex flex-col w-full gap-2">
              {item.lastTwoChapters &&
                item.lastTwoChapters.map((chapter, i) => {
                  const isLatestChapter = i === 0;
                  const isRecent =
                    isLatestChapter &&
                    chapter.uploadDate &&
                    new Date() - new Date(chapter.uploadDate) <
                      24 * 60 * 60 * 1000;

                  // Check if publish date is in the future (VIP content)
                  const isVIP =
                    chapter.publishDate &&
                    new Date(chapter.publishDate) > new Date();

                  return (
                    <div
                      key={`${chapter.id || chapter.slug}-${i}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChapterClick(chapter.slug);
                      }}
                      className="w-full transition-all duration-200 border rounded-md cursor-pointer bg-gray-700/50 md:hover:bg-purple-600/80 md:hover:scale-105 border-gray-600/50 md:hover:border-purple-500/50 backdrop-blur-sm group/chip"
                      variant="flat"
                    >
                      <span className="text-xs font-medium text-gray-200 truncate md:group-hover/chip:text-white">
                        {chapter.title}
                        {!isVIP && isRecent && "  🔥"}
                        {isVIP && "  🔒"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardFooter>
        )}
      </NextCard>
    </div>
  );
}
