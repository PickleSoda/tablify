"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/table/data-table";
import { columns } from "@/components/table/columns";
import { generateColumns, CellData } from "@/components/table/generate-columns";
interface TableComponentProps {
  tableId: number;
}

// Function to structure API response into row-column format
function structureTableData(cellsData: CellData[]) {
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
      return result.cells;
    },
    staleTime: 60000, // Cache data for 1 minute
  });

  // Transform structured data into table rows
  const tableData = useMemo(() => {
    if (!data) return [];
    return Object.entries(structureTableData(data)).map(([rowId, columns]) => ({
      id: rowId,
      ...columns,
    }));
  }, [data]);

  const columns = useMemo(() => (data ? generateColumns(data) : []), [data]);


  if (isLoading) return <p>Loading table...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return columns && <DataTable data={tableData} columns={columns} />;
}
