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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

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
};

const Results = () => {
  const [schoolData, setSchoolData] = useState([]);
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadData, setLoadData] = useState(true);
  const router = useRouter();
  const [result, setResult] = useState<Result[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(
          `/api/results/fetchresults/${params.contestId}`
        );
        const resp = await axios.get(`/api/results/getschoolsdata`);
        setSchoolData(resp.data);
        setResult(data.data);
        setLoadData(false);
        console.log("resp");
        console.log(resp);
        console.log(data);

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
        toast.error(" " + error.response.data.message, {
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
  }, []);

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
    );

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
      if (schoolData) {
        schoolData.awards[result.AwardLevel]++;
        // Increment total students count
        schoolTotalStudents.set(
          result.schoolId,
          (schoolTotalStudents.get(result.schoolId) || 0) + 1
        );
      }
    });

    // Prepare headers and rows with school ID and total students
    const headers = [
      "School ID",
      "School Name",
      "Total Students",
      ...uniqueAwards,
    ];

    const rows = Array.from(schoolAwardCounts.entries()).map(
      ([schoolId, school]) => {
        return [
          schoolId,
          school.schoolName,
          schoolTotalStudents.get(schoolId) || 0,
          ...uniqueAwards.map((award) => school.awards[award]),
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
      console.log(schoolData);
      console.log(result);
      downloadExcel(schoolData, result);
    } catch (error) {}
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
        `/api/results/${params.contestId}/getschoolsdata/GOLD`
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
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="container mx-auto py-10">
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
