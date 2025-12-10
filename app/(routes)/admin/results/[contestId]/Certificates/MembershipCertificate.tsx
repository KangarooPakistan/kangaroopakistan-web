import { PDFDocument, PDFForm, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Define the PrincipalDetails type
export type PrincipalDetails = {
  schoolId: number;
  schoolName: string;
  p_Name: string;
};

export type PrincipalDetailsList = PrincipalDetails[];

// Load custom fonts for PDF-lib
const loadCustomFonts = async (pdfDoc: PDFDocument) => {
  pdfDoc.registerFontkit(fontkit);

  const fonts: { [key: string]: any } = {};

  try {
    // Load Arabic font - Almarai (matching react-pdf)
    const almaraiBytes = await fetch("/fonts/IBM/Almarai-Bold.ttf").then(
      (res) => res.arrayBuffer()
    );
    fonts.almarai = await pdfDoc.embedFont(almaraiBytes);
  } catch (error) {
    console.warn("Failed to load Almarai font:", error);
  }

  try {
    // Load English decorative font - Snell Roundhand (matching react-pdf)
    const snellBytes = await fetch("/fonts/malayalam-mn-bold.ttf").then((res) =>
      res.arrayBuffer()
    );
    fonts.snell = await pdfDoc.embedFont(snellBytes);
  } catch (error) {
    console.warn("Failed to load Snell Roundhand font:", error);
  }

  try {
    // Load Ubuntu font (matching react-pdf)
    const ubuntuBytes = await fetch("/fonts/Ubuntu-Bold.ttf").then((res) =>
      res.arrayBuffer()
    );
    fonts.ubuntu = await pdfDoc.embedFont(ubuntuBytes);
  } catch (error) {
    console.warn("Failed to load Ubuntu font:", error);
  }

  return fonts;
};

// Utility function to detect Arabic text (matching react-pdf)
const isArabicText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    text
  );
};

// Utility function to detect Arabic text for school name (simplified version from react-pdf)
const isSchoolNameArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

// Calculate font size for coordinator name (matching react-pdf SmartText logic)
const getCoordinatorNameFontSize = (
  text: string,
  isArabic: boolean
): number => {
  const textLength = text.length;
  return isArabic ? (textLength < 30 ? 24 : 22) : textLength < 30 ? 26 : 20;
};

const getSchoolNameFontSize = (text: string, isArabic: boolean): number => {
  const textLength = text.length;
  return isArabic ? (textLength < 30 ? 26 : 22) : textLength < 30 ? 24 : 20;
};

