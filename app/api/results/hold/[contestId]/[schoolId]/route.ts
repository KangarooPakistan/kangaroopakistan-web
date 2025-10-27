import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { contestId: string; schoolId: string } }
) {
  try {
    const schoolId = parseInt(params.schoolId, 10);
    const record = await db.resultHold.findUnique({
      where: {
        contestId_schoolId: {
          contestId: params.contestId,
          schoolId,
        },
      },
      select: { hold: true },
    });
    return NextResponse.json({ hold: record?.hold ?? false }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { contestId: string; schoolId: string } }
) {
  try {
    const { hold } = await req.json();
    const schoolId = parseInt(params.schoolId, 10);
    if (typeof hold !== "boolean" || Number.isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = await db.resultHold.upsert({
      where: {
        contestId_schoolId: {
          contestId: params.contestId,
          schoolId,
        },
      },
      update: { hold },
      create: {
        contestId: params.contestId,
        schoolId,
        hold,
      },
      select: { contestId: true, schoolId: true, hold: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
