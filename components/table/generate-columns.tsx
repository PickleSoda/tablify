import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Row, Column } from "@tanstack/react-table";
import { Row as row } from "./data/schema";
import { dataType } from "./data/data";
import { useColumnMutations, ColumnAction, ColumnMutationPayload } from "./hooks/use-column-mutations";

// Sample Data
export interface CellData {
  rowId: number;
  columnName: string;
  cellValue: string | number;
  dataType: dataType; // Extend as needed
}

// Function to generate columns dynamically
export function generateColumns(cells: CellData[], dataDispatch: ({
  actionType,
  newName,
  columnId,
  newType,
}: ColumnMutationPayload) => void): ColumnDef<row>[] {



  


  const uniqueColumns = Array.from(
    new Set(cells.map((cell) => cell.columnName))
  );
  console.log(uniqueColumns);

  // Define how each data type should be rendered
  const getColumnRenderer = (cell: CellData | undefined) => {
    switch (cell?.dataType) {
      case "text":
        return ({ row }: { row: Row<Record<string, any>> }) => (
          <span>{row.getValue(cell.columnName)}</span>
        );

      case "number":
        return ({ row }: { row: any }) => (
          <span className="text-right">{row.getValue(cell.columnName)}</span>
        );

      case "boolean":
        return ({ row }: { row: any }) => (
          <Badge
            variant={row.getValue(cell.columnName) ? "default" : "outline"}
          >
            {row.getValue(cell.columnName) ? "Yes" : "No"}
          </Badge>
        );

      default:
        return ({ row }: { row: any }) => (
          <span>{row.getValue(cell?.columnName)}</span>
        );
    }
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    ...uniqueColumns.map((columnName) => {
      const columnType =
        cells.find((cell) => cell.columnName === columnName)?.dataType ||
        "text";

      return {
        accessorKey: columnName,
        header: ({
          column,
        }: {
          column: Column<Record<string, any>, unknown>;
        }) => (
          <DataTableColumnHeader
            column={column}
            title={columnName}
            dataType={columnType}
            dataDispatch={(e) => dataDispatch(e)}
            
          />
        ),
        cell: getColumnRenderer({
          columnName,
          dataType: columnType,
        } as CellData),
      };
    }),
      {
        id: "actions",
        header: ({
          column,
        }: {
          column: Column<Record<string, any>, unknown>;
        }) => (
          <DataTableColumnHeader
            column={column}
            title='+'
            dataDispatch={(e) => dataDispatch(e)}
            addNewColumn={true}
          />
        ),
      },
  ];
}
