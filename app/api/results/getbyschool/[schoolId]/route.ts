import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Score, Result } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessedScore
  extends Omit<Score, "id" | "score" | "totalMarks" | "percentage"> {
  id: number;
  score: number | null;
  totalMarks: number | null;
  percentage: number | null;
  contest: { name: string; contestDate: string | null; contestNo: string | null };
  results: Array<
    Omit<Result, "percentage" | "id" | "scoreId"> & {
      id: number; scoreId: number; percentage: number;
    }
  >;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMissingQuestions(description: string | null, studentClass: string | null): number[] {
  if (!description || !studentClass) return [0, 0, 0];
  const missingMatch = description.match(/Missing \{([^}]*)\}/);
  const missingQuestions = missingMatch
    ? missingMatch[1].trim().split(":").map((q) => q.trim()).filter((q) => q.startsWith("Q") && q !== "")
    : [];
  const classNum = parseInt(studentClass, 10);
  const ranges: [number, number][] = classNum >= 1 && classNum <= 4
    ? [[1, 8], [9, 16], [17, 24]]
    : [[1, 10], [11, 20], [21, 30]];
  return ranges.map(([start, end]) =>
    missingQuestions.filter((q) => {
      const n = parseInt(q.replace("Q", ""), 10);
      return n >= start && n <= end;
    }).length
  );
}

const convertBigIntToNumber = (value: any): any => {
  if (value === null || value === undefined) return value;
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Decimal) return Number(value);
  if (Array.isArray(value)) return value.map(convertBigIntToNumber);
  if (typeof value === "object") {
    const out: any = {};
    for (const k in value) out[k] = convertBigIntToNumber(value[k]);
    return out;
  }
  return value;
};

const processRawScore = (raw: any): ProcessedScore => {
  const c = convertBigIntToNumber(raw);
  return {
    ...c,
    id: Number(raw.id),
    results: c.results.map((r: any) => ({
      ...r, id: Number(r.id), scoreId: Number(r.scoreId), percentage: Number(r.percentage),
    })),
  };
};

const assignRanks = (group: { rollNo: string; pct: number }[]) => {
  const sorted = [...group].sort((a, b) => b.pct - a.pct);
  const map = new Map<string, number>();
  let r = 1; let prev: number | null = null;
  sorted.forEach((s, i) => {
    if (prev !== null && s.pct !== prev) r = i + 1;
    prev = s.pct;
    map.set(s.rollNo, r);
  });
  return { map, total: group.length };
};

