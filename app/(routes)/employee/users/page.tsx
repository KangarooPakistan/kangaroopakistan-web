"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  fax: string;
  bankTitle: string | null;
  p_fName: string | null;
  p_mName: string | null;
  p_lName: string | null;
  p_contact: string | null;
  p_phone: string | null;
  p_email: string | null;
  c_fName: string | null;
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
        const response = await axios.get("/api/users/allusers");
        console.log(response); // Replace with your actual API route URL
        setUsers(response.data);
        console.log(response.data);
        const usersForExcel = response.data.map((user: User) => ({
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
          schoolName: user.schoolName, // Optional: only for non-admin users
          contactNumber: user.contactNumber,
          schoolAddress: user.schoolAddress,
          district: user.district,
          tehsil: user.tehsil,
          fax: user.fax,
          bankTitle: user.bankTitle,
          p_fName: user.p_fName,
          p_mName: user.p_mName,
          p_lName: user.p_lName,
          p_contact: user.p_contact,
          p_phone: user.p_phone,
          p_email: user.p_email,
          c_fName: user.c_fName,
          c_mName: user.c_mName,
          c_lName: user.c_lName,
          c_contact: user.c_contact,
          c_phone: user.c_phone,
          c_email: user.c_email,
          c_accountDetails: user.c_accountDetails,
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
      <div className="p-4 flex justify-between border-gray-300">
        <Button variant="default" onClick={handleBack}>
          Back
        </Button>
        <div>
          <Button className="mr-2" onClick={handleClick}>
            Export Data
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default Users;
