"use client";

import { cn } from "@/utils/cn";
import { Link, useRouter } from "next13-progressbar";
import React, { useEffect, useRef, useState } from "react";
export default function MovingCards({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else if (speed === "slow") {
        containerRef.current.style.setProperty("--animation-duration", "200s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20  overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll ",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <Link href={`/manga/${item.slug}`} key={idx}>
            <li
              className="h-[170px]  w-[350px] min-w-[350px] max-w-full relative rounded-2xl  flex-shrink-0  px-8 py-6 md:w-[450px] md:min-w-[450px] cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, rgb(0 0 0 / 0.9) 0%, rgb(0 0 0 / 0.5) 100%), url(" +
                  item.coverImage +
                  ") no-repeat center center/cover",
              }}
              key={item.slug}
              onClick={() => {
                router.push(`/manga/${item.slug}`);
              }}
            >
              <blockquote>
                <div
                  aria-hidden="true"
                  className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                ></div>

                <div className="relative z-20 flex flex-row items-center mb-6">
                  <span className="flex flex-col gap-1">
                    <span className=" text-lg leading-[1.6] text-gray-100 font-normal">
                      {item.name}
                    </span>
                    <span className=" text-sm leading-[1.6] text-gray-400 font-normal">
                      {item.author}
                    </span>
                  </span>
                </div>
                <span className=" relative z-20 text-sm leading-[1.6] text-gray-300 font-normal line-clamp-2">
                  {item.summary}
                </span>
              </blockquote>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
