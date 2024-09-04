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
import { useRouter } from "next/navigation";
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
  const { onOpen } = useModal();

  const handleView = () => {
    router.push(`/admin/userprofile/${user.id}`);
  };
  const handleEdit = () => {
    router.push(`/admin/user/editprofile/${user.id}`);
  };

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleView}>
              View School{" "}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              Edit School{" "}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onOpen("deleteSchool", { id: user.id })}>
              Delete School
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="md:hidden flex flex-wrap justify-between items-center gap-2">
        <Button
          size="sm"
          className=" font-medium text-[11px]  tracking-wide"
          onClick={handleView}>
          View School{" "}
        </Button>
        <Button
          className=" font-medium text-[11px]  tracking-wide"
          onClick={handleEdit}>
          Edit School{" "}
        </Button>
        <Button
          className=" font-medium text-[11px]  tracking-wide"
          onClick={() => onOpen("deleteSchool", { id: user.id })}>
          Delete School
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
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
