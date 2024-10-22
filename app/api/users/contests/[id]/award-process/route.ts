// app/api/contests/[contestId]/process-awards/route.ts

import { NextResponse, NextRequest } from "next/server";
import { processAwards } from "@/app/lib/awards/processAwards";
import { db } from "@/app/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contestId = params.id;

    // // Check if the contest exists
    // const contest = await db.contest.findUnique({
    //   where: { id: contestId },
    // });

    // if (!contest) {
    //   return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    // }

    // Process the awards
    await processAwards(contestId);

    return NextResponse.json({ message: "Awards processed successfully" });
  } catch (error: any) {
    console.error("Error processing awards:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error processing awards: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred while processing awards" },
        { status: 500 }
      );
    }
  }
}
