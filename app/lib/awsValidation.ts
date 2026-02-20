// AWS Credentials Validation Utility

export function validateAwsCredentials() {
  // Validate AWS Region
  if (!process.env.AWS_BUCKET_REGION) {
    console.error("[AWS Validation] AWS_BUCKET_REGION is not configured");
    throw new Error("Email service is not configured correctly. Please try again later.");
  }

  // Validate AWS Access Key ID
  if (!process.env.AWS_ACCESS_KEYID) {
    console.error("[AWS Validation] AWS_ACCESS_KEYID is not configured");
    throw new Error("Email service is not configured correctly. Please try again later.");
  }

  // Validate AWS Secret Access Key
  if (!process.env.AWS_SECRET_KEYID) {
    console.error("[AWS Validation] AWS_SECRET_KEYID is not configured");
    throw new Error("Email service is not configured correctly. Please try again later.");
  }

  // Validate AWS SMTP Email
  if (!process.env.AWS_SMTP_EMAIL) {
    console.error("[AWS Validation] AWS_SMTP_EMAIL is not configured");
    throw new Error("Email service is not configured correctly. Please try again later.");
  }

  // Validate that email contains "kangaroopakistan"
  const email = process.env.AWS_SMTP_EMAIL.toLowerCase();
  if (!email.includes("kangaroopakistan")) {
    throw new Error("Email service is not configured correctly. Please try again later.");
  }
}

// Optional: Validate email format
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Optional: Get validated SMTP email
export function getValidatedSmtpEmail(): string {
  validateAwsCredentials();
  return process.env.AWS_SMTP_EMAIL!;
}