// ─── GET /api/results/getbyschool/[schoolId] ──────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    const schoolIntId = parseInt(params.schoolId, 10);
    if (isNaN(schoolIntId)) {
      return NextResponse.json({ message: "Invalid school ID" }, { status: 400 });
    }

    // Active contest = most recent ResultProof
    const latestProof = await db.resultProof.findFirst({
      orderBy: { id: "desc" },
      select: { contestId: true },
    });
    if (!latestProof) {
      return NextResponse.json({ message: "No results have been published yet" }, { status: 404 });
    }
    const activeContestId = latestProof.contestId;

    // Hold check
    const holdRecord = await db.resultHold.findUnique({
      where: { contestId_schoolId: { contestId: activeContestId, schoolId: schoolIntId } },
    });
    if (holdRecord?.hold) {
      return NextResponse.json({ message: "Results are not available for this school" }, { status: 404 });
    }

    // School info + registration in parallel
    const [schoolInfo, registration] = await Promise.all([
      db.user.findFirst({
        where: { schoolId: schoolIntId },
        select: { schoolName: true, schoolAddress: true, city: true },
      }),
      db.registration.findFirst({
        where: { schoolId: schoolIntId, contestId: activeContestId },
        select: { id: true },
      }),
    ]);

    if (!registration) {
      return NextResponse.json({ message: "School not registered in the current contest" }, { status: 404 });
    }

    // Students + lightweight ranking scores in parallel
    const [students, allRankingScores] = await Promise.all([
      db.student.findMany({
        where: { registrationId: registration.id },
        select: { rollNumber: true, studentName: true, fatherName: true, class: true, level: true },
      }),
      db.score.findMany({
        where: { contestId: activeContestId },
        select: { rollNo: true, percentage: true },
      }),
    ]);

    if (students.length === 0) {
      return NextResponse.json({ message: "No students found for this school" }, { status: 404 });
    }

    const studentRollNumbers = students.map((s) => s.rollNumber);

    // Full score details only for this school's students
    const rawStudentScores = await db.score.findMany({
      where: { contestId: activeContestId, rollNo: { in: studentRollNumbers } },
      select: {
        id: true, rollNo: true, contestId: true,
        score: true, totalMarks: true, percentage: true,
        cRow1: true, cRow2: true, cRow3: true, cTotal: true,
        creditScore: true, description: true, missing: true,
        wrong: true, updatedAt: true,
        results: { select: { id: true, scoreId: true, percentage: true, contestId: true, schoolId: true, district: true, class: true, level: true, AwardLevel: true, rollNumber: true, createdAt: true, updatedAt: true } },
        contest: { select: { name: true, contestDate: true, contestNo: true } },
      },
    });

    const scoreByRollNo = new Map(rawStudentScores.map(processRawScore).map((s) => [s.rollNo, s]));

    // Pre-compute rankings per class
    const scoresByClass = new Map<string, { rollNo: string; pct: number }[]>();
    for (const s of allRankingScores) {
      if (!s.rollNo) continue;
      const cls = s.rollNo.split("-")[3];
      if (!cls) continue;
      const arr = scoresByClass.get(cls) ?? [];
      arr.push({ rollNo: s.rollNo, pct: Number(s.percentage) || 0 });
      scoresByClass.set(cls, arr);
    }

    type RankEntry = { rank: number; totalParticipants: number };
    const rankMap = new Map<string, { school: RankEntry; district: RankEntry; overall: RankEntry }>();

    for (const [, classScores] of Array.from(scoresByClass.entries())) {
      const { map: overallMap, total: overallTotal } = assignRanks(classScores);

      const bySchool = new Map<string, { rollNo: string; pct: number }[]>();
      const byDistrict = new Map<string, { rollNo: string; pct: number }[]>();
      for (const s of classScores) {
        const parts = s.rollNo.split("-");
        const sc = parts[2]; const dc = parts[1];
        if (sc) { const a = bySchool.get(sc) ?? []; a.push(s); bySchool.set(sc, a); }
        if (dc) { const a = byDistrict.get(dc) ?? []; a.push(s); byDistrict.set(dc, a); }
      }

      for (const s of classScores) {
        const parts = s.rollNo.split("-");
        const { map: schoolMap, total: schoolTotal } = assignRanks(bySchool.get(parts[2]) ?? []);
        const { map: districtMap, total: districtTotal } = assignRanks(byDistrict.get(parts[1]) ?? []);
        rankMap.set(s.rollNo, {
          school: { rank: schoolMap.get(s.rollNo) ?? 0, totalParticipants: schoolTotal },
          district: { rank: districtMap.get(s.rollNo) ?? 0, totalParticipants: districtTotal },
          overall: { rank: overallMap.get(s.rollNo) ?? 0, totalParticipants: overallTotal },
        });
      }
    }

    // Build results
    const validResults: any[] = [];
    for (const studentInfo of students) {
      const rollNumber = studentInfo.rollNumber;
      const [year, districtCode, schoolId, classNum, serialNum, suffix] = rollNumber.split("-");
      const studentScore = scoreByRollNo.get(rollNumber);
      if (!studentScore) continue;

      const scoreVal = Number(studentScore.score) || 0;
      const totalMarks = Number(studentScore.totalMarks) || 0;
      const storedPct = Number(studentScore.percentage) || 0;
      const calcPct = totalMarks > 0 ? (scoreVal / totalMarks) * 100 : 0;
      const isValid = Math.abs(calcPct - storedPct) < 0.01;
      const missingQuestionsArray = getMissingQuestions(studentScore.description, studentInfo.class);
      const rankings = rankMap.get(rollNumber) ?? null;

      if (!isValid) {
        validResults.push({
          schoolId: schoolIntId, schoolName: schoolInfo?.schoolName ?? null,
          city: schoolInfo?.city ?? null, schoolAddress: schoolInfo?.schoolAddress ?? null,
          student: { rollNumber, name: studentInfo.studentName, class: studentInfo.class, level: studentInfo.level, fatherName: studentInfo.fatherName },
          totalScores: 1,
          scores: [{ ...convertBigIntToNumber(studentScore), cRow1: null, cRow2: null, cRow3: null, cTotal: null, creditScore: null, description: null, missing: null, percentage: null, score: null, totalMarks: null, wrong: null, parsedRollNumber: { year, district: districtCode, school: schoolId, class: classNum, serialNum, suffix }, missingQuestionsCount: missingQuestionsArray, rankings: null, validationError: "Percentage mismatch detected" }],
        });
        continue;
      }

      validResults.push({
        schoolId: schoolIntId, schoolName: schoolInfo?.schoolName ?? null,
        city: schoolInfo?.city ?? null, schoolAddress: schoolInfo?.schoolAddress ?? null,
        student: { rollNumber, name: studentInfo.studentName, class: studentInfo.class, level: studentInfo.level, fatherName: studentInfo.fatherName },
        totalScores: 1,
        scores: [convertBigIntToNumber({ ...studentScore, awardLevel: studentScore.results?.[0]?.AwardLevel ?? null, rankings, parsedRollNumber: { year, district: districtCode, school: schoolId, class: classNum, serialNum, suffix }, missingQuestionsCount: missingQuestionsArray })],
      });
    }

    return NextResponse.json(
      {
        schoolId: schoolIntId,
        schoolName: schoolInfo?.schoolName ?? null,
        city: schoolInfo?.city ?? null,
        schoolAddress: schoolInfo?.schoolAddress ?? null,
        totalStudents: validResults.length,
        students: validResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching school results:", error);
    return NextResponse.json(
      { message: "Error fetching school results", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
