import { NextResponse } from "next/server";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { db } from "@/app/lib/prisma";

const ses = new SESClient({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEYID!,
    secretAccessKey: process.env.AWS_SECRET_KEYID!,
  },
});

function validateAwsCredentials() {
  if (!process.env.AWS_BUCKET_REGION) {
    throw new Error("AWS_REGION is not configured");
  }
  if (!process.env.AWS_ACCESS_KEYID) {
    throw new Error("AWS_ACCESS_KEY_ID is not configured");
  }
  if (!process.env.AWS_SECRET_KEYID) {
    throw new Error("AWS_SECRET_ACCESS_KEY is not configured");
  }
}

export async function POST(request: Request) {
  let schoolDetails: any = null;
  let aminaEmail: any = null;

  try {
    const { pdfData, schoolId, contestId } = await request.json();
    validateAwsCredentials();

    schoolDetails = await db.user.findFirst({
      where: { schoolId: parseInt(schoolId) },
      select: {
        email: true,
        p_email: true,
        c_email: true,
      },
    });

    if (!schoolDetails) {
      return NextResponse.json(
        {
          error: "School details not found",
          failedEmails: {
            school: "School details not found in database",
          },
        },
        { status: 404 }
      );
    }

    aminaEmail = await db.user.findFirst({
      where: {
        schoolId: 814,
      },
      select: {
        email: true,
      },
    });

    const contestData = await db.contest.findUnique({
      where: { id: contestId },
    });

    if (!contestData) {
      return NextResponse.json(
        {
          error: "Contest data not found",
          failedEmails: {
            [schoolDetails.email || "primary"]: "Contest data not found",
            [schoolDetails.p_email || "p_email"]: "Contest data not found",
            [schoolDetails.c_email || "c_email"]: "Contest data not found",

            // [aminaEmail?.email || "amina_email"]: "Contest data not found",
          },
        },
        { status: 404 }
      );
    }

    let contestName, contestNameShort;
    switch (contestData?.contestCh) {
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

    const fromEmail = process.env.AWS_SMTP_EMAIL;
    if (!fromEmail) {
      return NextResponse.json(
        {
          error: "Sender email not configured",
          failedEmails: {
            [schoolDetails.email || "primary"]:
              "Sender email configuration missing",
            [schoolDetails.p_email || "p_email"]:
              "Sender email configuration missing",
            [schoolDetails.c_email || "c_email"]:
              "Sender email configuration missing",
          },
        },
        { status: 500 }
      );
    }

    const boundary = "NextPart_" + Date.now().toString(16);
    const startDateString = contestData?.endDate;
    let year = startDateString ? new Date(startDateString).getFullYear() : 0;

    const emailBody = `Dear Principal,<br/><br/>

We are pleased to announce the results of the ${contestName} ${year}. Congratulations to all participating schools and students for their dedication and outstanding performance!.<br/><br/>

Please find attached the official results for your review.<br/>
Thank you for your continued  participation in ${contestNameShort} ${year}. We look forward to your ongoing engagement and future achievements.!<br/><br/><br/>

<b>Best regards,</b><br/>
Team ${contestNameShort}<br/>
<i>Innovative Learning | Inventive Learning - KSF Pakistan</i><br/><br/>


<b>Office</b>: 042-37180505 | 042-37180506<br/>
<b>Whatsapp</b>: 0333-2111399 | 0321-8403033 | 0319-5080077<br/>
<b>Address</b>: 1st Floor, Plaza 114, Main Boulevard, Phase 6, D.H.A Lahore <br/>
www.kangaroopakistan.org`;

    const emailAddresses = [
      "wajiha.farhat@gmail.com",
      // schoolDetails.email,
      // schoolDetails.p_email,
      // schoolDetails.c_email,
      // "valiantsina@kangaroopakistan.org",
      "kainatkiranrashid2@gmail.com",
    ].filter((email) => email);

    if (emailAddresses.length === 0) {
      return NextResponse.json(
        {
          error: "No valid email addresses found",
          failedEmails: {
            [schoolDetails.email || "primary"]: "Email not provided",
            [schoolDetails.p_email || "p_email"]: "Email not provided",
            [schoolDetails.c_email || "c_email"]: "Email not provided",
            // [aminaEmail?.email || "amina_email"]: "Email not provided",
          },
        },
        { status: 400 }
      );
    }

    const headers = [
      `From: Kangaroo Pakistan <${fromEmail}>`,
      `To: ${emailAddresses.join(", ")}`,
      `Subject: ${contestNameShort} ${year} Results announced `,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      `${emailBody}`,
      "",
      `--${boundary}`,
      "Content-Type: application/pdf",
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="School_${schoolId}_Results.pdf"`,
      "",
      pdfData,
      "",
      `--${boundary}--`,
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
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        technicalError: error.message,
        failedEmails: {
          [schoolDetails?.email || "primary"]: error.message,
          [schoolDetails?.p_email || "p_email"]: error.message,
          [schoolDetails?.c_email || "c_email"]: error.message,
          // [aminaEmail?.email || "amina_email"]: error.message,
        },
      },
      { status: 500 }
    );
  }
}
