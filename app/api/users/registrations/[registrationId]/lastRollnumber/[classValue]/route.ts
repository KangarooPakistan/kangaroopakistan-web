// Import necessary dependencies and the Prisma client
import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { registrationId: string; classValue: string } }
) {
  try {
    console.log(params.classValue);
    console.log(params.registrationId);

    // Query the database to find the last student in the specified class within the registration
    const lastStudent = await db.student.findFirst({
      where: {
        registrationId: params.registrationId,
        class: params.classValue as string,
      },
      orderBy: {
        rollNumber: "desc", // Order by roll number in descending order to get the last student
      },
    });

    console.log("last");
    console.log(lastStudent);
    if (!lastStudent) {
      // Return null instead of sending a 404 error
      return NextResponse.json({ rollNumber: null }, { status: 200 });
    }
    // Return the last student's roll number
    return NextResponse.json({ data: lastStudent.rollNumber }, { status: 200 });
  } catch (error) {
    console.error("Error fetching last student of class:", error);
    return NextResponse.json(
      { message: "Error fetching last student of class" },
      { status: 500 }
    );
  }
}
