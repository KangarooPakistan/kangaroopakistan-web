import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const { registrationId, imageUrl, currentUserEmail } = reqBody;
    const paymentProof = await db.paymentProof.create({
      data: {
        imageUrl: imageUrl,
        registrationId: registrationId,
      },
    });
    const registrationData = await db.registration.findUnique({
      where: {
        id: registrationId,
      },
    });
    console.log("registrationData");
    console.log(registrationData);
    const contestData = await db.contest.findUnique({
      where: {
        id: registrationData?.contestId,
      },
    });
    // If successful, create the updatesData object
    const updatesData = {
      email: currentUserEmail,
      type: "Add",
      schoolId: registrationData?.schoolId,
      contestName: contestData?.name,
      description: `SchoolId: ${registrationData?.schoolId} has added a new payment proof in ${contestData?.name}`,
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
          error:
            "Contest was created successfully but could not create Log,. There was some error while creating log of this activity.",
        },
        { status: 500 }
      );

      console.error("Error creating update:", error);
    }

    return NextResponse.json(paymentProof, { status: 200 });
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json(
      { message: "Error while adding payment proof " },
      { status: 500 }
    );
  }
}
