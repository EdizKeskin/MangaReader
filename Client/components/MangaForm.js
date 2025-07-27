"use client";
import {
  addGenre,
  addManga,
  fetchGenres,
  getMangaById,
  patchManga,
} from "@/functions";
import {
  Button,
  Card,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
  Image as NextUIImage,
  Accordion,
  AccordionItem,
  RadioGroup,
  Radio,
  Progress,
  Spinner,
} from "@nextui-org/react";
import { Formik } from "formik";
import React, { useEffect, useState, useRef } from "react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { TbUpload, TbSearch } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { uploadFileToR2, convertToWebP } from "@/utils/r2-upload";

export default function MangaForm({ update, mangaId, username, email }) {
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [keys, setKeys] = useState();
  const [manga, setManga] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newGenre, setNewGenre] = useState("");
  const [genres, setGenres] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [genreSearch, setGenreSearch] = useState("");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const genreInputRef = useRef(null);
  const t = useTranslations("MangaForm");

  // Handle genre search and filtering
  const handleGenreInputChange = (value, values) => {
    setGenreSearch(value);
    if (value === "") {
      setFilteredGenres([]);
      setShowGenreDropdown(false);
    } else {
      const availableGenres = getAvailableGenres(values);
      const filtered = availableGenres.filter((genre) =>
        genre.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredGenres(filtered);
      setShowGenreDropdown(filtered.length > 0);
    }
  };

  // Get available genres (excluding already selected ones)
  const getAvailableGenres = (values) => {
    const selectedGenreIds = Array.isArray(values.genres) ? values.genres : [];
    return (
      genres?.filter((genre) => !selectedGenreIds.includes(genre._id)) || []
    );
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genreInputRef.current && !genreInputRef.current.contains(e.target)) {
        setShowGenreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle genre selection
  const handleGenreSelect = (selectedGenre, setFieldValue, values) => {
    const currentGenres = Array.isArray(values.genres) ? values.genres : [];
    if (!currentGenres.includes(selectedGenre._id)) {
      setFieldValue("genres", [...currentGenres, selectedGenre._id]);
    }
    setGenreSearch("");
    setShowGenreDropdown(false);
    setFilteredGenres([]);
  };

  // Highlight search text in genre name
  const highlightSearchText = (text, search) => {
    if (!search) return text;
    const pattern = new RegExp(`(${search})`, "gi");
    return text.replace(
      pattern,
      `<b class="text-primary font-semibold">$1</b>`
    );
  };

  // Handle clear search
  const handleClearSearch = () => {
    setGenreSearch("");
    setFilteredGenres([]);
    setShowGenreDropdown(false);
  };

  useEffect(() => {
    setManga(null);
    if (update && mangaId) {
      setLoading(true);
      const getManga = async () => {
        try {
          const manga = await getMangaById(mangaId);
          setManga(manga);
          setKeys(new Set(manga.genres.map((genre) => genre)));
          setLoading(false);
        } catch (error) {
          console.error(error);
          toast.error(t("fetchError"));
          setLoading(false);
        }
      };
      getManga();
    }
  }, [update, mangaId, t]);

  const validationSchema = Yup.object({
    name: Yup.string().required(t("mangaRequired")),
    author: Yup.string().notRequired(),
    artist: Yup.string().notRequired(),
    genres: Yup.array()
      .min(1, t("categoryRequired"))
      .required(t("categoryRequired")),
    summary: Yup.string().required(t("summaryRequired")),
    coverImage: Yup.string()
      .nullable()
      .when("$isUpdate", {
        is: false,
        then: (schema) => schema.required(t("coverRequired")),
        otherwise: (schema) => schema.nullable(),
      }),
    releaseYear: Yup.number()
      .min(1900, t("releaseYearMin"))
      .max(new Date().getFullYear() + 10, t("releaseYearMax"))
      .nullable(),
    otherNames: Yup.array().of(Yup.string()),
  });

  useEffect(() => {
    const getGenres = async () => {
      try {
        const genres = await fetchGenres();
        setGenres(genres);
      } catch (error) {
        console.error(error);
        toast.error(t("genreFetchError"));
      }
    };
    getGenres();
  }, [t]);

  const handleImageChange = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("fileTypeError"));
        return;
      }

      try {
        toast.loading(t("processingImage"));
        // Convert to WebP and create preview
        const webpFile = await convertToWebP(file);

        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result);
        };
        reader.readAsDataURL(webpFile);

        // Store the WebP file for later upload
        setSelectedImageFile(webpFile);
        setFieldValue("coverImage", "selected");

        toast.dismiss();
        toast.success(t("imageSelected") + " (WebP)");
      } catch (error) {
        console.error("Image processing error:", error);
        toast.dismiss();
        toast.error(t("imageProcessError"));
        setCoverImagePreview(null);
        setSelectedImageFile(null);
        setFieldValue("coverImage", null);
      }
    } else {
      setFieldValue("coverImage", null);
      setCoverImagePreview(null);
      setSelectedImageFile(null);
      setCoverImageUrl("");
    }
  };

  const addNewGenre = async () => {
    if (newGenre === "" || !newGenre) return;

    try {
      setLoading(true);
      const result = await addGenre({ name: newGenre });

      const newGenreData = {
        name: result.newGenre.name,
        _id: result.newGenre._id,
      };
      setGenres([...genres, newGenreData]);
      setNewGenre("");
      toast.success(t("added"));
    } catch (error) {
      console.error(error);
      toast.error(t("addError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { resetForm, setFieldValue }) => {
    const {
      name,
      author,
      artist,
      genres,
      summary,
      coverImage,
      type,
      isActive,
      isAdult,
      status,
      otherNames,
      releaseYear,
    } = values;

    let finalCoverImage = coverImageUrl || (update ? coverImage : null);

    // If we have a selected image file, upload it to R2 first
    if (selectedImageFile) {
      setUploading(true);
      setUploadProgress(0);

      try {
        toast.loading(t("uploadingImage"));
        setUploadProgress(25);

        // Upload to R2 (will be auto-converted to WebP)
        const timestamp = Date.now();
        const fileName = `${timestamp}_${selectedImageFile.name}`;
        const fileKey = `coverImages/${fileName}`;

        setUploadProgress(50);
        const publicUrl = await uploadFileToR2(selectedImageFile, fileKey);
        finalCoverImage = publicUrl;
        setCoverImageUrl(publicUrl);

        setUploadProgress(100);
        toast.dismiss();
        toast.success(t("imageUploaded"));
      } catch (error) {
        console.error("Image upload error:", error);
        toast.dismiss();
        toast.error(t("imageUploadError"));
        setUploading(false);
        setUploadProgress(0);
        return;
      }
    }

    if (!finalCoverImage && !update) {
      toast.error(t("coverRequired"));
      setUploading(false);
      return;
    }

    const submitData = {
      name,
      author,
      artist,
      genres: Array.isArray(genres) ? genres : [],
      summary,
      coverImageUrl: finalCoverImage,
      uploader: username || email,
      type,
      isActive: isActive !== undefined ? isActive : true,
      isAdult: isAdult !== undefined ? isAdult : false,
      status: status || "ongoing",
      otherNames: Array.isArray(otherNames)
        ? otherNames.filter((name) => name.trim() !== "")
        : [],
      releaseYear: releaseYear || null,
    };

    if (update) {
      try {
        setUpdating(true);
        await patchManga(mangaId, submitData);
        toast.success(t("updated"));
        setSelectedImageFile(null);
      } catch (error) {
        console.error(error);
        toast.error(t("updateError"));
      } finally {
        setUpdating(false);
        setUploading(false);
        setUploadProgress(0);
      }
    } else {
      try {
        await addManga(submitData);
        toast.success(t("added"));
        resetForm();
        setCoverImagePreview(null);
        setCoverImageUrl("");
        setSelectedImageFile(null);
        setFieldValue("coverImage", null);
        setFieldValue("genres", []);
      } catch (error) {
        console.error(error);
        toast.error(t("addError"));
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const isSubmitDisabled = (values, isSubmitting) => {
    if (isSubmitting || uploading || updating) return true;
    if (!update && !selectedImageFile && !coverImageUrl && !values.coverImage)
      return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Spinner size="lg" label={t("loading")} />
      </div>
    );
  }

  return (
    <>
      <Card className="gap-6 p-6 m-4 md:p-8 md:m-8">
        <div className="text-xl font-semibold text-center">
          {update ? t("updateManga") : t("addManga")}
        </div>

        <Formik
          initialValues={{
            name: manga?.name || "",
            author: manga?.author || "",
            artist: manga?.artist || "",
            genres: manga?.genres || [],
            summary: manga?.summary || "",
            coverImage: manga?.coverImage || null,
            type: manga?.type || "manga",
            isActive: manga?.isActive !== undefined ? manga.isActive : true,
            isAdult: manga?.isAdult !== undefined ? manga.isAdult : false,
            status: manga?.status || "ongoing",
            otherNames: manga?.otherNames || [],
            releaseYear: manga?.releaseYear || null,
          }}
          validationSchema={validationSchema}
          validationContext={{ isUpdate: update }}
          onSubmit={handleSubmit}
          enableReinitialize
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
            <div className="flex flex-col gap-6">
              <Input
                name="name"
                label={t("mangaName")}
                size="lg"
                labelPlacement="outside"
                validationState={
                  errors.name && touched.name ? "invalid" : "valid"
                }
                errorMessage={errors.name}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                isDisabled={isSubmitting || uploading}
                variant="bordered"
                classNames={{
                  input: "text-base",
                  inputWrapper: "h-12",
                }}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  name="author"
                  label={t("author")}
                  size="lg"
                  labelPlacement="outside"
                  validationState={
                    errors.author && touched.author ? "invalid" : "valid"
                  }
                  errorMessage={errors.author}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.author}
                  isDisabled={isSubmitting || uploading}
                  variant="bordered"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "h-12",
                  }}
                />
                <Input
                  name="artist"
                  label={t("artist")}
                  size="lg"
                  labelPlacement="outside"
                  validationState={
                    errors.artist && touched.artist ? "invalid" : "valid"
                  }
                  errorMessage={errors.artist}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.artist}
                  isDisabled={isSubmitting || uploading}
                  variant="bordered"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "h-12",
                  }}
                />
              </div>

              <div className="flex flex-col items-start gap-4 md:flex-row md:items-end">
                <div className="flex-1 w-full">
                  <label className="block mb-2 text-sm font-medium">
                    {t("categories")}
                  </label>
                  <div className="space-y-3">
                    {genres && (
                      <div className="relative" ref={genreInputRef}>
                        <Input
                          classNames={{
                            input: "text-base",
                            inputWrapper: "h-12",
                          }}
                          placeholder={t("searchCategories")}
                          value={genreSearch}
                          onChange={(e) =>
                            handleGenreInputChange(e.target.value, values)
                          }
                          onFocus={() => {
                            if (genres && genres.length > 0) {
                              if (genreSearch === "") {
                                // Show all available genres when input is focused and empty
                                const availableGenres =
                                  getAvailableGenres(values);
                                setFilteredGenres(availableGenres);
                                setShowGenreDropdown(
                                  availableGenres.length > 0
                                );
                              } else {
                                setShowGenreDropdown(filteredGenres.length > 0);
                              }
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              setShowGenreDropdown(false);
                            }, 100);
                          }}
                          startContent={<TbSearch className="text-gray-400" />}
                          variant="bordered"
                          size="sm"
                          isClearable
                          onClear={handleClearSearch}
                          isDisabled={isSubmitting || uploading}
                        />

                        {showGenreDropdown && filteredGenres.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg dark:bg-zinc-800 dark:border-gray-600 max-h-60">
                            {filteredGenres.map((genre) => (
                              <div
                                key={genre._id}
                                className="p-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 dark:border-gray-700 last:border-b-0"
                                onClick={() =>
                                  handleGenreSelect(
                                    genre,
                                    setFieldValue,
                                    values
                                  )
                                }
                              >
                                <span
                                  className="text-sm text-gray-900 dark:text-gray-100"
                                  dangerouslySetInnerHTML={{
                                    __html: highlightSearchText(
                                      genre.name,
                                      genreSearch
                                    ),
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {genreSearch && filteredGenres.length === 0 && (
                          <div className="absolute z-50 w-full p-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-zinc-800 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t("noCategoriesFound")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected genres display */}
                    {values.genres && values.genres.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("selectedCategories")}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {values.genres.map((genreId, index) => {
                            const genre = genres?.find(
                              (g) => g._id === genreId
                            );
                            return genre ? (
                              <Chip
                                key={index}
                                size="sm"
                                variant="flat"
                                color="primary"
                                onClose={() => {
                                  const newGenres = values.genres.filter(
                                    (id) => id !== genreId
                                  );
                                  setFieldValue("genres", newGenres);
                                }}
                              >
                                {genre.name}
                              </Chip>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.genres && (
                    <p className="mt-1 text-sm text-danger">{errors.genres}</p>
                  )}
                </div>

                <div className="flex self-start md:self-center">
                  <Button
                    onClick={onOpen}
                    variant="bordered"
                    color="primary"
                    isDisabled={isSubmitting || uploading}
                    className="shrink-0"
                  >
                    {t("addCategory")}
                  </Button>
                </div>
              </div>

              <Textarea
                name="summary"
                label={t("summary")}
                size="lg"
                placeholder={t("summaryPlaceholder")}
                labelPlacement="outside"
                validationState={
                  errors.summary && touched.summary ? "invalid" : "valid"
                }
                errorMessage={errors.summary}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.summary}
                isDisabled={isSubmitting || uploading}
                variant="bordered"
                minRows={4}
                classNames={{
                  input: "text-base",
                }}
              />

              {uploading && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm font-medium">
                      {t("uploadingImage")}
                    </span>
                  </div>
                  <Progress value={uploadProgress} color="primary" />
                </div>
              )}

              {(coverImagePreview || values.coverImage) && !uploading ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">
                    {t("coverImage")}
                  </label>
                  <div className="flex flex-col items-start gap-4 md:flex-row">
                    <NextUIImage
                      src={coverImagePreview || values.coverImage}
                      alt="Cover Image Preview"
                      className="object-cover w-32 h-48 border rounded-lg"
                    />

                    <div className="flex flex-col gap-2">
                      {selectedImageFile && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-success">
                            ✓ {t("imageReady")}
                          </span>
                        </div>
                      )}

                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onClick={() => {
                          setCoverImagePreview(null);
                          setCoverImageUrl("");
                          setSelectedImageFile(null);
                          setFieldValue("coverImage", null);
                        }}
                        isDisabled={isSubmitting || uploading}
                      >
                        {t("remove")}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : !uploading ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">
                    {t("coverImage")}
                  </label>

                  {/* Desktop Upload Area */}
                  <div className="hidden md:block">
                    <label
                      htmlFor="coverImage"
                      className="flex flex-col items-center justify-center w-full h-48 transition-colors bg-transparent border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <TbUpload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">
                            {t("dragAndDrop1")}
                          </span>{" "}
                          {t("dragAndDrop2")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, WEBP (Max: 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        name="coverImage"
                        id="coverImage"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          handleImageChange(event, setFieldValue);
                        }}
                        disabled={uploading || isSubmitting}
                      />
                    </label>
                  </div>

                  {/* Mobile Upload Input */}
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 md:hidden file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    onChange={(event) => {
                      handleImageChange(event, setFieldValue);
                    }}
                    disabled={uploading || isSubmitting}
                  />

                  {errors.coverImage && (
                    <p className="text-sm text-danger">{errors.coverImage}</p>
                  )}
                </div>
              ) : null}

              <Accordion variant="bordered">
                <AccordionItem
                  key="1"
                  aria-label="Advanced Settings"
                  title={t("advanced")}
                  classNames={{
                    title: "text-sm font-medium",
                  }}
                >
                  <div className="space-y-6">
                    <RadioGroup
                      label={t("type")}
                      color="primary"
                      defaultValue="manga"
                      orientation="horizontal"
                      value={values.type}
                      onValueChange={(value) => {
                        setFieldValue("type", value);
                      }}
                      isDisabled={isSubmitting || uploading}
                    >
                      <Radio value="manga">Manga</Radio>
                      <Radio value="webtoon">Webtoon</Radio>
                      <Radio value="novel">Novel</Radio>
                    </RadioGroup>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={values.isActive}
                          onChange={(e) =>
                            setFieldValue("isActive", e.target.checked)
                          }
                          disabled={isSubmitting || uploading}
                          className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary focus:ring-primary focus:ring-2"
                        />
                        <label
                          htmlFor="isActive"
                          className="text-sm font-medium"
                        >
                          {t("isActive")}
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isAdult"
                          checked={values.isAdult}
                          onChange={(e) =>
                            setFieldValue("isAdult", e.target.checked)
                          }
                          disabled={isSubmitting || uploading}
                          className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary focus:ring-primary focus:ring-2"
                        />
                        <label
                          htmlFor="isAdult"
                          className="text-sm font-medium"
                        >
                          {t("isAdult")} (+18)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Select
                        label={t("status")}
                        placeholder={t("selectStatus")}
                        selectedKeys={values.status ? [values.status] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0];
                          setFieldValue("status", selectedKey);
                        }}
                        isDisabled={isSubmitting || uploading}
                        variant="bordered"
                      >
                        <SelectItem key="ongoing" value="ongoing">
                          {t("ongoing")}
                        </SelectItem>
                        <SelectItem key="completed" value="completed">
                          {t("completed")}
                        </SelectItem>
                        <SelectItem key="dropped" value="dropped">
                          {t("dropped")}
                        </SelectItem>
                        <SelectItem key="hiatus" value="hiatus">
                          {t("hiatus")}
                        </SelectItem>
                        <SelectItem key="güncel" value="güncel">
                          {t("güncel")}
                        </SelectItem>
                      </Select>

                      <Input
                        label={t("releaseYear")}
                        type="number"
                        placeholder={t("releaseYearPlaceholder")}
                        value={values.releaseYear || ""}
                        onChange={(e) => {
                          const year = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          setFieldValue("releaseYear", year);
                        }}
                        isDisabled={isSubmitting || uploading}
                        variant="bordered"
                        min={1900}
                        max={new Date().getFullYear() + 10}
                        validationState={
                          errors.releaseYear && touched.releaseYear
                            ? "invalid"
                            : "valid"
                        }
                        errorMessage={errors.releaseYear}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        {t("otherNames")}
                      </label>
                      <div className="space-y-2">
                        {values.otherNames.map((name, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={t("otherNamePlaceholder")}
                              value={name}
                              onChange={(e) => {
                                const newOtherNames = [...values.otherNames];
                                newOtherNames[index] = e.target.value;
                                setFieldValue("otherNames", newOtherNames);
                              }}
                              isDisabled={isSubmitting || uploading}
                              variant="bordered"
                              size="lg"
                            />
                            <Button
                              color="danger"
                              variant="light"
                              size="lg"
                              isIconOnly
                              onClick={() => {
                                const newOtherNames = values.otherNames.filter(
                                  (_, i) => i !== index
                                );
                                setFieldValue("otherNames", newOtherNames);
                              }}
                              isDisabled={isSubmitting || uploading}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                        <Button
                          color="primary"
                          variant="bordered"
                          size="sm"
                          onClick={() => {
                            setFieldValue("otherNames", [
                              ...values.otherNames,
                              "",
                            ]);
                          }}
                          isDisabled={isSubmitting || uploading}
                        >
                          + {t("addOtherName")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>

              <Button
                type="submit"
                size="lg"
                color="primary"
                isLoading={isSubmitting || uploading || updating}
                onClick={handleSubmit}
                isDisabled={isSubmitDisabled(values, isSubmitting)}
                className="w-full md:w-auto"
              >
                {update ? t("update") : t("submit")}
              </Button>
            </div>
          )}
        </Formik>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("addCategory")}
              </ModalHeader>
              <ModalBody>
                <Input
                  name="newGenre"
                  label={t("categoryName")}
                  placeholder={t("e.g")}
                  value={newGenre}
                  onChange={(event) => {
                    setNewGenre(event.target.value);
                  }}
                  variant="bordered"
                  autoFocus
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("close")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    addNewGenre();
                    onClose();
                  }}
                  isDisabled={newGenre === "" || !newGenre || loading}
                  isLoading={loading}
                >
                  {t("add")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
