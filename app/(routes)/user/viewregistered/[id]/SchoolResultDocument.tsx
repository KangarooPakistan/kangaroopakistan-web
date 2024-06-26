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

interface UserData {
  email: string;
  role: string;
  schoolId: number;
  schoolName: string;
  contactNumber: string;
  schoolAddress: string;
  district: string;
  tehsil: string;
  fax: string;
  p_fName: string;
  p_mName: string;
  p_lName: string;
  p_contact: string;
  p_phone: string;
  p_email: string;
  c_fName: string;
  c_mName: string;
  c_lName: string;
  c_contact: string;
  c_phone: string;
  c_email: string;
  c_accountDetails: string;
}
interface ResultType {
  PERCENTAGE: string;
  SCORE: string;
  class: string;
  fatherName: string; // Assuming 'class' is a string like '1A', '2B', etc.
  rollNumber: string;
  schoolName: number;
  studentName: string;
  // address: string; // Assuming 'class' is a string like '1A', '2B', etc.
}

interface SchoolReportProps {
  goldmedal: ResultType[];
  silvermedal: ResultType[];
  bronzemedal: ResultType[];
  twostar: ResultType[];
  threestar: ResultType[];
  onestar: ResultType[];
  specialballpoint: ResultType[];
  user: UserData | null;
}
Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
  ],
});
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
    textAlign: "center",
    marginVertical: "10px",
    fontFamily: "Open Sans",
    fontWeight: 600,
  },
  subHeader: {
    fontSize: "10px",
    fontWeight: "black",
    marginVertical: "1px",

    textAlign: "left",
  },
  subHeaderBelow: {
    marginVertical: "5px",
    fontSize: "13px",
    fontWeight: "heavy",
    textAlign: "center",
  },
  subHeading: {
    marginVertical: "12px",
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "black",
  },

  subHeadingTwo: {
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "black",
    marginVertical: "0px",
  },
  subHeadingThree: {
    fontSize: "12px",
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
    display: "flex",
    flexDirection: "column",
    // marginRight: "10px",
  },
});

const SchoolResultDocument: React.FC<SchoolReportProps> = ({
  goldmedal,
  silvermedal,
  bronzemedal,
  threestar,
  twostar,
  user,
  onestar,
  specialballpoint,
}) => {
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
              34<Text style={{ verticalAlign: "super", fontSize: 10 }}>th</Text>{" "}
              International Kangaroo Mathematics Contest 2024
            </Text>
            <View style={{ display: "flex", justifyContent: "flex-start" }}>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: 900,
                }}>
                {user?.schoolName}
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
                  fontFamily: "Open Sans",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Institution Code:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {user?.schoolId}
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
                  fontFamily: "Open Sans",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Address:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {user?.schoolAddress}
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
                  fontFamily: "Open Sans",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Contact Number:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {user?.contactNumber}
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
                  fontFamily: "Open Sans",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Email Address:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {user?.email}
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
                  fontFamily: "Open Sans",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Principal Name:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {user?.p_fName} {user?.p_mName !== null && user?.p_mName + " "}
                {user?.p_lName}{" "}
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
                  fontFamily: "Open Sans",
                  fontWeight: 600, // Keep the label text bold
                  display: "flex",
                }}>
                Coordinator Name:{" "}
              </Text>
              <Text
                style={{
                  fontSize: "10px",
                  textAlign: "left",
                  marginVertical: "1px",
                  fontFamily: "Open Sans",
                  fontWeight: "normal", // Set fontWeight to normal for the school ID
                  display: "flex",
                }}>
                {user?.c_fName} {user?.c_mName !== null && user?.c_mName + " "}
                {user?.c_lName}
              </Text>
            </View>
          </View>
          <View></View>
        </View>
        <Text
          style={{
            fontSize: "14px",
            textAlign: "center",
            marginVertical: "8px",
            fontFamily: "Open Sans",
            fontWeight: 600, // Keep the label text bold
            display: "flex",
          }}>
          List of registered students
        </Text>

        {/* {Object.entries(groupedStudents).map(([level, classes]) => (
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
        ))} */}
        <View style={styles.newView}>
          {/* <Text style={styles.totalStudentsText}>Total Students by Level</Text> */}
          <Text style={styles.totalStudentsText}>
            Total # Gold Medalists: {goldmedal.length}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Silver: {silvermedal.length}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # Bronze: {bronzemedal.length}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # 3 stars: {threestar.length}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # 2 stars: {twostar.length}
          </Text>
          <Text style={styles.totalStudentsText}>
            Total # 1 stars: {onestar.length}
          </Text>

          <Text style={styles.totalStudentsText}>
            Total # Special ballpoints: {specialballpoint.length}
          </Text>
        </View>
        <View>
          {/* <Text style={styles.totalStudentsText}>
            Total Number of Students : {schoolData.length}
          </Text> */}
        </View>
      </Page>
    </Document>
  );
};

export default SchoolResultDocument;
