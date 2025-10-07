import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Score, Contest, Result, Student } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
function getMissingQuestions(
  description: string | null,
  studentClass: string | null
): number[] {
  if (!description || !studentClass) {
    return [0, 0, 0];
  }

  const missingMatch = description.match(/Missing \{([^}]*)\}/);
  const missingQuestions = missingMatch
    ? missingMatch[1]
        .trim()
        .split(":")
        .map((q) => q.trim())
        .filter((q) => q.startsWith("Q") && q !== "")
    : [];

  const classNum = parseInt(studentClass, 10);

  let questionRanges: [number, number][];
  if (classNum >= 1 && classNum <= 4) {
    questionRanges = [
      [1, 8],
      [9, 16],
      [17, 24],
    ];
  } else {
    questionRanges = [
      [1, 10],
      [11, 20],
      [21, 30],
    ];
  }

  return questionRanges.map(([start, end]) => {
    const rangeCount = missingQuestions.filter((q) => {
      const qNum = parseInt(q.replace("Q", ""), 10);
      return qNum >= start && qNum <= end;
    }).length;
    return rangeCount;
  });
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

// Helper function to calculate class-based rankings
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

export async function GET(
  request: Request,
  { params }: { params: { rollNumber: string } }
) {
  try {
    const rollNumber = params.rollNumber;

    // Parse roll number components
    const [year, districtCode, schoolId, classNum, serialNum, suffix] =
      rollNumber.split("-");
    console.log(
      year,
      " ",
      districtCode,
      " ",
      schoolId,
      " ",
      classNum,
      " ",
      serialNum,
      " ",
      suffix
    );
    const schoolIntId = parseInt(schoolId, 10);
    const paddedSchoolId = schoolIntId.toString().padStart(5, "0");

    const registrationIdStudent = await db.student.findFirst({
      where: { rollNumber },
      select: {
        registrationId: true,
      },
    });
    const contestIdForRP = await db.registration.findFirst({
      where: { id: registrationIdStudent?.registrationId },
    });
    const resultsProof = await db.resultProof.findFirst({
      where: {
        contestId: contestIdForRP?.contestId,
      },
    });

    if (!resultsProof) {
      return NextResponse.json(
        { message: "Result not found for this rollNumber" },
        { status: 404 }
      );
    }

    // Get student information
    const studentInfo = await db.student.findFirst({
      where: { rollNumber },
      select: {
        rollNumber: true,
        studentName: true,
        fatherName: true,
        class: true,
        level: true,
      },
    });

    if (!studentInfo) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Get school information
    const schoolInfo = await db.user.findFirst({
      where: { schoolId: schoolIntId },
      select: {
        schoolName: true,
        schoolAddress: true,
        city: true,
      },
    });

    console.log(schoolInfo);

    // Find the latest contest for this student
    const latestScore = await db.score.findFirst({
      where: { rollNo: rollNumber },
      orderBy: { updatedAt: "desc" },
      select: { contestId: true },
    });

    const contestId = latestScore?.contestId;
    console.log(contestId);

    if (!latestScore) {
      return NextResponse.json(
        { message: "No scores found for this student" },
        { status: 404 }
      );
    }

    // Fetch all scores for this contest
    const allContestScores = await db.score.findMany({
      where: {
        contestId: latestScore.contestId,
        rollNo: { contains: `-${classNum}-` },
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
    console.log(allContestScores.length);
    // Process raw scores
    const processedAllScores = allContestScores.map(processRawScore);

    // Separate scores by different contexts
    const schoolScores = processedAllScores.filter((score) =>
      score.rollNo?.includes(`-${paddedSchoolId}-`)
    );
    console.log(paddedSchoolId);
    console.log(schoolScores.length);
    const districtScores = processedAllScores.filter((score) =>
      score.rollNo?.includes(`${districtCode}-`)
    );

    // Calculate rankings for different contexts
    const schoolClassRankings = calculateClassBasedRankings(
      schoolScores,
      classNum
    );
    const districtClassRankings = calculateClassBasedRankings(
      districtScores,
      classNum
    );
    const overallClassRankings = calculateClassBasedRankings(
      processedAllScores,
      classNum
    );

    // Find the student's score
    const studentScore = processedAllScores.find(
      (score) => score.rollNo === rollNumber
    );

    if (!studentScore) {
      return NextResponse.json(
        { message: "Student score not found" },
        { status: 404 }
      );
    }

    // Find rankings
    const schoolRank = schoolClassRankings.find((s) => s.rollNo === rollNumber);
    const districtRank = districtClassRankings.find(
      (s) => s.rollNo === rollNumber
    );
    const overallRank = overallClassRankings.find(
      (s) => s.rollNo === rollNumber
    );

    // Process the final score with rankings
    const processedScore = {
      ...studentScore,
      student: {
        studentName: studentInfo.studentName,
        fatherName: studentInfo.fatherName,
        class: studentInfo.class,
        level: studentInfo.level,
      },
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
        school: schoolId,
        class: classNum,
        serialNum,
        suffix,
      },
    };

    // Final conversion of any remaining BigInt values
    const finalProcessedScore = convertBigIntToNumber(processedScore);
    console.log(finalProcessedScore);
    const missingQuestions = getMissingQuestions(
      finalProcessedScore.description,
      finalProcessedScore.student?.class ?? null
    );

    // Ensure missingQuestions is an array, even if it's a single number
    const missingQuestionsArray = Array.isArray(missingQuestions)
      ? missingQuestions
      : [missingQuestions];

    const processedScoreNew = {
      ...finalProcessedScore,
      missingQuestionsCount: missingQuestionsArray,
    };
    console.log("processedScoreNew");
    console.log(processedScoreNew);

    return NextResponse.json(
      {
        schoolId: schoolIntId,
        schoolName: schoolInfo?.schoolName || null,
        city: schoolInfo?.city || null,
        schoolAddress: schoolInfo?.schoolAddress || null,
        student: {
          rollNumber: studentInfo?.rollNumber,
          name: studentInfo?.studentName,
          class: studentInfo?.class,
          level: studentInfo?.level,
          fatherName: studentInfo?.fatherName,
        },
        totalScores: 1,
        scores: [processedScoreNew],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student scores:", error);
    return NextResponse.json(
      {
        message: "Error while fetching student scores data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