// Load your existing PDF template
const loadCertificateTemplate = async (): Promise<Uint8Array> => {
  const response = await fetch("/templates/membership_certificates.pdf");
  if (!response.ok) {
    throw new Error("Failed to load certificate template");
  }
  return new Uint8Array(await response.arrayBuffer());
};
const processSchoolNameText = (schoolName: string): string => {
  return schoolName
    .replace(/(\([^)]+\))/g, (match) => {
      // Extract text inside parentheses, convert to uppercase, and keep parentheses
      const innerText = match.slice(1, -1).toUpperCase();
      return `(${innerText})`;
    })
    .replace(/([^\(]+)(?=\s*\()/g, (match) => {
      // Convert the part before parentheses to title case instead of lowercase
      return toTitleCase(match.trim());
    });
};

// Also create a specialized title case function that preserves uppercase parentheses content
const toTitleCasePreservingParentheses = (text: string): string => {
  return text.replace(/\b\w+/g, (word) => {
    // Check if this word is inside parentheses by looking at the context
    // If it's already uppercase and short, it's likely an acronym in parentheses
    if (word === word.toUpperCase() && word.length <= 5) {
      return word; // Keep uppercase acronyms
    }
    // Otherwise apply normal title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

// Generate certificate using your existing PDF template
export async function generateMembershipCertificate(
  principal: PrincipalDetails,
  templateBytes?: Uint8Array
): Promise<Uint8Array> {
  let pdfDoc: PDFDocument;

  if (templateBytes) {
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    const template = await loadCertificateTemplate();
    pdfDoc = await PDFDocument.load(template);
  }

  // Load custom fonts
  const fonts = await loadCustomFonts(pdfDoc);

  // Get the first page (assuming single page certificate)
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Get page dimensions
  const { width, height } = firstPage.getSize();
  console.log(`Page dimensions: ${width} x ${height}`);

  // Prepare text values with safe defaults
  const coordinatorName = principal.p_Name || "Principal Name";
  const schoolName = principal.schoolName || "School Name";
  const schoolId = principal.schoolId || 0;

  // Check if text is Arabic (matching react-pdf logic)
  const isCNameArabic = isArabicText(coordinatorName);
  const isSchoolNameArabicText = isSchoolNameArabic(schoolName);

  // Calculate font sizes (matching react-pdf logic)
  const nameFontSize = getCoordinatorNameFontSize(
    coordinatorName,
    isCNameArabic
  );
  const schoolNameFontSize = getSchoolNameFontSize(
    schoolName,
    isSchoolNameArabicText
  );
  const nameY = height - (isCNameArabic ? 240 : 240);

  // Select appropriate fonts (matching react-pdf font selection)
  const nameFont = isCNameArabic
    ? fonts.almarai || fonts.ubuntu // Fallback to ubuntu if almarai fails
    : fonts.Malayalam || fonts.ubuntu; // Fallback to ubuntu if snell fails

  // Calculate text width for centering
  const nameWidth = nameFont
    ? nameFont.widthOfTextAtSize(toTitleCase(coordinatorName), nameFontSize)
    : coordinatorName.length * (nameFontSize * 0.6);
  const schoolIdMarginTop = isCNameArabic ? 35 : 40; // matching original spacing
  const schoolIdY = nameY - schoolIdMarginTop;

  const wrapText = (
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] => {
    if (!font) {
      // Fallback for when font is not available
      const wordsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
      const words = text.split(" ");
      const lines: string[] = [];

      for (let i = 0; i < words.length; i += wordsPerLine) {
        lines.push(words.slice(i, i + wordsPerLine).join(" "));
      }

      return lines.length > 0 ? lines : [text];
    }

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Single word is too long, add it anyway
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  };

  const schoolIdText = `School ID: ${schoolId}`;
  const schoolIdWidth = fonts.ubuntu
    ? fonts.ubuntu.widthOfTextAtSize(schoolIdText, 16)
    : schoolIdText.length * (16 * 0.6); // Fallback estimation

  const schoolNameMarginTop = isSchoolNameArabicText ? 32 : 35; // matching original spacing
  const schoolNameY = schoolIdY - schoolNameMarginTop;

  // Select school name font (matching react-pdf font selection)
  const schoolNameFont = isSchoolNameArabicText
    ? fonts.almarai || fonts.ubuntu // Use Almarai for Arabic
    : fonts.ubuntu || nameFont; // Use Ubuntu for English

  // Define maximum width for text wrapping (matching react-pdf width: 520px)
  const maxTextWidth = 520;

  const processedSchoolName = processSchoolNameText(schoolName);

  // Wrap the school name text
  const wrappedLines = wrapText(
    processedSchoolName,
    schoolNameFont,
    schoolNameFontSize,
    maxTextWidth
  );

  // Calculate line height (typically 1.2 times font size)
  const lineHeight = schoolNameFontSize * 1.2;

  // Calculate starting Y position to center the text block vertically
  const totalTextHeight = (wrappedLines.length - 1) * lineHeight;
  const startY = schoolNameY + totalTextHeight / 2;

  // Draw each line of the school name
  wrappedLines.forEach((line, index) => {
    const lineWidth = schoolNameFont
      ? schoolNameFont.widthOfTextAtSize(line, schoolNameFontSize)
      : line.length * (schoolNameFontSize * 0.6);

    const lineY = startY - index * lineHeight;

    firstPage.drawText(line, {
      x: (width - lineWidth) / 2, // Center horizontally
      y: lineY,
      size: schoolNameFontSize,
      font: schoolNameFont,
      color: rgb(123 / 255, 56 / 255, 113 / 255),
    });
  });

  return await pdfDoc.save();
}
// Utility function to convert text to Title Case
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Batch generation function (keeping existing logic)
export async function generateMembershipCertificates(
  principals: PrincipalDetailsList
): Promise<
  {
    blob: Blob;
    principalName: string;
    schoolId: number;
    schoolName: string;
  }[]
> {
  const results: {
    blob: Blob;
    principalName: string;
    schoolId: number;
    schoolName: string;
  }[] = [];

  // Load template once for efficiency
  const templateBytes = await loadCertificateTemplate();

  for (const principal of principals) {
    // Enhanced validation (matching react-pdf data filtering)
    if (
      !principal ||
      typeof principal !== "object" ||
      !principal.p_Name ||
      !principal.schoolId ||
      !principal.schoolName
    ) {
      console.warn("Skipping invalid coordinator:", principal);
      continue;
    }

    try {
      const pdfBytes = await generateMembershipCertificate(
        principal,
        templateBytes
      );
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      results.push({
        blob,
        principalName: principal.p_Name.trim(),
        schoolId: principal.schoolId,
        schoolName: principal.schoolName.trim(),
      });

      console.log(`✓ Generated certificate for ${principal.p_Name}`);
    } catch (error) {
      console.error(
        `✗ Failed to generate certificate for ${principal.p_Name}:`,
        error
      );
    }

    // Small delay to prevent overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return results;
}
