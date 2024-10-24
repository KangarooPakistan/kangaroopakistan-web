import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Helper function to safely serialize BigInt values
const safeJsonStringify = (data: any) => {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

// Helper function to normalize class value for sorting
const normalizeClass = (classValue: string | number): number => {
  // Convert the class to a string and remove any non-numeric characters
  const numericValue = String(classValue).replace(/\D/g, "");
  return parseInt(numericValue, 10) || 0; // Return 0 if parsing fails
};

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      contestId: string;
    };
  }
) {
  try {
    const schoolIdInt = parseInt(params.id, 10);

    // Fetch school details
    const schoolDetails = await db.user.findFirst({
      where: {
        schoolId: schoolIdInt,
      },
      select: {
        schoolName: true,
        schoolAddress: true,
        contactNumber: true,
      },
    });

    // First, get all students for faster lookup
    const students = await db.student.findMany({
      select: {
        rollNumber: true,
        studentName: true,
        fatherName: true,
        class: true,
      },
    });

    // Create a map for quick student lookups
    const studentMap = new Map(
      students.map((student) => [student.rollNumber, student])
    );

    // Fetch results for the school
    const schoolResults = await db.result.findMany({
      where: {
        schoolId: schoolIdInt,
        contestId: params.contestId,
      },
      select: {
        id: true,
        rollNumber: true,
        AwardLevel: true,
        percentage: true,
        district: true,
        class: true,
        contestId: true,
        score: {
          select: {
            score: true,
            totalMarks: true,
          },
        },
      },
    });

    // Combine results with student and school details
    const resultsWithDetails = schoolResults.map((result) => {
      const studentInfo = studentMap.get(result.rollNumber || "");

      return {
        ...result,
        studentName: studentInfo?.studentName || null,
        fatherName: studentInfo?.fatherName || null,
        class: studentInfo?.class || result.class.toString(),
        schoolDetails: {
          schoolName: schoolDetails?.schoolName || null,
          schoolAddress: schoolDetails?.schoolAddress || null,
          contactNumber: schoolDetails?.contactNumber || null,
        },
      };
    });

    // Sort results by class in ascending order
    const sortedResults = resultsWithDetails.sort((a, b) => {
      const classA = normalizeClass(a.class);
      const classB = normalizeClass(b.class);
      return classA - classB;
    });

    // Use safeJsonStringify to handle BigInt values
    return new NextResponse(safeJsonStringify(sortedResults), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching school results:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
