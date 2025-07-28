"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { getSubscriber } from "@/functions";
import NextImage from "next/image";
import { useWindowSize } from "@/hooks/useWindowSize";
const TiptapNovelReader = dynamic(
  () =>
    import("@/components/TiptapNovelReader").then((mod) => ({
      default: mod.TiptapNovelReader,
    })),
  {
    ssr: false,
  }
);
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
  const [imageLoading, setImageLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [visibleImages, setVisibleImages] = useState(new Set([0, 1, 2]));
  const { width } = useWindowSize();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const router = useRouter();
  const pathname = usePathname();
  const slug = params.id;
  const t = useTranslations("Chapter");

  // useEffect(() => {
  //   toast("This is a sample chapter, not related to the manga.", {
  //     duration: 5000,
  //   });
  // }, []);

  const [readChapters, setReadChapters] = useState([]);

  const setReaded = useCallback((id) => {
    if (typeof window !== "undefined") {
      const currentReadChapters =
        JSON.parse(localStorage.getItem("readChapters")) || [];
      if (!currentReadChapters.includes(id)) {
        const updatedChapters = [...currentReadChapters, id];
        localStorage.setItem("readChapters", JSON.stringify(updatedChapters));
        setReadChapters(updatedChapters);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const chapters = JSON.parse(localStorage.getItem("readChapters")) || [];
      setReadChapters(chapters);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setLoadedImages(new Set());
    setFailedImages(new Set());
    setVisibleImages(new Set([0, 1, 2])); // İlk 3 resmi göster
    setImageLoading(true);

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

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setVisibleImages(new Set([0, 1, 2])); // İlk 3 resmi göster
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slug, user]);

  useEffect(() => {
    setImageLoading(true);

    setFailedImages(new Set());

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [page]);

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

  const chapterNavigation = useMemo(() => {
    if (!chapter || !allChapters) return null;

    const currentIndex = allChapters.findIndex(
      (ch) => ch._id === chapter.chapter._id
    );

    return {
      isFirstChapter: currentIndex === 0,
      isLastChapter: currentIndex === allChapters.length - 1,
      currentIndex,
      previousChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      nextChapter:
        currentIndex < allChapters.length - 1
          ? allChapters[currentIndex + 1]
          : null,
    };
  }, [chapter, allChapters]);

  const pageNavigation = useMemo(() => {
    if (!chapter) return null;

    return {
      isFirstPage: page === 0,
      isLastPage: chapter.chapter.content.length - 1 === page,
      totalPages: chapter.chapter.content.length,
    };
  }, [chapter, page]);

  const getImageWidth = useCallback(() => {
    if (isMobile) return "100%";
    if (isTablet) return "90%";
    return "80%";
  }, [isMobile, isTablet]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const scrollToComments = useCallback(() => {
    const comments = document.getElementById("comments");
    comments?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const goToPreviousChapter = useCallback(() => {
    if (chapterNavigation?.previousChapter) {
      router.replace(
        `/manga/${slug}/${chapterNavigation.previousChapter.slug}`
      );
    }
  }, [chapterNavigation, router, slug]);

  const goToNextChapter = useCallback(() => {
    if (chapterNavigation?.nextChapter) {
      router.replace(`/manga/${slug}/${chapterNavigation.nextChapter.slug}`);
    }
  }, [chapterNavigation, router, slug]);

  const goToPreviousPage = useCallback(() => {
    if (pageNavigation?.isFirstPage) {
      goToPreviousChapter();
    } else {
      const newPage = page - 1;
      setSelectedPage(new Set([newPage.toString()]));
      setPage(newPage);
    }
  }, [pageNavigation, page, goToPreviousChapter]);

  const goToNextPage = useCallback(() => {
    if (pageNavigation?.isLastPage) {
      goToNextChapter();
    } else {
      const newPage = page + 1;
      setSelectedPage(new Set([newPage.toString()]));
      setPage(newPage);
    }
  }, [pageNavigation, page, goToNextChapter]);

  const styles = ["Paged", "List"];
  const changeReadStyle = useCallback((style) => {
    localStorage.setItem("readStyle", JSON.stringify(style));
    setReadStyleName(style);
  }, []);

  const handleImageLoad = useCallback((imageUrl) => {
    setLoadedImages((prev) => new Set([...prev, imageUrl]));
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback((imageUrl) => {
    console.error("Image failed to load:", imageUrl);
    setFailedImages((prev) => new Set([...prev, imageUrl]));
    setImageLoading(false);
  }, []);

  const observerRef = useRef(null);

  const observeImage = useCallback((element, index) => {
    if (!element) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const imageIndex = parseInt(entry.target.dataset.index);
              setVisibleImages((prev) => new Set([...prev, imageIndex]));
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: "200px", // Resim görünmeden 200px önce yükle
          threshold: 0.1,
        }
      );
    }

    observerRef.current.observe(element);
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleImageClick = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const imageWidth = rect.width;

      if (clickX > imageWidth / 2) {
        goToNextPage();
      } else {
        goToPreviousPage();
      }
    },
    [goToNextPage, goToPreviousPage]
  );

  const Buttons = ({ child }) => {
    return (
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
        {mangaType !== "novel" ? (
          <>
            <Button
              isDisabled={
                (readStyleName === "List" &&
                  chapterNavigation?.isFirstChapter) ||
                (readStyleName === "Paged" &&
                  pageNavigation?.isFirstPage &&
                  chapterNavigation?.isFirstChapter)
              }
              onClick={
                readStyleName === "List"
                  ? goToPreviousChapter
                  : goToPreviousPage
              }
              isIconOnly
              size={isMobile ? "md" : "lg"}
              className="min-w-unit-10 sm:min-w-unit-12"
            >
              <AiOutlineDoubleLeft size={isMobile ? "1em" : "1.2em"} />
            </Button>

            {readStyleName === "Paged" && (
              <Select
                label={t("selectPage")}
                variant="bordered"
                className="min-w-[100px] sm:min-w-[120px]"
                size={isMobile ? "sm" : "md"}
                selectedKeys={selectedPage}
                disabledKeys={selectedPage}
                onSelectionChange={(keys) => {
                  setSelectedPage(keys);
                  setPage(parseInt(keys.currentKey));
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
                (readStyleName === "List" &&
                  chapterNavigation?.isLastChapter) ||
                (readStyleName === "Paged" &&
                  pageNavigation?.isLastPage &&
                  chapterNavigation?.isLastChapter)
              }
              onClick={
                readStyleName === "List" ? goToNextChapter : goToNextPage
              }
              isIconOnly
              size={isMobile ? "md" : "lg"}
              className="min-w-unit-10 sm:min-w-unit-12"
            >
              <AiOutlineDoubleRight size={isMobile ? "1em" : "1.2em"} />
            </Button>
          </>
        ) : (
          <>
            <Button
              isDisabled={chapterNavigation?.isFirstChapter}
              onClick={goToPreviousChapter}
              size={isMobile ? "md" : "lg"}
              className="flex items-center gap-2"
            >
              <AiOutlineDoubleLeft size={isMobile ? "1em" : "1.2em"} />
              {!isMobile && <span>Previous</span>}
            </Button>
            <Button
              isDisabled={chapterNavigation?.isLastChapter}
              onClick={goToNextChapter}
              size={isMobile ? "md" : "lg"}
              className="flex items-center gap-2"
            >
              {!isMobile && <span>Next</span>}
              <AiOutlineDoubleRight size={isMobile ? "1em" : "1.2em"} />
            </Button>
          </>
        )}
      </div>
    );
  };

  if (!chapter || !allChapters || loading) return <Loading />;
  return (
    <>
      <div className="mx-4 mt-3 sm:mx-6 lg:mx-10">
        <Button
          onClick={() => router.push(`/manga/${slug}`)}
          variant="light"
          size={isMobile ? "sm" : "md"}
        >
          <b>{t("goManga")}:</b> {mangaName}
        </Button>
      </div>

      <div className="col-span-12 m-4 sm:m-6 lg:m-10">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            {mangaType !== "novel" && (
              <Select
                label={t("readStyle")}
                variant="bordered"
                className="min-w-[100px] sm:min-w-[120px]"
                size={isMobile ? "sm" : "md"}
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

            <Select
              label={t("selectChapter")}
              variant="bordered"
              className="min-w-[120px] sm:min-w-[150px]"
              size={isMobile ? "sm" : "md"}
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

      <div className="flex flex-col min-h-screen">
        {mangaType !== "novel" && readStyleName === "List" ? (
          <div className="flex flex-col items-center justify-center mx-2 sm:mx-4 lg:mx-8">
            <ul
              className={`flex flex-col items-center justify-center w-full max-w-4xl ${
                mangaType === "webtoon" ? "gap-0" : "gap-2 sm:gap-4"
              }`}
            >
              {chapter.chapter.content.map((item, key) => (
                <li key={key} className="w-full">
                  <div
                    className="relative flex justify-center"
                    ref={(el) => {
                      if (el && key >= 3) {
                        observeImage(el, key);
                      }
                    }}
                    data-index={key}
                  >
                    {!visibleImages.has(key) && (
                      <div
                        className="flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800"
                        style={{
                          width: getImageWidth(),
                          height: "200px",
                          maxWidth: "100%",
                        }}
                      >
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <div className="mb-2 text-2xl">📖</div>
                          <div className="text-sm">Page {key + 1}</div>
                        </div>
                      </div>
                    )}

                    {visibleImages.has(key) &&
                      !loadedImages.has(item) &&
                      !failedImages.has(item) && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800"
                          style={{
                            width: getImageWidth(),
                            height: "200px",
                            maxWidth: "100%",
                          }}
                        >
                          <div className="w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                        </div>
                      )}

                    {visibleImages.has(key) && failedImages.has(item) && (
                      <div
                        className="flex flex-col items-center justify-center bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        style={{
                          width: getImageWidth(),
                          height: "200px",
                          maxWidth: "100%",
                        }}
                      >
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <div className="mb-2 text-4xl">📷</div>
                          <div className="text-sm">Image failed to load</div>
                          <div className="mt-1 text-xs">Page {key + 1}</div>
                        </div>
                      </div>
                    )}

                    {visibleImages.has(key) && !failedImages.has(item) && (
                      <Image
                        src={item}
                        as={NextImage}
                        className="transition-all duration-300 rounded-none shadow-lg pointer-events-none select-none"
                        height={0}
                        width={0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw"
                        style={{
                          width: getImageWidth(),
                          height: "auto",
                          maxWidth: "100%",
                        }}
                        alt={`Page ${key + 1}`}
                        loading="eager"
                        priority={key === 0}
                        removeWrapper
                        onLoad={() => handleImageLoad(item)}
                        onError={() => handleImageError(item)}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : mangaType !== "novel" ? (
          <div className="flex justify-center mx-2 sm:mx-4 lg:mx-8">
            <div
              className="relative flex items-center justify-center w-full max-w-4xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleImageClick}
            >
              {imageLoading &&
                !loadedImages.has(chapter.chapter.content[page]) &&
                !failedImages.has(chapter.chapter.content[page]) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg dark:bg-gray-800">
                    <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}

              {failedImages.has(chapter.chapter.content[page]) && (
                <div
                  className="flex flex-col items-center justify-center bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  style={{
                    width: getImageWidth(),
                    height: "400px",
                    maxWidth: "100%",
                  }}
                >
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="mb-4 text-6xl">📷</div>
                    <div className="text-lg">Image failed to load</div>
                    <div className="mt-2 text-sm">Page {page + 1}</div>
                  </div>
                </div>
              )}

              {!failedImages.has(chapter.chapter.content[page]) && (
                <Image
                  src={chapter.chapter.content[page]}
                  as={NextImage}
                  className="transition-all duration-300 rounded-lg shadow-2xl pointer-events-none select-none"
                  height={0}
                  width={0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  style={{
                    width: getImageWidth(),
                    height: "auto",
                    maxWidth: "100%",
                  }}
                  alt={`Page ${page + 1}`}
                  loading="eager"
                  priority
                  removeWrapper
                  onLoad={() => handleImageLoad(chapter.chapter.content[page])}
                  onError={() =>
                    handleImageError(chapter.chapter.content[page])
                  }
                />
              )}

              <div className="absolute inset-0 flex">
                <div className="flex items-center justify-start w-1/2 h-full pl-4 transition-opacity duration-200 opacity-0 hover:opacity-100">
                  <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                    <AiOutlineDoubleLeft className="text-white" size="1.5em" />
                  </div>
                </div>
                <div className="flex items-center justify-end w-1/2 h-full pr-4 transition-opacity duration-200 opacity-0 hover:opacity-100">
                  <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm">
                    <AiOutlineDoubleRight className="text-white" size="1.5em" />
                  </div>
                </div>
              </div>

              <div className="absolute px-3 py-1 text-sm text-white transform -translate-x-1/2 rounded-full bottom-4 left-1/2 bg-black/50 backdrop-blur-sm">
                {page + 1} / {pageNavigation?.totalPages}
              </div>
            </div>
          </div>
        ) : null}

        {mangaType === "novel" && (
          <div className="mx-4 sm:mx-6 lg:mx-10">
            <TiptapNovelReader
              value={chapter.chapter.novelContent}
              theme={novelTheme}
            />
          </div>
        )}

        <div className="col-span-12 m-4 sm:m-6 lg:m-10">
          <Buttons />
        </div>

        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
            className="fixed z-50 flex flex-col items-center justify-center gap-2 p-2 rounded-lg shadow-lg bottom-4 right-4 sm:bg-gray-900/80 md:bg-transparent bg-white/85 backdrop-blur-md "
          >
            <Buttons
              child={
                <div className="flex gap-2">
                  <Button
                    onClick={scrollToTop}
                    size={isMobile ? "md" : "lg"}
                    isIconOnly
                  >
                    <BsArrowUp size={isMobile ? "1.2em" : "1.5em"} />
                  </Button>
                  <Button
                    onClick={scrollToComments}
                    size={isMobile ? "md" : "lg"}
                    isIconOnly
                  >
                    <FaRegComments size={isMobile ? "1.2em" : "1.5em"} />
                  </Button>
                </div>
              }
            />
          </motion.div>
        )}

        <div
          className="w-full max-w-4xl px-4 mx-auto sm:px-6 lg:px-10"
          id="comments"
        >
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
