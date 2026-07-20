import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCabinetsForGeneration } from "@/lib/configurator-store";
import { generateCutListFromCabinets } from "@/lib/cut-list-generator";

export const dynamic = "force-dynamic";

// POST /api/v1/projects/:id/cut-list/generate
// Body: { generatedBy: string (userId) }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { generatedBy: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON." } }, { status: 400 }); }

  const project = await db.project.findUnique({ where: { id: params.id }, select: { id: true, projectCode: true } });
  if (!project) return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });

  const cabinets = await getCabinetsForGeneration(params.id);
  if (cabinets.length === 0)
    return NextResponse.json({ error: { code: "NO_CABINETS", message: "Add cabinets in the Configurator first." } }, { status: 422 });

  const parts = generateCutListFromCabinets(project.projectCode, cabinets);

  // Supersede existing active versions
  await db.cutListVersion.updateMany({
    where: { projectId: params.id, status: { not: "superseded" } },
    data: { status: "superseded" },
  });

  // Find next version number
  const last = await db.cutListVersion.findFirst({
    where: { projectId: params.id },
    orderBy: { versionNo: "desc" },
    select: { versionNo: true },
  });
  const versionNo = (last?.versionNo ?? 0) + 1;

  const version = await db.cutListVersion.create({
    data: {
      projectId: params.id,
      versionNo,
      status: "draft",
      generatedBy: body.generatedBy,
      items: {
        create: parts.map((p) => ({
          partCode: p.partCode,
          description: p.description,
          lengthMm: p.lengthMm,
          widthMm: p.widthMm,
          thicknessMm: p.thicknessMm,
          qty: p.qty,
          materialId: p.materialId,
          grainDir: p.grainDir,
          edgeBanding: p.edgeBanding,
          finish: p.finish ?? null,
          cabinetRef: p.cabinetRef ?? null,
          notes: p.notes ?? null,
        })),
      },
    },
    include: {
      items: { include: { material: { select: { code: true, name: true } } } },
      generator: { select: { name: true } },
      project: { select: { projectCode: true } },
    },
  });

  return NextResponse.json({ data: { versionNo: version.versionNo, totalParts: version.items.length } }, { status: 201 });
}
