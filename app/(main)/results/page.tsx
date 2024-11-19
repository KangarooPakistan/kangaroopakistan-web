// results page

"use client";
import React, { useState } from "react";
import axios from "axios";
import IndividualReport from "@/app/(routes)/admin/results/[contestId]/IndividualReport/IndividualReport";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

interface StudentScore {
  schoolName: string;
  city: string;
  schoolAddress: string;
  schoolId: number;
  student: {
    rollNumber: string;
    name: string;
    fatherName: string;
    level: string;
    class: string;
  };
  scores: Array<{
    contest: {
      name: string;
      contestDate: string | null;
      contestNo: string | null;
    };
    percentage: number | null;
    score: number;
    creditScore: number;
    cRow1: number;
    cRow2: number;
    cRow3: number;
    missing: number;
    cTotal: number;
    wrong: number;
    cRowTotal: number;
    totalMarks: number;
    suffix: string;
    rankings?: {
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
  }>;
}

const StudentResultsPage = () => {
  const [rollNumber, setRollNumber] = useState<string>("");
  const [studentData, setStudentData] = useState<StudentScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

  const handleFetchResults = async () => {
    if (!rollNumber) {
      setError("Please enter a roll number");
      return;
    }

    setLoading(true);
    setError(null);
    setStudentData(null);

    try {
      console.log(rollNumber);

      const response = await axios.get(
        `/api/results/getbyrollnumber/${rollNumber}`
      );
      console.log(response.data);
      setStudentData(response.data);
    } catch (err) {
      console.log(err);
      setError(
        err instanceof Error ? err.response.data.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleIndividualReportDownload = async () => {
    if (!studentData) return;

    setDownloadLoading(true);
    try {
      // Transform studentData into the format expected by IndividualReport
      const transformedData = studentData.scores.map((score) => ({
        schoolName: studentData.schoolName,
        city: studentData.city || "",
        schoolAddress: studentData.schoolAddress || "",
        rollNumber: studentData.student.rollNumber,
        studentName: studentData.student.name,
        fatherName: studentData.student.fatherName, // Add if available in your data
        class: studentData.student.class,
        level: studentData.student.level, // Add if available in your data
        totalMarks: score.totalMarks || 0,
        score: score.score || 0,
        creditScore: score.creditScore, // Add if available
        cRow1: score.cRow1, // Add if available
        cRow2: score.cRow2, // Add if available
        cRow3: score.cRow3, // Add if available
        wrong: score.wrong, // Add if available
        cTotal: score.cTotal, // Add if available
        missing: score.missing, // Add if available
        percentage: score.percentage || 0,
        constestNo: score.contest.contestNo
          ? parseInt(score.contest.contestNo)
          : 0,
        year: new Date().getFullYear(), // You might want to extract this from the contest date
        contestName: score.contest.name || "",
        suffix: score.suffix, // Add if available
        rankings: score.rankings || {
          school: { rank: 0, totalParticipants: 0 },
          district: { rank: 0, totalParticipants: 0 },
          overall: { rank: 0, totalParticipants: 0 },
        },
      }));
      console.log("kainat");
      console.log(transformedData);

      // Generate PDF
      const doc = <IndividualReport data={transformedData} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      // Save the PDF
      saveAs(blob, `Individual_Report_${studentData.student.rollNumber}.pdf`);
    } catch (error) {
      console.error("Error generating individual report PDF:", error);
      setError("Failed to download individual report");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="max-w-lg  mx-auto p-6 m-10 bg-white shadow-md rounded-lg">
      <div className="mb-4">
        <label
          htmlFor="rollNumber"
          className="block text-sm font-medium text-gray-700">
          Enter Roll Number
        </label>
        <input
          type="text"
          id="rollNumber"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          placeholder="24-231-00004-08-001-S"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        onClick={handleFetchResults}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        {loading ? "Fetching Results..." : "Get Results"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {studentData && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Student Results</h2>
            <button
              onClick={handleIndividualReportDownload}
              disabled={downloadLoading}
              className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 focus:outline-none">
              {downloadLoading ? "Downloading..." : "Download Report"}
            </button>
          </div>

          <div className="mb-2">
            <strong>Name:</strong> {studentData.student.name}
          </div>
          <div className="mb-2">
            <strong>Roll Number:</strong> {studentData.student.rollNumber}
          </div>
          <div className="mb-2">
            <strong>Class:</strong> {studentData.student.class}
          </div>
          <div className="mb-2">
            <strong>School:</strong> {studentData.schoolName}
          </div>

          <h3 className="text-lg font-semibold mt-4 mb-2">Contest Results</h3>
          {studentData.scores.map((score, index) => (
            <div key={index} className="border-b pb-2 mb-2">
              <div>
                <strong>Contest:</strong> {score.contest.name}
              </div>
              <div>
                <strong>Date:</strong> {score.contest.contestDate || "N/A"}
              </div>
              <div>
                <strong>Score:</strong> {score.score} / {score.totalMarks}
              </div>
              <div>
                <strong>Percentage:</strong> {score.percentage?.toFixed(2)}%
              </div>
              {score.rankings && (
                <div className="mt-2">
                  <strong>Rankings:</strong>
                  <div>
                    School Rank: {score.rankings.school.rank} /{" "}
                    {score.rankings.school.totalParticipants}
                  </div>
                  <div>
                    District Rank: {score.rankings.district.rank} /{" "}
                    {score.rankings.district.totalParticipants}
                  </div>
                  <div>
                    Overall Rank: {score.rankings.overall.rank} /{" "}
                    {score.rankings.overall.totalParticipants}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResultsPage;
