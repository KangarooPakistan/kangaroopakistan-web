import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Helper function to safely serialize BigInt values
const safeJsonStringify = (data: any) => {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

// Helper function to get numeric class value
const getClassValue = (classStr: string | null): number => {
  if (!classStr) return 0;
  const numericValue = parseInt(classStr);
  return isNaN(numericValue) ? 0 : numericValue;
};

// Helper function to safely convert percentage to number
const getNumericPercentage = (percentage: any): number => {
  if (typeof percentage === "string") {
    return parseFloat(percentage);
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
      award: string;
    };
  }
) {
  try {
    // First fetch the student details
    const students = await db.student.findMany({
      select: {
        rollNumber: true,
        studentName: true,
        fatherName: true,
        class: true,
        level: true,
      },
    });

    // Create a map of students by roll number for faster lookup
    const studentMap = new Map(
      students.map((student) => [student.rollNumber, student])
    );

    // Then fetch results with basic details
    const resultsWithDetails = await db.result.findMany({
      where: {
        AwardLevel: params.award,
      },
      select: {
        id: true,
        AwardLevel: true,
        percentage: true,
        rollNumber: true,
        class: true,
        district: true,
        schoolId: true,
        score: {
          select: {
            rollNo: true,
            score: true,
            totalMarks: true,
          },
        },
        contest: {
          select: {
            name: true,
            contestDate: true,
          },
        },
      },
    });

    const schools = await db.user.findMany({
      select: {
        schoolId: true,
        city: true,
      },
      where: {
        city: {
          not: null,
        },
      },
    });

    // Fetch distinct district-city mappings
    const districtData = await db.user.findMany({
      distinct: ["district"],
      select: {
        district: true,
        city: true,
      },
      where: {
        district: {
          not: null,
        },
        city: {
          not: null,
        },
      },
    });

    // Create district to city mapping
    const districtToCityMap = new Map(
      districtData.map((data) => [data.district?.toLowerCase(), data.city])
    );

    // Combine and transform the data
    let combinedData = resultsWithDetails.map((result) => {
      const studentInfo = studentMap.get(result.rollNumber || "");
      const city = districtToCityMap.get(result.district?.toLowerCase());
      const classValue = studentInfo ? getClassValue(studentInfo.class) : 0;

      return {
        ...result,
        classValue: classValue,
        numericPercentage: getNumericPercentage(result.percentage),
        studentDetails: studentInfo
          ? {
              studentName: studentInfo.studentName,
              fatherName: studentInfo.fatherName,
              class: studentInfo.class,
              level: studentInfo.level,
              schoolId: result.schoolId,
              district: result.district,
              city: city || null,
            }
          : null,
      };
    });

    // Sort the combined data by class in ascending order
    const sortedData = combinedData.sort((a, b) => {
      const classA = a.studentDetails?.class || "";
      const classB = b.studentDetails?.class || "";

      // Handle numeric classes
      const numA = parseInt(classA);
      const numB = parseInt(classB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      // Fall back to string comparison for non-numeric classes
      return classA.localeCompare(classB);
    });

    // Return the sorted data
    return new NextResponse(safeJsonStringify(sortedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error fetching results with student details:", error);
    return NextResponse.json(
      { error: "Failed to fetch results and student details" },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}
