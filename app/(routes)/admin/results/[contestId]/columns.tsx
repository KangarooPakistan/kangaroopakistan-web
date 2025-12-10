"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { CgMoreO } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import SchoolAwardsPdf from "./SchoolAwardsPdf/SchoolAwardsPdf";
import IndividualReport from "./IndividualReport/IndividualReport";
import { generateStudentCertificates } from "./Certificates/GoldCertificatePdf";

export interface StudentReport {
  schoolName: string;
  rollNumber: string;
  city: string;
  studentName: string;
  fatherName: string;
  level: string;
  class: string;
  schoolAddress: string;
  totalMarks: number;
  score: number;
  creditScore: number;
  cRow1: number;
  cRow2: number;
  cRow3: number;
  missingQuestionsCount: number[];

  wrong: number;
  cTotal: number;
  missing: number;
  percentage: number;
  constestNo: number;
  year: number;
  rankings: {
    school: {
      rank: number;
      totalParticipants: number;
    };
    district: {
      rank: number;
      totalParticipants: number;
    };
    overall: {
      rank: number;
      totalParticipants: number;
    };
  };
  contestName: string;
  suffix: string;
}
export interface CertificateApiResponse {
  AwardLevel: string | null;
  class: number;
  studentName: string | null;
  fatherName: string | null;
  schoolName: string | null;
  rollNumber: string | null;
}
export interface StudentReportForCertificates {
  AwardLevel: string | null;
  class: number;
  studentName: string | null;
  fatherName: string | null;
  schoolName: string | null;
  rollNumber: string | null;
}

interface ApiResponse {
  scores: Array<{
    rollNo: string;
    totalMarks: number;
    score: number;
    creditScore: number;
    cRow1: number;
    cRow2: number;
    cRow3: number;
    missingQuestionsCount: number[];

    wrong: number;
    cTotal: number;
    missing: number;
    percentage: number;

    rankings: {
      school: { rank: number; totalParticipants: number };
      district: { rank: number; totalParticipants: number };
      overall: { rank: number; totalParticipants: number };
    };
    student: {
      studentName: string;
      fatherName: string;
      class: string;
      level: string;
    };
    contest: {
      name: string;
      contestNo: number;
    };
    parsedRollNumber: {
      suffix: string;
      year: number;
    };
  }>;
  city: string;

  schoolName: string;
  schoolAddress: string;
}

