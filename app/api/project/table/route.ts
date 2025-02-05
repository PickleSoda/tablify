import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCellsByTableId } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = parseInt(searchParams.get("tableId") || "", 10);

    if (isNaN(tableId)) {
      return NextResponse.json(
        { success: false, error: "Invalid table ID" },
        { status: 400 }
      );
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const cells = await getCellsByTableId(tableId);
    return NextResponse.json({ success: true, cells });
  } catch (error) {
    console.error("Error fetching table cells:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch table cells" },
      { status: 500 }
    );
  }
}
