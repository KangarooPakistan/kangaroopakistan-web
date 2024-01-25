"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";

interface ItemType {
  // Define the properties of the item
  students: Student[];
  // ... other properties if applicable
}

const ViewRegistered = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const params = useParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations`
        );

        // Assuming registeredStudents.data is an array
        const data: ItemType[] = registeredStudents.data;
        // console.log(data);
        // Map through the array and update the state
        const mappedStudents = data.map((item: ItemType) => {
          // Assuming item.students is an array of students
          return item.students;
        });

        // Flatten the array if needed
        const flattenedStudents = mappedStudents.flat();

        // Set the students state
        setStudents(flattenedStudents);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetch();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={students} />
    </div>
  );
};

export default ViewRegistered;
