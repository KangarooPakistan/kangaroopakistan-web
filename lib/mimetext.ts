// lib/mimetext.ts
interface MimeMessage {
  setHeader(name: string, value: string): void;
  addMessage(options: { contentType: string; data: string }): void;
  addAttachment(options: {
    filename: string;
    contentType: string;
    data: string;
    encoding?: string;
  }): void;
  asRaw(): string;
}

// Re-export the actual mimetext module with our types
import { createMimeMessage as originalCreateMimeMessage } from "mimetext";
export const createMimeMessage = originalCreateMimeMessage as () => MimeMessage;
