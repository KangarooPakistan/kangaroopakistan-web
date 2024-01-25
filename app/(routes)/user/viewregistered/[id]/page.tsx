"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const params = useParams();
  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, []);
  return <div>page</div>;
};

export default page;
