"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PaymentProof {
  id: string;
  imageUrl: string;
  // ... include other fields as needed
}
const ViewAllRecipts = () => {
  const params = useParams();
  const [registrationId, setRegistrationId] = useState<string | null>();
  const [totalStudents, setTotalStudents] = useState<string>();
  const [paymentProof, setPaymentProof] = useState<PaymentProof[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const id = Array.isArray(params.registrationId)
        ? params.registrationId[0]
        : params.registrationId;
      if (id) {
        setRegistrationId(id);
        const registeredStudents = await axios.get(
          `/api/users/registrations/${id}`
        );
        setTotalStudents(registeredStudents.data[0].students.length);

        const response = await axios.get(`/api/users/paymentproof/${id}`);
        setPaymentProof(response.data);
      }
    };
    fetchData();
  }, []);
  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <div className="container mx-auto py-4">
        <div className="flex justify-center items-center">
          <div className="mx-auto	font-bold flex justify-center items-center	 p-3 bg-blue-500 w-[350px] text-white	text-2xl h-[100px] mb-10">
            <h1>Total # of students: &nbsp; </h1>
            <h1>{totalStudents}</h1>
          </div>
          <div className="mx-auto flex justify-center items-center	font-bold	 p-3 bg-slate-950 w-[300px] text-white text-2xl h-[100px] mb-10">
            Payment Proofs.
          </div>
        </div>
        <div className="flex justify-start items-center">
          <Button variant="default" onClick={handleBack}>
            Back
          </Button>
        </div>

        <div className="flex justify-center items-center">
          {paymentProof.length > 0 &&
            paymentProof.map((item, index) => (
              <div
                key={item.id}
                className="h-[240px] w-[240px] rounded overflow-hidden shadow-lg flex justify-center items-center mx-2"
              >
                <div
                  key={item.id}
                  className="flex justify-center items-center mx-auto my-auto"
                >
                  <a href={item.imageUrl} target="_blank">
                    <img
                      src={item.imageUrl}
                      alt={`Payment Proof ${index}`}
                      className="h-[200px] w-[200px]"
                    />
                  </a>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default ViewAllRecipts;
