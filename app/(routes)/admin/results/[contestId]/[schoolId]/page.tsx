"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataTable } from "../data-table";
import { columns } from "./columns";

const StudentResults = () => {
  const params = useParams();
  const [schoolData, setSchoolData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get(
          `/api/results/fetchresults/${params.contestId}/${params.schoolId}`
        );
        // const resp = await axios.get(`/api/results/getschoolsdata`);

        console.log("resp");
        setSchoolData(data.data);

        console.log(data);

        toast.success("🦄 Table data fetched successfully", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (error: any) {
        toast.error(" " + error.response.data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    };
    fetchData();
  }, []);
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={schoolData} />
    </div>
  );
};

export default StudentResults;
