// GoldCertificate.tsx
import { Font, Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { useEffect, useState, useMemo } from "react";
import { StudentReportForCertificates } from "../columns";

// Font registration singleton to prevent multiple registrations
let fontsRegistered = false;
let fontRegistrationPromise: Promise<void> | null = null;

export const registerFonts = async (): Promise<void> => {
  if (fontsRegistered) {
    console.log("Fonts already registered");
    return;
  }

  if (fontRegistrationPromise) {
    console.log("Font registration in progress");
    return fontRegistrationPromise;
  }

  fontRegistrationPromise = (async () => {
    try {
      console.log("Starting font registration...");

      // Register Roboto fonts
      await Font.register({
        family: "Roboto",
        fonts: [
          {
            src: "/fonts/Roboto-Regular.ttf",
            fontWeight: 400,
            fontStyle: "normal",
          },
          {
            src: "/fonts/Roboto-Bold.ttf",
            fontWeight: 700,
            fontStyle: "normal",
          },
          {
            src: "/fonts/Roboto-Italic.ttf",
            fontWeight: 400,
            fontStyle: "italic",
          },
        ],
      });
      console.log("Roboto fonts registered");

      // Register Cairo fonts - fix the path from /font/ to /fonts/
      await Font.register({
        family: "Cairo",
        fonts: [
          { src: "/font/Cairo-ExtraLight.ttf", fontWeight: 100 },
          { src: "/font/Cairo-Light.ttf", fontWeight: 300 },
          { src: "/font/Cairo-Regular.ttf", fontWeight: 400 },
          { src: "/font/Cairo-Medium.ttf", fontWeight: 500 },
          { src: "/font/Cairo-SemiBold.ttf", fontWeight: 600 },
          { src: "/font/Cairo-Bold.ttf", fontWeight: 700 },
          { src: "/font/Cairo-ExtraBold.ttf", fontWeight: 800 },
          { src: "/font/Cairo-Black.ttf", fontWeight: 900 },
        ],
      });

      await Font.register({
        family: "Amiri",
        fonts: [
          { src: "/fonts/Amiri-Regular.ttf", fontWeight: 400 },
          { src: "/fonts/Amiri-Bold.ttf", fontWeight: 700 },
        ],
      });
      console.log("Cairo fonts registered");

      // Register other local fonts with error handling
      const additionalFonts = [
        {
          family: "Snell-Roundhand",
          fonts: [
            { src: "/fonts/Snell-Roundhand-Bold-Script.otf", fontWeight: 700 },
          ],
        },
        {
          family: "Malayalam",
          fonts: [
            { src: "/fonts/malayalam-mn.ttf", fontWeight: 400 },
            { src: "/fonts/malayalam-mn-bold.ttf", fontWeight: 700 },
          ],
        },
        {
          family: "GreatVibes",
          fonts: [{ src: "/fonts/GreatVibes-Regular.ttf", fontWeight: 400 }],
        },
        {
          family: "Almarai",
          fonts: [
            { src: "/fonts/IBM/Almarai-Regular.ttf", fontWeight: 400 },
            { src: "/fonts/IBM/Almarai-Bold.ttf", fontWeight: 700 },
            { src: "/fonts/IBM/Almarai-ExtraBold.ttf", fontWeight: 800 },
            { src: "/fonts/IBM/Almarai-Light.ttf", fontWeight: 300 },
          ],
        },
        {
          family: "NotoSansArabic",
          fonts: [
            { src: "/fonts/NotoSansArabic-Regular.ttf", fontWeight: 400 },
            { src: "/fonts/NotoSansArabic-Medium.ttf", fontWeight: 500 },
            { src: "/fonts/NotoSansArabic-SemiBold.ttf", fontWeight: 600 },
            { src: "/fonts/NotoSansArabic-Bold.ttf", fontWeight: 700 },
            { src: "/fonts/NotoSansArabic-ExtraBold.ttf", fontWeight: 800 },
            { src: "/fonts/NotoSansArabic-Black.ttf", fontWeight: 900 },
          ],
        },
      ];

      // Register additional fonts with individual error handling
      for (const fontConfig of additionalFonts) {
        try {
          await Font.register(fontConfig);
          console.log(`${fontConfig.family} fonts registered`);
        } catch (error) {
          console.warn(`Failed to register ${fontConfig.family}:`, error);
          // Continue with other fonts
        }
      }

      fontsRegistered = true;
      console.log("All fonts registered successfully");
    } catch (error) {
      console.error("Critical font registration failed:", error);
      fontsRegistered = false;
      fontRegistrationPromise = null;
      throw error;
    }
  })();

  await fontRegistrationPromise;
  fontRegistrationPromise = null;
};
export const ensureFontsLoaded = async () => {
  await registerFonts();
  // Add a small delay to ensure fonts are fully loaded
  await new Promise((resolve) => setTimeout(resolve, 100));
};

interface GoldCertificateProps {
  data: StudentReportForCertificates[];
  onDocumentRender?: () => void;
}

interface StudentReportPageProps {
  student: StudentReportForCertificates;
  onRender?: () => void;
}

// ... (SmartText, SmartText2, SmartTextSchoolName components remain unchanged)

const StudentReportPage: React.FC<StudentReportPageProps> = ({
  student,
  onRender,
}) => {
  useEffect(() => {
    onRender?.();
    return () => {
      // Cleanup when component unmounts
    };
  }, [onRender]);

  if (!student) {
    return (
      <Page size="A4" orientation="landscape">
        <View style={{ padding: 20 }}>
          <Text>Student data not available</Text>
        </View>
      </Page>
    );
  }

  const getAwardImage = (awardLevel: string | null | undefined) => {
    if (!awardLevel) return "/participation_medal.png";
    const level = awardLevel.toUpperCase().replace(/\s+/g, "_");
    switch (level) {
      case "GOLD":
        return "/gold_medal_template.png";
      case "SILVER":
        return "/silver_medal.png";
      case "BRONZE":
        return "/bronze_medal.png";
      case "THREE_STAR":
        return "/threestar_medal.png";
      case "TWO_STAR":
        return "/twostar_medal.png";
      case "ONE_STAR":
        return "/onestar_medal.png";
      case "PARTICIPATION":
        return "/participation_certificate_updated.png";
      default:
        return "/participation_certificate_updated.png";
    }
  };

  const backgroundImage = getAwardImage(student?.AwardLevel);
  const isParticipationCertificate =
    backgroundImage === "/participation_certificate_updated.png";
  const topPosition = isParticipationCertificate ? 220 : 215;
  const studentNameLength = student?.studentName?.length || 0;

  return (
    <Page
      size="A4"
      orientation="landscape"
      style={{ margin: 0, padding: 0, position: "relative" }}>
      <Image
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 842,
          height: 595,
          zIndex: -1,
          opacity: 1,
        }}
        src={backgroundImage}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 842,
          height: 595,
          zIndex: 2,
          justifyContent: "center",
          alignItems: "center",
        }}>
        <View style={{ position: "absolute", top: topPosition, width: "100%" }}>
          <SmartText
            text={student?.studentName || "Student Name"}
            studentNameLength={studentNameLength}
            style={{
              fontWeight: "bold",
              color: "#000",
              textAlign: "center",
              padding: 5,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Malayalam",
              textAlign: "center",
              width: "100%",
            }}>
            S/o , D/o
          </Text>
          <SmartText2
            text={student?.fatherName || "Father Name"}
            studentNameLength={studentNameLength}
            style={{
              fontWeight: "bold",
              color: "#000",
              textAlign: "center",
              padding: 5,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Malayalam",
              textAlign: "center",
              width: "100%",
            }}>
            Year / Grade {student?.class || "N/A"}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Malayalam",
              textAlign: "center",
              width: "100%",
            }}>
            Roll # {student?.rollNumber || "N/A"}
          </Text>
          <SmartTextSchoolName text={student?.schoolName || "School Name"} />
        </View>
      </View>
    </Page>
  );
};

