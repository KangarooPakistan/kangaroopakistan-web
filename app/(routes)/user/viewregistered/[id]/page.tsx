"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import SchoolReportDocument from "./SchoolReportDocument";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import Link from "next/link";
import SchoolAwardsPdf from "@/app/(routes)/admin/results/[contestId]/SchoolAwardsPdf/SchoolAwardsPdf";
// type ProfileData = {
//   p_fName: string;
//   p_mName: string;
//   p_lName: string;
//   c_fName: string;
//   c_mName: string;
//   c_lName: string;
//   email: string;
//   contactNumber: string;
// };
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

export interface SchoolResultPdf {
  AwardLevel: string;
  class: string;
  contactId: string;
  district: string;
  fatherName: string;
  id: string;
  percentage: string;
  rollNumber: string;
  score: {
    score: string;
    total: string;
  };
  studentName: string;
}

type AwardLevel =
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "THREE_STAR"
  | "TWO_STAR"
  | "ONE_STAR"
  | "PARTICIPATION";

export interface AwardCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
  THREE_STAR: number;
  TWO_STAR: number;
  ONE_STAR: number;
  PARTICIPATION: number;
  total: number;
}

export interface SchoolResultsWithStats {
  results: SchoolResultPdf[];
  statistics: AwardCounts;
}

type Results = {
  id: number;
  schoolId: number;
};

type SchoolResultsProp = {
  schoolResult: Results;
};

// Helper Functions
function countStudentsByAward(students: SchoolResultPdf[]): AwardCounts {
  // Return default counts if students array is undefined or empty
  if (!students || students.length === 0) {
    return {
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0,
      THREE_STAR: 0,
      TWO_STAR: 0,
      ONE_STAR: 0,
      PARTICIPATION: 0,
      total: 0,
    };
  }

  const initialCounts: AwardCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
    THREE_STAR: 0,
    TWO_STAR: 0,
    ONE_STAR: 0,
    PARTICIPATION: 0,
    total: 0,
  };

  return students.reduce((acc, student) => {
    if (!student.AwardLevel) return acc;

    // Convert award level to uppercase and remove spaces for consistency
    const awardLevel = student.AwardLevel.toUpperCase().replace(
      /\s+/g,
      "_"
    ) as AwardLevel;

    // Increment the specific award count if it exists in our accumulator
    if (awardLevel in acc) {
      acc[awardLevel]++;
    }

    // Increment total count
    acc.total++;

    return acc;
  }, initialCounts);
}
function convertToBigIntOrNumber(value: string | null | undefined) {
  if (!value) return 0;

  try {
    if (value.includes(".")) {
      return parseFloat(value);
    }

    const bigIntValue = BigInt(value);
    return bigIntValue <= Number.MAX_SAFE_INTEGER
      ? Number(bigIntValue)
      : bigIntValue;
  } catch (error) {
    console.error("Failed to convert value:", error);
    return 0;
  }
}
interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

