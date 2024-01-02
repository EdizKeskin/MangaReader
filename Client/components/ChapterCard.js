"use client";
import { Badge, Card, CardBody, Checkbox } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useRouter } from "next13-progressbar";
import { dateForChapters } from "@/utils";
import "@/styles/glow.css";

export default function ChapterCard({ chapter, readedChapters }) {
  const [checked, setChecked] = useState(readedChapters.includes(chapter._id));

  const router = useRouter();
  const pathname = usePathname();
  const date = dateForChapters(chapter.publishDate);
  const onChange = (value) => {
    if (value === false) {
      localStorage.setItem(
        "readChapters",
        JSON.stringify(readedChapters.filter((item) => item !== chapter._id))
      );
      setChecked(false);
    } else if (value === true) {
      localStorage.setItem(
        "readChapters",
        JSON.stringify([...readedChapters, chapter._id])
      );
      setChecked(true);
    }
  };

  return (
    <div>
      <Badge
        content="VIP only"
        className={new Date(chapter.publishDate) < new Date() && "hidden"}
        color="secondary"
      >
        <Card
          onPress={() => router.push(`${pathname}/${chapter.slug}`)}
          className="rounded-md shadow-md glow"
          isPressable
        >
          <CardBody className="flex flex-col gap-3 md:items-center max-w-fit ">
            <div className="flex flex-row gap-4 ">
              <p className={`${checked && "text-gray-600 line-through"}`}>
                {" "}
                {chapter.title}
              </p>
              <Checkbox
                color="secondary"
                lineThrough
                isSelected={checked}
                onValueChange={onChange}
              />
            </div>
            <div>
              <p className="text-sm text-gray-400">{date}</p>
            </div>
          </CardBody>
        </Card>
      </Badge>
    </div>
  );
}
