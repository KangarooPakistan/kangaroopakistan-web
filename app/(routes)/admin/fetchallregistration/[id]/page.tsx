"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Registration, columns, PaymentProof } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";

import AllLabels, { SchoolDetails } from "./AllLabels";
import * as XLSX from "xlsx";
import { pdf } from "@react-pdf/renderer";
import AllLabelsShort from "./AllLabelsShort";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Ensures this page is always rendered server-side

async function fetchData(id: string, signal: AbortSignal) {
  const res = await axios.get(`/api/users/fetchallregistrations/${id}`);

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
  level: string;
  class: string; // Changed from `class` to `studentClass`
  schoolName: string;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}
interface StudentData {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  level: string;
  class: string;
}
type LevelCounts = Record<string, number>;

interface RegistrationWithPaymentProof extends Registration {
  paymentProof: PaymentProof[];
}

const FetchAllRegistrations = () => {
  const params = useParams();
  const router = useRouter();
  const [regData, setRegData] = useState<Registration[]>([]);
  const [excel, setExcel] = useState([]); // This makes sure `excel` is an array
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

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchAndSetData = async (id: string) => {
      const registrations = await fetchData(id, signal);

      setTotalSchools(registrations.length);

      const totalPayments = registrations.reduce(
        (acc: number, curr: Registration) => {
          return (
            acc + (curr.paymentProof && curr.paymentProof.length > 0 ? 1 : 0)
          );
        },
        0
      );
      setTotalPaymentDone(totalPayments);

      const studentsArrays = registrations.map((reg: Register) => reg.students);
      const flattenedStudents = studentsArrays.flat();
      setAllStudents(flattenedStudents);

      const levelCounts = flattenedStudents.reduce(
        (acc: LevelCounts, student: Student) => {
          const { level } = student;
          acc[level] = (acc[level] || 0) + 1;
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

      const ExcelData = registrations.map((item: any) => ({
        "School id": item.user?.schoolId,
        "School Name": item.user?.schoolName,
        "School BankTitle": item.user?.bankTitle,
        "Contact Number": item.user?.contactNumber,
        "School Address": item.user?.schoolAddress,
        "District Id": item.user?.district,
        "District Name": item.user?.city,
        "Principal Name": item.user?.p_Name,
        "Principal Cell #": item.user?.p_contact,
        "Principal Phone #": item.user?.p_phone,
        "Principal Email": item.user?.p_email,
        "Coordinator Name": item.user?.c_Name,
        "Coordinator Cell #": item.user?.c_contact,
        "Coordinator Phone #": item.user?.c_phone,
        "Coordinator Email": item.user?.c_email,
        "Coordinator Account Details": item.user?.c_accountDetails,
        "School Email": item.user?.email,
        "Total Students": item.students.length,
        updatedTime: new Date(item.updatedAt).toLocaleString(), // Convert to human-readable format
        createdAt: new Date(item.createdAt).toLocaleString(), // Convert to human-readable format

        // ...student, // Spread student attributes
      }));

      // const studentsForExcel = registrations.flatMap((reg: any) =>
      //   reg.students.map((student: StudentData) => ({
      //     "School id": reg.user?.schoolId,
      //     "School Name": reg.user?.schoolName,
      //     "School BankTitle": reg.user?.bankTitle,
      //     "Contact Number": reg.user?.contactNumber,
      //     "School Address": reg.user?.schoolAddress,
      //     District: reg.user?.district,
      //     City: reg.user?.city,
      //     "Principal Name": reg.user?.p_Name,
      //     "Principal Cell #": reg.user?.p_contact,
      //     "Principal Phone #": reg.user?.p_phone,
      //     "Principal Email": reg.user?.p_email,
      //     "Coordinator Name": reg.user?.c_Name,
      //     "Coordinator Cell #": reg.user?.c_contact,
      //     "Coordinator Phone #": reg.user?.c_phone,
      //     "Coordinator Email": reg.user?.c_email,
      //     "Coordinator Account Details": reg.user?.c_accountDetails,
      //     "School Email": reg.user?.email,
      //     // ...student, // Spread student attributes
      //   }))
      // );
      setExcel(ExcelData);

      const extractedData = registrations.map((obj: any) => ({
        contestId: obj.contestId,
        schoolName: obj.user.schoolName,
        schoolId: obj.schoolId,
        id: obj.id,
        registeredBy: obj.registeredBy,
        studentsLength: obj.students.length,
        email: obj.user.email,
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
        .sort((a: SchoolDetails, b: SchoolDetails) => a.schoolId - b.schoolId);
      setLabelsData(schoolsData);

      setRegData(extractedData);
    };

    if (typeof params.id === "string") {
      fetchAndSetData(params.id);
    }

    return () => {
      controller.abort(); // Cleanup by aborting the ongoing request
    };
  }, [params.id]);

  const handleClick = () => {
    if (excel.length > 0) {
      const ws = XLSX.utils.json_to_sheet(excel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `data.xlsx`);
    } else {
      console.log("No data available to export");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRegister = () => {
    router.push(`/admin/registerincontest/${params.id}`);
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        Registered Schools
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
            onClick={handleRegister}>
            Register a school
          </Button>
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleDownloadAllLabel}>
            Download Labels
          </Button>
          <Button
            variant="default"
            size="lg"
            className=" font-medium text-[15px]  tracking-wide"
            onClick={handleDownloadAllLabelsShort}>
            Download Short Labels
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
        </div>
      </div>
      <DataTable columns={columns} data={regData} />
    </div>
  );
};

export default FetchAllRegistrations;
