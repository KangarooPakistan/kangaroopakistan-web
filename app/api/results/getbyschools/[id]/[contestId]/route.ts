import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        district: true,
      },
    });

    // First, get all students registered for this school and contest
    const registration = await db.registration.findFirst({
      where: {
        schoolId: schoolIdInt,
        contestId: params.contestId,
      },
      include: {
        students: {
          select: {
            rollNumber: true,
            studentName: true,
            fatherName: true,
            class: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "No registration found for this school and contest" },
        { status: 404 }
      );
    }

    // Log the count of registered students for debugging
    console.log(`Total registered students: ${registration.students.length}`);

    // Create a map for registered students
    const registeredStudents = registration.students;
    const studentMap = new Map(
      registeredStudents.map((student) => [student.rollNumber, student])
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

    // Log the count of results for debugging
    console.log(`Students with results: ${schoolResults.length}`);

    // Create a set of roll numbers that have results for easier lookup
    const studentsWithResults = new Set();
    schoolResults.forEach((result) => {
      if (result.rollNumber) {
        studentsWithResults.add(result.rollNumber);
      }
    });

    console.log(
      `Unique roll numbers with results: ${studentsWithResults.size}`
    );

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

    // Find absent students - those who are registered but don't have results
    const absentStudents = [];

    for (const student of registeredStudents) {
      if (!studentsWithResults.has(student.rollNumber)) {
        console.log(
          `Found absent student: ${student.rollNumber} - ${student.studentName}`
        );
        absentStudents.push({
          id: null,
          rollNumber: student.rollNumber,
          AwardLevel: "Absent",
          percentage: 0,
          district: schoolDetails?.district || null,
          class: student.class,
          contestId: params.contestId,
          score: {
            score: 0,
            totalMarks: 0,
          },
          studentName: student.studentName,
          fatherName: student.fatherName,
          schoolDetails: {
            schoolName: schoolDetails?.schoolName || null,
            schoolAddress: schoolDetails?.schoolAddress || null,
            contactNumber: schoolDetails?.contactNumber || null,
          },
        });
      }
    }

    console.log(`Found ${absentStudents.length} absent students`);
    // First, sort just the resultsWithDetails
    const sortedPresentResults = resultsWithDetails.sort((a, b) => {
      const classA = normalizeClass(a.class);
      const classB = normalizeClass(b.class);

      // If classes are different, sort by class
      if (classA !== classB) {
        return classA - classB;
      }

      // Make sure percentages are converted to numbers for comparison
      // This ensures proper numerical sorting rather than string comparison
      const percentageA = Number(a.percentage);
      const percentageB = Number(b.percentage);

      // Handle NaN values (default to 0 if conversion fails)
      const numA = isNaN(percentageA) ? 0 : percentageA;
      const numB = isNaN(percentageB) ? 0 : percentageB;

      // Sort by percentage in descending order
      return numB - numA;
    });

    // Sort the absent students just by class
    const sortedAbsentStudents = absentStudents.sort((a, b) => {
      const classA = normalizeClass(a.class);
      const classB = normalizeClass(b.class);
      return classA - classB;
    });

    // Combine sorted present results with sorted absent students
    const sortedResults = [...sortedPresentResults, ...sortedAbsentStudents];

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
