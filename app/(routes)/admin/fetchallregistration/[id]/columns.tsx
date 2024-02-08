"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import axios from "axios";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Registration = {
  id: string;
  schoolId: number;
  schoolName: string;
  studentsLength: number;
  email: string;
};

type RegistrationProps = {
  registration: Registration; // Use the Contest type here
};
const RegistrationActions: React.FC<RegistrationProps> = ({ registration }) => {
  const router = useRouter();
  const handleView = () => {
    console.log(registration);
    router.push(`/admin/viewallbyschool/${registration.id}`);
  };
  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(
        `/api/users/pdfdownload/${registration.id}`,
        {
          responseType: "blob", // Important for handling binary data like PDF
        }
      );

      const pdfData = response.data;
      // Create a blob URL for the PDF data
      const pdfUrl = URL.createObjectURL(pdfData);
      // Open the PDF in a new tab/window or download it
      window.open(pdfUrl);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
      // Handle specific error cases as needed
    }
  };

  // console.log("registeredStudents");
  // console.log(registeredStudents);
  // router.push(`/admin/fetchallregistration/${contest.id}`);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPdf}>
          Download Pdf
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export const columns: ColumnDef<Registration>[] = [
  {
    accessorKey: "schoolId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SchoolId
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "schoolName",
    header: "schoolName",
  },
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "studentsLength",
    header: "Total Students",
  },
  {
    id: "actions",
    cell: ({ row }) => <RegistrationActions registration={row.original} />,
  },
];
