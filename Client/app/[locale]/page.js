import React from "react";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import Title from "@/components/Title";
import { fetchGenres, fetchMangaListHome } from "@/functions";
import Announcements from "@/components/Announcements";
import Footer from "@/components/Footer";
import MangaListArea from "@/sections/MangaListArea";
import "@/styles/background.css";
import TopContent from "@/sections/TopContent";
import { discordIframe } from "@/config";
export default async function Index() {
  const genres = await fetchGenres();
  const mangas = await fetchMangaListHome();

  return (
    <div className="z-20 overflow-hidden">
      <Hero />

      <div className="pb-5 mt-20 ">
        <TopContent data={mangas} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8 ">
          <MangaListArea />
          <div className="hidden my-6 md:block">
            <Announcements />

            <div className="my-6">
              <Title text={"Kategoriler"} />
            </div>
            <Sidebar genres={genres} />
            <div className="my-6 mr-10">
              <Title text={"Discord"} />
              <iframe
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
