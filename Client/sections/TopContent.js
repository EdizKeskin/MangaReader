"use client";
import MovingCards from "@/components/MovingCards";
import Title from "@/components/Title";
import React from "react";

export default function TopContent({ data }) {
  return (
    <div>
      {/* <Slider data={data} /> */}
      <Title text="featured" className={"ml-6"} />
      <div className="relative flex flex-col items-center justify-center overflow-hidden antialiased rounded-md ">
        <MovingCards
          items={data.mangaList1}
          direction="right"
          speed="slow"
          pauseOnHover={true}
        />
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden antialiased rounded-md ">
        <MovingCards
          items={data.mangaList2}
          direction="left"
          speed="slow"
          pauseOnHover={true}
        />
      </div>
    </div>
  );
}
