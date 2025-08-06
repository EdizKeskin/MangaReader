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
  Select,
  SelectItem,
  Switch,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { TbFileTypeZip, TbUpload, TbTrash } from "react-icons/tb";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import JSZip from "jszip";
import { uploadMultipleFilesToR2, convertToWebP } from "@/utils/r2-upload";
import "@/styles/expandButton.css";
import "react-day-picker/dist/style.css";

import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";
import { DayPicker } from "react-day-picker";

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

  // Yeni state'ler
  const [isActive, setIsActive] = useState(true);
  const [isAdult, setIsAdult] = useState(false);
  const [chapterType, setChapterType] = useState("manga");

  // Batch upload states
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]); // Array of {file, extractedImages, metadata}
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchPublishDate, setBatchPublishDate] = useState(new Date());
  
  // Time selection states
  const [publishTime, setPublishTime] = useState("12:00");
  const [batchPublishTime, setBatchPublishTime] = useState("12:00");

  const searchParams = useSearchParams();
  const search = searchParams.get("mangaId");
  const t = useTranslations("ChapterForm");
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Helper function to combine date and time
  const combineDateTime = (date, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours, minutes, 0, 0);
    return combinedDate;
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

          // Yeni alanları set et (default değerlerle)
          setIsActive(chapter.chapter.isActive ?? true);
          setIsAdult(chapter.chapter.isAdult ?? false);
          setChapterType(chapter.chapter.chapterType ?? "manga");
          
          // Set time from existing publishDate if available
          if (chapter.chapter.publishDate) {
            const publishDate = new Date(chapter.chapter.publishDate);
            const hours = publishDate.getHours().toString().padStart(2, '0');
            const minutes = publishDate.getMinutes().toString().padStart(2, '0');
            setPublishTime(`${hours}:${minutes}`);
          }

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

    if (
      selectedFile &&
      selectedFile.name.endsWith(".zip") &&
      mangaType !== "novel"
    ) {
      setUploading(true);
      setUploadProgress(0);

      try {
        // Extract ZIP file
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(selectedFile);

        setUploadProgress(50);

        // Get image files from ZIP and convert to WebP
        const imageFiles = [];
        const fileEntries = Object.keys(zipContent.files).filter((filename) => {
          const file = zipContent.files[filename];
          return !file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
        });

        if (fileEntries.length === 0) {
          toast.error("ZIP dosyasında geçerli resim dosyası bulunamadı");
          setUploading(false);
          return;
        }

        // Sort filenames to maintain order
        fileEntries.sort((a, b) => a.localeCompare(b));

        // Process each image file
        for (const filename of fileEntries) {
          const file = zipContent.files[filename];
          const blob = await file.async("blob");
          const imageFile = new File([blob], filename, {
            type: blob.type || "image/jpeg",
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
        setZipFileName(selectedFile.name.replace(".zip", ""));
        setUploadProgress(100);

        toast.success(
          `${imageFiles.length} resim hazırlandı. Gönder butonuna basarak yükleyin.`
        );
      } catch (error) {
        console.error("ZIP processing error:", error);
        toast.error("ZIP dosyası işlenirken hata oluştu");
        setExtractedImages([]);
        setZipFileName("");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Batch file handling
  const handleBatchFilesChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setBatchUploading(true);
    setBatchProgress(0);

    try {
      const processedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setBatchProgress((i / selectedFiles.length) * 50);

        if (file.name.endsWith(".zip") && mangaType !== "novel") {
          try {
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);

            const imageFiles = [];
            const fileEntries = Object.keys(zipContent.files).filter(
              (filename) => {
                const fileObj = zipContent.files[filename];
                return (
                  !fileObj.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
                );
              }
            );

            if (fileEntries.length === 0) {
              toast.error(
                `${file.name} ZIP dosyasında geçerli resim dosyası bulunamadı`
              );
              continue;
            }

            fileEntries.sort((a, b) => a.localeCompare(b));

            for (const filename of fileEntries) {
              const fileObj = zipContent.files[filename];
              const blob = await fileObj.async("blob");
              const imageFile = new File([blob], filename, {
                type: blob.type || "image/jpeg",
              });

              try {
                const webpFile = await convertToWebP(imageFile);
                imageFiles.push(webpFile);
              } catch (error) {
                console.error(`WebP conversion failed for ${filename}:`, error);
                imageFiles.push(imageFile);
              }
            }

            processedFiles.push({
              file: file,
              extractedImages: imageFiles,
              fileName: file.name.replace(".zip", ""),
              metadata: {
                title: file.name.replace(".zip", ""),
                chapterNumber: null, // Will be set by user
              },
            });
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            toast.error(`${file.name} dosyası işlenirken hata oluştu`);
          }
        }
      }

      setBatchFiles(processedFiles);
      setBatchProgress(100);
      toast.success(`${processedFiles.length} dosya başarıyla işlendi`);
    } catch (error) {
      console.error("Batch processing error:", error);
      toast.error("Dosyalar işlenirken hata oluştu");
    } finally {
      setBatchUploading(false);
      setBatchProgress(0);
    }
  };

  const updateBatchFileMetadata = (index, field, value) => {
    setBatchFiles((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, metadata: { ...item.metadata, [field]: value } }
          : item
      )
    );
  };

  const removeBatchFile = (index) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchSubmit = async (manga, publishDate) => {
    if (!manga) {
      toast.error("Lütfen bir manga seçin");
      return;
    }
    
    // Combine date and time for batch upload
    const finalPublishDate = combineDateTime(publishDate, batchPublishTime);

    if (batchFiles.length === 0) {
      toast.error("Yüklenecek dosya bulunamadı");
      return;
    }

    // Validate all files have required metadata
    for (let i = 0; i < batchFiles.length; i++) {
      if (!batchFiles[i].metadata.title) {
        toast.error(`${i + 1}. dosya için başlık gerekli`);
        return;
      }
    }

    setBatchUploading(true);
    setBatchProgress(0);

    try {
      const totalFiles = batchFiles.length;
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < batchFiles.length; i++) {
        const batchFile = batchFiles[i];
        setBatchProgress((i / totalFiles) * 100);

        try {
          // Upload images to R2
          const basePath = `chapters/${manga}/${batchFile.fileName}`;
          const imageUrls = await uploadMultipleFilesToR2(
            batchFile.extractedImages,
            basePath
          );

          // Prepare chapter data
          const submitData = {
            manga,
            chapterNumber: batchFile.metadata.chapterNumber,
            title: batchFile.metadata.title,
            novelContent: "",
            uploader: username || email,
            mangaType,
            publishDate: finalPublishDate,
            imageUrls: imageUrls,
            // Yeni alanlar
            isActive,
            isAdult,
            chapterType,
          };

          // Submit chapter
          await addChapter(submitData);
          successCount++;
        } catch (error) {
          console.error(`Error uploading ${batchFile.fileName}:`, error);
          failCount++;
        }
      }

      setBatchProgress(100);

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} bölüm başarıyla yüklendi`);
      } else if (successCount > 0 && failCount > 0) {
        toast.success(
          `${successCount} bölüm başarıyla yüklendi, ${failCount} bölüm başarısız`
        );
      } else {
        toast.error("Hiçbir bölüm yüklenemedi");
      }

      // Reset batch state
      setBatchFiles([]);
    } catch (error) {
      console.error("Batch upload error:", error);
      toast.error("Toplu yükleme sırasında hata oluştu");
    } finally {
      setBatchUploading(false);
      setBatchProgress(0);
    }
  };

  const handleSubmit = async (values, { resetForm, setFieldValue }) => {
    const { manga, chapterNumber, title, publishDate } = values;
    
    // Combine date and time
    const finalPublishDate = combineDateTime(publishDate, publishTime);

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
        console.error("Image upload error:", error);
        toast.dismiss();
        toast.error("Resimler yüklenirken hata oluştu");
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
      publishDate: finalPublishDate,
      imageUrls: mangaType !== "novel" ? finalImageUrls : [],
      // Yeni alanlar
      isActive,
      isAdult,
      chapterType,
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
          {/* Mode Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                {update ? t("updateChapter") : t("addChapter")}
              </h2>
              {!update && (
                <Switch
                  isSelected={isBatchMode}
                  onValueChange={setIsBatchMode}
                  color="primary"
                >
                  Toplu Yükleme
                </Switch>
              )}
            </div>
          </div>

          {isBatchMode && !update ? (
            // Batch Upload Mode
            <div className="flex flex-col gap-6">
              {/* Manga Selection for Batch */}
              <Autocomplete
                label={t("selectManga")}
                labelPlacement="outside"
                selectedKeys={selectedManga}
                inputValue={mangaValue}
                onInputChange={(value) => {
                  setMangaValue(value);
                }}
                onSelectionChange={(selected) => {
                  setSelectedManga(selected);
                  if (selected) {
                    setMangaType(
                      mangaList.find((manga) => manga._id === selected).type
                    );
                  }
                }}
                isRequired
              >
                {mangaList.map((manga) => (
                  <AutocompleteItem key={manga._id} value={manga._id}>
                    {manga.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>

              {/* Batch File Upload */}
              {mangaType && mangaType !== "novel" && (
                <>
                  {batchUploading && (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm">Dosyalar işleniyor...</p>
                      <Progress value={batchProgress} color="primary" />
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <div className="items-center justify-center hidden w-full sm:flex">
                      <label
                        htmlFor="batchFiles"
                        className="flex flex-col items-center justify-center w-full bg-transparent border-2 border-gray-600 border-dashed rounded-lg cursor-pointer h-52 hover:bg-zinc-800 hover:border-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <TbUpload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Birden fazla ZIP dosyası seçin
                            </span>{" "}
                            veya sürükleyip bırakın
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ZIP dosyaları (birden fazla seçebilirsiniz)
                          </p>
                        </div>
                        <input
                          type="file"
                          id="batchFiles"
                          accept=".zip"
                          multiple
                          className="hidden"
                          onChange={handleBatchFilesChange}
                          disabled={batchUploading || !selectedManga}
                        />
                      </label>
                    </div>
                    <input
                      type="file"
                      id="batchFilesMobile"
                      accept=".zip"
                      multiple
                      className="block sm:hidden"
                      onChange={handleBatchFilesChange}
                      disabled={batchUploading || !selectedManga}
                    />

                    {!selectedManga && (
                      <p className="text-sm text-orange-500">
                        Önce bir manga seçin
                      </p>
                    )}
                  </div>

                  {/* Batch Files List */}
                  {batchFiles.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-semibold">
                        Yüklenecek Bölümler ({batchFiles.length})
                      </h3>
                      <div className="space-y-4">
                        {batchFiles.map((batchFile, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <TbFileTypeZip
                                    className="text-blue-400"
                                    size="1.5em"
                                  />
                                  <span className="font-medium">
                                    {batchFile.file.name}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    ({batchFile.extractedImages.length} resim)
                                  </span>
                                </div>
                                <Button
                                  isIconOnly
                                  color="danger"
                                  variant="light"
                                  onClick={() => removeBatchFile(index)}
                                >
                                  <TbTrash />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
                                  label="Bölüm Başlığı"
                                  value={batchFile.metadata.title}
                                  onChange={(e) =>
                                    updateBatchFileMetadata(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  isRequired
                                />
                                <Input
                                  label="Bölüm Numarası"
                                  type="number"
                                  value={batchFile.metadata.chapterNumber || ""}
                                  onChange={(e) =>
                                    updateBatchFileMetadata(
                                      index,
                                      "chapterNumber",
                                      e.target.value
                                        ? parseInt(e.target.value)
                                        : null
                                    )
                                  }
                                  description="Boş bırakılırsa otomatik atanır"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Toplu Yükleme Ayarları */}
                      <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold">
                          {t("batchUploadSettings")}
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          {/* Aktif/Pasif Durumu */}
                          <div className="flex flex-col gap-2">
                            <Switch
                              isSelected={isActive}
                              onValueChange={setIsActive}
                              color="success"
                            >
                              <span className="text-sm font-medium">
                                {t("activeStatus")}
                              </span>
                            </Switch>
                            <p className="text-xs text-gray-500">
                              {t("batchActiveStatusDesc")}
                            </p>
                          </div>

                          {/* +18 İçerik */}
                          <div className="flex flex-col gap-2">
                            <Switch
                              isSelected={isAdult}
                              onValueChange={setIsAdult}
                              color="warning"
                            >
                              <span className="text-sm font-medium">
                                {t("adultContent")}
                              </span>
                            </Switch>
                            <p className="text-xs text-gray-500">
                              {t("batchAdultContentDesc")}
                            </p>
                          </div>

                          {/* Bölüm Tipi */}
                          <Select
                            label={t("chapterType")}
                            placeholder={t("chapterTypeDesc")}
                            selectedKeys={[chapterType]}
                            onSelectionChange={(keys) => {
                              setChapterType(Array.from(keys)[0]);
                            }}
                            className="max-w-xs"
                          >
                            <SelectItem key="manga" value="manga">
                              Manga
                            </SelectItem>
                            <SelectItem key="novel" value="novel">
                              Novel
                            </SelectItem>
                            <SelectItem key="webtoon" value="webtoon">
                              Webtoon
                            </SelectItem>
                          </Select>
                        </div>
                      </div>

                      {/* Batch Publish Date and Time */}
                      <div className="flex flex-col gap-4">
                        <label className="text-lg font-semibold">
                          {t("publishDate")}
                        </label>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="">
                            <DayPicker
                              mode="single"
                              selected={batchPublishDate}
                              onSelect={(date) => {
                                if (date) {
                                  setBatchPublishDate(date);
                                }
                              }}
                              showOutsideDays
                              className="rdp"
                              classNames={{
                                months: "rdp-months text-white",
                                month: "rdp-month",
                                caption: "rdp-caption text-white font-medium",
                                caption_label: "rdp-caption_label text-lg",
                                nav: "rdp-nav",
                                nav_button:
                                  "rdp-nav_button text-white hover:bg-zinc-700 rounded p-2",
                                nav_button_previous: "rdp-nav_button_previous",
                                nav_button_next: "rdp-nav_button_next",
                                table: "rdp-table",
                                head_row: "rdp-head_row",
                                head_cell:
                                  "rdp-head_cell text-gray-400 font-medium p-2",
                                row: "rdp-row",
                                cell: "rdp-cell",
                                day: "rdp-day text-white hover:bg-zinc-700 rounded p-2 cursor-pointer",
                                day_range_end: "rdp-day_range_end",
                                day_selected:
                                  "rdp-day_selected bg-blue-600 text-white",
                                day_today: "rdp-day_today bg-zinc-700 font-bold",
                                day_outside: "rdp-day_outside text-gray-500",
                                day_disabled:
                                  "rdp-day_disabled text-gray-600 cursor-not-allowed",
                                day_hidden: "rdp-day_hidden invisible",
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300">
                              Yayın Saati
                            </label>
                            <input
                              type="time"
                              value={batchPublishTime}
                              onChange={(e) => setBatchPublishTime(e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500">
                              Bölümün yayınlanacağı saati seçin
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Batch Upload Button */}
                      <Button
                        color="primary"
                        size="lg"
                        isLoading={batchUploading}
                        onClick={() =>
                          handleBatchSubmit(selectedManga, batchPublishDate)
                        }
                        isDisabled={batchFiles.length === 0}
                      >
                        {batchUploading
                          ? `Yükleniyor... (%${Math.round(batchProgress)})`
                          : `${batchFiles.length} Bölümü Yükle`}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {mangaType === "novel" && (
                <div className="p-4 bg-orange-100 rounded-lg dark:bg-orange-900/20">
                  <p className="text-orange-800 dark:text-orange-200">
                    Novel türündeki mangalar için toplu yükleme
                    desteklenmemektedir. Lütfen tek tek yükleme modunu kullanın.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Single Upload Mode
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
                // Yeni alanlar
                isActive: chapter?.isActive ?? true,
                isAdult: chapter?.isAdult ?? false,
                chapterType: chapter?.chapterType ?? "manga",
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
                          "absolute top-0 bottom-0 left-0 right-0 z-10 w-full h-full bg-zinc-800"
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

                          {(imageUrls.length > 0 ||
                            extractedImages.length > 0) && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-success">
                                ✓{" "}
                                {imageUrls.length > 0
                                  ? imageUrls.length + " " + t("imagesUploaded")
                                  : extractedImages.length +
                                    " " +
                                    t("imagesReady")}
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
                  <div className="flex flex-col gap-10 md:flex-row ">
                    <div className="flex flex-col gap-4">
                      <label htmlFor="publishDate" className="text-lg">
                        {t("publishDate")}
                      </label>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="p-4 border border-gray-600 rounded-lg bg-zinc-800 max-w-fit">
                          <DayPicker
                            mode="single"
                            selected={values.publishDate}
                            onSelect={(date) => {
                              if (date) {
                                setFieldValue("publishDate", date);
                              }
                            }}
                            showOutsideDays
                            className="rdp"
                            classNames={{
                              months: "rdp-months text-white",
                              month: "rdp-month",
                              caption: "rdp-caption text-white font-medium",
                              caption_label: "rdp-caption_label text-lg",
                              nav: "rdp-nav",
                              nav_button:
                                "rdp-nav_button text-white hover:bg-zinc-700 rounded p-2",
                              nav_button_previous: "rdp-nav_button_previous",
                              nav_button_next: "rdp-nav_button_next",
                              table: "rdp-table",
                              head_row: "rdp-head_row",
                              head_cell:
                                "rdp-head_cell text-gray-400 font-medium p-2",
                              row: "rdp-row",
                              cell: "rdp-cell",
                              day: "rdp-day text-white hover:bg-zinc-700 rounded p-2 cursor-pointer",
                              day_range_end: "rdp-day_range_end",
                              day_selected:
                                "rdp-day_selected bg-blue-600 text-white",
                              day_today: "rdp-day_today bg-zinc-700 font-bold",
                              day_outside: "rdp-day_outside text-gray-500",
                              day_disabled:
                                "rdp-day_disabled text-gray-600 cursor-not-allowed",
                              day_hidden: "rdp-day_hidden invisible",
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-300">
                            Yayın Saati
                          </label>
                          <input
                            type="time"
                            value={publishTime}
                            onChange={(e) => setPublishTime(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500">
                            Bölümün yayınlanacağı saati seçin
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Yeni Alanlar */}
                    <div className="flex flex-col gap-6">
                      <h3 className="text-lg font-semibold">
                        {t("chapterSettings")}
                      </h3>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Aktif/Pasif Durumu */}
                        <div className="flex flex-col gap-2">
                          <Switch
                            isSelected={isActive}
                            onValueChange={(value) => {
                              setIsActive(value);
                              setFieldValue("isActive", value);
                            }}
                            color="success"
                          >
                            <span className="text-sm font-medium">
                              {t("activeStatus")}
                            </span>
                          </Switch>
                          <p className="text-xs text-gray-500">
                            {t("activeStatusDesc")}
                          </p>
                        </div>

                        {/* +18 İçerik */}
                        <div className="flex flex-col gap-2">
                          <Switch
                            isSelected={isAdult}
                            onValueChange={(value) => {
                              setIsAdult(value);
                              setFieldValue("isAdult", value);
                            }}
                            color="warning"
                          >
                            <span className="text-sm font-medium">
                              {t("adultContent")}
                            </span>
                          </Switch>
                          <p className="text-xs text-gray-500">
                            {t("adultContentDesc")}
                          </p>
                        </div>
                      </div>

                      {/* Bölüm Tipi */}
                      <Select
                        label={t("chapterType")}
                        placeholder={t("chapterTypeDesc")}
                        selectedKeys={[chapterType]}
                        onSelectionChange={(keys) => {
                          const selectedType = Array.from(keys)[0];
                          setChapterType(selectedType);
                          setFieldValue("chapterType", selectedType);
                        }}
                        className="max-w-xs"
                      >
                        <SelectItem key="manga" value="manga">
                          Manga
                        </SelectItem>
                        <SelectItem key="novel" value="novel">
                          Novel
                        </SelectItem>
                        <SelectItem key="webtoon" value="webtoon">
                          Webtoon
                        </SelectItem>
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    isLoading={isSubmitting || uploading}
                    onClick={handleSubmit}
                    isDisabled={
                      mangaType !== "novel" &&
                      imageUrls.length === 0 &&
                      extractedImages.length === 0 &&
                      !update
                    }
                  >
                    {update ? t("update") : t("add")}
                  </Button>
                </>
              )}
            </Formik>
          )}
        </CardBody>
      </Card>
    </>
  );
}
