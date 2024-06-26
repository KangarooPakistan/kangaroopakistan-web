"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { DataTable } from "./data-table";
import { Contest, columns } from "./columns";
import { Button } from "@/components/ui/button";

const ViewAllContests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const contestTypeId = params.id;
        const resp = await axios.get<Contest[]>(`/api/users/contests/active`);
        console.log("resp");
        console.log(resp);
        console.log("resp");
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
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="container mx-auto py-10">
      <Button variant="default" onClick={handleBack}>
        Back
      </Button>
      <DataTable columns={columns} data={contests} />
    </div>
  );
};

export default ViewAllContests;
