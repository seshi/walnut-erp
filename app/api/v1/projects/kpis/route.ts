import { NextResponse } from "next/server";
import { getProjectKpis } from "@/lib/project-store";

/** GET /api/v1/projects/kpis */
export async function GET() {
  return NextResponse.json({ data: getProjectKpis() });
}
