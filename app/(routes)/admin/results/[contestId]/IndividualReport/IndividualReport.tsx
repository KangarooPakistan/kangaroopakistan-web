import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { StudentReport } from "../columns";
import { Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 12,
    fontFamily: "Roboto",
  },
  image: {
    width: 70, // Set the width of your image
    height: 70, // Set the height of your image
    marginBottom: "20px", // Optional: add some margin if needed
  },
  leftImage: {
    marginRight: 30,
  },
  rightImage: {
    marginLeft: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "extrabold",
    textAlign: "center",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "extrabold",
    textTransform: "uppercase",
    textAlign: "right",
    marginBottom: 10,
  },
  regNo: {
    textAlign: "right",
    fontSize: 10,
    fontWeight: "extrabold",

    marginBottom: 10,
  },
  boldFont: {
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "Roboto",
  },
  attemptedPara: {
    fontSize: 12,
    // fontWeight: "extrabold",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoRow2: {
    flexDirection: "row",
    marginBottom: 7,
    marginTop: 7,
  },
  label: {
    fontWeight: "bold",
    width: 100,
    fontSize: 12,
    fontFamily: "Roboto",
  },
  value: {
    flex: 1,
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: "Roboto",
  },
  address: {
    marginTop: 5,
    marginBottom: 15,
  },
  contestInfo: {
    marginBottom: 10,
    marginTop: 20,
  },
  marksRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginRight: 150,
  },
  attemptedSection: {
    marginBottom: 20,
  },
  table: {
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    // borderBottomWidth: 1,
    // borderBottomColor: "#e0e0e0",
    minHeight: 20, // Add minimum height to rows
    backgroundColor: "#ffffff",
  },

  tableRowLast: {
    flexDirection: "row",
    // paddingVertical: 6,
    backgroundColor: "#ffffff",
    minHeight: 20, // Add minimum height to last row
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  tableCellBorder: {
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  tableCellLeft: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    height: "100%", // Make the border extend full height
  },
  tableCellRight: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  tableCellHeader: {
    flex: 1,
    paddingHorizontal: 8,
    color: "#f3f3f3",
    fontSize: 12,
    fontWeight: "bold",
  },
  scoreValue: {
    fontSize: 12,
    color: "#444",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#444",
    backgroundColor: "#ffffff",
  },
  tableRowColor: {
    backgroundColor: "#f3f3f3",
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  totalLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  creditScoreRow: {
    backgroundColor: "#d9e2f3",
  },
  creditScoreValue: {
    color: "#000",
    // fontWeight: "bold",
  },

  rankings: {
    marginTop: 20,
  },
  rankingText: {
    marginBottom: 8,
    textAlign: "justify",
  },
  blackText: {
    fontFamily: "Roboto",
    fontWeight: 900,
  },
  viewWidth: {
    width: 310,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  slip: {
    marginTop: 25,
    fontSize: 12,
    fontStyle: "italic", // Added this line

    // fontStyle: "italic",
  },
});

interface IndividualReportProps {
  data: StudentReport[];
}
const getLevelWithClass = (level: string) => {
  switch (level.toLowerCase()) {
    case "preecolier":
      return ` PreEcolier (Class 1 & 2)`;
    case "ecolier":
      return ` Ecolier (Class 3 & 4)`;
    case "benjamin":
      return ` Benjamin (Class 5 & 6)`;
    case "cadet":
      return ` Cadet (Class 7 & 8)`;
    case "junior":
      return ` Junior (Class 9 & 10)`;
    case "student":
      return ` Student (Class 11 & 12)`;
    default:
      return level;
  }
};
const getLevel = (level: string) => {
  switch (level.toLowerCase()) {
    case "preecolier":
      return `PreEcolier `;
    case "ecolier":
      return `Ecolier `;
    case "benjamin":
      return `Benjamin `;
    case "cadet":
      return `Cadet `;
    case "junior":
      return `Junior `;
    case "student":
      return `Student `;
    default:
      return level;
  }
};

const StudentReportPage: React.FC<{ student: StudentReport }> = ({
  student,
}) => {
  const getContestTitle = (suffix: string, year: number) => {
    switch (suffix) {
      case "S":
        return `IKSC 20${year}`;
      case "M":
        return `IKMC 20${year}`;
      case "L":
        return `IKLC 20${year}`;
      default:
        return "";
    }
  };
  return (
    <Page size="A4" style={styles.page}>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}>
        {student.suffix === "M" ? (
          <Image
            style={[styles.image, styles.leftImage]}
            src="/innovative-learning.jpg" // Replace with your image path or URL
          />
        ) : student.suffix === "S" ? (
          <Image
            style={[styles.image, styles.leftImage]}
            src="/innventive_learning.jpg" // Replace with your image path or URL
          />
        ) : (
          <Image
            style={[styles.image, styles.leftImage]}
            src="/innovative-learning.jpg" // Replace with your image path or URL
          />
        )}
        <View style={styles.viewWidth}>
          <Text style={styles.title}>INDIVIDUAL PERFORMANCE REPORT</Text>
          <Text style={styles.subTitle}>
            {getContestTitle(student.suffix, student.year)}
          </Text>
        </View>
        {student.suffix === "M" ? (
          <Image
            style={[styles.image, styles.rightImage]}
            src="/ikmc_logo.png"
          />
        ) : student.suffix === "S" ? (
          <Image
            style={[styles.image, styles.rightImage]}
            src="/iksc_logo.jpg"
          />
        ) : (
          <Image
            style={[styles.image, styles.rightImage]}
            src="/iklc_logo.jpg"
          />
        )}
        {/* <Text style={styles.regNo}>Registration No.: {student.rollNumber}</Text> */}
      </View>

      {/* Header Section */}

      {/* Student Information Section */}
      <View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Roll No:</Text>
          <Text style={styles.value}>{student.rollNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{student.studentName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Father Name:</Text>
          <Text style={styles.value}>{student.fatherName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Level:</Text>
          <Text style={styles.value}>{getLevel(student.level)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Class:</Text>
          <Text style={styles.value}>{student.class}</Text>
        </View>
        <View style={styles.infoRow2}>
          <Text style={styles.label}>Institution:</Text>
          <Text style={styles.value}>{student.schoolName}</Text>
        </View>

        {/* <View style={styles.infoRow2}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{student.schoolAddress}</Text>
        </View> */}
      </View>

      {/* Contest Information */}
      <View style={styles.contestInfo}>
        <Text>
          Inventive Learning KSF - Pakistan congratulates you on your
          participation in the {student.constestNo}th {student.contestName}. You
          participated at
          {getLevelWithClass(student.level)} and your results are as follows:
        </Text>
        <View style={styles.marksRow}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text>Total Marks: </Text>
            <Text style={{ fontWeight: "extrabold" }}>
              {student.totalMarks}{" "}
            </Text>
          </View>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text>Marks Obtained: </Text>
            <Text style={{ fontWeight: "extrabold" }}>{student.score} </Text>
          </View>
        </View>
      </View>

      {/* Questions Attempted Section */}
      <View style={styles.attemptedSection}>
        <View style={{ flexDirection: "row", marginBottom: 5 }}>
          <Text>You attempted </Text>
          <Text style={{ fontWeight: "bold" }}>
            {parseInt(student.class) <= 4
              ? 8 - student.missingQuestionsCount[0]
              : 10 - student.missingQuestionsCount[0]}{" "}
          </Text>
          <Text>out of </Text>
          <Text style={{ fontWeight: "bold" }}>
            {parseInt(student.class) === 1 ||
            parseInt(student.class) === 2 ||
            parseInt(student.class) === 3 ||
            parseInt(student.class) === 4
              ? 8
              : 10}{" "}
          </Text>
          <Text>questions of </Text>
          <Text style={{ fontWeight: "bold" }}>3 </Text>
          <Text>marks each and your correct answers were </Text>
          <Text style={{ fontWeight: "bold" }}>{student.cRow1}</Text>
          <Text>.</Text>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 5 }}>
          <Text>You attempted </Text>
          <Text style={{ fontWeight: "bold" }}>
            {parseInt(student.class) <= 4
              ? 8 - student.missingQuestionsCount[1]
              : 10 - student.missingQuestionsCount[1]}{" "}
          </Text>
          <Text>out of </Text>
          <Text style={{ fontWeight: "bold" }}>
            {parseInt(student.class) <= 4 ? 8 : 10}{" "}
          </Text>
          <Text>questions of </Text>
          <Text style={{ fontWeight: "bold" }}>4 </Text>
          <Text>marks each and your correct answers were </Text>
          <Text style={{ fontWeight: "bold" }}>{student.cRow2}</Text>
          <Text>.</Text>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 5 }}>
          <Text>You attempted </Text>
          <Text style={{ fontWeight: "bold" }}>{student.cRow3} </Text>
          <Text>out of </Text>
          <Text style={{ fontWeight: "bold" }}>
            {parseInt(student.class) <= 4
              ? 8 - student.missingQuestionsCount[2]
              : 10 - student.missingQuestionsCount[2]}{" "}
          </Text>
          <Text>questions of </Text>
          <Text style={{ fontWeight: "bold" }}>5 </Text>
          <Text>marks each and your correct answers were </Text>
          <Text style={{ fontWeight: "bold" }}>{student.cRow3}</Text>
          <Text>.</Text>
        </View>
      </View>

      {/* Score Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={[styles.tableCellHeader]}>
            <Text>Score Component</Text>
          </View>
          <View style={styles.tableCellHeader}>
            <Text>Points</Text>
          </View>
        </View>
        {/* <View style={styles.tableRow}>
          <View style={styles.tableCellLeft}>
            <Text>3-Mark Questions ({student.cRow1} correct)</Text>
          </View>
          <View style={styles.tableCellRight}>
            <Text style={styles.scoreValue}>
              3 × {student.cRow1} = {3 * student.cRow1}
            </Text>
          </View>
        </View> */}

        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text>3-Mark Questions ({student.cRow1} correct)</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.scoreValue}>
              3 × {student.cRow1} = {3 * student.cRow1}
            </Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text>4-Mark Questions ({student.cRow2} correct)</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.scoreValue}>
              4 × {student.cRow2} = {4 * student.cRow2}
            </Text>
          </View>
        </View>

        <View style={styles.tableRow}>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text>5-Mark Questions ({student.cRow3} correct)</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.scoreValue}>
              5 × {student.cRow3} = {5 * student.cRow3}
            </Text>
          </View>
        </View>

        <View style={[styles.tableRow, styles.tableRowColor]}>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.totalLabel}>Negative Scores</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.totalLabel}>
              1 x {student.wrong} = {student.wrong}
            </Text>
          </View>
        </View>

        <View style={[styles.tableRow, styles.totalRow]}>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.totalLabel}>Net Score Achieved</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.totalLabel}>{student.score}</Text>
          </View>
        </View>

        <View style={[styles.tableRowLast, styles.creditScoreRow]}>
          <View style={[styles.tableCell, styles.tableCellBorder]}>
            <Text style={styles.totalLabel}>Credit Score</Text>
          </View>
          <View style={styles.tableCell}>
            <Text style={styles.creditScoreValue}>{student.creditScore}</Text>
          </View>
        </View>
      </View>

      {/* Rankings Section */}
      <RankingsTable student={student} />
      <View style={styles.slip}>
        <Text>
          {" "}
          This is system generated report and does not require a signature
        </Text>
      </View>
    </Page>
  );
};

