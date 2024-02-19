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

const ViewAllBySchool = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();
  const router = useRouter();

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
        <div className="p-4 border-t border-gray-300">
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
