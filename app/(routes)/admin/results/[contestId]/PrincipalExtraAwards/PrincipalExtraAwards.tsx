import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PrincipalCertificateData } from "../Certificates/PrincipalCertificateData"; // Import the type

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
    marginBottom: 10,
  },
  sectionTitle: {
    textTransform: "uppercase",
    fontSize: 12,
    fontFamily: "Roboto",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 25,
  },
  tableColHeader: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    fontSize: 8,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tableColHeaderMedium: {
    width: "30%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tableColHeaderLarge: {
    width: "60%",
    fontSize: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tableCol: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColMedium: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColLarge: {
    width: "60%",
    borderStyle: "solid",
    borderWidth: 1,
    fontSize: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
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

type Props = {
  contestName: string;
  eelpcertificateData: PrincipalCertificateData;
  oaepcertificateData: PrincipalCertificateData;
  dpcpcertificateData: PrincipalCertificateData;
};

const PrincipalExtraAwards: React.FC<Props> = ({
  contestName,
  eelpcertificateData,
  oaepcertificateData,
  dpcpcertificateData,
}) => {
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

  const CellContent = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.cellContent}>
      <Text style={styles.tableCell}>{children}</Text>
    </View>
  );

  const renderCertificateTable = (
    certificateData: PrincipalCertificateData
  ) => (
    <>
      <Text style={styles.sectionTitle}>{certificateData.name}</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>SR. NO.</Text>
          </View>
          <View style={styles.tableColHeaderMedium}>
            <Text style={styles.tableCellHeader}>COORDINATOR NAME</Text>
          </View>
          <View style={styles.tableColHeaderMedium}>
            <Text style={styles.tableCellHeader}>SCHOOL ID</Text>
          </View>
          <View style={styles.tableColHeaderLarge}>
            <Text style={styles.tableCellHeader}>SCHOOL NAME</Text>
          </View>
        </View>

        {/* Table Data */}
        {certificateData.data.map(
          (item: (typeof certificateData.data)[number], index: number) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.tableCol}>
                <CellContent>{index + 1}</CellContent>
              </View>
              <View style={styles.tableColMedium}>
                <CellContent>{item.p_Name}</CellContent>
              </View>
              <View style={styles.tableColMedium}>
                <CellContent>{item.schoolId}</CellContent>
              </View>
              <View style={styles.tableColLarge}>
                <CellContent>{item.schoolName}</CellContent>
              </View>
            </View>
          )
        )}
      </View>
    </>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{contestName}</Text>
        <Text style={styles.subtitle}>Principal Excellence Awards</Text>

        {renderCertificateTable(eelpcertificateData)}
        {renderCertificateTable(oaepcertificateData)}
        {renderCertificateTable(dpcpcertificateData)}
      </Page>
    </Document>
  );
};

export default PrincipalExtraAwards;
