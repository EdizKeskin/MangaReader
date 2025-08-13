"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { fetchAnnouncements, getAnnouncementById, getUserById } from "@/functions";
import Loading from "@/components/Loading";
import { unixTimeStampToDateTime } from "@/utils";
import { useTranslations } from "next-intl";
import { TiptapNovelReader } from "@/components/TiptapNovelReader";
import { TbExternalLink, TbCalendar, TbUser } from "react-icons/tb";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Spacer,
} from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/glow.css";
import BackButton from "@/components/BackButton";

export default function Announcements() {
  const [announcement, setAnnouncement] = useState();
  const [list, setList] = useState();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState();
  const [id, setId] = useState(useSearchParams().get("id"));
  const [limit, setLimit] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploaderNames, setUploaderNames] = useState({});
  const [uploaderAvatars, setUploaderAvatars] = useState({});
  const t = useTranslations("Announcements");

  useEffect(() => {
    setLoading(true);
    const resolveDisplayName = (user) => {
      if (!user) return undefined;
      return (
        user.username ||
        undefined
      );
    };

    const ensureUploaderNames = async (ids) => {
      const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
      const toFetch = uniqueIds.filter(
        (userId) => !uploaderNames[userId] || !uploaderAvatars[userId]
      );
      if (toFetch.length === 0) return;
      try {
        const results = await Promise.all(
          toFetch.map(async (userId) => {
            try {
              const user = await getUserById(userId);
              return [userId, { name: resolveDisplayName(user), image: user.image_url }];
            } catch (_) {
              return [userId, { name: undefined, image: undefined }];
            }
          })
        );
        const namesUpdate = {};
        const avatarsUpdate = {};
        for (const [key, value] of results) {
          namesUpdate[key] = value.name;
          avatarsUpdate[key] = value.image;
        }
        setUploaderNames((prev) => ({ ...prev, ...namesUpdate }));
        setUploaderAvatars((prev) => ({ ...prev, ...avatarsUpdate }));
      } catch (_) {
        // ignore
      }
    };

    const fetchData = async () => {
      const response = await getAnnouncementById(id);
      if (response.status === 404 || response.status === 500) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setAnnouncement(response);
      await ensureUploaderNames([response.uploader]);
      setNotFound(false);
      setLoading(false);
    };
    const getAllAnnouncements = async () => {
      const response = await fetchAnnouncements(limit);
      setList(response);
      const ids = (response?.announcements || []).map((a) => a.uploader);
      await ensureUploaderNames(ids);
      setLoading(false);
    };

    if (id) {
      fetchData();
    } else {
      getAllAnnouncements();
    }
  }, [id, limit, uploaderNames, uploaderAvatars]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setLimit(limit + 10);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen ">
      <AnimatePresence mode="wait">
        {notFound ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center min-h-screen p-4"
          >
            <Card className="w-full border md:max-w-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
              <CardBody className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-6 text-6xl text-red-500"
                >
                  🚫
                </motion.div>
                <h1 className="mb-4 text-3xl font-bold text-red-500">
                  {t("notFound")}
                </h1>
                <p className="text-lg text-gray-400">
                  Bu duyuru bulunamadı veya kaldırılmış olabilir.
                </p>
                <Spacer y={6} />
                <Button
                  color="primary"
                  variant="ghost"
                  onPress={() => setId(null)}
                  className="font-semibold"
                >
                  Duyurulara Geri Dön
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        ) : id && announcement ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container max-w-5xl px-4 py-8 mx-auto"
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="mb-8"
            >
              <BackButton onClick={() => setId(null)} className="mb-6" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border shadow-2xl bg-zinc-900/80 backdrop-blur-sm border-zinc-700/50">
                <CardHeader className="pb-4 p-6">
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold leading-tight text-transparent md:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                          {announcement.title}
                        </h1>
                      </div>

                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <Chip
                          startContent={<TbUser className="text-sm" />}
                          variant="flat"
                          color="secondary"
                          className="font-medium"
                        >
                          {uploaderNames[announcement.uploader] || announcement.uploader}
                        </Chip>
                        <Chip
                          startContent={<TbCalendar className="text-sm" />}
                          variant="flat"
                          color="primary"
                          className="font-medium"
                        >
                          {formattedDate}
                        </Chip>
                      </div>
                    </div>
                    <Divider className="mt-6" />
                  </div>
                </CardHeader>

                <CardBody className="px-6 pb-8 md:px-8">
                  <div className="prose prose-lg prose-invert max-w-none">
                    <TiptapNovelReader value={announcement.contents} />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          list && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="container max-w-6xl px-4 py-8 mx-auto"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="mb-8"
              >
                <BackButton className="mb-6" />
                <div className="mb-12 text-center">
                  <h1 className="mb-4 text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text">
                    📢 Duyurular
                  </h1>
                  <p className="max-w-2xl mx-auto text-lg text-gray-400">
                    En son haberler, güncellemeler ve önemli duyurular burada!
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="grid gap-6 md:gap-8"
                variants={containerVariants}
              >
                {list.announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      isPressable
                      onPress={() =>
                        handleClick({
                          id: announcement._id,
                          link: announcement.link,
                        })
                      }
                      className="w-full transition-all duration-300 border cursor-pointer bg-gradient-to-br from-zinc-900/90 to-zinc-800/50 backdrop-blur-sm border-zinc-700/30 hover:border-zinc-600/50 glow group"
                    >
                      <CardBody className="p-6 md:p-8">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h2 className="text-xl font-bold text-white transition-colors duration-300 md:text-2xl group-hover:text-blue-300 line-clamp-2">
                                {announcement.title}
                              </h2>
                              {announcement.link && (
                                <motion.div
                                  whileHover={{ rotate: 15, scale: 1.1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                >
                                  <TbExternalLink className="flex-shrink-0 text-xl text-blue-400" />
                                </motion.div>
                              )}
                            </div>

                            {announcement.link && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="mb-3"
                              >
                                Harici Bağlantı
                              </Chip>
                            )}
                          </div>

                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:text-right">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Avatar
                                size="sm"
                                src={uploaderAvatars[announcement.uploader]}
                                name={uploaderNames[announcement.uploader] || announcement.uploader}
                                className="bg-gradient-to-br from-blue-500 to-purple-600"
                              />
                              <span className="font-medium">
                                {uploaderNames[announcement.uploader] || announcement.uploader}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                              <TbCalendar className="text-sm" />
                              <time className="font-medium">
                                {unixTimeStampToDateTime(
                                  new Date(announcement.uploadDate)
                                )}
                              </time>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {list.length > limit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mt-12"
                >
                  <Button
                    color="primary"
                    variant="ghost"
                    size="lg"
                    onPress={handleLoadMore}
                    isLoading={loadingMore}
                    disabled={loadingMore || limit >= list.length}
                    className="px-8 py-3 font-semibold border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loadingMore ? "Yükleniyor..." : t("loadMore")}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
