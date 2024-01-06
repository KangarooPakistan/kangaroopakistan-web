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
  return (
    <Button variant="default" onClick={() => signOut()}>
      Sign Out
    </Button>
  );
};
