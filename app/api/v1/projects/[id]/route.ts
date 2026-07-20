import { NextRequest, NextResponse } from "next/server";
import { getProjectById } from "@/lib/mock-data";

/** GET /api/v1/projects/:id */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const project = getProjectById(params.id);

  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Project '${params.id}' not found.` } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: project });
}
