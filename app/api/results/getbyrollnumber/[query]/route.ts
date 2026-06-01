import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Score, Result } from "@prisma/client";
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
    school: { rank: number; totalParticipants: number };
    district: { rank: number; totalParticipants: number };
    overall: { rank: number; totalParticipants: number };
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
  if (!description || !studentClass) return [0, 0, 0];

  const missingMatch = description.match(/Missing \{([^}]*)\}/);
  const missingQuestions = missingMatch
    ? missingMatch[1]
        .trim()
        .split(":")
        .map((q) => q.trim())
        .filter((q) => q.startsWith("Q") && q !== "")
    : [];

  const classNum = parseInt(studentClass, 10);
  const questionRanges: [number, number][] =
    classNum >= 1 && classNum <= 4
      ? [[1, 8], [9, 16], [17, 24]]
      : [[1, 10], [11, 20], [21, 30]];

  return questionRanges.map(([start, end]) =>
    missingQuestions.filter((q) => {
      const qNum = parseInt(q.replace("Q", ""), 10);
      return qNum >= start && qNum <= end;
    }).length
  );
}

const convertBigIntToNumber = (value: any): any => {
  if (value === null || value === undefined) return value;
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Decimal) return Number(value);
  if (Array.isArray(value)) return value.map(convertBigIntToNumber);
  if (typeof value === "object") {
    const converted: any = {};
    for (const key in value) converted[key] = convertBigIntToNumber(value[key]);
    return converted;
  }
  return value;
};

const calculateClassBasedRankings = (
  scores: ProcessedScore[],
  targetClass: string
): ProcessedScore[] => {
  const classScores = scores.filter((score) => {
    const [, , , classNum] = score.rollNo?.split("-") || [];
    return classNum === targetClass;
  });

  const sortedScores = [...classScores].sort(
    (a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0)
  );

  let currentRank = 1;
  let prevPercentage: number | null = null;
  const totalParticipants = classScores.length;

  return sortedScores.map((score, index) => {
    const currentPercentage = Number(score.percentage) || 0;
    if (prevPercentage !== null && currentPercentage !== prevPercentage) {
      currentRank = index + 1;
    }
    prevPercentage = currentPercentage;
    return { ...score, rank: currentRank, totalParticipants };
  });
};

