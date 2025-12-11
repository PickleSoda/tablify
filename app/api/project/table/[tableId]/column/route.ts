import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addColumn, removeColumn, editColumnName, editColumnType } from "@/lib/db/queries";

export async function PUT(request: NextRequest, { params }: { params: { tableId: string } }) {
  try {
    const { tableId } = await params; 

    const id = parseInt(tableId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid table ID" }, { status: 400 });
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ensure request body parsing
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ success: false, error: "Missing request body" }, { status: 400 });
    }

    const { columnId, newName, newType, actionType } = body;

    switch (actionType) {
      case "add_column":
        if (!newName || !newType) throw new Error("Column name and type required");
        await addColumn(id, newName, newType);
        break;

      case "remove_column":
        if (!columnId) throw new Error("Column ID required");
        await removeColumn(id, columnId);
        break;

      case "edit_column_name":
        if (!columnId || !newName) throw new Error("Column ID and new name required");
        await editColumnName(id, columnId, newName);
        break;

      case "edit_column_type":
        if (!columnId || !newType) throw new Error("Column ID and new type required");
        await editColumnType(id, columnId, newType);
        break;

      default:
        return NextResponse.json({ success: false, error: "Invalid action type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Column updated successfully" });
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json({ success: false, error: error|| "Internal Server Error" }, { status: 500 });
  }
}
