import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export async function GET(request: Request, {
    params
  }: {
    params: {
      id: string; // Contest ID
      registrationId: string; // Registration ID
    };
  }) {
    console.log(params)
    try {
      const { registrationId } = params;
  
      // Retrieve students associated with the specified registrationId
      const students = await db.student.findMany({
        where: {
          registrationId,
        },
      });
  
      if (!students) {
        return NextResponse.json({ error: "No students found for this registration" }, { status: 404 });
      }
  
      return NextResponse.json(students, { status: 200 });
    } catch (error) {
      console.error("Request error", error);
      return NextResponse.json({ error: "Error fetching students" }, { status: 500 });
    }
  }