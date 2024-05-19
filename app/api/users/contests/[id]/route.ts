import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contest = await db.contest.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!contest) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(contest);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract the id and updated data from the request body
    const { id, name, startDate, endDate, contestDate, resultDate } =
      await request.json();

    // Check if the contest with the given id exists
    const existingContest = await db.contest.findUnique({
      where: {
        id,
      },
    });

    if (!existingContest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    //   if (!name || !startDate || !endDate || !contestCh || !contestDate || !resultDate) {
    //     return NextResponse.json({ error: "Missing required fields" }, { status: 404 });
    //   }

    // Update the contest with the new data
    const updatedContest = await db.contest.update({
      where: {
        id,
      },
      data: {
        name,
        startDate,
        endDate,
        contestDate,
        resultDate,
      },
    });

    // Return the updated contest as a JSON response
    return NextResponse.json(updatedContest);
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
