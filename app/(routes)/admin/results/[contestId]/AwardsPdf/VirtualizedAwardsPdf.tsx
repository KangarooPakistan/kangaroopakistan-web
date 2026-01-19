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
    marginBottom: 8,
  },
  subtitle: {
    textTransform: "uppercase",
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "extrabold",
    textAlign: "center",
    marginBottom: 15,
  },
  pageInfo: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 8,
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
    minHeight: 16, // Optimized height for maximum rows
  },
  tableColHeader: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    fontSize: 7,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 1.5,
  },
  tableColHeaderLarge: {
    width: "23%",
    fontSize: 7,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 1.5,
  },
  tableColHeaderLargeLast: {
    width: "23%",
    fontSize: 7,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 1.5,
  },
  tableColHeaderLargeR: {
    width: "23%",
    fontSize: 7,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 1.5,
  },
  tableCol: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 6,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 1,
  },
  tableColLarge: {
    width: "23%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 6,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 1,
  },
  tableColLargeLast: {
    width: "23%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    padding: 1,
  },
  tableColLargeR: {
    width: "23%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 6,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 1,
  },
  tableCellHeader: {
    margin: 0.5,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    margin: 0.5,
    fontSize: 6,
    textAlign: "center",
    wordWrap: "break-word",
  },
  cellContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 10,
  },
});

type Props = {
  data: Result[];
  winnerType: string;
  maxRecordsPerPage?: number;
};

const VirtualizedAwardsPdf: React.FC<Props> = ({ 
  data, 
  winnerType, 
  maxRecordsPerPage = 800 // Increased for better performance
}) => {
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

  // Function to wrap cell content in a container for better layout
  const CellContent = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.cellContent}>
      <Text style={styles.tableCell}>{children}</Text>
    </View>
  );

  // Split data into pages
  const pages = [];
  for (let i = 0; i < data.length; i += maxRecordsPerPage) {
    pages.push(data.slice(i, i + maxRecordsPerPage));
  }

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

  return (
    <Document>
      {pages.map((pageData, pageIndex) => {
        const startIndex = pageIndex * maxRecordsPerPage;
        
        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            <Text style={styles.title}>{data[0]?.contest?.name}</Text>
            <Text style={styles.subtitle}>{winnerType} Medal Winners</Text>
            <Text style={styles.pageInfo}>
              Page {pageIndex + 1} of {pages.length} | Records {startIndex + 1}-{startIndex + pageData.length} of {data.length}
            </Text>

            <View style={styles.table}>
              <TableHeader />
              
              {pageData.map((item, index) => (
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

export default VirtualizedAwardsPdf;