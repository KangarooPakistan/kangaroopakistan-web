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
  const router = useRouter();

  const [registrationId, setRegistrationId] = useState<string | null>();
  const [paymentProof, setPaymentProof] = useState<PaymentProof[]>([]);
  const [totalStudents, setTotalStudents] = useState<string>();
  const [schoolName, setSchoolName] = useState();
  const [schoolId, setSchoolId] = useState();

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

        console.log(registeredStudents);
        setSchoolName(registeredStudents.data[0].schoolName);
        setSchoolId(registeredStudents.data[0].schoolId);

        setTotalStudents(registeredStudents.data[0].students.length);
        const response = await axios.get(`/api/users/paymentproof/${id}`);
        setPaymentProof(response.data);
      }
    };
    fetchData();
  }, [params.registrationId]);
  const handleBack = () => {
    router.back();
  };
  return (
    <>
      <div className="container mx-auto py-4">
        <h3 className="text-xl text-center my-3 font-bold text-purple-600">
          School Name: {schoolName}
        </h3>
        <h3 className="text-xl text-center my-3 font-bold text-purple-600">
          School Id: {schoolId}
        </h3>
        <div className="flex justify-center items-center">
          <div className="mx-auto	font-bold flex justify-center items-center p-3 bg-blue-500 w-[350px] text-white	text-2xl h-[100px] mb-10">
            <h1>Total # of students: &nbsp; </h1>
            <h1>{totalStudents}</h1>
          </div>
          <div className="mx-auto flex justify-center items-center	font-bold	 p-3 bg-slate-950 w-[300px] text-white text-2xl h-[100px] mb-10">
            Payment Proofs.
          </div>
        </div>
        <Button variant="default" onClick={handleBack}>
          Back
        </Button>
        <div>
          {paymentProof.length > 0 &&
            paymentProof.map((item, index) => (
              <div
                key={index}
                className="h-[240px] w-[240px] rounded overflow-hidden shadow-lg flex justify-center items-center">
                <div
                  key={index}
                  className="h-[220px] w-[220px] mx-auto my-auto">
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
