import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Types from your existing code
export type StudentReportForCertificates = {
  studentName: string | null | undefined;
  fatherName: string | null | undefined;
  schoolName: string | null | undefined;
  class: number;
  rollNumber: string;
  AwardLevel: string | null | undefined;
};

// Load font bytes once per browser session to avoid repeated network fetches
// for every single certificate. We still need to embed fonts into each PDF
// document separately, but the font *data* is cached.
type FontBytes = {
  snell?: ArrayBuffer;
  malayalam?: ArrayBuffer;
  malayalamBold?: ArrayBuffer;
  avenir?: ArrayBuffer;
};

let fontBytesCache: FontBytes | null = null;

const loadFontBytesOnce = async (): Promise<FontBytes> => {
  if (fontBytesCache) return fontBytesCache;

  const result: FontBytes = {};

  // Almarai (Arabic) fonts are no longer used for "Download Certificates - With PDF Editing",
  // so we intentionally skip loading them to improve performance and reduce network requests.

  // Load English decorative font - Snell Roundhand (matching react-pdf)
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

  // Load Malayalam fonts (kept for fallback only)
  try {
    const malayalamRes = await fetch("/fonts/malayalam-mn.ttf");
    if (malayalamRes.ok) {
      result.malayalam = await malayalamRes.arrayBuffer();
    } else {
      console.warn("Failed to fetch Malayalam font:", malayalamRes.status);
    }

    const malayalamBoldRes = await fetch("/fonts/malayalam-mn-bold.ttf");
    if (malayalamBoldRes.ok) {
      result.malayalamBold = await malayalamBoldRes.arrayBuffer();
    } else {
      console.warn(
        "Failed to fetch Malayalam Bold font:",
        malayalamBoldRes.status
      );
    }
  } catch (error) {
    console.warn("Failed to load Malayalam fonts:", error);
  }

  // Load Avenir font for all non-student-name text
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

  fontBytesCache = result;
  return result;
};

// Load custom fonts for PDF-lib (matching your React PDF fonts)
const loadCustomFonts = async (pdfDoc: PDFDocument) => {
  pdfDoc.registerFontkit(fontkit);

  const fonts: { [key: string]: any } = {};
  const fontBytes = await loadFontBytesOnce();

  try {
    if (fontBytes.snell) {
      fonts.snell = await pdfDoc.embedFont(fontBytes.snell);
    }
  } catch (error) {
    console.warn("Failed to embed Snell Roundhand font:", error);
  }

  try {
    if (fontBytes.malayalam) {
      fonts.malayalam = await pdfDoc.embedFont(fontBytes.malayalam);
    }
    if (fontBytes.malayalamBold) {
      fonts.malayalamBold = await pdfDoc.embedFont(fontBytes.malayalamBold);
    }
  } catch (error) {
    console.warn("Failed to embed Malayalam fonts:", error);
  }

  // Embed Avenir (body) font
  try {
    if (fontBytes.avenir) {
      fonts.avenir = await pdfDoc.embedFont(fontBytes.avenir);
    }
  } catch (error) {
    console.warn("Failed to embed Avenir font:", error);
  }

  return fonts;
};

// Utility functions (matching your React PDF logic)
const isArabicText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    text
  );
};

const isSchoolNameArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

