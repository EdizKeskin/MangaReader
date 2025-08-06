"use client";
import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";

export default function Sidebar({ genres }) {
  const router = useRouter();

  // Genres'leri alfabetik sıraya göre sırala
  const sortedGenres = [...genres].sort((a, b) =>
    a.name.localeCompare(b.name, "tr", { sensitivity: "base" })
  );

  return (
    <Card className="z-10 mr-10">
      <CardBody>
        <div className="flex flex-row flex-wrap gap-5">
          {sortedGenres.map((category, i) => (
            <Chip
              onClick={() => router.push(`/manga?id=${category._id}`)}
              key={i}
              variant="bordered"
              className="hover:cursor-pointer hover:bg-secondary hover:text-white"
            >
              {category.name}
            </Chip>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
