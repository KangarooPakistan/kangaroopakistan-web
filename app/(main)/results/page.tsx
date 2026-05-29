"use client";
import React, { useState } from "react";
import axios from "axios";
import IndividualReport from "@/app/(routes)/admin/results/[contestId]/IndividualReport/IndividualReport";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreEntry {
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
  parsedRollNumber?: {
    year: string;
    district: string;
    school: string;
    class: string;
    serialNum: string;
    suffix: string;
  };
  rankings?: {
    school: { rank: number; totalParticipants: number };
    district: { rank: number; totalParticipants: number };
    overall: { rank: number; totalParticipants: number };
  } | null;
}

interface SingleStudentResult {
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
  scores: ScoreEntry[];
}

interface MultiStudentResponse {
  searchType: "studentName" | "school";
  // school search — grouped
  query?: string;
  totalSchools?: number;
  schools?: SchoolGroup[];
  // student name search — flat list
  totalStudents?: number;
  students?: SingleStudentResult[];
}

interface SchoolGroup {
  schoolId: number;
  schoolName: string;
  city?: string;
  schoolAddress?: string;
  // students not included in initial response — loaded on demand
}

type ApiResponse = SingleStudentResult | MultiStudentResponse;

function isMultiResult(data: ApiResponse): data is MultiStudentResponse {
  return "searchType" in data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTransformedData(studentData: SingleStudentResult) {
  return studentData.scores.map((score) => ({
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
    constestNo: score.contest.contestNo ? parseInt(score.contest.contestNo) : 0,
    year: score.parsedRollNumber
      ? parseInt(score.parsedRollNumber.year)
      : new Date().getFullYear(),
    contestName: score.contest.name || "",
    suffix: score.parsedRollNumber?.suffix ?? "",
    rankings: score.rankings || {
      school: { rank: 0, totalParticipants: 0 },
      district: { rank: 0, totalParticipants: 0 },
      overall: { rank: 0, totalParticipants: 0 },
    },
  }));
}

// ─── RankBadge ────────────────────────────────────────────────────────────────

function RankBadge({ label, rank, total }: { label: string; rank: number; total: number }) {
  return (
    <div className="flex flex-col items-center bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 min-w-[80px]">
      <span className="text-xs text-indigo-500 font-medium mb-0.5">{label}</span>
      <span className="text-lg font-bold text-indigo-700">{rank}</span>
      <span className="text-xs text-gray-400">of {total}</span>
    </div>
  );
}

// ─── ScoreDetail ──────────────────────────────────────────────────────────────

function ScoreDetail({ score }: { score: ScoreEntry }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
      {/* Contest name + date */}
      <div className="text-sm">
        <span className="font-medium text-gray-900">{score.contest.name}</span>
        {score.contest.contestDate && (
          <span className="ml-2 text-gray-400">{score.contest.contestDate}</span>
        )}
      </div>

      {score.rankings ? (
        <>
          {/* Score + percentage */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Score: </span>
              <span className="text-gray-900">{score.score} / {score.totalMarks}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Percentage: </span>
              <span className="text-gray-900">{score.percentage?.toFixed(1)}%</span>
            </div>
          </div>

          {/* Rankings */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Rankings</p>
            <div className="flex gap-2">
              <RankBadge
                label="School"
                rank={score.rankings.school.rank}
                total={score.rankings.school.totalParticipants}
              />
              <RankBadge
                label="District"
                rank={score.rankings.district.rank}
                total={score.rankings.district.totalParticipants}
              />
              <RankBadge
                label="Overall"
                rank={score.rankings.overall.rank}
                total={score.rankings.overall.totalParticipants}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 italic">Rankings not available for this result</p>
      )}
    </div>
  );
}

// ─── SchoolSection ────────────────────────────────────────────────────────────

function SchoolSection({ school }: { school: SchoolGroup }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<SingleStudentResult[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (students !== null) return; // already loaded

    setLoading(true);
    setFetchError(null);
    try {
      const res = await axios.get(`/api/results/getbyschool/${school.schoolId}`);
      setStudents(res.data.students ?? []);
    } catch (err: any) {
      setFetchError(err?.response?.data?.message || "Failed to load students");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* School header */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex justify-between items-center border-b border-purple-700 bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer text-left"
      >
        <div className="min-w-0">
          <p className="text-base font-semibold text-white truncate">{school.schoolName}</p>
          <p className="text-sm text-purple-200">
            {school.city ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {!open && (
            <span className="hidden sm:inline text-xs text-white font-medium bg-purple-500 px-2 py-0.5 rounded-full">
              View students
            </span>
          )}
          {loading ? (
            <svg className="animate-spin w-4 h-4 text-purple-200" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg
              className={`w-4 h-4 text-purple-200 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {/* Students — loaded on demand */}
      {open && (
        <div className="p-3 space-y-2">
          {fetchError && <p className="text-sm text-red-500 px-2">{fetchError}</p>}
          {loading && (
            <div className="py-6 flex flex-col items-center gap-3">
              {/* Skeleton cards */}
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-full rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="px-4 py-3 bg-slate-50 flex items-center gap-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4 ml-auto" />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-1">Loading students…</p>
            </div>
          )}
          {students && students.map((student, i) => (
            <StudentCard
              key={student.student.rollNumber || i}
              studentData={student}
              defaultOpen={students.length === 1}
              showSchool={false}
            />
          ))}
          {students && students.length === 0 && (
            <p className="text-sm text-gray-400 px-2">No results found for this school.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── StudentCard ──────────────────────────────────────────────────────────────

function StudentCard({
  studentData,
  defaultOpen = false,
  showSchool = true,
}: {
  studentData: SingleStudentResult;
  defaultOpen?: boolean;
  showSchool?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const hasValidRankings = studentData.scores.some(
    (s) => s.rankings !== null && s.rankings !== undefined
  );

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadLoading(true);
    try {
      const transformedData = buildTransformedData(studentData);
      const doc = <IndividualReport data={transformedData} />;
      const blob = await pdf(doc).toBlob();
      saveAs(blob, `Individual_Report_${studentData.student.rollNumber}.pdf`);
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-3">
      {/* ── Header — identical to single result header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex justify-between items-center border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">
            {studentData.student.name}
          </p>
          <p className="text-xs text-gray-400 font-mono truncate">
            {studentData.student.rollNumber}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {!open && (
            <span className="hidden sm:inline text-xs text-white font-medium bg-indigo-500 px-2 py-0.5 rounded-full">
              View details
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* ── Body — identical to single result body + download button ── */}
      {open && (
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-1">
            <div>
              <span className="text-gray-600 font-medium">Class: </span>
              <span className="text-gray-900">{studentData.student.class}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Level: </span>
              <span className="text-gray-900">{studentData.student.level}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Father: </span>
              <span className="text-gray-900">{studentData.student.fatherName}</span>
            </div>
            {showSchool && (
              <div>
                <span className="text-gray-600 font-medium">School: </span>
                <span className="text-gray-900">
                  {studentData.schoolName}
                  {studentData.city ? `, ${studentData.city}` : ""}
                </span>
              </div>
            )}
          </div>

          {studentData.scores.map((score, i) => (
            <ScoreDetail key={i} score={score} />
          ))}

          {/* Download button */}
          <div className="mt-4 flex justify-end">
            {hasValidRankings ? (
              <button
                onClick={handleDownload}
                disabled={downloadLoading}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-colors"
              >
                {downloadLoading ? (
                  <>
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">No report available</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const StudentResultsPage = () => {
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

  const handleFetchResults = async () => {
    if (!query.trim()) {
      setError("Please enter a roll number, student name, or school name");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Only encode if it's not a roll number — roll numbers contain dashes
      // that must stay unencoded for routing and detection to work correctly
      const trimmed = query.trim();
      const encoded = trimmed.includes("-") ? trimmed : encodeURIComponent(trimmed);
      const response = await axios.get(`/api/results/getbyrollnumber/${encoded}`);
      setResult(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleFetchResults();
  };

  const handleSingleDownload = async () => {
    if (!result || isMultiResult(result)) return;
    setDownloadLoading(true);
    try {
      const transformedData = buildTransformedData(result);
      const doc = <IndividualReport data={transformedData} />;
      const blob = await pdf(doc).toBlob();
      saveAs(blob, `Individual_Report_${result.student.rollNumber}.pdf`);
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to download individual report");
    } finally {
      setDownloadLoading(false);
    }
  };

  const singleResult =
    result && !isMultiResult(result) ? (result as SingleStudentResult) : null;
  const multiResult =
    result && isMultiResult(result) ? (result as MultiStudentResponse) : null;

  const hasValidRankings = singleResult?.scores.some(
    (s) => s.rankings !== null && s.rankings !== undefined
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Search card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Find Your Results
          </h1>
          <p className="text-sm text-gray-500 mb-5">
            Search by roll number, student name, or school name
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              {/* Search icon */}
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Roll number, student name, or school name…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            <button
              onClick={handleFetchResults}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm py-2.5 px-5 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching…
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Search type hints */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "Roll number", example: "24-231-00004-08-001-S" },
              { label: "Student name", example: "Ali Ahmed" },
              { label: "School name", example: "Beacon House" },
            ].map(({ label, example }) => (
              <button
                key={label}
                onClick={() => setQuery(example)}
                className="text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-full px-2.5 py-0.5 transition-colors"
                title={`Try: ${example}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl mb-4">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* ── Single student result ── */}
        {singleResult && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Top banner — compact */}
            <div className="px-4 py-3 flex justify-between items-center border-b border-slate-100 bg-slate-50">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 truncate">
                  {singleResult.student.name}
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  {singleResult.student.rollNumber}
                </p>
              </div>
              {hasValidRankings ? (
                <button
                  onClick={handleSingleDownload}
                  disabled={downloadLoading}
                  className="flex-shrink-0 ml-3 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-colors"
                >
                  {downloadLoading ? (
                    <>
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              ) : (
                <span className="flex-shrink-0 ml-3 text-xs text-gray-400 italic">No report</span>
              )}
            </div>

            {/* Details */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-4">
                <div>
                  <span className="text-gray-600 font-medium">Class: </span>
                  <span className="text-gray-900">{singleResult.student.class}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Level: </span>
                  <span className="text-gray-900">{singleResult.student.level}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Father: </span>
                  <span className="text-gray-900">{singleResult.student.fatherName}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">School: </span>
                  <span className="text-gray-900">{singleResult.schoolName}</span>
                </div>
              </div>

              {singleResult.scores.map((score, i) => (
                <ScoreDetail key={i} score={score} />
              ))}
            </div>
          </div>
        )}

        {/* ── Multi-student result ── */}
        {multiResult && (
          <div>
            {/* Section header */}
            <div className="flex justify-between items-end mb-3">
              <div>
                {multiResult.searchType === "school" ? (
                  <>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">School search</p>
                    <h2 className="text-xl font-bold text-gray-900">
                      &ldquo;{query}&rdquo;
                    </h2>
                    {multiResult.totalSchools !== undefined && (
                      <p className="text-sm text-gray-500">
                        {multiResult.totalSchools} school{multiResult.totalSchools !== 1 ? "s" : ""} found
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Search results</p>
                    <h2 className="text-xl font-bold text-gray-900">
                      &ldquo;{query}&rdquo;
                    </h2>
                  </>
                )}
              </div>
              {multiResult.searchType === "studentName" && (
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                  {multiResult.totalStudents} student{multiResult.totalStudents !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Hint */}
            {multiResult.searchType === "studentName" && (multiResult.totalStudents ?? 0) > 1 && (
              <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                Click a student card to view their result and download the report
              </p>
            )}

            {/* School-grouped results */}
            {multiResult.searchType === "school" && multiResult.schools && (
              <div className="space-y-4">
                {multiResult.schools.map((school) => (
                  <SchoolSection key={school.schoolId} school={school} />
                ))}
              </div>
            )}

            {/* Student name flat list */}
            {multiResult.searchType === "studentName" && multiResult.students && (
              multiResult.students.map((student, i) => (
                <StudentCard
                  key={student.student.rollNumber || i}
                  studentData={student}
                  defaultOpen={(multiResult.totalStudents ?? 0) === 1}
                  showSchool
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResultsPage;
