import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";
import axios from "axios";

// Create styles for the PDF

interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentClass: string; // Assuming 'class' is a string like '1A', '2B', etc.
  studentLevel: string;
  schoolId: number;
  schoolName: string;
  address: string; // Assuming 'class' is a string like '1A', '2B', etc.
}
interface profileData {
  p_Name: string;
  p_contact: string;
  c_Name: string;
  email: string;
  contactNumber: string;
  contestName: string;
  contestCh: string;
  contestNo: string;
}

interface AttendanceSheetProps {
  schoolData: Student[];
  profileData: profileData | null | undefined;
}

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});
Font.register({
  family: "Helvetica Neue",
  fonts: [
    { src: "/font/newfont/HelveticaNeueThin.otf", fontWeight: 300 },
    { src: "/font/newfont/HelveticaNeueRoman.otf", fontWeight: 400 },
    { src: "/font/newfont/HelveticaNeueMedium.otf", fontWeight: 500 },
    { src: "/font/newfont/HelveticaNeueBold.otf", fontWeight: 700 },
    { src: "/font/newfont/HelveticaNeueBlack.otf", fontWeight: 900 },
  ],
});
Font.register({
  family: "Tajawal",
  fonts: [
    { src: "/font/Tajawal-ExtraLight.ttf", fontWeight: 100 },
    { src: "/font/Tajawal-Light.ttf", fontWeight: 300 },
    { src: "/font/Tajawal-Regular.ttf", fontWeight: 400 },
    { src: "/font/Tajawal-Medium.ttf", fontWeight: 500 },
    { src: "/font/Tajawal-Bold.ttf", fontWeight: 700 },
    { src: "/font/Tajawal-ExtraBold.ttf", fontWeight: 800 },
    { src: "/font/Tajawal-Black.ttf", fontWeight: 900 },
  ],
  fontWeight: 400,
});
const styles = StyleSheet.create({
  image: {
    width: 50, // Set the width of your image
    height: 50, // Set the height of your image
    // Optional: add some margin if needed
  },
  image_bottom: {
    marginRight: "20px",
    width: 160, // Set the width of your image
    height: 45, // Set the height of your image
    // Optional: add some margin if needed
  },
  page: {
    padding: "10px",
    flexDirection: "column",
    backgroundColor: "#FFF",
  },
  header: {
    fontSize: "12px",
    textTransform: "uppercase",
    textAlign: "center",

    marginVertical: "10px",
    fontFamily: "Helvetica Neue",
    fontWeight: 700,
  },
  subHeader: {
    fontSize: "10px",
    fontWeight: "black",
    textTransform: "uppercase",

    marginVertical: "1px",

    textAlign: "left",
  },
  subHeaderBelow: {
    marginVertical: "5px",
    fontSize: "10px",
    textTransform: "uppercase",

    fontWeight: "heavy",
    textAlign: "center",
  },
  subHeading: {
    marginVertical: "12px",
    fontSize: "12px",
    textAlign: "center",
    textTransform: "uppercase",

    fontWeight: "black",
  },

  subHeadingTwo: {
    fontSize: "12px",
    textTransform: "uppercase",

    textAlign: "center",
    fontWeight: "black",
    marginVertical: "0px",
  },
  subHeadingThree: {
    fontSize: "12px",
    textTransform: "uppercase",

    textAlign: "center",
    fontWeight: "extrabold",
    marginVertical: "5px",
  },
  schoolInfo: {
    marginVertical: 3,
  },
  totalStudentsText: {
    fontSize: "12px",
    width: "500px",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    textTransform: "uppercase",
    fontFamily: "Helvetica Neue",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#000",
    textAlign: "left",
  },
  totalStudentsTextRight: {
    fontSize: "12px",
    width: "500px",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    textTransform: "uppercase",
    fontFamily: "Helvetica Neue",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#000",
    textAlign: "center",
  },
  totalStudentsTextNew: {
    fontSize: "16px",
    width: "800px",
    textTransform: "uppercase",
    fontFamily: "Helvetica Neue",
    marginVertical: "7px",
    textAlign: "left",
  },
  totalStudentsTextNewBold: {
    fontSize: "18px",
    width: "200px",
    textTransform: "uppercase",
    fontFamily: "Helvetica Neue",
    marginVertical: "7px",
    textAlign: "left",
    fontWeight: 700,
  },
  studentTable: {
    marginVertical: "5px",
    borderTop: 1,
    borderColor: "#000",
  },
  tableColHeaderMid: {
    width: "15%",

    borderRight: 1,
    borderColor: "#000",
    padding: 2,
    flexWrap: "wrap",

    backgroundColor: "#eee", // Optional for header background
  },
  tableColHeaderLeft: {
    width: "35%",
    borderRight: 1,
    borderColor: "#000",
    padding: 2,
    backgroundColor: "#eee", // Optional for header background
  },
  tableColLeft: {
    width: "35%",
    borderRight: 1,
    borderColor: "#000",
    padding: 2,
    flexWrap: "wrap",
  },
  tableColMid: {
    width: "25%",
    borderRight: 1,
    borderColor: "#000",
    padding: 2,
    flexWrap: "wrap",
  },
  newView: {},
  newViewText: {
    textTransform: "uppercase",
    fontSize: "12px",
    marginVertical: "5px",
    textAlign: "left",
  },
  tableCellHeader: {
    fontSize: 10,
    textTransform: "uppercase",

    fontWeight: "bold",
    textAlign: "center", // Center align header text
  },
  title: {
    fontSize: 16,
    fontFamily: "Roboto",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Roboto",
    textAlign: "center",
    marginBottom: 20,
  },
  signature: {
    marginTop: 10,
    fontFamily: "Roboto",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  paragraph: {
    fontSize: "10px",
    marginBottom: 4,
    fontFamily: "Roboto",
  },

  paragraphBold: {
    fontSize: "10px",
    marginBottom: 4,
    fontWeight: "extrabold",
    fontFamily: "Roboto",
  },
  spacer: {
    height: 20, // Adjust this value to increase or decrease space
  },

  table: {
    display: "flex",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  tableColHeader: {
    width: "11%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    // borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
  },
  tableCol: {
    width: "11%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
  },
  tableColWide: {
    width: "23%",
    borderStyle: "solid",
    borderWidth: 1,
    flexWrap: "wrap",

    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    fontSize: "9px",
    textTransform: "uppercase",
    minHeight: "20px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxLines: 2,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100% !important",
    flexWrap: "wrap",
    fontWeight: "bold",
    textAlign: "center",
  },

  stylesArabic: {
    fontFamily: "Tajawal",
    direction: "rtl",
    textAlign: "right", // Ensure text is left-aligned
    fontWeight: "400",
    fontSize: "10px",
    justifyContent: "flex-start",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    // marginRight: "10px",
  },
});

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  schoolData,
  profileData,
}) => {
  const groupedStudents: Record<string, Record<string, Student[]>> = {};
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // useEffect(() => {
  //   const loadFonts = async () => {
  //     await Font.register({
  //       family: "Roboto",
  //       fonts: [
  //         { src: "/fonts/Roboto-Regular.ttf" },
  //         { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  //       ],
  //     });
  //     await Font.register({
  //       family: "Cairo",
  //       fonts: [
  //         { src: "/font/Cairo-ExtraLight.ttf", fontWeight: 100 },
  //         { src: "/font/Cairo-Light.ttf", fontWeight: 300 },
  //         { src: "/font/Cairo-Regular.ttf", fontWeight: 400 },
  //         { src: "/font/Cairo-Medium.ttf", fontWeight: 500 },
  //         { src: "/font/Cairo-SemiBold.ttf", fontWeight: 600 },
  //         { src: "/font/Cairo-Bold.ttf", fontWeight: 700 },
  //         { src: "/font/Cairo-ExtraBold.ttf", fontWeight: 800 },
  //         { src: "/font/Cairo-Black.ttf", fontWeight: 900 },
  //       ],
  //     });

  //     setFontsLoaded(true);
  //   };

  //   loadFonts();
  // }, []);

  let preecolierCount = 0;
  let ecolierCount = 0;
  let benjaminCount = 0;
  let cadetCount = 0;
  let juniorCount = 0;
  let studentCount = 0;

  schoolData.forEach((student) => {
    if (!groupedStudents[student.studentLevel]) {
      groupedStudents[student.studentLevel] = {};
    }
    if (!groupedStudents[student.studentLevel][student.studentClass]) {
      groupedStudents[student.studentLevel][student.studentClass] = [];
    }
    groupedStudents[student.studentLevel][student.studentClass].push(student);
    switch (student.studentLevel) {
      case "preecolier":
        preecolierCount++;
        break;
      case "ecolier":
        ecolierCount++;
        break;
      case "benjamin":
        benjaminCount++;
        break;
      case "cadet":
        cadetCount++;
        break;
      case "junior":
        juniorCount++;
        break;
      case "student":
        studentCount++;
        break;
      default:
        break;
    }
  });

  function getStudentLevel(classStr: string) {
    switch (classStr) {
      case "preecolier":
        return "Pre Ecolier Level (Class 01 and 02)";
      case "ecolier":
        return "Ecolier Level (Class 03 and 04)";
      case "benjamin":
        return "Benjamin Level (Class 05 and 06)";
      case "cadet":
        return "Cadet Level (Class 07 and 08)";
      case "junior":
        return "Junior Level (Class 09 and 10)";
      case "student":
        return "Student (class 11 and 12)";
      default:
        return "Unknown";
    }
  }
  const getOrdinalSuffix = (number: string) => {
    const num = parseInt(number);
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;

    // Special case for 11, 12, 13
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return "th";
    }

    switch (lastDigit) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginRight: "20px",
            marginLeft: "30px",
            flexDirection: "row",
          }}>
          {profileData?.contestCh === "M" ? (
            <Image
              style={styles.image}
              src="/innovative-learning.jpg" // Replace with your image path or URL
            />
          ) : profileData?.contestCh === "S" ? (
            <Image
              style={styles.image}
              src="/innventive_learning.jpg" // Replace with your image path or URL
            />
          ) : (
            <Image
              style={styles.image}
              src="/innovative-learning.jpg" // Replace with your image path or URL
            />
          )}

          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              flexWrap: "wrap",
              marginLeft: "10px",
              flexDirection: "row",
            }}>
            <Text style={styles.header}>
              {profileData?.contestNo}
              <Text
                style={{
                  verticalAlign: "super",
                  fontSize: 10,
                  textTransform: "lowercase",
                }}>
                {profileData?.contestNo
                  ? getOrdinalSuffix(profileData.contestNo)
                  : "th"}
              </Text>{" "}
              {profileData?.contestName}
            </Text>
          </View>
        </View>
        <View
          style={{
            marginTop: "15px",
            marginBottom: "15px",
            flexDirection: "row",
            marginLeft: "10px",
            marginRight: "10px",
            display: "flex",
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
          }}>
          <SmartTextHeadingTop text={schoolData[0].schoolName} />
        </View>

        <View
          style={{
            marginHorizontal: "20px",
            // marginBottom: "10px",
            borderWidth: 1,
          }}>
          {/* School ID row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              alignItems: "center",
              borderBottomColor: "#ccc",
            }}>
            <View
              style={{
                width: "40%",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <SmartTextHeading text="SCHOOL ID" />
                {/* <SmartTextHeading text="رمز المدرسة" /> */}
              </View>
            </View>
            <View style={{ width: "70%", padding: "6px" }}>
              <SmartText text={schoolData[0].schoolId} />
            </View>
          </View>

          {/* Contact Number row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              backgroundColor: "#f5f5f5",
            }}>
            <View
              style={{
                width: "40%",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <SmartTextHeading text="CONTACT NUMBER" />
                {/* <SmartTextHeading text="رقم الهاتف" /> */}
              </View>
            </View>
            <View style={{ width: "70%", padding: "6px" }}>
              <SmartText text={profileData?.contactNumber} />
            </View>
          </View>

          {/* Principal Name row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
            }}>
            <View
              style={{
                width: "40%",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  // alignItems: "flex-start",
                  alignItems: "center",
                }}>
                <SmartTextHeading text="PRINCIPAL NAME" />
                {/* <SmartTextHeading text="اسم المدير" /> */}
              </View>
            </View>
            <View style={{ width: "60%", padding: "6px" }}>
              <SmartText text={profileData?.p_Name} />
            </View>
          </View>

          {/* Coordinator Name row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              backgroundColor: "#f5f5f5",
            }}>
            <View
              style={{
                width: "40%",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <SmartTextHeading text="COORDINATOR NAME" />
                {/* <SmartTextHeading text="اسم المنسق" /> */}
              </View>
            </View>
            <View style={{ width: "70%", padding: "6px" }}>
              <SmartText text={profileData?.c_Name} />
            </View>
          </View>

          {/* Address row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
            }}>
            <View
              style={{
                width: "40%",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",

                  // alignItems: "flex-start",
                }}>
                <SmartTextHeading text="ADDRESS" />
                {/* <SmartTextHeading text="العنوان" /> */}
              </View>
            </View>

            <View style={{ width: "70%", padding: "6px" }}>
              <SmartText text={schoolData[0].address} />
            </View>
          </View>

          {/* Email row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              backgroundColor: "#f5f5f5",
            }}>
            <View
              style={{
                width: "40%",
                backgroundColor: "#f5f5f5",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <SmartTextHeading text="EMAIL ADDRESS" />
                {/* <SmartTextHeading text="البريد الإلكتروني" /> */}
              </View>
            </View>

            <View style={{ width: "70%", padding: "6px" }}>
              <SmartTextBold text={profileData?.email} />
            </View>
          </View>

          {/* Second Contact Number row (from p_contact) */}
          <View
            style={{
              flexDirection: "row",
            }}>
            <View
              style={{
                width: "40%",
                padding: "6px",
              }}>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <SmartTextHeading text="CONTACT NUMBER" />
                {/* <SmartTextHeading text="رقم الهاتف" /> */}
              </View>
            </View>
            <View style={{ width: "70%", padding: "6px" }}>
              <SmartText text={profileData?.p_contact} />
            </View>
          </View>
        </View>
        <Text
          style={{
            fontSize: "18px",
            textAlign: "center",
            textTransform: "uppercase",
            marginTop: "10px",
            marginBottom: "10px",
            fontFamily: "Helvetica Neue",
            fontWeight: 600,
          }}>
          List of registered students
        </Text>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={[styles.totalStudentsText, { backgroundColor: "#fff" }]}>
            preecolier (1 & 2):
          </Text>{" "}
          <Text
            style={[
              styles.totalStudentsTextRight,
              { backgroundColor: "#fff" },
            ]}>
            {preecolierCount}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={styles.totalStudentsText}>Ecolier (3 & 4):</Text>{" "}
          <Text style={[styles.totalStudentsTextRight]}>{ecolierCount}</Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={[styles.totalStudentsText, { backgroundColor: "#fff" }]}>
            Benjamin (5 & 6):
          </Text>{" "}
          <Text
            style={[
              styles.totalStudentsTextRight,
              { backgroundColor: "#fff" },
            ]}>
            {benjaminCount}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={styles.totalStudentsText}>Cadet (7 & 8):</Text>{" "}
          <Text style={styles.totalStudentsTextRight}>{cadetCount}</Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={[styles.totalStudentsText, { backgroundColor: "#fff" }]}>
            Junior (9 & 10):
          </Text>{" "}
          <Text
            style={[
              styles.totalStudentsTextRight,
              { backgroundColor: "#fff" },
            ]}>
            {juniorCount}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={[styles.totalStudentsText, { borderBottom: 1 }]}>
            Student (11 & 12):
          </Text>
          <Text style={[styles.totalStudentsTextRight, { borderBottom: 1 }]}>
            {studentCount}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            marginLeft: "20px",
            marginRight: "20px",
          }}>
          <Text style={styles.totalStudentsTextNew}>
            Total Number of Students:
          </Text>{" "}
          <Text style={styles.totalStudentsTextNewBold}>
            {schoolData.length}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}>
          <Image
            style={styles.image_bottom}
            src="/MEMBER_AKSF.png" // Replace with your image path or URL
          />
        </View>
        {/* <Text break></Text> */}
      </Page>
      <Page
        size="A4"
        style={{
          padding: "20px",
        }}>
        <Text style={styles.title}>ATTENDANCE SHEET</Text>
        <Text style={styles.header}>{profileData?.contestName}</Text>
        <Text style={styles.paragraph}>Dear Principal,</Text>

        <Text style={styles.paragraph}>
          We are pleased to inform you that your school is participating in the
          {profileData?.contestName}. Attached with this letter are the contest
          question booklets and answer sheets for the participating students.
        </Text>
        <Text style={styles.paragraph}>
          Please find below the list of students from your school who have
          registered for the {profileData?.contestName}. We kindly request that
          you or the assigned contest supervisor mark each student&apos;s
          attendance by indicating &quot;Present&quot; or &quot;Absent&quot; in
          the corresponding box next to their name. In case you need to make any
          corrections to the student&apos;s name or father&apos;s name, please
          make them here directly on this attendance sheet.
        </Text>
        <Text style={[styles.title, { marginTop: 10 }]}>
          SUMMARY OF PAPERS RECEIVED
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableColHeader,
                { borderLeftWidth: 1, width: "10%" },
              ]}>
              <Text style={styles.tableCellHeader}>S. No</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "35%" }]}>
              <Text style={styles.tableCellHeader}>Level</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "35%" }]}>
              <Text style={styles.tableCellHeader}>
                No. of Answer Sheets & Booklets Sent
              </Text>
            </View>
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCellHeader}>Remarks</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>1.</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>PreEcolier (Class 1 & 2)</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>2.</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Ecolier (Class 3 & 4)</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>3.</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Benjamin (Class 5 & 6)</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>4.</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Cadet (Class 7 & 8)</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>5.</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Junior (Class 9 & 10)</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: "10%" }]}>
              <Text style={styles.tableCell}>6.</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}>Student (Class 11 & 12)</Text>
            </View>
            <View style={[styles.tableCol, { width: "35%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: "20%" }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <Text
              style={[styles.paragraph, { fontSize: 9, fontWeight: "bold" }]}>
              It is hereby certified that the level-wise figures provided above
              are accurate.
            </Text>
          </View>

          <View
            style={{
              marginTop: 10,
              textAlign: "right",
              alignItems: "flex-end",
            }}>
            <View
              style={{ width: 200, borderTopWidth: 1, marginTop: 10 }}></View>
            <Text style={[styles.paragraph, { fontSize: 10 }]}>
              Signature & Stamp of the Principal
            </Text>
          </View>

          <Text style={[styles.title, { marginTop: 15 }]}>
            SUMMARY OF PAPERS RETURNED
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View
                style={[
                  styles.tableColHeader,
                  { borderLeftWidth: 1, width: "10%" },
                ]}>
                <Text style={styles.tableCellHeader}>S. No</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text style={styles.tableCellHeader}>Level</Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text style={styles.tableCellHeader}>
                  No. of Answer Sheets of Students Present
                </Text>
              </View>
              <View style={[styles.tableColHeader, { width: "25%" }]}>
                <Text style={styles.tableCellHeader}>
                  No. of Answer Sheets of Students Absent
                </Text>
              </View>
              <View style={[styles.tableColHeader, { width: "15%" }]}>
                <Text style={styles.tableCellHeader}>Total</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>1.</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>PreEcolier (Class 1 & 2)</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>2.</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>Ecolier (Class 3 & 4)</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>3.</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>Benjamin (Class 5 & 6)</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>4.</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>Cadet (Class 7 & 8)</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>5.</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>Junior (Class 9 & 10)</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}>6.</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}>Student (Class 11 & 12)</Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "10%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  Total
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Text
              style={[styles.paragraph, { fontSize: 9, fontWeight: "bold" }]}>
              I hereby acknowledge the receipt of the detailed papers mentioned
              above and certify that the number of papers received is accurate.
            </Text>
          </View>
          <View
            style={{
              marginTop: 25,
              textAlign: "right",
              alignItems: "flex-end",
            }}>
            <View
              style={{ width: 200, borderTopWidth: 1, marginTop: 10 }}></View>
            <Text style={[styles.paragraph, { fontSize: 10 }]}>
              Signature & Stamp of the Principal
            </Text>
          </View>
        </View>

        {/* <Text style={styles.paragraph}>
          Supervisor Name: _____________________
        </Text>
        <Text style={styles.paragraph}>Signature: ____________________</Text> */}
        {/* <Text style={styles.paragraph}>
          We also request that you confirm the contest was conducted under your
          supervision, ensuring complete transparency, by signing below and
          stamping the document with your school&apos;s official stamp.
        </Text>
        <View style={styles.paragraph}>
          <Text>Principal&apos;s Signature: ____________________</Text> <br />
          <Text>Date: ____________________</Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.spacer} />
        <Text style={styles.paragraph}>
          We remind you that question booklets become property of the students,
          therefore they should be given to the students.
        </Text>
        <View style={styles.spacer} />
        <Text style={styles.paragraph}>
          Your cooperation in ensuring the smooth conduct of the{" "}
          {profileData?.contestName} is greatly appreciated. Please return this
          document along with the completed answer sheets to our representative.
        </Text>
        <Text style={styles.paragraph}>
          Thank you for your continued support in promoting academic excellence.
        </Text>
        <View style={styles.spacer} />
        <View style={styles.spacer} /> */}
        <Text style={styles.paragraph}>Best regards,</Text>
        <Text style={styles.paragraph}>Khalid Rasul Awan</Text>
        <Text style={styles.paragraph}>
          COO Innovative Learning - KSF Pakistan
        </Text>
      </Page>
      <Page
        size="A4"
        style={{
          paddingVertical: "60px",
          paddingHorizontal: "30px",
        }}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableColHeader,
                { borderLeftWidth: 1, borderLeftColor: "black" },
              ]}>
              <Text style={styles.tableCellHeader}>NO</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "23%" }]}>
              <Text style={styles.tableCellHeader}>ROLL NUMBER</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "23%" }]}>
              <Text style={styles.tableCellHeader}>STUDENT NAME</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "23%" }]}>
              <Text style={styles.tableCellHeader}>FATHER NAME</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>CLASS</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>P/A</Text>
            </View>
          </View>
          {schoolData.map((student, index) => (
            <View style={styles.tableRow} key={student.rollNumber}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>{student.rollNumber}</Text>
              </View>
              <View style={styles.tableColWide}>
                <SmartTextTable
                  text={student.studentName}
                  style={styles.tableCell}
                />
              </View>
              <View style={styles.tableColWide}>
                <SmartTextTable
                  text={student.fatherName}
                  style={styles.tableCell}
                />
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{student.studentClass}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default AttendanceSheet;

const SmartText: React.FC<{
  text: string | number | null | undefined;
  style?: any;
}> = ({ text, style }) => {
  const isArabicText = /[\u0600-\u06FF]/.test(String(text || ""));

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Tajawal" : "Helvetica Neue",
          direction: isArabicText ? "rtl" : "ltr",
          textAlign: "center", // Ensure text is left-aligned
          fontWeight: isArabicText ? "700" : "400",
          fontSize: "12px",
          justifyContent: "flex-start",
          textTransform: "uppercase",
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "center",
          whiteSpace: "pre-wrap", // Allow wrapping
          width: "100%",
          flexShrink: 1, // Allow shrinking
          flexGrow: 0, // Don't allow growing
          wordBreak: "break-word",
          overflow: "hidden",
          textOverflow: "ellipsis",

          // marginVertical: isArabicText ? "1px" : "2px",
        },
      ]}>
      {text}
    </Text>
  );
};
const SmartTextBold: React.FC<{
  text: string | number | null | undefined;
  style?: any;
}> = ({ text, style }) => {
  const isArabicText = /[\u0600-\u06FF]/.test(String(text || ""));

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Tajawal" : "Helvetica Neue",
          direction: isArabicText ? "rtl" : "ltr",
          textAlign: "center", // Ensure text is left-aligned
          fontWeight: isArabicText ? "700" : "900",
          textDecoration: "underline",
          fontSize: isArabicText ? "14px" : "14px",
          justifyContent: "flex-start",
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "row",
          alignItems: "center",
          whiteSpace: "pre-wrap", // Allow wrapping
          width: "100%",
          flexShrink: 1, // Allow shrinking
          flexGrow: 0, // Don't allow growing
          wordBreak: "break-word",
          overflow: "hidden",
          textOverflow: "ellipsis",

          // marginVertical: isArabicText ? "1px" : "2px",
        },
      ]}>
      {text}
    </Text>
  );
};
const SmartTextHeading: React.FC<{
  text: string | null | undefined;
  style?: any;
}> = ({ text, style }) => {
  const isArabicText = /[\u0600-\u06FF]/.test(text || "");

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Tajawal" : "Helvetica Neue",
          direction: isArabicText ? "rtl" : "ltr",
          textAlign: "left", // Ensure text is left-aligned
          fontWeight: isArabicText ? "700" : "700",
          fontSize: isArabicText ? "12px" : "12px",
          alignSelf: "flex-center", // Align self to the start (left)
          justifyContent: "flex-start",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        },
      ]}>
      {text}
    </Text>
  );
};

