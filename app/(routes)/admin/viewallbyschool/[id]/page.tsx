"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import * as XLSX from "xlsx";

import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";

interface ItemType {
  students: Student[];
  schoolId: number;
}
type LevelCounts = Record<string, number>;

const ViewAllBySchool = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();
  const router = useRouter();
  const [preEculier, setPreEculier] = useState<number>(0);
  const [totalPaymentDone, setTotalPaymentDone] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);
  const [totalSchools, setTotalSchools] = useState<number>(0);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`/api/users/registrations/${params.id}`);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetch = async () => {
      try {
        const registeredStudents = await axios.get(
          `/api/users/registrations/${params.id}`
        );
        console.log(registeredStudents.data);
        const levelCounts = registeredStudents.data.students.reduce(
          (acc: LevelCounts, student: Student) => {
            const { level } = student;
            console.log(level);
            acc[level] = (acc[level] || 0) + 1;
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
  }, []);

  const exportSheet = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `data.xlsx`);
  };
  const handleClick = () => {
    router.push(`/user/viewallrecipts/${params.id}`);
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
              <p className="text-lg font-semibold">{allStudents.length}</p>
              <h2 className="font-bold text-2xl ">Registered Schools</h2>
              <p className="text-lg font-semibold">{totalSchools}</p>
              <h2 className="font-bold text-2xl ">Total Payments</h2>
              <p className="text-lg font-semibold">{totalPaymentDone}</p>
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
        <div className="p-4 flex justify-end border-gray-300">
          <Button className="" onClick={exportSheet}>
            Export Data
          </Button>
        </div>
        <DataTable columns={columns} data={students} />
      </div>
    </>
  );
};

export default ViewAllBySchool;
