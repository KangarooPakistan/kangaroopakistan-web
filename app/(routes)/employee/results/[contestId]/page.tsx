"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import AwardsPdf from "../../../admin/results/[contestId]//AwardsPdf/AwardsPdf";
import { utils, writeFile } from "xlsx";

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

import { ca } from "date-fns/locale";
import QuestionStatsPdf from "../QuestionStats/QuestionStats";

export type Contest = {
  contestDate: string;
  name: string;
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
        toast.error(" " + (error.response?.data?.message || "Failed to load data"), {
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

    // Create workbook and worksheet
    const XLSX = require("xlsx");
    const workbook = XLSX.utils.book_new();

    // Convert to worksheet format
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    const colWidths = headers.map((header) => ({
      wch: Math.max(header.length, 15), // minimum width of 15 characters
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
