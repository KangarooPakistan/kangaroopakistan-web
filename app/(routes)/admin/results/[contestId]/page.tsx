"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import AwardsPdf from "./AwardsPdf/AwardsPdf";
import { utils, writeFile } from "xlsx";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { toast, ToastContainer, Id } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

import { ca } from "date-fns/locale";
import QuestionStatsPdf from "../QuestionStats/QuestionStats";
import JSZip from "jszip";
import {
  ensureFontsLoaded,
  registerFonts,
} from "./Certificates/GoldCertificate";
import { generatePrincipalCertificates } from "./Certificates/PrincipalCertificate";
import {
  CoordinatorDetails,
  CoordinatorDetailsList,
  generateCoordinatorCertificates,
} from "./Certificates/CoordinatorCertificate";

export type Contest = {
  contestDate: string;
  name: string;
};

type PrincipalDetails = {
  schoolId: number;
  schoolName: string;
  p_Name: string;
};

type PrincipalDetailsList = PrincipalDetails[];

export type CoordinatorPdfBlob = {
  blob: Blob;
  coordinatorName: string;
  schoolId: number;
};
export type Score = {
  rollNo: string;
  score: string;
  totalMarks: string;
};

export type StudentDetails = {
  class: string;
  city: string;
  district: string;
  fatherName: string;
  level: string;
  schoolId: number;
  schoolName: string;
  studentName: string;
};

interface SchoolAwardCount {
  schoolName: string;
  awards: Record<string, number>;
}

export type Result = {
  AwardLevel: string;
  class: number;
  contest: Contest;
  district: string;
  id: string;
  percentage: number;
  rollNumber: string;
  schoolId: number;
  schoolName: string;
  score: Score;
  scoreId?: string | undefined;
  studentDetails: StudentDetails;
};
export type SchoolData = {
  schoolId: number;
  schoolName: String;
  district: number;
  city: string;
  schoolAddress: string;
  contactNumber: string;
  email: string;
  resultCount: number;
  juniorBronzeCount: number; // Added for junior bronze count
  seniorBronzeCount: number; // Added for senior bronze count
};

