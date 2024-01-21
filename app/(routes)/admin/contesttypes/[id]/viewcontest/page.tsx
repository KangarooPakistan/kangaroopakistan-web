"use client";
import { Contest, columns } from "./columns";
import { useParams } from "next/navigation";
import { DataTable } from "./data-table";
import axios from "axios";
import React, { useEffect, useState } from "react";

const ViewAllContests = () => {
  const [contests, setContests] = useState([]);
  const params = useParams();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const contestTypeId = params.id;
        await axios
          // .get(`/api/users/contests/active?contestTypeId=${contestTypeId}`) // show at user side
          .get(`/api/users/contests?contestTypeId=${contestTypeId}`) // show at admin side
          .then((resp) => {
            console.log(resp.data);
            setContests(resp.data);
          })
          .catch((err) => {
            console.log(err);
          });

        // setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={contests} />
    </div>
  );
};

export default ViewAllContests;