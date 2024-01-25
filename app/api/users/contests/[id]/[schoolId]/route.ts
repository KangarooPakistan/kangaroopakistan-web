import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(request: Request, {
  params
}: {
  params: {
    id: string;
    schoolId: string;
  };
}) {
  try {
    const registration = await db.registration.findUnique({
      where: {
        contestId_schoolId: {
          contestId: params.id,
          schoolId: params.schoolId,
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Contest not found" }, { status: 201 });
    }

    return NextResponse.json(registration);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
