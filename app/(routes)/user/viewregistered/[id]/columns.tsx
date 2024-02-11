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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
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
    console.log(student);
    router.push(`/user/viewallrecipts/${student.registrationId}`);

    // router.push(`/admin/viewregistered/${student.registrationId}`);
  };
  const handleAllRegistrationsView = () => {
    console.log(student.registrationId);
    // router.push(`/admin/fetchallregistration/`);
  };
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
        <DropdownMenuItem onClick={handleView}>Edit Student</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Student>[] = [
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
    header: "Father Number",
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
    id: "actions",
    cell: ({ row }) => <ContestActions student={row.original} />,
  },
];
