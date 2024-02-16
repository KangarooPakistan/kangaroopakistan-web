"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

const ViewRegistered = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const { onOpen } = useModal();
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState<string>();

  const params = useParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const session = await getSession();

        const response = await axios.get(
          `/api/users/getuserbyemail/${session?.user.email}`
        );
        
        const regId = await axios.get(
          `/api/users/contests/${params.id}/${response.data.schoolId}`
        );
        setRegistrationId(regId.data.id);
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations/${regId.data.id}`
        );

        setStudents(registeredStudents.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  }, []);
  const handleClick = () => {
    router.push(`/user/viewallrecipts/${registrationId}`);
  };
  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex justify-end">
          <Button className="mx-2" onClick={handleClick}>
            View All Proof of Payments
          </Button>
          <Button
            className="mx-2"
            onClick={() => onOpen("addImage", { registrationId })}
          >
            Add Proof of Payment
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          variant="ghost"
          className="text-xl font-bold leading-tight tracking-tight text-purple-600  md:text-3xl"
          onClick={() => onOpen("addImage", { registrationId })}
        >
          Attach Proof of Payment
        </Button>
      </div>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={students} />
      </div>
    </>
  );
};

export default ViewRegistered;
