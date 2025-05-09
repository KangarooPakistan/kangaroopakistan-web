"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { CgMoreO } from "react-icons/cg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// Define the type based on the contest results JSON
export interface ContestResult {
  id: string;
  scoreId: string;
  contestId: string;
  schoolId: number;
  district: string;
  class: number;
  level: string;
  AwardLevel: string;
  rollNumber: string;
  percentage: number;
  createdAt: string;
  updatedAt: string;
  score: {
    rollNo: string;
    percentage: number;
  };
}

// Actions Component for each row
const ContestResultActions: React.FC<{ result: ContestResult }> = ({
  result,
}) => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = async () => {
    // Navigate to a detailed view for the specific result
    router.push(
      `/employee/results/${result.contestId}/studentResult/${result.id}`
    );
  };

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
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
              onClick={handleViewDetails}
              disabled={isLoading}>
              {isLoading ? "Loading..." : "Update Student Result"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex flex-wrap gap-2 py-2">
        <Button
          className="text-[11px]"
          size="sm"
          onClick={handleViewDetails}
          disabled={isLoading}>
          {isLoading ? "Loading..." : "Update Student Result"}
        </Button>
      </div>
    </>
  );
};

// Columns definition
export const columns: ColumnDef<ContestResult>[] = [
  {
    accessorKey: "rollNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Roll Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.rollNumber,
  },
  {
    accessorKey: "class",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Class
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "level",
    header: "Level",
    filterFn: "equals",
  },
  {
    accessorKey: "AwardLevel",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Award Level
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original.AwardLevel,
  },
  {
    accessorKey: "percentage",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Percentage
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => `${row.original.percentage}%`,
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    id: "actions",
    cell: ({ row }) => <ContestResultActions result={row.original} />,
  },
];
