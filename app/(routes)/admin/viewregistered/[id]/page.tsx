"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";


interface ItemType {
  students: Student[];
  schoolId: string;
}

const ViewRegistered = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      try {
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations`
        );

        console.log(registeredStudents);
        const data: ItemType[] = registeredStudents.data;

        const extractedStudents: Student[] = data.flatMap((item: ItemType) =>
          item.students.map((student) => ({
            ...student,
            schoolId: item.schoolId,
          }))
        );
        console.log("-----------------------------------");
        console.log(extractedStudents);
        setStudents(extractedStudents);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetch();
  }, []);

  const handleClick = () => {
    router.push(`/user/viewallrecipts/${params.id}`);
  };
  return (
    <>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={students} />
      </div>
    </>
  );
};

export default ViewRegistered;
