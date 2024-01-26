"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const ViewAllRecipts = () => {
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      console.log(params.id);
      const response = await axios.get(`/users/paymentproof/${params.id}`);
      console.log(response);
    };
    fetchData();
  });

  return <div>page</div>;
};

export default ViewAllRecipts;
