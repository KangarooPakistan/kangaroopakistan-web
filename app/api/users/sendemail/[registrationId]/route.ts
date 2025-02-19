import { db } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import transporter from "@/app/lib/emailTransporter";
import nodemailer from "nodemailer";
import { SendMailOptions } from "nodemailer";
import emailManager from "@/app/lib/emailManager";

export async function GET(
  request: Request,
  { params }: { params: { registrationId: string } }
) {
  try {
    if (!params.registrationId) {
      return NextResponse.json(
        { message: "Missing registrationId in query parameters" },
        { status: 400 }
      );
    }

    const registrations = await db.student.findMany({
      where: { registrationId: params.registrationId },
    });
    const registrationData = await db.registration.findFirst({
      where: { id: params.registrationId },
    });
    const schoolDetails = await db.user.findFirst({
      where: { schoolId: registrationData?.schoolId },
    });
    const aminaEmail = await db.user.findFirst({
      where: {
        schoolId: 814,
      },
      select: {
        email: true,
      },
    });
    const ebdullahEmail = await db.user.findFirst({
      where: {
        schoolId: 292,
      },
      select: {
        email: true,
      },
    });
    // console.log(aminaEmail?.email);
    // console.log(ebdullahEmail?.email);
    const totalStudents = await db.student.findMany({
      where: { registrationId: params.registrationId },
    });
    const contestDate = await db.contest.findFirst({
      where: { id: registrationData?.contestId },
    });

    let contestName, contestNameShort;
    switch (contestDate?.contestCh) {
      case "M":
        contestName = "International Kangaroo Mathematics Contest (IKMC)";
        contestNameShort = "IKMC";
        break;
      case "S":
        contestName = "International Kangaroo Science Contest (IKSC)";
        contestNameShort = "IKSC";
        break;
      case "L":
        contestName = "International Kangaroo Linguistic Contest (IKLC)";
        contestNameShort = "IKLC";
        break;
      default:
        contestName = "Contest Name Not Available";
        contestNameShort = "Contest Name Not Available";
    }

    if (!registrations) {
      return NextResponse.json(
        { message: "No registrations found" },
        { status: 404 }
      );
    }

    let tableHtml = `<table style="border: 1px solid #ddd; border-collapse: collapse;">
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
      tableHtml += `<tr>
        <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.rollNumber}</td>
        <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.studentName}</td>
        <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.fatherName}</td>
        <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.class}</td>
        <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.level}</td>
      </tr>`;
    }

    tableHtml += `</tbody></table>`;

    const startDateString = contestDate?.startDate;
    let year = startDateString ? new Date(startDateString).getFullYear() : 0;

    // const mailOptions: nodemailer.SendMailOptions = {
    //   from: "info@kangaroopakistan.org",
    //   to: schoolDetails?.email,
    //   subject: `Verification of Registration Details for ${contestNameShort} ${year}`,
    //   html: `<p><b>Dear Principal,</b></p>
    //   <p>Congratulations on registering for the ${contestName} ${year}</p>
    //   <p>The contest will be held on ${contestDate?.contestDate} in your institute under your supervision.</p>
    //   <p>Below are the details of your institute. Please verify, as these details will be mentioned in all official documents:</p>
    //   <p> School ID: ${schoolDetails?.schoolId}</p>
    //   <p> School Name: ${schoolDetails?.schoolName}</p>
    //   <p> School Address: ${schoolDetails?.schoolAddress}</p>
    //   <p> Official Login Email Address: ${schoolDetails?.email}</p>
    //   <p> Principal Name: ${schoolDetails?.p_Name}</p>
    //   <p> Principal Email: ${schoolDetails?.p_email}</p>
    //   <p> Principal Phone: ${schoolDetails?.p_phone}</p>
    //   <p> Principal Cell: ${schoolDetails?.p_contact}</p>
    //   <p> Coordinator Name: ${schoolDetails?.c_Name}</p>
    //   <p> Coordinator Email: ${schoolDetails?.c_email}</p>
    //   <p> Coordinator Phone: ${schoolDetails?.c_phone}</p>
    //   <p> Coordinator Cell: ${schoolDetails?.c_contact}</p>
    //   <p> Coordinator Account Details: ${schoolDetails?.c_accountDetails}</p>
    //   <p> Total Number of students Registered: ${totalStudents.length}</p>
    //   ${tableHtml}`,
    // };

    // const sendEmailWithRetry = async (
    //   mailOptions: nodemailer.SendMailOptions,
    //   retries = 1
    // ): Promise<{ success: boolean }> => {
    //   try {
    //     await transporter.sendMail(mailOptions);
    //     return { success: true };
    //   } catch (error) {
    //     if (retries > 0) {
    //       console.log(`Retrying to send email... Attempts left: ${retries}`);
    //       return sendEmailWithRetry(mailOptions, retries - 1);
    //     } else {
    //       throw error;
    //     }
    //   }
    // };

    const mailOptions: SendMailOptions = {
      from: process.env.AWS_SMTP_EMAIL,
      to: [
        schoolDetails?.email || "",
        schoolDetails?.p_email || "",
        schoolDetails?.c_email || "",
        aminaEmail?.email || "",
        // ebdullahEmail?.email || "",
      ],

      subject: `Registration Received - ${contestNameShort} ${year}`,
      html: `<p><b>Dear Sir / Madam,</b></p>
      <p>Thank you for registering your school for the ${contestName} ${year}. We have successfully received your registration details and are currently in the process of verifying your payment to complete the registration procedure. </p>
      <p>If there are any discrepancies or additional information required, our team will reach out to you promptly. In the meantime, if you have any questions or require assistance, please feel free to contact us. </p>
      <p>We appreciate your continued support and enthusiasm. We look forward to working together to make this year's contest a remarkable success.</p>
      <p>Below are the details of your institution. Kindly verify, as these details will be used in all official documents: </p>
      <br/>
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
      <p>Innovative Learning - KSF Pakistan</p>
      <p><b>Office: </b> 042-37180505 | 042-37180506</p>
      <p><b>Whatsapp: </b>0333-2111399 | 0321-8403033 | 0319-5080077</p>
      <p><b>Address: </b>1st Floor, Plaza 114, Main Boulevard, Phase 6, D.H.A Lahore</p>
      <a href="www.kangaroopakistan.org" target="#">www.kangaroopakistan.org</a>
`,
    };

    try {
      // await emailManager.sendEmail(mailOptions);
      await transporter.sendMail(mailOptions);
      return NextResponse.json("Email sent Successfully", { status: 200 });
    } catch (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        { message: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in GET function:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
