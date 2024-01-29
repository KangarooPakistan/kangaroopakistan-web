import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { db } from "@/app/lib/prisma";

interface ContestData {
  name: string;
  startDate: Date;
  endDate: Date;
  contestDate: string | null;
  resultDate: string | null;
  contestTypeId: string;
  contestCh: string | null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const token = await getToken({ req: request });

  if (session && token?.role === "Admin") {
    try {
      const reqBody = await request.json();
      const { name, startDate, endDate, contestTypeId, contestDate, resultDate, contestCh } = reqBody;

      console.log(endDate)
      const contestData: ContestData = {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        contestDate: contestDate || null,
        resultDate: resultDate || null, 
        contestCh: contestCh || null,
        contestTypeId,
      };

      // Optionally, validate if the contestTypeId exists in ContestType
      const existingContestType = await db.contestType.findUnique({
        where: { id: contestTypeId },
      });

      if (!existingContestType) {
        return NextResponse.json({ error: "Contest Type not found" }, { status: 404 });
      }

      const newContest = await db.contest.create({
        data: contestData,
      });

      return NextResponse.json(newContest);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export  async function GET(req: NextRequest, res: NextResponse, ) {
  try {
    const url = new URL(req.url)

    const contestTypeId = url.searchParams.get("contestTypeId")
    // const take = url.searchParams.get("take")
    console.log(typeof(contestTypeId))
    console.log('kainat')
    // Optionally, you can validate if contestTypeId is provided
    if (!contestTypeId) {
      return NextResponse.json({ error: "Missing contestTypeId" }, { status: 401 });
     }

    // Query the database to get contests with the specified contestTypeId
    const contests = await db.contest.findMany({
      where: { contestTypeId: contestTypeId },
    });
    return NextResponse.json(contests);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract the id and updated data from the request body
    const { id, contestName, imageUrl } = await request.json();

    // Check if the contest type with the given id exists
    const existingContest = await db.contestType.findUnique({
      where: {
        id,
      },
    });

    if (!existingContest) {
      return NextResponse.json({ error: "Contest type not found" }, { status: 404 });
    }

    // Update the contest type with the new data
    const updatedContest = await db.contestType.update({
      where: {
        id,
      },
      data: {
        contestName,
        imageUrl,
      },
    });

    // Return the updated contest type as a JSON response
    return NextResponse.json(updatedContest);
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


