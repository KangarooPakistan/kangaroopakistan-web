import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { SendMailOptions } from "nodemailer";
import emailManager from "@/app/lib/emailManager";
interface UserResetData {
  email: string;
}
export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email } = reqBody;
    console.log(email);
    const userExists = await db.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log(userExists);
    if (!userExists) {
      return NextResponse.json(
        { error: "This email is not registered" },
        { status: 400 }
      );
    }

    const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, "");
    console.log(token);

    // Token expires in 30 minutes
    const resetToken = await db.reset.create({
      data: {
        userId: userExists.id,
        token: token,
      },
    });
    console.log(resetToken);

    const resetLink = `https://enrollments.kangaroopakistan.org/new-password/${token}`;
    const mailOptions: SendMailOptions = {
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 30 minutes.</p>`,
    };

    try {
      await emailManager.sendEmail(mailOptions);
      return NextResponse.json(
        "If the email is registered, a reset link has been sent.",
        { status: 200 }
      );
    } catch (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
