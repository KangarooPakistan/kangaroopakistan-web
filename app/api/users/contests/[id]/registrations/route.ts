import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function POST(request: Request, 
    { params }: { params: { id: string } }){
    try {
        const reqBody = await request.json();
        const {contestId, schoolId, registeredBy, students
        } = reqBody;
        const contesttId = params.id

      // Validate the data (you can add more complex validations as needed)
      if (!contestId || !schoolId || !registeredBy || !Array.isArray(students)) {
        console.log("404")
        return NextResponse.json({error: "Invalid registration data"}, {status: 400})
      }

      // Create a new registration with student details
      const registration = await db.registration.create({
        data: {
          contestId,
          schoolId,
          registeredBy,
          students: {
            create: students, // Assuming 'students' is an array of student data
          },
        },
        include: {
          students: true, // To return students data in the response
        },
      });

      return NextResponse.json(registration, {status: 201})

    } catch (error) {
      // Handling any unexpected errors
      console.error('Request error', error);
      return NextResponse.json({error: "Error creating registration"}, {status: 500})
    }
  
}
