"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ViewAllContests = () => {
  const [contests, setContests] = useState();
  const params = useParams();

  useEffect(() => {
    async function fetchContestTypes() {
      try {
        const contestTypeId = params.id;
        await axios
          .get(`/api/users/contests?contestTypeId=${contestTypeId}`)
          .then((resp) => {
            console.log(resp.data);
            setContests(resp.data);
          })
          .catch((err) => {
            console.log(err);
          });

        // setIsLoading(false);
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
        const contestTypeId = params.id;
        await axios
          .get(`/api/users/contests?contestTypeId=${contestTypeId}`)
          .then((resp) => {
            console.log(resp.data);
            setContests(resp.data);
          })
          .catch((err) => {
            console.log(err);
          });

        // setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    // Call the fetchContestTypes function when the component mounts
    fetchContestTypes();
  }, [contests]);
  return <div>page</div>;
};

export default ViewAllContests;
