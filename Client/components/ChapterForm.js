"use client";
import {
  addChapter,
  getChapterById,
  getMangaNames,
  patchChapter,
} from "@/functions";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  Input,
} from "@nextui-org/react";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { TbFileTypeZip, TbUpload } from "react-icons/tb";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import "@/styles/expandButton.css";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "@/styles/calendar.css";

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const DateTimePicker = dynamic(() => import("react-datetime-picker"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function ChapterForm({ update, chapterId, username, email }) {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [mangaType, setMangaType] = useState();
  const [selectedManga, setSelectedManga] = useState();
  const [novelContent, setNovelContent] = useState();
  const [mangaValue, setMangaValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();
  const search = searchParams.get("mangaId");
  const t = useTranslations("ChapterForm");
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const fetchMangaList = async () => {
      try {
        const mangaList = await getMangaNames();
        setMangaList(mangaList);
        if (search) {
          setSelectedManga(search);
          setMangaType(mangaList.find((manga) => manga._id === search).type);
          setMangaValue(mangaList.find((manga) => manga._id === search).name);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMangaList();
  }, [search]);

  useEffect(() => {
    setChapter(null);

    if (update && chapterId) {
      setLoading(true);
      const getChapter = async () => {
        try {
          const chapter = await getChapterById(chapterId);
          setChapter(chapter.chapter);
          setMangaType(chapter.mangaType);
          setNovelContent(chapter.chapter.novelContent);
          setSelectedManga(chapter.chapter.manga);
          setMangaValue(
            mangaList.find((manga) => manga._id === chapter.chapter.manga).name
          );
          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
      getChapter();
    }
  }, [update, chapterId, mangaList]);

  const validationSchema = Yup.object({
    manga: Yup.string().required(t("mangaRequired")),
    title: Yup.string().required(t("titleRequired")),
    chapterNumber: Yup.number(),
  });

  const handleFolderChange = (event, setFieldValue) => {
    const selectedFolder = event.target.files[0];
    setFieldValue("folder", selectedFolder);
  };

  const handleSubmit = async (values, { resetForm, setFieldValue }) => {
    const { manga, chapterNumber, title, folder, publishDate } = values;
    console.log(values);
    const formData = new FormData();
    formData.append("manga", manga);
    formData.append("chapterNumber", chapterNumber);
    formData.append("title", title);
    formData.append("folder", folder);
    formData.append("novelContent", novelContent);
    formData.append("uploader", username || email);
    formData.append("mangaType", mangaType);
    formData.append("publishDate", publishDate);

    if (update) {
      try {
        toast.promise(patchChapter(chapterId, formData), {
          loading: t("updating"),
          success: t("updated"),
          error: t("updateError"),
        });
        resetForm();
        setFieldValue("folder", null);
        setFieldValue("manga", manga);
        setFieldValue("chapterNumber", chapterNumber);
        setFieldValue("title", title);
        setFieldValue("novelContent", novelContent);
        setFieldValue("publishDate", publishDate);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    try {
      toast.promise(addChapter(formData), {
        loading: t("adding"),
        success: t("added"),
        error: t("addError"),
      });
      resetForm();
      setSelectedManga();
      setMangaValue("");
    } catch (error) {
      console.error(error);
    }
  };
  if (loading) {
    return <p>{t("loading")}</p>;
  }

  return (
    <>
      <Card className={`${expanded && "min-h-screen"} m-10`}>
        <CardBody className="gap-10 p-10">
          <Formik
            initialValues={{
              manga: chapter?.manga || search || "",
              chapterNumber: chapter?.chapterNumber || "",
              title: chapter?.title || "",
              folder: null,
              novelContent: chapter?.novelContent || "",
              publishDate: chapter?.publishDate || new Date(),
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleBlur,
              handleChange,
              errors,
              touched,
              values,
              isSubmitting,
              handleSubmit,
              setFieldValue,
            }) => (
              <>
                <Autocomplete
                  label={t("selectManga")}
                  labelPlacement="outside"
                  selectedKeys={selectedManga}
                  inputValue={mangaValue}
                  onInputChange={(value) => {
                    setMangaValue(value);
                  }}
                  onSelectionChange={(selected) => {
                    setFieldValue("manga", selected);
                    setSelectedManga(selected);
                    if (selected) {
                      setMangaType(
                        mangaList.find((manga) => manga._id === selected).type
                      );
                    }
                  }}
                  isInvalid={errors.manga && touched.manga}
                  errorMessage={errors.manga}
                  description={values.manga}
                >
                  {mangaList.map((manga) => (
                    <AutocompleteItem key={manga._id} value={manga._id}>
                      {manga.name}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <Input
                  name="title"
                  label={t("title")}
                  size="lg"
                  labelPlacement="outside"
                  validationState={
                    errors.title && touched.title ? "invalid" : "valid"
                  }
                  errorMessage={errors.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.title}
                  isDisabled={isSubmitting}
                />
                <Input
                  name="chapterNumber"
                  label={t("chapterNumber")}
                  size="lg"
                  type="number"
                  labelPlacement="outside"
                  validationState={
                    errors.chapterNumber && touched.chapterNumber
                      ? "invalid"
                      : "valid"
                  }
                  errorMessage={errors.chapterNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.chapterNumber}
                  isDisabled={isSubmitting}
                  description={t("chapterNumberDesc")}
                />

                {mangaType && mangaType === "novel" && (
                  <>
                    <div
                      className={`${
                        expanded &&
                        "absolute top-0 bottom-0 left-0 right-0 z-50 w-full h-full bg-zinc-900"
                      }`}
                    >
                      <div
                        className={`flex flex-row items-center gap-3 ${
                          expanded ? "p-4" : "mb-2"
                        }`}
                      >
                        <label
                          htmlFor="novelContent"
                          className="text-lg font-bold "
                        >
                          {t("content")}
                        </label>
                        <label class="container">
                          <input
                            checked={expanded}
                            type="checkbox"
                            onClick={toggleExpanded}
                          />
                          <svg
                            viewBox="0 0 448 512"
                            height="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            class="expand"
                          >
                            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"></path>
                          </svg>
                          <svg
                            viewBox="0 0 448 512"
                            height="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            class="compress"
                          >
                            <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"></path>
                          </svg>
                        </label>
                      </div>
                      <Editor
                        name={"novelContent"}
                        value={novelContent}
                        setValue={setNovelContent}
                      />
                    </div>
                  </>
                )}
                {mangaType !== "novel" && (
                  <>
                    {values.folder ? (
                      <div className="flex flex-col items-start gap-3">
                        <div className="flex items-center justify-center gap-3">
                          <TbFileTypeZip
                            className="text-gray-400"
                            size={"1.7em"}
                          />
                          <p className="text-success">
                            {values.folder.name} (
                            {(values.folder.size / 1000000).toFixed(2)} MB)
                          </p>
                        </div>
                        <Button
                          color="danger"
                          variant="light"
                          onClick={() => {
                            setFieldValue("folder", null);
                          }}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="items-center justify-center hidden w-full sm:flex ">
                          <label
                            htmlFor="folder"
                            className="flex flex-col items-center justify-center w-full bg-transparent border-2 border-gray-600 border-dashed rounded-lg cursor-pointer h-52 hover:bg-zinc-800 hover:border-gray-500 "
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <TbUpload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">
                                  {t("dragAndDrop1")}
                                </span>{" "}
                                {t("dragAndDrop2")}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ZIP
                              </p>
                            </div>
                            <input
                              type="file"
                              name="folder"
                              id="folder"
                              accept=".zip"
                              className="hidden"
                              onChange={(event) => {
                                handleFolderChange(event, setFieldValue);
                              }}
                            />
                          </label>
                        </div>
                        <input
                          type="file"
                          name="folder"
                          id="folder"
                          accept=".zip"
                          className="block sm:hidden "
                          onChange={(event) => {
                            handleFolderChange(event, setFieldValue);
                          }}
                        />
                      </>
                    )}
                  </>
                )}
                <div className="flex flex-col gap-4">
                  <label htmlFor="publishDate" className="text-lg">
                    {t("publishDate")}
                  </label>
                  <DateTimePicker
                    onChange={(date) => {
                      setFieldValue("publishDate", date);
                    }}
                    value={values.publishDate}
                    disableClock
                    name="publishDate"
                    className={"bg-zinc-800"}
                  />
                </div>
                {mangaType !== "novel" && errors.folder && (
                  <p className="text-danger">{errors.folder}</p>
                )}
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  {update ? t("update") : t("add")}
                </Button>
              </>
            )}
          </Formik>
        </CardBody>
      </Card>
    </>
  );
}
