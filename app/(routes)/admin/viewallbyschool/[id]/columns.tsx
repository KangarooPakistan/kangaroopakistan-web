"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import axios from "axios";
import { useEffect, useState } from "react";
import { CgMoreO } from "react-icons/cg";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Student = {
  registrationId: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  class: string;
  level: string;
  id: number;
};
type StudentActionsProps = {
  student: Student; // Use the Student type here
};
const ContestActions: React.FC<StudentActionsProps> = ({ student }) => {
  const router = useRouter();
  const { onOpen } = useModal();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();

      setCurrentUserEmail(session?.user?.email);
    };
    fetchData();
  }, []);

  const handleView = () => {
    router.push(`/admin/viewallrecipts/${student.registrationId}`);

    // router.push(`/admin/viewregistered/${student.registrationId}`);
  };
  const handleAllRegistrationsView = () => {
    console.log(student.registrationId);
    // router.push(`/admin/fetchallregistration/`);
  };
  const editStudent = () => {
    router.push(
      `/admin/viewregistered/${student.registrationId}/${student.id}`
    );
  };
  const answerSheet = () => {
    router.push(
      `/admin/viewregistered/${student.registrationId}/${student.id}`
    );
  };
  async function generatePdfBlob(student: StudentData) {
    const doc = <MyDocument student={student} />;

    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
    return blob;
  }
  const handleDownloadPdf = async () => {
    // console.log(student)
    try {
      const registrationResponse = await axios.get(
        // `/api/users/pdfdownload/${registration.id}`
        `/api/users/registrations/${student.registrationId}`
      );
      console.log(registrationResponse.data[0]);
      const apiStudentData = await axios.get(
        // `/api/users/pdfdownload/${registration.id}`
        `/api/users/registrations/${student.registrationId}/${student.id}`
      );
      console.log(apiStudentData);
      const studentData: StudentData = {
        rollNumber: apiStudentData.data.rollNumber,
        studentName: apiStudentData.data.studentName,
        fatherName: apiStudentData.data.fatherName,
        studentLevel: apiStudentData.data.level,
        studentClass: apiStudentData.data.class, // Note the mapping from `class` to `studentClass`
        schoolName: registrationResponse.data[0].schoolName, // Use the `schoolName` from the previous API response
        address: registrationResponse.data[0].user.schoolAddress, // Set these as null if they are optional and not available
        districtCode: registrationResponse.data[0].user.district,
        schoolId: registrationResponse.data[0].user.schoolId,
      };
      const blob = await generatePdfBlob(studentData);
      saveAs(blob, "students.pdf");
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    } finally {
    }
  };
  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <CgMoreO className="text-[30px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="border-y-2 border-solid">
              Actions
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={handleView}
              className="border-y-2 border-solid">
              View Receipts{" "}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownloadPdf}
              className="border-y-2 border-solid">
              Download Answer Sheet
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={editStudent}>
              Edit Student{" "}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={() =>
                onOpen("deleteStudent", { id: student.id, currentUserEmail })
              }>
              Delete Student{" "}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden">
        <div className=" flex flex-wrap justify-between items-center gap-2">
          <Button className="m-2" onClick={handleView}>
            View Receipts{" "}
          </Button>
          <Button className="m-2" onClick={handleDownloadPdf}>
            Download Answer Sheet
          </Button>
          <Button className="m-2" onClick={editStudent}>
            Edit Student{" "}
          </Button>
          <Button
            className="m-2"
            onClick={() =>
              onOpen("deleteStudent", { id: student.id, currentUserEmail })
            }>
            Delete Student
          </Button>
        </div>
      </div>
    </>
  );
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "schoolId",
    header: "schoolId",
  },
  {
    accessorKey: "rollNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Roll Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "studentName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "fatherName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Father Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "class",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Class
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Level
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ContestActions student={row.original} />,
  },
];

