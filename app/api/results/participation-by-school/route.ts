import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * POST /api/results/participation-by-school
 *
 * Grants PARTICIPATION results to all registered students of a school who do
 * not already have a Score/Result record for this contest.
 *
 * Requires that a ResultProof already exists for the contest (checked server-side).
 *
 * Body:
 *   contestId  string  – the contest to update
 *   schoolId   number  – the school whose students should get participation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contestId, schoolId } = body as {
      contestId?: string;
      schoolId?: number;
    };

    // ── Validate required fields ───────────────────────────────────────────
    if (!contestId) {
      return NextResponse.json(
        { success: false, message: "Missing contestId" },
        { status: 400 }
      );
    }
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "Missing schoolId" },
        { status: 400 }
      );
    }

    // ── Verify contest exists ──────────────────────────────────────────────
    const contest = await db.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json(
        { success: false, message: "Contest not found" },
        { status: 404 }
      );
    }

    // ── Verify permission proof has been uploaded ──────────────────────────
    const proofCount = await db.resultProof.count({
      where: { contestId },
    });
    if (proofCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Permission proof has not been uploaded for this contest. Please upload it first.",
        },
        { status: 403 }
      );
    }

    // ── Load students for this school/contest ──────────────────────────────
    const registration = await db.registration.findUnique({
      where: { contestId_schoolId: { contestId, schoolId } },
      include: { students: true },
    });

    if (!registration || registration.students.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No registered students found for this school/contest.",
        },
        { status: 404 }
      );
    }

    const students = registration.students;

    // ── Skip students that already have a Score ────────────────────────────
    const existingScores = await db.score.findMany({
      where: { contestId },
      select: { rollNo: true },
    });
    const existingRollNumbers = new Set(
      existingScores
        .map((s) => s.rollNo)
        .filter((r): r is string => typeof r === "string")
    );

    const studentsWithoutScores = students.filter(
      (s) => !existingRollNumbers.has(s.rollNumber)
    );

    if (studentsWithoutScores.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message:
            "All students for this school already have scores. No participation records added.",
          inserted: 0,
          skipped: students.length,
        },
        { status: 200 }
      );
    }

    // ── Create Score rows (0 marks, 0 percentage) ──────────────────────────
    const scoreData: Prisma.ScoreCreateManyInput[] = studentsWithoutScores.map(
      (student) => ({
        contestId,
        rollNo: student.rollNumber,
        score: BigInt(0),
        totalMarks: BigInt(0),
        percentage: new Prisma.Decimal(0),
        creditScore: 0,
        cTotal: 0,
        cRow1: 0,
        cRow2: 0,
        cRow3: 0,
        wrong: 0,
        missing: 0,
        description: "PARTICIPATION - No sheet received",
      })
    );

    const createdScores = await db.score.createMany({
      data: scoreData,
      skipDuplicates: true,
    });

    // ── Fetch the newly created Score ids ──────────────────────────────────
    const newScores = await db.score.findMany({
      where: {
        contestId,
        rollNo: { in: studentsWithoutScores.map((s) => s.rollNumber) },
      },
      select: { id: true, rollNo: true },
    });

    // ── Create Result rows (PARTICIPATION) ────────────────────────────────
    const resultData: Prisma.ResultCreateManyInput[] = newScores
      .map((score): Prisma.ResultCreateManyInput | null => {
        const rollNo = score.rollNo;
        if (!rollNo) return null;

        // Roll number format: YEAR-DISTRICT-SCHOOLID-CLASS[-SERIAL]
        const parts = rollNo.split("-");
        if (parts.length < 4) return null;

        const district = parts[1];
        const schoolIdFromRoll = parseInt(parts[2], 10);
        const classNum = parseInt(parts[3], 10);

        if (!district || isNaN(schoolIdFromRoll) || isNaN(classNum)) {
          return null;
        }

        const level = classNum >= 1 && classNum <= 4 ? "JUNIOR" : "SENIOR";

        return {
          id: crypto.randomUUID(),
          scoreId: score.id,
          contestId,
          district,
          schoolId: schoolIdFromRoll,
          class: classNum,
          level,
          rollNumber: rollNo,
          percentage: new Prisma.Decimal(0),
          AwardLevel: "PARTICIPATION",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
      .filter((r): r is Prisma.ResultCreateManyInput => r !== null);

    await db.result.createMany({
      data: resultData,
      skipDuplicates: true,
    });

    // ── Ensure ResultHold record exists for this school ────────────────────
    await db.resultHold
      .createMany({
        data: [{ contestId, schoolId, hold: false }],
        skipDuplicates: true,
      })
      .catch(() => {
        // non-fatal
      });

    return NextResponse.json(
      {
        success: true,
        message: `Participation granted to ${createdScores.count} student(s). ${
          students.length - studentsWithoutScores.length
        } already had scores and were skipped.`,
        inserted: createdScores.count,
        skipped: students.length - studentsWithoutScores.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error granting participation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to grant participation",
        error: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
