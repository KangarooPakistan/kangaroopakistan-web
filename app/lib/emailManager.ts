import nodemailer from "nodemailer";
import { SendMailOptions } from "nodemailer";
import fs from "fs/promises";
import path from "path";

interface EmailAccount {
  email: string;
  password: string;
  sentCount: number;
  lastResetDate: Date;
}

class EmailManager {
  private emailAccounts: EmailAccount[];
  private currentAccountIndex: number;
  private dailyLimit: number;
  private storageFile: string;

  constructor() {
    this.storageFile = path.join(process.cwd(), "email_counts.json");

    this.emailAccounts = [
      {
        email: process.env.NODEMAILER_EMAIL1 || "",
        password: process.env.NODEMAILER_PASS1 || "",
        sentCount: 0,
        lastResetDate: new Date(),
      },
      {
        email: process.env.NODEMAILER_EMAIL2 || "",
        password: process.env.NODEMAILER_PASS2 || "",
        sentCount: 0,
        lastResetDate: new Date(),
      },
    ].filter((account) => account.email && account.password); // Filter out accounts with empty credentials

    if (this.emailAccounts.length === 0) {
      throw new Error("No valid email accounts configured");
    }

    this.currentAccountIndex = 0;
    this.dailyLimit = 500;
    this.loadCounts();
  }
  private async loadCounts() {
    try {
      // Check if the file exists
      try {
        await fs.access(this.storageFile);
      } catch (error) {
        // If the file doesn't exist, create it with default values
        const defaultCounts = this.emailAccounts.reduce((acc, account) => {
          acc[account.email] = {
            sentCount: 0,
            lastResetDate: new Date().toISOString(),
          };
          return acc;
        }, {} as { [key: string]: { sentCount: number; lastResetDate: string } });

        await fs.writeFile(
          this.storageFile,
          JSON.stringify(defaultCounts, null, 2)
        );
        console.log("Created new email_counts.json file with default values");
        return; // Exit the method as we've just created a new file with default values
      }

      // If the file exists, read and parse it
      const data = await fs.readFile(this.storageFile, "utf8");
      const counts = JSON.parse(data);
      this.emailAccounts.forEach((account) => {
        if (counts[account.email]) {
          account.sentCount = counts[account.email].sentCount;
          account.lastResetDate = new Date(counts[account.email].lastResetDate);
        }
      });
      console.log("Loaded email counts from file");
    } catch (error) {
      console.error("Error loading email counts:", error);
    }
  }
  private async saveCounts() {
    const counts = this.emailAccounts.reduce(
      (
        acc: { [key: string]: { sentCount: number; lastResetDate: string } },
        account
      ) => {
        acc[account.email] = {
          sentCount: account.sentCount,
          lastResetDate: account.lastResetDate.toISOString(),
        };
        console.log("countsssss");
        console.log(acc);
        return acc;
      },
      {}
    );

    try {
      await fs.writeFile(this.storageFile, JSON.stringify(counts, null, 2));
    } catch (error) {
      console.error("Error saving email counts:", error);
    }
  }

  private createTransporter(account: EmailAccount): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 587,
      secure: false,
      auth: {
        user: account.email,
        pass: account.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  public getCurrentAccount(): EmailAccount {
    return this.emailAccounts[this.currentAccountIndex];
  }

  private switchAccount(): void {
    this.currentAccountIndex =
      (this.currentAccountIndex + 1) % this.emailAccounts.length;
  }

  private async resetIfNecessary(account: EmailAccount): Promise<void> {
    const now = new Date();
    const pakistanTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );

    if (
      pakistanTime.getHours() >= 18 &&
      account.lastResetDate.getDate() !== pakistanTime.getDate()
    ) {
      account.sentCount = 0;
      account.lastResetDate = pakistanTime;
      console.log(
        `Reset counter for ${account.email} at ${pakistanTime.toISOString()}`
      );
      await this.saveCounts();
    }
  }

  public async sendEmail(
    options: SendMailOptions
  ): Promise<nodemailer.SentMessageInfo> {
    for (let i = 0; i < this.emailAccounts.length; i++) {
      let currentAccount = this.getCurrentAccount();
      this.resetIfNecessary(currentAccount);

      if (currentAccount.sentCount >= this.dailyLimit) {
        this.switchAccount();
        continue;
      }

      if (!currentAccount.email || !currentAccount.password) {
        console.error(
          `Invalid credentials for account at index ${this.currentAccountIndex}`
        );
        this.switchAccount();
        continue;
      }

      const transporter = this.createTransporter(currentAccount);
      const fullMailOptions: SendMailOptions = {
        ...options,
        from: currentAccount.email,
      };

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const info = await transporter.sendMail(fullMailOptions);
          currentAccount.sentCount++;
          await this.saveCounts();

          console.log(
            `Email sent successfully from ${currentAccount.email} & sentCount ${
              currentAccount.sentCount
            }. Attempt: ${attempt + 1}`
          );
          return info;
        } catch (error) {
          console.error(
            `Error sending email from ${currentAccount.email}. Attempt: ${
              attempt + 1
            }`,
            error
          );
          if (attempt === 2) {
            console.log(`Switching to next account after 3 failed attempts`);
            break;
          }
        }
      }

      this.switchAccount();
    }

    throw new Error("Failed to send email from all accounts");
  }

  public getEmailCounts(): { [email: string]: number } {
    return this.emailAccounts.reduce((acc, account) => {
      acc[account.email] = account.sentCount;
      return acc;
    }, {} as { [email: string]: number });
  }

  public getTotalEmailsSent(): number {
    return this.emailAccounts.reduce(
      (total, account) => total + account.sentCount,
      0
    );
  }

  public getDailyLimit(): number {
    return this.dailyLimit;
  }
}

const emailManager = new EmailManager();
export default emailManager;
