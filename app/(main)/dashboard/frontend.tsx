"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";

const Frontend = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/admin/register");
  };
  return (
    <div>
      <Button variant="destructive" onClick={handleClick}>
        Register
      </Button>
    </div>
  );
};

export default Frontend;
