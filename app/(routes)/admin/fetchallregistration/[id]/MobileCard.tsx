// components/MobileCard.tsx
import React from "react";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { BiSolidXCircle } from "react-icons/bi";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

interface MobileCardProps<T> {
  data: T;
  columns: { accessorKey: string; header: string }[];
  actionColumn?: ColumnDef<T, any>;
}

function renderValue(value: any): React.ReactNode {
  console.log(value);
  if (Array.isArray(value)) {
    console.log(value.length);

    if (value.length === 0) {
      return (
        <IoCheckmarkDoneCircle className="text-[30px] mx-auto text-center" />
      );
    } else
      return <BiSolidXCircle className="text-[30px] mx-auto text-center" />;
  }
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function MobileCard<T>({
  data,
  columns,
  actionColumn,
}: MobileCardProps<T>) {
  console.log(actionColumn);
  return (
    <div className="bg-slate-200 shadow rounded-lg p-4 mb-4">
      {columns.map((column) => (
        <div
          key={column.accessorKey}
          className="mb-2 flex items-start break-words">
          <span className="font-bold text-[14px] mr-1 ">
            {column.accessorKey}:{" "}
          </span>
          <span className="text-[14px]  uppercase text-balance break-words">
            {renderValue((data as any)[column.accessorKey])}
          </span>
        </div>
      ))}
      {actionColumn && (
        <div className="mt-4">
          {/* <span className="font-bold">Actions: </span> */}
          <div className="mt-2">{renderActionCell(actionColumn, data)}</div>
        </div>
      )}
    </div>
  );
}

function renderActionCell<T>(actionColumn: ColumnDef<T, any>, data: T) {
  if (typeof actionColumn.cell === "function") {
    console.log("harmeenmariam");
    return actionColumn.cell({ row: { original: data } } as CellContext<
      T,
      any
    >);
  } else if (React.isValidElement(actionColumn.cell)) {
    return actionColumn.cell;
  } else {
    return String(actionColumn.cell);
  }
}
