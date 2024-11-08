import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Score, Contest, Result, Student } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

interface ProcessedScore
  extends Omit<Score, "id" | "score" | "totalMarks" | "percentage"> {
  id: number;
  score: number | null;
  totalMarks: number | null;
  percentage: number | null;
  contest: {
    name: string;
    contestDate: string | null;
    contestNo: string | null;
  };
  results: Array<
    Omit<Result, "percentage" | "id" | "scoreId"> & {
      id: number;
      scoreId: number;
      percentage: number;
    }
  >;
  student?: {
    studentName: string;
    fatherName: string;
    class: string;
    level: string;
  } | null;
  rank?: number;
  rankings?: {
    school: {
      rank: number;
      totalParticipants: number;
    };
    district: {
      rank: number;
      totalParticipants: number;
    };
    overall: {
      rank: number;
      totalParticipants: number;
    };
  };
  parsedRollNumber?: {
    year: string;
    district: string;
    school: string;
    class: string;
    serialNum: string;
    suffix: string;
  };
}

// Helper function to convert BigInt and Decimal to Number
const convertBigIntToNumber = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (value instanceof Decimal) {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map(convertBigIntToNumber);
  }

  if (typeof value === "object") {
    const converted: any = {};
    for (const key in value) {
      converted[key] = convertBigIntToNumber(value[key]);
    }
    return converted;
  }

  return value;
};
const calculateClassBasedRankings = (
  scores: ProcessedScore[],
  targetClass: string
): ProcessedScore[] => {
  // Filter scores for the specific class
  const classScores = scores.filter((score) => {
    const [, , , classNum] = score.rollNo?.split("-") || [];
    return classNum === targetClass;
  });

  // Sort filtered scores by percentage
  const sortedScores = [...classScores].sort((a, b) => {
    const percentageA = Number(a.percentage) || 0;
    const percentageB = Number(b.percentage) || 0;
    return percentageB - percentageA;
  });

  let currentRank = 1;
  let prevPercentage: number | null = null;
  const totalParticipants = classScores.length;

  return sortedScores.map((score, index) => {
    const currentPercentage = Number(score.percentage) || 0;

    if (prevPercentage !== null && currentPercentage !== prevPercentage) {
      currentRank = index + 1;
    }

    prevPercentage = currentPercentage;
    return {
      ...score,
      rank: currentRank,
      totalParticipants,
    };
  });
};

// Helper function to process raw scores into ProcessedScore format
const processRawScore = (rawScore: any): ProcessedScore => {
  // First convert all BigInts to numbers
  const convertedScore = convertBigIntToNumber(rawScore);

  return {
    ...convertedScore,
    id: Number(rawScore.id),
    score: convertedScore.score,
    totalMarks: convertedScore.totalMarks,
    percentage: convertedScore.percentage,
    results: convertedScore.results.map((result: any) => ({
      ...result,
      id: Number(result.id),
      scoreId: Number(result.scoreId),
      percentage: Number(result.percentage),
    })),
  };
};

// Helper function to get district code from roll number
const getDistrictCode = (rollNo: string | null): string => {
  if (!rollNo) return "";
  const parts = rollNo.split("-");
  return parts[1] || "";
};

// Function to calculate rankings
const calculateRankings = (scores: ProcessedScore[]): ProcessedScore[] => {
  const sortedScores = [...scores].sort((a, b) => {
    const percentageA = Number(a.percentage) || 0;
    const percentageB = Number(b.percentage) || 0;
    return percentageB - percentageA;
  });

  let currentRank = 1;
  let prevPercentage: number | null = null;
  const totalParticipants = sortedScores.length;

  return sortedScores.map((score, index) => {
    const currentPercentage = Number(score.percentage) || 0;

    if (prevPercentage !== null && currentPercentage !== prevPercentage) {
      currentRank = index + 1;
    }

    prevPercentage = currentPercentage;
    return {
      ...score,
      rank: currentRank,
      totalParticipants,
    };
  });
};

