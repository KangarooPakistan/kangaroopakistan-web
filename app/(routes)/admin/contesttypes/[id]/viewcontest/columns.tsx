"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from "next/navigation";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
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
  const params = useParams();
  const handleView = () => {
    console.log("called");
    router.push(`/admin/viewregistered/${contest.id}`);
  };

  const handleAllRegistrationsView = () => {
    console.log("called");
    router.push(`/admin/fetchallregistration/${contest.id}`);
  };
  const handleEdit = () => {
    router.push(`/admin/contesttypes/${params.id}/updatecontest/${contest.id}`);
  };

  return (
    <div className="flex justify-around ">
      <Button onClick={handleEdit}>Edit</Button>
      <Button onClick={handleAllRegistrationsView}>View</Button>
    </div>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button variant="ghost" className="h-8 w-8 p-0">
    //       <span className="sr-only">Open menu</span>
    //       <MoreHorizontal className="h-4 w-4" />
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //     <DropdownMenuItem>Edit</DropdownMenuItem>
    //     <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
    //     <DropdownMenuItem onClick={handleAllRegistrationsView}>
    //       View By Schools
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
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
