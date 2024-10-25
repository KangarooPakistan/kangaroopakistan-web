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
import axios from "axios";
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import SchoolAwardsPdf from "./SchoolAwardsPdf/SchoolAwardsPdf";

// Types
export interface SchoolResultPdf {
  AwardLevel: string;
  class: string;
  contactId: string;
  district: string;
  fatherName: string;
  id: string;
  percentage: string;
  rollNumber: string;
  schoolDetails: {
    schoolName: string | null;
    schoolAddress: string | null;
    contactNumber: string | null;
  };
  score: {
    score: string;
    total: string;
  };
  studentName: string;
}

type AwardLevel =
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "THREE_STAR"
  | "TWO_STAR"
  | "ONE_STAR"
  | "PARTICIPATION";

export interface AwardCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
  THREE_STAR: number;
  TWO_STAR: number;
  ONE_STAR: number;
  PARTICIPATION: number;
  total: number;
}

export interface SchoolResultsWithStats {
  results: SchoolResultPdf[];
  statistics: AwardCounts;
}

type Results = {
  id: number;
  schoolId: number;
};

type SchoolResultsProp = {
  schoolResult: Results;
};

// Helper Functions
function countStudentsByAward(students: SchoolResultPdf[]): AwardCounts {
  // Return default counts if students array is undefined or empty
  if (!students || students.length === 0) {
    return {
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0,
      THREE_STAR: 0,
      TWO_STAR: 0,
      ONE_STAR: 0,
      PARTICIPATION: 0,
      total: 0,
    };
  }

  const initialCounts: AwardCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
    THREE_STAR: 0,
    TWO_STAR: 0,
    ONE_STAR: 0,
    PARTICIPATION: 0,
    total: 0,
  };

  return students.reduce((acc, student) => {
    console.log(student);
    if (!student.AwardLevel) return acc;

    // Convert award level to uppercase and remove spaces for consistency
    const awardLevel = student.AwardLevel.toUpperCase().replace(
      /\s+/g,
      "_"
    ) as AwardLevel;

    // Increment the specific award count if it exists in our accumulator
    console.log("awardLevel");
    console.log(awardLevel);
    if (awardLevel in acc) {
      acc[awardLevel]++;
    }

    // Increment total count
    acc.total++;

    return acc;
  }, initialCounts);
}

function convertToBigIntOrNumber(value: string | null | undefined) {
  if (!value) return 0;

  try {
    if (value.includes(".")) {
      return parseFloat(value);
    }

    const bigIntValue = BigInt(value);
    return bigIntValue <= Number.MAX_SAFE_INTEGER
      ? Number(bigIntValue)
      : bigIntValue;
  } catch (error) {
    console.error("Failed to convert value:", error);
    return 0;
  }
}

// Components
const SchoolResultsActions: React.FC<SchoolResultsProp> = ({
  schoolResult,
}) => {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  async function generatePdfBlob(data: SchoolResultsWithStats) {
    try {
      // Validate data before passing to PDF component
      if (!data || (!data.results && !data.statistics)) {
        throw new Error("Invalid data structure for PDF generation");
      }

      const doc = <SchoolAwardsPdf data={data} />;
      const asPdf = pdf(doc);
      return await asPdf.toBlob();
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  // Usage in your component:
  const handleView = async () => {
    if (!schoolResult.schoolId) {
      console.error("No school ID provided");
      return;
    }

    setIsLoading(true);
    try {
      const schoolResultResp = await axios.get(
        `/api/results/getbyschools/${schoolResult.schoolId}/${params.contestId}`
      );

      if (!schoolResultResp.data) {
        throw new Error("No data received from server");
      }

      const convertedData = schoolResultResp.data?.map((item: any) => ({
        ...item,
        scoreId: convertToBigIntOrNumber(item.scoreId),
        percentage: parseFloat(item.percentage || "0"),
      }));
      console.log(convertedData);

      const statistics = countStudentsByAward(convertedData);
      console.log("statistics");
      console.log(statistics);
      const dataWithStats = {
        results: convertedData,
        statistics: statistics,
      };

      console.log(statistics);
      console.log(dataWithStats);

      const blob = await generatePdfBlob(dataWithStats);
      saveAs(blob, `School_${schoolResult.schoolId}_Results.pdf`);
    } catch (error) {
      console.error("Error processing school result:", error);
      // Show error to user here
    } finally {
      setIsLoading(false);
    }
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
              onClick={handleView}
              disabled={isLoading}>
              {isLoading ? "Downloading..." : "Download School Result"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex flex-wrap gap-2 py-2">
        <Button
          className="text-[11px]"
          size="sm"
          onClick={handleView}
          disabled={isLoading}>
          {isLoading ? "Downloading..." : "Download School Result"}
        </Button>
      </div>
    </>
  );
};

export const columns: ColumnDef<Results>[] = [
  {
    accessorKey: "schoolId",
    filterFn: "equals",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        SchoolId
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    accessorKey: "resultCount",
    header: "Total Results",
  },
  {
    accessorKey: "schoolName",
    header: "School Name",
  },
  {
    id: "actions",
    cell: ({ row }) => <SchoolResultsActions schoolResult={row.original} />,
  },
];
