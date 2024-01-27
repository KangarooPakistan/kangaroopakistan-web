"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface PaymentProof {
  id: string;
  imageUrl: string;
  // ... include other fields as needed
}
const ViewAllRecipts = () => {
  const params = useParams();
  const [registrationId, setRegistrationId] = useState<string | null>();
  const [paymentProof, setPaymentProof] = useState<PaymentProof[]>([]);
  const [totalStudents, setTotalStudents] = useState<string>();
  useEffect(() => {
    const fetchData = async () => {
      console.log(params.registrationId);
      const id = Array.isArray(params.registrationId)
        ? params.registrationId[0]
        : params.registrationId;
      console.log(id);
      if (id) {
        setRegistrationId(id);
        const registeredStudents = await axios.get(
          `/api/users/registrations/${id}`
        );
        setTotalStudents(registeredStudents.data[0].students.length);
        console.log(registeredStudents.data[0].students.length);
        const response = await axios.get(`/api/users/paymentproof/${id}`);
        console.log("--------response--------------");
        console.log(response);
        setPaymentProof(response.data);
      }
    };
    fetchData();
  }, [params.registrationId]);

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="mx-auto flex justify-center items-center	font-bold	 p-3 bg-blue-500 w-[400px] text-white	text-3xl h-[120px] mb-10">
          <h1>Total # of students: &nbsp; </h1>
          <h1>{totalStudents}</h1>
        </div>
        <div>
          {paymentProof.length > 0 &&
            paymentProof.map((item, index) => (
              <div key={index} className="h-[200px] w-[200px] mx-3">
                <a href={item.imageUrl} target="_blank">
                  <img src={item.imageUrl} alt={`Payment Proof ${index}`} />
                </a>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default ViewAllRecipts;
