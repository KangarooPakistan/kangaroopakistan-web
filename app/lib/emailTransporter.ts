import nodemailer from "nodemailer";
console.log("process.env.NODEMAILER_EMAIL");
console.log(process.env.AWS_SMTP_USER);
console.log(process.env.AWS_SMTP_PASS);

const transporter = nodemailer.createTransport({
  // host: "smtpout.secureserver.net",
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  secure: false,
  connectionTimeout: 60000, // Increased to 60 seconds
  socketTimeout: 120000, // Increased to 120 seconds

  auth: {
    user: process.env.AWS_SMTP_USER,
    pass: process.env.AWS_SMTP_PASS,
  },

  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  greetingTimeout: 30000,

  pool: true,
  maxConnections: 1,
  maxMessages: 1,
  debug: true,
});

export default transporter;
