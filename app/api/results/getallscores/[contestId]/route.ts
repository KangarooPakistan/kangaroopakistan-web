import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const safeJsonStringify = (data: any) => {
  return JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      contestId: string;
    };
  }
) {
  try {
    // Extract class number from rollNo during query
    const students = await db.score.findMany({
      where: {
        contestId: params.contestId,
      },
      orderBy: {
        rollNo: "asc",
      },
    });

    // Filter and group students by class
    const studentsByClass = students.reduce((acc, student) => {
      // Extract class number from rollNo (24-209-00624-02-004-L)
      const classPart = student.rollNo?.split("-")[2] || "Unknown";

      if (!acc[classPart]) {
        acc[classPart] = [];
      }
      acc[classPart].push(student);

      return acc;
    }, {} as Record<string, typeof students>);
    const serializedStudents = safeJsonStringify(studentsByClass);

    return NextResponse.json(serializedStudents, { status: 200 });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { message: "Failed to fetch scores", error: String(error) },
      { status: 500 }
    );
  }
}
