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
  pageInfo: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 20,
  },
  tableColHeader: {
    width: "7%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    fontSize: 8,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  tableColHeaderLarge: {
    width: "22%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  tableColHeaderLargeLast: {
    width: "22%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  tableColHeaderLargeR: {
    width: "25%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 3,
  },
  tableCol: {
    width: "7%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 7,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColLarge: {
    width: "22%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 7,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColLargeLast: {
    width: "22%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 7,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    padding: 2,
  },
  tableColLargeR: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 7,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableCellHeader: {
    margin: 1,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: 1,
    fontSize: 7,
    textAlign: "center",
    wordWrap: "break-word",
  },
  cellContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 12,
  },
});

type Props = {
  chunks: Result[][];
  winnerType: string;
  contestName: string;
};

const AwardsMultiPagePdf: React.FC<Props> = ({ chunks, winnerType, contestName }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.register({
          family: "Roboto",
          fonts: [
            { src: "/fonts/Roboto-Regular.ttf" },
            { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
          ],
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Font loading failed:", error);
        setFontsLoaded(true); // Continue without custom fonts
      }
    };

    loadFonts();
  }, []);

  const CellContent = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.cellContent}>
      <Text style={styles.tableCell}>{children}</Text>
    </View>
  );

  const TableHeader = () => (
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
      <View style={styles.tableColHeaderLargeLast}>
        <Text style={styles.tableCellHeader}>INSTITUTION</Text>
      </View>
    </View>
  );

  const totalRecords = chunks.reduce((sum, chunk) => sum + chunk.length, 0);

  return (
    <Document>
      {chunks.map((chunk, pageIndex) => {
        const startIndex = chunks.slice(0, pageIndex).reduce((sum, c) => sum + c.length, 0);
        
        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <Text style={styles.title}>{contestName}</Text>
            <Text style={styles.subtitle}>{winnerType} Medal Winners</Text>
            <Text style={styles.pageInfo}>
              Page {pageIndex + 1} of {chunks.length} | Records {startIndex + 1}-{startIndex + chunk.length} of {totalRecords}
            </Text>

            <View style={styles.table}>
              <TableHeader />
              
              {chunk.map((item, index) => (
                <View key={startIndex + index} style={styles.tableRow} wrap={false}>
                  <View style={styles.tableCol}>
                    <CellContent>{startIndex + index + 1}</CellContent>
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
                  <View style={styles.tableColLargeLast}>
                    <CellContent>{item.schoolName}</CellContent>
                  </View>
                </View>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default AwardsMultiPagePdf;