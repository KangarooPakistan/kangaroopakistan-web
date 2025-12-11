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
};

let coordinatorFontBytesCache: CoordinatorFontBytes | null = null;

const loadCoordinatorFontBytesOnce = async (): Promise<CoordinatorFontBytes> => {
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
  return isArabic ? (textLength < 30 ? 24 : 22) : textLength < 30 ? 26 : 20;
};

const getSchoolNameFontSize = (text: string, isArabic: boolean): number => {
  const textLength = text.length;
  return isArabic ? (textLength < 30 ? 26 : 22) : textLength < 30 ? 24 : 20;
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

  // Text positioning - matching react-pdf positioning logic
  // React-pdf uses top: 255/260, converting to pdf-lib bottom-up coordinate system
  const nameY = height - (isCNameArabic ? 315 : 315);

  // Select appropriate fonts (matching react-pdf font selection)
  const nameFont = isCNameArabic
    ? fonts.almarai || fonts.ubuntu // Fallback to ubuntu if almarai fails
    : fonts.snell || fonts.ubuntu; // Fallback to ubuntu if snell fails

  // Calculate text width for centering
  const nameWidth = nameFont
    ? nameFont.widthOfTextAtSize(toTitleCase(coordinatorName), nameFontSize)
    : coordinatorName.length * (nameFontSize * 0.6); // Fallback estimation
  // Draw coordinator name (matching react-pdf styling)
  firstPage.drawText(toTitleCase(coordinatorName), {
    x: (width - nameWidth) / 2, // Center horizontally
    y: nameY,
    size: nameFontSize,
    font: nameFont,
    color: rgb(0, 0, 0),
    maxWidth: width - 100, // Leave margin (matching react-pdf minWidth: 300, maxWidth: 100%)
  });

  // Calculate School ID position (tighter spacing to match react-pdf visual result)
  const schoolIdMarginTop = isCNameArabic ? 35 : 40; // matching original spacing
  const schoolIdY = nameY - schoolIdMarginTop;

  const schoolIdText = `School ID: ${schoolId}`;
  const schoolIdWidth = fonts.ubuntu
    ? fonts.ubuntu.widthOfTextAtSize(schoolIdText, 16)
    : schoolIdText.length * (16 * 0.6); // Fallback estimation

  // Draw school ID (matching react-pdf styling)
  firstPage.drawText(schoolIdText, {
    x: (width - schoolIdWidth) / 2, // Center horizontally
    y: schoolIdY,
    size: 16, // Fixed size matching react-pdf
    font: fonts.ubuntu || nameFont, // Use Ubuntu font as in react-pdf
    color: rgb(0, 0, 0),
  });

  // Calculate School Name position (tighter spacing to match react-pdf visual result)
  const schoolNameMarginTop = isSchoolNameArabicText ? 32 : 35; // matching original spacing
  const schoolNameY = schoolIdY - schoolNameMarginTop;

  // Select school name font (matching react-pdf font selection)
  const schoolNameFont = isSchoolNameArabicText
    ? fonts.almarai || fonts.ubuntu // Use Almarai for Arabic
    : fonts.ubuntu || nameFont; // Use Ubuntu for English

  const schoolNameWidth = schoolNameFont
    ? schoolNameFont.widthOfTextAtSize(
        toTitleCase(processedSchoolName),
        schoolNameFontSize
      )
    : processedSchoolName.length * (schoolNameFontSize * 0.6); // Fallback estimation

  // Draw school name (matching react-pdf styling and processing)
  firstPage.drawText(processedSchoolName, {
    x: (width - schoolNameWidth) / 2, // Center horizontally
    y: schoolNameY,
    size: schoolNameFontSize,
    font: schoolNameFont,
    color: rgb(0, 0, 0),
    maxWidth: width - 100, // Leave margin (matching react-pdf)
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
