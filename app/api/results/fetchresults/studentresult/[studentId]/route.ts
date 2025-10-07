import { db } from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper function to safely serialize BigInt values
function serializeData(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    console.log("-----------------");
    const id = params.studentId;

    // Get results with their scores
    const result = await db.result.findFirst({
      where: {
        id,
      },
      include: {
        score: {
          select: {
            rollNo: true,
            percentage: true,
          },
        },
      },
      orderBy: {
        percentage: "desc",
      },
    });

    console.log(result);
    const serializedResult = serializeData(result);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Error fetching results" },
      { status: 500 }
    );
  }
}
