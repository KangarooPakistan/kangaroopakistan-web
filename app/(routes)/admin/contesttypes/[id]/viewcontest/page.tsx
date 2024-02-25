"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { DataTable } from "./data-table";
import { Contest, columns } from "./columns";

const ViewAllContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const params = useParams();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const contestTypeId = params.id;
        const resp = await axios.get<Contest[]>(
          `/api/users/contests?contestTypeId=${contestTypeId}`
        );
        const parsedContests = resp.data.map((contest) => {
          const startDate = new Date(contest.startDate);
          const endDate = new Date(contest.endDate);

          // Format start date as DD/MM/YY Day
          const formattedStartDate = formatDate(startDate);

          // Format end date as DD/MM/YY Day
          const formattedEndDate = formatDate(endDate);

          return {
            ...contest,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
          };
        });
        setContests(parsedContests);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, [params.id]);

  // Helper function to format date as DD/MM/YY Day
  const formatDate = (date: Date): string => {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date
      .getFullYear()
      .toString()
      .slice(2)} ${new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date)}`;
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        All Contests
      </h1>
      <DataTable columns={columns} data={contests} />
    </div>
  );
};

export default ViewAllContests;
