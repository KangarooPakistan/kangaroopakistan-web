"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import Skeleton from "@/app/components/Skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ContestType {
  id: string;
  contestName: string;
  imageUrl: string;
}
const ContestTypesPage = () => {
  const [contestTypes, setContestTypes] = useState<ContestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { onOpen } = useModal();
  const router = useRouter();

  const { data: session, status } = useSession();

  console.log("session");
  console.log(status);
  console.log("session");
  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const response = await axios.get("/api/users/contesttype"); // Replace with your actual API route URL
        
        // Sort contest types: IKMC/Mathematics first, then IKSC/Science, then IKLC/Linguistic
        const sortedContestTypes = response.data.sort((a: ContestType, b: ContestType) => {
          const aName = a.contestName.toLowerCase();
          const bName = b.contestName.toLowerCase();
          
          // Check for IKMC or Mathematics
          const aIsMath = aName.includes('ikmc') || aName.includes('mathematics');
          const bIsMath = bName.includes('ikmc') || bName.includes('mathematics');
          
          // Check for IKSC or Science
          const aIsScience = aName.includes('iksc') || aName.includes('science');
          const bIsScience = bName.includes('iksc') || bName.includes('science');
          
          // Check for IKLC or Linguistic
          const aIsLinguistic = aName.includes('iklc') || aName.includes('linguistic');
          const bIsLinguistic = bName.includes('iklc') || bName.includes('linguistic');
          
          // Priority order: Math (1), Science (2), Linguistic (3), Others (4)
          const getPriority = (isMath: boolean, isScience: boolean, isLinguistic: boolean) => {
            if (isMath) return 1;
            if (isScience) return 2;
            if (isLinguistic) return 3;
            return 4;
          };
          
          const aPriority = getPriority(aIsMath, aIsScience, aIsLinguistic);
          const bPriority = getPriority(bIsMath, bIsScience, bIsLinguistic);
          
          return aPriority - bPriority;
        });
        
        setContestTypes(sortedContestTypes);
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
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        Contest Types
      </h1>
      <div className="flex justify-end mr-16 mt-2">
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
              key={contestType.id}>
              <Image
                src={contestType.imageUrl}
                alt="contest image"
                width={256}
                height={256}
                className="h-64 w-64 object-cover rounded-t-xl"
              />
              <div className="px-2 py-3 w-64">
                <button className="bg-green-500 text-white rounded-xl text-smallest py-1 px-4 mb-2">
                  View
                </button>
                <p className="text-lg font-medium text-black truncate block capitalize">
                  {contestType.contestName}
                </p>
                <div className="flex items-center mt-3 justify-between w-full">
                  <Button
                    className="px-5 py-2  rounded-xl mr-2 text-xs"
                    onClick={() => {
                      handleViewClick(contestType.id);
                    }}>
                    View Contest
                  </Button>
                  <Button
                    className="px-5 py-2 font-bold rounded-xl text-xs"
                    onClick={() => {
                      handleCardClick(contestType.id);
                    }}>
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

export default ContestTypesPage;
