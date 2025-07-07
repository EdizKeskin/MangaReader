"use client";
import React, { useEffect, useState } from "react";
import { Button, Image, Select, SelectItem } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { getChapterBySlug, getChaptersByMangaSlug } from "@/functions";
import Loading from "@/components/Loading";
import { AiOutlineDoubleRight, AiOutlineDoubleLeft } from "react-icons/ai";
import DisqusComments from "@/components/DisqusComments";
import { useRouter } from "next13-progressbar";
import { useTranslations } from "next-intl";
import { BsArrowUp } from "react-icons/bs";
import dynamic from "next/dynamic";
import { TbMoon, TbSun } from "react-icons/tb";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { getSubscriber } from "@/functions";
import NextImage from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";
const EditorViewer = dynamic(() => import("@/components/EditorViewer"), {
  ssr: false,
});
import { motion } from "framer-motion";
import { FaRegComments } from "react-icons/fa";
export default function MangaRead({ params }) {
  const [isVisible, setIsVisible] = useState(false);
  const [chapter, setChapter] = useState();
  const [id, setId] = useState(params.chapter);
  const [loading, setLoading] = useState(true);
  const [mangaName, setMangaName] = useState();
  const [selected, setSelected] = useState();
  const [readStyle, setReadStyle] = useState();
  const [readStyleName, setReadStyleName] = useState();
  const [allChapters, setAllChapters] = useState(null);
  const [selectedPage, setSelectedPage] = useState(new Set(["0"]));
  const [mangaType, setMangaType] = useState();
  const [page, setPage] = useState(0);
  const { user, isSignedIn, isLoaded } = useUser();
  const [novelTheme, setNovelTheme] = useState();
  const { width } = useWindowSize();

  const isMobile = width < 768;

  const router = useRouter();
  const pathname = usePathname();
  const slug = params.id;
  const t = useTranslations("Chapter");

  useEffect(() => {
    toast("This is a sample chapter, not related to the manga.", {
      duration: 5000,
    });
  }, []);

  const readChapters = JSON.parse(localStorage.getItem("readChapters"));

  const setReaded = (id) => {
    if (readChapters) {
      if (!readChapters.includes(id)) {
        localStorage.setItem(
          "readChapters",
          JSON.stringify([...readChapters, id])
        );
      }
    } else {
      localStorage.setItem("readChapters", JSON.stringify([id]));
    }
  };

  useEffect(() => {
    setLoading(true);

    setNovelTheme(localStorage.getItem("NovelTheme") ?? "dark");
    try {
      getChaptersByMangaSlug(slug).then((res) => {
        setAllChapters(res.chapters);
        setMangaName(res.mangaName.name);
        setMangaType(res.mangaType.type);
      });

      getChapterBySlug(id, slug).then((response) => {
        const date = new Date(response.chapter.publishDate);
        if (date > new Date()) {
          if (user && isSignedIn) {
            getSubscriber(user.id).then((res) => {
              if (res !== null && new Date(res.expireAt) > new Date()) {
                setChapter(response);
                setSelected(new Set([response.chapter._id]));
                setReaded(response.chapter._id);
                setLoading(false);
              } else if (isLoaded) {
                toast.error(t("notPublished"));
                router.replace(`/subscribe`);
              }
            });
          }
        } else {
          setChapter(response);
          setSelected(new Set([response.chapter._id]));
          setReaded(response.chapter._id);
          setLoading(false);
        }
      });

      setReadStyle(
        new Set([JSON.parse(localStorage?.getItem("readStyle")) ?? "List"])
      );
      setReadStyleName(JSON.parse(localStorage.getItem("readStyle")) ?? "List");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slug, user]);

  useEffect(() => {
    let lastScrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    const handleScroll = () => {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollPosition > lastScrollPosition) {
        setIsVisible(false);
      } else {
        if (window.pageYOffset > 500) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }

      lastScrollPosition = currentScrollPosition;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!chapter || !allChapters || loading) return <Loading />;
  const isFirstChapter = allChapters[0]._id === chapter.chapter._id;
  const isLastChapter =
    allChapters[allChapters.length - 1]._id === chapter.chapter._id;
  const isLastPage = chapter.chapter.content.length - 1 === page;
  const isFirstPage = page === 0;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const scrollToComments = () => {
    const comments = document.getElementById("comments");
    comments.scrollIntoView({ behavior: "smooth" });
  };

  const goToPreviousChapter = () => {
    if (!isFirstChapter) {
      const currentIndex = allChapters.findIndex(
        (ch) => ch._id === chapter.chapter._id
      );
      if (currentIndex > 0) {
        const previousChapterId = allChapters[currentIndex - 1].slug;
        router.replace(`/manga/${slug}/${previousChapterId}`);
      }
    }
  };

  const goToNextChapter = () => {
    if (!isLastChapter) {
      const currentIndex = allChapters.findIndex(
        (ch) => ch._id === chapter.chapter._id
      );
      if (currentIndex < allChapters.length - 1) {
        const nextChapterId = allChapters[currentIndex + 1].slug;
        router.replace(`/manga/${slug}/${nextChapterId}`);
      }
    }
  };

  const styles = ["Paged", "List"];
  const changeReadStyle = (style) => {
    localStorage.setItem("readStyle", JSON.stringify(style));
    setReadStyleName(style);
  };
  const Buttons = ({ child }) => {
    return (
      <>
        {" "}
        {mangaType !== "novel" ? (
          <div className="flex flex-row items-center gap-4">
            <Button
              isDisabled={
                (readStyleName === "List" && isFirstChapter) ||
                (readStyleName === "Paged" && isFirstPage && isFirstChapter)
              }
              onClick={
                readStyleName === "List"
                  ? goToPreviousChapter
                  : isFirstPage
                  ? goToPreviousChapter
                  : () => {
                      setSelectedPage(new Set([(page - 1).toString()]));
                      setPage(page - 1);
                    }
              }
              isIconOnly
              size="lg"
            >
              <AiOutlineDoubleLeft size={"1.2em"} />
            </Button>
            {readStyleName === "Paged" && (
              <Select
                label={t("selectPage")}
                variant="bordered"
                className="min-w-[120px]"
                selectedKeys={selectedPage}
                disabledKeys={selectedPage}
                onSelectionChange={(keys) => {
                  setSelectedPage(keys);
                  setPage(keys.currentKey);
                }}
              >
                {chapter.chapter.content.map((item, key) => (
                  <SelectItem
                    key={key}
                    value={key}
                    textValue={(key + 1).toString()}
                  >
                    {key + 1}
                  </SelectItem>
                ))}
              </Select>
            )}
            {child}

            <Button
              isDisabled={
                (readStyleName === "List" && isLastChapter) ||
                (readStyleName === "Paged" && isLastPage && isLastChapter)
              }
              onClick={
                readStyleName === "List"
                  ? goToNextChapter
                  : isLastPage
                  ? goToNextChapter
                  : () => {
                      setSelectedPage(new Set([(page + 1).toString()]));
                      setPage(page + 1);
                    }
              }
              isIconOnly
              size="lg"
            >
              <AiOutlineDoubleRight size={"1.2em"} />
            </Button>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-4">
            <Button isDisabled={isFirstChapter} onClick={goToPreviousChapter}>
              <AiOutlineDoubleLeft size={"1.2em"} />
            </Button>
            <Button isDisabled={isLastChapter} onClick={goToNextChapter}>
              <AiOutlineDoubleRight size={"1.2em"} />
            </Button>
          </div>
        )}
      </>
    );
  };
  const toggleTheme = () => {
    if (novelTheme === "dark") {
      setNovelTheme("light");
      localStorage.setItem("NovelTheme", "light");
    } else {
      setNovelTheme("dark");
      localStorage.setItem("NovelTheme", "dark");
    }
  };

  return (
    <>
      <div className="mx-10 mt-3">
        <Button onClick={() => router.push(`/manga/${slug}`)} variant="light">
          <b>{t("goManga")}:</b> {mangaName}
        </Button>
      </div>
      <div className="col-span-12 m-10 ">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-row items-center gap-4">
            {mangaType !== "novel" && (
              <Select
                label={t("readStyle")}
                variant="bordered"
                className="min-w-[120px]"
                selectedKeys={readStyle}
                disabledKeys={readStyle}
                onSelectionChange={(keys) => {
                  setReadStyle(keys);
                  changeReadStyle(keys.currentKey);
                }}
              >
                {styles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </Select>
            )}
            {mangaType === "novel" && (
              <Button isIconOnly onClick={toggleTheme}>
                {novelTheme === "dark" ? (
                  <TbSun size={"1.3em"} />
                ) : (
                  <TbMoon size={"1.3em"} />
                )}
              </Button>
            )}
            <Select
              label={t("selectChapter")}
              variant="bordered"
              className="min-w-[120px]"
              selectedKeys={selected}
              disabledKeys={selected}
              onSelectionChange={(keys) => {
                setSelected(keys);

                const chapterSlug = allChapters.find(
                  (chapter) => chapter._id === keys.currentKey
                ).slug;
                setId(chapterSlug);
                router.replace(`/manga/${slug}/${chapterSlug}`);
              }}
            >
              {allChapters.map((chapter) => (
                <SelectItem key={chapter._id} value={chapter._id}>
                  {chapter.title}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Buttons />
        </div>
      </div>
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          mangaType === "novel"
            ? novelTheme === "dark"
              ? "bg-[#1f1f1f]"
              : "bg-white"
            : ""
        }`}
      >
        {mangaType !== "novel" && readStyleName === "List" ? (
          <>
            <ul
              className={`flex flex-col items-center justify-center mx-5 ${
                mangaType === "webtoon" ? "gap-0" : "gap-2"
              }`}
            >
              {chapter.chapter.content.map((item, key) => (
                <li key={key}>
                  <div className="relative ">
                    <Image
                      src={item}
                      as={NextImage}
                      className="-translate-x-1/2 rounded-none pointer-events-none select-none left-1/2"
                      height={0}
                      width={0}
                      sizes="100vw"
                      style={{
                        width: `${isMobile ? "100%" : "80%"}`,
                        height: "auto",
                      }}
                      alt="manga"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div
            className="relative flex items-center justify-center mx-5 shadow-none cursor-pointer md:w-4/5 shadow-black/5 rounded-large no-tap-highlight "
            onClick={(e) => {
              const imageWidth = e.target.offsetWidth;
              const clickX = e.clientX - e.target.getBoundingClientRect().left;

              if (clickX > imageWidth / 2) {
                if (isLastPage) {
                  goToNextChapter();
                } else {
                  setSelectedPage(new Set([(page + 1).toString()]));
                  setPage(parseInt(page) + 1);
                }
              } else {
                if (isFirstPage) {
                  goToPreviousChapter();
                } else {
                  setSelectedPage(new Set([(page - 1).toString()]));
                  setPage(parseInt(page) - 1);
                }
              }
            }}
          >
            <Image
              src={chapter.chapter.content[page]}
              className="w-full rounded-none pointer-events-none select-none md:w-4/5"
              alt="manga"
              loading="lazy"
              removeWrapper
            />
          </div>
        )}
        {mangaType === "novel" && (
          <div className="md:w-4/5">
            <EditorViewer
              value={chapter.chapter.novelContent}
              theme={novelTheme}
            />
          </div>
        )}

        <div className="col-span-12 m-10 ">
          <Buttons />
        </div>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
            className="fixed z-30 p-2 rounded-lg shadow-2xl bottom-5 bg-zinc-900/90 backdrop-blur-md"
          >
            <Buttons
              child={
                <>
                  {" "}
                  <Button onClick={scrollToTop} size="lg" isIconOnly>
                    <BsArrowUp size={"1.5em"} />
                  </Button>
                  <Button
                    onClick={scrollToComments}
                    size="lg"
                    isIconOnly
                    href="#comments"
                  >
                    <FaRegComments size={"1.5em"} />
                  </Button>
                </>
              }
            />
          </motion.div>
        )}

        <div className="w-4/5" id="comments">
          <DisqusComments
            post={chapter}
            title={`${mangaName} ${chapter.chapter.title}`}
            url={process.env.NEXT_PUBLIC_WEBSITE_URL + pathname}
          />
        </div>
      </div>
    </>
  );
}
