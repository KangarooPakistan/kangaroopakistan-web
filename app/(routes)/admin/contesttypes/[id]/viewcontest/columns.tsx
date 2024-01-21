"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Contest = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  contestDate: string;
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
];
