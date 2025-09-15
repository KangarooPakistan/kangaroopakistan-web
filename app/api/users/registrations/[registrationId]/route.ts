import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { registrationId: string } }
) {
  try {
    const registrations = await db.registration.findMany({
      where: {
        id: params.registrationId,
      },
      include: {
        students: true, // Include related students
        paymentProof: true, // Include related payment proofs
        user: true, // Include the related user
        // Add other related fields if necessary
      },
    });

    // Map over registrations to add ContestName at the top level
    const registrationsWithContestName = await Promise.all(
      registrations.map(async (registration) => {
        // Fetch contest data using contestId
        const contest = await db.contest.findUnique({
          where: { id: registration.contestId },
          select: { name: true },
        });

        return {
          ...registration,
          ContestName: contest?.name || null,
        };
      })
    );

    return NextResponse.json(registrationsWithContestName, { status: 200 });
  } catch (error) {
    // return NextResponse.json(params.registrationId,  { status: 400 });
    return NextResponse.json(
      {
        message: "There was an Error while fetching the data.",
      },
      { status: 500 }
    );
  }
}
