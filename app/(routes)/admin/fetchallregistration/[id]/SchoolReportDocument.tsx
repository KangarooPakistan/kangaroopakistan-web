import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";

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

interface SchoolReportProps {
  schoolData: Student[];
}
const styles = StyleSheet.create({
  image: {
    width: 100, // Set the width of your image
    height: 100, // Set the height of your image
    marginBottom: 10, // Optional: add some margin if needed
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    padding: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: "13px",
    textAlign: "center",
    // margin: ,
    fontWeight: "heavy",
  },
  subHeader: {
    fontSize: "10px",
    fontWeight: "black",

    textAlign: "left",
    textDecoration: "underline",
  },
  subHeaderBelow: {
    marginVertical: "10px",
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
    borderRight: 1,
    borderColor: "#000",
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
    borderRight: 1,
    borderColor: "#000",
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
});

const SchoolReportDocument: React.FC<SchoolReportProps> = ({ schoolData }) => {
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
            src="/ksfpakistan_logo.jpeg" // Replace with your image path or URL
          />
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
              marginLeft: "100px",
            }}
          >
            <Text style={styles.header}>{schoolData[0].schoolName}</Text>
            <Text style={styles.header}>{schoolData[0].address}</Text>
            <Text style={styles.header}>
              Institution Code: {schoolData[0].schoolId}
            </Text>
            <Text style={styles.subHeaderBelow}>
              34th International Kangaroo Mathematics Contest 2024
            </Text>
            <Text style={styles.subHeading}>List of registered students</Text>
          </View>
        </View>
        {Object.entries(groupedStudents).map(([level, classes]) => (
          <View key={level}>
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
