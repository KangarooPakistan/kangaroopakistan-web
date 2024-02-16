"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import axios from "axios";
import { getSession } from "next-auth/react";

interface UserData {
  email: string;
  role: string;
  schoolId: number;
  schoolName: string;
  contactNumber: string;
  schoolAddress: string;
  district: string;
  tehsil: string;
  fax: string;
  p_fName: string;
  p_mName: string;
  p_lName: string;
  p_contact: string;
  p_phone: string;
  p_email: string;
  c_fName: string;
  c_mName: string;
  c_lName: string;
  c_contact: string;
  c_phone: string;
  c_email: string;
  c_accountDetails: string;
}

const Frontend = () => {
  const router = useRouter();

  const { onOpen } = useModal();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mySession, setMySession] = useState<string | null>();
  const [role, setRole] = useState<string | null>();

  const [contestTypes, setContestTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      setMySession(session?.user.id);
      setRole(session?.user.role);
      axios
        .get(`/api/users/profile/${session?.user.id}`)
        .then((response) => {
          setUserData(response.data as UserData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
    };
    fetchData();
  }, []);
  const handleProfile = () => {
    

    if (mySession && role === "User") {
      router.push(`/user/profile/${mySession}`);
    }
    if (mySession && role === "Admin") {
      router.push(`/admin/profile/${mySession}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {userData?.schoolName}
          </h2>
          <div className="mt-4">
            <p className="text-gray-700">{userData?.email}</p>
            <p className="text-gray-700">{userData?.contactNumber}</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-300">
          <Button className="" onClick={handleProfile}>
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Frontend;
