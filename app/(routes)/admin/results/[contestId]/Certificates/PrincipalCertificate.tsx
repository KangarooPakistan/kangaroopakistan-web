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
    const snellBytes = await fetch(
      "/fonts/Snell-Roundhand-Bold-Script.otf"
    ).then((res) => res.arrayBuffer());
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

// Load your existing PDF template
const loadCertificateTemplate = async (): Promise<Uint8Array> => {
  const response = await fetch("/templates/principal_certificates.pdf");
  if (!response.ok) {
    throw new Error("Failed to load certificate template");
  }
  return new Uint8Array(await response.arrayBuffer());
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
export async function generatePrincipalCertificates(
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
