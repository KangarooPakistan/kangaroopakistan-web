"use client";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

const Dashboard = () => {
  //   const { data: session, status } = useSession();
  const handleLogout = () => {
    signOut();
  };
  return (
    <div>
      {/* Hi {session?.user?.email} */}
      <Button variant="default" onClick={handleLogout}>
        Sign Out
      </Button>
    </div>
  );
};

export default Dashboard;
