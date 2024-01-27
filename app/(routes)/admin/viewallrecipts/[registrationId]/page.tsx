"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ViewAllRecipts = () => {
  const params = useParams();
  const [registrationId, setRegistrationId] = useState<string | null>();
  const [paymentProof, setPaymentProof] = useState();
  useEffect(() => {
    const fetchData = async () => {
      console.log(params.registrationId);
      const id = Array.isArray(params.registrationId)
        ? params.registrationId[0]
        : params.registrationId;
      console.log(id);
      if (id) {
        setRegistrationId(id);
        const response = await axios.get(`/api/users/paymentproof/${id}`);
        console.log("--------response--------------");
        console.log(response);
        setPaymentProof(response.data);
      }
    };
    fetchData();
  }, []);

  return <div>page</div>;
};

export default ViewAllRecipts;
