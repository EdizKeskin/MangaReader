"use client";
import React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { TbBook } from "react-icons/tb";
import { ImInfinite } from "react-icons/im";
import MangaList from "@/components/MangaList";
import Title from "@/components/Title";
import InfiniteScroll from "@/components/InfiniteScroll";
export default function MangaListArea() {
  return (
    <div className="md:col-span-2">
      <div className={"my-6"}>
        <div className="ml-6">
          <Title text={"new"} color={"#9353d3"} />
        </div>
        <Tabs
          aria-label="Options"
          classNames={{
            tabList: "ml-3 z-20",
          }}
        >
          <Tab key="page" title={<TbBook size={24} />}>
            <MangaList />
          </Tab>
          <Tab key="infinite" title={<ImInfinite size={24} />}>
            <InfiniteScroll />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
