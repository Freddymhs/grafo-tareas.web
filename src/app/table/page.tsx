"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { postKeys } from "@/lib/query-keys";
import { fetchPosts } from "@/lib/api/posts";
import type { Post } from "@/lib/schemas/post";
import { formatDate } from "@/lib/utils";

const columnHelper = createColumnHelper<Post>();

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => (
      <a href={`/posts/${info.row.original.id}`} className="text-blue-600 hover:underline">
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("author", { header: "Author" }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => formatDate(info.getValue()),
  }),
];

export default function TablePage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch ALL posts for the table (no pagination on the query — table handles it)
  const { data, isLoading } = useQuery({
    queryKey: postKeys.list({ limit: 100 }),
    queryFn: () => fetchPosts({ limit: 100 }),
  });

  // TanStack Table v8 returns functions that React Compiler cannot memoize safely.
  // This is a known limitation — the warning is expected and the table works correctly.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Table</h1>
      <p className="text-gray-500 text-sm mb-6">
        <code className="bg-gray-100 px-1 rounded">useReactTable</code> with sort, filter, and
        pagination — data from <code className="bg-gray-100 px-1 rounded">useQuery</code>
      </p>

      <div className="mb-4">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter posts…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-blue-400"
          data-testid="table-filter"
        />
      </div>

      {isLoading ? (
        <div className="animate-pulse text-gray-400 py-8 text-center">Loading…</div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-4 py-3 font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc"
                          ? " ↑"
                          : header.column.getIsSorted() === "desc"
                            ? " ↓"
                            : ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>
              {table.getFilteredRowModel().rows.length} rows · {table.getPageCount()} pages
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                ←
              </button>
              <span className="px-3 py-1">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
