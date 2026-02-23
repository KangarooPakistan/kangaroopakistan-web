"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export const LoginButton = () => {
  return (
    <Button variant="default" onClick={() => signIn()}>
      Sign in
    </Button>
  );
};

export const LogoutButton = () => {
  const handleLogout = () => {
    signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  return (
    <Button variant="default" onClick={handleLogout}>
      Sign Out
    </Button>
  );
};
