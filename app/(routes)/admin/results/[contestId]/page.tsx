"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import AwardsPdf from "./AwardsPdf/AwardsPdf";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  studentName: string;
};

export type Result = {
  AwardLevel: string;
  class: number;
  contest: Contest;
  district: string;
  id: string;
  percentage: number;
  rollNumber: string;
  schoolId: number;
  score: Score;
  scoreId?: string | undefined;
  studentDetails: StudentDetails;
};

const Results = () => {
  const [schoolData, setSchoolData] = useState([]);
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(
          `/api/results/fetchresults/${params.contestId}`
        );
        const resp = await axios.get(`/api/results/getschoolsdata`);
        setSchoolData(resp.data);
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
    const doc = <AwardsPdf data={data} winnerType={winnerType} />;

    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
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

  const handleGold = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/GOLD`
      );
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
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleSilver = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/SILVER`
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
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleBronze = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/BRONZE`
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
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleThreeStar = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/THREE_STAR`
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
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleTwoStar = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/TWO_STAR`
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
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleOneStar = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/ONE_STAR`
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
    } catch (error) {
      console.error("Error fetching school result:", error);
    }
  };
  const handleParticipation = async () => {
    try {
      const schoolResultGoldResp = await axios.get(
        `/api/results/getschoolsdata/ONE_STAR`
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
            onClick={handleBack}>
            Back
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleGold}>
            Download Gold Winners
          </Button>

          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleSilver}>
            Download Silver Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleBronze}>
            Download Bronze Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleThreeStar}>
            Download Three Star Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleTwoStar}>
            Download Two Star Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleOneStar}>
            Download One Star Winners
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleParticipation}>
            Download Participation
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
            onClick={handleGold}>
            Download Gold Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleSilver}>
            Download Silver Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleBronze}>
            Download Bronze Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleThreeStar}>
            Download Three Star Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleTwoStar}>
            Download Two Star Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleOneStar}>
            Download One Star Winner
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleParticipation}>
            Download Participation Winners
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={schoolData} />
    </div>
  );
};

export default Results;
