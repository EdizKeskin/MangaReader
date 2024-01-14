"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { fetchAnnouncements, getAnnouncementById } from "@/functions";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import { unixTimeStampToDateTime } from "@/utils";
import { useTranslations } from "next-intl";
import EditorViewer from "@/components/EditorViewer";
import { TbExternalLink } from "react-icons/tb";
import "@/styles/glow.css";
import { useWindowSize } from "@/hooks/useWindowSize";
import BackButton from "@/components/BackButton";

export default function Announcements() {
  const [announcement, setAnnouncement] = useState();
  const [list, setList] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState();
  const [id, setId] = useState(useSearchParams().get("id"));
  const [limit, setLimit] = useState(10);
  const { width } = useWindowSize();
  const t = useTranslations("Announcements");

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const response = await getAnnouncementById(id);
      if (response.status === 404 || response.status === 500) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setAnnouncement(response);
      setNotFound(false);
      setLoading(false);
    };
    const getAllAnnouncements = async () => {
      const response = await fetchAnnouncements(limit);
      setList(response);
      setLoading(false);
    };

    if (id) {
      fetchData();
    } else {
      getAllAnnouncements();
    }
  }, [id, limit]);

  if (loading) {
    return <Loading />;
  }
  const date = new Date(announcement?.uploadDate);
  const formattedDate = unixTimeStampToDateTime(date);
  const handleClick = ({ id, link }) => {
    if (link && link !== null) {
      window.open(link, "_blank");
      return null;
    } else {
      setId(id);
    }
  };
  const updateCursor = ({ x, y }) => {
    document.documentElement.style.setProperty("--x", x);
    document.documentElement.style.setProperty("--y", y);
  };

  document.body.addEventListener("pointermove", updateCursor);

  return (
    <div>
      {notFound ? (
        <div className="p-5 m-10 rounded-md bg-zinc-900">
          <p className="mx-8 text-3xl font-bold text-center text-red-500">
            {t("notFound")}
          </p>
        </div>
      ) : id && announcement ? (
        <>
          <BackButton onClick={() => setId(null)} className={"m-10"} />
          <div className="p-5 m-10 rounded-md bg-zinc-900">
            <div className="flex justify-between">
              <Title text={announcement.title} />
              <div className="flex items-center gap-5">
                <h2 className="font-thin text-gray-300">
                  {announcement.uploader}
                </h2>
                <h2 className="font-thin text-gray-300">{formattedDate}</h2>
              </div>
            </div>
            <EditorViewer value={announcement.contents} />
          </div>
        </>
      ) : (
        list && (
          <div className="container mx-auto cursor-pointer">
            <BackButton className={"mt-10"} />
            {list.announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="p-5 m-10 rounded-md bg-zinc-900 glow"
                onClick={() =>
                  handleClick({ id: announcement._id, link: announcement.link })
                }
              >
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-2xl font-bold text-gray-300">
                    {announcement.title}{" "}
                    {announcement.link && <TbExternalLink />}
                  </div>
                  <div className="flex items-center gap-5">
                    <h2 className="font-thin text-gray-300">
                      {announcement.uploader}
                    </h2>
                    <h2 className="font-thin text-gray-300">
                      {unixTimeStampToDateTime(
                        new Date(announcement.uploadDate)
                      )}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
            {list.length > limit && (
              <div className="flex justify-center">
                <button
                  className="p-2 m-2 text-gray-300 rounded-md bg-zinc-900"
                  disabled={loading || limit >= list.length}
                  onClick={() => setLimit(limit + 10)}
                >
                  {t("loadMore")}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
