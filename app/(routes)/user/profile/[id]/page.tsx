"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface UserProfileProps {
  params: {
    id: number;
  };
}

interface UserData {
  // name: string;
  email: string;
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
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>User not found.</p>;
  }

  // Render the user profile using the userData state variable
  return (
    <div>
      <h1>User Profile</h1>
      {/* <p>Name: {userData.name}</p> */}
      <p>Email: {userData.email}</p>
      {/* Render other user profile information */}
    </div>
  );
}

export default UserProfile;
