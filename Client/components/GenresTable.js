"use client";
import React, { useCallback, useMemo, useState } from "react";
import { TbEdit, TbEye, TbTrash } from "react-icons/tb";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { BiCaretDown, BiPlus, BiSearchAlt } from "react-icons/bi";
import { capitalize } from "@/utils";
import toast from "react-hot-toast";
import { addGenre, deleteGenre, patchGenre } from "@/functions";
import { PiWarningBold } from "react-icons/pi";
import { useRouter } from "next13-progressbar";
import { useTranslations } from "next-intl";

export default function GenresTable({
  genres: initialGenres,
  columns,
  INITIAL_VISIBLE_COLUMNS,
}) {
  const [newGenre, setNewGenre] = useState("");
  const [editGenreId, setEditGenreId] = useState("");
  const [editGenreName, setEditGenreName] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(false);
  const hasSearchFilter = Boolean(filterValue);
  const [genres, setGenres] = useState(initialGenres);
  const [deleteGenreKey, setDeleteGenreKey] = useState();
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const t = useTranslations("GenresTable");
  const {
    isOpen: addCategory,
    onOpen: addCategoryOpen,
    onOpenChange: addCategoryChange,
  } = useDisclosure();
  const {
    isOpen: deleteGenreModal,
    onOpen: deleteGenreOpen,
    onOpenChange: deleteGenreChange,
  } = useDisclosure();
  const {
    isOpen: editGenreModal,
    onOpen: editGenreOpen,
    onOpenChange: editGenreChange,
  } = useDisclosure();
  const router = useRouter();

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [columns, visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...genres];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((data) =>
        data.name
          ? data.name.toLowerCase().includes(filterValue.toLowerCase())
          : data.username.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredData;
  }, [genres, hasSearchFilter, filterValue]);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const renderCell = useCallback(
    (genre, columnKey) => {
      const cellValue = genre[columnKey];
      switch (columnKey) {
        case "actions":
          return (
            <div className="flex justify-end gap-2">
              <Tooltip content={t("details")}>
                <Button
                  className="text-lg cursor-pointer text-default-400 active:opacity-50"
                  variant="light"
                  isIconOnly
                  onClick={() => {
                    router.push(`/genres/${genre._id}`);
                  }}
                >
                  <TbEye size={"1.3em"} />
                </Button>
              </Tooltip>
              <Tooltip content={t("editGenre")}>
                <Button
                  className="text-lg cursor-pointer text-default-400 active:opacity-50"
                  variant="light"
                  isIconOnly
                  onClick={() => {
                    setEditGenreId(genre._id);
                    setEditGenreName(genre.name);
                    editGenreOpen();
                  }}
                >
                  <TbEdit size={"1.3em"} />
                </Button>
              </Tooltip>
              <Tooltip content={t("deleteGenre")} color="danger">
                <Button
                  className="text-lg cursor-pointer text-danger active:opacity-50"
                  variant="light"
                  isIconOnly
                  color="danger"
                  onClick={() => {
                    setDeleteGenreKey(genre);
                    deleteGenreOpen();
                  }}
                >
                  <TbTrash size={"1.3em"} />
                </Button>
              </Tooltip>
            </div>
          );

        default:
          return cellValue;
      }
    },
    [deleteGenreOpen, editGenreOpen, router, t]
  );
  const onClear = useCallback(() => {
    setFilterValue("");
  }, []);
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-row items-center justify-between gap-4">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder={t("searchByName")}
          startContent={<BiSearchAlt />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3 ">
          <Dropdown>
            <DropdownTrigger className="flex">
              <Button
                endContent={<BiCaretDown className="text-small" />}
                variant="flat"
              >
                {t("columns")}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color="secondary"
            endContent={<BiPlus size={"1.2em"} />}
            onClick={addCategoryOpen}
            className="hidden sm:flex"
          >
            {t("addGenre")}
          </Button>
          <Button
            color="secondary"
            onClick={addCategoryOpen}
            isIconOnly
            className="flex sm:hidden"
          >
            <BiPlus size={"1.2em"} />
          </Button>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    visibleColumns,
    columns,
    addCategoryOpen,
    onClear,
    t,
  ]);

  const addNewGenre = async () => {
    if (newGenre === "" || !newGenre) return;
    const promise = addGenre({ name: newGenre });

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  const removeGenre = async (id) => {
    try {
      setLoading(true);
      toast.promise(deleteGenre(id), {
        loading: t("deleting"),
        success: t("deleted"),
        error: t("deleteError"),
      });

      setGenres((prevGenres) => prevGenres.filter((genre) => genre._id !== id));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const editGenre = async (id, newName) => {
    try {
      setLoading(true);
      toast.promise(patchGenre(id, { name: newName }), {
        loading: t("updating"),
        success: t("updated"),
        error: t("updateError"),
      });

      setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre._id === id ? { ...genre, name: newName } : genre
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-10">
      <Table
        aria-label="Genres Table"
        isHeaderSticky
        topContent={topContent}
        classNames={{
          wrapper: "max-h-[382px] ",
        }}
        topContentPlacement="outside"
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "end" : "start"}
              className={`${column.uid === "actions" ? "text-end" : ""}`}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={filteredItems}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={addCategory}
        onOpenChange={addCategoryChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("newGenre")}
              </ModalHeader>
              <ModalBody>
                <Input
                  name="newGenre"
                  placeholder={t("eg")}
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
      <Modal
        isOpen={deleteGenreModal}
        onOpenChange={deleteGenreChange}
        placement="center"
        classNames={{
          backdrop:
            "bg-gradient-to-t from-red-900 to-red-900/10 backdrop-opacity-10",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("attention")}
              </ModalHeader>
              <ModalBody className="flex items-center justify-center text-center">
                <PiWarningBold size={"3em"} />
                <p>
                  <span className="font-bold text-red-500">
                    {" "}
                    {deleteGenreKey.name}
                  </span>{" "}
                  {t("deleteWarning")}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  {t("cancel")}
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    onClose();
                    removeGenre(deleteGenreKey._id);
                  }}
                >
                  {t("delete")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Edit genre modal */}
      <Modal
        isOpen={editGenreModal}
        onOpenChange={editGenreChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("editCategory")}
              </ModalHeader>
              <ModalBody>
                <Input
                  name="newGenre"
                  placeholder={t("eg")}
                  value={editGenreName}
                  onChange={(event) => {
                    setEditGenreName(event.target.value);
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
                    editGenre(editGenreId, editGenreName);
                    onClose();
                  }}
                  isDisabled={editGenreId === "" || !editGenreId || loading}
                >
                  {t("save")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
