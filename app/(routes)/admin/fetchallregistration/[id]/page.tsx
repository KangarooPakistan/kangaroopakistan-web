"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Registration, columns } from "./columns";
import { DataTable } from "./data-table";

const FetchAllRegistrations = () => {
  const params = useParams();
  const [data, setData] = useState<Registration[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(params.id);
      
      console.log(`/api/users/fetchallregistrations/${params.id}`);
      const res = await axios.get(
        `/api/users/fetchallregistrations/${params.id}`
      );
      setData(res.data);
      const extractedData = res.data.map((obj: any) => ({
        contestId: obj.contestId,
        schoolName: obj.schoolName,
        schoolId: obj.schoolId,
        id: obj.id,
        registeredBy: obj.registeredBy,
        studentsLength: obj.students.length,
        email: obj.user.email,
      }));
      setData(extractedData);
      console.log(res);
      console.table(res);
    };
    fetchData();
  }, []);
  return (
    <>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />;
      </div>
    </>
  );
};

export default FetchAllRegistrations;
