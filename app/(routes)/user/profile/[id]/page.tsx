"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "@/app/components/Spinner";

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
  // Add other properties from your user data here
}

function UserProfile({ params }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null); // Initialize userData as null
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user profile data when the component mounts or when params.id changes
    axios
      .get(`/api/users/profile/${params.id}`)
      .then((response) => {
        setUserData(response.data as UserData); // Set the fetched data to state
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, [params.id]); // Include params.id as a dependency

  if (loading) {
    return <Spinner />;
  }

  if (!userData) {
    return <p>User not found.</p>;
  }

  // Render the user profile using the userData state variable
  return (
    <div>
      <div className="flex h-screen w-full justify-center mt-20">
        <div className="max-w-4xl">
          <div className="bg-white shadow-xl rounded-lg py-4 px-40">
            <div>
              <img
                className="w-32 h-32 rounded-full mx-auto"
                src="https://img.freepik.com/premium-vector/account-icon-user-icon-vector-graphics_292645-552.jpg?w=740"
                alt="profile"
              />
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
