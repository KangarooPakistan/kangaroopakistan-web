import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get all registrations for this contest
    const registrations = await db.registration.findMany({
      where: {
        contestId: params.id,
      },
      include: {
        students: true,
        user: true, // Including all user fields
      },
    });

    // Transform data to the desired format
    const schoolsData = registrations.map((registration) => {
      // Initialize counters for each category
      const categoryCount = {
        PRE_ECOLIER: 0, // class 1-2
        ECOLIER: 0, // class 3-4
        BENJAMIN: 0, // class 5-6
        CADET: 0, // class 7-8
        JUNIOR: 0, // class 9-10
        STUDENT: 0, // class 11-12
      };

      // Count students in each category
      registration.students.forEach((student) => {
        // Parse class to a number, handle potential non-numeric values
        const studentClass = parseInt(student.class);

        if (!isNaN(studentClass)) {
          if (studentClass <= 2) categoryCount.PRE_ECOLIER++;
          else if (studentClass <= 4) categoryCount.ECOLIER++;
          else if (studentClass <= 6) categoryCount.BENJAMIN++;
          else if (studentClass <= 8) categoryCount.CADET++;
          else if (studentClass <= 10) categoryCount.JUNIOR++;
          else if (studentClass <= 12) categoryCount.STUDENT++;
        }
      });

      // Return the formatted school data
      return {
        schoolId: registration.schoolId,
        schoolName:
          registration.schoolName || registration.user.schoolName || "",
        totalStudents: registration.students.length,
        categories: categoryCount,
      };
    });

    return NextResponse.json({
      schools: schoolsData,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
