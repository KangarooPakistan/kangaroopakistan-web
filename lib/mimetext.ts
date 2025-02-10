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
