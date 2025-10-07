import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentLevel: string;
  studentClass: string; // Changed from `class` to `studentClass`
  schoolName: string | null;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}
export async function GET(
  request: Request,
  { params }: { params: { registrationId: string } }
) {
  try {
    const registrations = await db.registration.findMany({
      where: {
        id: params.registrationId,
      },
      include: {
        students: true, // Include related students
        // paymentProof: true, // Include related payment proofs
        user: true, // Include the related user
        // Add other related fields if necessary
      },
    });

    console.log(registrations);
    const studentsArray: Student[] = [];

    // Loop through registrations
    for (const registration of registrations) {
      const { user, students } = registration;

      const { district, schoolName, schoolAddress, schoolId } = user;
      for (const student of students) {
        const {
          rollNumber,
          studentName,
          fatherName,
          level: studentLevel,
          class: studentClass, // Changed to `studentClass`
        } = student;

        // Create student object and push to array
        const studentObj: Student = {
          rollNumber,
          studentLevel,
          studentName,
          fatherName,
          studentClass,
          schoolId,
          schoolName, // Use extracted schoolName
          address: schoolAddress, // Use extracted schoolAddress
          districtCode: district, // Use extracted district
        };

        studentsArray.push(studentObj);
      }
    }

    return NextResponse.json(studentsArray, { status: 200 });
  } catch (error) {
    return NextResponse.json(params.registrationId, { status: 400 });
  }
}