const numColumns = 2; // Number of columns
const optionWidth = `${100 / numColumns}%`; // Calculate the width of each option

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
  },
  header: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",

    textAlign: "center",
    textTransform: "uppercase",
  },
  subHeaderBetween: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 8,
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
    marginBottom: 1,
  },
  studentInfoTitle: {
    fontSize: "14px",
    width: "250px",
    fontWeight: "heavy",
  },
  studentInfoContent: {
    fontSize: "14px",
    fontWeight: "bold",
    width: "700px", // Set maximum width to fit the container
    flexWrap: "wrap", // Allow text to wrap
    marginLeft: "20px",
  },
  answerGrid: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "black",
    padding: 10,
    // paddingVertical:
    // flex: 1,
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  answerRow: {
    flexDirection: "row",
    // justifyContent: "flex-start",
    width: "100%", // Set width for 3 columns
    paddingBottom: 10, // You can set padding for separation between rows
  },
  questionNumberBox: {
    width: "25px",
    height: "25px",
    marginRight: 14,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    borderRadius: "50%",
  },
  questionNumber: {},
  option: {
    fontSize: 13,
    fontWeight: "bold",
  },
  optionNumber: {
    fontSize: 15,
    marginTop: 2,
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
    // marginBottom: "1px",
  },
  optionBox: {
    width: "14px",
    height: "14px",
    borderWidth: "1px",
    borderColor: "black",
    marginRight: "5px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionBoxForAnswers: {
    width: "25px",
    height: "25px",
    marginRight: 4,
    display: "flex",
    borderRadius: "50%",
    borderWidth: "2px",
    borderColor: "black",
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
    fontSize: 8,
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
    width: "20px", // Half of the optionBox width
    height: "8px", // Same as the optionBox height
    backgroundColor: "black",
    top: "4px",
    left: "6px",
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
    marginTop: "4px",
    // marginVertical: "5px",
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

interface StudentData {
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
  student: StudentData;
}

const MyDocument: React.FC<MyDocumentProps> = ({ student }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>
        International Kangaroo Mathematics Contest
      </Text>
      <Text style={styles.subHeaderBetween}>Answer Sheet</Text>

      <Text style={styles.subHeader}>
        {student.studentLevel == "preecolier" && "PRE ECOLIER (Class 01 & 02)"}
        {student.studentLevel == "ecolier" && "ECOLIER (Class 03 & 04)"}
        {student.studentLevel == "benjamin" && "BENJAMIN (Class 05 & 06)"}
        {/* {student.studentLevel === "BENJAMIN" && "BENJAMIN(Class 05 & 06)"} */}
        {student.studentLevel == "cadet" && "CADET (Class 07 & 08)"}
        {student.studentLevel == "junior" && "JUNIOR (Class 09 & 10)"}
        {student.studentLevel == "student" && "STUDENT (Class 11 & 12)"}
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
          <Text style={styles.studentInfoContent}>{student.districtCode}</Text>
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
          <Text style={styles.studentInfoContent}>{student.studentClass}</Text>
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
          the box with your answer. Example of correctly filled table of answer
          is.
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
          <Text style={styles.optionText}>Correct filling</Text>
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
      {student.studentLevel === "preecolier" ||
      student.studentLevel === "ecolier" ? (
        <VerticalNumberGrid totalNumbers={24} />
      ) : (
        <VerticalNumberGrid totalNumbers={30} />
      )}

      {/* Answer Grid */}
      {/* <View style={styles.answerGrid}>
          {[...Array(30)].map((_, questionIndex) => (
            <View style={styles.answerRow} key={questionIndex}>
              <View style={styles.questionNumberBox}>
                <Text style={styles.option}>{questionIndex + 1}</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
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
        </View> */}

      {/* Add other elements such as instructions, footer, etc. */}
    </Page>
  </Document>
);

const generateVerticalNumbers = (totalNumbers: number, numColumns: number) => {
  const numRows = Math.ceil(totalNumbers / numColumns);
  const grid = Array.from({ length: numRows }, () =>
    new Array(numColumns).fill(null)
  );

  for (let number = 1; number <= totalNumbers; number++) {
    const colIndex = Math.floor((number - 1) / numRows);
    const rowIndex = (number - 1) % numRows;
    grid[rowIndex][colIndex] = number;
  }

  return grid;
};
const VerticalNumberGrid = ({ totalNumbers = 30 }) => {
  const grid = generateVerticalNumbers(totalNumbers, 3);

  return (
    <View style={styles.answerGrid}>
      {grid.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: "1px",
          }}>
          {row.map((number, colIndex) => (
            <View key={colIndex} style={styles.answerRow}>
              <View style={styles.questionNumberBox}>
                {number && <Text style={styles.optionNumber}>{number}</Text>}
              </View>
              {/* Render the options A, B, C, D, E */}
              {number &&
                "ABCDE".split("").map((option) => (
                  <View key={option} style={styles.optionBoxForAnswers}>
                    <Text style={styles.option}>{option}</Text>
                  </View>
                ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
