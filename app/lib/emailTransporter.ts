import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 587,
  secure: false, // Use SSL
  connectionTimeout: 100000,
  auth: {
    user: "info@kangaroopakistan.org",
    pass: "Alphabravo@2347",
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.3",
  },
  debug: true, // Enable debug logs
});

export default transporter;
