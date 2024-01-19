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
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation";
import { useRouter } from "next/navigation";

interface ContestType {
  id: string;
  contestName: string;
  imageUrl: string;
}
const Page = () => {
  const [contestTypes, setContestTypes] = useState<ContestType[]>([]);
  const router = useRouter();

  const { onOpen } = useModal();

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
  }, [contestTypes]);

  const handleCardClick = (contestTypeId: string) => {
    // Navigate to the desired page with the contestTypeId as a parameter
    router.push(`/admin/createcontest/${contestTypeId}`);
  };
  return (
    <>
      <div className="flex justify-end mr-16">
        <Button variant="default" onClick={() => onOpen("createContest")}>
          Create Contest Type
        </Button>
      </div>
      <section className="w-fit mx-auto grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 justify-items-center justify-center gap-y-20 gap-x-6 mt-10 mb-5">
        {contestTypes?.length > 0 &&
          contestTypes.map((contestType) => (
            <div
              className="w-64 bg-white shadow-xl rounded-xl duration-500 hover:scale-105 hover:shadow-2xl"
              key={contestType.id}
            >
              <img
                src={contestType.imageUrl}
                alt="contest image"
                className="h-72 w-64 object-cover rounded-t-xl"
              />
              <div className="px-4 py-3 w-64">
                <p className="text-lg font-bold text-black truncate block capitalize">
                  {contestType.contestName}
                </p>
                <div className="flex items-center mt-3 justify-between">
                  <button className="py-2 px-3 bg-black text-white rounded-md">
                    Edit
                  </button>
                  <button
                    className="py-2 px-3 bg-black text-white rounded-md"
                    onClick={() => handleCardClick(contestType.id)}
                  >
                    Add Contest
                  </button>
                </div>
              </div>
            </div>
          ))}
      </section>
    </>
  );
};

export default Page;
