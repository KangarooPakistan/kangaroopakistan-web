"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ContestType {
  id: string;
  contestName: string;
  imageUrl: string;
}
const Page = () => {
  const [contestTypes, setContestTypes] = useState<ContestType[]>([]);

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios.get("/api/users/contesttype"); // Replace with your actual API route URL
        console.log(response);
        setContestTypes(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, []);

  return (
    <div>
      {contestTypes?.length > 0 &&
        contestTypes.map((contestType) => (
          <Card key={contestType.id}>
            <CardHeader>
              <CardTitle>{contestType.contestName}</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={contestType.imageUrl}
                alt=""
                className="w-[72px] h-[72px ]"
              />
            </CardContent>
            <CardFooter>
              <Button>Edit</Button>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
};

export default Page;
