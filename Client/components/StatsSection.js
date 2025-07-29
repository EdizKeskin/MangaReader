"use client";
import React, { useEffect } from "react";
import StatsCard from "./StatsCard";

import "@/styles/glow.css";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function StatsSection({ stats }) {
  const { width } = useWindowSize();
  const lg = width > 1024;

  useEffect(() => {
    const updateCursor = ({ x, y }) => {
      if (lg) {
        document.documentElement.style.setProperty("--x", x);
        document.documentElement.style.setProperty("--y", y);
      }
    };

    if (lg) {
      document.body.addEventListener("pointermove", updateCursor);
      return () => {
        document.body.removeEventListener("pointermove", updateCursor);
      };
    }
  }, [lg]);

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-6 m-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 lg:gap-8 justify-items-center">
        {stats.map((stat, i) => (
          <div key={i} className="w-full">
            <StatsCard
              title={stat.title}
              stat={stat.stat}
              icon={stat.icon}
              href={stat.href}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
