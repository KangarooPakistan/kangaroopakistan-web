import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  title: {
    textTransform: "uppercase",
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "extrabold",
    textAlign: "center",
    marginBottom: 5,
  },
  statsSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",

    marginBottom: 5,
  },
  statsLabel: {
    fontSize: 12,
    width: 200,

    // flex: 1,
    fontFamily: "Roboto",
  },
  statsValue: {
    fontSize: 12,
    width: 100,
    textAlign: "right",
    fontFamily: "Roboto",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 25,
  },
  tableColHeader: {
    width: "7%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    fontSize: 8,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    paddingTop: 4,
  },
  tableColHeaderLarge: {
    width: "18%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tableColHeaderLargeR: {
    width: "24%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tableCol: {
    width: "7%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColLarge: {
    width: "18%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColLargeR: {
    width: "24%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableCellHeader: {
    margin: 2,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: 2,
    fontSize: 8,
    textAlign: "center",
    wordWrap: "break-word",
  },
  cellContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 15,
  },
});

interface SchoolResultPdf {
  AwardLevel: string;
  class: string;
  contactId: string;
  district: string;
  fatherName: string;
  id: string;
  percentage: string;
  rollNumber: string;
  schoolDetails: {
    schoolName: string | null;
    schoolAddress: string | null;
    contactNumber: string | null;
  };
  score: {
    score: string;
    total: string;
  };
  studentName: string;
}

interface AwardCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
  THREE_STAR: number;
  TWO_STAR: number;
  ONE_STAR: number;
  PARTICIPATION: number;
  total: number;
}

interface SchoolAwardsPdfProps {
  data: {
    results: SchoolResultPdf[];
    statistics: AwardCounts;
  };
}

const CellContent = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.cellContent}>
    <Text style={styles.tableCell}>{children}</Text>
  </View>
);

const SchoolAwardsPdf: React.FC<SchoolAwardsPdfProps> = ({ data }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Create default statistics object
  const defaultStats: AwardCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
    THREE_STAR: 0,
    TWO_STAR: 0,
    ONE_STAR: 0,
    PARTICIPATION: 0,
    total: 0,
  };

  // Safely access statistics with fallback to defaults
  const statistics = data?.statistics || defaultStats;
  const results = data?.results || [];
  console.log(results);
  console.log("results");
  console.log(statistics);
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{results[0].schoolDetails.schoolName}</Text>
        <Text style={styles.title}>
          {results[0].schoolDetails.schoolAddress}
        </Text>
        <Text style={styles.title}>
          Contact Number:
          {results[0].schoolDetails.contactNumber}
        </Text>

        {/* <Text style={styles.title}>School Awards Report</Text> */}

        <View style={styles.statsSection}>
          <Text style={styles.title}>Award Statistics</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Gold Medals:</Text>
            <Text style={styles.statsValue}>{statistics.GOLD}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Silver Medals:</Text>
            <Text style={styles.statsValue}>{statistics.SILVER}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Bronze Medals:</Text>
            <Text style={styles.statsValue}>{statistics.BRONZE}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Three Star Badges:</Text>
            <Text style={styles.statsValue}>{statistics.THREE_STAR}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Two Star Badges:</Text>
            <Text style={styles.statsValue}>{statistics.TWO_STAR}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>One Star Badges:</Text>
            <Text style={styles.statsValue}>{statistics.ONE_STAR}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Participation Awards:</Text>
            <Text style={styles.statsValue}>{statistics.PARTICIPATION}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Students:</Text>
            <Text style={styles.statsValue}>{statistics.total}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>SR. NO.</Text>
            </View>
            <View style={styles.tableColHeaderLargeR}>
              <Text style={styles.tableCellHeader}>ROLL NO.</Text>
            </View>
            <View style={styles.tableColHeaderLarge}>
              <Text style={styles.tableCellHeader}>STUDENT NAME</Text>
            </View>
            <View style={styles.tableColHeaderLarge}>
              <Text style={styles.tableCellHeader}>FATHER NAME</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>CLASS</Text>
            </View>
            <View style={styles.tableColHeaderLarge}>
              <Text style={styles.tableCellHeader}>MARKS ACHIEVED</Text>
            </View>
            <View style={styles.tableColHeaderLarge}>
              <Text style={styles.tableCellHeader}>PERCENTAGE</Text>
            </View>
            <View style={styles.tableColHeaderLarge}>
              <Text style={styles.tableCellHeader}>AWARD</Text>
            </View>
          </View>

          {results.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <CellContent>{index + 1}</CellContent>
              </View>
              <View style={styles.tableColLargeR}>
                <CellContent>{item.rollNumber}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.studentName}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.fatherName}</CellContent>
              </View>
              <View style={styles.tableCol}>
                <CellContent>{item.class}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.score?.score || "N/A"}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.percentage || "N/A"}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.AwardLevel || "N/A"}</CellContent>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default SchoolAwardsPdf;
