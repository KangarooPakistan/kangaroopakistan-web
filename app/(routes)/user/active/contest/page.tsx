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

          // Format end date as DD/MM/YY Day HH:MM
          const formattedEndDate = formatDateWithTime(endDate);

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

  // Helper function to format date with time as DD/MM/YY Day HH:MM (in Pakistan timezone)
  const formatDateWithTime = (date: Date): string => {
    // Convert to Pakistan timezone (UTC+5)
    const pakistanTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    const hours = pakistanTime.getHours().toString().padStart(2, "0");
    const minutes = pakistanTime.getMinutes().toString().padStart(2, "0");
    return `${pakistanTime.getDate().toString().padStart(2, "0")}/${(
      pakistanTime.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${pakistanTime
      .getFullYear()
      .toString()
      .slice(2)} ${new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "Asia/Karachi"
    }).format(date)} ${hours}:${minutes}`;
  };
  const handleBack = () => {
    router.back();
  };
  return (
    <div className="container mx-auto py-10">
      <div className="hidden md:block">
        <div className="py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
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
        <div className="py-2 md:py-4 flex flex-wrap justify-between gap-2  items-center border-gray-300">
          <Button
            className=" font-medium text-[11px]  tracking-wide"
            variant="default"
            size="sm"
            onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={contests} />
    </div>
  );
};

export default ViewAllContests;
