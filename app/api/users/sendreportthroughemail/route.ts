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
  try {
    const { pdfData, schoolId, contestId } = await request.json();
    console.log;
    validateAwsCredentials();

    const schoolDetails = await db.user.findFirst({
      where: { schoolId: parseInt(schoolId) },
    });

    if (!schoolDetails) {
      return NextResponse.json(
        { error: "School details not found" },
        { status: 404 }
      );
    }
    const aminaEmail = await db.user.findFirst({
      where: {
        schoolId: 814,
      },
      select: {
        email: true,
      },
    });

    if (!schoolDetails.email) {
      return NextResponse.json(
        { error: "No email address found for school" },
        { status: 400 }
      );
    }

    const contestData = await db.contest.findUnique({
      where: { id: contestId },
    });

    if (!contestData) {
      return NextResponse.json(
        { error: "Contest data not found" },
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
        { error: "Sender email not configured" },
        { status: 500 }
      );
    }

    // Generate a boundary string for multipart message
    const boundary = "NextPart_" + Date.now().toString(16);
    const startDateString = contestData?.endDate;
    let year = startDateString ? new Date(startDateString).getFullYear() : 0;

    console.log(schoolDetails.email);
    const emailBody = `Dear Principal,<br/><br/>

We are delighted to announce the results of the ${contestName} ${year} and extend our heartfelt congratulations to all participating schools and students for their dedication and outstanding performance. Attached, you will find the official results for your review.<br/><br/>

Thank you for your participation in ${contestNameShort} ${year}. We look forward to your continued engagement and future achievements!<br/><br/><br/>

<b>Best regards,</b>
Team ${contestNameShort}<br/>
Innovative Learning | Inventive Learning - KSF Pakistan<br/><br/>

<b>Office</b>: 042-37180505 | 042-37180506<br/>
<b>Whatsapp</b>: 0333-2111399 | 0321-8403033 | 0319-5080077<br/>
<b>Address</b>: 1st Floor, Plaza 114, Main Boulevard, Phase 6, D.H.A Lahore <br/>
www.kangaroopakistan.org`;

    // Construct email headers
    const headers = [
      `From: Kangaroo Pakistan <${fromEmail}>`,
      `To: ${schoolDetails.email} ${schoolDetails.p_email} ${schoolDetails.c_email} ${aminaEmail}`,
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

    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: new Uint8Array(Buffer.from(headers, "utf-8")),
      },
    });

    await ses.send(command);

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
