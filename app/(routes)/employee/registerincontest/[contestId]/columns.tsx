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
import { CgMoreO } from "react-icons/cg";
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
      `/employee/enrollstudents/${params.contestId}/byschool/${user.schoolId}`
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
              onClick={handleRegister}
              className="border-y-2 border-solid">
              Register Students{" "}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex flex-wrap justify-between items-center gap-2 ">
        <Button
          className=" font-medium text-[11px]  tracking-wide"
          onClick={handleRegister}>
          Register Students
        </Button>
      </div>
    </>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },

  {
    accessorKey: "schoolId",
    filterFn: "equals",
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
    accessorKey: "schoolName",
    header: "SchoolName",
  },
  {
    accessorKey: "contactNumber",
    header: "contactNumber",
  },
  {
    accessorKey: "actions",
    id: "actions",
    cell: ({ row }) => <RoleActions user={row.original} />,
  },
];
