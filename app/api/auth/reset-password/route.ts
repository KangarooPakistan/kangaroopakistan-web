// // pages/api/auth/forgot-password.js
// import nodemailer from 'nodemailer';
// import { db } from "@/app/lib/prisma";

// import { v4 as uuidv4 } from 'uuid';

// export default async function handler(req, res) {
//   const { email } = req.body;

//   // Check if the email exists in the database
//   const user = await db.user.findUnique({
//     where: {
//       email,
//     },
//   });

//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }

//   // Create a unique reset token
//   const resetToken = uuidv4();
//   const expiryDate = new Date(Date.now() + 30 * 60 * 1000); // Token expires in 30 minutes

//   // Store token in the database
//   await prisma.passwordReset.create({
//     data: {
//       email,
//       token: resetToken,
//       expiryDate,
//       userId: user.id,
//     },
//   });

//   // Set up nodemailer transport
//   const transporter = nodemailer.createTransport({
//     // Configuration options (e.g., for Gmail, SMTP)
//   });

//   // Send email with reset token
//   await transporter.sendMail({
//     from: 'your-email@example.com',
//     to: email,
//     subject: 'Password Reset',
//     html: `Please click the following link to reset your password: <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>`,
//   });

//   res.status(200).json({ message: 'Email sent' });
// }
