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
const normalizePercentage = (percentage: any): number => {
  if (typeof percentage === "string") {
    return parseFloat(percentage) || 0;
  }
  if (typeof percentage === "number") {
    return percentage;
  }
  return 0;
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
    const resultsProof = await db.resultProof.findFirst({
      where: {
        contestId: params.contestId,
      },
    });

    if (!resultsProof) {
      return NextResponse.json(
        { error: "No results found for this contest" },
        { status: 404 }
      );
    }

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

    // Sort results by class and then by percentage in descending order
    // Sort results by class and then by percentage in descending order
    const sortedResults = resultsWithDetails.sort((a, b) => {
      const classA = normalizeClass(a.class);
      const classB = normalizeClass(b.class);

      // If classes are different, sort by class
      if (classA !== classB) {
        return classA - classB;
      }

      // Debug: Log raw percentage values
      console.log("Raw percentage A:", a.percentage);

      // Convert Decimal to number for comparison
      const percentageA = a.percentage ? Number(a.percentage) : 0;
      const percentageB = b.percentage ? Number(b.percentage) : 0;

      return percentageB - percentageA;
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
