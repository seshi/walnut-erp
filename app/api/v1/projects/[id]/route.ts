import { NextRequest, NextResponse } from "next/server";
import { findProject, updateProject, type UpdateProjectInput } from "@/lib/project-store";

/** GET /api/v1/projects/:id */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const project = findProject(params.id);
  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: `Project '${params.id}' not found.` } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: project });
}

/** PATCH /api/v1/projects/:id */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: UpdateProjectInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON body." } },
      { status: 400 }
    );
  }

  const result = updateProject(params.id, body);

  if (!result.ok) {
    if (result.error.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Project '${params.id}' not found.` } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: { code: "VALIDATION", fields: result.error.fields } },
      { status: 422 }
    );
  }

  return NextResponse.json({ data: result.project });
}
