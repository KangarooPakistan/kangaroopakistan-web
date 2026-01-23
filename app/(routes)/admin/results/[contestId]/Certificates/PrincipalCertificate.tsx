import { PDFDocument, rgb } from "pdf-lib";
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
    text,
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
  isArabic: boolean,
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
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });

  // Then replace " Ii " with " II " (after title case conversion)
  processedText = processedText.replace(/\s+Ii\s+/g, " II ");

  return processedText;
};

const measureTextWidthWithTracking = (
  text: string,
  font: any,
  fontSize: number,
  tracking: number,
) => {
  if (!font || !text) {
    return text.length * (fontSize * 0.6 + tracking);
  }
  
  try {
    const baseWidth = font.widthOfTextAtSize(text, fontSize);
    const trackingExtra = Math.max(0, text.length - 1) * tracking;
    return baseWidth + trackingExtra;
  } catch (error) {
    console.warn("Error measuring text width:", error);
    return text.length * (fontSize * 0.6 + tracking);
  }
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
  },
) => {
  const { centerX, y, font, size, color, tracking } = options;
  
  if (!text || !font) {
    console.warn("Missing text or font for drawing");
    return;
  }

  try {
    const totalWidth = measureTextWidthWithTracking(text, font, size, tracking);
    let x = centerX - totalWidth / 2;

    // Draw each character with tracking
    for (const ch of text) {
      const charWidth = font.widthOfTextAtSize(ch, size);
      page.drawText(ch, { x, y, size, font, color });
      x += charWidth + tracking;
    }
  } catch (error) {
    console.warn("Error drawing centered text:", error);
    // Fallback to simple centered text without tracking
    page.drawText(text, {
      x: centerX - (text.length * size * 0.3), // Rough center estimation
      y,
      size,
      font,
      color,
    });
  }
};

// Helper function to ensure consistent centering
const getPageCenterX = (pageWidth: number): number => {
  return pageWidth / 2;
};

// Helper function to draw text with better centering
const drawPerfectlyCenteredText = (
  page: any,
  text: string,
  options: {
    pageWidth: number;
    y: number;
    font: any;
    size: number;
    color: any;
    tracking?: number;
  },
) => {
  const { pageWidth, y, font, size, color, tracking = 0 } = options;
  
  if (!text || !font) {
    console.warn("Missing text or font for drawing");
    return;
  }

  const centerX = getPageCenterX(pageWidth);
  
  try {
    if (tracking > 0) {
      // Use tracking version for spaced text
      drawCenteredTextWithTracking(page, text, {
        centerX,
        y,
        font,
        size,
        color,
        tracking,
      });
    } else {
      // Use simple centered text for better accuracy
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = centerX - textWidth / 2;
      page.drawText(text, { x, y, size, font, color });
    }
  } catch (error) {
    console.warn("Error drawing perfectly centered text:", error);
    // Ultimate fallback
    const estimatedX = centerX - (text.length * size * 0.3);
    page.drawText(text, {
      x: estimatedX,
      y,
      size,
      font,
      color,
    });
  }
};

