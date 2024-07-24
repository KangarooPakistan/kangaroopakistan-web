import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol1: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableCol2: {
    width: "65%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableCol3: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 500,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  signature: {
    marginTop: 30,
    fontSize: 12,
    fontStyle: "italic",
  },
});

interface CheckListProps {
  name: string;
  contestHeader: string;
  year: string;
}

const CheckList: React.FC<CheckListProps> = ({ name, year, contestHeader }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>
          {contestHeader} {year} Results
        </Text>
        <Text style={styles.text}>Dear Principal,</Text>
        <Text style={styles.text}>
          We hope this letter finds you well. On behalf of Innovative Learning -
          KSF Pakistan, we are pleased to enclose the {name} results for your
          esteemed institution.
        </Text>
        <Text style={styles.text}>
          Enclosed, you will find the following items (if applicable to your
          school):
        </Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>S#</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "65%" }]}>
              <Text style={styles.tableCellHeader}>List of Awards</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "25%" }]}>
              <Text style={styles.tableCellHeader}>No of medals</Text>
            </View>
          </View>
          {/* Table Body */}
          {[
            "Shield for Principal",
            "Shield for Coordinator",
            "Certificates for Principal and Coordinator",
            "Cash Prize for Coordinator",
            "Gold Medal and Red Digital Bottle",
            "Silver Medal and Black Digital Bottle",
            "Bronze Medal and Math Magnet (for grades 1-4)",
            "Bronze Medal and Rubik Cube (for grades 5-12)",
            "3-Star Badge",
            "2-Star Badge",
            "1-Star Badge",
            "Participation Prize - 2 in 1 mobile holder pen",
            "2 in 1 mobile holder pen for the absent students",
            "Total No. of Certificates for all the Participants",
            "Individual Report of all the Participants",
          ].map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol1}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.tableCell}>{item}</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCell}></Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.text}>
          Please review the enclosed materials to ensure that all items have
          been received. Should there be any discrepancies or if you require
          further information, do not hesitate to contact us at
          info@kangaroopakistan.org or 0321-8403033.
        </Text>
        <Text style={styles.text}>
          We are proud of the achievements of your students in the IKMC 2024 and
          appreciate your continuous support and cooperation.
        </Text>
        <Text style={styles.signature}>Yours sincerely,</Text>
        <Text style={styles.signature}>
          Innovative | Inventive Learning - KSF Pakistan
        </Text>
      </View>
    </Page>
  </Document>
);

export default CheckList;
