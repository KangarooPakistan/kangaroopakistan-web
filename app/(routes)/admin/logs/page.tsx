"use client";

import Timeline from "@/app/components/Timeline";
import axios from "axios";
import { useState, useEffect } from "react";
const Logs = () => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Replace this with your actual data fetching logic
      try {
        const response = await axios.get("/api/updates"); // Assuming you have an API endpoint
        const data = await response.data;
        console.log(data);
        setUpdates(data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="container bg-zinc-50 mx-auto py-8 ">
        <h1 className="text-3xl font-bold text-center mb-8">Logs </h1>
        <Timeline events={updates} />
      </div>
    </>
  );
};

export default Logs;
