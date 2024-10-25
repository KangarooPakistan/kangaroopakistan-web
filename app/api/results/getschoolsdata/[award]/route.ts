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
    // console.log(schools);
    // schools.forEach((school) => {
    //   console.log(`School ID: ${school.schoolId}`);
    //   console.log(`School Name: ${school.schoolName}`);
    //   console.log(`City: ${school.city}`);
    //   console.log("------------------------");
    // });

    // Log schools with empty schoolName
    // console.log("\nSchools with empty schoolName:");
    // const emptySchoolNames = schools.filter((school) => !school.schoolName);
    // console.log(emptySchoolNames);

    // Create a map of schools by schoolId for faster lookup

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

      // Ensure schoolName is included from the school info
      const schoolName = schoolInfo?.schoolName || "Unknown School";

      return {
        ...result,
        classValue: classValue,
        numericPercentage: getNumericPercentage(result.percentage),
        schoolName: schoolName, // This will now always have a value
        studentDetails: studentInfo
          ? {
              studentName: studentInfo.studentName,
              fatherName: studentInfo.fatherName,
              class: studentInfo.class,
              level: studentInfo.level,
              schoolId: result.schoolId,
              schoolName: schoolName, // Include schoolName in student details as well
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
