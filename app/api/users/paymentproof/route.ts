import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

import transporter from "@/app/lib/emailTransporter";
import { SendMailOptions } from "nodemailer";
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
    const registrations = await db.student.findMany({
      where: { registrationId: registrationId },
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
    console.log(aminaEmail?.email);
    console.log(ebdullahEmail?.email);
    const totalStudents = await db.student.findMany({
      where: { registrationId: registrationId },
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
    const mailOptions: SendMailOptions = {
      from: process.env.AWS_SMTP_EMAIL,
      to: [
        schoolDetails?.email || "",
        schoolDetails?.p_email || "",
        schoolDetails?.c_email || "",
        aminaEmail?.email || "",
        ebdullahEmail?.email || "",
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
            "Image was added successfully but could not create Log,. There was some error while creating log of this activity.",
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
