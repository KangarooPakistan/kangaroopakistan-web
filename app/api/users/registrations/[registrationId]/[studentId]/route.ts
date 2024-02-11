import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, 
    { params }: { params: { registrationId: string, studentId: string; } }){
        console.log(params.registrationId)
        try {
            const studentIdInt = parseInt(params.studentId, 10); // The 10 is for base-10 (decimal)

            const student = await db.student.findFirst({
                where: {
                    id: studentIdInt, // Assuming id is the unique identifier for students
                    registrationId: params.registrationId, // Ensure the student belongs to the specified registration
                },
            });
              return NextResponse.json(student, { status: 200 });
        } catch (error) {
            return NextResponse.json("Student does not exist.",  { status: 400 });
            
        }

    }

export async function PUT(request: Request, { params }: { params: { registrationId: string, studentId: string; } }) {
        try {
            // Parse the JSON body from the request
            const updateData = await request.json();

            console.log(updateData)
            const dataToUpdate = {
                studentName: updateData.studentName,
                class: updateData.class,
                level: updateData.level,
                fatherName: updateData.fatherName,
                // Add or remove fields as needed
            };
    
            const studentIdInt = parseInt(params.studentId, 10); // Convert studentId to integer
    
            const updatedStudent = await db.student.update({
                where: {
                    id: studentIdInt,
                    // If your schema requires, adjust the 'where' clause as needed
                },
                data: dataToUpdate,
            });
            return NextResponse.json(updatedStudent, { status: 200 });
        } catch (error) {
            console.error('Failed to update student:', error);
            return NextResponse.json({ error: "Failed to update student." }, { status: 400 });
        }
    }