"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";

const ViewRegistered = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const session = await getSession();

        const response = await axios.get(
          `/api/users/getuserbyemail/${session?.user.email}`
        );
        const regId = await axios.get(
          `/api/users/contests/${params.id}/${response.data.schoolId}`
        );
        console.log(regId);
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations/${regId.data.id}`
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
    <>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={students} />
      </div>
    </>
  );
};

export default ViewRegistered;
