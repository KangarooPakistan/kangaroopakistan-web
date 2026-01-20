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
        malayalamBoldRes.status,
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
    text,
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
// Special capitalization for names with dashes and periods
const processNameWithSpecialCharacters = (text: string): string => {
  if (!text) return text;

  // List of connecting words that should remain lowercase after dash/period
  const lowercaseConnectors = ["e", "ul", "ud", "un", "us", "al"];

  // Split by spaces to handle each word separately
  const words = text.split(" ");

  const processedWords = words.map((word) => {
    // Check if word contains dash or period
    if (word.includes("-") || word.includes(".")) {
      // Split by dash or period while keeping the separators
      const parts = word.split(/([.-])/);

      return parts
        .map((part, index) => {
          // If it's a separator (dash or period), keep it as is
          if (part === "-" || part === ".") {
            return part;
          }

          // If it's text and not empty
          if (part.length > 0) {
            const isFirstPart = index === 0;
            const partLower = part.toLowerCase();

            // Check if this part is a connecting word that should stay lowercase
            const isConnector = lowercaseConnectors.includes(partLower);

            if (!isFirstPart && isConnector) {
              // Keep connecting words lowercase (e.g., "e" in "Um-e-Halima", "ul" in "Um-ul-Qurra")
              return partLower;
            } else {
              // Capitalize first letter for other parts
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
          }

          return part;
        })
        .join("");
    } else {
      // No special characters, apply normal title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  });

  // Handle " Ii " to " II " replacement
  let result = processedWords.join(" ");
  result = result.replace(/\s+Ii\s+/g, " II ");

  return result;
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
  studentNameLength?: number,
): number => {
  const nameLength = studentNameLength || text.length;
  if (nameLength > 30) {
    return isArabic ? 25 : 27;
  } else {
    return isArabic ? 25 : 36;
  }
};

const getFatherNameFontSize = (
  text: string,
  isArabic: boolean,
  studentNameLength?: number,
): number => {
  const nameLength = studentNameLength || text.length;
  if (nameLength > 30) {
    return isArabic ? 20 : 22;
  } else {
    return isArabic ? 20 : 24;
  }
};

const getSchoolNameFontSize = (
  text: string,
  isArabic: boolean,
  schoolNameLength?: number,
): number => {
  const nameLength = schoolNameLength || text.length;
  if (nameLength > 30) {
    return isArabic ? 20 : 16;
  } else {
    return isArabic ? 20 : 20;
  }
};

// Text measurement and drawing helpers for letter spacing and wrapping
const measureTextWidthWithTracking = (
  text: string,
  font: any,
  fontSize: number,
  tracking: number,
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
  },
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
// Get award template path (matching React PDF logic)
const getAwardTemplatePath = (
  awardLevel: string | null | undefined,
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
  templatePath: string,
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
  templateBytes?: Uint8Array,
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

  // Horizontal text band: left 140, right 440 (all text centered within this band)
  // const bandLeft = 140;
  // const bandRight = 480; //  iksc
  const bandLeft = 300; // iklc
  const bandRight = 600;
  const bandCenterX = (bandLeft + bandRight) / 2;

  // Prepare text values with safe defaults and proper processing
  const studentName = processNameWithSpecialCharacters(
    student.studentName || "Student Name",
  );
  const fatherName = processNameWithSpecialCharacters(
    student.fatherName || "Father Name",
  );
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
  const schoolNameLength = schoolName.length;
  const studentNameFontSize = getStudentNameFontSize(
    studentName,
    false,
    studentNameLength,
  );
  const fatherNameFontSize = getFatherNameFontSize(
    fatherName,
    false,
    studentNameLength,
  );
  const schoolNameFontSize = getSchoolNameFontSize(
    schoolName,
    false,
    schoolNameLength,
  );

  // Determine if this is a participation certificate and set proper top position
  const isParticipationCertificate =
    getAwardTemplatePath(student.AwardLevel) ===
    "/templates/participation_award.pdf";
  const schoolNameFont = fonts.avenir || fonts.malayalamBold || fonts.malayalam;
  const maxSchoolWidth = bandRight - bandLeft; // constrain to the band width
  const bodyTracking = 0.5; // adjust between 0.5–1.0 for more/less spacing
  const schoolLines = wrapTextToLines(
    processedSchoolName,
    schoolNameFont,
    schoolNameFontSize,
    maxSchoolWidth,
    bodyTracking,
    2, // max 2 lines
  );

  // FIXED: Different top positions for participation vs other certificates
  // const topPosition = isParticipationCertificate ? 290 : 280; // iksc
  const topPosition = schoolLines.length > 1 ? 240 : 250;
  const baseY = height - topPosition;

  // Select fonts (matching React PDF font selection)
  const studentNameFont = isStudentNameArabic
    ? fonts.almaraiBold || fonts.malayalamBold
    : fonts.snell || fonts.malayalamBold;

  // Student name keeps using Snell; all other text uses Avenir (fallback to Malayalam)
  const fatherNameFont = fonts.avenir || fonts.malayalamBold || fonts.malayalam;


  // 1. Draw student name (processed with title case and "II" handling)
  const studentNameWidth = studentNameFont
    ? studentNameFont.widthOfTextAtSize(studentName, studentNameFontSize)
    : studentName.length * (studentNameFontSize * 0.6);

  // Center student name within [bandLeft, bandRight]
  const studentNameX = bandCenterX - studentNameWidth / 2;
  firstPage.drawText(studentName, {
    x: studentNameX,
    y: baseY,
    size: studentNameFontSize,
    font: studentNameFont,
    color: rgb(0, 0, 0),
  });

  // Horizontal center for all subsequent text in the band
  const studentNameCenterX = bandCenterX;

  // Tracking for non-student text (letter spacing)
  
  // 2. Draw "S/o, D/o" text - Reduced gap from student name
  const soDoY = baseY - (isStudentNameArabic ? 25 : 25);
  const soDoText = "S/o | D/o";

  drawCenteredTextWithTracking(firstPage, soDoText, {
    centerX: studentNameCenterX,
    y: soDoY,
    font: fonts.avenir || fonts.malayalam || studentNameFont,
    size: 12,
    color: rgb(0, 0, 0),
    tracking: bodyTracking,
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

  drawCenteredTextWithTracking(firstPage, fatherNameLowercase, {
    centerX: studentNameCenterX,
    y: fatherNameY,
    font: fatherNameFont,
    size: fatherNameFontSize,
    color: rgb(0, 0, 0),
    tracking: bodyTracking,
  });

  // 4. Draw class information
  const classY = fatherNameY - (isFatherNameArabic ? 25 : 25);
  const classText = `Grade ${className}`;

  drawCenteredTextWithTracking(firstPage, classText, {
    centerX: studentNameCenterX,
    y: classY,
    font: fonts.avenir || fonts.malayalam || studentNameFont,
    size: 14,
    color: rgb(0, 0, 0),
    tracking: bodyTracking,
  });

  // 5. Draw roll number
  // const rollY = classY - 25; //iksc
  const rollY = classY - 15; //iklc
  const rollText = `Roll # ${rollNumber}`;

  drawCenteredTextWithTracking(firstPage, rollText, {
    centerX: studentNameCenterX,
    y: rollY,
    font: fonts.avenir || fonts.malayalam || studentNameFont,
    size: 14,
    color: rgb(0, 0, 0),
    tracking: bodyTracking,
  });

  // 6. Draw school name (processed with special case handling)
  const schoolNameY = rollY - 25;

  const schoolLineHeight = schoolNameFontSize + 2;

  schoolLines.forEach((line, index) => {
    const lineY = schoolNameY - index * schoolLineHeight;
    drawCenteredTextWithTracking(firstPage, line, {
      centerX: studentNameCenterX,
      y: lineY,
      font: schoolNameFont,
      size: schoolNameFontSize,
      color: rgb(0, 0, 0),
      tracking: bodyTracking,
    });
  });

  return await pdfDoc.save();
}

// Batch generation function
export async function generateStudentCertificates(
  students: StudentReportForCertificates[],
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
  const studentsByAward = students.reduce(
    (acc, student) => {
      const awardLevel = student.AwardLevel || "PARTICIPATION";
      if (!acc[awardLevel]) {
        acc[awardLevel] = [];
      }
      acc[awardLevel].push(student);
      return acc;
    },
    {} as Record<string, StudentReportForCertificates[]>,
  );

  // Process each award type
  for (const [awardLevel, awardStudents] of Object.entries(studentsByAward)) {
    console.log(
      `Processing ${awardStudents.length} ${awardLevel} certificates...`,
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
          templateBytes,
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
          error,
        );
      }

      // Small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}