const wrapTextToLines = (
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number,
  tracking: number,
  maxLines: number,
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
      tracking,
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
  templateBytes?: Uint8Array,
): Promise<Uint8Array> {
  let pdfDoc: PDFDocument;

  try {
    if (templateBytes) {
      pdfDoc = await PDFDocument.load(templateBytes);
    } else {
      const template = await loadCertificateTemplate();
      pdfDoc = await PDFDocument.load(template);
    }
  } catch (error) {
    console.error(
      `Failed to load PDF template for ${principal.p_Name}:`,
      error,
    );
    throw new Error(
      `PDF template loading failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // Load custom fonts
  let fonts;
  try {
    fonts = await loadCustomFonts(pdfDoc);
  } catch (error) {
    console.error(`Failed to load fonts for ${principal.p_Name}:`, error);
    throw new Error(
      `Font loading failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // Get the first page (assuming single page certificate)
  const pages = pdfDoc.getPages();
  if (!pages || pages.length === 0) {
    throw new Error(`No pages found in PDF template for ${principal.p_Name}`);
  }
  const firstPage = pages[0];

  // Get page dimensions
  const { width, height } = firstPage.getSize();
  console.log(`Page dimensions: ${width} x ${height}`);

  // Prepare text values with safe defaults
  const coordinatorName = principal.p_Name;
  const schoolName = principal.schoolName;
  const schoolId = principal.schoolId;

  // Check if text is Arabic (matching react-pdf logic)
  const isCNameArabic = isArabicText(coordinatorName);
  const isSchoolNameArabicText = isSchoolNameArabic(schoolName);

  // Process school name (matching react-pdf processing)
  const processedSchoolName = processSchoolNameText(schoolName);

  // Calculate font sizes (matching react-pdf logic)
  const nameFontSize = getCoordinatorNameFontSize(
    coordinatorName,
    isCNameArabic,
  );
  const schoolNameFontSize = getSchoolNameFontSize(
    schoolName,
    isSchoolNameArabicText,
  );

  // Layout settings to match Download Certificates - With Pdf Editing
  const bandLeft = 220;
  const bandRight = 670;
  const bandCenterX = width / 2; // Use true center of page for better alignment

  const bodyTracking = 0.5;

  // Choose font for school name and pre-wrap to know how many lines we'll have
  // Arabic: Almarai, fallback to Avenir (then Ubuntu only as a last resort)
  // English: use Avenir instead of Ubuntu
  const hasPrincipalName = coordinatorName && coordinatorName.trim().length > 0;

  // Only validate name font if we have a name to display
  let nameFont;
  if (hasPrincipalName) {
    nameFont = isCNameArabic
      ? fonts.almarai || fonts.ubuntu
      : fonts.snell || fonts.ubuntu;

    if (!nameFont) {
      throw new Error(
        `No suitable font available for principal name (Arabic: ${isCNameArabic}) for ${principal.p_Name}`,
      );
    }
  } else {
    // Use a default font for school name if no principal name
    nameFont = fonts.avenir || fonts.ubuntu;
  }

  const schoolNameFont = isSchoolNameArabicText
    ? fonts.almarai || fonts.avenir || fonts.ubuntu
    : fonts.avenir || nameFont;

  if (!schoolNameFont) {
    throw new Error(
      `No suitable font available for school name (Arabic: ${isSchoolNameArabicText}) for ${principal.p_Name || "empty name"}`,
    );
  }

  const maxSchoolWidth = bandRight - bandLeft - 50;
  const schoolLines = wrapTextToLines(
    processedSchoolName,
    schoolNameFont,
    schoolNameFontSize,
    maxSchoolWidth,
    bodyTracking,
    2,
  );

  // Dynamic top position based on whether school name wraps to two lines
  const baseTopPosition = schoolLines.length > 1 ? 305 : 305;
  // Always use the same starting position since we always reserve space
  const topPosition = baseTopPosition;
  let baseY = height - topPosition;

  // Principal name processing (same capitalization behavior)
  // hasPrincipalName already declared above

  // Define schoolLineHeight for use in both layouts
  const schoolLineHeight = schoolNameFontSize + 2;

  // Check if we should use compact layout (no principal name AND no schoolId)
  const useCompactLayout = !hasPrincipalName && schoolId === null;

  if (useCompactLayout) {
    // Special case: No principal name and no schoolId
    // Place school name directly at 340 from top
    const schoolNameY = height - 340;

    schoolLines.forEach((line, index) => {
      const lineY = schoolNameY - index * schoolLineHeight;
      drawPerfectlyCenteredText(firstPage, line, {
        pageWidth: width,
        y: lineY,
        font: schoolNameFont,
        size: schoolNameFontSize,
        color: rgb(0, 0, 0),
        tracking: bodyTracking,
      });
    });
  } else {
    // Normal layout: Reserve spaces for manual writing

    // 1. Principal name - ALWAYS reserve space, even if name is empty
    // This leaves space for manual writing if name is empty
    if (hasPrincipalName) {
      const displayCoordinatorName = isCNameArabic
        ? coordinatorName
        : processTextForCapitalization(coordinatorName);

      drawPerfectlyCenteredText(firstPage, displayCoordinatorName, {
        pageWidth: width,
        y: baseY,
        font: nameFont,
        size: nameFontSize,
        color: rgb(0, 0, 0),
        tracking: bodyTracking,
      });
    }
    // Always move down to reserve space for Principal name (whether written or not)
    baseY -= 35;

    // 2. School ID line - ALWAYS reserve space, even if schoolId is null
    // This leaves space for manual writing if schoolId is null
    if (schoolId !== null) {
      const schoolIdText = `School ID: ${schoolId}`;
      drawPerfectlyCenteredText(firstPage, schoolIdText, {
        pageWidth: width,
        y: baseY,
        font: fonts.avenir || nameFont,
        size: 16,
        color: rgb(0, 0, 0),
        tracking: bodyTracking,
      });
    }
    // Always move down to reserve space for School ID (whether written or not)
    baseY -= 35;

    // 3. School name (wrapped, same band and spacing)
    const schoolNameY = baseY;

    schoolLines.forEach((line, index) => {
      const lineY = schoolNameY - index * schoolLineHeight;
      drawPerfectlyCenteredText(firstPage, line, {
        pageWidth: width,
        y: lineY,
        font: schoolNameFont,
        size: schoolNameFontSize,
        color: rgb(0, 0, 0),
        tracking: bodyTracking,
      });
    });
  }

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
  principals: PrincipalDetailsList,
): Promise<
  {
    blob: Blob | null;
    principalName: string;
    schoolId: number | null;
    schoolName: string;
    success: boolean;
    error?: string;
  }[]
> {
  const results: {
    blob: Blob | null;
    principalName: string;
    schoolId: number | null;
    schoolName: string;
    success: boolean;
    error?: string;
  }[] = [];

  // Load template once for efficiency
  const templateBytes = await loadCertificateTemplate();

  for (const principal of principals) {
    // Enhanced validation (matching react-pdf data filtering)
    // Only require schoolName - allow null/empty p_Name and null schoolId
    if (!principal || typeof principal !== "object" || !principal.schoolName) {
      console.warn("Skipping invalid principal - validation failed:", {
        hasPrincipal: !!principal,
        isObject: typeof principal === "object",
        p_Name: principal?.p_Name,
        schoolName: principal?.schoolName,
        schoolId: principal?.schoolId,
        fullData: principal,
      });
      results.push({
        blob: null,
        principalName: principal?.p_Name || "Unknown",
        schoolId: principal?.schoolId || null,
        schoolName: principal?.schoolName || "Unknown",
        success: false,
        error: `Invalid principal data - schoolName is required but missing`,
      });
      continue;
    }

    try {
      const pdfBytes = await generatePrincipalCertificate(
        principal,
        templateBytes,
      );
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      results.push({
        blob,
        principalName: principal.p_Name.trim(),
        schoolId: principal.schoolId,
        schoolName: principal.schoolName.trim(),
        success: true,
      });

      console.log(`✓ Generated certificate for ${principal.p_Name}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `✗ Failed to generate certificate for ${principal.p_Name}:`,
        error,
      );

      results.push({
        blob: null,
        principalName: principal.p_Name.trim(),
        schoolId: principal.schoolId,
        schoolName: principal.schoolName.trim(),
        success: false,
        error: errorMessage,
      });
    }

    // Small delay to prevent overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return results;
}
