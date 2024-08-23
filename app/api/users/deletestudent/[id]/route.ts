import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  try {
    const studentIdInt = parseInt(params.id, 10);
    console.log("studentIdInt");
    console.log(studentIdInt); // Convert studentId to integer

    const updateData = await request.json();
    const currentUserEmail = updateData.email;

    console.log("email");
    console.log(currentUserEmail);
    console.log("studentIdInt");
    console.log(studentIdInt);
    const studentPreviousInfo = await db.student.findUnique({
      where: {
        id: studentIdInt,
      },
    });
    console.log(studentPreviousInfo);
    const registrationData = await db.registration.findUnique({
      where: {
        id: studentPreviousInfo?.registrationId,
      },
    });
    console.log("registrationData");
    console.log(registrationData);
    const contestData = await db.contest.findUnique({
      where: {
        id: registrationData?.contestId,
      },
    });
    console.log("contestData");
    console.log(contestData);

    const updatesData = {
      email: currentUserEmail,
      type: "Delete",
      contestName: contestData?.name,

      schoolId: registrationData?.schoolId,
      schoolName: registrationData?.schoolName,
      description: `A user has been deleted by  ${currentUserEmail} in ${contestData?.name} contest.`,
      studentPrev: studentPreviousInfo
        ? JSON.parse(JSON.stringify(studentPreviousInfo))
        : null,
    };

    // Retrieve students associated with the specified registrationId
    const student = await db.student.delete({
      where: {
        id: studentIdInt,
      },
    });
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
            "Students were registered successfully but could not create Log,. There was some error while creating log of this activity.",
        },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { message: "No students found for this registration" },
        { status: 404 }
      );
    }

    // If deletion was successful, return a success response
    return NextResponse.json(
      { message: "Student successfully deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Request error", error);
    return NextResponse.json(
      { message: "Error Deleting the student" },
      { status: 500 }
    );
  }
}
async function parseRequestBody(request: Request) {
  const arrayBuffer = await request.arrayBuffer();
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(arrayBuffer);
  return JSON.parse(text);
}
