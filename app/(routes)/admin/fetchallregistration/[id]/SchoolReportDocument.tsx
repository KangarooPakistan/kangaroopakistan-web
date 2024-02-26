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
  studentLevel: string; // Assuming 'class' is a string like '1A', '2B', etc.
}

interface SchoolReportProps {
  schoolData: Student[];
}
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
  },
  section: {
    padding: 10,
    flexGrow: 1,
  },
  header: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 5,
  },
  studentTable: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontWeight: "bold",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          Divisional Public School & College Junior Section
        </Text>
        <Text style={styles.subHeader}>
          34th International Kangaroo Mathematics Contest 2024
        </Text>

        {Object.entries(groupedStudents).map(([level, classes]) => (
          <View key={level} style={styles.section}>
            <Text style={styles.subHeader}>{level} Level</Text>
            {Object.entries(classes).map(([cls, students], index) => (
              <View key={index}>
                <Text style={styles.subHeader}>Class {cls}</Text>
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
                <Text style={styles.subHeader}>
                  Total Students: {students.length}
                </Text>
                {index < Object.entries(classes).length - 1 && (
                  <View style={{ marginBottom: 10 }} />
                )}
              </View>
            ))}
            <View style={{ marginBottom: 20 }} />
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default SchoolReportDocument;
