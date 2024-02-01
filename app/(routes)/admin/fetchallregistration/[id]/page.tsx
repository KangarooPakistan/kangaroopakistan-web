"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const FetchAllRegistrations = () => {
  const params = useParams();
  useEffect(() => {
    const fetchData = async () => {
      console.log(params.id);
      const res = await axios.get(`/api/users/fetchallregistrations/${params.id}`);
      console.log(res);
    };
    fetchData();
  }, []);
  return <div>page</div>;
};

export default FetchAllRegistrations;
