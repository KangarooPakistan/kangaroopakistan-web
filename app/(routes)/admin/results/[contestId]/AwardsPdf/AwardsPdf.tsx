import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Result } from "../page";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  title: {
    textTransform: "uppercase",

    fontSize: 16,
    fontFamily: "Roboto",
    fontWeight: "extrabold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textTransform: "uppercase",

    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "extrabold",
    textAlign: "center",
    marginBottom: 20,
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
    minHeight: 25, // Add minimum height to rows
  },
  tableColHeader: {
    width: "7%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    fontSize: 8,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4, // Increased padding
  },
  tableColHeaderLarge: {
    width: "18%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4, // Increased padding
  },
  tableColHeaderLargeR: {
    width: "22%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4, // Increased padding
  },
  tableCol: {
    width: "7%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4, // Increased padding
  },
  tableColLarge: {
    width: "18%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4, // Increased padding
  },
  tableColLargeR: {
    width: "22%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4, // Increased padding
  },
  tableCellHeader: {
    margin: 2,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: 2,
    fontSize: 8, // Reduced font size
    textAlign: "center",
    // Enable text wrapping
    wordWrap: "break-word",
  },
  cellContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 15, // Minimum height for content
  },
});

type Props = {
  data: Result[];
  winnerType: String;
};

const AwardsPdf: React.FC<Props> = ({ data, winnerType }) => {
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

  // Function to wrap cell content in a container for better layout
  const CellContent = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.cellContent}>
      <Text style={styles.tableCell}>{children}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data[0].contest.name}</Text>
        <Text style={styles.subtitle}>{winnerType} Medal Winners</Text>

        <View style={styles.table}>
          {/* Table Header */}
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
              <Text style={styles.tableCellHeader}>INSTITUTION</Text>
            </View>
            <View style={styles.tableColHeaderLarge}>
              <Text style={styles.tableCellHeader}>DISTRICT</Text>
            </View>
          </View>

          {/* Table Data */}
          {data.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <CellContent>{index + 1}</CellContent>
              </View>
              <View style={styles.tableColLargeR}>
                <CellContent>{item.rollNumber}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.studentDetails.studentName}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.studentDetails.fatherName}</CellContent>
              </View>
              <View style={styles.tableCol}>
                <CellContent>{item.class}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.studentDetails.schoolId}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.studentDetails.city}</CellContent>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default AwardsPdf;
