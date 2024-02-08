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
    marginBottom: 20,
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
    flexWrap: "wrap",
  },
  answerRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  questionNumber: {
    width: 20,
    // marginRight: 10,
  },

  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  option: {
    width: 15, // Adjust the width to make the options smaller
    height: 15, // Adjust the height to make the options smaller

    borderWidth: 1,
    borderColor: "black",
    textAlign: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  // ... Define more styles as needed
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
            <Text style={styles.studentInfoTitle}>Father's Name</Text>
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

        {/* Answer Grid */}
        <View style={styles.answerGrid}>
          {/* This is a mock structure. You would generate this based on the student's answers */}
          {[...Array(30)].map((_, questionIndex) => (
            <View style={styles.answerRow} key={questionIndex}>
              <Text style={styles.questionNumber}>{questionIndex + 1}</Text>
              <Text style={styles.option}>A</Text>
              <Text style={styles.option}>B</Text>
              <Text style={styles.option}>C</Text>
              <Text style={styles.option}>D</Text>
              <Text style={styles.option}>E</Text>
            </View>
          ))}
        </View>

        {/* Add other elements such as instructions, footer, etc. */}
      </Page>
    ))}
  </Document>

  // <Document>
  //   {students.map((student, index) => (
  //     <Page size="A4" style={styles.page} key={index}>
  //       <View style={styles.section}>
  //         <Text>Roll Number: {student.rollNumber}</Text>
  //         <Text>Name: {student.studentName}</Text>
  //         <Text>Father's Name: {student.fatherName}</Text>
  //         <Text>Level: {student.studentLevel}</Text>
  //         <Text>Class: {student.studentClass}</Text>
  //         <Text>School: {student.schoolName}</Text>
  //         <Text>Address: {student.address}</Text>
  //         <Text>District: {student.districtCode}</Text>
  //       </View>
  //     </Page>
  //   ))}
  // </Document>
);
