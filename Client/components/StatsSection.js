"use client";
import React from "react";
import StatsCard from "./StatsCard";

import "@/styles/glow.css";
import { useWindowSize } from "@/hooks/useWindowSize";

export default function StatsSection({ stats }) {
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
    <div className="grid grid-cols-2 gap-4 m-10 md:grid-cols-3 lg:grid-cols-3 lg:gap-8 justify-items-center">
      {stats.map((stat, i) => (
        <StatsCard
          key={i}
          title={stat.title}
          stat={stat.stat}
          icon={stat.icon}
          href={stat.href}
        />
      ))}
    </div>
  );
}