type PrincipalPdfBlob = {
  blob: Blob;
  principalName: string;
  schoolId: number;
};
const Results = () => {
  const [schoolData, setSchoolData] = useState([]);
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadData, setLoadData] = useState(true);
  const router = useRouter();
  const [result, setResult] = useState<Result[]>([]);
  const [questionStats, setQuestionStats] = useState<any>(null);
  const [contestName, setContestName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contestData = await axios.get(
          `/api/users/contests/${params.contestId}`
        );
        console.log(contestData);
        setContestName(contestData.data.name);

        // Only fetch aggregated school data for the table on initial load.
        // The full results list (which can be 18k+ rows) is fetched lazily
        // only when needed for Excel export, to keep initial page load fast.
        const resp = await axios.get(
          `/api/results/getschoolsdata/${params.contestId}`
        );
        setSchoolData(resp.data);
        setLoadData(false);
        console.log("resp");
        console.log(resp);

        toast.success("🦄 Table data fetched successfully", {
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
        console.error(error);
        toast.error(
          " " + (error.response?.data?.message || "Failed to load data"),
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
    fetchData();
  }, [params.contestId]);

  async function generatePdfBlob(data: Result[], winnerType: string) {
    console.log(data);
    console.log("--------------------------");
    const doc = <AwardsPdf data={data} winnerType={winnerType} />;
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@");

    const asPdf = pdf(doc); // Create an empty PDF instance
    console.log("----------!!!!!!!!!");
    const blob = await asPdf.toBlob();
    console.log("----------!!!!!!!!!");
    return blob;
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
  function processDataForExcel(schoolData: SchoolData[], resultData: Result[]) {
    const schoolAwardCounts = new Map<number, SchoolAwardCount>();
    const uniqueAwards = Array.from(
      new Set(resultData.map((result) => result.AwardLevel))
    ).filter((award) => !!award); // Remove nulls

    // Initialize counts and create a map to track total students per school
    const schoolTotalStudents = new Map<number, number>();

    schoolData.forEach((school) => {
      schoolAwardCounts.set(school.schoolId, {
        schoolName: school.schoolName.toString(),
        awards: uniqueAwards.reduce((acc, award) => {
          acc[award] = 0;
          return acc;
        }, {} as Record<string, number>),
      });
      schoolTotalStudents.set(school.schoolId, 0);
    });

    // Count awards and total students for each school
    resultData.forEach((result) => {
      const schoolData = schoolAwardCounts.get(result.schoolId);
      if (schoolData && result.AwardLevel) {
        schoolData.awards[result.AwardLevel]++;
        // Increment total students count
        schoolTotalStudents.set(
          result.schoolId,
          (schoolTotalStudents.get(result.schoolId) || 0) + 1
        );
      }
    });

    // Calculate junior and senior bronze counts
    const juniorBronzeCounts = new Map<number, number>();
    const seniorBronzeCounts = new Map<number, number>();

    resultData.forEach((result: any) => {
      if (result.AwardLevel === "BRONZE") {
        if (result.level === "JUNIOR") {
          juniorBronzeCounts.set(
            result.schoolId,
            (juniorBronzeCounts.get(result.schoolId) || 0) + 1
          );
        } else if (result.level === "SENIOR") {
          seniorBronzeCounts.set(
            result.schoolId,
            (seniorBronzeCounts.get(result.schoolId) || 0) + 1
          );
        }
      }
    });

    // Prepare headers and rows with school ID and total students
    const headers = [
      "School ID",
      "School Name",
      "Total Students",
      ...uniqueAwards,
      "Junior Bronze Count", // Added column
      "Senior Bronze Count", // Added column
    ];

    const rows = Array.from(schoolAwardCounts.entries()).map(
      ([schoolId, school]) => {
        return [
          schoolId,
          school.schoolName,
          schoolTotalStudents.get(schoolId) || 0,
          ...uniqueAwards.map((award) => school.awards[award]),
          juniorBronzeCounts.get(schoolId) || 0, // Add junior bronze count
          seniorBronzeCounts.get(schoolId) || 0, // Add senior bronze count
        ];
      }
    );

    return {
      headers,
      rows,
    };
  }

  function downloadExcel(schoolData: SchoolData[], resultData: Result[]) {
    // Process the data
    const { headers, rows } = processDataForExcel(schoolData, resultData);

    // Log to understand the exact structure
    console.log("Headers:", headers);
    console.log("Rows sample:", rows.slice(0, 2)); // First two rows

    // Create workbook and worksheet
    const XLSX = require("xlsx");
    const workbook = XLSX.utils.book_new();

    // Convert to worksheet format
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // More dynamic column width setting
    const colWidths = headers.map((header, index) => ({
      wch:
        Math.max(
          header.length,
          ...rows.map((row) => String(row[index] || "").length)
        ) + 5, // Add some padding
    }));

    worksheet["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "School Awards");

    // Generate Excel file
    XLSX.writeFile(workbook, "School_Awards_Report.xlsx");
  }

  const handleExcel = async () => {
    try {
      setIsLoading(true);

      // Lazily load heavy results only when Excel export is requested.
      let resultsData: Result[] = result;
      if (!resultsData || resultsData.length === 0) {
        const data = await axios.get<Result[]>(
          `/api/results/fetchresults/${params.contestId}`
        );
        resultsData = data.data;
        setResult(resultsData);
      }

      console.log(schoolData);
      console.log(resultsData);
      downloadExcel(schoolData, resultsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate Excel sheet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCount = async () => {
    try {
      setIsLoading(true);
      const countAwards = await axios.get(
        `/api/results/fetchresults/${params.contestId}/count`
      );
      console.log(countAwards);
      const { awardCounts } = countAwards.data;
      downloadAwardCountsExcel(awardCounts);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      console.log(error);
      toast.error("Failed to download award counts");
    }
  };
  const downloadAwardCountsExcel = (awardCounts: Record<string, number>) => {
    // Prepare data for Excel
    const excelData = Object.entries(awardCounts).map(([award, count]) => ({
      "Award Level": award,
      Count: count,
    }));

    // Add total row

    // Create worksheet
    const worksheet = utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Award Level
      { wch: 10 }, // Count
      { wch: 12 }, // Percentage
    ];
    worksheet["!cols"] = colWidths;

    // Create workbook
    const workbook = {
      Sheets: {
        "Award Counts": worksheet,
      },
      SheetNames: ["Award Counts"],
    };

    // Write to file and download
    writeFile(workbook, "award_counts.xlsx");
  };

  const handleGold = async () => {
    try {
      setIsLoading(true);
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/GOLD`
      );
      console.log("schoolResultGoldResp");
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "GOLD");
      const pdfName = `GoldWinners.pdf`;
      saveAs(blob, pdfName);
      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleGoldExcel = async () => {
    try {
      setIsLoading(true);
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/GOLD`
      );
      console.log("schoolResultGoldResp");
      console.log(schoolResultGoldResp);

      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_gold_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };

  const handleSilver = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/SILVER`
      );
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "SILVER");
      const pdfName = `SilverWinners.pdf`;
      saveAs(blob, pdfName);

      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleSilverExcel = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/SILVER`
      );
      console.log(schoolResultGoldResp);
      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_silver_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleBronze = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/BRONZE`
      );
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "BRONZE");
      const pdfName = `BronzeWinners.pdf`;
      saveAs(blob, pdfName);

      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleBronzeExcel = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/BRONZE`
      );
      console.log(schoolResultGoldResp);

      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_bronze_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };

  const handleThreeStar = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/THREE STAR`
      );
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "THREE STAR");
      const pdfName = `ThreeStarWinners.pdf`;
      saveAs(blob, pdfName);

      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleThreeStarExcel = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/THREE STAR`
      );
      console.log(schoolResultGoldResp);

      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_three_star_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleTwoStar = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/TWO STAR`
      );
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "TWO STAR");
      const pdfName = `TwoStarWinners.pdf`;
      saveAs(blob, pdfName);

      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleTwoStarExcel = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/TWO STAR`
      );
      console.log(schoolResultGoldResp);
      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_two_star_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleOneStar = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/ONE STAR`
      );
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "ONE STAR");
      const pdfName = `OneStarWinners.pdf`;
      saveAs(blob, pdfName);

      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleOneStarExcel = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/ONE STAR`
      );
      console.log(schoolResultGoldResp);

      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_one_star_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleParticipation = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/participation`
      );
      console.log(schoolResultGoldResp);

      // Map over the data to convert values accordingly
      const convertedData = schoolResultGoldResp.data.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId), // Convert scoreId to BigInt or Number
        percentage: parseFloat(item.percentage), // Convert percentage to a floating-point number
      }));
      const blob = await generatePdfBlob(convertedData, "Participation");
      const pdfName = `ParticipationWinners.pdf`;
      saveAs(blob, pdfName);

      console.log(convertedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleParticipationExcel = async () => {
    try {
      setIsLoading(true);

      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/${params.contestId}/participation`
      );
      console.log(schoolResultGoldResp);

      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_participation_winners.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleExcelForKainat = async () => {
    try {
      setIsLoading(true);
      const schoolResultGoldResp = await axios.get(
        `/api/results/allresults/${params.contestId}`
      );
      console.log(schoolResultGoldResp);
      console.log("schoolResultGoldResp");

      const studentDetails = schoolResultGoldResp.data.map((item: any) => ({
        schoolName: item.schoolName,
        studentName: item.studentDetails.studentName,
        fatherName: item.studentDetails.fatherName,
        rollNumber: item.score.rollNo,
        awardLevel: item.AwardLevel,
        class: item.studentDetails.class,
      }));
      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_for_kainats_use.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleExcelForKainatPart2 = async () => {
    try {
      setIsLoading(true);
      const schoolResultGoldResp = await axios.get(
        `/api/results/getallscores/${params.contestId}`
      );
      console.log(schoolResultGoldResp);
      console.log("schoolResultGoldResp");
      const studentsByClass = JSON.parse(schoolResultGoldResp.data);
      const allStudents = Object.values(studentsByClass).flat();

      const studentDetails = allStudents.map((item: any) => ({
        id: item.id,
        rollNumber: item.rollNo,
        cRow1: item.cRow1,
        cRow2: item.cRow2,
        cRow3: item.cRow3,
        cTotal: item.cTotal,
        creditScore: item.creditScore,
        description: item.description,
        missing: item.missing,
        percentage: item.percentage,
        score: item.score ? Number(item.score) : null,
        totalMarks: item.totalMarks ? Number(item.totalMarks) : null,
        wrong: item.wrong,
        class: item.rollNo?.split("-")[2] || "Unknown",
      }));

      const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(studentDetails);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details");
        XLSX.writeFile(workbook, "student_details_for_kainats_use.xlsx");
      };
      downloadExcel();

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const downloadQuestionStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/question-stats/${params.contestId}`
      );
      console.log(response.data);
      setQuestionStats(response.data); // Save the data to state
      setIsLoading(false);
      const blob = await pdf(
        <QuestionStatsPdf data={response.data} />
      ).toBlob();

      // Download PDF
      saveAs(blob, `${response.data.contestName}_Question_Stats.pdf`);

      toast.success("Question stats fetched successfully", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      toast.error("Failed to fetch question stats", {
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

  const handleBack = () => {
    router.back();
  };
  const handlePrincipalDetails = async () => {
    setIsLoading(true);
    let loadingToast: Id | undefined;

    try {
      loadingToast = toast.loading("Preparing principal certificates...");

      // Step 1: Fetch principal details
      const response = await axios.get<PrincipalDetailsList>(
        `/api/users/getprincipalanddetails/${params.contestId}`
      );

      const principalResults: PrincipalDetailsList = response.data;
      console.log("Raw principal details data:", principalResults);

      if (!principalResults || principalResults.length === 0) {
        throw new Error("No principal details found");
      }

      // Enhanced Arabic-friendly filename sanitization
      const sanitizeFilename = (
        name: string | null | undefined,
        fallback: string = "Unknown"
      ): string => {
        if (!name || typeof name !== "string") {
          return fallback;
        }

        // Keep Arabic characters, English letters, numbers, spaces, and basic punctuation
        // Only remove filesystem-invalid characters
        const cleaned = name
          .replace(/[<>:"/\\|?*]/g, "") // Remove only filesystem-invalid characters
          .replace(/\s+/g, "_") // Replace multiple spaces with single underscore
          .replace(/_{2,}/g, "_") // Replace multiple underscores with single
          .trim();

        // If the result is empty or only underscores, use fallback
        if (!cleaned || /^_+$/.test(cleaned) || cleaned.length < 1) {
          return `${fallback}_${Date.now()}`;
        }

        return cleaned;
      };

      // Create safe filename with uniqueness guarantee
      const createSafeFilename = (
        principalName: string,
        schoolId: number,
        index: number
      ): string => {
        let safeName = sanitizeFilename(principalName, `Principal_${schoolId}`);

        // If sanitization results in very short or problematic name, use structured fallback
        if (safeName.length < 2 || /^_+$/.test(safeName)) {
          safeName = `Principal_${schoolId}_${index + 1}`;
        }

        return `${safeName}_Principal_School_${schoolId}.pdf`;
      };

      // Debug logging for Arabic names
      console.log("=== PRINCIPAL NAMES DEBUG ===");
      principalResults.forEach((principal: PrincipalDetails, index: number) => {
        console.log(`${index + 1}. Original: "${principal.p_Name}"`);
        console.log(`   School: "${principal.schoolName}"`);
        console.log(`   SchoolId: ${principal.schoolId}`);
        console.log(`   Sanitized: "${sanitizeFilename(principal.p_Name)}"`);
        console.log(
          `   Final filename: "${createSafeFilename(
            principal.p_Name,
            principal.schoolId,
            index
          )}"`
        );
        console.log("---");
      });
      console.log("=== END DEBUG ===");

      toast.update(loadingToast, {
        render: `Generating ${principalResults.length} principal certificates...`,
        type: "info",
        isLoading: true,
      });

      // Step 2: Initialize ZIP file
      const zip = new JSZip();
      const folder = zip.folder("principal_certificates");

      // Keep track of successfully added certificates
      let successfullyAdded = 0;
      const failedPrincipals: string[] = [];
      const usedFilenames = new Set<string>();
      const processedPrincipals: string[] = [];

      // Step 3: Process in smaller chunks to manage memory
      const chunkSize = 3; // Reduced for better memory management with Arabic text
      let processedCount = 0;

      // Ensure fonts are loaded (assuming similar font requirements as student certificates)
      await ensureFontsLoaded();
      await registerFonts();

      for (let i = 0; i < principalResults.length; i += chunkSize) {
        const chunk = principalResults.slice(i, i + chunkSize);

        try {
          console.log(
            `Processing chunk ${
              Math.floor(i / chunkSize) + 1
            } with principals:`,
            chunk.map((p: PrincipalDetails) => ({
              name: p.p_Name,
              schoolId: p.schoolId,
            }))
          );

          const pdfBlobs: PrincipalPdfBlob[] =
            await generatePrincipalCertificates(chunk);

          console.log(
            `Generated ${pdfBlobs.length} PDFs for chunk ${
              Math.floor(i / chunkSize) + 1
            }`
          );

          // Add each PDF to the ZIP with enhanced error handling
          for (let j = 0; j < pdfBlobs.length; j++) {
            const pdf: PrincipalPdfBlob = pdfBlobs[j];
            const originalIndex = i + j;
            const originalPrincipal: PrincipalDetails | undefined =
              principalResults[originalIndex];

            console.log(`Processing PDF ${j + 1}:`, {
              principalName: pdf.principalName,
              schoolId: pdf.schoolId,
              blobExists: !!pdf.blob,
              blobSize: pdf.blob?.size || 0,
              hasPrincipalName: !!pdf.principalName,
            });

            if (pdf.blob && pdf.principalName && pdf.blob.size > 0) {
              // Create unique filename
              let fileName = createSafeFilename(
                pdf.principalName,
                pdf.schoolId,
                originalIndex
              );
              let counter = 1;

              // Ensure filename uniqueness
              while (usedFilenames.has(fileName)) {
                const nameWithoutExt = fileName.replace(".pdf", "");
                fileName = `${nameWithoutExt}_${counter}.pdf`;
                counter++;
              }

              usedFilenames.add(fileName);
              folder?.file(fileName, pdf.blob);
              successfullyAdded++;
              processedPrincipals.push(pdf.principalName);

              console.log(
                `✓ Added to ZIP: ${fileName} (${pdf.blob.size} bytes)`
              );
              console.log(`   Original name: "${pdf.principalName}"`);
              console.log(
                `   School: "${originalPrincipal?.schoolName || "Unknown"}"`
              );
            } else {
              const failureReason: string[] = [];
              if (!pdf.blob) failureReason.push("no blob");
              if (!pdf.principalName) failureReason.push("no principal name");
              if (pdf.blob && pdf.blob.size <= 0)
                failureReason.push("empty blob");

              console.warn(`✗ Skipping invalid PDF:`, {
                originalName: pdf.principalName,
                schoolId: pdf.schoolId,
                blobSize: pdf.blob?.size || 0,
                hasBlob: !!pdf.blob,
                hasName: !!pdf.principalName,
                failureReasons: failureReason,
              });

              const failedName =
                pdf.principalName ||
                originalPrincipal?.p_Name ||
                `Unknown-${pdf.schoolId}`;
              failedPrincipals.push(failedName);
            }
          }

          // Clear references to help garbage collection
          pdfBlobs.length = 0;
        } catch (chunkError) {
          console.error(
            `Error processing chunk ${Math.floor(i / chunkSize) + 1}:`,
            chunkError
          );

          // Add all principals from failed chunk to failed list
          chunk.forEach((principal: PrincipalDetails) => {
            if (principal.p_Name) {
              failedPrincipals.push(principal.p_Name);
              console.error(
                `Failed to process principal: "${principal.p_Name}" from school: "${principal.schoolName}"`
              );
            }
          });
        }

        processedCount += chunk.length;
        toast.update(loadingToast, {
          render: `Processed ${processedCount} of ${principalResults.length} principal certificates... (${successfullyAdded} successful)`,
          type: "info",
          isLoading: true,
        });

        // Delay between chunks to prevent memory issues
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Step 4: Validation and summary
      console.log("=== PROCESSING SUMMARY ===");
      console.log("Expected principals:", principalResults.length);
      console.log("Successfully processed:", successfullyAdded);
      console.log("Failed principals:", failedPrincipals.length);
      console.log(
        "Total accounted for:",
        successfullyAdded + failedPrincipals.length
      );

      if (failedPrincipals.length > 0) {
        console.log("Failed principal names:");
        failedPrincipals.forEach((name: string, index: number) => {
          console.log(`  ${index + 1}. "${name}"`);
        });
      }

      console.log("Successfully processed principal names:");
      processedPrincipals.forEach((name: string, index: number) => {
        console.log(`  ${index + 1}. "${name}"`);
      });
      console.log("=== END SUMMARY ===");

      if (successfullyAdded === 0) {
        throw new Error(
          "No principal certificates were successfully generated"
        );
      }

      toast.update(loadingToast, {
        render: "Finalizing ZIP file...",
        type: "info",
        isLoading: true,
      });

      // Step 5: Generate and save the ZIP file
      const zipContent = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `Principal_Certificates_Contest_${params.contestId}_${timestamp}_Success_${successfullyAdded}_Total_${principalResults.length}.zip`;
      saveAs(zipContent, fileName);

      // Step 6: Show detailed completion message
      let message = `Successfully generated ${successfullyAdded} of ${principalResults.length} principal certificates!`;
      if (failedPrincipals.length > 0) {
        message += ` Failed: ${failedPrincipals.length} (check console for details)`;
        console.log("Failed principals list:", failedPrincipals);
      }

      toast.update(loadingToast, {
        render: message,
        type: failedPrincipals.length > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: 10000,
      });
    } catch (error) {
      console.error("Principal certificate generation failed:", error);

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      toast.error(
        `Failed to generate principal certificates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          autoClose: 8000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleCoordinatorDetails = async () => {
    setIsLoading(true);
    let loadingToast: Id | undefined;

    try {
      loadingToast = toast.loading("Preparing coordinator certificates...");

      // Step 1: Fetch coordinator details
      const response = await axios.get<CoordinatorDetailsList>(
        `/api/users/getcoordinatordetails/${params.contestId}`
      );

      const coordinatorResults: CoordinatorDetailsList = response.data;
      console.log("Raw coordinator details data:", coordinatorResults);

      if (!coordinatorResults || coordinatorResults.length === 0) {
        throw new Error("No coordinator details found");
      }

      // Enhanced Arabic-friendly filename sanitization
      const sanitizeFilename = (
        name: string | null | undefined,
        fallback: string = "Unknown"
      ): string => {
        if (!name || typeof name !== "string") {
          return fallback;
        }

        // Keep Arabic characters, English letters, numbers, spaces, and basic punctuation
        // Only remove filesystem-invalid characters
        const cleaned = name
          .replace(/[<>:"/\\|?*]/g, "") // Remove only filesystem-invalid characters
          .replace(/\s+/g, "_") // Replace multiple spaces with single underscore
          .replace(/_{2,}/g, "_") // Replace multiple underscores with single
          .trim();

        // If the result is empty or only underscores, use fallback
        if (!cleaned || /^_+$/.test(cleaned) || cleaned.length < 1) {
          return `${fallback}_${Date.now()}`;
        }

        return cleaned;
      };

      // Create safe filename with uniqueness guarantee
      const createSafeFilename = (
        coordinatorName: string,
        schoolId: number,
        index: number
      ): string => {
        let safeName = sanitizeFilename(
          coordinatorName,
          `Coordinator_${schoolId}`
        );

        // If sanitization results in very short or problematic name, use structured fallback
        if (safeName.length < 2 || /^_+$/.test(safeName)) {
          safeName = `Coordinator_${schoolId}_${index + 1}`;
        }

        return `${safeName}_School_${schoolId}.pdf`;
      };

      // Debug logging for Arabic names
      console.log("=== COORDINATOR NAMES DEBUG ===");
      coordinatorResults.forEach(
        (coordinator: CoordinatorDetails, index: number) => {
          console.log(`${index + 1}. Original: "${coordinator.c_Name}"`);
          console.log(`   School: "${coordinator.schoolName}"`);
          console.log(`   SchoolId: ${coordinator.schoolId}`);
          console.log(
            `   Sanitized: "${sanitizeFilename(coordinator.c_Name)}"`
          );
          console.log(
            `   Final filename: "${createSafeFilename(
              coordinator.c_Name,
              coordinator.schoolId,
              index
            )}"`
          );
          console.log("---");
        }
      );
      console.log("=== END DEBUG ===");

      toast.update(loadingToast, {
        render: `Generating ${coordinatorResults.length} coordinator certificates...`,
        type: "info",
        isLoading: true,
      });

      // Step 2: Initialize ZIP file
      const zip = new JSZip();
      const folder = zip.folder("coordinator_certificates");

      let successfullyAdded = 0;
      const failedCoordinators: string[] = [];
      const usedFilenames = new Set<string>();
      const processedCoordinators: string[] = [];
      const chunkSize = 3;
      let processedCount = 0;
      await ensureFontsLoaded();
      await registerFonts();

      for (let i = 0; i < coordinatorResults.length; i += chunkSize) {
        const chunk = coordinatorResults.slice(i, i + chunkSize);

        try {
          console.log(
            `Processing chunk ${
              Math.floor(i / chunkSize) + 1
            } with coordinators:`,
            chunk.map((c: CoordinatorDetails) => ({
              name: c.c_Name,
              schoolId: c.schoolId,
            }))
          );

          const pdfBlobs: CoordinatorPdfBlob[] =
            await generateCoordinatorCertificates(chunk);

          console.log(
            `Generated ${pdfBlobs.length} PDFs for chunk ${
              Math.floor(i / chunkSize) + 1
            }`
          );

          // Add each PDF to the ZIP with enhanced error handling
          for (let j = 0; j < pdfBlobs.length; j++) {
            const pdf: CoordinatorPdfBlob = pdfBlobs[j];
            const originalIndex = i + j;
            const originalCoordinator: CoordinatorDetails | undefined =
              coordinatorResults[originalIndex];

            console.log(`Processing PDF ${j + 1}:`, {
              coordinatorName: pdf.coordinatorName,
              schoolId: pdf.schoolId,
              blobExists: !!pdf.blob,
              blobSize: pdf.blob?.size || 0,
              hasCoordinatorName: !!pdf.coordinatorName,
            });

            if (pdf.blob && pdf.coordinatorName && pdf.blob.size > 0) {
              // Create unique filename
              let fileName = createSafeFilename(
                pdf.coordinatorName,
                pdf.schoolId,
                originalIndex
              );
              let counter = 1;

              // Ensure filename uniqueness
              while (usedFilenames.has(fileName)) {
                const nameWithoutExt = fileName.replace(".pdf", "");
                fileName = `${nameWithoutExt}_${counter}.pdf`;
                counter++;
              }

              usedFilenames.add(fileName);
              folder?.file(fileName, pdf.blob);
              successfullyAdded++;
              processedCoordinators.push(pdf.coordinatorName);

              console.log(
                `✓ Added to ZIP: ${fileName} (${pdf.blob.size} bytes)`
              );
              console.log(`   Original name: "${pdf.coordinatorName}"`);
              console.log(
                `   School: "${originalCoordinator?.schoolName || "Unknown"}"`
              );
            } else {
              const failureReason: string[] = [];
              if (!pdf.blob) failureReason.push("no blob");
              if (!pdf.coordinatorName)
                failureReason.push("no coordinator name");
              if (pdf.blob && pdf.blob.size <= 0)
                failureReason.push("empty blob");

              console.warn(`✗ Skipping invalid PDF:`, {
                originalName: pdf.coordinatorName,
                schoolId: pdf.schoolId,
                blobSize: pdf.blob?.size || 0,
                hasBlob: !!pdf.blob,
                hasName: !!pdf.coordinatorName,
                failureReasons: failureReason,
              });

              const failedName =
                pdf.coordinatorName ||
                originalCoordinator?.c_Name ||
                `Unknown-${pdf.schoolId}`;
              failedCoordinators.push(failedName);
            }
          }

          // Clear references to help garbage collection
          pdfBlobs.length = 0;
        } catch (chunkError) {
          console.error(
            `Error processing chunk ${Math.floor(i / chunkSize) + 1}:`,
            chunkError
          );
          chunk.forEach((coordinator: CoordinatorDetails) => {
            if (coordinator.c_Name) {
              failedCoordinators.push(coordinator.c_Name);
              console.error(
                `Failed to process coordinator: "${coordinator.c_Name}" from school: "${coordinator.schoolName}"`
              );
            }
          });
        }

        processedCount += chunk.length;
        toast.update(loadingToast, {
          render: `Processed ${processedCount} of ${coordinatorResults.length} coordinator certificates... (${successfullyAdded} successful)`,
          type: "info",
          isLoading: true,
        });

        // Delay between chunks to prevent memory issues
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Step 4: Validation and summary
      console.log("=== PROCESSING SUMMARY ===");
      console.log("Expected coordinators:", coordinatorResults.length);
      console.log("Successfully processed:", successfullyAdded);
      console.log("Failed coordinators:", failedCoordinators.length);
      console.log(
        "Total accounted for:",
        successfullyAdded + failedCoordinators.length
      );

      if (failedCoordinators.length > 0) {
        console.log("Failed coordinator names:");
        failedCoordinators.forEach((name: string, index: number) => {
          console.log(`  ${index + 1}. "${name}"`);
        });
      }

      console.log("Successfully processed coordinator names:");
      processedCoordinators.forEach((name: string, index: number) => {
        console.log(`  ${index + 1}. "${name}"`);
      });
      console.log("=== END SUMMARY ===");

      if (successfullyAdded === 0) {
        throw new Error(
          "No coordinator certificates were successfully generated"
        );
      }

      toast.update(loadingToast, {
        render: "Finalizing ZIP file...",
        type: "info",
        isLoading: true,
      });

      // Step 5: Generate and save the ZIP file
      const zipContent = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `Coordinator_Certificates_Contest_${params.contestId}_${timestamp}_Success_${successfullyAdded}_Total_${coordinatorResults.length}.zip`;
      saveAs(zipContent, fileName);

      // Step 6: Show detailed completion message
      let message = `Successfully generated ${successfullyAdded} of ${coordinatorResults.length} coordinator certificates!`;
      if (failedCoordinators.length > 0) {
        message += ` Failed: ${failedCoordinators.length} (check console for details)`;
        console.log("Failed coordinators list:", failedCoordinators);
      }

      toast.update(loadingToast, {
        render: message,
        type: failedCoordinators.length > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: 10000,
      });
    } catch (error) {
      console.error("Coordinator certificate generation failed:", error);

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      toast.error(
        `Failed to generate coordinator certificates: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          autoClose: 8000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        Schools Results
      </h1>
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        {contestName}
      </h1>
      <div className="hidden md:block">
        <div className="py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleBack}>
            Back
          </Button>
          <Button
            className="bg-blue-800 text-white font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleCoordinatorDetails}>
            Download Coordinator Certificates
          </Button>
          <Button
            className="bg-blue-800 text-white font-medium text-[15px]  tracking-wide"
            variant="secondary"
            size="lg"
            disabled={isLoading}
            onClick={handlePrincipalDetails}>
            Download Principal Certificates
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={downloadQuestionStats}>
            Download Question Stats
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleGold}>
            Download Gold Winners
          </Button>

          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleSilver}>
            Download Silver Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleBronze}>
            Download Bronze Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleThreeStar}>
            Download Three Star Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleTwoStar}>
            Download Two Star Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleOneStar}>
            Download One Star Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleParticipation}>
            Download Participation
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={loadData}
            onClick={handleExcel}>
            Download Excel Sheet
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={loadData}
            onClick={handleCount}>
            Download Total Count
          </Button>
        </div>
        <div className="py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleGoldExcel}>
            Gold Winners Excel
          </Button>

          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleSilverExcel}>
            Silver Winners Excel
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleBronzeExcel}>
            Bronze Winners Excel
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleThreeStarExcel}>
            Three Star Excel
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleTwoStarExcel}>
            Two Star Excel
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleOneStarExcel}>
            One Star Winners Excel
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleParticipationExcel}>
            Participation Excel
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleExcelForKainat}>
            Only For Kainat&apos; Use
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleExcelForKainatPart2}>
            Only For Kainat&apos; Use part 2
          </Button>
        </div>
      </div>
      <div className="block md:hidden">
        <div className="py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleBack}>
            Back
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={loadData}
            onClick={handleCount}>
            Download Total Count
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleGold}>
            Download Gold Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleSilver}>
            Download Silver Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleBronze}>
            Download Bronze Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleThreeStar}>
            Download Three Star Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleTwoStar}>
            Download Two Star Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleOneStar}>
            Download One Star Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleParticipation}>
            Download Participation Winners
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={loadData}
            onClick={handleExcel}>
            Download Excel Sheet
          </Button>
        </div>
        <div className="py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleGoldExcel}>
            Gold Winners Excel
          </Button>
          <Button
            className="font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleSilverExcel}>
            Silver Winners Excel
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleBronze}>
            Bronze Winners Excel
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleThreeStar}>
            Three Star Winner Excel
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleTwoStar}>
            Two Star Winner Excel
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleOneStar}>
            One Star Winner Excel
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleParticipation}>
            Participation Winners Excel
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={schoolData} />
    </div>
  );
};

export default Results;
