"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

interface TableComponentProps {
  tableId: number;
}

// Function to structure API response into row-column format
function structureTableData(cellsData: any[]) {
  const structuredData: Record<string, Record<string, any>> = {};
  cellsData.forEach(({ rowId, columnName, cellValue }) => {
    if (!structuredData[rowId]) {
      structuredData[rowId] = {};
    }
    structuredData[rowId][columnName] = cellValue;
  });
  return structuredData;
}

export default function TableComponent({ tableId }: TableComponentProps) {
  // Fetch table data using TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["tableData", tableId],
    queryFn: async () => {
      const response = await fetch(`/api/project/table?tableId=${tableId}`);
      const result = await response.json();
      console.log(result);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch table data");
      }
      return structureTableData(result.cells);
    },
    staleTime: 60000, // Cache data for 1 minute
  });

  // Transform structured data into table rows
  const tableData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([rowId, columns]) => ({
      id: rowId,
      ...columns,
    }));
  }, [data]);

  // Extract column definitions dynamically
  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    if (!tableData.length) return [];
    return Object.keys(tableData[0]).map((col) => ({
      accessorKey: col,
      header: col,
      cell: (info: any) => info.getValue(),
    }));
  }, [tableData]);

  // Define table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading table...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-4 border rounded shadow">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-100">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border border-gray-300 p-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
              <th className="border hover:bg-gray-200 border-gray-300 px-2 py-1 text-xl cursor-pointer">
                +
              </th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-gray-300 p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
                
              ))}
                        <td className="border border-gray-300 pl-2 py-1 text-xl cursor-pointer">
                     
                </td>
            </tr>
          ))}
          <tr className="">
            <td className="border hover:bg-gray-200 border-gray-300 pl-2 py-1 text-xl cursor-pointer">
              +
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
