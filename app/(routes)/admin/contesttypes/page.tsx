"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import Skeleton from "@/app/components/Skeleton";
import { useRouter } from "next/navigation";
import { useRouter } from "next/navigation";

interface ContestType {
  id: string;
  contestName: string;
  imageUrl: string;
}
const Page = () => {
  const [contestTypes, setContestTypes] = useState<ContestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onOpen } = useModal();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios.get("/api/users/contesttype"); // Replace with your actual API route URL
        setContestTypes(response.data);
        setIsLoading(false);
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
      <section className="w-fit mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 justify-items-center justify-center gap-y-20 gap-x-6 mt-10 mb-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} />)
        ) : contestTypes?.length > 0 ? (
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
                  <Button className="py-2 px-3 bg-black text-white rounded-md">
                    Edit
                  </Button>
                  <Button className="py-2 px-3 bg-black text-white rounded-md ">
                    Add Contest
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p>No contest types found.</p>
          </div>
        )}
      </section>
    </>
  );
};

export default Page;