const SmartTextHeadingTop: React.FC<{
  text: string | null | undefined;
  style?: any;
}> = ({ text, style }) => {
  const isArabicText = /[\u0600-\u06FF]/.test(text || "");

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Tajawal" : "Helvetica Neue",
          direction: isArabicText ? "rtl" : "ltr",
          textAlign: "center",
          width: "100%",
          textTransform: "uppercase",
          fontWeight: isArabicText ? "700" : "700",
          fontSize: isArabicText ? "25px" : "20px",
        },
      ]}>
      {text}
    </Text>
  );
};

const SmartTextTable: React.FC<{
  text: string | null | undefined;
  style?: any;
}> = ({ text, style }) => {
  const isArabicText = /[\u0600-\u06FF]/.test(text || "");

  return (
    <Text
      style={[
        style,
        {
          fontFamily: isArabicText ? "Tajawal" : "Helvetica Neue",
          textAlign: isArabicText ? "center" : "center",
          fontWeight: isArabicText ? "400" : "400",
          fontSize: isArabicText ? "8.5px" : "10px",
          verticalAlign: "middle",
          alignSelf: "flex-end",
          justifyContent: "flex-end",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          minWidth: "400px",
          maxWidth: "100%",
        },
      ]}>
      {text}
    </Text>
  );
};
