"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";

const page = () => {
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
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={students} />
    </div>
  );
=======
import React, { useEffect } from "react";

const page = () => {
  const params = useParams();
  useEffect(() => {
    const fetch = async () => {
      const registeredStudents = await axios.get(
        `/api/users/contests/${params.id}/registrations`
      );

      console.log(registeredStudents);
    };
    fetch();
  }, []);
  return <div>page</div>;
>>>>>>> a8041842edb0b2e738e604881ef1f5031816eb77
};

export default page;
