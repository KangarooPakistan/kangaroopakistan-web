import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: { contestId: string } }
) {
  try {
    noStore();
    const freshDb = new PrismaClient();

    console.log(`API called at: ${new Date().toISOString()}`);
    console.log("Contest ID:", params.contestId);
    // First, get all roll numbers that have scores for this contest
    const scoresWithRollNumbers = await freshDb.score.findMany({
      where: {
        contestId: params.contestId,
        rollNo: {
          not: null,
        },
      },
      select: {
        rollNo: true,
      },
      distinct: ["rollNo"],
    });

    console.log("Scores with roll numbers:", scoresWithRollNumbers);
    // Filter out null values and ensure we have strings only
    const rollNumbersWithScores = scoresWithRollNumbers
      .map((score) => score.rollNo)
      .filter((rollNo): rollNo is string => rollNo !== null);

    if (rollNumbersWithScores.length === 0) {
      return NextResponse.json([]);
    }

    // Then, fetch schools that have students with those roll numbers
    const schoolsWithScoredStudents = await freshDb.registration.findMany({
      where: {
        contestId: params.contestId,
        students: {
          some: {
            rollNumber: {
              in: rollNumbersWithScores,
            },
          },
        },
      },
      select: {
        schoolId: true,
        schoolName: true,
        user: {
          select: {
            p_Name: true,
            schoolId: true,
            schoolName: true,
          },
        },
      },
      distinct: ["schoolId"],
    });
    console.log("Schools with scored students:", schoolsWithScoredStudents);

    const result = schoolsWithScoredStudents.map((school) => ({
      schoolId: school.user.schoolId,
      schoolName: school.user.schoolName,
      p_Name: school.user.p_Name,
    }));

    console.log("Final result:", result);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