function ViewRegistered({ params, searchParams }: PageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const { onOpen } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [registrationId, setRegistrationId] = useState<string>();
  const [preEculier, setPreEculier] = useState<number>(0);
  const [totalPaymentDone, setTotalPaymentDone] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);
  const [pdfUrl, setPdfUrl] = useState("");
  const [schoolId, setSchoolId] = useState(0);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>();

  // const params = useParams();
  type LevelCounts = Record<string, number>;
  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();

      setCurrentUserEmail(session?.user?.email);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await getSession();

        const response = await axios.get(
          `/api/users/getuserbyemail/${session?.user.email}`
        );
        const schoolId = response.data.schoolId;
        const potentialPdfUrl = `https://kangaroopakistan-prod.s3.amazonaws.com/Results/${schoolId}.pdf`;

        // Optionally check if the PDF exists
        try {
          // await axios.head(potentialPdfUrl);
          console.log(potentialPdfUrl);
          setPdfUrl(potentialPdfUrl); // Set the URL if the file exists
        } catch (error) {
          console.error("PDF does not exist:", error);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    const fetch = async () => {
      try {
        const session = await getSession();

        const response = await axios.get(
          `/api/users/getuserbyemail/${session?.user.email}`
        );

        const regId = await axios.get(
          `/api/users/contests/${params.id}/${response.data.schoolId}`
        );
        setSchoolId(response.data.schoolId);
        setRegistrationId(regId.data.id);
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations/${regId.data.id}`
        );
        console.log(registeredStudents);
        const levelCounts = registeredStudents.data.reduce(
          (acc: LevelCounts, student: Student) => {
            const { level } = student;
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {}
        );
        console.log(levelCounts);
        setPreEculier(levelCounts["preecolier"] || 0);
        setEculier(levelCounts["ecolier"] || 0);
        setBenjamin(levelCounts["benjamin"] || 0);
        setCadet(levelCounts["cadet"] || 0);
        setJunior(levelCounts["junior"] || 0);
        setStudent(levelCounts["student"] || 0);
        console.log(registeredStudents.data);
        setStudents(registeredStudents.data);
        const paymentProof = await axios.get(
          `/api/users/paymentproof/${regId.data.id}`
        );
        setTotalPaymentDone(paymentProof.data.length);
        console.log("paymentProof");
        console.log(paymentProof);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  }, [params.id]);
  const handleClick = () => {
    router.push(`/user/viewallrecipts/${registrationId}`);
  };
  const handleBack = () => {
    router.back();
  };
  const handleResults = () => {
    router.back();
  };
  async function generatePdfBlobForResults(data: SchoolResultsWithStats) {
    try {
      // Validate data before passing to PDF component
      if (!data || (!data.results && !data.statistics)) {
        throw new Error("Invalid data structure for PDF generation");
      }

      const doc = <SchoolAwardsPdf data={data} />;
      const asPdf = pdf(doc);
      return await asPdf.toBlob();
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  const handleView = async () => {
    // if (!schoolResult.schoolId) {
    //   console.error("No school ID provided");
    //   return;
    // }

    setIsLoading(true);
    try {
      const schoolResultResp = await axios.get(
        `/api/results/getbyschools/${schoolId}/${params.id}`
      );

      if (!schoolResultResp.data) {
        throw new Error("No data received from server");
      }

      const convertedData = schoolResultResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId),
        percentage: parseFloat(item.percentage || "0"),
      }));

      const statistics = countStudentsByAward(convertedData);
      const dataWithStats = {
        results: convertedData,
        statistics: statistics,
      };
      console.log("schoolId");
      console.log(schoolId);
      const blob = await generatePdfBlobForResults(dataWithStats);
      saveAs(blob, `School_${schoolId}_Results.pdf`);
    } catch (error) {
      console.error("Error processing school result:", error);
      // Show error to user here
    } finally {
      setIsLoading(false);
    }
  };

  const generatePdfBlob = async (
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
    console.log("kkr");
    try {
      const response = await axios.get(
        `/api/users/pdfdownload/${registrationId}`
      );

      const res = await axios.get(
        `/api/users/allusers/getschoolbyregid/${registrationId}`
      );
      console.log(res.data.contestId);
      const contestData = await axios.get(
        `/api/users/contests/${res.data.contestId}`
      );
      console.log(contestData.data);
      console.log(contestData.data.name);
      console.log("res");
      console.log(res.data.user.p_fName);
      const profileData: profileData = {
        p_Name: res.data.user.p_Name,
        c_Name: res.data.user.c_Name,
        email: res.data.user.email,
        contactNumber: res.data.user.contactNumber,
        contestName: contestData.data.name,
        contestCh: contestData.data.contestCh,
        contestNo: contestData.data.contestNo,
      };

      console.log(response.data);
      const schoolData = response.data;
      console.log("schoolData"); // This should be an array of ClassData
      console.log(schoolData);
      const blob = await generatePdfBlob(schoolData, profileData);
      saveAs(blob, "students_details.pdf");
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };
  // const handleSheet = async () => {
  //   try {
  //     const response = await axios.get(
  //       `/api/users/pdfdownload/${registrationId}`
  //     );

  //     const res = await axios.get(
  //       `/api/users/allusers/getschoolbyregid/${registrationId}`
  //     );
  //     console.log("res");
  //     console.log(res.data.user.p_fName);
  //     const profileData: ProfileData = {
  //       p_fName: res.data.user.p_fName,
  //       p_mName: res.data.user.p_mName,
  //       p_lName: res.data.user.p_lName,
  //       c_fName: res.data.user.c_fName,
  //       c_mName: res.data.user.c_mName,
  //       c_lName: res.data.user.c_lName,
  //       email: res.data.user.email,
  //       contactNumber: res.data.user.contactNumber,
  //     };

  //     console.log(response.data);
  //     const schoolData = response.data;
  //     console.log("schoolData"); // This should be an array of ClassData
  //     console.log(schoolData); // This should be an array of ClassData
  //     const promise = pdf(
  //       <SchoolReportDocument
  //         schoolData={schoolData}
  //         profileData={profileData}
  //       />
  //     ).toBlob();

  //     const blob = await Promise.race([
  //       promise,
  //       new Promise((_, reject) =>
  //         setTimeout(() => reject(new Error("Timeout")), 200000)
  //       ), // Timeout after 10 seconds
  //     ]);
  //     // pdf(
  //     //   <SchoolReportDocument
  //     //     schoolData={schoolData}
  //     //     profileData={profileData}
  //     //   />
  //     // )
  //     //   .toBlob()
  //     //   .then((blob) => {
  //     //     console.log("PDF Blob created:", blob);

  //     //     // Create URL from the Blob
  //     //     const url = URL.createObjectURL(blob);
  //     //     console.log("Generated PDF URL:", url);

  //     //     // Trigger download
  //     //     const link = document.createElement("a");
  //     //     link.href = url;
  //     //     link.setAttribute("download", "school-report.pdf");
  //     //     document.body.appendChild(link);
  //     //     link.click();
  //     //     document.body.removeChild(link);

  //     //     // Revoke the created URL to free up resources
  //     //     URL.revokeObjectURL(url);
  //     //   })
  //     //   .catch((error) => {
  //     //     console.error("Error generating the PDF:", error);
  //     //   });
  //   } catch (error) {
  //     console.error("Error generating the PDF:", error);
  //   }
  // };
  return (
    <div className="container mx-auto py-4">
      <div className="py-4">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
            <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Total Students</h2>
              <p className="text-lg font-semibold">{students.length}</p>
              <h2 className="font-bold text-2xl mb-4">Payment Proof</h2>
              <p className="text-lg font-semibold">
                {totalPaymentDone === 0
                  ? "No payment proof  uploaded"
                  : "Payment Done"}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 px-2">
            <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Levels</h2>
              <ul>
                <li className="mb-2 text-lg font-medium">
                  Total # of Preecolier:{" "}
                  <span className="font-bold">{preEculier}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Ecolier:{" "}
                  <span className="font-bold">{eculier}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Benjamin:{" "}
                  <span className="font-bold">{benjamin}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Cadet: <span className="font-bold">{cadet}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Junior: <span className="font-bold">{junior}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Student:{" "}
                  <span className="font-bold">{student}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-end mt-4">
          {pdfUrl ? (
            <div className="w-full sm:w-1/2 md:w-1/4  p-1">
              <Button className="w-full">
                <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  View Results
                </Link>
              </Button>
            </div>
          ) : (
            <div className="w-full sm:w-1/2 md:w-1/4 p-1">
              <Button className="w-full">No results found</Button>
            </div>
          )}
          <div className="w-full sm:w-1/2 md:w-1/4 p-1">
            <Button className="w-full" onClick={handleClick}>
              View All Proof of Payments
            </Button>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 p-1">
            <Button className="w-full" onClick={handleView}>
              Download Results
            </Button>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 p-1">
            <Button className="w-full" onClick={handleSheet}>
              Download student Data
            </Button>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 p-1">
            <Button
              className="w-full"
              onClick={() =>
                onOpen("addImage", { registrationId, currentUserEmail })
              }>
              Add Proof of Payment
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end">
        <Button variant="default" className="mb-2 sm:mb-0" onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="ghost"
          className="w-full sm:w-auto text-center sm:text-left text-xl font-bold leading-tight tracking-tight text-purple-600 md:text-3xl mb-2 sm:mb-0"
          onClick={() => onOpen("addImage", { registrationId })}>
          Attach Proof of Payment
        </Button>
      </div>

      <DataTable columns={columns} data={students} />
    </div>
  );
}

export default ViewRegistered;
