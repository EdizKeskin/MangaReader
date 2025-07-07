import {
  getChapterBySlug,
  getChaptersByMangaSlug,
  getMangaBySlug,
} from "@/functions";

import ClientPage from "./ClientPage";

export default function MangaRead({ params }) {
  // const [isVisible, setIsVisible] = useState(false);
  // const [chapter, setChapter] = useState();
  // const [id, setId] = useState(params.chapter);
  // const [loading, setLoading] = useState(true);
  // const [mangaName, setMangaName] = useState();
  // const [selected, setSelected] = useState();
  // const [readStyle, setReadStyle] = useState();
  // const [readStyleName, setReadStyleName] = useState();
  // const [allChapters, setAllChapters] = useState(null);
  // const [selectedPage, setSelectedPage] = useState(new Set(["0"]));
  // const [mangaType, setMangaType] = useState();
  // const [page, setPage] = useState(0);
  // const { user, isSignedIn, isLoaded } = useUser();
  // const [novelTheme, setNovelTheme] = useState();
  // const { width } = useWindowSize();

  // const isMobile = width < 768;

  // const router = useRouter();
  // const pathname = usePathname();
  const slug = params.id;
  // const t = useTranslations("Chapter");
  // const readChapters = JSON.parse(localStorage.getItem("readChapters"));

  // useEffect(() => {
  //   toast("This is a sample chapter, not related to the manga.", {
  //     duration: 5000,
  //   });
  // }, []);

  // const setReaded = (id) => {
  //   if (readChapters) {
  //     if (!readChapters.includes(id)) {
  //       localStorage.setItem(
  //         "readChapters",
  //         JSON.stringify([...readChapters, id])
  //       );
  //     }
  //   } else {
  //     localStorage.setItem("readChapters", JSON.stringify([id]));
  //   }
  // };

  // useEffect(() => {
  //   setLoading(true);

  //   setNovelTheme(localStorage.getItem("NovelTheme") ?? "dark");
  //   try {
  //     getChaptersByMangaSlug(slug).then((res) => {
  //       setAllChapters(res.chapters);
  //       setMangaName(res.mangaName.name);
  //       setMangaType(res.mangaType.type);
  //     });

  //     getChapterBySlug(id, slug).then((response) => {
  //       const date = new Date(response.chapter.publishDate);
  //       if (date > new Date()) {
  //         if (user && isSignedIn) {
  //           getSubscriber(user.id).then((res) => {
  //             if (res !== null && new Date(res.expireAt) > new Date()) {
  //               setChapter(response);
  //               setSelected(new Set([response.chapter._id]));
  //               setReaded(response.chapter._id);
  //               setLoading(false);
  //             } else if (isLoaded) {
  //               toast.error(t("notPublished"));
  //               router.replace(`/subscribe`);
  //             }
  //           });
  //         }
  //       } else {
  //         setChapter(response);
  //         setSelected(new Set([response.chapter._id]));
  //         setReaded(response.chapter._id);
  //         setLoading(false);
  //       }
  //     });

  //     setReadStyle(
  //       new Set([JSON.parse(localStorage?.getItem("readStyle")) ?? "List"])
  //     );
  //     setReadStyleName(JSON.parse(localStorage.getItem("readStyle")) ?? "List");
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [id, slug, user]);

  return (
    <>
      <ClientPage params={params} />
    </>
  );
}

export async function generateMetadata({ params }) {
  console.log("Generating metadata for manga:", params);

  const manga = await getMangaBySlug(params.id);
  const chapter = await getChapterBySlug(params.chapter, params.id);
  console.log("Fetched manga data:", manga);
  return {
    title: manga.name + " - " + chapter.chapter.title,
    description: manga.summary,
    keywords: [
      manga.name,
      manga.name + "türkçe",
      manga.name + "türkçe oku",
      manga.name + " chapter " + chapter.chapter.chapterNumber,
      manga.name + " bölüm " + chapter.chapter.chapterNumber,
      "webtoon",
      "manga sitesi",
      "manga oku",
      "manga",
      "webnovel",
    ],
    openGraph: {
      title: manga.name,
      description: manga.name + " - " + chapter.chapter.title,
      images: [manga.coverImage],
    },
  };
}
