"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { User, columns } from "./columns";
import { Button } from "@/components/ui/button";

const RegisterInContest = () => {
  const params = useParams();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/users/allusers/getonlyusers`);
      console.log(response);
      setUsers(response.data);
    };
    fetchData();
  }, []);
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        Register Schools
      </h1>
      <div className="hidden md:block">
        <div className="flex justify-start w-full mt-4 mb-4">
          <Button
            className=" font-medium text-[15px]  tracking-wide"
            variant="default"
            size="lg"
            onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
      <div className="block md:hidden">
        <div className="flex justify-between flex-wrap w-full mt-4 mb-4">
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default RegisterInContest;
