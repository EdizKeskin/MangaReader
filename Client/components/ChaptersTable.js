"use client";
import React, { useCallback, useMemo } from "react";
import BaseTable from "./BaseTable";
import { formatDateToCustomFormat } from "@/utils";
import { TbEdit, TbTrash } from "react-icons/tb";
import { useRouter } from "next13-progressbar";

const ChaptersTable = React.memo(
  ({ chapters, mangaNames, statusColorMap, locale, onDeleteChapter }) => {
    const router = useRouter();

    const transformedChapters = useMemo(() => {
      return chapters.map((chapter) => ({
        ...chapter,
        mangaId: chapter.manga,
        manga:
          mangaNames?.find((manga) => manga._id === chapter.manga)?.name ||
          chapter.manga,
      }));
    }, [chapters, mangaNames]);

    const columns = useMemo(
      () => [
        { name: "ID", uid: "_id" },
        { name: "MANGA", uid: "manga" },
        { name: locale === "en" ? "Title" : "Başlık", uid: "title" },
        {
          name: locale === "en" ? "Date" : "Tarih",
          uid: "uploadDate",
          sortable: true,
        },
        {
          name: locale === "en" ? "Publish Date" : "Yayınlanma Tarihi",
          uid: "publishDate",
          sortable: true,
        },
        { name: "ACTIONS", uid: "actions" },
      ],
      [locale]
    );

    const visibleColumns = useMemo(
      () => ["manga", "title", "uploadDate", "actions"],
      []
    );

    const statusOptions = useMemo(
      () => [
        { name: "Active", uid: "active" },
        { name: "Paused", uid: "paused" },
        { name: "Vacation", uid: "vacation" },
      ],
      []
    );

    const actions = useMemo(
      () => [
        {
          name: locale === "en" ? "Edit" : "Düzenle",
          uid: "edit",
          icon: <TbEdit size="1.3em" />,
          onAction: (chapter) => {
            router.push(`/admin/chapters/${chapter._id}`);
          },
        },
        {
          name: locale === "en" ? "Delete" : "Sil",
          uid: "delete",
          icon: <TbTrash size="1.3em" />,
        },
      ],
      [locale, router]
    );

    const renderCell = useCallback((chapter, columnKey) => {
      const cellValue = chapter[columnKey];

      switch (columnKey) {
        case "uploadDate":
          const uploadDate = new Date(cellValue);
          const formattedUploadDate = formatDateToCustomFormat(uploadDate);
          return <p>{formattedUploadDate}</p>;

        case "publishDate":
          const publishDate = new Date(cellValue);
          const formattedPublishDate = formatDateToCustomFormat(publishDate);
          return <p>{formattedPublishDate}</p>;

        case "manga":
          // Now manga field contains the manga name directly
          return <p>{cellValue}</p>;

        default:
          return cellValue;
      }
    }, []);

    return (
      <BaseTable
        data={transformedChapters}
        columns={columns}
        visibleColumns={visibleColumns}
        tableName={locale === "en" ? "Chapter" : "Bölüm"}
        searchFields={["title", "manga"]}
        statusOptions={statusOptions}
        statusColorMap={statusColorMap}
        addItemHref="/admin/chapters/add"
        onDelete={onDeleteChapter}
        renderCell={renderCell}
        actions={actions}
      />
    );
  }
);

ChaptersTable.displayName = "ChaptersTable";

export default ChaptersTable;
