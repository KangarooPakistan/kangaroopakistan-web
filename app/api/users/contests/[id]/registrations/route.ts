import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";
import { validateAwsCredentials } from "@/app/lib/awsValidation";

const padNumber = (num: number) => String(num).padStart(3, "0");
const padNumber5 = (num: number) => String(num).padStart(5, "0");

interface StudentData {
  year: string;
  district: string;
  schoolId: number;
  class: string;
  contestCh: string;
  studentName: string;
  fatherName: string;
  level: string;
}

// const sendEmailWithRetry = async (
//   mailOptions: nodemailer.SendMailOptions,
//   retries = 3
// ): Promise<{ success: boolean }> => {
//   try {
//     await transporter.sendMail(mailOptions);
//     return { success: true };
//   } catch (error) {
//     if (retries > 0) {
//       console.log(`Retrying to send email... Attempts left: ${retries}`);
//       return sendEmailWithRetry(mailOptions, retries - 1);
//     } else {
//       console.error(`Failed to send email after multiple attempts: ${error}`);
//       throw error;
//     }
//   }
// };

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate AWS credentials including SMTP email
    validateAwsCredentials();
    
    const reqBody = await request.json();
    const {
      schoolId,
      registeredBy,
      students,
      registrationId,
      year,
      district,
      contestCh,
      schoolName,
      currentUserEmail,
    } = reqBody;
    const contestId = params.id;

    if (!registeredBy || !Array.isArray(students)) {
      return NextResponse.json(
        { message: "Invalid registration data" },
        { status: 400 }
      );
    }

    let regId = registrationId;

    // Create a new registration if no registrationId is provided
    if (!regId) {
      if (!contestId) {
        return NextResponse.json(
          { message: "Contest ID is required for new registration" },
          { status: 400 }
        );
      }

      const newRegistration = await db.registration.create({
        data: {
          contestId,
          schoolId,
          schoolName,
          registeredBy: registeredBy,
        },
      });
      regId = newRegistration.id;
    }

    const schoolDetails = await db.user.findFirst({
      where: { schoolId },
    });

    if (!schoolDetails) {
      return NextResponse.json(
        { message: "School details not found" },
        { status: 404 }
      );
    }

    const createdStudents = [];

    for (const student of students) {
      const existingStudent = await db.student.findFirst({
        where: {
          registrationId: regId,
          studentName: student.studentName,
          fatherName: student.fatherName,
          class: student.class,
        },
      });

      if (existingStudent) {
        continue; // Skip creating a new student
      }

      const lastStudentOfClass = await db.student.findFirst({
        where: {
          registrationId: regId,
          class: student.class,
        },
        orderBy: [{ rollNumber: "desc" }],
      });

      let lastIndex = 0;
      if (lastStudentOfClass) {
        const rollNumberParts = lastStudentOfClass.rollNumber.split("-");
        lastIndex = parseInt(rollNumberParts[4]) || 0;
      }

      const newIndex = lastIndex + 1;
      const rollNumber = generateRollNumber(
        student,
        newIndex,
        year,
        district,
        schoolId,
        contestCh
      );

      const createdStudent = await db.student.create({
        data: {
          registrationId: regId,
          rollNumber,
          studentName: student.studentName,
          fatherName: student.fatherName,
          class: student.class,
          level: student.level,
        },
      });

      createdStudents.push(createdStudent);
    }
    console.log("createdStudents");
    console.log(createdStudents);
    const studentIds = createdStudents.map((student) => student.id);

    const totalStudents = await db.student.findMany({
      where: { registrationId: regId },
    });

    const contestDate = await db.contest.findFirst({
      where: { id: contestId },
    });
    console.log(contestDate);
    const updatesData = {
      email: currentUserEmail,
      type: "Add",
      contestName: contestDate?.name,
      students: studentIds,
      schoolId,
      schoolName,
      description: `New students have been added by user ${currentUserEmail} in ${contestDate?.name} contest.`,
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
            "Students were registered successfully but could not create Log,. There was some error while creating log of this activity.",
        },
        { status: 500 }
      );
    }
    let contestName;
    switch (contestCh) {
      case "M":
        contestName = "International Kangaroo Mathematics Contest (IKMC)";
        break;
      case "S":
        contestName = "International Kangaroo Science Contest (IKSC)";
        break;
      case "L":
        contestName = "International Kangaroo Linguistic Contest (IKLC)";
        break;
      default:
        contestName = "Contest Name Not Available";
    }

    const contestNameShort =
      contestCh === "M"
        ? "IKMC"
        : contestCh === "S"
        ? "IKSC"
        : contestCh === "L"
        ? "IKLC"
        : "Contest Name Not Available";

   

    return NextResponse.json(createdStudents, { status: 201 });
  } catch (error) {
    console.error("Request error", error);
    return NextResponse.json(
      { message: "Error creating registration" },
      { status: 500 }
    );
  }
}

// Function to generate roll number (unchanged)
function generateRollNumber(
  student: StudentData,
  currentMaxIndex: number,
  year: string,
  district: string,
  schoolId: number,
  contestCh: string
) {
  const index = currentMaxIndex + 1;
  return `${year}-${district}-${padNumber5(schoolId)}-${
    student.class
  }-${padNumber(currentMaxIndex)}-${contestCh}`;
}
