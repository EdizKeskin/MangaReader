"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  startTransition,
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

    const loadChapterData = async () => {
      try {
        // Her iki API çağrısını parallel olarak yap
        const [chaptersResult, chapterResult] = await Promise.all([
          getChaptersByMangaSlug(slug),
          getChapterBySlug(id, slug),
        ]);

        // Chapters verilerini set et
        setAllChapters(chaptersResult.chapters);
        setMangaName(chaptersResult.mangaName.name);
        setMangaType(chaptersResult.mangaType.type);

        // Chapter verilerini kontrol et ve set et
        const date = new Date(chapterResult.chapter.publishDate);
        if (date > new Date()) {
          if (user && isSignedIn) {
            const subscriber = await getSubscriber(user.id);
            if (
              subscriber !== null &&
              new Date(subscriber.expireAt) > new Date()
            ) {
              setChapter(chapterResult);
              setSelected(new Set([chapterResult.chapter._id]));
              setReaded(chapterResult.chapter._id);
            } else if (isLoaded) {
              toast.error(t("notPublished"));
              router.replace(`/pricing`);
              return;
            }
          }
        } else {
          setChapter(chapterResult);
          setSelected(new Set([chapterResult.chapter._id]));
          setReaded(chapterResult.chapter._id);
        }

        // Read style verilerini set et
        const savedReadStyle =
          JSON.parse(localStorage.getItem("readStyle")) ?? "List";
        setReadStyle(new Set([savedReadStyle]));
        setReadStyleName(savedReadStyle);

        // List mode'da image loading'i false yap çünkü lazy loading kullanıyoruz
        if (savedReadStyle === "List") {
          setImageLoading(false);
        }
      } catch (error) {
        console.error("Error loading chapter data:", error);
        toast.error("Failed to load chapter data");
      } finally {
        // Loading'i sadece burada false yap
        setLoading(false);
      }
    };

    loadChapterData();

    // Observer cleanup
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    setVisibleImages(new Set([0, 1, 2])); // İlk 3 resmi göster
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, slug, user]);

  useEffect(() => {
    // Sadece Paged mode'da sayfa değiştiğinde image loading'i aktif et
    if (readStyleName === "Paged") {
      setImageLoading(true);

      // Mevcut sayfa için resim zaten yüklendiyse, loading'i false yap
      if (
        chapter?.chapter?.content &&
        loadedImages.has(chapter.chapter.content[page])
      ) {
        setImageLoading(false);
      }
    }

    setFailedImages(new Set());

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [page, readStyleName, chapter, loadedImages]);

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

  // Optimized navigation state with memoization
  const navigationState = useMemo(() => {
    if (!chapter || !allChapters) return null;

    const currentIndex = allChapters.findIndex(
      (ch) => ch._id === chapter.chapter._id
    );

    const totalPages = chapter.chapter.content?.length || 0;

    return {
      // Chapter navigation
      currentChapterIndex: currentIndex,
      isFirstChapter: currentIndex === 0,
      isLastChapter: currentIndex === allChapters.length - 1,
      previousChapter: currentIndex > 0 ? allChapters[currentIndex - 1] : null,
      nextChapter:
        currentIndex < allChapters.length - 1
          ? allChapters[currentIndex + 1]
          : null,

      // Page navigation
      currentPage: page,
      isFirstPage: page === 0,
      isLastPage: page === totalPages - 1,
      totalPages,
    };
  }, [chapter, allChapters, page]);

  // Memoized button states for performance
  const buttonStates = useMemo(() => {
    if (!navigationState) return null;

    const isListMode = readStyleName === "List";
    const isPagedMode = readStyleName === "Paged";
    const isNovelMode = mangaType === "novel";

    return {
      // Previous button disabled state
      isPreviousDisabled: isNovelMode
        ? navigationState.isFirstChapter
        : isListMode
        ? navigationState.isFirstChapter
        : navigationState.isFirstPage && navigationState.isFirstChapter,

      // Next button disabled state
      isNextDisabled: isNovelMode
        ? navigationState.isLastChapter
        : isListMode
        ? navigationState.isLastChapter
        : navigationState.isLastPage && navigationState.isLastChapter,

      // Button sizes and icons
      buttonSize: isMobile ? "md" : "lg",
      iconSize: isMobile ? "1em" : "1.2em",
    };
  }, [navigationState, readStyleName, mangaType, isMobile]);

  const getImageWidth = useCallback(() => {
    if (isMobile) return "100%";
    if (isTablet) return "90%";
    return "80%";
  }, [isMobile, isTablet]);

  // Optimized scroll functions
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

  // Optimized chapter navigation with better performance
  const navigateToChapter = useCallback(
    (direction) => {
      if (!navigationState) return;

      const targetChapter =
        direction === "previous"
          ? navigationState.previousChapter
          : navigationState.nextChapter;

      if (targetChapter) {
        router.replace(`/manga/${slug}/${targetChapter.slug}`);
      }
    },
    [navigationState, router, slug]
  );

  const goToPreviousChapter = useCallback(() => {
    navigateToChapter("previous");
  }, [navigateToChapter]);

  const goToNextChapter = useCallback(() => {
    navigateToChapter("next");
  }, [navigateToChapter]);

  // Optimized page navigation with state batching
  const navigateToPage = useCallback(
    (direction) => {
      if (!navigationState) return;

      if (direction === "previous") {
        if (navigationState.isFirstPage) {
          goToPreviousChapter();
        } else {
          const newPage = Math.max(0, page - 1);
          // Batch state updates for better performance
          startTransition(() => {
            setPage(newPage);
            setSelectedPage(new Set([newPage.toString()]));
          });
        }
      } else {
        if (navigationState.isLastPage) {
          goToNextChapter();
        } else {
          const newPage = Math.min(navigationState.totalPages - 1, page + 1);
          // Batch state updates for better performance
          startTransition(() => {
            setPage(newPage);
            setSelectedPage(new Set([newPage.toString()]));
          });
        }
      }
    },
    [navigationState, page, goToPreviousChapter, goToNextChapter]
  );

  const goToPreviousPage = useCallback(() => {
    navigateToPage("previous");
  }, [navigateToPage]);

  const goToNextPage = useCallback(() => {
    navigateToPage("next");
  }, [navigateToPage]);

  const styles = ["Paged", "List"];
  const changeReadStyle = useCallback(
    (style) => {
      localStorage.setItem("readStyle", JSON.stringify(style));
      setReadStyleName(style);

      // Read style değiştiğinde image loading state'ini yönet
      if (style === "List") {
        // List mode'da lazy loading kullanıldığı için image loading'i false yap
        setImageLoading(false);
      } else if (style === "Paged") {
        // Paged mode'a geçince mevcut sayfa için loading kontrolü yap
        if (
          chapter?.chapter?.content &&
          !loadedImages.has(chapter.chapter.content[page])
        ) {
          setImageLoading(true);
        } else {
          setImageLoading(false);
        }
      }
    },
    [chapter, page, loadedImages]
  );

  const handleImageLoad = useCallback(
    (imageUrl) => {
      setLoadedImages((prev) => new Set([...prev, imageUrl]));
      // Image loading state'ini sadece paged mode'da ve mevcut sayfanın resmiyse false yap
      if (
        readStyleName === "Paged" &&
        chapter?.chapter?.content &&
        chapter.chapter.content[page] === imageUrl
      ) {
        setImageLoading(false);
      }
    },
    [readStyleName, chapter, page]
  );

  const handleImageError = useCallback(
    (imageUrl) => {
      console.error("Image failed to load:", imageUrl);
      setFailedImages((prev) => new Set([...prev, imageUrl]));
      // Image loading state'ini sadece paged mode'da ve mevcut sayfanın resmiyse false yap
      if (
        readStyleName === "Paged" &&
        chapter?.chapter?.content &&
        chapter.chapter.content[page] === imageUrl
      ) {
        setImageLoading(false);
      }
    },
    [readStyleName, chapter, page]
  );

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

  // Optimized image click handler with better performance
  const handleImageClick = useCallback(
    (e) => {
      // Prevent unnecessary calculations if disabled
      if (!navigationState || !buttonStates) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const isRightSide = clickX > rect.width * 0.5;

      // Use direct navigation functions for better performance
      if (isRightSide) {
        if (!buttonStates.isNextDisabled) {
          navigateToPage("next");
        }
      } else {
        if (!buttonStates.isPreviousDisabled) {
          navigateToPage("previous");
        }
      }
    },
    [navigationState, buttonStates, navigateToPage]
  );

  // Optimized page selector with memoization
  const handlePageSelection = useCallback(
    (keys) => {
      const newPage = parseInt(keys.currentKey);
      if (newPage !== page) {
        startTransition(() => {
          setSelectedPage(keys);
          setPage(newPage);
        });
      }
    },
    [page]
  );

  // Memoized page options for Select component
  const pageOptions = useMemo(() => {
    if (!chapter?.chapter?.content) return [];

    return chapter.chapter.content.map((_, index) => ({
      key: index,
      value: index,
      label: (index + 1).toString(),
    }));
  }, [chapter?.chapter?.content]);

  if (!chapter || !allChapters || loading) return <Loading />;
  return (
    <>
      <div className="mx-4 mt-3 sm:mx-6 lg:mx-10">
        <Button
          onClick={() => router.push(`/manga/${slug}`)}
          variant="light"
          size={isMobile ? "sm" : "md"}
        >
          <b>{t("goManga")}:</b>{" "}
          {isMobile && mangaName && mangaName.length > 25
            ? mangaName.substring(0, 25) + "..."
            : mangaName}
        </Button>
      </div>

      <div className="col-span-12 m-4 sm:m-6 lg:m-10">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div className="flex flex-row items-center w-full gap-2 md:w-auto sm:gap-4">
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

          {/* First Navigation Button Group */}
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
            {mangaType !== "novel" ? (
              <>
                {/* Previous Button */}
                <Button
                  isDisabled={buttonStates?.isPreviousDisabled}
                  onClick={
                    readStyleName === "List"
                      ? goToPreviousChapter
                      : goToPreviousPage
                  }
                  isIconOnly
                  size={buttonStates?.buttonSize}
                  className="z-60 min-w-unit-10 sm:min-w-unit-12"
                  aria-label={
                    readStyleName === "List"
                      ? "Previous Chapter"
                      : "Previous Page"
                  }
                >
                  <AiOutlineDoubleLeft size={buttonStates?.iconSize} />
                </Button>

                {/* Page Selector for Paged Mode */}
                {readStyleName === "Paged" && (
                  <Select
                    label={t("selectPage")}
                    variant="bordered"
                    className="min-w-[100px] sm:min-w-[120px]"
                    size={isMobile ? "sm" : "md"}
                    selectedKeys={selectedPage}
                    disabledKeys={selectedPage}
                    onSelectionChange={handlePageSelection}
                    aria-label="Select Page"
                  >
                    {pageOptions.map((option) => (
                      <SelectItem
                        key={option.key}
                        value={option.value}
                        textValue={option.label}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {/* Next Button */}
                <Button
                  isDisabled={buttonStates?.isNextDisabled}
                  onClick={
                    readStyleName === "List" ? goToNextChapter : goToNextPage
                  }
                  isIconOnly
                  size={buttonStates?.buttonSize}
                  className="z-60 min-w-unit-10 sm:min-w-unit-12"
                  aria-label={
                    readStyleName === "List" ? "Next Chapter" : "Next Page"
                  }
                >
                  <AiOutlineDoubleRight size={buttonStates?.iconSize} />
                </Button>
              </>
            ) : (
              // Novel Mode Navigation
              <>
                <Button
                  isDisabled={buttonStates?.isPreviousDisabled}
                  onClick={goToPreviousChapter}
                  size={buttonStates?.buttonSize}
                  className="flex items-center gap-2"
                  aria-label="Previous Chapter"
                >
                  <AiOutlineDoubleLeft size={buttonStates?.iconSize} />
                  {!isMobile && <span>Previous</span>}
                </Button>

                <Button
                  isDisabled={buttonStates?.isNextDisabled}
                  onClick={goToNextChapter}
                  size={buttonStates?.buttonSize}
                  className="flex items-center gap-2"
                  aria-label="Next Chapter"
                >
                  {!isMobile && <span>Next</span>}
                  <AiOutlineDoubleRight size={buttonStates?.iconSize} />
                </Button>
              </>
            )}
          </div>
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
                {page + 1} / {navigationState?.totalPages}
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

        {/* Second Navigation Button Group */}
        <div className="block col-span-12 m-4 sm:m-6 lg:m-10">
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
            {mangaType !== "novel" ? (
              <>
                {/* Previous Button */}
                <Button
                  isDisabled={buttonStates?.isPreviousDisabled}
                  onClick={
                    readStyleName === "List"
                      ? goToPreviousChapter
                      : goToPreviousPage
                  }
                  isIconOnly
                  size={buttonStates?.buttonSize}
                  className="z-60 min-w-unit-10 sm:min-w-unit-12"
                  aria-label={
                    readStyleName === "List"
                      ? "Previous Chapter"
                      : "Previous Page"
                  }
                >
                  <AiOutlineDoubleLeft size={buttonStates?.iconSize} />
                </Button>

                {/* Page Selector for Paged Mode */}
                {readStyleName === "Paged" && (
                  <Select
                    label={t("selectPage")}
                    variant="bordered"
                    className="min-w-[100px] sm:min-w-[120px]"
                    size={isMobile ? "sm" : "md"}
                    selectedKeys={selectedPage}
                    disabledKeys={selectedPage}
                    onSelectionChange={handlePageSelection}
                    aria-label="Select Page"
                  >
                    {pageOptions.map((option) => (
                      <SelectItem
                        key={option.key}
                        value={option.value}
                        textValue={option.label}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {/* Next Button */}
                <Button
                  isDisabled={buttonStates?.isNextDisabled}
                  onClick={
                    readStyleName === "List" ? goToNextChapter : goToNextPage
                  }
                  isIconOnly
                  size={buttonStates?.buttonSize}
                  className="z-60 min-w-unit-10 sm:min-w-unit-12"
                  aria-label={
                    readStyleName === "List" ? "Next Chapter" : "Next Page"
                  }
                >
                  <AiOutlineDoubleRight size={buttonStates?.iconSize} />
                </Button>
              </>
            ) : (
              // Novel Mode Navigation
              <>
                <Button
                  isDisabled={buttonStates?.isPreviousDisabled}
                  onClick={goToPreviousChapter}
                  size={buttonStates?.buttonSize}
                  className="flex items-center gap-2"
                  aria-label="Previous Chapter"
                >
                  <AiOutlineDoubleLeft size={buttonStates?.iconSize} />
                  {!isMobile && <span>Previous</span>}
                </Button>

                <Button
                  isDisabled={buttonStates?.isNextDisabled}
                  onClick={goToNextChapter}
                  size={buttonStates?.buttonSize}
                  className="flex items-center gap-2"
                  aria-label="Next Chapter"
                >
                  {!isMobile && <span>Next</span>}
                  <AiOutlineDoubleRight size={buttonStates?.iconSize} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Floating Navigation Button Group */}
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
            className="fixed z-50 flex flex-col items-center justify-center gap-2 p-2 rounded-lg shadow-lg bottom-4 right-4 sm:bg-gray-900/80 md:bg-transparent bg-white/85 backdrop-blur-md "
          >
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4">
              {mangaType !== "novel" ? (
                <>
                  {/* Previous Button */}
                  <Button
                    isDisabled={buttonStates?.isPreviousDisabled}
                    onClick={
                      readStyleName === "List"
                        ? goToPreviousChapter
                        : goToPreviousPage
                    }
                    isIconOnly
                    size={buttonStates?.buttonSize}
                    className="z-60 min-w-unit-10 sm:min-w-unit-12"
                    aria-label={
                      readStyleName === "List"
                        ? "Previous Chapter"
                        : "Previous Page"
                    }
                  >
                    <AiOutlineDoubleLeft size={buttonStates?.iconSize} />
                  </Button>

                  {/* Page Selector for Paged Mode */}
                  {readStyleName === "Paged" && (
                    <Select
                      label={t("selectPage")}
                      variant="bordered"
                      className="min-w-[100px] sm:min-w-[120px]"
                      size={isMobile ? "sm" : "md"}
                      selectedKeys={selectedPage}
                      disabledKeys={selectedPage}
                      onSelectionChange={handlePageSelection}
                      aria-label="Select Page"
                    >
                      {pageOptions.map((option) => (
                        <SelectItem
                          key={option.key}
                          value={option.value}
                          textValue={option.label}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}

                  {/* Scroll Buttons */}
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

                  {/* Next Button */}
                  <Button
                    isDisabled={buttonStates?.isNextDisabled}
                    onClick={
                      readStyleName === "List" ? goToNextChapter : goToNextPage
                    }
                    isIconOnly
                    size={buttonStates?.buttonSize}
                    className="z-60 min-w-unit-10 sm:min-w-unit-12"
                    aria-label={
                      readStyleName === "List" ? "Next Chapter" : "Next Page"
                    }
                  >
                    <AiOutlineDoubleRight size={buttonStates?.iconSize} />
                  </Button>
                </>
              ) : (
                // Novel Mode Navigation
                <>
                  <Button
                    isDisabled={buttonStates?.isPreviousDisabled}
                    onClick={goToPreviousChapter}
                    size={buttonStates?.buttonSize}
                    className="flex items-center gap-2"
                    aria-label="Previous Chapter"
                  >
                    <AiOutlineDoubleLeft size={buttonStates?.iconSize} />
                    {!isMobile && <span>Previous</span>}
                  </Button>

                  {/* Scroll Buttons */}
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

                  <Button
                    isDisabled={buttonStates?.isNextDisabled}
                    onClick={goToNextChapter}
                    size={buttonStates?.buttonSize}
                    className="flex items-center gap-2"
                    aria-label="Next Chapter"
                  >
                    {!isMobile && <span>Next</span>}
                    <AiOutlineDoubleRight size={buttonStates?.iconSize} />
                  </Button>
                </>
              )}
            </div>
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
