"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Student = {
  registrationId: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  class: string;
  level: string;
};
type StudentActionsProps = {
  student: Student; // Use the Student type here
};
const ContestActions: React.FC<StudentActionsProps> = ({ student }) => {
  const router = useRouter();
  const handleView = () => {
    router.push(`/admin/viewallrecipts/${student.registrationId}`);
  };

  const handleEdit = () => {};
  return (
    <>
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleView}>View</Button>
    </>
  );
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "schoolId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          SchoolId
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "rollNumber",
    header: "Roll Number",
  },
  {
    accessorKey: "studentName",
    header: "Student Name",
  },
  {
    accessorKey: "fatherName",
    header: "Father Name",
  },
  {
    accessorKey: "class",
    header: "Class",
  },
  {
    accessorKey: "level",
    header: "Level",
  },
  {
    accessorKey: "actions",

    id: "actions",
    cell: ({ row }) => <ContestActions student={row.original} />,
  },
];
