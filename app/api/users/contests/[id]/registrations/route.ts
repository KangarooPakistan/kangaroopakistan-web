import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";
import transporter from "@/app/lib/emailTransporter";
import nodemailer from "nodemailer";

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

const sendEmailWithRetry = async (
  mailOptions: nodemailer.SendMailOptions,
  retries = 3
): Promise<{ success: boolean }> => {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying to send email... Attempts left: ${retries}`);
      return sendEmailWithRetry(mailOptions, retries - 1);
    } else {
      console.error(`Failed to send email after multiple attempts: ${error}`);
      throw error;
    }
  }
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    } = reqBody;
    const contestId = params.id;

    if (!registeredBy || !Array.isArray(students)) {
      return NextResponse.json(
        { error: "Invalid registration data" },
        { status: 400 }
      );
    }

    let regId = registrationId;

    // Create a new registration if no registrationId is provided
    if (!regId) {
      if (!contestId) {
        return NextResponse.json(
          { error: "Contest ID is required for new registration" },
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
        { error: "School details not found" },
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

    const totalStudents = await db.student.findMany({
      where: { registrationId: regId },
    });

    const contestDate = await db.contest.findFirst({
      where: { id: contestId },
    });

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

    let tableHtml = `
      <table style="border: 1px solid #ddd; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 5px 10px;">Roll Number</th>
            <th style="border: 1px solid #ddd; padding: 5px 10px;">Student Name</th>
            <th style="border: 1px solid #ddd; padding: 5px 10px;">Father Name</th>
            <th style="border: 1px solid #ddd; padding: 5px 10px;">Class</th>
            <th style="border: 1px solid #ddd; padding: 5px 10px;">Level</th>
          </tr>
        </thead>
        <tbody>`;

    for (const student of totalStudents) {
      tableHtml += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.rollNumber}</td>
          <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.studentName}</td>
          <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.fatherName}</td>
          <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.class}</td>
          <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.level}</td>
        </tr>`;
    }

    tableHtml += `</tbody></table>`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: "info@kangaroopakistan.org",
      to: schoolDetails.email,
      subject: `Verification of Registration Details for ${contestNameShort} 20${year}`,
      html: `
        <p><b>Dear Principal,</b></p>
        <p>Congratulations on registering for the ${contestName} 20${year}!</p>
        <p>The contest will be held on ${contestDate?.contestDate} in your institute under your supervision.</p>
        <p>Below are the details of your institute. Please verify, as these details will be mentioned in all official documents:</p>
        <p> School ID: ${schoolDetails.schoolId}</p>
        <p> School Name: ${schoolDetails.schoolName}</p>
        <p> School Address: ${schoolDetails.schoolAddress}</p>
        <p> Official Login Email Address: ${schoolDetails.email}</p>
        <p> Principal Name: ${schoolDetails.p_Name}</p>
        <p> Principal Email: ${schoolDetails.p_email}</p>
        <p> Principal Phone: ${schoolDetails.p_phone}</p>
        <p> Principal Cell: ${schoolDetails.p_contact}</p>
        <p> Coordinator Name: ${schoolDetails.c_Name}</p>
        <p> Coordinator Email: ${schoolDetails.c_email}</p>
        <p> Coordinator Phone: ${schoolDetails.c_phone}</p>
        <p> Coordinator Cell: ${schoolDetails.c_contact}</p>
        <p> Coordinator Account Details: ${schoolDetails.c_accountDetails}</p>
        <p> Total Number of students Registered: ${totalStudents.length}</p>
        ${tableHtml}
      `,
    };

    await sendEmailWithRetry(mailOptions, 3);

    return NextResponse.json(createdStudents, { status: 201 });
  } catch (error) {
    console.error("Request error", error);
    return NextResponse.json(
      { error: "Error creating registration" },
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
