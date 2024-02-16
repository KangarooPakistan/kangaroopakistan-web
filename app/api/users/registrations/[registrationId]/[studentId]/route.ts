import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, 
    { params }: { params: { registrationId: string, studentId: string; } }){
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
export async function DELETE(request: Request, { params }: { params: { registrationId: string, studentId: string; } }) {
        try {
            const studentIdInt = parseInt(params.studentId, 10); // Convert studentId to integer for database operation
    
            // Perform the deletion
            const deletedStudent = await db.student.delete({
                where: {
                    id: studentIdInt,
                    // Note: Prisma does not directly support multiple conditions in `delete` operation's `where`.
                    // If `registrationId` needs to be considered, ensure your schema supports this logic,
                    // or perform a check before deletion.
                },
            });
    
            // If deletion was successful, return a success response
            return NextResponse.json({ message: "Student successfully deleted." }, { status: 200 });
        } catch (error : any) {
            console.error('Error deleting student:', error);
    
            // Handle the case where the student does not exist
            if (error.code === 'P2025') {
                return NextResponse.json({ error: "Student not found." }, { status: 404 });
            }
    
            // For other errors, return a generic error response
            return NextResponse.json({ error: "Error deleting student." }, { status: 500 });
        }
    }
    