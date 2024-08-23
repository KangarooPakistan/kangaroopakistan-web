import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
      schoolId: string;
    };
  }
) {
  try {
    const schoolIdInt = parseInt(params.schoolId, 10);

    const registration = await db.registration.findUnique({
      where: {
        contestId_schoolId: {
          contestId: params.id,
          schoolId: schoolIdInt,
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 201 }
      );
    }

    return NextResponse.json(registration);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