// Process text for capitalization (matching React PDF logic)
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
const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Process school name text (matching React PDF logic)
const processSchoolNameText = (schoolName: string): string => {
  return schoolName
    .replace(/(\([^)]+\))/g, (match) => {
      // Extract text inside parentheses, convert to uppercase, and keep parentheses
      const innerText = match.slice(1, -1).toUpperCase();
      return `(${innerText})`;
    })
    .replace(/([^\(]+)(?=\s*\()/g, (match) => toTitleCase(match));
};

// Get font sizes (matching React PDF SmartText logic)
const getStudentNameFontSize = (
  text: string,
  isArabic: boolean,
  studentNameLength?: number
): number => {
  const nameLength = studentNameLength || text.length;
  if (nameLength > 30) {
    return isArabic ? 25 : 25;
  } else {
    return isArabic ? 25 : 34;
  }
};

const getFatherNameFontSize = (
  text: string,
  isArabic: boolean,
  studentNameLength?: number
): number => {
  const nameLength = studentNameLength || text.length;
  if (nameLength > 30) {
    return isArabic ? 20 : 22;
  } else {
    return isArabic ? 20 : 28;
  }
};

const getSchoolNameFontSize = (text: string, isArabic: boolean): number => {
  return isArabic ? 20 : 15;
};

// Get award template path (matching React PDF logic)
const getAwardTemplatePath = (
  awardLevel: string | null | undefined
): string => {
  if (!awardLevel) return "templates/participation_award.pdf";

  const level = awardLevel.toUpperCase().replace(/\s+/g, "_");
  switch (level) {
    case "GOLD":
      return "/templates/gold_award.pdf";
    case "SILVER":
      return "/templates/silver_award.pdf";
    case "BRONZE":
      return "/templates/bronze_award.pdf";
    case "THREE_STAR":
      return "/templates/three_star_award.pdf";
    case "TWO_STAR":
      return "/templates/two_star_award.pdf";
    case "ONE_STAR":
      return "/templates/one_star_award.pdf";
    case "PARTICIPATION":
      return "/templates/participation_award.pdf";
    default:
      return "/templates/participation_award.pdf";
  }
};

// Cache certificate template bytes per template path so we don't re-download
// the same PDF for every student or repeated "Download Certificates" clicks.
const templateCache: Record<string, Uint8Array> = {};

const loadCertificateTemplate = async (
  templatePath: string
): Promise<Uint8Array> => {
  if (templateCache[typeof templatePath === "string" ? templatePath : ""]) {
    return templateCache[templatePath];
  }

  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load certificate template: ${templatePath}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  templateCache[templatePath] = bytes;
  return bytes;
};

// Generate individual certificate
export async function generateStudentCertificate(
  student: StudentReportForCertificates,
  templateBytes?: Uint8Array
): Promise<Uint8Array> {
  let pdfDoc: PDFDocument;

  if (templateBytes) {
    pdfDoc = await PDFDocument.load(templateBytes);
  } else {
    const templatePath = getAwardTemplatePath(student.AwardLevel);
    const template = await loadCertificateTemplate(templatePath);
    pdfDoc = await PDFDocument.load(template);
  }

  // Load custom fonts
  const fonts = await loadCustomFonts(pdfDoc);

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Left margin: ~1 inch from the left edge (PDF points: 72pt = 1 inch)
  const leftMargin = 140;

  // Prepare text values with safe defaults and proper processing
  const studentName = processTextForCapitalization(
    student.studentName || "Student Name"
  );
  const fatherName = student.fatherName || "Father Name"; // Keep original case for father name
  const schoolName = student.schoolName || "School Name";
  const className = student.class || 0;
  const rollNumber = student.rollNumber || "N/A";

  // For "Download Certificates - With PDF Editing" we only expect English text,
  // so skip Arabic text detection and always treat content as English.
  const isStudentNameArabic = false;
  const isFatherNameArabic = false;
  const isSchoolNameArabicText = false;

  // Process school name
  const processedSchoolName = processSchoolNameText(schoolName);

  // Calculate font sizes assuming English layout
  const studentNameLength = studentName.length;
  const studentNameFontSize = getStudentNameFontSize(
    studentName,
    false,
    studentNameLength
  );
  const fatherNameFontSize = getFatherNameFontSize(
    fatherName,
    false,
    studentNameLength
  );
  const schoolNameFontSize = getSchoolNameFontSize(schoolName, false);

  // Determine if this is a participation certificate and set proper top position
  const isParticipationCertificate =
    getAwardTemplatePath(student.AwardLevel) ===
    "/templates/participation_award.pdf";

  // FIXED: Different top positions for participation vs other certificates
  const topPosition = isParticipationCertificate ? 290 : 280;
  const baseY = height - topPosition;

  // Select fonts (matching React PDF font selection)
  const studentNameFont = isStudentNameArabic
    ? fonts.almaraiBold || fonts.malayalamBold
    : fonts.snell || fonts.malayalamBold;

  // Student name keeps using Snell; all other text uses Avenir (fallback to Malayalam)
  const fatherNameFont = fonts.avenir || fonts.malayalamBold || fonts.malayalam;

  const schoolNameFont = fonts.avenir || fonts.malayalamBold || fonts.malayalam;

  // 1. Draw student name (processed with title case and "II" handling)
  const studentNameWidth = studentNameFont
    ? studentNameFont.widthOfTextAtSize(studentName, studentNameFontSize)
    : studentName.length * (studentNameFontSize * 0.6);

  firstPage.drawText(studentName, {
    x: leftMargin,
    y: baseY,
    size: studentNameFontSize,
    font: studentNameFont,
    color: rgb(0, 0, 0),
    maxWidth: width - leftMargin * 2,
  });

  // 2. Draw "S/o, D/o" text - Reduced gap from student name
  const soDoY = baseY - (isStudentNameArabic ? 25 : 25);
  const soDoText = "S/o , D/o";
  const soDoWidth = fonts.avenir
    ? fonts.avenir.widthOfTextAtSize(soDoText, 12)
    : soDoText.length * (12 * 0.6);

  firstPage.drawText(soDoText, {
    x: leftMargin,
    y: soDoY,
    size: 12,
    font: fonts.avenir || fonts.malayalam || studentNameFont,
    color: rgb(0, 0, 0),
  });

  // 3. Draw father name - KEEP ORIGINAL CASE (lowercase as in React PDF SmartText2)
  const fatherNameY = soDoY - 33;
  const toTitleCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  const fatherNameLowercase = toTitleCase(fatherName); // Convert to lowercase as in original

  const fatherNameWidth = fatherNameFont
    ? fatherNameFont.widthOfTextAtSize(fatherNameLowercase, fatherNameFontSize)
    : fatherNameLowercase.length * (fatherNameFontSize * 0.6);

  firstPage.drawText(fatherNameLowercase, {
    x: leftMargin,
    y: fatherNameY,
    size: fatherNameFontSize,
    font: fatherNameFont,
    color: rgb(0, 0, 0),
    maxWidth: width - leftMargin * 2,
  });

  // 4. Draw class information
  const classY = fatherNameY - (isFatherNameArabic ? 25 : 25);
  const classText = `Year / Grade ${className}`;
  const classWidth = fonts.avenir
    ? fonts.avenir.widthOfTextAtSize(classText, 12)
    : classText.length * (12 * 0.6);

  firstPage.drawText(classText, {
    x: leftMargin,
    y: classY,
    size: 12,
    font: fonts.avenir || fonts.malayalam || studentNameFont,
    color: rgb(0, 0, 0),
  });

  // 5. Draw roll number
  const rollY = classY - 15;
  const rollText = `Roll # ${rollNumber}`;
  const rollWidth = fonts.avenir
    ? fonts.avenir.widthOfTextAtSize(rollText, 11)
    : rollText.length * (11 * 0.6);

  firstPage.drawText(rollText, {
    x: leftMargin,
    y: rollY,
    size: 11,
    font: fonts.avenir || fonts.malayalam || studentNameFont,
    color: rgb(0, 0, 0),
  });

  // 6. Draw school name (processed with special case handling)
  const schoolNameY = rollY - 25;
  const schoolNameWidth = schoolNameFont
    ? schoolNameFont.widthOfTextAtSize(processedSchoolName, schoolNameFontSize)
    : processedSchoolName.length * (schoolNameFontSize * 0.6);

  firstPage.drawText(processedSchoolName, {
    x: leftMargin,
    y: schoolNameY,
    size: schoolNameFontSize,
    font: schoolNameFont,
    color: rgb(0, 0, 0),
    maxWidth: width - leftMargin * 2,
  });

  return await pdfDoc.save();
}

// Batch generation function
export async function generateStudentCertificates(
  students: StudentReportForCertificates[]
): Promise<
  {
    blob: Blob;
    studentName: string;
    class: number;
    rollNumber: string;
    fatherName: string;
  }[]
> {
  const results: {
    blob: Blob;
    studentName: string;
    class: number;
    rollNumber: string;
    fatherName: string;
  }[] = [];

  // Group students by award level for efficiency
  const studentsByAward = students.reduce((acc, student) => {
    const awardLevel = student.AwardLevel || "PARTICIPATION";
    if (!acc[awardLevel]) {
      acc[awardLevel] = [];
    }
    acc[awardLevel].push(student);
    return acc;
  }, {} as Record<string, StudentReportForCertificates[]>);

  // Process each award type
  for (const [awardLevel, awardStudents] of Object.entries(studentsByAward)) {
    console.log(
      `Processing ${awardStudents.length} ${awardLevel} certificates...`
    );

    // Load template once per award type for efficiency
    const templatePath = getAwardTemplatePath(awardLevel);
    const templateBytes = await loadCertificateTemplate(templatePath);

    for (const student of awardStudents) {
      // Enhanced validation (matching React PDF data filtering)
      if (
        !student ||
        typeof student !== "object" ||
        !student.studentName ||
        !student.rollNumber ||
        typeof student.class !== "number"
      ) {
        console.warn("Skipping invalid student:", student);
        continue;
      }

      try {
        const pdfBytes = await generateStudentCertificate(
          student,
          templateBytes
        );
        const blob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });

        results.push({
          blob,
          studentName: student.studentName.trim(),
          class: student.class,
          rollNumber: student.rollNumber.trim(),
          fatherName: (student.fatherName || "").trim(),
        });

        console.log(`✓ Generated certificate for ${student.studentName}`);
      } catch (error) {
        console.error(
          `✗ Failed to generate certificate for ${student.studentName}:`,
          error
        );
      }

      // Small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}
