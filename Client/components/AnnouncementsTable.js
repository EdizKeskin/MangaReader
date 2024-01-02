"use client";
import {
  addAnnouncement,
  deleteAnnouncement,
  patchAnnouncement,
} from "@/functions";
import { capitalize, unixTimeStampToDateTime } from "@/utils";
import {
  Accordion,
  AccordionItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRouter } from "next13-progressbar";
import React, { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BiCaretDown, BiPlus, BiSearchAlt } from "react-icons/bi";
import { PiWarningBold } from "react-icons/pi";
import { TbEdit, TbEye, TbTrash } from "react-icons/tb";
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function AnnouncementsTable({
  announcements: initialAnnouncements,
  columns,
  INITIAL_VISIBLE_COLUMNS,
  username,
  email,
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState();
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [newContents, setNewContents] = useState();
  const [filterValue, setFilterValue] = useState("");
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContents, setEditContents] = useState("");
  const [newLink, setNewLink] = useState("");
  const [editLink, setEditLink] = useState("");
  const hasSearchFilter = Boolean(filterValue);
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const router = useRouter();
  const {
    isOpen: addAnnouncementModal,
    onOpen: addAnnouncementOpen,
    onOpenChange: addAnnouncementChange,
  } = useDisclosure();
  const {
    isOpen: deleteAnnouncementModal,
    onOpen: deleteAnnouncementOpen,
    onOpenChange: deleteAnnouncementChange,
  } = useDisclosure();
  const {
    isOpen: editAnnouncementModal,
    onOpen: editAnnouncementOpen,
    onOpenChange: editAnnouncementChange,
  } = useDisclosure();
  const t = useTranslations("AnnouncementsTable");

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [columns, visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredData = [...announcements];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((data) =>
        data.title
          ? data.title.toLowerCase().includes(filterValue.toLowerCase())
          : data.contents.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredData;
  }, [announcements, hasSearchFilter, filterValue]);
  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);
  const renderCell = useCallback(
    (announcement, columnKey) => {
      const cellValue = announcement[columnKey];
      switch (columnKey) {
        case "contents":
          return <p className="line-clamp-1">{cellValue}</p>;
        case "uploadDate":
          const x = new Date(cellValue);
          const formattedDate = unixTimeStampToDateTime(x);
          return <p>{formattedDate}</p>;
        case "actions":
          return (
            <div className="flex justify-end gap-2">
              {!announcement.link && (
                <Tooltip content={t("details")}>
                  <Button
                    className="text-lg cursor-pointer text-default-400 active:opacity-50"
                    variant="light"
                    isIconOnly
                    onClick={() => {
                      router.push(`/announcements?id=${announcement._id}`);
                    }}
                  >
                    <TbEye size={"1.3em"} />
                  </Button>
                </Tooltip>
              )}
              <Tooltip content={t("editAnnouncement")}>
                <Button
                  className="text-lg cursor-pointer text-default-400 active:opacity-50"
                  variant="light"
                  isIconOnly
                  onClick={() => {
                    setEditId(announcement._id);
                    setEditTitle(announcement.title);
                    setEditContents(announcement.contents);
                    setEditLink(
                      announcement.link === null ? "" : announcement.link
                    );
                    editAnnouncementOpen();
                  }}
                >
                  <TbEdit size={"1.3em"} />
                </Button>
              </Tooltip>
              <Tooltip content={t("deleteAnnouncement")} color="danger">
                <Button
                  className="text-lg cursor-pointer text-danger active:opacity-50"
                  variant="light"
                  isIconOnly
                  color="danger"
                  onClick={() => {
                    deleteAnnouncementOpen();
                    setDeleteAnnouncementId(announcement);
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
    [router, t, editAnnouncementOpen, deleteAnnouncementOpen]
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
          placeholder={t("searchByTitle")}
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
            className="hidden sm:flex"
            onClick={addAnnouncementOpen}
          >
            {t("addAnnouncement")}
          </Button>
          <Button color="secondary" isIconOnly className="flex sm:hidden">
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
    onClear,
    t,
    addAnnouncementOpen,
  ]);

  const addNewAnnouncement = async () => {
    if (newTitle === "" || !newTitle) return;
    const promise = addAnnouncement({
      title: newTitle,
      contents: newContents,
      uploader: username || email,
      link: newLink !== "" ? newLink : null,
    });

    try {
      setLoading(true);
      toast.promise(promise, {
        loading: t("adding"),
        success: t("added"),
        error: t("addError"),
      });

      const result = await promise;
      setNewTitle("");
      setNewContents();
      setAnnouncements([
        {
          title: result.title,
          _id: result._id,
          date: result.uploadDate,
          uploader: result.uploader,
          contents: result.contents,
        },
        ...announcements,
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const editAnnouncement = async () => {
    if (editTitle === "" || !editTitle) return;
    console.log(editId);
    const promise = patchAnnouncement(editId, {
      title: editTitle,
      contents: editContents,
      uploader: username || email,
      link: newLink !== "" ? newLink : null,
    });

    try {
      setLoading(true);
      toast.promise(promise, {
        loading: t("updating"),
        success: t("updated"),
        error: t("updateError"),
      });

      const result = await promise;
      setEditTitle("");
      setEditContents("");
      setAnnouncements((preb) => {
        const index = preb.findIndex((x) => x._id === editId);
        const newAnnouncements = [...preb];
        newAnnouncements[index] = {
          title: result.title,
          _id: result._id,
          date: result.uploadDate,
          uploader: result.uploader,
          contents: result.contents,
        };
        return newAnnouncements;
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const removeAnnouncement = async (id) => {
    try {
      setLoading(true);
      toast.promise(deleteAnnouncement(id), {
        loading: t("deleting"),
        success: t("deleted"),
        error: t("deleteError"),
      });

      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement._id !== id)
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
        aria-label="Announcement Table"
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
        isOpen={addAnnouncementModal}
        onOpenChange={addAnnouncementChange}
        placement="center"
        isDismissable={false}
        backdrop="blur"
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("newAnnouncement")}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-5">
                  <Input
                    label={t("title")}
                    labelPlacement="outside"
                    value={newTitle}
                    onValueChange={setNewTitle}
                  />
                  <p>{t("contents")}</p>
                  <div className="container">
                    <Editor setValue={setNewContents} />
                  </div>
                </div>
                <Accordion>
                  <AccordionItem
                    key="1"
                    aria-label="Accordion 1"
                    title={t("advanced")}
                  >
                    <Input
                      label={t("link")}
                      labelPlacement="inside"
                      value={newLink}
                      onValueChange={setNewLink}
                      description={t("linkDescription")}
                    />
                  </AccordionItem>
                </Accordion>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("close")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    addNewAnnouncement();
                    onClose();
                  }}
                  isDisabled={newTitle === "" || !newTitle || loading}
                >
                  {t("add")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={editAnnouncementModal}
        onOpenChange={editAnnouncementChange}
        placement="center"
        isDismissable={false}
        backdrop="blur"
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("editAnnouncement")}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-5">
                  <Input
                    label={t("title")}
                    value={editTitle}
                    onValueChange={setEditTitle}
                  />
                  <div className="container">
                    <p className="mb-2">{t("contents")}</p>
                    <Editor setValue={setEditContents} value={editContents} />
                  </div>
                </div>
                <Accordion>
                  <AccordionItem
                    key="1"
                    aria-label="Accordion 1"
                    title={t("advanced")}
                  >
                    <Input
                      label={t("link")}
                      labelPlacement="inside"
                      value={editLink}
                      onValueChange={setEditLink}
                      description={t("linkDescription")}
                    />
                  </AccordionItem>
                </Accordion>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("close")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    editAnnouncement();
                    onClose();
                  }}
                  isDisabled={editTitle === "" || !editTitle || loading}
                >
                  {t("save")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={deleteAnnouncementModal}
        onOpenChange={deleteAnnouncementChange}
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
                    {deleteAnnouncementId.title}
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
                    removeAnnouncement(deleteAnnouncementId._id);
                  }}
                >
                  {t("delete")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