// Types
export interface SchoolResultPdf {
  AwardLevel: string;
  class: string;
  contactId: string;
  district: string;
  fatherName: string;
  id: string;
  percentage: string;
  rollNumber: string;
  schoolDetails: {
    schoolName: string | null;
    schoolAddress: string | null;
    contactNumber: string | null;
  };
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

const transformResponse = (response: ApiResponse): StudentReport[] => {
  return response.scores.map((score) => ({
    schoolName: response.schoolName,
    city: response.city,
    rollNumber: score.rollNo,
    studentName: score.student.studentName,
    fatherName: score.student.fatherName,
    level: score.student.level,
    class: score.student.class,
    schoolAddress: response.schoolAddress,
    totalMarks: score.totalMarks,
    score: score.score,
    creditScore: score.creditScore,
    cRow1: score.cRow1,
    cRow2: score.cRow2,
    cRow3: score.cRow3,
    wrong: score.wrong,
    cTotal: score.cTotal,
    missingQuestionsCount: score.missingQuestionsCount,
    missing: score.missing,
    percentage: score.percentage,
    rankings: score.rankings,
    constestNo: score.contest.contestNo,
    contestName: score.contest.name,
    suffix: score.parsedRollNumber.suffix,
    year: score.parsedRollNumber.year,
  }));
};
export const transformResponseForCertificates = (
  response: CertificateApiResponse[]
): StudentReportForCertificates[] => {
  console.log("Transforming certificates response:", response.length, "items");

  const transformed = response
    .filter((item, index) => {
      if (!item) {
        console.warn(`Filtering out null/undefined item at index ${index}`);
        return false;
      }
      if (!item.studentName || item.studentName.trim() === "") {
        console.warn(
          `Filtering out item with empty studentName at index ${index}:`,
          item
        );
        return false;
      }
      if (!item.rollNumber || item.rollNumber.trim() === "") {
        console.warn(
          `Filtering out item with empty rollNumber at index ${index}:`,
          item
        );
        return false;
      }
      return true;
    })
    .map(
      (item): StudentReportForCertificates => ({
        AwardLevel: item.AwardLevel,
        class: item.class,
        studentName: item.studentName ? item.studentName.trim() : null,
        rollNumber: item.rollNumber ? item.rollNumber.trim() : null,
        fatherName: item.fatherName ? item.fatherName.trim() : null,
        schoolName: item.schoolName ? item.schoolName.trim() : null,
      })
    );

  console.log(
    `Transformed ${transformed.length} valid certificates from ${response.length} total`
  );
  return transformed;
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
    console.log(student);
    if (!student.AwardLevel) return acc;

    // Convert award level to uppercase and remove spaces for consistency
    const awardLevel = student.AwardLevel.toUpperCase().replace(
      /\s+/g,
      "_"
    ) as AwardLevel;

    // Increment the specific award count if it exists in our accumulator
    console.log("awardLevel");
    console.log(awardLevel);
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

// Components
const SchoolResultsActions: React.FC<SchoolResultsProp> = ({
  schoolResult,
}) => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  async function generatePdfBlob(data: SchoolResultsWithStats) {
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
  async function generatePdfBlobForIR(data: StudentReport[]) {
    try {
      // Validate data before passing to PDF component
      // if (!data || (!data.results && !data.statistics)) {
      //   throw new Error("Invalid data structure for PDF generation");
      // }
      console.log("final data");
      console.log(data);

      const doc = <IndividualReport data={data} />;
      const asPdf = pdf(doc);
      return await asPdf.toBlob();
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
  const handleSendEmail = async () => {
    if (!schoolResult.schoolId) {
      console.error("No school ID provided");
      return;
    }

    setIsLoading(true);
    try {
      const schoolResultResp = await axios.get(
        `/api/results/getbyschools/${schoolResult.schoolId}/${params.contestId}`
      );

      if (!schoolResultResp.data) {
        throw new Error("No data received from server");
      }

      const convertedData = schoolResultResp.data?.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId),
        percentage: parseFloat(item.percentage || "0"),
      }));

      const statistics = countStudentsByAward(convertedData);
      const dataWithStats = {
        results: convertedData,
        statistics: statistics,
      };

      const blob = await generatePdfBlob(dataWithStats);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];

        // Send to API
        try {
          await axios.post("/api/users/sendreportthroughemail", {
            pdfData: base64data,
            schoolId: schoolResult.schoolId,
            contestId: params.contestId,
          });
          toast.success("🦄 Email sent successfully", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        } catch (error) {
          console.log(error);
          toast.error(" Error while sending email. Please contact developer", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      };
    } catch (error) {
      console.error("Error processing school result:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Usage in your component:
  const handleView = async () => {
    if (!schoolResult.schoolId) {
      console.error("No school ID provided");
      return;
    }

    setIsLoading(true);
    try {
      const schoolResultResp = await axios.get(
        `/api/results/getbyschools/${schoolResult.schoolId}/${params.contestId}/admin`
      );

      if (!schoolResultResp.data) {
        throw new Error("No data received from server");
      }

      const convertedData = schoolResultResp.data?.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId),
        percentage: parseFloat(item.percentage || "0"),
      }));
      console.log(convertedData);

      const statistics = countStudentsByAward(convertedData);
      console.log("statistics");
      console.log(statistics);
      const dataWithStats = {
        results: convertedData,
        statistics: statistics,
      };

      console.log(statistics);
      console.log(dataWithStats);

      const blob = await generatePdfBlob(dataWithStats);
      saveAs(blob, `School_${schoolResult.schoolId}_Results.pdf`);
    } catch (error) {
      console.error("Error processing school result:", error);
      // Show error to user here
    } finally {
      setIsLoading(false);
    }
  };
  const handleIndividualReport = async () => {
    const response = await axios.get<ApiResponse>(
      `/api/results/individualreports/${params.contestId}/${schoolResult.schoolId}`
    );
    console.log(response);

    const studentResults: StudentReport[] = transformResponse(response.data);
    const blob = await generatePdfBlobForIR(studentResults);
    saveAs(blob, `School_${schoolResult.schoolId}_IndividualReport.pdf`);
    // Now you can work with the transformed data
    console.log(studentResults);
  };
  const handleViewResults = async () => {
    router.push(`/admin/results/${params.contestId}/${schoolResult.schoolId}`);
  };

