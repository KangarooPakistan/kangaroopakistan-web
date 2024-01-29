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
        const { schoolId, registeredBy, students,  registrationId, year, district, contestCh } = reqBody;
        const contestId = params.id

        if ( !registeredBy || !Array.isArray(students)) {
            console.log("Invalid registration data");
            return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
        }
        console.log('----------------------------------------------------')

        let regId = registrationId;
        
        // Create a new registration if no registrationId is provided
        if (!regId) {
            if (!contestId) {
                console.log("Contest ID is required for new registration");
                return NextResponse.json({ error: "Contest ID is required for new registration" }, { status: 400 });
            }

            const newRegistration = await db.registration.create({
                data: {
                    contestId,
                    schoolId,
                    registeredBy: registeredBy // assuming registeredBy is a numeric ID
                }
            });
            regId = newRegistration.id;
        }

        const createdStudents = [];
        const classIndexMap: { [key: string]: number } = {};

        for (const student of students) {
            const existingStudent = await db.student.findFirst({
                where: {
                  registrationId: regId,
                  studentName: student.studentName,
                  class:student.class
                },
              });
        
              if (existingStudent) {
                console.log(`Student ${student.studentName} already exists for this registration`);
                continue; // Skip creating a new student
              }
            // Generate roll number
            const currentMaxIndex = classIndexMap[student.class] || 0;

            const rollNumber = generateRollNumber(student, currentMaxIndex, year, district, schoolId,contestCh  );
            classIndexMap[student.class] = currentMaxIndex + 1;

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

    return `${year}-${district}-${padNumber5(schoolId)}-${student.class}-${padNumber(index)}-${contestCh}`;
}



export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
      const { id } = params; // Contest ID
      console.log('-------------------------------------------')
      console.log(id)
      // Retrieve registrations associated with the specified contest ID
      const registrations = await db.registration.findMany({
          where: {
              contestId: id,
          },
          include: {
            students: true, // Include related students
          },
      });
      console.log(registrations)

      if (!registrations) {
          return NextResponse.json({ error: "No registrations found for this contest" }, { status: 404 });
      }

      return NextResponse.json(registrations, { status: 200 });
  } catch (error) {
      console.error("Request error", error);
      return NextResponse.json({ error: "Error fetching registrations" }, { status: 500 });
  }
}