export const SmartText: React.FC<{
  text: string | null | undefined;
  studentNameLength?: number;
  style?: any;
}> = ({ text, studentNameLength, style }) => {
  // Add this helper function after the imports, before any components
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
  const safeText = processTextForCapitalization(text || "");
  const isArabicText = safeText
    ? /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
        safeText
      )
    : false;

  // Determine font size based on student name length
  const getFontSize = () => {
    const nameLength = studentNameLength || safeText.length;
    if (nameLength > 30) {
      return isArabicText ? 25 : 22;
    } else {
      return isArabicText ? 25 : 30;
    }
  };

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Almarai" : "Snell-Roundhand",
          textAlign: "center",
          fontWeight: isArabicText ? "700" : "700",
          fontSize: getFontSize(),
          width: "100%",
          alignSelf: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "row",
          direction: isArabicText ? "rtl" : "ltr",
          alignItems: "center",
          minWidth: 300,
          maxWidth: "100%",
          marginVertical: isArabicText ? 4 : 0,
        },
      ]}>
      {safeText}
    </Text>
  );
};

export const SmartText2: React.FC<{
  text: string | null | undefined;
  studentNameLength?: number;
  style?: any;
}> = ({ text, studentNameLength, style }) => {
  const safeText = text || "";
  const isArabicText = /[\u0600-\u06FF]/.test(safeText);

  // Determine font size based on student name length
  const getFontSize = () => {
    const nameLength = studentNameLength || safeText.length;
    if (nameLength > 30) {
      return isArabicText ? 20 : 20;
    } else {
      return isArabicText ? 20 : 24;
    }
  };

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Almarai" : "Snell-Roundhand",
          textAlign: "center",
          textTransform: "capitalize",
          fontWeight: isArabicText ? "600" : "700",
          fontSize: getFontSize(),
          width: "100%",
          alignSelf: "center",
          justifyContent: "center",
          display: "flex",
          direction: isArabicText ? "rtl" : "ltr",
          flexDirection: "row",
          alignItems: "center",
          minWidth: 300,
          maxWidth: "100%",
          marginVertical: isArabicText ? 2 : 0,
        },
      ]}>
      {safeText.toLowerCase()}
    </Text>
  );
};

