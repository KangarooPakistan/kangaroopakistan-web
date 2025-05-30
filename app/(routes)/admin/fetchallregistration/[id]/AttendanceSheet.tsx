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
const styles = StyleSheet.create({
  image: {
    width: 70, // Set the width of your image
    height: 70, // Set the height of your image
    marginTop: "20px", // Optional: add some margin if needed
  },
  page: {
    padding: "20px",
    flexDirection: "column",
    backgroundColor: "#FFF",
  },
  header: {
    fontSize: "14px",
    textTransform: "uppercase",
    textAlign: "center",
    marginVertical: "10px",
    fontFamily: "Roboto",
    fontWeight: 600,
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
    fontSize: "13px",
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
    textTransform: "uppercase",

    marginVertical: "5px",
    textAlign: "center",
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
  newView: {
    borderColor: "#000",
    border: "1px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    marginVertical: "10px",
  },
  newViewText: {
    textTransform: "uppercase",
    fontSize: "12px",
    marginVertical: "5px",
    textAlign: "left",
  },
  tableCellHeader: {
    fontSize: 9,
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
    marginBottom: 8,
    fontFamily: "Roboto",
  },
  spacer: {
    height: 14, // Adjust this value to increase or decrease space
  },

  table: {
    display: "flex",
    width: "100%",
  },
  tableRow: {
    // margin: "auto",

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
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColWide: {
    width: "23%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    fontSize: 9,

    textAlign: "left",
    paddingTop: 3,
    paddingBottom: 3,
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

  useEffect(() => {
    const loadFonts = async () => {
      await Font.register({
        family: "Roboto",
        fonts: [
          { src: "/fonts/Roboto-Regular.ttf" },
          { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
        ],
      });
      // await Font.register({
      //   family: "Calibri",
      //   fonts: [
      //     { src: "/fonts/calibri-regular.ttf" },
      //     { src: "/fonts/calibri-bold.ttf", fontWeight: 700 },
      //   ],
      // });

      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

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
            alignItems: "flex-start",
            marginRight: "20px",
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
              alignItems: "flex-start",
              justifyContent: "space-between",
              display: "flex",
              marginLeft: "20px",
              flexDirection: "column",
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
            <View style={{ display: "flex", justifyContent: "flex-start" }}>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 900,
                }}>
                {schoolData[0].schoolName}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
              }}>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Institution Code:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  textTransform: "uppercase",

                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {schoolData[0].schoolId}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
              }}>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Address:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  textTransform: "uppercase",

                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {schoolData[0].address}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
              }}>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Contact Number:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {profileData?.contactNumber}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
              }}>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  textTransform: "uppercase",

                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Email Address:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {profileData?.email}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
              }}>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Principal Name:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {profileData?.p_Name}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
              }}>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Coordinator Name:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {profileData?.c_Name}{" "}
              </Text>
            </View>
          </View>
          <View></View>
        </View>
        <Text
          style={{
            fontSize: "14px",
            textAlign: "center",
            textTransform: "uppercase",

            marginVertical: "8px",
            fontFamily: "Roboto",
            fontWeight: 600, // Keep the label text bold
            display: "flex",
          }}>
          List of registered students
        </Text>
        <View style={styles.newView}>
          {/* <Text style={styles.totalStudentsText}>Total Students by Level</Text> */}
          <Text style={styles.totalStudentsText}>
            Total # Pre Ecolier: {preecolierCount}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Ecolier: {ecolierCount}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Benjamin: {benjaminCount}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Cadet: {cadetCount}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Junior: {juniorCount}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Student: {studentCount}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
          <Text style={styles.totalStudentsText}>
            Total Number of Students : {schoolData.length}
          </Text>
          <View style={{ marginTop: 340 }}>
            <Text style={styles.totalStudentsText}>
              Please return this attendance sheet and answer sheets to the
              following
            </Text>
            <Text style={styles.totalStudentsText}>
              address: Innovative Learning
            </Text>
            <Text style={styles.totalStudentsText}>
              First floor, Plaza 114, Main Boulevard, Block J, DHA Phase 6
              Lahore
            </Text>
            <Text style={styles.totalStudentsText}>
              Tel. 0333-2111399, 0321-8403033
            </Text>
          </View>
        </View>

        <Text break></Text>
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
        <Text break></Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { borderLeftWidth: 1 }]}>
              <Text style={styles.tableCellHeader}>SR.NO</Text>
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
              <Text style={styles.tableCellHeader}>ATTENDANCE (P/A)</Text>
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
                <Text style={styles.tableCell}>{student.studentName}</Text>
              </View>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>{student.fatherName}</Text>
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
