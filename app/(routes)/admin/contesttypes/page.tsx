"use client";

import Image from "next/image";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import Skeleton from "@/app/components/Skeleton";
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
  const router = useRouter();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios.get("/api/users/contesttype"); // Replace with your actual API route URL
        console.log(response.data);
        setContestTypes(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, []);

  const handleCardClick = (contestTypeId: string) => {
    router.push(`/admin/contesttypes/${contestTypeId}/createcontest`);
  };
  const handleViewClick = (contestTypeId: string) => {
    router.push(`/admin/contesttypes/${contestTypeId}/viewcontest`);
  };

  return (
    <>
      <div className="flex justify-end mr-16">
        <Button variant="default" onClick={() => onOpen("createContest")}>
          Create Contest Type
        </Button>
      </div>
      <section className="w-fit mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-y-20 gap-x-5 mt-10 mb-5">
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
                className="h-52 w-64 object-cover rounded-t-xl"
              />
              <div className="px-4 py-3 w-64">
                <button className="bg-green-500 text-white rounded-xl text-smallest py-1 px-4 mb-2">
                  View
                </button>
                <p className="text-lg font-medium text-black truncate block capitalize">
                  {contestType.contestName}
                </p>
                <div className="flex items-center mt-3 justify-between w-full">
                  <Button
                    className="px-5 py-2 bg-black text-white rounded-xl mr-2 text-xs"
                    onClick={() => {
                      handleViewClick(contestType.id);
                    }}
                  >
                    View Contest
                  </Button>
                  <Button
                    className="px-5 py-2 bg-black text-white rounded-xl text-xs"
                    onClick={() => {
                      handleCardClick(contestType.id);
                    }}
                  >
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
