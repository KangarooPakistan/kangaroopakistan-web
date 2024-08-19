"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getSession } from "next-auth/react";
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
import { useModal } from "@/hooks/use-modal-store";
import { useEffect, useState } from "react";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Student = {
  id: number;
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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>();
  const { onOpen } = useModal();

  const handleEdit = () => {
    router.push(
      `/user/viewregistered/${student.registrationId}/${student.id}}`
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();

      setCurrentUserEmail(session?.user?.email);
    };
    fetchData();
  }, []);

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
        <DropdownMenuItem onClick={handleEdit}>Edit Student</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onOpen("deleteStudent", { id: student.id, currentUserEmail })
          }>
          Delete Student
        </DropdownMenuItem>
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
    id: "actions",
    cell: ({ row }) => <ContestActions student={row.original} />,
  },
];
