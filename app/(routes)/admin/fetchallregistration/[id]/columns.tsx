"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Registration = {
  id: string;
  schoolId: number;
  schoolName: string;
  studentsLength: number;
  email: string;
};

type RegistrationProps = {
  registration: Registration; // Use the Contest type here
};
const RegistrationActions: React.FC<RegistrationProps> = ({ registration }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleView = () => {
    console.log(registration);
    router.push(`/admin/viewallbyschool/${registration.id}`);
  };
  async function generatePdfBlob(students: Student[]) {
    const doc = <MyDocument students={students} />;
    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
    return blob;
  }
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/users/pdfdownload/${registration.id}`
      );
      const students: Student[] = response.data;
      const blob = await generatePdfBlob(students);
      saveAs(blob, "students.pdf");
    } catch (error) {
      console.error("Error downloading the PDF:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // console.log("registeredStudents");
  // console.log(registeredStudents);
  // router.push(`/admin/fetchallregistration/${contest.id}`);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPdf}>
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export const columns: ColumnDef<Registration>[] = [
  {
    accessorKey: "schoolId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SchoolId
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "schoolName",
    header: "schoolName",
  },
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "studentsLength",
    header: "Total Students",
  },
  {
    id: "actions",
    cell: ({ row }) => <RegistrationActions registration={row.original} />,
  },
];

const numColumns = 3; // Number of columns
const optionWidth = `${100 / numColumns}%`; // Calculate the width of each option

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",

    textAlign: "center",
    textTransform: "uppercase",
  },
  subHeaderBetween: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  studentInfo: {
    marginBottom: 4,
  },
  studentInfoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  studentInfoTitle: {
    fontSize: 12,
    width: "100px",
    fontWeight: "heavy",
  },
  studentInfoContent: {
    fontSize: 12,
    marginLeft: "20px",
  },
  answerGrid: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "33%", // Set width for 3 columns
    paddingBottom: 10, // You can set padding for separation between rows
  },
  questionNumber: {
    marginRight: 2,
    width: "20px",
    textAlign: "center",
    height: 13,
    fontSize: 11,
    marginTop: "2px",
    fontWeight: "bold",
  },
  option: {
    width: "20px", // Adjust the width as per your layout requirement
    borderWidth: "1px",
    borderColor: "black",
    height: 13,
    marginRight: "2px",
    fontSize: 11,
    marginTop: "2px",
    paddingVertical: "auto !important",
    textAlign: "center",
    // marginRight: 10,
    // Adding flex and justifyContent to center the text vertically
    display: "flex", // Use flex to enable flexbox properties
    alignItems: "center", // Center the text vertically
    justifyContent: "center", // Center the text horizontally
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  answerRowInst: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 2,
  },
  optionBox: {
    width: "20px",
    height: "20px",
    borderWidth: "1px",
    borderColor: "black",
    marginRight: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionBoxForAnswers: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  optionBoxLast: {
    width: "50px",
    height: "20px",
    borderWidth: "1px",
    borderColor: "black",
    marginRight: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionText: {
    fontSize: 10,
    textAlign: "center",
  },
  correctFilling: {
    backgroundColor: "black",
  },
  wrongFilling: {
    // Style for wrong filling can include a cross, different color, etc.
    // This example just changes the border color to red
    borderColor: "red",
  },
  filledOption: {
    // When the option is filled incorrectly
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  instBox: {
    borderWidth: 1,
    padding: "10px",
    borderColor: "black",
    marginVertical: "20px",
  },
  cross: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  crossLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "blue",
    transform: "rotate(-45deg)", // Correctly formatted rotate transform
    // Rotate line to create an X
  },
  crossLineReverse: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "blue",
    transform: "rotate(45deg)", // Rotate line in the opposite direction to complete the X
  },
  tickContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    position: "absolute",
    border: "2px solid blue", // Tick color
    borderTop: "none",
    borderRight: "none",
    width: "16px", // Adjust width as needed
    height: "8px", // Adjust height as needed
    transform: "rotate(-45deg)", // Rotate to create the tick shape
    marginBottom: "5px", // Push down to fit within the box
  },
  optionTextWrong: {
    fontSize: "10px",
    position: "relative",
    zIndex: "1",
  },
  circle: {
    width: "15px",
    height: "15px",
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "blue",
  },
  wrongFillingLast: {
    background: "linear-gradient(to right, black 50%, transparent 50%)",
    borderRight: "none", // Remove the border to make it look like a single box
  },
  // Add a right box style to remove the left border to continue the illusion
  rightBox: {
    borderLeft: "none",
  },
  gradientBox: {
    display: "flex",
    flexDirection: "row",
  },
  halfBlack: {
    width: "24px", // Half of the optionBox width
    height: "12px", // Same as the optionBox height
    backgroundColor: "black",
    top: "4px",
    left: "10px",
    position: "absolute",
  },
  wrongBox: {
    marginRight: "20px",
    marginVertical: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  correctBox: {
    marginTop: "10px",
    marginVertical: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: "20px",
  },
  // halfTransparent: {
  //   width: "15px", // Half of the optionBox width
  //   height: "30px", // Same as the optionBox height
  //   backgroundColor: "transparent",
  // },
});

interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentLevel: string;
  studentClass: string; // Changed from `class` to `studentClass`
  schoolName: string | null;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}

interface MyDocumentProps {
  students: Student[];
}

const MyDocument: React.FC<MyDocumentProps> = ({ students }) => (
  <Document>
    {students.map((student, index) => (
      <Page size="A4" style={styles.page} key={index}>
        <Text style={styles.header}>
          International Kangaroo Mathematics Contest
        </Text>
        <Text style={styles.subHeaderBetween}>Answer Sheet</Text>

        <Text style={styles.subHeader}>
          Student Level ({student.studentLevel})
        </Text>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          {/* Repeat this View for each piece of student information */}
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Roll No</Text>
            <Text style={styles.studentInfoContent}>{student.rollNumber}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>District</Text>
            <Text style={styles.studentInfoContent}>
              {student.districtCode}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Student Name</Text>
            <Text style={styles.studentInfoContent}>{student.studentName}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Father Name</Text>
            <Text style={styles.studentInfoContent}>{student.fatherName}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Class/Grade</Text>
            <Text style={styles.studentInfoContent}>
              {student.studentClass}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Institution Name</Text>
            <Text style={styles.studentInfoContent}>{student.schoolName}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Address</Text>
            <Text style={styles.studentInfoContent}>{student.address}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Institution Code</Text>
            <Text style={styles.studentInfoContent}>{student.schoolId}</Text>
          </View>

          {/* ... other student info rows */}
        </View>
        <View style={styles.instBox}>
          {/* Row with correct filling example */}
          <Text style={styles.optionText}>
            Choose only one of the five proposed answers[A,B,C,D,E] and fill in
            the box with your answer. Example of correctly filled table of
            answer is.
          </Text>

          <View style={styles.correctBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>
              <View style={[styles.optionBox, styles.correctFilling]}></View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
                <View style={styles.cross}>
                  <View style={styles.crossLine}></View>
                  <View style={styles.crossLineReverse}></View>
                </View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>C</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
              {/* ... other options ... */}
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionTextWrong}>B</Text>
                <View style={styles.tick}></View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>C</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>

              <View style={styles.optionBox}>
                <Text style={styles.optionTextWrong}>C</Text>
                <View style={styles.circle}></View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text>A</Text>
              </View>

              <View style={[styles.gradientBox]}>
                <View style={styles.optionBox}>
                  <Text style={styles.optionText}>B</Text>
                </View>
                <View style={styles.halfBlack} />
                <View style={styles.optionBox}>
                  <Text style={styles.optionText}>C</Text>
                </View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
        </View>

        {/* Answer Grid */}
        <View style={styles.answerGrid}>
          {[...Array(30)].map((_, questionIndex) => (
            <View style={styles.answerRow} key={questionIndex}>
              <Text style={styles.questionNumber}>{questionIndex + 1}</Text>
              <View style={styles.optionText}>
                <Text style={styles.option}>A</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>B</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>C</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>D</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>E</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Add other elements such as instructions, footer, etc. */}
      </Page>
    ))}
  </Document>
);
