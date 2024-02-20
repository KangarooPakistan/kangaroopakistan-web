import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

const padNumber = (num: number) => String(num).padStart(3, "0");
const padNumber5 = (num: number) => String(num).padStart(5, "0");

interface StudentData {
    year: string;
    district: string;
    schoolId: number;
    class: string;
    contestCh: string;
    // Add any other properties that are used from the 'student' object
  }

// ... (rest of your code)

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const reqBody = await request.json();
        const { schoolId, registeredBy, students, registrationId, year, district, contestCh, schoolName } = reqBody;
        const contestId = params.id;

        if (!registeredBy || !Array.isArray(students)) {
            return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
        }

        let regId = registrationId;
        
        // Create a new registration if no registrationId is provided
        if (!regId) {
            if (!contestId) {
                return NextResponse.json({ error: "Contest ID is required for new registration" }, { status: 400 });
            }

            const newRegistration = await db.registration.create({
                data: {
                    contestId,
                    schoolId,
                    schoolName,
                    registeredBy: registeredBy // assuming registeredBy is a numeric ID
                }
            });
            regId = newRegistration.id;
        }

        const createdStudents = [];

        for (const student of students) {
            // Fetch the last index of the class from the database
            const existingStudent = await db.student.findFirst({
                where: {
                    registrationId: regId,
                    studentName: student.studentName,
                    fatherName: student.fatherName,
                    class: student.class
                },
            });

            if (existingStudent) {
                continue; // Skip creating a new student
            }
            const lastStudentOfClass = await db.student.findFirst({
                where: {
                    registrationId: regId,
                    class: student.class,
                },
                orderBy: [
                    {
                        rollNumber: 'desc', // Order by rollNumber in descending order to get the last student
                    }]
            });

            let lastIndex = 0;
            if (lastStudentOfClass) {
                // Extract the index from the rollNumber
                const rollNumberParts = lastStudentOfClass.rollNumber.split("-");
                lastIndex = parseInt(rollNumberParts[4]);
                console.log("last index") // Assuming the index is at position 4
                console.log(lastIndex) // Assuming the index is at position 4
            }

            // Generate roll number for the new student
            const newIndex = lastIndex + 1;
            const rollNumber = generateRollNumber(student, newIndex, year, district, schoolId, contestCh);

            // Create new student
            const createdStudent = await db.student.create({
                data: {
                    registrationId: regId,
                    rollNumber,
                    studentName: student.studentName,
                    fatherName: student.fatherName,
                    class: student.class,
                    level: student.level
                }
            });

            createdStudents.push(createdStudent);
        }

        return NextResponse.json(createdStudents, { status: 201 });
    } catch (error) {
        console.error("Request error", error);
        return NextResponse.json({ error: "Error creating registration" }, { status: 500 });
    }
}




// ... (rest of your code)
function generateRollNumber(student:StudentData,currentMaxIndex: number, year:string, district:string, schoolId: number, contestCh: string ) {
    const index = currentMaxIndex + 1;


    return `${year}-${district}-${padNumber5(schoolId)}-${student.class}-${padNumber(currentMaxIndex)}-${contestCh}`;
}



export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
      const { id } = params; // Contest ID

      // Retrieve registrations associated with the specified contest ID
      const registrations = await db.registration.findMany({
          where: {
              contestId: id,
          },
          include: {
            students: true, // Include related students
          },
      });

      if (!registrations) {
          return NextResponse.json({ error: "No registrations found for this contest" }, { status: 404 });
      }

      return NextResponse.json(registrations, { status: 200 });
  } catch (error) {
      console.error("Request error", error);
      return NextResponse.json({ error: "Error fetching registrations" }, { status: 500 });
  }
}
