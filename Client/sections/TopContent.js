"use client";
import Slider from "@/components/Slider";
import Title from "@/components/Title";
import React from "react";
const dynamic = require("next/dynamic");
const MovingCards = dynamic(() => import("@/components/MovingCards"), {
  ssr: false,
});

export default function TopContent({ data }) {
  return (
    <div>
      <Slider data={data} />
      <Title text="featured" className={"ml-6"} />
      <div className="relative flex flex-col items-center justify-center overflow-hidden antialiased rounded-md ">
        <MovingCards
          items={data.mangaList}
          direction="right"
          speed="slow"
          pauseOnHover={false}
        />
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden antialiased rounded-md ">
        <MovingCards
          items={data.mangaList}
          direction="left"
          speed="slow"
          pauseOnHover={false}
        />
      </div>
    </div>
  );
}
