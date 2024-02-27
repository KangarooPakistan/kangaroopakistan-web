import React, { useEffect } from "react";
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
  p_fName: string;
  p_mName: string;
  p_lName: string;
  c_fName: string;
  c_mName: string;
  c_lName: string;
  email: string;
  phone: string;
}

interface SchoolReportProps {
  schoolData: Student[];
  profileData: profileData | null | undefined;
}
const styles = StyleSheet.create({
  image: {
    width: 80, // Set the width of your image
    height: 80, // Set the height of your image
    marginBottom: 10, // Optional: add some margin if needed
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    padding: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
    width: "100%",
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: "13px",
    textAlign: "center",
    marginVertical: "10px",

    fontWeight: "bold",
    textDecoration: "underline",
  },
  subHeader: {
    fontSize: "10px",
    fontWeight: "black",
    marginVertical: "1px",

    textAlign: "left",
    textDecoration: "underline",
  },
  subHeaderBelow: {
    marginVertical: "0px",
    fontSize: "12px",
    textAlign: "center",
    textDecoration: "underline",
  },
  subHeading: {
    marginVertical: "12px",
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "black",
    textDecoration: "underline",
  },

  subHeadingTwo: {
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "black",
    marginVertical: "0px",
  },
  schoolInfo: {
    marginVertical: 3,
  },
  totalStudentsText: {
    fontSize: "12px",
    marginVertical: "10px",
    textAlign: "right",
    textDecoration: "underline",
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
  tableCol: {
    width: "15%",
    padding: 2,
    flexWrap: "wrap",
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center", // Center align header text
  },
  tableCell: {
    fontSize: "9px",
    width: "100%",
    flexWrap: "wrap",
    fontWeight: "bold",
    textAlign: "center", // Center align cell text
  },
  section: {
    // marginRight: "10px",
  },
});

const SchoolReportDocument: React.FC<SchoolReportProps> = ({
  schoolData,
  profileData,
}) => {
  const groupedStudents: Record<string, Record<string, Student[]>> = {};

  schoolData.forEach((student) => {
    if (!groupedStudents[student.studentLevel]) {
      groupedStudents[student.studentLevel] = {};
    }
    if (!groupedStudents[student.studentLevel][student.studentClass]) {
      groupedStudents[student.studentLevel][student.studentClass] = [];
    }
    groupedStudents[student.studentLevel][student.studentClass].push(student);
  });

  function getStudentLevel(classStr: string) {
    switch (classStr) {
      case "preecolier":
        return "Pre Ecolier (class 01 and 02)";
      case "ecolier":
        return "Ecolier (class 03 and 04)";
      case "benjamin":
        return "Benjamin (class 05 and 06)";
      case "cadet":
        return "Cadet (class 07 and 08)";
      case "junior":
        return "Junior (class 09 and 10)";
      case "student":
        return "Student (class 11 and 12)";
      default:
        return "Unknown";
    }
  }

  return (
    <Document>
      <Page size="A4" wrap={true} style={styles.page}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <Image
            style={styles.image}
            src="/innovative-learning.jpg" // Replace with your image path or URL
          />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              marginLeft: "50px",
              flexDirection: "column",
            }}
          >
            <Text style={styles.header}>
              34th International Kangaroo Mathematics Contest 2024
            </Text>
            <Text style={styles.subHeaderBelow}>
              {schoolData[0].schoolName}
            </Text>
            <Text style={styles.subHeaderBelow}>
              Institution Code: {schoolData[0].schoolId}
            </Text>
            <Text style={styles.subHeaderBelow}>{schoolData[0].address}</Text>

            <Text style={styles.subHeadingTwo}>
              List of registered students
            </Text>
            <Text style={styles.subHeadingTwo}>
              School Contact: {profileData?.phone} EmailAddress:{" "}
              {profileData?.email}
            </Text>
            <Text style={styles.subHeadingTwo}>
              Principal Name: {profileData?.p_fName} &nbsp;
              {profileData?.p_mName !== null && profileData?.p_mName + " "}
              {profileData?.p_lName}{" "}
            </Text>
            <Text style={styles.subHeadingTwo}>
              Coordinator Name: {profileData?.c_fName} &nbsp;
              {profileData?.c_mName !== null && profileData?.c_mName + " "}
              {profileData?.c_lName}
            </Text>
          </View>
        </View>

        {Object.entries(groupedStudents).map(([level, classes]) => (
          <View key={level} style={styles.section}>
            <Text style={styles.subHeader}>{getStudentLevel(level)} Level</Text>
            {Object.entries(classes).map(([cls, students]) => (
              <View key={cls} style={{ marginBottom: "0px" }}>
                <View style={styles.studentTable}>
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
                  {students.map((student, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <View style={styles.tableColLeft}>
                        <Text style={styles.tableCell}>
                          {student.rollNumber}
                        </Text>
                      </View>
                      <View style={styles.tableColMid}>
                        <Text style={styles.tableCell}>
                          {student.studentName}
                        </Text>
                      </View>
                      <View style={styles.tableColMid}>
                        <Text style={styles.tableCell}>
                          {student.fatherName}
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
                <Text style={styles.totalStudentsText}>
                  Total Students of Class {cls}: {students.length}
                </Text>
              </View>
            ))}
          </View>
        ))}
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
