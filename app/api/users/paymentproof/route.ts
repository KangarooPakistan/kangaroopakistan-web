import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { getEmailSignature } from "@/app/lib/emailTemplates";
import { validateAwsCredentials } from "@/app/lib/awsValidation";

const ses = new SESClient({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_KEYID!,
  },
});

export async function POST(request: Request) {
  try {
    // Validate AWS credentials including SMTP email
    validateAwsCredentials();
    
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
       
       console.log(aminaEmail?.email);
       // console.log(ebdullahEmail?.email);
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
   
       const startDateString = contestDate?.endDate;
       let year = startDateString ? new Date(startDateString).getFullYear() : 0;
   
       const fromEmail = process.env.AWS_SMTP_EMAIL;
       if (!fromEmail) {
         return NextResponse.json(
           {
             error: "Sender email not configured",
           },
           { status: 500 }
         );
       }
       const htmlContent = `<p><b>Dear Sir / Madam,</b></p>
         <p>Thank you for registering your school for the ${contestName} ${year}. We have successfully received your registration details and are currently in the process of verifying your payment to complete the registration procedure. </p>
         <p>If there are any discrepancies or additional information required, our team will reach out to you promptly. In the meantime, if you have any questions or require assistance, please feel free to contact us. </p>
         <p>We appreciate your continued support and enthusiasm. We look forward to working together to make this year's contest a remarkable success.</p>
         <p>Below are the details of your institution. Kindly verify, as these details will be used in all official documents: </p>
         <br/>
         <p> School ID: ${schoolDetails?.schoolId}</p>
         <p> School Name: ${schoolDetails?.schoolName}</p>
         <p> School Address: ${schoolDetails?.schoolAddress}</p>
         <p> School Account Details: ${schoolDetails?.bankTitle}</p>
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
   
         ${getEmailSignature(contestNameShort)}
         `;
   
       // Prepare email recipients
       const emailAddresses = [
           schoolDetails?.email || "",
           schoolDetails?.p_email || "",
           schoolDetails?.c_email || "",
           "valiantsina@kangaroopakistan.org",
           "kainatkiranrashid2@gmail.com"
           
       ].filter((email) => email);
   
       if (emailAddresses.length === 0) {
         return NextResponse.json(
           {
             error: "No valid email addresses found",
           },
           { status: 400 }
         );
       }
       const headers = [
         `From: "Kangaroo Pakistan Info" <${fromEmail}>`,
         `To: ${emailAddresses.join(", ")}`,
         `Subject: Registration Received - ${contestNameShort} ${year}`,
         "MIME-Version: 1.0",
         "Content-Type: text/html; charset=utf-8",
         "",
         htmlContent,
       ].join("\r\n");
       try {
         const command = new SendRawEmailCommand({
           RawMessage: {
             Data: new Uint8Array(Buffer.from(headers, "utf-8")),
           },
         });
   
         await ses.send(command);
   
         return NextResponse.json({
           message: "Email sent successfully",
           sentTo: emailAddresses,
         });
       } catch (sesError: any) {
         console.error("Failed to send email:", sesError);
         const failedEmails: Record<string, string> = {};
         emailAddresses.forEach((email) => {
           failedEmails[email] = sesError.message || "SES sending failed";
         });
   
         return NextResponse.json(
           {
             error: "Failed to send email",
             failedEmails,
             technicalError: sesError.message,
           },
           { status: 500 }
         );
       }
  } catch (error: any) {
    // Handle errors and return an appropriate response
    return NextResponse.json(
      { message: "Error while adding payment proof " },
      { status: 500 }
    );
  }
}
