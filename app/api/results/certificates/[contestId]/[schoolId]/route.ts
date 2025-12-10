import { db } from "@/app/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 30;
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { schoolId: string; contestId: string } }
) {
  try {
    noStore();
    const freshDb = new PrismaClient();
    console.log("Contest ID:", params.contestId);
    console.log("School Id:", params.schoolId);

    const schoolIntId = parseInt(params.schoolId, 10);

    // Get school information
    const schoolInfo = await freshDb.user.findFirst({
      where: {
        schoolId: schoolIntId,
      },
      select: {
        schoolName: true,
      },
    });

    if (!schoolInfo) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    // Fetch results with student information
    const results = await freshDb.result.findMany({
      where: {
        schoolId: schoolIntId,
        contestId: params.contestId,
      },
      select: {
        AwardLevel: true,
        class: true,
        rollNumber: true,
      },
    });

    console.log("Results fetched:", results.length);

    if (!results || results.length === 0) {
      return NextResponse.json(
        { message: "No results found for this school and contest" },
        { status: 404 }
      );
    }

    // Get student information for the roll numbers
    const rollNumbers = results
      .map((result) => result.rollNumber)
      .filter(Boolean) as string[];

    const students = await freshDb.student.findMany({
      where: {
        rollNumber: {
          in: rollNumbers,
        },
      },
      select: {
        rollNumber: true,
        studentName: true,
        fatherName: true,
      },
    });

    // Create a map of roll numbers to student information
    const studentMap = new Map(
      students.map((student) => [
        student.rollNumber,
        {
          studentName: student.studentName,
          fatherName: student.fatherName,
        },
      ])
    );

    console.log("Student information fetched:", students.length);
    // Combine results with student information
    const finalResults = results.map((result) => ({
      AwardLevel: result.AwardLevel,
      class: result.class,
      rollNumber: result.rollNumber,
      studentName: result.rollNumber
        ? studentMap.get(result.rollNumber)?.studentName || null
        : null,
      fatherName: result.rollNumber
        ? studentMap.get(result.rollNumber)?.fatherName || null
        : null,
      schoolName: schoolInfo.schoolName,
    }));
    console.log("Final results prepared:", finalResults.length);

    return NextResponse.json(finalResults, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      {
        message: "Error while fetching results data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
