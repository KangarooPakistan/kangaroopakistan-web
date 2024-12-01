"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StringValidation } from "zod";

type User = {
  email: string;
  password: string;
  role: string;
  schoolId: number;
  schoolName: string; // Optional: only for non-admin users
  contactNumber: string;
  schoolAddress: string | null;
  district: string;
  tehsil: string;
  createdAt: string;
  updatedAt: string;
  fax: string;
  bankTitle: string | null;
  p_Name: string | null;
  p_mName: string | null;
  p_lName: string | null;
  p_contact: string | null;
  p_phone: string | null;
  p_email: string | null;
  c_Name: string | null;
  c_mName: string | null;
  c_lName: string | null;
  c_contact: string | null;
  c_phone: string | null;
  c_email: string | null;
  c_accountDetails: string | null;
};
const Users = () => {
  const [users, setUsers] = useState([]);
  const [excel, setExcel] = useState([]); // This makes sure `excel` is an array
  const router = useRouter();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios.get("/api/users/allusers"); // Replace with your actual API route URL

        setUsers(response.data);
        console.log(response.data);
        const usersForExcel = response.data.map((user: User) => ({
          "School id": user.schoolId,
          "School Name": user.schoolName, // Optional: only for non-admin users
          "School Address": user.schoolAddress,
          "District Name": user.district,
          "School Email": user.email,
          "Contact Number": user.contactNumber,
          "Principal Name": user.p_Name,
          "Principal Cell #": user.p_contact,
          "Principal Phone #": user.p_phone,
          "Principal Email": user.p_email,
          "Coordinator Name": user.c_Name,
          "Coordinator Cell #": user.c_contact,
          "Coordinator Phone #": user.c_phone,
          "Coordinator Email #": user.c_email,
          "Coordinator Account Details": user.c_accountDetails,
          "School Bank Title": user.bankTitle,
          createdAt: new Date(user.createdAt).toLocaleString(),
          updatedAt: new Date(user.updatedAt).toLocaleString(),
          role: user.role,
          // tehsil: user.tehsil,
          fax: user.fax,
          // p_mName: user.p_mName,
          // p_lName: user.p_lName,
          // c_mName: user.c_mName,
          // c_lName: user.c_lName,
        }));
        console.log(usersForExcel);
        setExcel(usersForExcel);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, []);
  const handleClick = () => {
    if (excel.length > 0) {
      const ws = XLSX.utils.json_to_sheet(excel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `data.xlsx`);
    } else {
      console.log("No data available to export");
    }
  };
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="container mx-auto py-10">
      <div className="hidden md:block">
        <div className=" py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-semibold text-[15px] tracking-wide "
            variant="default"
            size="lg"
            onClick={handleBack}>
            Back
          </Button>

          <Button
            className=" font-semibold text-[15px] tracking-wide "
            size="lg"
            onClick={handleClick}>
            Export Data
          </Button>
        </div>
      </div>
      <div className=" md:hidden">
        <div className=" py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-semibold text-[11px] tracking-wide "
            variant="default"
            size="sm"
            onClick={handleBack}>
            Back
          </Button>

          <Button
            className=" font-semibold text-[11px] tracking-wide "
            size="sm"
            onClick={handleClick}>
            Export Data
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default Users;
