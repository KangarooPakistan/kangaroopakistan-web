import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";

import transporter from "@/app/lib/emailTransporter";
import { SendMailOptions } from "nodemailer";
export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const { contestId, imageUrl, currentUserEmail } = reqBody;
    const paymentProof = await db.resultProof.create({
      data: {
        imageUrl: imageUrl,
        contestId: contestId,
      },
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
    // console.log(ebdullahEmail?.email);

    // let tableHtml = `<table style="border: 1px solid #ddd; border-collapse: collapse;">
    //   <thead>
    //     <tr>
    //       <th style="border: 1px solid #ddd; padding: 5px 10px;">Roll Number</th>
    //       <th style="border: 1px solid #ddd; padding: 5px 10px;">Student Name</th>
    //       <th style="border: 1px solid #ddd; padding: 5px 10px;">Father Name</th>
    //       <th style="border: 1px solid #ddd; padding: 5px 10px;">Class</th>
    //       <th style="border: 1px solid #ddd; padding: 5px 10px;">Level</th>
    //     </tr>
    //   </thead>
    //   <tbody>`;

    // for (const student of totalStudents) {
    //   tableHtml += `<tr>
    //     <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.rollNumber}</td>
    //     <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.studentName}</td>
    //     <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.fatherName}</td>
    //     <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.class}</td>
    //     <td style="border: 1px solid #ddd; padding: 5px 10px;">${student.level}</td>
    //   </tr>`;
    // }

    // tableHtml += `</tbody></table>`;

    const mailOptions: SendMailOptions = {
      from: process.env.AWS_SMTP_EMAIL,
      to: [
        aminaEmail?.email || "",
        // ebdullahEmail?.email || "",
      ],

      subject: `Registration Received -`,
      html: `<p><b>Dear Sir / Madam,</b></p>
      <p>Thank you for registering your school for the . We have successfully received your registration details and are currently in the process of verifying your payment to complete the registration procedure. </p>
      <p>If there are any discrepancies or additional information required, our team will reach out to you promptly. In the meantime, if you have any questions or require assistance, please feel free to contact us. </p>
      <p>We appreciate your continued support and enthusiasm. We look forward to working together to make this year's contest a remarkable success.</p>
      <p>Below are the details of your institution. Kindly verify, as these details will be used in all official documents: </p>
      <br/>
      
      <p>Innovative Learning - KSF Pakistan</p>
      <p><b>Office: </b> 042-37180505 | 042-37180506</p>
      <p><b>Whatsapp: </b>0333-2111399 | 0321-8403033 | 0319-5080077</p>
      <p><b>Address: </b>1st Floor, Plaza 114, Main Boulevard, Phase 6, D.H.A Lahore</p>
      <a href="www.kangaroopakistan.org" target="#">www.kangaroopakistan.org</a>
      `,
    };

    // try {
    //   // await emailManager.sendEmail(mailOptions);
    //   await transporter.sendMail(mailOptions);
    //   return NextResponse.json("Email sent Successfully", { status: 200 });
    // } catch (error) {
    //   console.error("Failed to send email:", error);
    //   return NextResponse.json(
    //     { message: "Failed to send email" },
    //     { status: 500 }
    //   );
    // }

    return NextResponse.json(paymentProof, { status: 200 });
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json(
      { message: "Error while adding payment proof " },
      { status: 500 }
    );
  }
}
