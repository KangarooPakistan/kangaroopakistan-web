"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { User, columns } from "./columns";
import { DataTable } from "./data-table";

const Users = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios.get("/api/users/allusers"); // Replace with your actual API route URL
        setUsers(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, []);
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={users} />
    </div>
  );
};

export default Users;
