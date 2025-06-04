import { NextResponse } from "next/server";
import { db } from "@/app/lib/prisma";
import { SendMailOptions } from "nodemailer";
import emailManager from "@/app/lib/emailManager";

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

    const mailOptions: SendMailOptions = {
      to: schoolDetails?.email,
      subject: `${contestName} 20${year} - Registration Received`,
      html: `<p><b>Dear Sir / Madam,</b></p>
      <p>Please note, we have received the following entries of students for the ${contestName} 20${year}. A total no. of ${totalStudents.length} students were added.  </p>
      <p><b>Next Steps: </b></p>
      <p>1.<b>Check: </b> Please take a look at this list and confirm if all the data is accurate (student name, guardian name, class and school details).</p>
      <p>2.<b>Pay fee: </b> Please make payment as per payment details provided for ${totalStudents.length} students.</p>
      <p>3.<b>Attach proof of payment: </b> On the contest page, click the button “Attach Proof Of Payment” and upload the payment proof in JPEG or PNG format.</p>
      <p>4.<b>Submit: </b> After attaching proof of payment please click “submit” button.</p>
      <p>5.<b>Wait for Final Registration Confirmation Email:: </b> Your registration upon completing the above steps will be complete. You will receive a “Registration confirmation” by February 25, 2025 on your registered email.</p>
      <p>Please see attached list of students for any errors. If you have any questions or require assistance, please feel free to reach us out.</p>

      <p>Below are the details of your <b>institution</b>. Please verify, as these details will be mentioned in <b>all the official</b> documents:</p>
      <p> School ID: ${schoolDetails?.schoolId}</p>
      <p> School Name: ${schoolDetails?.schoolName}</p>
      <p> School Address: ${schoolDetails?.schoolAddress}</p>
      <p> Official Login Email Address: ${schoolDetails?.email}</p>
      <p> Principal Name: ${schoolDetails?.p_Name}</p>
      <p> Principal Email: ${schoolDetails?.p_email}</p>
      <p> Principal Phone: ${schoolDetails?.p_phone}</p>
      <p> Principal Cell: ${schoolDetails?.p_contact}</p>
      <p> Coordinator Name: ${schoolDetails?.c_Name}</p>
      <p> Coordinator Email: ${schoolDetails?.c_email}</p>
      <p> Coordinator Phone: ${schoolDetails?.c_phone}</p>
      <p> Coordinator Cell: ${schoolDetails?.c_contact}</p>
      <p> Coordinator Account Details: ${schoolDetails?.c_accountDetails}</p>
      <p> Total Number of students Registered: ${totalStudents.length}</p>
      ${tableHtml}

      <p>Best Regards</p>
      
      <p><b>Team ${contestNameShort}</b></p>
      <p>Inventive Learning</p>
      <p><b>Office: </b> 042-37180505 | 042-37180506</p>
      <p><b>Whatsapp: </b>0333-2111399 | 0321-8403033 | 0319-5080077</p>
      <p><b>Address: </b>1st Floor, Plaza 114, Main Boulevard, Phase 6, D.H.A Lahore</p>
      <a href="www.kangaroopakistan.org" target="#">www.kangaroopakistan.org</a>
      
      `,
    };

    // try {
    //   await emailManager.sendEmail(mailOptions);
    //   return NextResponse.json("Email sent Successfully", { status: 200 });
    // } catch (error) {
    //   console.error("Failed to send email:", error);
    //   return NextResponse.json(
    //     { message: "Failed to send email" },
    //     { status: 500 }
    //   );
    // }

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
