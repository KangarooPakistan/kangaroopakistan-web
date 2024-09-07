import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

export interface SchoolDetails {
  schoolName: string;
  schoolAddress: string;
  schoolCorPhone: string;
  schoolId: number;
  district: string;
  schoolMainPhone: string;
  schoolPrinPhone: string;
}

interface AllLabelsProps {
  schoolDetails: SchoolDetails[];
}

const AllLabels: React.FC<AllLabelsProps> = ({ schoolDetails }) => {
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

  // Create styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      // justifyContent: "space-between",
      alignItems: "stretch",
      paddingTop: "115pt",
      paddingLeft: "43pt",
      paddingRight: "43pt",
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
    },
    logo: {
      width: 175,
      height: 200,
    },
    addressBlock: {
      marginBottom: 20,
    },
    bold: {
      fontWeight: "extrabold",
    },
    textHeading: {
      fontSize: 16,
      fontFamily: "Roboto",
      textTransform: "uppercase",
      // fontWeight: "bold",
    },
    text: {
      fontSize: 16,
      marginBottom: 5,
      textTransform: "uppercase",
      fontFamily: "Roboto",
      fontWeight: "bold",
    },
    empty: {
      height: "60px",
    },
    subText: {
      textTransform: "uppercase",
      fontSize: 16,
      marginBottom: 5,
      fontFamily: "Roboto",
    },
    fromBlock: {
      marginTop: 20,
    },
    spacer: {
      height: 20,
    },
  });

  return (
    <Document>
      {schoolDetails.map((school, index) => (
        <Page key={school.schoolId} size="A4" style={styles.page}>
          <View>
            <View style={styles.header}>
              <Image style={styles.logo} src="/KSF_PAK.jpeg" />
            </View>

            <View style={styles.addressBlock}>
              <Text style={styles.textHeading}>To the Principal</Text>
              <Text style={[styles.text, styles.bold]}>
                {school.schoolName}
              </Text>
              <Text style={styles.subText}>
                SchoolId:{" "}
                <Text style={[styles.subText, styles.bold]}>
                  {" "}
                  {school.schoolId}{" "}
                </Text>
              </Text>

              <Text style={styles.spacer}></Text>
              <Text style={styles.spacer}></Text>

              <Text style={styles.subText}>
                School Address: {school.schoolAddress}
              </Text>
              <Text style={styles.subText}>District: {school.district}</Text>
              <Text style={styles.subText}>
                Tel:{school.schoolMainPhone} /{school.schoolPrinPhone} /{" "}
                {school.schoolCorPhone}
              </Text>
            </View>
          </View>

          <View style={styles.fromBlock}>
            <Text style={styles.text}>From</Text>
            <Text style={[styles.text, styles.bold]}>
              Innovative Learning - KSF Pakistan
            </Text>
            <Text style={styles.subText}>
              1st FLOOR, PLAZA 114, MAIN BOULEVARD, PHASE 6 DHA, LAHORE{" "}
            </Text>
            <Text style={styles.subText}>Tel: 042-37180505/06</Text>
            <Text style={styles.subText}>
              Cell: 0321-8403033 / 0333-2111399 / 0319-5080077
            </Text>
          </View>
          <View></View>
        </Page>
      ))}
    </Document>
  );
};

export default AllLabels;
