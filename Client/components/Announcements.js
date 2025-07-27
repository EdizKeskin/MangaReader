"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, ScrollShadow } from "@nextui-org/react";
import { useRouter } from "next13-progressbar";
import { fetchAnnouncements } from "@/functions";
import Loading from "./Loading";
import Title from "./Title";

export default function Announcements() {
  const router = useRouter();
  const [limit, setLimit] = useState(5);
  const [length, setLength] = useState(0);
  const [announcements, setAnnouncements] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const handleRoute = (announcement) => {
    if (
      announcement.link &&
      announcement.link !== "undefined" &&
      announcement.link !== "" &&
      announcement.link !== null
    ) {
      window.open(announcement.link, "_blank");
    } else {
      router.push(`/announcements?id=${announcement._id}`);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fetch = async () => {
      const data = await fetchAnnouncements(limit);
      setAnnouncements(data.announcements);
      setLength(data.length);
      setIsLoading(false);
    };
    fetch();
  }, [limit]);

  if (!announcements) {
    return <Loading />;
  }

  const filteredAnnouncements = announcements.filter(
    (announcement) => announcement.isActive
  );
  return (
    <>
      <div
        className="my-6 transition-colors duration-200 cursor-pointer hover:text-custom"
        onClick={() => router.push("/announcements")}
      >
        <Title text={"announcements"} />
      </div>
      <Card className="z-10 mr-10">
        <CardBody className="max-h-[400px]">
          <ScrollShadow hideScrollBar>
            <div className="flex flex-col gap-5 ">
              {filteredAnnouncements.map((announcement, i) => (
                <div
                  key={i}
                  className="w-full p-5 rounded-md cursor-pointer bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => handleRoute(announcement)}
                >
                  <p>{announcement.title}</p>
                </div>
              ))}
              {isLoading && <Loading />}
              {limit <= length && (
                <Button
                  variant={"light"}
                  size="md"
                  onClick={() => setLimit(limit + 5)}
                  isDisabled={limit >= length}
                >
                  Daha fazla
                </Button>
              )}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>
    </>
  );
}
