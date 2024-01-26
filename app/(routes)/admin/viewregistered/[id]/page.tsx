"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";

interface ItemType {
  students: Student[];
}

const ViewRegistered = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      try {
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations`
        );

        const data: ItemType[] = registeredStudents.data;

        const mappedStudents = data.map((item: ItemType) => {
          return item.students;
        });

        const flattenedStudents = mappedStudents.flat();
        setStudents(flattenedStudents);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetch();
  }, []);

  const handleClick = () => {
    router.push(`/user/viewallrecipts/${params.id}`);
  };
  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex justify-end">
          <Button className="mx-2"> View All Images</Button>
          <Button className="mx-2" onClick={handleClick}>
            Add Image
          </Button>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={students} />
      </div>
    </>
  );
};

export default ViewRegistered;
