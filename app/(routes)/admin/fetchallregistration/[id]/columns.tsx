"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { BiSolidXCircle } from "react-icons/bi";
import { CgMoreO } from "react-icons/cg";

import "react-toastify/dist/ReactToastify.css";

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
import { useEffect, useState } from "react";
import SchoolReportDocument from "./SchoolReportDocument";
import { getSession } from "next-auth/react";
import CheckList from "./CheckList";
import AllLabels from "./AllLabels";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Registration = {
  id: string;
  schoolId: number;
  schoolName: string;
  studentsLength: number;
  email: string;
  paymentProof?: PaymentProof[];
  contestId: string;
};

export type PaymentProof = {
  id: number;
  imageUrl: string;
};
interface Students {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentClass: string; // Assuming 'class' is a string like '1A', '2B', etc.
  studentLevel: string;
  schoolId: number;
  schoolName: string;
  address: string; // Assuming 'class' is a string like '1A', '2B', etc.
}
interface profileData {
  p_Name: string;
  c_Name: string;
  email: string;
  contactNumber: string;
  contestName: string;
  contestCh: string;
  contestNo: string;
}

type RegistrationProps = {
  registration: Registration; // Use the Contest type here
};
const RegistrationActions: React.FC<RegistrationProps> = ({ registration }) => {
  const router = useRouter();
  const [data, setData] = useState();
  const [active, setActive] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `/api/users/getuserbyemail/${registration.email}`,
          { signal }
        );
        const response = await axios.get(
          `/api/users/pdfdownload/${registration.id}`,
          { signal }
        );
        console.log(response.data.length);
        if (response.data.length > 200) {
          setActive(false);
        } else {
          setActive(true);
        }
        console.log(res);
        setData(res.data.id);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Another error happened:", error);
        }
      }
    };

    fetchData();
    return () => {
      controller.abort();
    };
  }, []);

  const handleView = () => {
    router.push(`/admin/viewallbyschool/${registration.id}`);
  };
  const handleRegister = () => {
    console.log(registration);
    router.push(
      `/admin/enrollstudents/${registration.contestId}/registrationId/${registration.id}`
    );
  };
  async function generatePdfBlob(
    students: Student[],
    profileData: profileData
  ) {
    const doc = <MyDocument students={students} profileData={profileData} />;

    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
    return blob;
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(
        `/api/users/pdfdownload/${registration.id}`
      );
      console.log(response);
      console.log(response.data.length);
      let students: Student[];

      // Check if the response contains more than 200 students
      if (response.data.length > 200) {
        // If yes, slice the array to keep only the first 200 students
        students = response.data.slice(0, 200);
      } else {
        // If no, or if the number is 200 or less, use the full array
        students = response.data;
      }
      const res = await axios.get(
        `/api/users/allusers/getschoolbyregid/${registration.id}`
      );
      console.log(res.data.contestId);
      const contestData = await axios.get(
        `/api/users/contests/${res.data.contestId}`
      );
      console.log(contestData.data);
      console.log(contestData.data.name);
      // console.log("res");
      // console.log(res.data.user.p_fName);
      const profileData: profileData = {
        p_Name: res.data.user.p_Name,
        c_Name: res.data.user.c_Name,
        email: res.data.user.email,
        contactNumber: res.data.user.contactNumber,
        contestName: contestData.data.name,
        contestCh: contestData.data.contestCh,
        contestNo: contestData.data.contestNo,
      };

      const blob = await generatePdfBlob(students, profileData);
      const pdfName = `answersheet_${response.data[0].schoolId}_part1.pdf`;

      saveAs(blob, pdfName);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    } finally {
    }
  };
  async function generateCLBlob(
    name: string,
    year: string,
    contestHeader: string
  ) {
    console.log(name);
    console.log(year);
    const doc = (
      <CheckList name={name} year={year} contestHeader={contestHeader} />
    );

    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
    return blob;
  }
  const handleDownloadCheckList = async () => {
    // const response = await axios.get(`/api/users/contests/${contestId}`)
    try {
      const regData = await axios.get(`/api/registration/${registration.id}`);
      const response = await axios.get(
        `/api/users/contests/${regData.data.contestId}`
      );
      const name = response.data.name;
      const inputString = response.data.contestCh;
      const dateString = response.data.startDate;
      const year = dateString.substring(0, 4);
      let contestHeader = "";

      if (inputString === "M") {
        contestHeader = "IKMC";
      } else if (inputString === "L") {
        contestHeader = "IKLC";
      } else if (inputString === "S") {
        contestHeader = "IKSC";
      }

      const blob = await generateCLBlob(name, year, contestHeader);
      const pdfName = `CheckList_${regData.data.schoolId}.pdf`;

      saveAs(blob, pdfName);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    } finally {
    }
  };
  const handleDownloadAdditionalPdf = async () => {
    try {
      const response = await axios.get(
        `/api/users/pdfdownload/${registration.id}`
      );
      console.log(response);

      let additionalStudents: Student[] = [];

      // Check if the response contains more than 200 students
      if (response.data.length > 200) {
        // If yes, slice the array to keep only the students from 201 onwards
        additionalStudents = response.data.slice(200); // Starts from index 200, which is the 201st student
      } else {
        // If there are not more than 200 students, there's no additional data to process
        console.log("No additional students to download.");
        return; // Exit the function as there's nothing more to process
      }

      const res = await axios.get(
        `/api/users/allusers/getschoolbyregid/${registration.id}`
      );
      console.log(res.data.contestId);
      const contestData = await axios.get(
        `/api/users/contests/${res.data.contestId}`
      );
      console.log(contestData.data);
      console.log(contestData.data.name);
      // console.log("res");
      // console.log(res.data.user.p_fName);
      const profileData: profileData = {
        p_Name: res.data.user.p_Name,
        c_Name: res.data.user.c_Name,
        email: res.data.user.email,
        contactNumber: res.data.user.contactNumber,
        contestName: contestData.data.name,
        contestCh: contestData.data.contestCh,
        contestNo: contestData.data.contestNo,
      };
      const blob = await generatePdfBlob(additionalStudents, profileData);
      const pdfName = `answersheet_${response.data[0].schoolId}_part2.pdf`;
      saveAs(blob, pdfName);
    } catch (error) {
      console.error("Error downloading the additional PDF:", error);
    } finally {
      // You can add any cleanup code here if necessary
    }
  };

  const handleSchoolDetails = () => {
    router.push(`/admin/userprofile/${data}`);
  };
  const generatePdfBlobForSE = async (
    schoolData: Students[],
    profileData: profileData
  ): Promise<Blob> => {
    const doc = (
      <SchoolReportDocument schoolData={schoolData} profileData={profileData} />
    );

    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
    return blob;
  };

  const handleSheet = async () => {
    try {
      const response = await axios.get(
        `/api/users/pdfdownload/${registration.id}`
      );
      console.log("response");
      console.log(response);
      const res = await axios.get(
        `/api/users/allusers/getschoolbyregid/${registration.id}`
      );
      console.log(res.data.contestId);
      const contestData = await axios.get(
        `/api/users/contests/${res.data.contestId}`
      );
      console.log(contestData.data);
      console.log(contestData.data.name);
      // console.log("res");
      // console.log(res.data.user.p_fName);
      const profileData: profileData = {
        p_Name: res.data.user.p_Name,
        c_Name: res.data.user.c_Name,
        email: res.data.user.email,
        contactNumber: res.data.user.contactNumber,
        contestName: contestData.data.name,
        contestCh: contestData.data.contestCh,
        contestNo: contestData.data.contestNo,
      };

      // console.log(response.data);
      const schoolData = response.data;

      schoolData.sort((a: Student, b: Student) => {
        const extractClassAndSerial = (rollNumber: string) => {
          const parts = rollNumber.split("-");
          const classNumber = parseInt(parts[parts.length - 3], 10);
          const serialNumber = parseInt(parts[parts.length - 2], 10);
          return { class: classNumber, serial: serialNumber };
        };

        const aClassAndSerial = extractClassAndSerial(a.rollNumber);
        const bClassAndSerial = extractClassAndSerial(b.rollNumber);

        if (aClassAndSerial.class < bClassAndSerial.class) {
          return -1;
        }
        if (aClassAndSerial.class > bClassAndSerial.class) {
          return 1;
        }
        if (aClassAndSerial.serial < bClassAndSerial.serial) {
          return -1;
        }
        if (aClassAndSerial.serial > bClassAndSerial.serial) {
          return 1;
        }
        return 0;
      });

      const schoolId = schoolData[0].schoolId;
      const blob = await generatePdfBlobForSE(schoolData, profileData);
      saveAs(blob, `students_data_${schoolId}.pdf`);
    } catch (error) {
      console.error("Error generating the PDF:", error);
    }
  };
  const handleEmail = async () => {
    try {
      const res = await axios.get(`/api/users/sendemail/${registration.id}`);
      toast.success("🦄 Email Sent Successfully 😍", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error: any) {
      toast.error(
        "Error sending email, Please try again later 😒 " +
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
      );
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

              {/* <MoreHorizontal className="h-4 w-4" /> */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="border-y-2 border-solid">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleView}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleRegister}>
              Register Students
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleDownloadCheckList}>
              Download CheckList
            </DropdownMenuItem>

            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleEmail}>
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleDownloadPdf}>
              Download Answer Sheet
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleDownloadAdditionalPdf}
              disabled={active}>
              Download Answer Sheet Part2
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleSheet}>
              Download Student Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleSchoolDetails}>
              View School Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex flex-wrap gap-2 py-2 ">
        <Button className=" text-[11px]" size="sm" onClick={handleView}>
          View
        </Button>
        <Button className="text-[11px]" size="sm" onClick={handleRegister}>
          Register Students
        </Button>
        <Button
          className="text-[11px]"
          size="sm"
          onClick={handleDownloadCheckList}>
          Download CheckList
        </Button>

        <Button className="text-[11px]" size="sm" onClick={handleEmail}>
          Send Email
        </Button>
        <Button className="text-[11px]" size="sm" onClick={handleDownloadPdf}>
          Download Answer Sheet
        </Button>
        <Button
          size="sm"
          className="text-[11px]"
          onClick={handleDownloadAdditionalPdf}
          disabled={active}>
          Download Answer Sheet Part2
        </Button>
        <Button size="sm" className="text-[11px]" onClick={handleSheet}>
          Download Student Details
        </Button>
        <Button
          size="sm"
          className=" text-[11px]"
          onClick={handleSchoolDetails}>
          View School Details
        </Button>
      </div>
    </>
  );
};
export const columns: ColumnDef<Registration>[] = [
  {
    accessorKey: "schoolId",
    filterFn: "equals",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
    accessorKey: "paymentProof", // This should match the key from your data
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Payment Proof
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    sortingFn: "basic",
    cell: ({ row }) => {
      // Access the paymentProof property of the row data
      const paymentProofs = row.original.paymentProof || []; // Fallback to an empty array if undefined
      return paymentProofs.length > 0 ? (
        <IoCheckmarkDoneCircle className="text-[30px] mx-auto text-center" />
      ) : (
        <BiSolidXCircle className="text-[30px] mx-auto text-center" />
      );
    },
  },

  {
    accessorKey: "More Actions", // This should match the key from your data
    id: "actions",
    cell: ({ row }) => <RegistrationActions registration={row.original} />,
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
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  subHeaderBetween: {
    fontSize: 10,
    textTransform: "uppercase",
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
    textTransform: "uppercase",
    fontWeight: "heavy",
  },
  studentInfoContent: {
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase",
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
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  optionNumber: {
    fontSize: 15,
    textTransform: "uppercase",
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
    textTransform: "uppercase",
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
    textTransform: "uppercase",
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
  profileData: profileData;
}

const MyDocument: React.FC<MyDocumentProps> = ({ students, profileData }) => (
  <Document>
    {students.map((student, index) => (
      <Page size="A4" style={styles.page} key={index}>
        <Text style={styles.header}>{profileData?.contestName} </Text>
        <Text style={styles.subHeaderBetween}>Answer Sheet</Text>

        <Text style={styles.subHeader}>
          {student.studentLevel == "preecolier" &&
            "PRE ECOLIER (Class 01 & 02)"}
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
    ))}
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

// Render the numbers inside your PDF document
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
