"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Tabs from "../../../../../app/components/Tabs";

interface UserProfileProps {
  params: {
    id: number;
  };
}

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

function UserProfile({ params }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(1);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`/api/users/profile/${params.id}`)
      .then((response) => {
        console.log(response.data);
        setUserData(response.data as UserData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, [params.id]);

  const handleClick = () => {
    router.push(`/user/editprofile/${params.id}`);
  };

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return <Spinner />;
  }

  if (!userData) {
    return <p>User not found.</p>;
  }

  const tabs = [
    { id: 1, label: "School Details" },
    { id: 2, label: "Principal Details" },
    { id: 3, label: "Coordinator Details" },
  ];

  return (
    <div className="flex w-full justify-center mt-10 mb-10">
      <div className="max-w-4xl">
        <div className="bg-white shadow-xl rounded-lg py-4 px-40 mt-4">
          <div className="flex">
            <img
              className="w-28 h-28 rounded-full"
              src="https://img.freepik.com/premium-vector/account-icon-user-icon-vector-graphics_292645-552.jpg?w=740"
              alt="profile"
            />
            <div className="flex mt-7">
              <div>
                <h3 className="text-lg text-gray-900 font-medium leading-8">
                  Profile
                </h3>
                <p className="text-gray-400 text-xs font-semibold">
                  {userData.role}
                </p>
              </div>
              <Button
                onClick={handleClick}
                className="ml-20 text-xs rounded-full"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
          <div>
            {activeTab === 1 && (
              <table className="text-xs my-3">
                <tbody>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Email
                    </td>
                    <td className="px-2 py-2">{userData.email}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      School ID
                    </td>
                    <td className="px-2 py-2">{userData.schoolId}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      School Name
                    </td>
                    <td className="px-2 py-2">{userData.schoolName}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Contact Number
                    </td>
                    <td className="px-2 py-2">{userData.contactNumber}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      School Address
                    </td>
                    <td className="px-2 py-2">{userData.schoolAddress}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      District
                    </td>
                    <td className="px-2 py-2">{userData.district}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Tehsil
                    </td>
                    <td className="px-2 py-2">{userData.tehsil}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Fax
                    </td>
                    <td className="px-2 py-2">{userData.fax}</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 2 && (
              <table className="text-xs my-3">
                <tbody>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Principal Name
                    </td>
                    <td className="px-2 py-2">
                      {userData.p_fName} {userData.p_mName} {userData.p_lName}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Principal Email
                    </td>
                    <td className="px-2 py-2">{userData.p_email}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Principal Phone
                    </td>
                    <td className="px-2 py-2">{userData.p_phone}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Principal Cell #
                    </td>
                    <td className="px-2 py-2">{userData.p_contact}</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 3 && (
              <table className="text-xs my-3">
                <tbody>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Coordinator Name
                    </td>
                    <td className="px-2 py-2">
                      {userData.c_fName} {userData.c_mName} {userData.c_lName}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Coordinator Email
                    </td>
                    <td className="px-2 py-2">{userData.c_email}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Coordinator Phone
                    </td>
                    <td className="px-2 py-2">{userData.c_phone}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Coordinator Cell #
                    </td>
                    <td className="px-2 py-2">{userData.c_contact}</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 text-gray-500 font-semibold">
                      Coordinator Account Details
                    </td>
                    <td className="px-2 py-2">{userData.c_accountDetails}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
