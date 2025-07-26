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
  Progress,
} from "@nextui-org/react";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { TbFileTypeZip, TbUpload } from "react-icons/tb";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import JSZip from "jszip";
import { uploadMultipleFilesToR2, convertToWebP } from "@/utils/r2-upload";
import "@/styles/expandButton.css";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "@/styles/calendar.css";

import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";

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
  const [novelContent, setNovelContent] = useState("");
  const [mangaValue, setMangaValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [extractedImages, setExtractedImages] = useState([]); // Store extracted images before upload
  const [zipFileName, setZipFileName] = useState(""); // Store ZIP file name
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

    if (update && chapterId && mangaList.length > 0) {
      setLoading(true);
      const getChapter = async () => {
        try {
          const chapter = await getChapterById(chapterId);
          setChapter(chapter.chapter);
          setMangaType(chapter.mangaType);
          setNovelContent(chapter.chapter.novelContent || "");
          setSelectedManga(chapter.chapter.manga);

          const foundManga = mangaList.find(
            (manga) => manga._id === chapter.chapter.manga
          );
          if (foundManga) {
            setMangaValue(foundManga.name);
          }

          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(false);
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

  const handleFolderChange = async (event, setFieldValue) => {
    const selectedFile = event.target.files[0];
    setFieldValue("folder", selectedFile);

    if (selectedFile && selectedFile.name.endsWith('.zip') && mangaType !== "novel") {
      setUploading(true);
      setUploadProgress(0);
      
      try {
        // Extract ZIP file
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(selectedFile);
        
        setUploadProgress(50);
        
        // Get image files from ZIP and convert to WebP
        const imageFiles = [];
        const fileEntries = Object.keys(zipContent.files).filter(filename => {
          const file = zipContent.files[filename];
          return !file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
        });

        if (fileEntries.length === 0) {
          toast.error('ZIP dosyasında geçerli resim dosyası bulunamadı');
          setUploading(false);
          return;
        }

        // Sort filenames to maintain order
        fileEntries.sort((a, b) => a.localeCompare(b));

        // Process each image file
        for (const filename of fileEntries) {
          const file = zipContent.files[filename];
          const blob = await file.async('blob');
          const imageFile = new File([blob], filename, { 
            type: blob.type || 'image/jpeg' 
          });
          
          // Convert to WebP
          try {
            const webpFile = await convertToWebP(imageFile);
            imageFiles.push(webpFile);
          } catch (error) {
            console.error(`WebP conversion failed for ${filename}:`, error);
            // If conversion fails, use original file
            imageFiles.push(imageFile);
          }
        }

        // Store converted images for later upload
        setExtractedImages(imageFiles);
        setZipFileName(selectedFile.name.replace('.zip', ''));
        setUploadProgress(100);
        
        toast.success(`${imageFiles.length} resim hazırlandı. Gönder butonuna basarak yükleyin.`);
      } catch (error) {
        console.error('ZIP processing error:', error);
        toast.error('ZIP dosyası işlenirken hata oluştu');
        setExtractedImages([]);
        setZipFileName("");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSubmit = async (values, { resetForm, setFieldValue }) => {
    const { manga, chapterNumber, title, publishDate } = values;
    
    let finalImageUrls = imageUrls; // Use existing URLs if available
    
    // If we have extracted images, upload them to R2 first
    if (extractedImages.length > 0 && mangaType !== "novel") {
      setUploading(true);
      setUploadProgress(0);
      
      try {
        toast.loading(t("uploadingImages"));
        setUploadProgress(25);
        
        // Upload extracted images to R2
        const basePath = `chapters/${manga}/${zipFileName}`;
        const urls = await uploadMultipleFilesToR2(extractedImages, basePath);
        finalImageUrls = urls;
        setImageUrls(urls);
        
        setUploadProgress(75);
        toast.dismiss();
        toast.success(`${extractedImages.length} resim başarıyla yüklendi`);
      } catch (error) {
        console.error('Image upload error:', error);
        toast.dismiss();
        toast.error('Resimler yüklenirken hata oluştu');
        setUploading(false);
        setUploadProgress(0);
        return;
      }
    }
    
    const submitData = {
      manga,
      chapterNumber,
      title,
      novelContent,
      uploader: username || email,
      mangaType,
      publishDate,
      imageUrls: mangaType !== "novel" ? finalImageUrls : [],
    };

    if (update) {
      try {
        toast.promise(patchChapter(chapterId, submitData), {
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
        setImageUrls([]);
        setExtractedImages([]);
        setZipFileName("");
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
      return;
    }

    try {
      toast.promise(addChapter(submitData), {
        loading: t("adding"),
        success: t("added"),
        error: t("addError"),
      });
      resetForm();
      setSelectedManga();
      setMangaValue("");
      setImageUrls([]);
      setExtractedImages([]);
      setZipFileName("");
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  if (loading || (update && mangaList.length === 0)) {
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
              publishDate: chapter?.publishDate
                ? new Date(chapter.publishDate)
                : new Date(),
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
                        "absolute top-0 bottom-0 left-0 right-0 z-50 w-full h-full bg-zinc-800"
                      }`}
                    >
                      <div
                        className={`flex flex-row items-center gap-3 bg-zinc-700${
                          expanded ? "p-4" : "mb-2"
                        }`}
                      >
                        <label
                          htmlFor="novelContent"
                          className="text-lg font-bold "
                        >
                          {t("content")}
                        </label>
                        <label className="container">
                          <input
                            checked={expanded}
                            type="checkbox"
                            onClick={toggleExpanded}
                          />
                          <svg
                            viewBox="0 0 448 512"
                            height="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            className="expand"
                          >
                            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"></path>
                          </svg>
                          <svg
                            viewBox="0 0 448 512"
                            height="1em"
                            xmlns="http://www.w3.org/2000/svg"
                            className="compress"
                          >
                            <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"></path>
                          </svg>
                        </label>
                      </div>
                      <SimpleEditor
                        value={
                          typeof novelContent === "string" ? novelContent : ""
                        }
                        setValue={setNovelContent}
                      />
                    </div>
                  </>
                )}
                {mangaType !== "novel" && (
                  <>
                    {uploading && (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm">{t("processing")}</p>
                        <Progress value={uploadProgress} color="primary" />
                      </div>
                    )}
                    
                    {values.folder && !uploading ? (
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
                        
                        {(imageUrls.length > 0 || extractedImages.length > 0) && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-success">
                              ✓ {imageUrls.length > 0 ? imageUrls.length + " " + t("imagesUploaded") : extractedImages.length + " " + t("imagesReady")}
                            </span>
                          </div>
                        )}
                        
                        <Button
                          color="danger"
                          variant="light"
                          onClick={() => {
                            setFieldValue("folder", null);
                            setImageUrls([]);
                            setExtractedImages([]);
                            setZipFileName("");
                          }}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    ) : !uploading ? (
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
                              disabled={uploading || !selectedManga}
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
                          disabled={uploading || !selectedManga}
                        />
                        
                        {!selectedManga && (
                          <p className="text-sm text-orange-500">
                            {t("selectMangaFirst")}
                          </p>
                        )}
                      </>
                    ) : null}
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
                <Button
                  type="submit"
                  isLoading={isSubmitting || uploading}
                  onClick={handleSubmit}
                  isDisabled={mangaType !== "novel" && imageUrls.length === 0 && extractedImages.length === 0 && !update}
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
