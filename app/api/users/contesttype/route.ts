import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { db } from "@/app/lib/prisma";

interface ContestTypeData {
  contestName: string;
  imageUrl: string;
  contestCh: string; // Optional field
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const token = await getToken({ req: request });

  if (session) {
    if (token?.role === "Admin" || token?.role === "Employee") {
      try {
        const reqBody = await request.json();
        const { contestName, imageUrl, contestCh } = reqBody;
        const isLowercase = (contestCh: string) =>
          contestCh === contestCh.toLowerCase();
        let uppercaseContestCh;
        if (isLowercase(contestCh)) {
          // If contestCh is lowercase, convert it to uppercase
          uppercaseContestCh = contestCh.toUpperCase();
          // Use uppercaseContestCh in your code as needed
        } else {
          uppercaseContestCh = contestCh;
        }
        const contestTypeData: ContestTypeData = {
          contestName: contestName,
          imageUrl: imageUrl,
          contestCh: uppercaseContestCh,
        };
        const existingContest = await db.contestType.findUnique({
          where: {
            contestName: contestTypeData.contestName,
          },
        });
        if (existingContest) {
          return NextResponse.json(
            { error: "User Already Exists" },
            { status: 400 }
          );
        }
        const contestType = await db.contestType.create({
          data: contestTypeData,
        });

        return NextResponse.json(contestType);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  // Handle other cases or return a response for unauthorized requests
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
export async function GET(request: NextRequest) {
  try {
    // Fetch all rows from the contestType table
    const contestTypes = await db.contestType.findMany();
    // Return the contestTypes as JSON response
    return NextResponse.json(contestTypes);
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json(
        { error: "Contest type not found" },
        { status: 404 }
      );
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
