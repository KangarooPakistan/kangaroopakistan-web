import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office364.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
  connectionTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

export default transporter;
