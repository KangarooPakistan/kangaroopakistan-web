"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "@/app/components/Spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UserProfileProps {
  params: {
    id: number;
  };
}

interface UserData {
  // name: string;
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
  // Add other properties from your user data here
}

function UserProfile({ params }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null); // Initialize userData as null
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch user profile data when the component mounts or when params.id changes
    axios
      .get(`/api/users/profile/${params.id}`)
      .then((response) => {
        console.log(response.data);
        setUserData(response.data as UserData); // Set the fetched data to state
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, [params.id]); // Include params.id as a dependency

  const handleClick = () => {
    router.push(`/user/editprofile/${params.id}`);
  };
  if (loading) {
    return <Spinner />;
  }

  if (!userData) {
    return <p>User not found.</p>;
  }

  // Render the user profile using the userData state variable
  return (
    <div className="flex  w-full justify-center mt-10 mb-10">
      <div className="max-w-4xl">
        <div className="bg-white shadow-xl rounded-lg py-4 px-40">
          <div>
            <img
              className="w-32 h-32 rounded-full mx-auto"
              src="https://img.freepik.com/premium-vector/account-icon-user-icon-vector-graphics_292645-552.jpg?w=740"
              alt="profile"
            />
            <Button onClick={handleClick}>Edit Profile</Button>
          </div>

          <div>
            <h3 className="text-center text-xl text-gray-900 font-medium leading-8">
              User Profile
            </h3>
            <div className="text-center text-gray-400 text-xs font-semibold">
              <p>{userData.role}</p>
            </div>
            <table className="text-xs my-3">
              <tbody>
                <tr>
                  <td colSpan={2} className="text-xl font-bold text-center">
                    School Details
                  </td>
                </tr>
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
                  <td className="px-2 py-2 text-gray-500 font-semibold">Fax</td>
                  <td className="px-2 py-2">{userData.fax}</td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="text-xl font-bold text-center my-7"
                  >
                    Principal Details
                  </td>
                </tr>
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
                  <td
                    colSpan={2}
                    className="text-xl font-bold text-center my-7"
                  >
                    Coordinator Details
                  </td>
                </tr>
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
                    Coordinator Account Details
                  </td>
                  <td className="px-2 py-2">{userData.c_accountDetails}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
