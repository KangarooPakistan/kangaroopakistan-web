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
    missingQuestionsCount: number[];

    creditScore: number;
    cRow1: number;
    cRow2: number;
    cRow3: number;
    missing: number;
    cTotal: number;
    wrong: number;
    cRowTotal: number;
    totalMarks: number;
    // Suffix and other roll-number components come from parsedRollNumber
    suffix?: string;
    parsedRollNumber?: {
      year: string;
      district: string;
      school: string;
      class: string;
      serialNum: string;
      suffix: string;
    };
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
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
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
        `/api/results/getbyrollnumber/${rollNumber}`,
      );
      setStudentData(response.data);
    } catch (err) {
      console.log(err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "An error occurred");

      // setError(err ? err.response.data.message : "An error occurred");
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
        schoolId: studentData.schoolId || 0,
        city: studentData.city || "",
        schoolAddress: studentData.schoolAddress || "",
        rollNumber: studentData.student.rollNumber,
        studentName: studentData.student.name,
        fatherName: studentData.student.fatherName,
        class: studentData.student.class,
        level: studentData.student.level,
        totalMarks: score.totalMarks || 0,
        score: score.score || 0,
        missingQuestionsCount: score.missingQuestionsCount,

        creditScore: score.creditScore,
        cRow1: score.cRow1,
        cRow2: score.cRow2,
        cRow3: score.cRow3,
        wrong: score.wrong,
        cTotal: score.cTotal,
        missing: score.missing,
        percentage: score.percentage || 0,
        constestNo: score.contest.contestNo
          ? parseInt(score.contest.contestNo)
          : 0,
        // Prefer the parsed roll number year if available, otherwise fall back to current year
        year: score.parsedRollNumber
          ? parseInt(score.parsedRollNumber.year)
          : new Date().getFullYear(),
        contestName: score.contest.name || "",
        // Suffix is derived from the parsed roll number returned by the API
        suffix: score.parsedRollNumber?.suffix ?? "",
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

  // Check if any score has valid rankings
  const hasValidRankings = studentData?.scores.some(
    (score) => score.rankings !== null && score.rankings !== undefined,
  );

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
            {hasValidRankings ? (
              <button
                onClick={handleIndividualReportDownload}
                disabled={downloadLoading}
                className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 focus:outline-none">
                {downloadLoading ? "Downloading..." : "Download Report"}
              </button>
            ) : (
              <div className="text-sm text-red-600 font-medium">
                No individual report found
              </div>
            )}
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

              {/* Only show score and percentage if rankings are available */}
              {score.rankings && (
                <>
                  <div>
                    <strong>Score:</strong> {score.score} / {score.totalMarks}
                  </div>
                  <div>
                    <strong>Percentage:</strong> {score.percentage?.toFixed(2)}%
                  </div>
                </>
              )}

              {/* Show validation error if present */}
              {/* {score.validationError && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-400 text-yellow-700 rounded text-sm">
                  <strong>Note:</strong> {score.validationError}
                </div>
              )} */}

              {/* Only show rankings if they exist and are not null */}
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

              {/* Show message if rankings are missing */}
              {!score.rankings && (
                <div className="mt-2 p-2 bg-gray-100 border border-gray-300 text-gray-600 rounded text-sm">
                  Rankings not available for this result
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
