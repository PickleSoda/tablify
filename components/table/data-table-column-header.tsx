import { Column } from "@tanstack/react-table"
import { ChevronsUpDown, EyeOff, SortAsc, SortDesc, ArrowUpIcon,ArrowDownIcon,ArrowLeftIcon,ArrowRightIcon, TrashIcon  } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  dataDispatch: (action: any) => void;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  dataDispatch
}: DataTableColumnHeaderProps<TData, TValue>) {
  // @ts-ignore
  const { id, created, label } = column;
  const [expanded, setExpanded] = useState<boolean>(created || false);
  const [header, setHeader] = useState<string>(label);
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const buttons = [
    { onClick: () => handleSort(false), icon: <SortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Sort ascending" },
    { onClick: () => handleSort(true), icon: <SortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Sort descending" },
    { onClick: () => column.toggleVisibility(false), icon: <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Hide " },
    { onClick: () => handleColumnAction("add_column_to_left"), icon: <ArrowLeftIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Insert left" },
    { onClick: () => handleColumnAction("add_column_to_right"), icon: <ArrowRightIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Insert right" },
    { onClick: () => handleColumnAction("remove_column"), icon: <TrashIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Delete" },
  ];

  function handleSort(desc: boolean) {
    column.toggleSorting(desc)
    setExpanded(false);
  }

  function handleColumnAction(type: string) {
    dataDispatch({ type: "update_column_header", columnId: id, label: header });
    dataDispatch({ type, columnId: id });
    setExpanded(false);
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <SortDesc className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <SortAsc className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {buttons.map(({ onClick, icon, label }) => (
            <DropdownMenuItem key={label} onClick={onClick} >
              {icon} {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}