const processRawScore = (rawScore: any): ProcessedScore => {
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

// ─── Build full processed result for a single roll number ────────────────────
async function buildResultForRollNumber(
  rollNumber: string,
  contestId: string,
  allContestScores: ProcessedScore[]
) {
  const [year, districtCode, schoolId, classNum, serialNum, suffix] =
    rollNumber.split("-");
  const schoolIntId = parseInt(schoolId, 10);
  const paddedSchoolId = schoolIntId.toString().padStart(5, "0");

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

  if (!studentInfo) return null;

  const schoolInfo = await db.user.findFirst({
    where: { schoolId: schoolIntId },
    select: { schoolName: true, schoolAddress: true, city: true },
  });

  // Filter scores for this class
  const classScores = allContestScores.filter((s) =>
    s.rollNo?.includes(`-${classNum}-`)
  );

  const studentScore = classScores.find((s) => s.rollNo === rollNumber);
  if (!studentScore) return null;

  const score = Number(studentScore.score) || 0;
  const totalMarks = Number(studentScore.totalMarks) || 0;
  const storedPercentage = Number(studentScore.percentage) || 0;
  const calculatedPercentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  const isPercentageValid =
    Math.abs(calculatedPercentage - storedPercentage) < 0.01;

  const missingQuestions = getMissingQuestions(
    studentScore.description,
    studentInfo.class
  );
  const missingQuestionsArray = Array.isArray(missingQuestions)
    ? missingQuestions
    : [missingQuestions];

  if (!isPercentageValid) {
    return {
      schoolId: schoolIntId,
      schoolName: schoolInfo?.schoolName || null,
      city: schoolInfo?.city || null,
      schoolAddress: schoolInfo?.schoolAddress || null,
      student: {
        rollNumber: studentInfo.rollNumber,
        name: studentInfo.studentName,
        class: studentInfo.class,
        level: studentInfo.level,
        fatherName: studentInfo.fatherName,
      },
      totalScores: 1,
      scores: [
        {
          ...convertBigIntToNumber(studentScore),
          cRow1: null, cRow2: null, cRow3: null, cTotal: null,
          creditScore: null, description: null, missing: null,
          percentage: null, score: null, totalMarks: null, wrong: null,
          contestId: studentScore.contestId,
          rollNo: studentScore.rollNo,
          student: {
            studentName: studentInfo.studentName,
            fatherName: studentInfo.fatherName,
            class: studentInfo.class,
            level: studentInfo.level,
          },
          parsedRollNumber: { year, district: districtCode, school: schoolId, class: classNum, serialNum, suffix },
          missingQuestionsCount: missingQuestionsArray,
          rankings: null,
          validationError: "Percentage mismatch detected",
        },
      ],
    };
  }

  // Rankings
  const schoolScores = classScores.filter((s) =>
    s.rollNo?.includes(`-${paddedSchoolId}-`)
  );
  const districtScores = classScores.filter((s) =>
    s.rollNo?.includes(`${districtCode}-`)
  );

  const schoolClassRankings = calculateClassBasedRankings(schoolScores, classNum);
  const districtClassRankings = calculateClassBasedRankings(districtScores, classNum);
  const overallClassRankings = calculateClassBasedRankings(classScores, classNum);

  const schoolRank = schoolClassRankings.find((s) => s.rollNo === rollNumber);
  const districtRank = districtClassRankings.find((s) => s.rollNo === rollNumber);
  const overallRank = overallClassRankings.find((s) => s.rollNo === rollNumber);

  const processedScore = convertBigIntToNumber({
    ...studentScore,
    awardLevel: studentScore.results?.[0]?.AwardLevel ?? null,
    student: {
      studentName: studentInfo.studentName,
      fatherName: studentInfo.fatherName,
      class: studentInfo.class,
      level: studentInfo.level,
    },
    rankings: {
      school: { rank: schoolRank?.rank || 0, totalParticipants: schoolClassRankings.length },
      district: { rank: districtRank?.rank || 0, totalParticipants: districtClassRankings.length },
      overall: { rank: overallRank?.rank || 0, totalParticipants: overallClassRankings.length },
    },
    parsedRollNumber: { year, district: districtCode, school: schoolId, class: classNum, serialNum, suffix },
    missingQuestionsCount: missingQuestionsArray,
  });

  return {
    schoolId: schoolIntId,
    schoolName: schoolInfo?.schoolName || null,
    city: schoolInfo?.city || null,
    schoolAddress: schoolInfo?.schoolAddress || null,
    student: {
      rollNumber: studentInfo.rollNumber,
      name: studentInfo.studentName,
      class: studentInfo.class,
      level: studentInfo.level,
      fatherName: studentInfo.fatherName,
    },
    totalScores: 1,
    scores: [processedScore],
  };
}

// ─── Detect roll number format ───────────────────────────────────────────────
function isRollNumber(query: string): boolean {
  // Format: YY(YY)-DDD-SSSSS-CC-NNN-X  — be permissive on segment lengths
  return /^\d{2,4}-\d{2,4}-\d{3,6}-\d{1,2}-\d{1,4}-\w+$/.test(query);
}

// ─── GET handler ─────────────────────────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: { query: string } }
) {
  try {
    const query = decodeURIComponent(params.query).trim();

    // ── 1. Get the most recent ResultProof to determine active contest ────────
    const latestProof = await db.resultProof.findFirst({
      orderBy: { id: "desc" },
      select: { contestId: true },
    });

    if (!latestProof) {
      return NextResponse.json(
        { message: "No results have been published yet" },
        { status: 404 }
      );
    }

    const activeContestId = latestProof.contestId;

    // ── 2. Roll number path ───────────────────────────────────────────────────
    if (isRollNumber(query)) {
      const rollNumber = query;
      const [year, districtCode, schoolId, classNum] = rollNumber.split("-");
      const schoolIntId = parseInt(schoolId, 10);

      // Verify result proof exists for this student's contest
      const registrationIdStudent = await db.student.findFirst({
        where: { rollNumber },
        select: { registrationId: true },
      });
      const contestIdForRP = await db.registration.findFirst({
        where: { id: registrationIdStudent?.registrationId },
      });
      const resultsProof = await db.resultProof.findFirst({
        where: { contestId: contestIdForRP?.contestId },
      });

      if (!resultsProof) {
        return NextResponse.json(
          { message: "Result not found for this rollNumber" },
          { status: 404 }
        );
      }

      const latestScore = await db.score.findFirst({
        where: { rollNo: rollNumber },
        orderBy: { updatedAt: "desc" },
        select: { contestId: true },
      });

      if (!latestScore) {
        return NextResponse.json(
          { message: "No scores found for this student" },
          { status: 404 }
        );
      }

      // Hold check
      const holdRecord = await db.resultHold.findUnique({
        where: {
          contestId_schoolId: {
            contestId: latestScore.contestId,
            schoolId: schoolIntId,
          },
        },
      });
      if (holdRecord?.hold) {
        return NextResponse.json(
          { message: "Result not found for this rollNumber" },
          { status: 404 }
        );
      }

      // Fetch all contest scores for ranking
      const allContestScores = (
        await db.score.findMany({
          where: {
            contestId: latestScore.contestId,
            rollNo: { contains: `-${classNum}-` },
          },
          include: {
            results: true,
            contest: { select: { name: true, contestDate: true, contestNo: true } },
          },
        })
      ).map(processRawScore);

      const result = await buildResultForRollNumber(
        rollNumber,
        latestScore.contestId,
        allContestScores
      );

      if (!result) {
        return NextResponse.json(
          { message: "Student score not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(result, { status: 200 });
    }

    // ── 3. Text search: check school name first, then student name ────────────

    // 3a. School name search — return school list only (fast), students loaded on demand
    const schoolNameCandidates = await db.user.findMany({
      where: { schoolName: { contains: query } },
      select: { schoolId: true, schoolName: true, schoolAddress: true, city: true },
    });
    const wordBoundaryRegex = new RegExp(`(?<![a-zA-Z])${query}(?![a-zA-Z])`, "i");
    const matchedSchools = schoolNameCandidates.filter(
      (s) => s.schoolName && wordBoundaryRegex.test(s.schoolName)
    );

    if (matchedSchools.length > 0) {
      const matchedSchoolIds = matchedSchools.map((s) => s.schoolId);

      // Only need hold checks and registration existence — no scores needed
      const [holdRecords, registrations] = await Promise.all([
        db.resultHold.findMany({
          where: { contestId: activeContestId, schoolId: { in: matchedSchoolIds } },
          select: { schoolId: true, hold: true },
        }),
        db.registration.findMany({
          where: { contestId: activeContestId, schoolId: { in: matchedSchoolIds } },
          select: { schoolId: true },
        }),
      ]);

      const holdSet = new Set(holdRecords.filter((h) => h.hold).map((h) => h.schoolId));
      const registeredSet = new Set(registrations.map((r) => r.schoolId));

      const schoolList = matchedSchools
        .filter((s) => !holdSet.has(s.schoolId) && registeredSet.has(s.schoolId))
        .map((s) => ({
          schoolId: s.schoolId,
          schoolName: s.schoolName,
          city: s.city,
          schoolAddress: s.schoolAddress,
        }));

      if (schoolList.length === 0) {
        return NextResponse.json(
          { message: "No results available for schools matching this name" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { searchType: "school", query, totalSchools: schoolList.length, schools: schoolList },
        { status: 200 }
      );
    }

    // 3b. Student name search
    const matchedStudents = await db.student.findMany({
      where: {
        studentName: { contains: query },
        registrationId: {
          in: (
            await db.registration.findMany({
              where: { contestId: activeContestId },
              select: { id: true },
            })
          ).map((r) => r.id),
        },
      },
      select: {
        rollNumber: true,
        studentName: true,
        fatherName: true,
        class: true,
        level: true,
        registrationId: true,
      },
    });

    // Resolve schoolId for each matched student via their registration
    const registrations = await db.registration.findMany({
      where: {
        id: { in: matchedStudents.map((s) => s.registrationId) },
      },
      select: { id: true, schoolId: true, contestId: true },
    });
    const regMap = new Map(registrations.map((r) => [r.id, r]));

    if (matchedStudents.length === 0) {
      return NextResponse.json(
        { message: "No student or school found matching the given name" },
        { status: 404 }
      );
    }

    // Filter out students whose school is on hold
    const holdChecks = await Promise.all(
      matchedStudents.map((s) => {
        const reg = regMap.get(s.registrationId);
        if (!reg) return Promise.resolve(null);
        return db.resultHold.findUnique({
          where: {
            contestId_schoolId: {
              contestId: activeContestId,
              schoolId: reg.schoolId,
            },
          },
        });
      })
    );

    const eligibleStudents = matchedStudents.filter(
      (_, i) => !holdChecks[i]?.hold
    );

    if (eligibleStudents.length === 0) {
      return NextResponse.json(
        { message: "No student or school found matching the given name" },
        { status: 404 }
      );
    }

    // Fetch all contest scores once
    const allContestScores = (
      await db.score.findMany({
        where: { contestId: activeContestId },
        include: {
          results: true,
          contest: { select: { name: true, contestDate: true, contestNo: true } },
        },
      })
    ).map(processRawScore);

    const studentResults = await Promise.all(
      eligibleStudents.map((s) =>
        buildResultForRollNumber(s.rollNumber, activeContestId, allContestScores)
      )
    );

    const validStudentResults = studentResults.filter(Boolean);

    return NextResponse.json(
      {
        searchType: "studentName",
        totalStudents: validStudentResults.length,
        students: validStudentResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      {
        message: "Error while fetching results",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
