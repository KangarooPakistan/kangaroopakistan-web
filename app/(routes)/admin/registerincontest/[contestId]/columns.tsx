"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
export type User = {
  id: number;
  email: string;
  role: string;
  schoolId: number;
  schoolName: string; // Optional: only for non-admin users
  contactNumber: string;
};
type UserActionsProps = {
  user: User; // Use the Student type here
};

const RoleActions: React.FC<UserActionsProps> = ({ user }) => {
  const router = useRouter();
  const params = useParams();
  const { onOpen } = useModal();

  const handleRegister = () => {
    router.push(
      `/admin/enrollstudents/${params.contestId}/byschool/${user.schoolId}`
    );
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
        <DropdownMenuItem onClick={handleRegister}>
          Register Students{" "}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },

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
    header: "SchoolName",
  },
  {
    accessorKey: "contactNumber",
    header: "contactNumber",
  },
  {
    id: "actions",
    cell: ({ row }) => <RoleActions user={row.original} />,
  },
];
