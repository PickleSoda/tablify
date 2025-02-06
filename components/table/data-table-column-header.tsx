import { Column } from "@tanstack/react-table"
import { ChevronsUpDown, EyeOff, SortAsc, SortDesc, ArrowUpIcon,ArrowDownIcon,ArrowLeftIcon,ArrowRightIcon, TrashIcon, Tags  } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "../ui/input"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  dataDispatch: (action: any) => void;
  dataType?: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  datatype,
  dataDispatch,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // @ts-ignore
  const { id } = column;
  
  const [header, setHeader] = useState<string>(title);
  if (!datatype) {
    return <div className={cn(className)}>{title}</div>
  }

  const buttons = [
    { onClick: () => handleSort(false), icon: <SortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Sort ascending" },
    { onClick: () => handleSort(true), icon: <SortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Sort descending" },
    { onClick: () => handleColumnAction("add_column_to_left"), icon: <ArrowLeftIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Insert left" },
    { onClick: () => handleColumnAction("add_column_to_right"), icon: <ArrowRightIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Insert right" },
    { onClick: () => column.toggleVisibility(false), icon: <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Hide " },
    { onClick: () => handleColumnAction("remove_column"), icon: <TrashIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />, label: "Delete" },
  ];

  function handleSort(desc: boolean) {
    column.toggleSorting(desc)
  }

  function handleColumnAction(type: string) {
    dataDispatch({ type: "update_column_header", columnId: id, label: header });
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
            <span>{header}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
            <Input
              type="text"
              value={header}
              onChange={(e) => setHeader(e.target.value)}
            />
          <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Data Type
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Text
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Number
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Tags className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Date
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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