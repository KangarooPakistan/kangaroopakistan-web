import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PDFDownloadLink } from "@react-pdf/renderer";

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
  list: {
    marginLeft: 20,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
  },
  signature: {
    marginTop: 30,
    fontSize: 12,
    fontStyle: "italic",
  },
});

interface CheckListProps {
  name: string;
  year: string;
}

// Create Document Component
const CheckList: React.FC<CheckListProps> = ({ name, year }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>IKMC 2024 Results</Text>
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
        <View style={styles.list}>
          <Text style={styles.listItem}>• Shield for Principal</Text>
          <Text style={styles.listItem}>• Shield for Coordinator</Text>
          <Text style={styles.listItem}>
            • Certificates for Principal and Coordinator
          </Text>
          <Text style={styles.listItem}>• Cash Prize for Coordinator</Text>
          <Text style={styles.listItem}>
            • Gold Medal and Red Digital Bottle
          </Text>
          <Text style={styles.listItem}>
            • Silver Medal and Black Digital Bottle
          </Text>
          <Text style={styles.listItem}>
            • Bronze Medal and Math Magnet (for grades 1-4)
          </Text>
          <Text style={styles.listItem}>
            • Bronze Medal and Rubik Cube (for grades 5-12)
          </Text>
          <Text style={styles.listItem}>• 3-Star Badge</Text>
          <Text style={styles.listItem}>• 2-Star Badge</Text>
          <Text style={styles.listItem}>• 1-Star Badge</Text>
          <Text style={styles.listItem}>
            • Participation Prize - 2 in 1 mobile holder pen
          </Text>
          <Text style={styles.listItem}>
            • 2 in 1 mobile holder pen for the absent students
          </Text>
          <Text style={styles.listItem}>
            • Total No. of Certificates for all the Participants
          </Text>
          <Text style={styles.listItem}>
            • Individual Report of all the Participants
          </Text>
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
