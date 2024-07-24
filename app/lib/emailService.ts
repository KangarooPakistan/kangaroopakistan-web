// // emailService.ts

// import emailManager from './emailManager';
// import { SendMailOptions } from 'nodemailer';

// export async function sendEmail(options: SendMailOptions): Promise<void> {
//   try {
//     const info = await emailManager.sendEmail({
//       from: emailManager.getCurrentAccount().email,
//       ...options
//     });
//     console.log("Email sent: ", info.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// }