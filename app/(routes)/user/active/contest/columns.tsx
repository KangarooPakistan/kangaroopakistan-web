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
  const handleView = () => {
    router.push(`/admin/viewregistered/${contest.id}`);
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
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
