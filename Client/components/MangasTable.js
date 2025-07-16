"use client";
import React, { useCallback, useMemo } from "react";
import BaseTable from "./BaseTable";
import { formatDateToCustomFormat } from "@/utils";
import { MdOutlineAddBox } from "react-icons/md";
import { TbEdit, TbTrash } from "react-icons/tb";
import { useRouter } from "next13-progressbar";

const MangasTable = React.memo(
  ({ mangaList, statusColorMap, locale, onDeleteManga }) => {
    const router = useRouter();

    const columns = useMemo(
      () => [
        { name: "ID", uid: "_id", sortable: true },
        {
          name: locale === "en" ? "Name" : "İsim",
          uid: "name",
          sortable: true,
        },
        {
          name: locale === "en" ? "Author" : "Yazar",
          uid: "author",
          sortable: true,
        },
        {
          name: locale === "en" ? "Artist" : "Sanatçı",
          uid: "artist",
          sortable: true,
        },
        {
          name: locale === "en" ? "Date" : "Tarih",
          uid: "uploadDate",
          sortable: true,
        },
        { name: locale === "en" ? "Uploader" : "Yükleyen", uid: "uploader" },
        { name: "ACTIONS", uid: "actions" },
      ],
      [locale]
    );

    const visibleColumns = useMemo(
      () => ["name", "author", "uploader", "actions"],
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
          name: locale === "en" ? "Add New Chapter" : "Yeni Bölüm Ekle",
          uid: "addChild",
          icon: <MdOutlineAddBox size="1.3em" />,
          onAction: (manga) => {
            router.push(`/admin/chapters/add?mangaId=${manga._id}`);
          },
        },
        {
          name: locale === "en" ? "Edit" : "Düzenle",
          uid: "edit",
          icon: <TbEdit size="1.3em" />,
          onAction: (manga) => {
            router.push(`/admin/mangas/${manga._id}`);
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

    const renderCell = useCallback((manga, columnKey) => {
      const cellValue = manga[columnKey];

      switch (columnKey) {
        case "uploadDate":
          const uploadDate = new Date(cellValue);
          const formattedDate = formatDateToCustomFormat(uploadDate);
          return <p>{formattedDate}</p>;

        default:
          return cellValue;
      }
    }, []);

    return (
      <BaseTable
        data={mangaList}
        columns={columns}
        visibleColumns={visibleColumns}
        tableName="Manga"
        searchFields={["name", "author", "artist", "uploader"]}
        statusOptions={statusOptions}
        statusColorMap={statusColorMap}
        addItemHref="/admin/mangas/add"
        onDelete={onDeleteManga}
        renderCell={renderCell}
        actions={actions}
      />
    );
  }
);

MangasTable.displayName = "MangasTable";

export default MangasTable;
