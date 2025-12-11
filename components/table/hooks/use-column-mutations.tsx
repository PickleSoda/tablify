import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ColumnAction =
  | "add_column_to_left"
  | "add_column_to_right"
  | "remove_column"
  | "sort_column"
  | "hide_column"
  | "add_column"
  | "edit_column_name"
  | "edit_column_type";

export interface ColumnMutationPayload {
  tableId: number;
  columnId?: string;
  newName?: string; 
  newType?: string;
  actionType: ColumnAction;
}

export function useColumnMutations(tableId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ columnId, newName, newType, actionType }: ColumnMutationPayload) => {
        console.log(JSON.stringify({ columnId, newName, newType, actionType }));
      const response = await fetch(`/api/project/table/${tableId}/column`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, newName, newType, actionType }),
      });

      if (!response.ok) {
        throw new Error("Failed to update column");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableData", tableId] });
    },
  });
}
