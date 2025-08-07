import React from "react";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import Title from "@/components/Title";
import { fetchGenres, fetchRandomChapters } from "@/functions";
import Announcements from "@/components/Announcements";
import Footer from "@/components/Footer";
import MangaListArea from "@/sections/MangaListArea";
import "@/styles/background.css";
import TopContent from "@/sections/TopContent";
import { discordIframe } from "@/config";
import dynamic from "next/dynamic";
const AdBanner = dynamic(() => import("@/components/AdBanner"), {
  ssr: false,
});

export default async function Index() {
  const genres = await fetchGenres();
  const randomChapters1 = await fetchRandomChapters(15);
  const randomChapters2 = await fetchRandomChapters(15);

  return (
    <div className="z-20 overflow-hidden">
      <Hero />

      <div className="pb-5 mt-20 ">
        <TopContent
          data={{ mangaList1: randomChapters1, mangaList2: randomChapters2 }}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 ">
          <MangaListArea />
          <div className="hidden my-6 md:block">
            <Announcements />
            <div className="my-6">
              <Title text={"categories"} />
            </div>
            <Sidebar genres={genres} />
            <div className="my-6 mr-10">
              <Title text={"Discord"} />
              <iframe
                title="Discord Community"
                src={discordIframe}
                style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: "0.375rem",
                }}
                frameBorder="0"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              ></iframe>
            </div>
            <AdBanner />
          </div>
        </div>
      </div>
      <div className="block md:hidden">
        <AdBanner />
      </div>
      <Footer />
    </div>
  );
}
