import { PDFDocument, PDFForm, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export type CoordinatorDetails = {
  schoolId: number;
  schoolName: string;
  c_Name: string;
};

export type CoordinatorDetailsList = CoordinatorDetails[];

// Load custom fonts for PDF-lib with per-session font byte caching
// so we do not hit the network on every certificate generation.
type CoordinatorFontBytes = {
  almarai?: ArrayBuffer;
  snell?: ArrayBuffer;
  ubuntu?: ArrayBuffer;
  avenir?: ArrayBuffer;
};

let coordinatorFontBytesCache: CoordinatorFontBytes | null = null;

const loadCoordinatorFontBytesOnce =
  async (): Promise<CoordinatorFontBytes> => {
    if (coordinatorFontBytesCache) return coordinatorFontBytesCache;

    const result: CoordinatorFontBytes = {};

    try {
      const almaraiRes = await fetch("/fonts/IBM/Almarai-Bold.ttf");
      if (almaraiRes.ok) {
        result.almarai = await almaraiRes.arrayBuffer();
      } else {
        console.warn("Failed to fetch Almarai font:", almaraiRes.status);
      }
    } catch (error) {
      console.warn("Failed to load Almarai font:", error);
    }

    try {
      const snellRes = await fetch("/fonts/Snell-Roundhand-Bold-Script.otf");
      if (snellRes.ok) {
        result.snell = await snellRes.arrayBuffer();
      } else {
        console.warn("Failed to fetch Snell Roundhand font:", snellRes.status);
      }
    } catch (error) {
      console.warn("Failed to load Snell Roundhand font:", error);
    }

    try {
      const ubuntuRes = await fetch("/fonts/Ubuntu-Bold.ttf");
      if (ubuntuRes.ok) {
        result.ubuntu = await ubuntuRes.arrayBuffer();
      } else {
        console.warn("Failed to fetch Ubuntu font:", ubuntuRes.status);
      }
    } catch (error) {
      console.warn("Failed to load Ubuntu font:", error);
    }

    // Load Avenir font for body text (to match Download Certificates - With Pdf Editing)
    try {
      const avenirRes = await fetch("/fonts/Avenir/Avenir Book.ttf");
      if (avenirRes.ok) {
        result.avenir = await avenirRes.arrayBuffer();
      } else {
        console.warn("Failed to fetch Avenir font:", avenirRes.status);
      }
    } catch (error) {
      console.warn("Failed to load Avenir font:", error);
    }

    coordinatorFontBytesCache = result;
    return result;
  };

const loadCustomFonts = async (pdfDoc: PDFDocument) => {
  pdfDoc.registerFontkit(fontkit);

  const fonts: { [key: string]: any } = {};
  const fontBytes = await loadCoordinatorFontBytesOnce();

  try {
    if (fontBytes.almarai) {
      fonts.almarai = await pdfDoc.embedFont(fontBytes.almarai);
    }
  } catch (error) {
    console.warn("Failed to embed Almarai font:", error);
  }

  try {
    if (fontBytes.snell) {
      fonts.snell = await pdfDoc.embedFont(fontBytes.snell);
    }
  } catch (error) {
    console.warn("Failed to embed Snell Roundhand font:", error);
  }

  try {
    if (fontBytes.ubuntu) {
      fonts.ubuntu = await pdfDoc.embedFont(fontBytes.ubuntu);
    }
  } catch (error) {
    console.warn("Failed to embed Ubuntu font:", error);
  }

  try {
    if (fontBytes.avenir) {
      fonts.avenir = await pdfDoc.embedFont(fontBytes.avenir);
    }
  } catch (error) {
    console.warn("Failed to embed Avenir font:", error);
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

// Process school name text (matching react-pdf logic)
const processSchoolNameText = (schoolName: string): string => {
  return schoolName
    .replace(/(\([^)]+\))/g, (match) => {
      // Extract text inside parentheses, convert to uppercase, and keep parentheses
      const innerText = match.slice(1, -1).toUpperCase();
      return `(${innerText})`;
    })
    .replace(/([^\(]+)(?=\s*\()/g, (match) => toTitleCase(match));
};

// Calculate font size for coordinator name (matching react-pdf SmartText logic)
const getCoordinatorNameFontSize = (
  text: string,
  isArabic: boolean
): number => {
  const textLength = text.length;
  if (textLength > 30) {
    return isArabic ? 25 : 27;
  } else {
    return isArabic ? 25 : 36;
  }
};

const getSchoolNameFontSize = (text: string, isArabic: boolean): number => {
  const textLength = text.length;
  return isArabic ? (textLength < 30 ? 26 : 22) : textLength < 30 ? 24 : 20;
};

// Text helpers copied from GoldCertificatePdf to match layout and styling
const processTextForCapitalization = (text: string): string => {
  if (!text) return text;

  // First apply title case to the entire text
  let processedText = text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Then replace " Ii " with " II " (after title case conversion)
  processedText = processedText.replace(/\s+Ii\s+/g, " II ");

  return processedText;
};

const measureTextWidthWithTracking = (
  text: string,
  font: any,
  fontSize: number,
  tracking: number
) => {
  if (!font) {
    return text.length * (fontSize * 0.6 + tracking);
  }
  const baseWidth = font.widthOfTextAtSize(text, fontSize);
  const extra = Math.max(0, text.length - 1) * tracking;
  return baseWidth + extra;
};

const drawCenteredTextWithTracking = (
  page: any,
  text: string,
  options: {
    centerX: number;
    y: number;
    font: any;
    size: number;
    color: any;
    tracking: number;
  }
) => {
  const { centerX, y, font, size, color, tracking } = options;
  const totalWidth = measureTextWidthWithTracking(text, font, size, tracking);
  let x = centerX - totalWidth / 2;

  for (const ch of text) {
    const w = font ? font.widthOfTextAtSize(ch, size) : size * 0.6;
    page.drawText(ch, { x, y, size, font, color });
    x += w + tracking;
  }
};

const wrapTextToLines = (
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number,
  tracking: number,
  maxLines: number
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const candidate = current ? `${current} ${word}` : word;
    const width = measureTextWidthWithTracking(
      candidate,
      font,
      fontSize,
      tracking
    );

    if (width <= maxWidth || !current) {
      current = candidate;
    } else {
      // Current line is full, save it
      lines.push(current);

      // Check if we're at the last allowed line
      if (lines.length === maxLines) {
        // Put all remaining words on this last line (even if it overflows slightly)
        const remaining = words.slice(i).join(" ");
        current = remaining;
        break;
      }

      // Start new line with current word
      current = word;
    }
  }

  // Add the last line
  if (current) {
    lines.push(current);
  }

  return lines;
};

// Load your existing PDF template with simple in-memory caching so we
// avoid repeated network requests for every batch or click.
let coordinatorTemplateBytesCache: Uint8Array | null = null;

const loadCertificateTemplate = async (): Promise<Uint8Array> => {
  if (coordinatorTemplateBytesCache) return coordinatorTemplateBytesCache;

  const response = await fetch("/templates/coordinator_certificates.pdf");
  if (!response.ok) {
    throw new Error("Failed to load certificate template");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  coordinatorTemplateBytesCache = bytes;
  return bytes;
};

// Generate certificate using your existing PDF template
export async function generateCoordinatorCertificate(
  coordinator: CoordinatorDetails,
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
  const coordinatorName = coordinator.c_Name || "Coordinator Name";
  const schoolName = coordinator.schoolName || "School Name";
  const schoolId = coordinator.schoolId || 0;

  // Check if text is Arabic (matching react-pdf logic)
  const isCNameArabic = isArabicText(coordinatorName);
  const isSchoolNameArabicText = isSchoolNameArabic(schoolName);

  // Process school name (matching react-pdf processing)
  const processedSchoolName = processSchoolNameText(schoolName);

  // Calculate font sizes (matching react-pdf logic)
  const nameFontSize = getCoordinatorNameFontSize(
    coordinatorName,
    isCNameArabic
  );
  const schoolNameFontSize = getSchoolNameFontSize(
    schoolName,
    isSchoolNameArabicText
  );

  // Layout settings to match Download Certificates - With Pdf Editing
  const bandLeft = 140;
  const bandRight = 600;
  const bandCenterX = (bandLeft + bandRight) / 2;

  const bodyTracking = 0.5;

  // Choose font for school name and pre-wrap to know how many lines we'll have
  // Arabic: Almarai, fallback to Avenir (then Ubuntu only as a last resort)
  // English: use Avenir instead of Ubuntu
  const nameFont = isCNameArabic
    ? fonts.almarai || fonts.ubuntu
    : fonts.snell || fonts.ubuntu;
  const schoolNameFont = isSchoolNameArabicText
    ? fonts.almarai || fonts.avenir || fonts.ubuntu
    : fonts.avenir || nameFont;

  const maxSchoolWidth = bandRight - bandLeft;
  const schoolLines = wrapTextToLines(
    processedSchoolName,
    schoolNameFont,
    schoolNameFontSize,
    maxSchoolWidth,
    bodyTracking,
    2
  );

  // Dynamic top position based on whether school name wraps to two lines
  const topPosition = schoolLines.length > 1 ? 280 : 295;
  const baseY = height - topPosition;

  // Coordinator name processing (same capitalization behavior)
  const displayCoordinatorName = isCNameArabic
    ? coordinatorName
    : processTextForCapitalization(coordinatorName);

  // 1. Coordinator name
  drawCenteredTextWithTracking(firstPage, displayCoordinatorName, {
    centerX: bandCenterX,
    y: baseY,
    font: nameFont,
    size: nameFontSize,
    color: rgb(0, 0, 0),
    tracking: bodyTracking,
  });

  // 2. School ID line
  const schoolIdY = baseY - 35;
  const schoolIdText = `School ID: ${schoolId}`;

  drawCenteredTextWithTracking(firstPage, schoolIdText, {
    centerX: bandCenterX,
    y: schoolIdY,
    // For English text, prefer Avenir instead of Ubuntu
    font: fonts.avenir || nameFont,
    size: 16,
    color: rgb(0, 0, 0),
    tracking: bodyTracking,
  });

  // 3. School name (wrapped, same band and spacing)
  const schoolNameY = schoolIdY - 35;
  const schoolLineHeight = schoolNameFontSize + 2;

  schoolLines.forEach((line, index) => {
    const lineY = schoolNameY - index * schoolLineHeight;
    drawCenteredTextWithTracking(firstPage, line, {
      centerX: bandCenterX,
      y: lineY,
      font: schoolNameFont,
      size: schoolNameFontSize,
      color: rgb(0, 0, 0),
      tracking: bodyTracking,
    });
  });

  return await pdfDoc.save();
}
// Utility function to convert text to Title Case
const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Batch generation function (keeping existing logic)
export async function generateCoordinatorCertificates(
  coordinators: CoordinatorDetailsList
): Promise<
  {
    blob: Blob;
    coordinatorName: string;
    schoolId: number;
    schoolName: string;
  }[]
> {
  const results: {
    blob: Blob;
    coordinatorName: string;
    schoolId: number;
    schoolName: string;
  }[] = [];

  // Load template once for efficiency
  const templateBytes = await loadCertificateTemplate();

  for (const coordinator of coordinators) {
    // Enhanced validation (matching react-pdf data filtering)
    if (
      !coordinator ||
      typeof coordinator !== "object" ||
      !coordinator.c_Name ||
      !coordinator.schoolId ||
      !coordinator.schoolName
    ) {
      console.warn("Skipping invalid coordinator:", coordinator);
      continue;
    }

    try {
      const pdfBytes = await generateCoordinatorCertificate(
        coordinator,
        templateBytes
      );
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      results.push({
        blob,
        coordinatorName: coordinator.c_Name.trim(),
        schoolId: coordinator.schoolId,
        schoolName: coordinator.schoolName.trim(),
      });

      console.log(`✓ Generated certificate for ${coordinator.c_Name}`);
    } catch (error) {
      console.error(
        `✗ Failed to generate certificate for ${coordinator.c_Name}:`,
        error
      );
    }

    // Small delay to prevent overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return results;
}
