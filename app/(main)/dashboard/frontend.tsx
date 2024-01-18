"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import axios from "axios";

const Frontend = () => {
  const router = useRouter();
  const { onOpen } = useModal();
  const [contestTypes, setContestTypes] = useState([]);

  const handleClick = () => {
    router.push("/admin/register");
  };
  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios
          .get("/api/users/contesttype")
          .then((response) => {
            console.log(response);
            setContestTypes(response.data);
          })
          .catch((error) => {
            console.log(error);
          }); // Replace with your actual API route URL
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, []);
  return (
    <div>
      <Button variant="destructive" onClick={handleClick}>
        Register
      </Button>
      <Button variant="ghost" onClick={() => onOpen("createContest")}>
        Create Contest Type
      </Button>
    </div>
  );
};

export default Frontend;
