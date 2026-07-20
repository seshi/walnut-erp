import { NextRequest, NextResponse } from "next/server";
import { getProjectListItems } from "@/lib/project-store";
import type { ProjectsListResponse } from "@/lib/types";

/**
 * GET /api/v1/projects
 *
 * Query params:
 *   status   – filter by ProjectStatus value
 *   search   – partial match on projectCode or customerName
 *   page     – 1-indexed page number (default: 1)
 *   pageSize – items per page (default: 20, max: 100)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const statusFilter = searchParams.get("status");
  const search       = searchParams.get("search")?.toLowerCase() ?? "";
  const page         = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize     = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

  let items = await getProjectListItems();

  if (statusFilter) {
    items = items.filter((p) => p.status === statusFilter);
  }

  if (search) {
    items = items.filter(
      (p) =>
        p.projectCode.toLowerCase().includes(search) ||
        p.customerName.toLowerCase().includes(search) ||
        p.siteAddress.toLowerCase().includes(search)
    );
  }

  const total  = items.length;
  const offset = (page - 1) * pageSize;
  const paged  = items.slice(offset, offset + pageSize);

  const body: ProjectsListResponse = {
    data: paged,
    meta: { total, page, pageSize },
  };

  return NextResponse.json(body);
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
