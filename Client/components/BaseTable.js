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
  Pagination,
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
import { capitalize } from "@/utils";
import { useRouter } from "next13-progressbar";
import toast from "react-hot-toast";
import { PiWarningBold } from "react-icons/pi";
import { useTranslations } from "next-intl";

const BaseTable = React.memo(
  ({
    data: initialData,
    columns,
    visibleColumns: initialVisibleColumns,
    tableName,
    searchFields = ["name", "title", "username"],
    statusOptions = [],
    statusColorMap = {},
    addItemHref,
    onDelete,
    renderCell,
    actions = [],
    children,
  }) => {
    const [filterValue, setFilterValue] = useState("");
    const [data, setData] = useState(initialData);
    const [deleteId, setDeleteId] = useState(null);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState(
      new Set(initialVisibleColumns)
    );
    const [statusFilter, setStatusFilter] = useState("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
      column: "name",
      direction: "ascending",
    });
    const [page, setPage] = useState(1);

    const router = useRouter();
    const { isOpen, onOpenChange } = useDisclosure();
    const t = useTranslations("CustomTable");

    const headerColumns = useMemo(() => {
      if (visibleColumns === "all") return columns;
      return columns.filter((column) =>
        Array.from(visibleColumns).includes(column.uid)
      );
    }, [visibleColumns, columns]);

    const filteredItems = useMemo(() => {
      let filteredData = [...data];

      if (filterValue) {
        filteredData = filteredData.filter((item) => {
          return searchFields.some((field) => {
            const value = item[field];
            return (
              value &&
              value.toString().toLowerCase().includes(filterValue.toLowerCase())
            );
          });
        });
      }

      if (statusFilter !== "all" && statusOptions.length > 0) {
        filteredData = filteredData.filter((item) =>
          Array.from(statusFilter).includes(item.status)
        );
      }

      return filteredData;
    }, [data, filterValue, statusFilter, statusOptions.length, searchFields]);

    const sortedItems = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      const paginatedItems = filteredItems.slice(start, end);

      return [...paginatedItems].sort((a, b) => {
        const first = a[sortDescriptor.column];
        const second = b[sortDescriptor.column];
        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
    }, [page, filteredItems, rowsPerPage, sortDescriptor]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const handleDelete = useCallback(
      async (id) => {
        if (!onDelete) return;

        try {
          await toast.promise(onDelete(id), {
            loading: t("deleting"),
            success: t("deleted"),
            error: t("deleteError"),
          });

          setData((prevData) =>
            prevData.filter((item) =>
              item._id ? item._id !== id : item.id !== id
            )
          );
        } catch (error) {
          console.error("Delete error:", error);
        }
      },
      [onDelete, t]
    );

    const onSearchChange = useCallback((value) => {
      setFilterValue(value || "");
      setPage(1);
    }, []);

    const onClear = useCallback(() => {
      setFilterValue("");
      setPage(1);
    }, []);

    const handleRowsPerPageChange = useCallback((value) => {
      setRowsPerPage(Number(value));
      setPage(1);
    }, []);

    const topContent = useMemo(
      () => (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <Input
              isClearable
              className="w-full sm:max-w-[44%]"
              placeholder={t("search")}
              startContent={<BiSearchAlt />}
              value={filterValue}
              onClear={onClear}
              onValueChange={onSearchChange}
            />
            <div className="flex gap-3">
              {statusOptions.length > 0 && (
                <Dropdown>
                  <DropdownTrigger className="hidden sm:flex">
                    <Button
                      endContent={<BiCaretDown className="text-small" />}
                      variant="flat"
                    >
                      {t("status")}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    disallowEmptySelection
                    aria-label="Status Filter"
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
              )}
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
                    endContent={<BiPlus size="1.2em" />}
                    onClick={() => router.push(addItemHref)}
                    className="hidden sm:flex"
                  >
                    {t("addItem", { name: tableName })}
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => router.push(addItemHref)}
                    className="flex sm:hidden"
                  >
                    <BiPlus size="1.2em" />
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
              value={rowsPerPage.toString()}
              className="min-w-min w-fit"
              placeholder="5"
              defaultSelectedKeys={["5"]}
              labelPlacement="outside-left"
              size="sm"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                handleRowsPerPageChange(value);
              }}
            >
              <SelectItem key="5">5</SelectItem>
              <SelectItem key="10">10</SelectItem>
              <SelectItem key="15">15</SelectItem>
            </Select>
          </div>
        </div>
      ),
      [
        filterValue,
        onSearchChange,
        onClear,
        statusFilter,
        statusOptions,
        visibleColumns,
        columns,
        addItemHref,
        tableName,
        data.length,
        rowsPerPage,
        router,
        t,
        handleRowsPerPageChange,
      ]
    );

    const bottomContent = useMemo(
      () => (
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
      ),
      [selectedKeys, tableName, page, pages, t]
    );

    const handleActionClick = useCallback(
      (action, item) => {
        if (action.uid === "delete") {
          setDeleteId(item._id || item.id);
          onOpenChange();
        } else if (action.onAction) {
          action.onAction(item);
        }
      },
      [onOpenChange]
    );

    const renderActionCell = useCallback(
      (item) => (
        <div className="relative flex items-center justify-end gap-2">
          {actions.map((action) => (
            <Tooltip
              key={action.uid}
              content={action.name}
              color={action.uid === "delete" ? "danger" : "default"}
            >
              <Button
                className={`text-lg cursor-pointer active:opacity-50 ${
                  action.uid === "delete" ? "text-danger" : "text-default-400"
                }`}
                variant="light"
                isIconOnly
                color={action.uid === "delete" ? "danger" : "default"}
                onClick={() => handleActionClick(action, item)}
              >
                {action.icon || action.name}
              </Button>
            </Tooltip>
          ))}
        </div>
      ),
      [actions, handleActionClick]
    );

    const defaultRenderCell = useCallback(
      (item, columnKey) => {
        if (columnKey === "actions") {
          return renderActionCell(item);
        }
        return renderCell ? renderCell(item, columnKey) : item[columnKey];
      },
      [renderCell, renderActionCell]
    );

    return (
      <>
        <Table
          aria-label={`${tableName} Table`}
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
              <TableRow key={item._id || item.id}>
                {(columnKey) => (
                  <TableCell>{defaultRenderCell(item, columnKey)}</TableCell>
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
                  <PiWarningBold size="3em" />
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
                      handleDelete(deleteId);
                    }}
                  >
                    {t("delete")}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {children}
      </>
    );
  }
);

BaseTable.displayName = "BaseTable";

export default BaseTable;
