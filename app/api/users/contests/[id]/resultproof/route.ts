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
