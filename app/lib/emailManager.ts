// emailManager.ts

import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

interface EmailAccount {
  email: string;
  password: string;
  sentCount: number;
}

class EmailManager {
  private emailAccounts: EmailAccount[];
  private currentAccountIndex: number;
  private dailyLimit: number;

  constructor() {
    this.emailAccounts = [
      {
        email: process.env.NODEMAILER_EMAIL1 || "",
        password: process.env.NODEMAILER_PASS1 || "",
        sentCount: 0,
      },
      {
        email: process.env.NODEMAILER_EMAIL2 || "",
        password: process.env.NODEMAILER_PASS2 || "",
        sentCount: 0,
      },
    ];
    this.currentAccountIndex = 0;
    this.dailyLimit = 490;
  }

  private createTransporter(account: EmailAccount): Transporter {
    return nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 587,
      secure: false,
      connectionTimeout: 30000,
      auth: {
        user: account.email,
        pass: account.password,
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
  }

  public getCurrentAccount(): EmailAccount {
    return this.emailAccounts[this.currentAccountIndex];
  }

  private switchAccount(): void {
    this.currentAccountIndex = (this.currentAccountIndex + 1) % this.emailAccounts.length;
  }

  public async sendEmail(options: SendMailOptions): Promise<nodemailer.SentMessageInfo> {
    let currentAccount = this.getCurrentAccount();

    if (currentAccount.sentCount >= this.dailyLimit) {
      this.switchAccount();
      currentAccount = this.getCurrentAccount();

      if (currentAccount.sentCount >= this.dailyLimit) {
        throw new Error("Daily limit reached for all email accounts");
      }
    }

    const transporter = this.createTransporter(currentAccount);

    try {
      const info = await transporter.sendMail(options);
      currentAccount.sentCount++;
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  public resetCounters(): void {
    this.emailAccounts.forEach(account => account.sentCount = 0);
  }
}

const emailManager = new EmailManager();
export default emailManager;