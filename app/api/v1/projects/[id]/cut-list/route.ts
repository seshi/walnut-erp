import { NextRequest, NextResponse } from "next/server";
import { getProjectCutList, summariseCutList } from "@/lib/cut-list-store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const version = await getProjectCutList(params.id);
  if (!version) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `No active cut list found for project '${params.id}'.` } },
      { status: 404 }
    );
  }
  const summary = summariseCutList(version);
  return NextResponse.json({ data: version, summary });
}
