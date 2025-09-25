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
  contestNo: string;
}

interface SchoolReportProps {
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
    fontSize: "16px",
    textTransform: "uppercase",

    textAlign: "center",
    marginVertical: "10px",
    fontFamily: "Roboto",
    fontWeight: 600,
  },
  subHeader: {
    textTransform: "uppercase",

    fontSize: "10px",
    fontWeight: "black",
    marginVertical: "1px",

    textAlign: "left",
  },
  subHeaderBelow: {
    marginVertical: "5px",
    textTransform: "uppercase",

    fontSize: "13px",
    fontWeight: "heavy",
    textAlign: "center",
  },
  subHeading: {
    marginVertical: "12px",
    fontSize: "12px",
    textTransform: "uppercase",

    textAlign: "center",
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
    marginVertical: "5px",
    textAlign: "center",
  },
  studentTable: {
    marginVertical: "5px",
    borderTop: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#000",
    alignItems: "center",
    height: 24, // Adjust the height as needed
    wrap: false, // Prevent the row from wrapping/breaking
    break: false, // Prevent page break within the row
  },
  tableRowBreakable: {
    flexDirection: "row",
    borderBottom: 1,
    borderColor: "#000",
    alignItems: "center",
    minHeight: 24, // Use minHeight instead of fixed height for flexible content
    wrap: false,
    orphans: 1, // Minimum lines to keep together
    widows: 1, // Minimum lines to keep together
  },

  tableColHeaderMid: {
    width: "25%",
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
  tableColHeader: {
    width: "15%",
    padding: 2,
    backgroundColor: "#eee",
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
    fontSize: "12px",
    textTransform: "uppercase",

    marginVertical: "5px",
    textAlign: "left",
  },
  tableCol: {
    width: "15%",
    padding: 2,
    flexWrap: "wrap",
  },
  tableCellHeader: {
    fontSize: 10,
    textTransform: "uppercase",

    fontWeight: "bold",
    textAlign: "center", // Center align header text
  },
  tableCell: {
    fontSize: "9px",
    textTransform: "uppercase",
    overflow: "hidden", // Hide overflow text
    width: "100%",
    flexWrap: "wrap",
    fontWeight: "bold",
    textAlign: "center", // Center align cell text
  },
  tableSectionKeepTogether: {
    break: false, // Prevent page break within this section
  },

  section: {
    display: "flex",
    flexDirection: "column",
    // marginRight: "10px",
  },
});

const SchoolReportDocument: React.FC<SchoolReportProps> = ({
  schoolData,
  profileData,
}) => {
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

      setFontsLoaded(true);
    };

    loadFonts();
  }, []);
  console.log("----------------------------------------");
  const groupedStudents: Record<string, Record<string, Student[]>> = {};

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
  console.log("----------------------------------------");

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
          <Image
            style={styles.image}
            src="/innovative-learning.jpg" // Replace with your image path or URL
          />

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

                  textTransform: "uppercase",
                }}>
                th
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
                  textTransform: "uppercase",

                  textAlign: "left",
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
                  textTransform: "uppercase",

                  fontSize: "10px",
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
                  textTransform: "uppercase",

                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Roboto",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Email Address:{" "}
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
            textTransform: "uppercase",

            textAlign: "center",
            marginVertical: "8px",
            fontFamily: "Roboto",
            fontWeight: 600, // Keep the label text bold
            display: "flex",
          }}>
          List of registered students
        </Text>

        {Object.entries(groupedStudents).map(([level, classes]) => (
          <View key={level} style={styles.section}>
            <Text style={styles.subHeader}>{getStudentLevel(level)} Level</Text>
            {Object.entries(classes).map(([cls, students]) => (
              <View key={cls} style={{ marginBottom: "0px" }}>
                <Text style={styles.totalStudentsText}>
                  Total Students of Class {cls}: {students.length}
                </Text>
                <View style={styles.studentTable}>
                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <View style={styles.tableColHeaderLeft}>
                      <Text style={styles.tableCell}>Roll No</Text>
                    </View>
                    <View style={styles.tableColHeaderMid}>
                      <Text style={styles.tableCell}>Student Name</Text>
                    </View>
                    <View style={styles.tableColHeaderMid}>
                      <Text style={styles.tableCell}>Father Name</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                      <Text style={styles.tableCell}>Class</Text>
                    </View>
                  </View>

                  {/* Student Rows with improved page break handling */}
                  {students.map((student, idx) => (
                    <View
                      key={idx}
                      style={styles.tableRowBreakable}
                      wrap={false} // Prevent this specific row from breaking
                    >
                      <View style={styles.tableColLeft}>
                        <Text style={styles.tableCell}>
                          {student.rollNumber}
                        </Text>
                      </View>
                      <View style={styles.tableColMid}>
                        <Text
                          style={{
                            ...styles.tableCell,
                            // Truncate very long names if needed
                            overflow: "hidden",
                          }}>
                          {student.studentName.length > 25
                            ? `${student.studentName.substring(0, 22)}...`
                            : student.studentName}
                        </Text>
                      </View>
                      <View style={styles.tableColMid}>
                        <Text
                          style={{
                            ...styles.tableCell,
                            // Truncate very long father names if needed
                            overflow: "hidden",
                          }}>
                          {student.fatherName.length > 25
                            ? `${student.fatherName.substring(0, 22)}...`
                            : student.fatherName}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>
                          {student.studentClass}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
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
        <View>
          <Text style={styles.totalStudentsText}>
            Total Number of Students : {schoolData.length}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SchoolReportDocument;
