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
  contestNo: string | null;
  contestEnabled: boolean;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  const token = await getToken({ req: request });

  if ((session && token?.role === "Admin") || token?.role === "Employee") {
    try {
      const reqBody = await request.json();
      const {
        name,
        startDate,
        endDate,
        contestTypeId,
        contestDate,
        resultDate,
        contestCh,
        contestNo,
        contestEnabled,
        currentUserEmail,
      } = reqBody;

      const contestData: ContestData = {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        contestDate: contestDate || null,
        resultDate: resultDate || null,
        contestCh: contestCh || null,
        contestNo: contestNo || null,
        contestTypeId,
        contestEnabled,
      };

      // Optionally, validate if the contestTypeId exists in ContestType
      const existingContestType = await db.contestType.findUnique({
        where: { id: contestTypeId },
      });

      if (!existingContestType) {
        return NextResponse.json(
          { message: "Contest Type not found" },
          { status: 404 }
        );
      }

      try {
        // Attempt to create a new contest
        const newContest = await db.contest.create({
          data: contestData,
        });

        // If successful, create the updatesData object
        const updatesData = {
          email: currentUserEmail,
          type: "Add",
          contestName: name,
          description: `A new contest, named ${name}, has been added by user ${currentUserEmail}.`,
        };

        try {
          // Attempt to create a new update
          const newUpdate = await db.updates.create({
            data: updatesData,
          });
          console.log("Update created successfully:", newUpdate);
        } catch (error) {
          return NextResponse.json(
            {
              message:
                "Contest was created successfully but could not create Log,. There was some error while creating log of this activity.",
            },
            { status: 500 }
          );

          console.error("Error creating update:", error);
        }
        return NextResponse.json(newContest);
      } catch (error) {
        return NextResponse.json(
          {
            message: "Error while creating Contest.",
          },
          { status: 500 }
        );
        // return NextResponse.json("Error while creating Contest");
        console.error("Error creating contest:", error);
        // Handle the error according to your needs.
      }
    } catch (error: any) {
      return NextResponse.json(
        {
          message:
            "Could not create contest. There was some error while creating contest",
        },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const url = new URL(req.url);

    const contestTypeId = url.searchParams.get("contestTypeId");
    // const take = url.searchParams.get("take")

    // Optionally, you can validate if contestTypeId is provided
    if (!contestTypeId) {
      return NextResponse.json(
        { message: "Missing contestTypeId" },
        { status: 401 }
      );
    }

    // Query the database to get contests with the specified contestTypeId
    // Sort by createdAt in descending order (newest first)
    const contests = await db.contest.findMany({
      where: { contestTypeId: contestTypeId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(contests);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
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
        { message: "Contest type not found" },
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
