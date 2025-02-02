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
      contestId: string;
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

    // Track rollNumbers with missing student names
    const missingStudentNames = students
      .filter(
        (student) => !student.studentName || student.studentName.trim() === ""
      )
      .map((student) => student.rollNumber);

    // If there are missing student names, return an error
    if (missingStudentNames.length > 0) {
      return NextResponse.json(
        {
          error: "Missing student names detected",
          rollNumbers: missingStudentNames,
        },
        { status: 400 }
      );
    }

    // Create a map of students by roll number for faster lookup
    const studentMap = new Map(
      students.map((student) => [student.rollNumber, student])
    );

    // Fetch schools data with schoolName and ensure non-null values
    const schools = await db.user.findMany({
      where: {
        schoolName: {
          not: null,
        },
      },
      select: {
        schoolId: true,
        schoolName: true,
        city: true,
      },
    });

    console.log("Available School IDs in schools data:");
    const availableSchoolIds = schools.map((school) => school.schoolId);
    console.log(availableSchoolIds);

    const schoolMap = new Map(
      schools.map((school) => [school.schoolId, school])
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

    // Check for results with missing student information
    const resultsWithMissingStudents = resultsWithDetails
      .filter((result) => !studentMap.has(result.rollNumber || ""))
      .map((result) => result.rollNumber);

    if (resultsWithMissingStudents.length > 0) {
      return NextResponse.json(
        {
          error: "Results found with missing student information",
          rollNumbers: resultsWithMissingStudents,
        },
        { status: 400 }
      );
    }

    console.log("School IDs from results:");
    const resultSchoolIds = resultsWithDetails.map((result) => result.schoolId);
    console.log(resultSchoolIds);

    const mismatchedSchoolIds = resultSchoolIds.filter(
      (schoolId) => !availableSchoolIds.includes(schoolId)
    );
    console.log("School IDs in results but not in schools data:");
    console.log(mismatchedSchoolIds);

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
      const schoolInfo = schoolMap.get(result.schoolId);
      const city = districtToCityMap.get(result.district?.toLowerCase());
      const classValue = studentInfo ? getClassValue(studentInfo.class) : 0;
      const schoolName = schoolInfo?.schoolName || "Unknown School";

      return {
        ...result,
        classValue: classValue,
        numericPercentage: getNumericPercentage(result.percentage),
        schoolName: schoolName,
        studentDetails: studentInfo
          ? {
              studentName: studentInfo.studentName,
              fatherName: studentInfo.fatherName,
              class: studentInfo.class,
              level: studentInfo.level,
              schoolId: result.schoolId,
              schoolName: schoolName,
              district: result.district,
              city: city,
            }
          : null,
      };
    });

    // Sort the combined data by class in ascending order
    const sortedData = combinedData.sort((a, b) => {
      const classA = a.studentDetails?.class || "";
      const classB = b.studentDetails?.class || "";

      const numA = parseInt(classA);
      const numB = parseInt(classB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      return classA.localeCompare(classB);
    });

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
