import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export async function DELETE(request: Request, {
    params
  }: {
    params: {
      id: string;
    };
  }) {
    try {
      const { id } = params;
      const studentIdInt = parseInt(params.id, 10);

      // Retrieve students associated with the specified registrationId
      const student = await db.student.delete({
        where: {
            id: studentIdInt,
        },
      });
  
      if (!student) {
        return NextResponse.json({ error: "No students found for this registration" }, { status: 404 });
      }
  
      return NextResponse.json(student, { status: 200 });
    } catch (error) {
      console.error("Request error", error);
      return NextResponse.json({ error: "Error Deleting the student" }, { status: 500 });
    }
  }

