import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type QuestionStat = {
  correct: number;
  wrong: number;
  missing: number;
};

type ClassStats = {
  [classNumber: string]: QuestionStat;
};

type QuestionStats = {
  [question: string]: ClassStats;
};

export async function GET(
  request: Request,
  { params }: { params: { contestId: string } }
) {
  try {
    if (!params.contestId) {
      return NextResponse.json(
        { message: "Missing contestId in query parameters" },
        { status: 400 }
      );
    }
    const contestId = params.contestId;
    if (!contestId) {
      return NextResponse.json(
        { error: "Contest ID is required" },
        { status: 400 }
      );
    }
    const contest = await db.contest.findUnique({
      where: {
        id: contestId,
      },
      select: {
        name: true,
        contestDate: true,
      },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    // Get all scores for the contest
    const scores = await db.score.findMany({
      where: {
        contestId: contestId,
      },
      select: {
        description: true,
        rollNo: true,
      },
    });

    // Parse roll numbers to extract class information
    const classCounts: Record<string, number> = {};
    const questionStats: QuestionStats = {};

    // Process each score
    scores.forEach((score) => {
      // Extract class number from rollNo (format: 24-212-00107-04-009-S)
      if (!score.rollNo) return;

      const parts = score.rollNo.split("-");
      if (parts.length < 4) return;

      const classNumber = parts[3];

      // Count students per class
      classCounts[classNumber] = (classCounts[classNumber] || 0) + 1;

      // Determine max question count based on class
      const maxQuestions =
        classNumber === "01" ||
        classNumber === "02" ||
        classNumber === "03" ||
        classNumber === "04"
          ? 24
          : 30;

      // Initialize question stats for this class if needed
      for (let i = 1; i <= maxQuestions; i++) {
        const qNum = `Q${i}`;
        if (!questionStats[qNum]) {
          questionStats[qNum] = {};
        }
        if (!questionStats[qNum][classNumber]) {
          questionStats[qNum][classNumber] = {
            correct: 0,
            wrong: 0,
            missing: 0,
          };
        }
      }

      // Parse description to extract correct/wrong/missing questions
      if (score.description) {
        // Extract correct questions
        const correctMatch = score.description.match(/Correct \{([^}]*)\}/);
        if (correctMatch && correctMatch[1]) {
          const correctQuestions = correctMatch[1].match(/Q\d+/g) || [];
          correctQuestions.forEach((q) => {
            if (questionStats[q] && questionStats[q][classNumber]) {
              questionStats[q][classNumber].correct += 1;
            }
          });
        }

        // Extract wrong questions
        const wrongMatch = score.description.match(/Wrong \{([^}]*)\}/);
        if (wrongMatch && wrongMatch[1]) {
          const wrongQuestions = wrongMatch[1].match(/Q\d+/g) || [];
          wrongQuestions.forEach((q) => {
            if (questionStats[q] && questionStats[q][classNumber]) {
              questionStats[q][classNumber].wrong += 1;
            }
          });
        }

        // Extract missing questions
        const missingMatch = score.description.match(/Missing \{([^}]*)\}/);
        if (missingMatch && missingMatch[1]) {
          const missingQuestions = missingMatch[1].match(/Q\d+/g) || [];
          missingQuestions.forEach((q) => {
            if (questionStats[q] && questionStats[q][classNumber]) {
              questionStats[q][classNumber].missing += 1;
            }
          });
        }
      }
    });

    // Prepare the final response
    const result = {
      contestName: contest.name,
      contestDate: contest.contestDate,
      totalStudentsByClass: classCounts,
      questionStatsByClass: questionStats,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing question stats:", error);
    return NextResponse.json(
      { error: "Failed to process question stats" },
      { status: 500 }
    );
  }
}