export const SmartTextSchoolName: React.FC<{
  text: string | null | undefined;
  style?: any;
}> = ({ text, style }) => {
  const safeText = text || "";
  const isArabicText = /[\u0600-\u06FF]/.test(safeText);

  // Process text to uppercase content within parentheses while keeping parentheses
  const processedText = safeText
    .replace(/(\([^)]+\))/g, (match) => {
      // Extract text inside parentheses, convert to uppercase, and keep parentheses
      const innerText = match.slice(1, -1).toUpperCase();
      return `(${innerText})`;
    })
    .replace(/([^\(]+)(?=\s*\()/g, (match) => match.toLowerCase());

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Almarai" : "Malayalam",
          textAlign: "center",
          textTransform: "capitalize",
          fontWeight: isArabicText ? "700" : "700",
          fontSize: isArabicText ? "20px" : "15px",
          width: "100%",
          direction: isArabicText ? "rtl" : "ltr",
          alignSelf: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minWidth: 300,
          marginVertical: isArabicText ? 4 : 0,
          maxWidth: "100%",
        },
      ]}>
      {processedText}
    </Text>
  );
};

const GoldCertificate: React.FC<GoldCertificateProps> = ({
  data,
  onDocumentRender,
}) => {
  const [fontsLoaded, setFontsLoaded] = useState(fontsRegistered); // Initialize with fontsRegistered
  const [fontLoadError, setFontLoadError] = useState(false);

  const safeData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.warn("Invalid data provided to GoldCertificate:", data);
      return [];
    }

    return data.filter((student) => {
      return (
        student &&
        typeof student === "object" &&
        student.studentName &&
        student.rollNumber &&
        typeof student.class === "number"
      );
    });
  }, [data]);

  useEffect(() => {
    let isMounted = true;

    const loadFonts = async () => {
      try {
        await registerFonts();
        await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for font loading
        if (isMounted) {
          setFontsLoaded(true);
          console.log("Fonts loaded in GoldCertificate");
        }
      } catch (error) {
        console.error("Failed to load fonts in GoldCertificate:", error);
        if (isMounted) {
          setFontLoadError(true);
        }
      }
    };

    if (!fontsRegistered) {
      loadFonts();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (fontLoadError) {
    return (
      <Document>
        <Page>
          <View style={{ padding: 20 }}>
            <Text>Error loading fonts</Text>
          </View>
        </Page>
      </Document>
    );
  }

  if (!fontsLoaded) {
    return (
      <Document>
        <Page>
          <View style={{ padding: 20 }}>
            <Text>Loading fonts...</Text>
          </View>
        </Page>
      </Document>
    );
  }

  if (safeData.length === 0) {
    return (
      <Document>
        <Page>
          <View style={{ padding: 20 }}>
            <Text>No valid student data</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document
      producer="Your App Name"
      creator="Your App Name"
      title="Certificates"
      onRender={onDocumentRender}>
      {safeData.map((student, index) => (
        <StudentReportPage
          key={`cert-${student?.rollNumber || index}-${Date.now()}`}
          student={student}
        />
      ))}
    </Document>
  );
};

export const SafeGoldCertificate: React.FC<GoldCertificateProps> = (props) => {
  try {
    return <GoldCertificate {...props} />;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return (
      <Document>
        <Page>
          <View style={{ padding: 20 }}>
            <Text>
              Error generating PDF:{" "}
              {typeof error === "object" && error !== null && "message" in error
                ? (error as { message?: string }).message
                : String(error)}
            </Text>
          </View>
        </Page>
      </Document>
    );
  }
};

export default GoldCertificate;
