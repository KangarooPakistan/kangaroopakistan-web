"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
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
};

export default page;
