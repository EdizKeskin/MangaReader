"use client";
import React, { useCallback, useMemo, useState } from "react";

import {
  Table,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  User,
  SelectItem,
  Select,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from "@nextui-org/react";
import { BiSearchAlt, BiCaretDown, BiPlus } from "react-icons/bi";
import {
  capitalize,
  formatDateToCustomFormat,
  getDayDifference,
  unixTimeStampToDateTime,
} from "@/utils";
import { useRouter } from "next13-progressbar";
import toast from "react-hot-toast";
import { PiWarningBold } from "react-icons/pi";
import { useTranslations } from "next-intl";

export default function CustomTable({
  data: initialdata,
  statusOptions,
  columns,
  INITIAL_VISIBLE_COLUMNS,
  statusColorMap,
  tableName,
  deleteFunction,
  addItemHref,
  actions,
  updateFunction,
  mangaNames,
  editHref,
  addChildHref,
  subscribers,
}) {
  const [filterValue, setFilterValue] = useState("");
  const [data, setData] = useState(initialdata);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { isOpen, onOpenChange } = useDisclosure();
  const hasSearchFilter = Boolean(filterValue);
  const t = useTranslations("CustomTable");
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns, columns]);
  const filteredItems = useMemo(() => {
    let filteredData = [...data];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((data) =>
        data.name
          ? data.name.toLowerCase().includes(filterValue.toLowerCase())
          : data.title
          ? data.title.toLowerCase().includes(filterValue.toLowerCase())
          : data.username.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredData = filteredData.filter((data) =>
        Array.from(statusFilter).includes(data.status)
      );
    }

    return filteredData;
  }, [data, filterValue, hasSearchFilter, statusFilter, statusOptions.length]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const deleteItem = useCallback(
    (id) => {
      try {
        toast.promise(deleteFunction(id), {
          loading: t("deleting"),
          success: t("deleted"),
          error: t("deleteError"),
        });

        const updatedData = data.filter((item) =>
          item._id ? item._id !== id : item.id !== id
        );
        setData(updatedData);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [data, deleteFunction, t]
  );

  const updateItem = useCallback(
    (id, bool) => {
      try {
        toast.promise(updateFunction(id, bool), {
          loading: t("updating"),
          success: t("updated"),
          error: t("updateError"),
        });
        const updatedData = data.filter((item) =>
          item._id ? item._id !== id : item.id !== id
        );

        setData(updatedData);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [data, updateFunction, t]
  );

  const renderCell = useCallback(
    (data, columnKey) => {
      const cellValue = data[columnKey];

      switch (columnKey) {
        case "username":
          return (
            <User
              avatarProps={{ radius: "lg", src: data.image_url }}
              description={data.email_addresses[0].email_address}
              name={cellValue}
            >
              {data.email_addresses[0].email_address}
            </User>
          );
        case "email_addresses":
          return <p>{data.email_addresses[0].email_address}</p>;
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[data.status]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "private_metadata":
          const isSubscribed = subscribers.find(
            (subscriber) => subscriber.userId === data.id
          );

          return (
            <Chip
              className="capitalize"
              color={
                statusColorMap[
                  data.private_metadata.isAdmin &&
                  data.private_metadata.isAdmin === true
                    ? "active"
                    : isSubscribed &&
                      new Date(isSubscribed.expireAt) > new Date()
                    ? "secondary"
                    : "paused"
                ]
              }
              size="sm"
              variant="flat"
            >
              {data.private_metadata.isAdmin &&
              data.private_metadata.isAdmin === true ? (
                "Admin"
              ) : isSubscribed &&
                new Date(isSubscribed.expireAt) > new Date() ? (
                <>
                  {t("remainingDays", {
                    count: getDayDifference(isSubscribed.expireAt) + 1,
                  })}
                </>
              ) : (
                t("user")
              )}
            </Chip>
          );
        case "created_at":
          const date = unixTimeStampToDateTime(cellValue);
          return <p>{date}</p>;

        case "uploadDate":
          const uploadDate = new Date(cellValue);
          const formattedDate = formatDateToCustomFormat(uploadDate);
          return <p>{formattedDate}</p>;
        case "publishDate":
          const x = new Date(cellValue);
          const publishDate = formatDateToCustomFormat(x);
          return <p>{publishDate}</p>;

        case "manga":
          const mangaName = mangaNames.find((manga) => manga._id === cellValue);
          return <p>{mangaName.name}</p>;

        case "actions":
          return (
            <div className="relative flex items-center justify-end gap-2">
              {actions.map((action) => {
                const handleItemClick = () => {
                  if (action.uid === "delete") {
                    setDeleteId(data._id ? data._id : data.id);
                    onOpenChange();
                  } else if (action.uid === "updateUser") {
                    updateItem(data.id, !data.private_metadata.isAdmin);
                  } else if (action.uid === "edit") {
                    router.push(editHref + "/" + data._id);
                  } else if (action.uid === "addChild") {
                    router.push(addChildHref + "?mangaId=" + data._id);
                  } else if (action.uid === "addSubscriber") {
                    router.push(
                      "/admin/users/add/" +
                        "?userId=" +
                        data.id +
                        "&email=" +
                        data.email_addresses[0].email_address
                    );
                  }
                };

                return (
                  <Tooltip
                    key={action.uid}
                    content={action.name}
                    color={action.uid === "delete" ? "danger" : "default"}
                  >
                    <Button
                      className={`text-lg cursor-pointer  active:opacity-50 ${
                        action.uid === "delete"
                          ? "text-danger"
                          : "text-default-400 "
                      }`}
                      variant="light"
                      isIconOnly
                      color={action.uid === "delete" ? "danger" : "default"}
                      onClick={handleItemClick}
                    >
                      {action.icon ? action.icon : action.name}
                    </Button>
                  </Tooltip>
                );
              })}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [
      actions,
      addChildHref,
      editHref,
      mangaNames,
      onOpenChange,
      router,
      statusColorMap,
      updateItem,
      t,
      subscribers,
    ]
  );

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("search")}
            startContent={<BiSearchAlt />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<BiCaretDown className="text-small" />}
                  variant="flat"
                  isDisabled
                >
                  {t("status")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
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
            {addItemHref && (
              <>
                <Button
                  color="secondary"
                  endContent={<BiPlus size={"1.2em"} />}
                  onClick={() => {
                    router.push(addItemHref);
                  }}
                  className="hidden sm:flex"
                >
                  {t("addItem", { name: tableName })}
                </Button>
                <Button
                  color="secondary"
                  onClick={() => {
                    router.push(addItemHref);
                  }}
                  className="flex sm:hidden"
                >
                  <BiPlus size={"1.2em"} />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-default-400 text-small">
            {t("totalLength", { name: tableName, count: data.length })}
          </span>

          <Select
            isRequired
            label={t("rowsPerPage")}
            value={rowsPerPage}
            className="min-w-min w-fit"
            placeholder="5"
            defaultSelectedKeys={"5"}
            labelPlacement="outside-left"
            size="sm"
          >
            <SelectItem
              onClick={() => {
                setRowsPerPage(5);
                setPage(1);
              }}
              key={"5"}
            >
              5
            </SelectItem>
            <SelectItem
              onClick={() => {
                setRowsPerPage(10);
                setPage(1);
              }}
            >
              10
            </SelectItem>
            <SelectItem
              onClick={() => {
                setRowsPerPage(15);
                setPage(1);
              }}
            >
              15
            </SelectItem>
          </Select>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    statusFilter,
    statusOptions,
    visibleColumns,
    columns,
    addItemHref,
    tableName,
    data.length,
    rowsPerPage,
    onClear,
    router,
    t,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? t("allSelected")
            : `${selectedKeys.size} ${tableName} seçildi`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="secondary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [selectedKeys, tableName, page, pages, t]);
  return (
    <>
      <Table
        aria-label="Custom Table"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={t("tableNotFound", { name: tableName })}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item._id ? item._id : item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
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
                <p>{t("deleteWarning")}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    deleteItem(deleteId);
                  }}
                >
                  {t("delete")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
