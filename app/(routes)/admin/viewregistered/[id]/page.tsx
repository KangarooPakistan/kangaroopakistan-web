"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";

const page = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations`
        );
        console.log(registeredStudents);
        setStudents(registeredStudents.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  }, []);
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={students} />
    </div>
  );
};
export default page;
