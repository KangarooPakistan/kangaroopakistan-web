"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

import React, { useEffect, useRef, useState } from "react";
import { Registration, columns, PaymentProof } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AllLabels, { SchoolDetails } from "./AllLabels";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import AllLabelsShort from "./AllLabelsShort";
import Link from "next/link";
import { useModal } from "@/hooks/use-modal-store";
import { ReceiptsDownloadModal } from "./ReceiptsDownloadModal";

export const dynamic = "force-dynamic"; // Ensures this page is always rendered server-side

async function fetchData(id: string, signal: AbortSignal) {
  const res = await axios.get(`/api/users/fetchallregistrations/${id}`, {
    signal,
  });

  return res.data;
}

// Define a type for Registration, including the students array
type Register = {
  id: string;
  students: Student[];
};
interface UserData {
  email: string;
  password: string;
  role: string;
  contactNumber?: string | null; // Optional field
  schoolName?: string | null; // Optional field
  district?: string | null; // Optional field
  tehsil?: string | null; // Optional field
  fax?: string | null; // Optional field
  bankTitle?: string | null; // Optional field
  p_fName?: string | null; // Optional field
  p_mName?: string | null; // Optional field
  p_lName?: string | null; // Optional field
  p_contact?: string | null; // Optional field
  p_phone?: string | null; // Optional field
  p_email?: string | null; // Optional field
  c_fName?: string | null; // Optional field
  c_mName?: string | null; // Optional field
  c_lName?: string | null; // Optional field
  c_contact?: string | null; // Optional field
  c_phone?: string | null; // Optional field
  c_email?: string | null; // Optional field
  c_accountDetails?: string | null; // Optional field
  schoolAddress?: string | null; // Optional field
}
interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentLevel: string;  // Changed from 'level' to match columns.tsx
  studentClass: string;  // Changed from 'class' to match columns.tsx
  schoolName: string;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}
interface StudentData {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentLevel: string;
  studentClass: string;
}
interface profileData {
  p_Name: string;
  c_Name: string;
  p_contact: string;
  email: string;
  contactNumber: string;
  contestName: string;
  contestCh: string;
  contestNo: string;
}
type LevelCounts = Record<string, number>;

interface RegistrationWithPaymentProof extends Registration {
  paymentProof: PaymentProof[];
}

