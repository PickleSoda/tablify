import { Column } from "@tanstack/react-table";
import {
  ChevronsUpDown,
  EyeOff,
  SortAsc,
  SortDesc,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import { ColumnAction, ColumnMutationPayload } from "./hooks/use-column-mutations";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  dataDispatch: ({
    actionType,
    tableId,
    columnId,
    newName,
    newType
  }: ColumnMutationPayload) => void;
  dataType?: string;
  addNewColumn?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  dataType,
  dataDispatch,
  addNewColumn = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // @ts-ignore
  const { id } = column;

  const [header, setHeader] = useState<string>(
    dataType == undefined ? "" : title
  );
  const [selectedDataType, setSelectedDataType] = useState<string>(
    dataType || "text"
  );

  const buttons = [
    {
      onClick: () => handleSort(false),
      icon: <SortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />,
      label: "Sort ascending",
    },
    {
      onClick: () => handleSort(true),
      icon: <SortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />,
      label: "Sort descending",
    },
    {
      onClick: () => handleColumnAction("add_column_to_left"),
      icon: (
        <ArrowLeftIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
      ),
      label: "Insert left",
    },
    {
      onClick: () => handleColumnAction("add_column_to_right"),
      icon: (
        <ArrowRightIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
      ),
      label: "Insert right",
    },
    {
      onClick: () => column.toggleVisibility(false),
      icon: <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />,
      label: "Hide ",
    },
    {
      onClick: () => handleColumnAction("remove_column"),
      icon: <TrashIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />,
      label: "Delete",
    },
  ];

  function handleSort(desc: boolean) {
    column.toggleSorting(desc);
  }

  function handleColumnAction(type: ColumnAction) {
    dataDispatch({
      tableId: 0,
      actionType: type,
      columnId: id,
      newName: header,
      newType: selectedDataType,
    });
  }

  const handleDataTypeChange = (newType: string) => {
    setSelectedDataType(newType);
    dataDispatch({
      tableId: 0,
      actionType: "edit_column_type",
      columnId: column.id,
      newType: selectedDataType,
      newName: header,
    });
  };

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{header || "+"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <Input
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
          />
          {/* Data Type Selection */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Data Type: {selectedDataType}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {["text", "number", "date"].map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleDataTypeChange(type)}
                >
                  <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {!addNewColumn ? (
            buttons.map(({ onClick, icon, label }) => (
              <DropdownMenuItem key={label} onClick={onClick}>
                {icon} {label}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem onClick={() => handleColumnAction("add_column")}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Add
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
