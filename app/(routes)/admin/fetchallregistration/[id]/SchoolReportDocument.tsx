import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Create styles for the PDF

interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentClass: string; // Assuming 'class' is a string like '1A', '2B', etc.
  studentLevel: string;
  schoolName: string;
  address: string; // Assuming 'class' is a string like '1A', '2B', etc.
}

interface SchoolReportProps {
  schoolData: Student[];
}
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    padding: "10px",
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: "20px",
    textAlign: "center",
    // margin: ,
    fontWeight: "heavy",
  },
  subHeader: {
    fontSize: 10,
    textAlign: "left",
    textDecoration: "underline",
  },
  subHeaderBelow: {
    marginVertical: "10px",
    fontSize: "15px",
    textAlign: "center",
    textDecoration: "underline",
  },
  schoolInfo: {
    marginVertical: 3,
  },
  totalStudentsText: {
    fontSize: 10,
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
  tableColHeader: {
    width: "25%",
    borderRight: 1,
    borderColor: "#000",
    padding: 2,
    backgroundColor: "#eee", // Optional for header background
  },
  tableCol: {
    width: "25%",
    borderRight: 1,
    borderColor: "#000",
    padding: 2,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center", // Center align header text
  },
  tableCell: {
    fontSize: "12px",
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
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{schoolData[0].schoolName}</Text>
        <Text style={styles.header}>{schoolData[0].address}</Text>
        <Text style={styles.subHeaderBelow}>
          34th International Kangaroo Mathematics Contest 2024
        </Text>

        {Object.entries(groupedStudents).map(([level, classes]) => (
          <View key={level}>
            <Text style={styles.subHeader}>{getStudentLevel(level)} Level</Text>
            {Object.entries(classes).map(([cls, students]) => (
              <View key={cls} style={{ marginBottom: "0px" }}>
                <View style={styles.studentTable}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableColHeader}>
                      <Text style={styles.tableCell}>Roll No</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                      <Text style={styles.tableCell}>Student Name</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                      <Text style={styles.tableCell}>Father Name</Text>
                    </View>
                    <View style={styles.tableColHeader}>
                      <Text style={styles.tableCell}>Class</Text>
                    </View>
                  </View>
                  {students.map((student, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>
                          {student.rollNumber}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>
                          {student.studentName}
                        </Text>
                      </View>
                      <View style={styles.tableCol}>
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
      </Page>
    </Document>
  );
};

export default SchoolReportDocument;
