import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
  ],
});
// Define types
interface QuestionStat {
  correct: number;
  wrong: number;
  missing: number;
}

interface QuestionStatsResponse {
  contestName: string;
  contestDate: string;
  totalStudentsByClass: Record<string, number>;
  questionStatsByClass: Record<string, Record<string, QuestionStat>>;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    fontFamily: "Roboto",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  subheader: {
    fontFamily: "Roboto",
    fontSize: 14,
    // marginBottom: 10,
    // marginTop: 10,
    fontWeight: "bold",
  },
  classTitle: {
    fontFamily: "Roboto",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 0,
    fontWeight: "bold",
  },
  chartContainer: {
    height: 200,
    marginVertical: 10,
  },
  barContainer: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    marginTop: 5,
  },
  bar: {
    width: 12,
    marginRight: 4,
    position: "relative",
  },
  barCorrect: {
    backgroundColor: "#4299e1", // blue
  },
  barWrong: {
    backgroundColor: "#f56565", // red
  },
  barMissing: {
    backgroundColor: "#a0aec0", // gray
  },
  axisLabel: {
    fontFamily: "Roboto",
    fontSize: 8,
    marginTop: 3,
    textAlign: "center",
  },
  legendContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  legendItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 20,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    borderWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 8,
  },
  questionCell: {
    width: "10%",
  },
  dataCell: {
    width: "30%",
    textAlign: "center",
  },
});

// Legend component
const Legend = () => (
  <View style={styles.legendContainer}>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: "#4299e1" }]} />
      <Text style={styles.legendText}>Correct</Text>
    </View>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: "#f56565" }]} />
      <Text style={styles.legendText}>Wrong</Text>
    </View>
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: "#a0aec0" }]} />
      <Text style={styles.legendText}>Missing</Text>
    </View>
  </View>
);

const QuestionStatsPdf = ({ data }: { data: QuestionStatsResponse }) => {
  const classNumbers = Object.keys(data.totalStudentsByClass).sort();

  return (
    <Document>
      {/* First page with title and first chart */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          {data.contestName} - Question Statistics
        </Text>
        <Text style={styles.header}>Contest Date: {data.contestDate}</Text>

        {/* Render first class */}
        {classNumbers.length > 0 && (
          <>
            {renderClassContent(classNumbers[0], data)}
            <Text break></Text>
          </>
        )}

        {/* Render remaining classes with page breaks between them */}
        {classNumbers.slice(1).map((classNumber, index) => (
          <React.Fragment key={classNumber}>
            {renderClassContent(classNumber, data)}
            {index < classNumbers.length - 2 && <Text break></Text>}
          </React.Fragment>
        ))}
      </Page>
    </Document>
  );
};

// Function to create class-specific content
const renderClassContent = (
  classNumber: string,
  data: QuestionStatsResponse
) => {
  const classTotal = data.totalStudentsByClass[classNumber] || 0;
  const maxQuestions =
    classNumber === "01" ||
    classNumber === "02" ||
    classNumber === "03" ||
    classNumber === "04"
      ? 24
      : 30;

  // Prepare data for the chart
  const questionNumbers = Array.from(
    { length: maxQuestions },
    (_, i) => `Q${i + 1}`
  );

  return (
    <View key={classNumber}>
      <Text style={styles.subheader}>
        Class {classNumber} (Total Students: {classTotal})
      </Text>

      {/* Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.barContainer}>
          {questionNumbers.map((qNum) => {
            const stats = data.questionStatsByClass[qNum]?.[classNumber] || {
              correct: 0,
              wrong: 0,
              missing: 0,
            };

            const total = stats.correct + stats.wrong + stats.missing || 1; // Avoid division by zero
            const correctHeight = (stats.correct / total) * 100;
            const wrongHeight = (stats.wrong / total) * 100;
            const missingHeight = (stats.missing / total) * 100;

            return (
              <View key={qNum} style={{ alignItems: "center" }}>
                <View style={styles.bar}>
                  <View
                    style={{
                      height: "100%",
                      width: "100%",
                      position: "relative",
                    }}>
                    {/* Stack the bars from bottom to top */}
                    <View
                      style={[
                        styles.barMissing,
                        {
                          position: "absolute",
                          height: `${missingHeight}%`,
                          width: "100%",
                          bottom: 0,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.barWrong,
                        {
                          position: "absolute",
                          height: `${wrongHeight}%`,
                          width: "100%",
                          bottom: `${missingHeight}%`,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.barCorrect,
                        {
                          position: "absolute",
                          height: `${correctHeight}%`,
                          width: "100%",
                          bottom: `${missingHeight + wrongHeight}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.axisLabel}>{qNum.replace("Q", "")}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Legend />

      {/* Data Table */}
      <Text style={styles.subheader}>
        Question Statistics - Class {classNumber}
      </Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.questionCell]}>
            <Text>Question</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text>Correct</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text>Wrong</Text>
          </View>
          <View style={[styles.tableCell, styles.dataCell]}>
            <Text>Missing</Text>
          </View>
        </View>

        {/* Table Rows */}
        {questionNumbers.map((qNum) => {
          const stats = data.questionStatsByClass[qNum]?.[classNumber] || {
            correct: 0,
            wrong: 0,
            missing: 0,
          };

          return (
            <View key={qNum} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.questionCell]}>
                <Text>{qNum}</Text>
              </View>
              <View style={[styles.tableCell, styles.dataCell]}>
                <Text>
                  {stats.correct} (
                  {((stats.correct / classTotal) * 100).toFixed(1)}%)
                </Text>
              </View>
              <View style={[styles.tableCell, styles.dataCell]}>
                <Text>
                  {stats.wrong} ({((stats.wrong / classTotal) * 100).toFixed(1)}
                  %)
                </Text>
              </View>
              <View style={[styles.tableCell, styles.dataCell]}>
                <Text>
                  {stats.missing} (
                  {((stats.missing / classTotal) * 100).toFixed(1)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default QuestionStatsPdf;
