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
} from "@nextui-org/react";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { TbUpload } from "react-icons/tb";
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
  const [selectedImageFile, setSelectedImageFile] = useState(null); // Store selected image file
  const t = useTranslations("MangaForm");

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
        }
      };
      getManga();
    }
  }, [update, mangaId]);

  const validationSchema = Yup.object({
    name: Yup.string().required(t("mangaRequired")),
    author: Yup.string().notRequired(),
    artist: Yup.string().notRequired(),
    genres: Yup.array()
      .min(1, t("categoryRequired"))
      .required(t("categoryRequired")),
    summary: Yup.string().required(t("summaryRequired")),
    coverImage: Yup.string().nullable().when('$isUpdate', {
      is: false,
      then: (schema) => schema.required(t("coverRequired")),
      otherwise: (schema) => schema.nullable(),
    }),
  });

  useEffect(() => {
    const getGenres = async () => {
      try {
        const genres = await fetchGenres();
        setGenres(genres);
      } catch (error) {
        console.error(error);
      }
    };
    getGenres();
  }, []);

  const handleImageChange = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Convert to WebP and create preview
        const webpFile = await convertToWebP(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result);
        };
        reader.readAsDataURL(webpFile);

        // Store the WebP file for later upload
        setSelectedImageFile(webpFile);
        setFieldValue("coverImage", "selected"); // Set a placeholder value for validation
        
        toast.success(t("imageSelected") + " (WebP)");
      } catch (error) {
        console.error('Image processing error:', error);
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
    const promise = addGenre({ name: newGenre });

    try {
      toast.promise(promise, {
        loading: t("adding"),
        success: t("added"),
        error: t("addError"),
      });

      const result = await promise;
      setGenres([
        ...genres,
        { name: result.newGenre.name, _id: result.newGenre._id },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (values, { resetForm, setFieldValue }) => {
    const { name, author, artist, genres, summary, coverImage, type } = values;
    
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
        console.error('Image upload error:', error);
        toast.dismiss();
        toast.error(t("imageUploadError"));
        setUploading(false);
        setUploadProgress(0);
        return;
      }
    }
    
    if (!finalCoverImage && !update) {
      toast.error(t("coverRequired"));
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
    };

    if (update) {
      try {
        setUpdating(true);
        toast.promise(patchManga(mangaId, submitData), {
          loading: t("updating"),
          success: t("updated"),
          error: t("updateError"),
        });
        setUpdating(false);
        setSelectedImageFile(null);
      } catch (error) {
        console.error(error);
        setUpdating(false);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    } else {
      try {
        toast.promise(addManga(submitData), {
          loading: t("adding"),
          success: t("added"),
          error: t("addError"),
        });
        resetForm();
        setCoverImagePreview(null);
        setCoverImageUrl("");
        setSelectedImageFile(null);
        setFieldValue("coverImage", null);
        setFieldValue("genres", null);
        setLoading(false);
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  if (loading || updating) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <Card className="gap-8 p-10 m-10">
        <Formik
          initialValues={{
            name: manga?.name || "",
            author: manga?.author || "",
            artist: manga?.artist || "",
            genres: manga?.genres || [],
            summary: manga?.summary || "",
            coverImage: manga?.coverImage || null,
            type: manga?.type || "manga",
          }}
          validationSchema={validationSchema}
          validationContext={{ isUpdate: update }}
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
                isDisabled={isSubmitting}
              />
              <div className="flex flex-wrap w-full gap-4 md:flex-nowrap">
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
                  isDisabled={isSubmitting}
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
                  isDisabled={isSubmitting}
                />
              </div>
              <div className="flex flex-row items-center gap-5">
                {genres && (
                  <Select
                    items={genres}
                    label={t("categories")}
                    variant="flat"
                    isMultiline={true}
                    selectionMode="multiple"
                    labelPlacement="inside"
                    defaultSelectedKeys={keys}
                    onSelectionChange={(items) => {
                      const selectedGenres = Array.from(items.values());
                      setFieldValue("genres", selectedGenres);
                    }}
                    classNames={{
                      base: "max-w-xs",
                      trigger: "min-h-unit-12 py-2",
                    }}
                    renderValue={(items) => {
                      return (
                        <div className="flex flex-wrap gap-2">
                          {items.map((item, i) => (
                            <Chip key={i}>{item.data.name}</Chip>
                          ))}
                        </div>
                      );
                    }}
                  >
                    {(genre) => (
                      <SelectItem key={genre._id} textValue={genre.name}>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-small">{genre.name}</span>
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </Select>
                )}
                <Button onClick={onOpen}>{t("addCategory")}</Button>
              </div>

              {errors.genres && <p className="text-danger">{errors.genres}</p>}

              <Textarea
                name="summary"
                label={t("summary")}
                size="lg"
                placeholder="Özet"
                labelPlacement="outside"
                validationState={
                  errors.summary && touched.summary ? "invalid" : "valid"
                }
                errorMessage={errors.summary}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.summary}
              />

              {uploading && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm">{t("uploadingImage")}</p>
                  <Progress value={uploadProgress} color="primary" />
                </div>
              )}

              {(coverImagePreview || values.coverImage) && !uploading ? (
                <div>
                  <NextUIImage
                    src={coverImagePreview || values.coverImage}
                    alt="Cover Image Preview"
                    style={{ maxWidth: "100px" }}
                  />
                  
                  {selectedImageFile && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-success">
                        ✓ {t("imageReady")}
                      </span>
                    </div>
                  )}
                  
                  <Button
                    color="error"
                    variant="light"
                    onClick={() => {
                      setCoverImagePreview(null);
                      setCoverImageUrl("");
                      setSelectedImageFile(null);
                      setFieldValue("coverImage", null);
                    }}
                  >
                    {t("remove")}
                  </Button>
                </div>
              ) : !uploading ? (
                <>
                  <div className="items-center justify-center hidden w-full md:flex ">
                    <label
                      htmlFor="coverImage"
                      className="flex flex-col items-center justify-center w-full h-64 bg-transparent border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-zinc-800 hover:border-gray-500 "
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
                          SVG, PNG, JPG
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
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <input
                    type="file"
                    name="coverImage"
                    id="coverImage"
                    accept="image/*"
                    className="block md:hidden "
                    onChange={(event) => {
                      handleImageChange(event, setFieldValue);
                    }}
                    disabled={uploading}
                  />
                </>
              ) : null}

              {errors.coverImage && (
                <p className="text-danger">{errors.coverImage}</p>
              )}
              <Accordion>
                <AccordionItem
                  key="1"
                  aria-label="Accordion 1"
                  title={t("advanced")}
                >
                  <RadioGroup
                    label={t("type")}
                    color="secondary"
                    defaultValue="manga"
                    orientation="horizontal"
                    value={values.type}
                    onValueChange={(value) => {
                      setFieldValue("type", value);
                    }}
                  >
                    <Radio value="manga">Manga</Radio>
                    <Radio value="webtoon">Webtoon</Radio>
                    <Radio value="novel">Novel</Radio>
                  </RadioGroup>
                </AccordionItem>
              </Accordion>
              <Button
                type="submit"
                isLoading={isSubmitting || uploading}
                onClick={handleSubmit}
                isDisabled={!update && !selectedImageFile && !coverImageUrl && !values.coverImage}
              >
                {t("submit")}
              </Button>
            </>
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
                  placeholder={t("e.g")}
                  value={newGenre}
                  onChange={(event) => {
                    setNewGenre(event.target.value);
                  }}
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
