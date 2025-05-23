"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import * as XLSX from "xlsx";

import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface RegistrationEntry {
  students: Student[];
}

interface ItemType {
  students: Student[];
  schoolId: number;
}
type LevelCounts = Record<string, number>;

const ViewAllBySchool = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();
  const [preEculier, setPreEculier] = useState<number>(0);
  const [totalPaymentDone, setTotalPaymentDone] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [contestId, setContestId] = useState("");
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);
  const [totalSchools, setTotalSchools] = useState<number>(0);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [schoolName, setSchoolName] = useState();
  const [registrationId, setRegistratonId] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

      setRegistratonId(id);
      const res = await axios.get(`/api/users/registrations/${params.id}`);
    };
    fetchData();
  }, [params.id]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const registeredStudents = await axios.get(
          `/api/users/registrations/${params.id}`
        );
        const regData = await axios.get(`/api/registration/${params.id}`);
        setContestId(regData.data.contestId);

        console.log(registeredStudents.data[0].id);

        console.log(registeredStudents.data);
        console.log(registeredStudents.data[0].schoolName);
        setSchoolName(registeredStudents.data[0].schoolName);

        const allStudents: Student[] = registeredStudents.data.flatMap(
          (reg: RegistrationEntry) => reg.students
        ); // Flattens the array of student arrays

        const levelCounts = allStudents.reduce(
          (acc: LevelCounts, student: Student) => {
            const { level } = student; // Assuming each student has a 'level' attribute
            if (level) {
              acc[level] = (acc[level] || 0) + 1; // Increment the count for this level
            }
            return acc;
          },
          {}
        );
        console.log(levelCounts);

        setPreEculier(levelCounts["preecolier"] || 0);
        setEculier(levelCounts["ecolier"] || 0);
        setBenjamin(levelCounts["benjamin"] || 0);
        setCadet(levelCounts["cadet"] || 0);
        setJunior(levelCounts["junior"] || 0);
        setStudent(levelCounts["student"] || 0);

        setStudents(registeredStudents.data);

        console.log(levelCounts);

        const data: ItemType[] = registeredStudents.data;

        const extractedStudents: Student[] = data.flatMap((item: ItemType) =>
          item.students.map((student) => ({
            ...student,
            schoolId: item.schoolId,
          }))
        );
        setStudents(extractedStudents);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetch();
  }, [params.id]);
  const handleRegister = () => {
    router.push(
      `/admin/enrollstudents/${contestId}/registrationId/${params.id}`
    );
  };

  const exportSheet = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `data.xlsx`);
  };
  const handleBack = () => {
    router.back();
  };

  const handleAddImage = () => {
    setLoading(true);
    onOpen("addImage", {
      registrationId,
    });
    setLoading(false);
  };
  return (
    <>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
          Registered Students
        </h1>

        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
            <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl ">Registered Students</h2>
              <p className="text-lg font-semibold">{students.length}</p>
              <h2 className="font-bold text-2xl ">School Name:</h2>
              <p className="text-lg font-semibold">{schoolName}</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 px-2">
            <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl">Levels</h2>
              <ul>
                <li className=" text-lg mv font-medium">
                  Total # of Preecolier:{" "}
                  <span className="font-bold">{preEculier}</span>
                </li>
                <li className=" text-lg font-medium">
                  Total # of Ecolier:{" "}
                  <span className="font-bold">{eculier}</span>
                </li>
                <li className=" text-lg font-medium">
                  Total # of Benjamin:{" "}
                  <span className="font-bold">{benjamin}</span>
                </li>
                <li className=" text-lg font-medium">
                  Total # of Cadet: <span className="font-bold">{cadet}</span>
                </li>
                <li className=" text-lg font-medium">
                  Total # of Junior: <span className="font-bold">{junior}</span>
                </li>
                <li className=" text-lg font-medium">
                  Total # of Student:{" "}
                  <span className="font-bold">{student}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className=" py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
            <Button
              className=" font-semibold text-[15px] tracking-wide "
              variant="default"
              size="lg"
              onClick={handleBack}>
              Back
            </Button>
            <Button
              className="bg-transparent text-purple-600 font-semibold text-sm md:text-xl disabled:bg-slate-100"
              disabled={loading}
              variant="default"
              size="lg"
              onClick={handleAddImage}>
              Add Proof of Payment
            </Button>
            <Button
              className=" font-semibold text-[15px] tracking-wide "
              variant="default"
              size="lg"
              onClick={exportSheet}>
              Export Data
            </Button>
            <Button
              className=" font-semibold text-[15px] tracking-wide "
              variant="default"
              size="lg"
              onClick={handleRegister}>
              Register Students
            </Button>
          </div>
        </div>
        <div className="block md:hidden">
          <div className="md:hidden py-2 md:p-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
            <Button
              className=" font-medium text-[11px]  tracking-wide"
              variant="default"
              size="sm"
              onClick={handleBack}>
              Back
            </Button>
            <Button
              className="bg-transparent tracking-wide text-purple-600 font-semibold text-sm md:text-xl disabled:bg-slate-100"
              disabled={loading}
              variant="default"
              size="sm"
              onClick={handleAddImage}>
              Add Proof of Payment
            </Button>
            <Button
              className=" font-medium text-[11px] tracking-wide"
              variant="default"
              size="sm"
              onClick={handleRegister}>
              Export Data
            </Button>
            <Button
              className=" font-medium text-[11px] tracking-wide"
              variant="default"
              size="sm"
              onClick={exportSheet}>
              Register Students
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={students} />
      </div>
    </>
  );
};

export default ViewAllBySchool;