  const handleCertificatesWithPdfEditing = async () => {
    setIsLoading(true);
    try {
      const loadingToast = toast.loading("Preparing certificates...");

      const response = await axios.get<CertificateApiResponse[]>(
        `/api/results/certificates/${params.contestId}/${schoolResult.schoolId}`
      );

      console.log("Raw certificates data:", response.data);
      const studentResults = transformResponseForCertificates(response.data);
      console.log("Transformed certificates data:", studentResults);

      toast.update(loadingToast, {
        render: `Generating ${studentResults.length} certificates...`,
        type: "info",
        isLoading: true,
      });

      const zip = new JSZip();
      const folder = zip.folder("certificates");

      // Keep track of successfully added certificates
      let successfullyAdded = 0;
      const failedStudents: string[] = [];

      // Process in smaller chunks
      const chunkSize = 5;
      let processedCount = 0;

      for (let i = 0; i < studentResults.length; i += chunkSize) {
        const chunk = studentResults.slice(i, i + chunkSize);

        try {
          // Use the new PDF editing function instead of React PDF
          const validChunk = chunk
            .filter(
              (student) =>
                typeof student.rollNumber === "string" &&
                student.rollNumber !== null
            )
            .map((student) => ({
              ...student,
              rollNumber: student.rollNumber as string,
            }));
          const pdfBlobs = await generateStudentCertificates(validChunk);

          // Add each PDF to the ZIP with better error handling
          for (const pdf of pdfBlobs) {
            if (pdf.blob && pdf.studentName && pdf.blob.size > 0) {
              const fileName = `${pdf.studentName.replace(
                /[^a-zA-Z0-9]/g,
                "_"
              )}_${pdf.rollNumber}.pdf`;
              folder?.file(fileName, pdf.blob);
              successfullyAdded++;
              console.log(
                `✓ Added to ZIP: ${fileName} (${pdf.blob.size} bytes)`
              );
            } else {
              console.warn(`✗ Skipping invalid PDF:`, {
                studentName: pdf.studentName,
                blobSize: pdf.blob?.size || 0,
              });
              failedStudents.push(pdf.studentName || "Unknown");
            }
          }
        } catch (chunkError) {
          console.error(
            `Error processing chunk ${Math.floor(i / chunkSize) + 1}:`,
            chunkError
          );
          // Add failed students from this chunk to the list
          chunk.forEach((student) => {
            if (student.studentName) {
              failedStudents.push(student.studentName);
            }
          });
        }

        processedCount += chunk.length;
        toast.update(loadingToast, {
          render: `Processed ${processedCount} of ${studentResults.length} certificates... (${successfullyAdded} successful)`,
          type: "info",
          isLoading: true,
        });

        // Delay between chunks
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (successfullyAdded === 0) {
        throw new Error("No certificates were successfully generated");
      }

      toast.update(loadingToast, {
        render: "Finalizing ZIP file...",
        type: "info",
        isLoading: true,
      });

      const zipContent = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const fileName = `Certificates_School_${schoolResult.schoolId}_Success_${successfullyAdded}_Total_${studentResults.length}.zip`;
      saveAs(zipContent, fileName);

      // Show detailed completion message
      let message = `Successfully generated ${successfullyAdded} of ${studentResults.length} certificates!`;
      if (failedStudents.length > 0) {
        message += ` Failed: ${failedStudents.length} (check console for details)`;
        console.log("Failed students:", failedStudents);
      }

      toast.update(loadingToast, {
        render: message,
        type: failedStudents.length > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: 8000,
      });
    } catch (error) {
      console.error("Certificate generation failed:", error);
      toast.error(
        `Failed to generate certificates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          autoClose: 5000,
        }
      );
    } finally {
      setIsLoading(false);
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
              className="border-y-2 border-solid"
              onClick={handleViewResults}
              disabled={isLoading}>
              {isLoading ? "Loading..." : "View This School's Results"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleView}
              disabled={isLoading}>
              {isLoading ? "Downloading..." : "Download School Result"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleSendEmail}
              disabled={isLoading}>
              {isLoading ? "Downloading..." : "Send Report To Email"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleIndividualReport}
              disabled={isLoading}>
              {isLoading ? "Downloading..." : "Download Individual Report "}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await axios.post(
                    `/api/results/hold/${params.contestId}/${schoolResult.schoolId}`,
                    { hold: true }
                  );
                  toast.success("Results held for this school.");
                } catch (e) {
                  toast.error("Failed to hold results.");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}>
              {isLoading ? "Processing..." : "Hold Result (Hide from User)"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid bg-blue-800 text-white"
              onClick={handleCertificatesWithPdfEditing}
              disabled={isLoading}>
              {isLoading
                ? "Downloading..."
                : "Download Certificates - With PDF Editing"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await axios.post(
                    `/api/results/hold/${params.contestId}/${schoolResult.schoolId}`,
                    { hold: false }
                  );
                  toast.success("Results unheld for this school.");
                } catch (e) {
                  toast.error("Failed to unhold results.");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}>
              {isLoading ? "Processing..." : "Unhold Result (Show to User)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex flex-wrap gap-2 py-2">
        <Button
          className="text-[11px]"
          size="sm"
          onClick={handleView}
          disabled={isLoading}>
          {isLoading ? "Downloading..." : "Download School Result"}
        </Button>
        <Button
          className="text-[11px]"
          // size="sm"
          onClick={handleIndividualReport}
          disabled={isLoading}>
          {isLoading ? "Downloading..." : "Download Individual Report "}
        </Button>
      </div>
    </>
  );
};

export const columns: ColumnDef<Results>[] = [
  {
    accessorKey: "schoolId",
    filterFn: "equals",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        SchoolId
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    accessorKey: "resultCount",
    header: "Total Results",
  },
  {
    accessorKey: "schoolName",
    header: "School Name",
  },
  {
    id: "actions",
    cell: ({ row }) => <SchoolResultsActions schoolResult={row.original} />,
  },
];
