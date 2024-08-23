import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string; // Contest ID
      registerationId: string; // Registration ID
    };
  }
) {
  try {
    const { registerationId } = params;
    // Retrieve students associated with the specified registrationId
    const students = await db.student.findMany({
      where: {
        registrationId: registerationId,
      },
    });

    if (!students) {
      return NextResponse.json(
        { message: "No students found for this registration" },
        { status: 404 }
      );
    }

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Request error", error);
    return NextResponse.json(
      { message: "Error fetching students" },
      { status: 500 }
    );
  }
}
