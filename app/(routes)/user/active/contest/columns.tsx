"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { CgMoreO } from "react-icons/cg";

export type Contest = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  contestDate: string;
};

type ContestActionsProps = {
  contest: Contest; // Use the Contest type here
};
const ContestActions: React.FC<ContestActionsProps> = ({ contest }) => {
  const router = useRouter();
  const [isDisable, setIsDisable] = useState<boolean>();
  useEffect(() => {
    const currentDate = new Date();
    // Split the contest.endDate string and rearrange it into a valid format
    // Format is now "23/10/25 Thu 23:59" (DD/MM/YY Day HH:MM)
    const parts = contest.endDate.split(" "); // splits into ["23/10/25", "Thu", "23:59"]
    const dateParts = parts[0].split("/"); // splits "23/10/25" into ["23", "10", "25"]
    const timeParts = parts[2] ? parts[2].split(":") : ["23", "59"]; // splits "23:59" into ["23", "59"]
    
    const year = `20${dateParts[2]}`; // takes "25" and turns it into "2025"
    const month = dateParts[1]; // month is "10"
    const day = dateParts[0]; // day is "23"
    const hours = timeParts[0]; // hours is "23"
    const minutes = timeParts[1]; // minutes is "59"

    // Construct a new date string in ISO format
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:00`;

    // Convert formatted date string to Date object
    const contestEndDate = new Date(formattedDate);

    // Check if the current date is past the contest end date
    const isContestEnded = currentDate > contestEndDate;
    setIsDisable(isContestEnded);
  }, [contest.endDate]);
  const handleRegister = () => {
    console.log(isDisable);
    router.push(`/user/enrollstudents/${contest.id}`);
  };
  const handleView = () => {
    router.push(`/user/viewregistered/${contest.id}`);
  };

  return (
    <>
      <div className="hidden md:block">
        <div className="flex gap-2 ">
          <Button onClick={handleRegister}>Register Students</Button>
          <Button onClick={handleView}>View</Button>
        </div>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <CgMoreO className="text-[30px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="border-y-2 border-solid">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleRegister}>
              Register Students
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-y-2 border-solid"
              onClick={handleView}>
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <div className=" md:hidden">
        <div className="flex flex-wrap justify-between items-center gap-2 py-2 ">
          <Button className=" text-[11px]" size="sm" onClick={handleRegister}>
            Register Students
          </Button>
          <Button className="text-[11px]" size="sm" onClick={handleView}>
            View
          </Button>
        </div>
      </div>
    </>
  );
};

export const columns: ColumnDef<Contest>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "startDate",
    header: "Registration Start",
  },
  {
    accessorKey: "endDate",
    header: "Registration End",
  },
  {
    id: "actions",
    cell: ({ row }) => <ContestActions contest={row.original} />,
  },
];