export async function GET(
  request: Request,
  { params }: { params: { schoolId: string; contestId: string } }
) {
  try {
    const schoolIntId = parseInt(params.schoolId, 10);
    const paddedSchoolId = schoolIntId.toString().padStart(5, "0");

    // Get school information (keep existing code)
    const schoolInfo = await db.user.findFirst({
      where: {
        schoolId: schoolIntId,
      },
      select: {
        schoolName: true,
        schoolAddress: true,
        city: true,
      },
    });

    // Get all scores and process them (keep existing code)
    const allContestScores = await db.score.findMany({
      where: {
        contestId: params.contestId,
      },
      include: {
        results: true,
        contest: {
          select: {
            name: true,
            contestDate: true,
            contestNo: true,
          },
        },
      },
    });

    // Process raw scores (keep existing code)
    const processedAllScores = allContestScores.map(processRawScore);

    // Filter scores for the requested school
    const schoolScores = processedAllScores.filter((score) =>
      score.rollNo?.includes(`-${paddedSchoolId}-`)
    );

    if (!schoolScores || schoolScores.length === 0) {
      return NextResponse.json(
        {
          message: `No scores found for this school. , ${paddedSchoolId} ,${allContestScores} `,
        },
        { status: 404 }
      );
    }

    // Get the roll numbers from the scores
    const rollNumbers = schoolScores
      .map((score) => score.rollNo)
      .filter(Boolean) as string[];

    // Get student information for these roll numbers
    const students = await db.student.findMany({
      where: {
        rollNumber: {
          in: rollNumbers,
        },
      },
      select: {
        rollNumber: true,
        studentName: true,
        fatherName: true,
        class: true,
        level: true,
      },
    });

    // Convert any potential BigInt values in students data
    const convertedStudents = convertBigIntToNumber(students);

    // Create a map of roll numbers to student information
    const studentMap = new Map(
      convertedStudents.map((student: any) => [
        student.rollNumber,
        {
          studentName: student.studentName,
          fatherName: student.fatherName,
          class: student.class,
          level: student.level,
        },
      ])
    );

    const districtScores: { [key: string]: ProcessedScore[] } = {};
    processedAllScores.forEach((score) => {
      const districtCode = getDistrictCode(score.rollNo);
      if (!districtScores[districtCode]) {
        districtScores[districtCode] = [];
      }
      districtScores[districtCode].push(score);
    });

    // Process the scores with rankings, totals, and student information
    const processedScores = schoolScores.map((score) => {
      const [year, district, school, classNum, serialNum, suffix] =
        score.rollNo?.split("-") || [];
      const districtCode = district;

      // Calculate rankings for this specific class
      const schoolClassRankings = calculateClassBasedRankings(
        schoolScores,
        classNum
      );
      const districtClassRankings = calculateClassBasedRankings(
        districtScores[districtCode] || [],
        classNum
      );
      const overallClassRankings = calculateClassBasedRankings(
        processedAllScores,
        classNum
      );

      // Find this score's rank in each context
      const schoolRank = schoolClassRankings.find(
        (s) => s.rollNo === score.rollNo
      );
      const districtRank = districtClassRankings.find(
        (s) => s.rollNo === score.rollNo
      );
      const overallRank = overallClassRankings.find(
        (s) => s.rollNo === score.rollNo
      );

      // Add student information from our map
      const studentInfo = score.rollNo ? studentMap.get(score.rollNo) : null;

      return {
        ...score,
        student: studentInfo || null,
        rankings: {
          school: {
            rank: schoolRank?.rank || 0,
            totalParticipants: schoolClassRankings.length,
          },
          district: {
            rank: districtRank?.rank || 0,
            totalParticipants: districtClassRankings.length,
          },
          overall: {
            rank: overallRank?.rank || 0,
            totalParticipants: overallClassRankings.length,
          },
        },
        parsedRollNumber: {
          year,
          district: districtCode,
          school,
          class: classNum,
          serialNum,
          suffix,
        },
      };
    });

    // Final conversion of any remaining BigInt values
    const finalProcessedScores = convertBigIntToNumber(processedScores);

    return NextResponse.json(
      {
        schoolId: schoolIntId,
        schoolName: schoolInfo?.schoolName || null,
        city: schoolInfo?.city || null,
        schoolAddress: schoolInfo?.schoolAddress || null,
        totalScores: schoolScores.length,
        scores: finalProcessedScores,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      {
        message: "Error while fetching scores data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
