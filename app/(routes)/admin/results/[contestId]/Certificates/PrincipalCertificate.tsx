import { PDFDocument, PDFForm, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Define the PrincipalDetails type
export type PrincipalDetails = {
  schoolId: number | null;
  schoolName: string;
  p_Name: string;
};

export type PrincipalDetailsList = PrincipalDetails[];

// Load custom fonts for PDF-lib with per-session font byte caching
// so we do not hit the network on every certificate generation.
type PrincipalFontBytes = {
  almarai?: ArrayBuffer;
  snell?: ArrayBuffer;
  ubuntu?: ArrayBuffer;
  avenir?: ArrayBuffer;
};

let principalFontBytesCache: PrincipalFontBytes | null = null;

const loadPrincipalFontBytesOnce = async (): Promise<PrincipalFontBytes> => {
  if (principalFontBytesCache) return principalFontBytesCache;

  const result: PrincipalFontBytes = {};

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

  principalFontBytesCache = result;
  return result;
};

const loadCustomFonts = async (pdfDoc: PDFDocument) => {
  pdfDoc.registerFontkit(fontkit);

  const fonts: { [key: string]: any } = {};
  const fontBytes = await loadPrincipalFontBytesOnce();

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
let principalTemplateBytesCache: Uint8Array | null = null;

const loadCertificateTemplate = async (): Promise<Uint8Array> => {
  if (principalTemplateBytesCache) return principalTemplateBytesCache;

  const response = await fetch("/templates/iklc/principal_certificates.pdf");
  if (!response.ok) {
    throw new Error("Failed to load certificate template");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  principalTemplateBytesCache = bytes;
  return bytes;
};

// Generate certificate using your existing PDF template
export async function generatePrincipalCertificate(
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
  // const bandLeft = 140;
  // const bandRight = 600;
  // const bandCenterX = (bandLeft + bandRight) / 2;
  const bandLeft = 250;
  const bandRight = 700;
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

  const maxSchoolWidth = bandRight - bandLeft -50;
  const schoolLines = wrapTextToLines(
    processedSchoolName,
    schoolNameFont,
    schoolNameFontSize,
    maxSchoolWidth,
    bodyTracking,
    2
  );

  // Dynamic top position based on whether school name wraps to two lines
  // const topPosition = schoolLines.length > 1 ? 305 : 305;
  const topPosition = schoolLines.length > 1 ? 270 : 270;
  const baseY = height - topPosition;

  // Principal name processing (same capitalization behavior)
  const displayCoordinatorName = isCNameArabic
    ? coordinatorName
    : processTextForCapitalization(coordinatorName);

  // 1. Principal name
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
export async function generatePrincipalCertificates(
  principals: PrincipalDetailsList
): Promise<
  {
    blob: Blob;
    principalName: string;
    schoolId: number | null;
    schoolName: string;
  }[]
> {
  const results: {
    blob: Blob;
    principalName: string;
    schoolId: number | null;
    schoolName: string;
  }[] = [];

  // Load template once for efficiency
  const templateBytes = await loadCertificateTemplate();

  for (const principal of principals) {
    // Enhanced validation (matching react-pdf data filtering)
    // Allow null schoolId but require other fields
    if (
      !principal ||
      typeof principal !== "object" ||
      !principal.p_Name ||
      !principal.schoolName
    ) {
      console.warn("Skipping invalid principal:", principal);
      continue;
    }

    try {
      const pdfBytes = await generatePrincipalCertificate(
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
