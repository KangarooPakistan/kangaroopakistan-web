import { NextResponse, NextRequest } from "next/server";
import { db } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

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
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    console.log(transporter);

    const resetLink = `https://enrollments.kangaroopakistan.org/new-password/${token}`;

    await transporter.sendMail({
      from: "info@kangaroopakistan.org",
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 30 minutes.</p>`,
    });
    console.log("-------------------");

    return NextResponse.json({
      message: "If the email is registered, a reset link has been sent.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
