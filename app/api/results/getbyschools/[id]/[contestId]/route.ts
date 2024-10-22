import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Helper function to safely serialize BigInt values
const safeJsonStringify = (data: any) => {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
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
    const schoolWithDetails = await db.result.findMany({
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

    // Combine results with student details
    const resultsWithStudentDetails = schoolWithDetails.map((result) => {
      const studentInfo = studentMap.get(result.rollNumber || "");

      return {
        ...result,
        studentName: studentInfo?.studentName || null,
        fatherName: studentInfo?.fatherName || null,
        class: studentInfo?.class || result.class.toString(), // Fallback to result class if student info not found
      };
    });

    // Use safeJsonStringify to handle BigInt values
    return new NextResponse(safeJsonStringify(resultsWithStudentDetails), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching schools:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
