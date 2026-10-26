import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";

export interface TableFilter {
  columnId: string;
  label: string;
  options: { value: string; label: string }[];
}

export function DataTable<T extends object>({ data, columns, filters = [], searchPlaceholder = "Søg i tabellen…", emptyText = "Ingen poster fundet." }: {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: TableFilter[];
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: { pagination: { pageSize: 10 } },
  });

  const count = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  return <div className="data-table">
    <div className="table-toolbar">
      <input type="search" className="table-search" aria-label="Søg" placeholder={searchPlaceholder}
        value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
      {filters.map((filter) => {
        const column = table.getColumn(filter.columnId);
        return <label key={filter.columnId} className="table-filter">
          <span>{filter.label}</span>
          <select aria-label={filter.label} value={(column?.getFilterValue() as string) ?? ""}
            onChange={(e) => column?.setFilterValue(e.target.value || undefined)}>
            <option value="">Alle</option>
            {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>;
      })}
    </div>
    <div className="table-scroll">
      <table>
        <thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>
          {group.headers.map((header) => <th key={header.id} scope="col">
            {header.isPlaceholder ? null : header.column.getCanSort()
              ? <button className="sort-button" onClick={header.column.getToggleSortingHandler()} type="button">
                {flexRender(header.column.columnDef.header, header.getContext())}
                <span aria-hidden="true">{header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : " ↕"}</span>
              </button>
              : flexRender(header.column.columnDef.header, header.getContext())}
          </th>)}
        </tr>)}</thead>
        <tbody>
          {table.getRowModel().rows.map((row) => <tr key={row.id}>
            {row.getVisibleCells().map((cell) => <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>)}
          </tr>)}
          {!count && <tr><td colSpan={columns.length} className="empty-cell">{emptyText}</td></tr>}
        </tbody>
      </table>
    </div>
    <div className="table-footer">
      <span>{count ? `Viser ${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, count)} af ${count}` : "0 resultater"}</span>
      <div className="pager">
        <button disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} type="button">Forrige</button>
        <span>Side {pageIndex + 1} af {Math.max(table.getPageCount(), 1)}</span>
        <button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} type="button">Næste</button>
      </div>
    </div>
  </div>;
}
