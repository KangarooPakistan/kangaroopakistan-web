import nodemailer from "nodemailer";
console.log(process.env.NODEMAILER_EMAIL);
console.log(process.env.NODEMAILER_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  connectionTimeout: 30000, // Reduced to 30 seconds
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },

  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
  greetingTimeout: 30000,
  socketTimeout: 60000,
  pool: true,
  maxConnections: 1,
  maxMessages: 1,
  debug: true,
});

export default transporter;