const RankingsTable: React.FC<{ student: StudentReport }> = ({ student }) => (
  <View
    style={{
      marginTop: 20,
      border: 1,
      borderColor: "#000000",
    }}>
    {/* Header */}
    <View
      style={{
        backgroundColor: "#FFE4E1",
        padding: 8,
        borderBottom: 1,
        borderBottomColor: "#000000",
      }}>
      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 12,
        }}>
        CONTEST RANKINGS - {student.class.toUpperCase()}
      </Text>
    </View>

    {/* Main Content Grid */}
    <View
      style={{
        flexDirection: "row",
      }}>
      {/* Left Column */}
      <View
        style={{
          flex: 2,
          borderRight: 1,
          marginRight: 10,
          borderRightColor: "#000000",
        }}>
        {/* Header */}
        <View
          style={{
            borderBottom: 1,
            backgroundColor: "#f2f2f2",
            borderBottomColor: "#000000",
            padding: 8,
            justifyContent: "center",
          }}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 12,
            }}>
            TOTAL NUMBER OF STUDENTS PARTICIPATING IN{"\n"}THE CONTEST AT YOUR
            GRADE
          </Text>
        </View>

        {/* School Row */}
        <View
          style={{
            flexDirection: "row",
            borderBottom: 1,
            height: 28,
            borderBottomColor: "#000000",
          }}>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 6,
              paddingVertical: 4,
              fontSize: 12,
              borderRight: 1,

              fontWeight: "bold",
              borderRightColor: "#000000",
            }}>
            <Text>YOUR SCHOOL</Text>
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 6,
              paddingVertical: 4,
              justifyContent: "center",
            }}>
            <Text
              style={{ textAlign: "center", fontSize: 12, fontWeight: "bold" }}>
              {student.rankings.school.totalParticipants}
            </Text>
          </View>
        </View>

        {/* District Row */}
        <View
          style={{
            flexDirection: "row",
            borderBottom: 1,
            height: 28,
            borderBottomColor: "#000000",
          }}>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderRight: 1,
              borderRightColor: "#000000",
              fontSize: 12,
              fontWeight: "bold",
            }}>
            <Text>YOUR CITY/DISTRICT</Text>
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 6,
              paddingVertical: 4,
              justifyContent: "center",
            }}>
            <Text
              style={{ textAlign: "center", fontSize: 12, fontWeight: "bold" }}>
              {student.rankings.district.totalParticipants}
            </Text>
          </View>
        </View>

        {/* Pakistan Row */}
        <View
          style={{
            flexDirection: "row",
            height: 28,
          }}>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderRight: 1,
              borderRightColor: "#000000",
              fontSize: 12,
              fontWeight: "bold",
              height: "100%", // Added height 100%
              position: "relative", // Added position relative
            }}>
            <Text>ALL PAKISTAN</Text>
            <View
              style={{
                position: "absolute",
                right: -1,
                bottom: -1,
                width: 1,
                height: 1,
                backgroundColor: "#000000",
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 6,
              paddingVertical: 4,
              justifyContent: "center",
            }}>
            <Text
              style={{ textAlign: "center", fontSize: 12, fontWeight: "bold" }}>
              {student.rankings.overall.totalParticipants}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Column */}
      <View
        style={{
          flex: 1,
          marginLeft: 10,
          borderLeftColor: "#000000",
          borderLeft: 1,
        }}>
        {/* Header */}
        <View
          style={{
            borderBottom: 1,
            backgroundColor: "#f2f2f2",
            borderBottomColor: "#000000",
            // padding: 6,
            minHeight: 43,
            justifyContent: "center",
          }}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 12,
              paddingHorizontal: 6,
              paddingVertical: 14,
              height: 44,

              borderRightColor: "#000000",
            }}>
            YOUR RANK
          </Text>
        </View>

        {/* School Rank */}
        <View
          style={{
            borderBottom: 1,
            borderBottomColor: "#000000",
            paddingHorizontal: 6,
            paddingTop: 6,
            height: 28,
            fontSize: 12,

            fontWeight: "bold",
          }}>
          <Text
            style={{ textAlign: "center", fontSize: 12, fontWeight: "bold" }}>
            {student.rankings.school.rank}
          </Text>
        </View>

        {/* District Rank */}
        <View
          style={{
            borderBottom: 1,

            height: 28,
            borderBottomColor: "#000000",
            paddingHorizontal: 6,
            paddingTop: 6,
          }}>
          <Text
            style={{ textAlign: "center", fontSize: 12, fontWeight: "bold" }}>
            {student.rankings.district.rank}
          </Text>
        </View>

        {/* Pakistan Rank */}
        <View
          style={{
            paddingHorizontal: 6,
            paddingTop: 6,

            height: 28,
          }}>
          <Text
            style={{ textAlign: "center", fontSize: 12, fontWeight: "bold" }}>
            {student.rankings.overall.rank}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const IndividualReport: React.FC<IndividualReportProps> = ({ data }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.register({
        family: "Roboto",
        fonts: [
          { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
          { src: "/fonts/Roboto-Italic.ttf", fontStyle: "italic" },
          { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
          { src: "/fonts/Roboto-Black.ttf", fontWeight: 900 },
        ],
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  return (
    <Document>
      {data.map((student, index) => (
        <StudentReportPage key={student.rollNumber} student={student} />
      ))}
    </Document>
  );
};

export default IndividualReport;