const FetchAllRegistrations = () => {
  const params = useParams();
  const { onOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [contestId, setContestId] = useState("");
  const [regData, setRegData] = useState<Registration[]>([]);
  const [excel, setExcel] = useState<
    Array<Record<string, string | number | undefined>>
  >([]); // Explicitly type excel for correct inference
  const [totalSchools, setTotalSchools] = useState<number>(0);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [preEculier, setPreEculier] = useState<number>(0);
  const [totalPaymentDone, setTotalPaymentDone] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);
  const [labelsData, setLabelsData] = useState<SchoolDetails[]>([]);
  const [contestCh, setContestCh] = useState("");
  const [registerationsData, setRegistrationsData] = useState([]);
  const [studentForExcel, setStudentForExcel] = useState([]);
  const [studentsForUtility, setStudentForUtility] = useState([]);
  const [contestName, setContestName] = useState("");
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const activeRequestController = useRef<AbortController | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importInsertedCount, setImportInsertedCount] = useState<number | null>(
    null
  );
  
  // Bulk download state for answer sheets one by one
  const [isBulkDownloadingAnswerSheets, setIsBulkDownloadingAnswerSheets] = useState(false);
  const [downloadProgressAnswerSheets, setDownloadProgressAnswerSheets] = useState({ current: 0, total: 0 });
  const [downloadedSchoolIds, setDownloadedSchoolIds] = useState<Set<string>>(new Set());

  const abortActiveRequest = () => {
    if (activeRequestController.current) {
      activeRequestController.current.abort();
      activeRequestController.current = null;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchAndSetData = async (id: string) => {
      try {
        const registrations = await fetchData(id, signal);
        const contestData = await axios.get(
          `/api/users/contests/${registrations[0].contestId}`,
          { signal } // Add signal to this request too
        );
        setContestId(registrations[0].contestId);
        // Only proceed with state updates if the request hasn't been cancelled
        if (!signal.aborted) {
          setContestName(contestData.data.name);
          setContestCh(contestData.data.contestCh);
          setTotalSchools(registrations.length);

          const totalPayments = registrations.reduce(
            (acc: number, curr: Registration) => {
              return (
                acc +
                (curr.paymentProof && curr.paymentProof.length > 0 ? 1 : 0)
              );
            },
            0
          );
          setTotalPaymentDone(totalPayments);

          const studentsArrays = registrations.map(
            (reg: Register) => reg.students
          );
          const flattenedStudents = studentsArrays.flat();
          setAllStudents(flattenedStudents);

          const levelCounts = flattenedStudents.reduce(
            (acc: LevelCounts, student: Student) => {
              const { studentLevel } = student;
              acc[studentLevel] = (acc[studentLevel] || 0) + 1;
              return acc;
            },
            {}
          );

          setPreEculier(levelCounts["preecolier"] || 0);
          setEculier(levelCounts["ecolier"] || 0);
          setBenjamin(levelCounts["benjamin"] || 0);
          setCadet(levelCounts["cadet"] || 0);
          setJunior(levelCounts["junior"] || 0);
          setStudent(levelCounts["student"] || 0);
          console.log("registrations");
          console.log(registrations);
          setRegistrationsData(registrations);
          const ExcelData = registrations.map((item: any) => ({
            "School id": item.user?.schoolId,
            "School Name": item.user?.schoolName,
            "Total Students": item.students.length,
            "School Address": item.user?.schoolAddress,
            "District Name": item.user?.city,
            "District Id": item.user?.district,
            "School Email": item.user?.email,
            "Contact Number": item.user?.contactNumber,
            "Principal Name": item.user?.p_Name,
            "Principal Cell #": item.user?.p_contact,
            "Principal Phone #": item.user?.p_phone,
            "Principal Email": item.user?.p_email,
            "Coordinator Name": item.user?.c_Name,
            "Coordinator Cell #": item.user?.c_contact,
            "Coordinator Phone #": item.user?.c_phone,
            "Coordinator Email": item.user?.c_email,
            "School BankTitle": item.user?.bankTitle,
            "Coordinator Account Details": item.user?.c_accountDetails,
            updatedTime: new Date(item.updatedAt).toLocaleString(), // Convert to human-readable format
            createdAt: new Date(item.createdAt).toLocaleString(), // Convert to human-readable format

            // ...student, // Spread student attributes
          }));

          const studentsForExcel = registrations.flatMap((reg: any) =>
            reg.students.map((student: StudentData) => ({
              "School id": reg.user?.schoolId,
              "School Name": reg.user?.schoolName,
              "Total Students": reg.students.length,
              "School Address": reg.user?.schoolAddress,
              "District Name": reg.user?.city,
              "District Id": reg.user?.district,
              "School Email": reg.user?.email,
              "Contact Number": reg.user?.contactNumber,
              "Principal Name": reg.user?.p_Name,
              "Principal Cell #": reg.user?.p_contact,
              "Principal Phone #": reg.user?.p_phone,
              "Principal Email": reg.user?.p_email,
              "Coordinator Name": reg.user?.c_Name,
              "Coordinator Cell #": reg.user?.c_contact,
              "Coordinator Phone #": reg.user?.c_phone,
              "Coordinator Email": reg.user?.c_email,
              "School BankTitle": reg.user?.bankTitle,
              "Coordinator Account Details": reg.user?.c_accountDetails,
              ...student, // Spread student attributes
            }))
          );
          const studentsForUtility = registrations.flatMap((reg: any) =>
            reg.students.map((student: StudentData) => ({
              ...student, // Spread student attributes
            }))
          );
          setStudentForUtility(studentsForUtility);
          setStudentForExcel(studentsForExcel);
          setExcel(ExcelData);

          const extractedData = registrations.map((obj: any) => ({
            contestId: obj.contestId,
            schoolName: obj.user.schoolName,
            schoolId: obj.schoolId,
            id: obj.id,
            registeredBy: obj.registeredBy,
            studentsLength: obj.students.length,
            email: obj.user.email,
            students: obj.students, // Add this line
            paymentProof: obj.paymentProof, // This assumes paymentProof is within the user object
          }));
          const schoolsData = registrations
            .map((obj: any) => ({
              schoolName: obj.user.schoolName,
              schoolId: obj.user.schoolId,
              district: obj.user.city,
              schoolAddress: obj.user.schoolAddress,
              schoolPrinPhone: obj.user.p_contact,
              schoolCorPhone: obj.user.c_contact,
              schoolMainPhone: obj.user.contactNumber,
            }))
            .sort(
              (a: SchoolDetails, b: SchoolDetails) => a.schoolId - b.schoolId
            );
          setLabelsData(schoolsData);

          setRegData(extractedData);
        }
      } catch (error) {
        // Check if the error is a cancellation error
        if (axios.isCancel(error)) {
          console.log("Request canceled");
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };

    if (typeof params.id === "string") {
      fetchAndSetData(params.id);
    }

    return () => {
      controller.abort(); // Cleanup by aborting the ongoing request
    };
  }, [params.id]);

  const handleClick = () => {
    if (regData.length > 0) {
      // Prepare School Data (existing logic)
      const schoolData = excel.map((item: any) => ({
        "School id": item["School id"],
        "School Name": item["School Name"]?.toUpperCase(),
        "Total Students": item["Total Students"],
        "School Address": item["School Address"],
        "District Name": item["District Name"],
        "District Id": item["District Id"],
        "School Email": item["School Email"],
        "Contact Number": item["Contact Number"],
        "Principal Name": item["Principal Name"]?.toUpperCase(),
        "Principal Cell #": item["Principal Cell #"],
        "Principal Phone #": item["Principal Phone #"],
        "Principal Email": item["Principal Email"],
        "Coordinator Name": item["Coordinator Name"]?.toUpperCase(),
        "Coordinator Cell #": item["Coordinator Cell #"],
        "Coordinator Phone #": item["Coordinator Phone #"],
        "Coordinator Email": item["Coordinator Email"],
        "School BankTitle": item["School BankTitle"],
        "Coordinator Account Details": item["Coordinator Account Details"],
        "Updated Time": item.updatedTime,
        "Created At": item.createdAt,
      }));

      // Prepare Student Data with only specific columns
      const studentData: any[] = [];

      regData.forEach((registration: any) => {
        // Find the corresponding school data
        const schoolInfo = excel.find(
          (school: any) => school["School id"] === registration.schoolId
        );

        // If the registration has students, add each student to the studentData
        if (registration.students && registration.students.length > 0) {
          registration.students.forEach((student: any, index: number) => {
            studentData.push({
              "School ID": registration.schoolId,
              "School Name": schoolInfo
                ? String(schoolInfo["School Name"] ?? "").toUpperCase()
                : "N/A", // Add toUpperCase() here
              "Total Students": registration.students.length,
              "District Name": schoolInfo ? schoolInfo["District Name"] : "N/A",
              rollNumber: student.rollNumber,
              studentName: student.studentName?.toUpperCase() || "",
              fatherName: student.fatherName?.toUpperCase() || "",
              class: student.class,
              level: student.level,
              registrationId: registration.id,
            });
          });
        }
      });

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();

      // Add School Data sheet
      const schoolWs = XLSX.utils.json_to_sheet(schoolData);
      XLSX.utils.book_append_sheet(wb, schoolWs, "School Data");

      // Add Student Data sheet with only the specified columns
      const studentWs = XLSX.utils.json_to_sheet(studentData);
      XLSX.utils.book_append_sheet(wb, studentWs, "Student Data");

      // Write and save the file with dynamic naming based on contestCh
      let fileName = "contest_data.xlsx";
      if (contestCh === "S") {
        fileName = "IKSC_contest_data.xlsx";
      } else if (contestCh === "M") {
        fileName = "IKMC_contest_data.xlsx";
      } else if (contestCh === "L") {
        fileName = "IKLC_contest_data.xlsx";
      }
      XLSX.writeFile(wb, fileName);
    } else {
      console.log("No data available to export");
      toast.error("No data available to export", {
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
  const handleStudentCountByLevels = async () => {
    try {
      // Show loading toast
      toast.info("Generating report, please wait...", {
        position: "top-right",
        autoClose: 3000,
      });

      const response = await axios.get(
        `/api/users/contests/${params.id}/getlevelsbyschoolId`
      );

      const { schools } = response.data;
      if (!schools || schools.length === 0) {
        toast.error("No data available to export", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
      const excelData = schools.map((school: any) => ({
        "School ID": school.schoolId,
        "School Name": school.schoolName,
        "Total Students": school.totalStudents,
        "PRE-ECOLIER": school.categories.PRE_ECOLIER,
        ECOLIER: school.categories.ECOLIER,
        BENJAMIN: school.categories.BENJAMIN,
        CADET: school.categories.CADET,
        JUNIOR: school.categories.JUNIOR,
        STUDENT: school.categories.STUDENT,
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Student Counts by Level");

      // Generate a suitable filename
      const fileName = `${
        contestName || "Contest"
      }_Student_Counts_By_Level.xlsx`;

      // Write and download the file
      XLSX.writeFile(wb, fileName);

      // Show success toast
      toast.success("Report downloaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };
  const handleExcelForUtility = () => {
    if (regData.length > 0) {
      // Prepare Student Data (new logic)
      const studentData: any[] = [];
      console.log(regData);
      // Iterate through registrations to extract student details
      regData.forEach((registration: any) => {
        // Find the corresponding school data

        // If the registration has students, add each student to the studentData
        if (registration.students && registration.students.length > 0) {
          registration.students.forEach((student: any) => {
            studentData.push({
              // Student Information
              "Roll Number": student.rollNumber,
              "Student Name": student.studentName,
              "Father Name": student.fatherName,
              Class: student.class,
              Level: student.level,
            });
          });
        }
      });

      // Create workbook and add sheets
      const wb = XLSX.utils.book_new();

      // Add School Data sheet

      // Add Student Data sheet
      const studentWs = XLSX.utils.json_to_sheet(studentsForUtility);
      XLSX.utils.book_append_sheet(wb, studentWs, "Student Data");

      // Write and save the file with dynamic naming based on contestCh
      let fileName = "contest_data.xlsx";
      if (contestCh === "S") {
        fileName = "IKSC_contest_data.xlsx";
      } else if (contestCh === "M") {
        fileName = "IKMC_contest_data.xlsx";
      } else if (contestCh === "L") {
        fileName = "IKLC_contest_data.xlsx";
      }
      XLSX.writeFile(wb, fileName);
    } else {
      console.log("No data available to export");
      toast.error("No data available to export", {
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
  const handleGenerateResults = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/results/generate", {
        contestId: params.id,
      });
      console.log(data);
      toast.success("🦄 Results generated successfully", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setIsLoading(false);
      return data;
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
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push(`/admin/registerincontest/${params.id}`);
  };
  const handleAwardDefinition = () => {
    abortActiveRequest();
    setIsLoading(true);
    router.push(`/admin/createawardcategories/${params.id}`);
  };

  const handleDownloadAllLabel = async () => {
    console.log("kkr");
    try {
      const blob = await pdf(<AllLabels schoolDetails={labelsData} />).toBlob();

      const pdfName = `labelsForAll.pdf`;
      saveAs(blob, pdfName);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };
  const handleDownloadAllLabelsShort = async () => {
    console.log("kkr");
    try {
      const blob = await pdf(
        <AllLabelsShort schoolDetails={labelsData} />
      ).toBlob();

      const pdfName = `ShortlabelsForAll.pdf`;
      saveAs(blob, pdfName);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    }
  };
  const handleViewResults = () => {
    abortActiveRequest(); // Abort any existing request
    activeRequestController.current = new AbortController();
    setIsLoading(true);

    router.push(`/admin/results/${params.id}`);
  };
  const handleAddResult = () => {
    setIsLoading(true);
    onOpen("addResult", {
      contestId,
    });
    setIsLoading(false);
  };

  const handleDownloadReceipts = () => {
    setShowReceiptsModal(true);
  };
  const handleUploadScores = async () => {
    try {
      if (!selectedFile) return;
      setUploading(true);
      setUploadProgress(0);
      setImportInsertedCount(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("contestId", String(params.id));

      const { data } = await axios.post(
        "/api/results/scores/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      toast.success("Scores imported successfully", {
        position: "bottom-center",
      });
      setImportInsertedCount(data.insertedCount ?? null);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to import scores";
      toast.error(msg, { position: "top-right" });
    } finally {
      setUploading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadProgress(0);
    setImportInsertedCount(null);
  };

  const handleAppendScores = async () => {
    try {
      if (!selectedFile) return;
      setUploading(true);
      setUploadProgress(0);
      setImportInsertedCount(null);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("contestId", String(params.id));
      formData.append("mode", "append");

      const { data } = await axios.post(
        "/api/results/scores/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      const inserted = data.insertedCount ?? 0;
      const skipped = data.skippedCount ?? 0;
      toast.success(`Appended ${inserted} rows, skipped ${skipped}`);
      setImportInsertedCount(inserted);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to append scores";
      toast.error(msg, { position: "top-right" });
    } finally {
      setUploading(false);
    }
  };

  // Download all answer sheets ONE BY ONE - with resume capability
  const handleDownloadAllAnswerSheetsOneByOne = async (resumeMode = false) => {
    if (regData.length === 0) {
      toast.error("No schools available to download", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Prevent multiple simultaneous downloads
    if (isBulkDownloadingAnswerSheets) {
      toast.warning("Download already in progress", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Filter out already downloaded schools if resuming
    const schoolsToDownload = resumeMode 
      ? regData.filter(reg => !downloadedSchoolIds.has(reg.id))
      : regData;

    if (schoolsToDownload.length === 0) {
      toast.info("All schools have already been downloaded!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const userConfirmed = window.confirm(
      resumeMode
        ? `Resume download: ${schoolsToDownload.length} schools remaining. Continue?`
        : `This will download ${regData.length} PDF files one by one. This will take approximately ${Math.ceil(regData.length * 2 / 60)} minutes. Continue?`
    );
    
    if (!userConfirmed) return;

    try {
      setIsBulkDownloadingAnswerSheets(true);
      setDownloadProgressAnswerSheets({ current: 0, total: schoolsToDownload.length });

      let successCount = 0;
      let failedSchools: string[] = [];
      const newDownloadedIds = new Set(downloadedSchoolIds);

      // Use console.log instead of toast for progress to avoid toast corruption
      console.log(`Starting download for ${schoolsToDownload.length} schools...`);

      for (let i = 0; i < schoolsToDownload.length; i++) {
        const registration = schoolsToDownload[i];
        setDownloadProgressAnswerSheets({ current: i + 1, total: schoolsToDownload.length });

        // Log progress to console instead of toast
        if (i > 0 && i % 10 === 0) {
          console.log(`Progress: ${i}/${schoolsToDownload.length} downloaded...`);
        }

        // LONGER delay between downloads
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
        }

        try {
          const response = await axios.get(`/api/users/pdfdownload/${registration.id}`);
          
          if (!response || !response.data || response.data.length === 0) {
            throw new Error('No student data received');
          }

          // Map and clean student data - adapting to Pakistan structure
          let students: Student[] = response.data
            .filter((student: any) => student && student.rollNumber)
            .map((student: any) => ({
              rollNumber: String(student.rollNumber || ''),
              studentName: String(student.studentName || ''),
              fatherName: String(student.fatherName || ''),
              studentClass: String(student.class || ''),  // Map 'class' to 'studentClass'
              studentLevel: String(student.level || ''),  // Map 'level' to 'studentLevel'
              schoolId: Number(student.schoolId || registration.schoolId),
              schoolName: String(student.schoolName || registration.schoolName || ''),
              address: student.address || null,
              districtCode: student.districtCode || null,
            }));

          if (students.length === 0) {
            throw new Error('No valid students found');
          }

          // Limit to 200 students per PDF (matching the CHUNK_SIZE in columns.tsx)
          if (students.length > 200) {
            students = students.slice(0, 200);
          }

          const res = await axios.get(`/api/users/allusers/getschoolbyregid/${registration.id}`);
          const contestData = await axios.get(`/api/users/contests/${res.data.contestId}`);

          const profileData: profileData = {
            p_Name: String(res.data.user.p_Name || ''),
            c_Name: String(res.data.user.c_Name || ''),
            p_contact: String(res.data.user.p_contact || ''),
            email: String(res.data.user.email || ''),
            contactNumber: String(res.data.user.contactNumber || ''),
            contestName: String(contestData.data.name || ''),
            contestCh: String(contestData.data.contestCh || ''),
            contestNo: String(contestData.data.contestNo || ''),
          };

          // Import MyDocument from columns.tsx
          const { MyDocument } = await import('./columns');
          
          // Use the pattern from columns.tsx - pass doc directly to pdf()
          const doc = <MyDocument students={students} profileData={profileData} />;
          const asPdf = pdf(doc);
          const blob = await asPdf.toBlob();

          const pdfName = `${students[0].schoolId}_answer_sheet.pdf`;
          saveAs(blob, pdfName);
          
          // Longer delay to allow garbage collection and prevent font corruption
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Mark as downloaded
          newDownloadedIds.add(registration.id);
          setDownloadedSchoolIds(new Set(newDownloadedIds));
          
          successCount++;
          console.log(`✓ Successfully downloaded school ${registration.schoolId} (${successCount}/${schoolsToDownload.length})`);
          
        } catch (error: any) {
          const errorMsg = error?.message || 'Unknown error';
          console.error(`✗ Failed for school ${registration.schoolId}:`, errorMsg);
          failedSchools.push(`${registration.schoolId} - ${registration.schoolName}`);
        }
      }

      const totalDownloaded = newDownloadedIds.size;
      const remaining = regData.length - totalDownloaded;

      // Show final result with toast
      try {
        toast.success(
          `✅ Downloaded ${successCount}/${schoolsToDownload.length} schools! Total: ${totalDownloaded}/${regData.length}${remaining > 0 ? ` (${remaining} remaining)` : ''}`,
          { position: "top-right", autoClose: 8000 }
        );

        if (failedSchools.length > 0) {
          console.error("Failed schools:", failedSchools);
          toast.warning(
            `Failed schools: ${failedSchools.slice(0, 3).join(', ')}${failedSchools.length > 3 ? ` and ${failedSchools.length - 3} more...` : ''}`,
            { position: "top-right", autoClose: 10000 }
          );
        }

        if (remaining > 0) {
          toast.info(
            `${remaining} schools remaining. Click "Resume Download" to continue.`,
            { position: "top-right", autoClose: 10000 }
          );
        }
      } catch (toastError) {
        // If toast fails, just log to console
        console.log("Download complete but toast notification failed");
      }
    } catch (error) {
      console.error("Error:", error);
      
      try {
        toast.error("An error occurred during download", { position: "top-right", autoClose: 5000 });
      } catch (toastError) {
        console.error("Toast error:", toastError);
      }
    } finally {
      // Always reset download state, even if there's an error
      setIsBulkDownloadingAnswerSheets(false);
      setDownloadProgressAnswerSheets({ current: 0, total: 0 });
    }
  };

  // Reset downloaded tracking
  const handleResetDownloadTracking = () => {
    setDownloadedSchoolIds(new Set());
    toast.info("Download tracking reset. You can start fresh.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        Registered Schools
      </h1>
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        {contestName}
      </h1>
      <div className="flex flex-wrap -mx-2">
        <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
          <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
            <h2 className="font-bold text-2xl">Registered Students</h2>
            <p className="text-lg font-semibold">{allStudents.length}</p>
            <h2 className="font-bold text-2xl">Registered Schools</h2>
            <p className="text-lg font-semibold">{totalSchools}</p>
            <h2 className="font-bold text-2xl">Total Payments</h2>
            <p className="text-lg font-semibold">{totalPaymentDone}</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 px-2">
          <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
            <h2 className="font-bold text-2xl">Levels</h2>
            <ul>
              <li className="text-lg mv font-medium">
                Total # of Preecolier:{" "}
                <span className="font-bold">{preEculier}</span>
              </li>
              <li className="text-lg font-medium">
                Total # of Ecolier: <span className="font-bold">{eculier}</span>
              </li>
              <li className="text-lg font-medium">
                Total # of Benjamin:{" "}
                <span className="font-bold">{benjamin}</span>
              </li>
              <li className="text-lg font-medium">
                Total # of Cadet: <span className="font-bold">{cadet}</span>
              </li>
              <li className="text-lg font-medium">
                Total # of Junior: <span className="font-bold">{junior}</span>
              </li>
              <li className="text-lg font-medium">
                Total # of Student: <span className="font-bold">{student}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
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
            onClick={handleClick}>
            Export Data
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleStudentCountByLevels}>
            Download Student Count By Levels
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleExcelForUtility}>
            Export Data For Uitlity
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleRegister}>
            Register a school
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            disabled={isLoading}
            size="lg"
            onClick={handleAwardDefinition}>
            Update Award Categories
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleGenerateResults}>
            Generate Results
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleDownloadAllLabel}>
            Download Labels
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleViewResults}>
            View Results
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            disabled={isLoading}
            onClick={handleAddResult}>
            Upload Permission For Publishing Result
          </Button>

          <Button
            variant="default"
            size="lg"
            className=" font-medium text-[15px]  tracking-wide"
            onClick={handleDownloadAllLabelsShort}>
            Download Short Labels
          </Button>
          <Button
            variant="default"
            size="lg"
            className=" font-medium text-[15px]  tracking-wide"
            onClick={handleDownloadReceipts}>
            Download Receipts
          </Button>
          <Button
            variant="default"
            size="lg"
            className=" font-medium text-[15px]  tracking-wide"
            disabled={isBulkDownloadingAnswerSheets || regData.length === 0}
            onClick={() => handleDownloadAllAnswerSheetsOneByOne(false)}>
            {isBulkDownloadingAnswerSheets 
              ? `Downloading... (${downloadProgressAnswerSheets.current}/${downloadProgressAnswerSheets.total})` 
              : 'Download All Answer Sheets (One by One)'}
          </Button>
          {downloadedSchoolIds.size > 0 && (
            <Button
              variant="default"
              size="lg"
              className=" font-medium text-[15px]  tracking-wide"
              disabled={isBulkDownloadingAnswerSheets}
              onClick={() => handleDownloadAllAnswerSheetsOneByOne(true)}>
              Resume Download ({regData.length - downloadedSchoolIds.size} remaining)
            </Button>
          )}
          {downloadedSchoolIds.size > 0 && (
            <Button
              variant="outline"
              size="lg"
              className=" font-medium text-[15px]  tracking-wide"
              disabled={isBulkDownloadingAnswerSheets}
              onClick={handleResetDownloadTracking}>
              Reset Download Tracking
            </Button>
          )}
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
            onClick={handleClick}>
            Export Data
          </Button>
          {contestCh == "S" && (
            <Button
              className=" font-medium text-[11px]  tracking-wide"
              variant="default"
              size="sm">
              <a
                href="https://docs.google.com/document/d/18m6ciOBjrL7xrCXJF59Cfiu3SHsNWb_3/edit?usp=sharing&ouid=100155003670788686545&rtpof=true&sd=true"
                target="_new">
                Download Answer Sheet
              </a>
            </Button>
          )}
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleRegister}>
            Register a school
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleAwardDefinition}>
            Update Award Categories
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleGenerateResults}>
            Generate Results
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={handleViewResults}>
            View Results
          </Button>

          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleDownloadAllLabel}>
            Download Labels
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleDownloadAllLabelsShort}>
            Download Short Labels
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleDownloadReceipts}>
            Download Receipts
          </Button>
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            disabled={isBulkDownloadingAnswerSheets || regData.length === 0}
            onClick={() => handleDownloadAllAnswerSheetsOneByOne(false)}>
            {isBulkDownloadingAnswerSheets 
              ? `Downloading... (${downloadProgressAnswerSheets.current}/${downloadProgressAnswerSheets.total})` 
              : 'Download All Answer Sheets'}
          </Button>
          {downloadedSchoolIds.size > 0 && (
            <Button
              className=" font-medium text-[11px]  tracking-wide"
              variant="default"
              size="sm"
              disabled={isBulkDownloadingAnswerSheets}
              onClick={() => handleDownloadAllAnswerSheetsOneByOne(true)}>
              Resume ({regData.length - downloadedSchoolIds.size} left)
            </Button>
          )}
          {downloadedSchoolIds.size > 0 && (
            <Button
              className=" font-medium text-[11px]  tracking-wide"
              variant="outline"
              size="sm"
              disabled={isBulkDownloadingAnswerSheets}
              onClick={handleResetDownloadTracking}>
              Reset Tracking
            </Button>
          )}
        </div>
      </div>
      <div className="mt-6 border rounded-md p-4 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Import Scores (Excel)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload an .xlsx file with the expected columns. Existing scores for
          this contest will be replaced.
        </p>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <Input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            disabled={uploading}
            className="max-w-sm"
          />
          <Button
            onClick={handleUploadScores}
            disabled={!selectedFile || uploading}>
            {uploading ? "Uploading..." : "Upload & Replace Scores"}
          </Button>
          <Button
            variant="default"
            disabled={!selectedFile || uploading}
            onClick={handleAppendScores}>
            {uploading ? "Uploading..." : "Append Scores"}
          </Button>
          {importInsertedCount !== null && (
            <span className="text-sm text-gray-700">
              Inserted: {importInsertedCount}
            </span>
          )}
          {importInsertedCount !== null && (
            <Button
              variant="default"
              size="sm"
              disabled={isLoading}
              onClick={handleGenerateResults}>
              Regenerate Results
            </Button>
          )}
        </div>
        {uploading && (
          <div className="w-full h-3 bg-gray-200 rounded mt-3 overflow-hidden">
            <div
              className="h-full bg-[#891538] transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
      <DataTable columns={columns} data={regData} />
      <ReceiptsDownloadModal
        contestId={params.id as string}
        contestName={contestName}
        open={showReceiptsModal}
        onClose={() => setShowReceiptsModal(false)}
      />
    </div>
  );
};

export default FetchAllRegistrations;
