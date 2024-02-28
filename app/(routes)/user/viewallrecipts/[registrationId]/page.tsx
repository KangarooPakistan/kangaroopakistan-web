"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleSelectImage = (id: string) => {
    const isSelected = selectedImages.includes(id);
    if (isSelected) {
      // If already selected, remove from selected images
      setSelectedImages(selectedImages.filter((imageId) => imageId !== id));
    } else {
      // If not selected, add to selected images
      setSelectedImages([...selectedImages, id]);
    }
  };
  const handleDeleteSelectedImages = async () => {
    // Perform deletion logic here, using selectedImages state
    // For example, you can send a request to delete these images
    try {
      console.log("Selected images:", selectedImages);
      const response = await axios.delete(
        `/api/users/deleteimage/${selectedImages}`
      );
      router.refresh();
      window.location.reload();
      toast.success("🦄 Student Updated successfully", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      toast.error("Error creating registration ", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    // After deletion, you can update the UI accordingly
    // For example, you can remove the deleted images from the UI
  };
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
          <Button variant="default" onClick={handleDeleteSelectedImages}>
            Delete image
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {paymentProof.map((item, index) => (
            <div
              key={item.id}
              className="relative rounded-lg overflow-hidden shadow-md"
            >
              {/* Checkbox to select image */}
              <input
                type="checkbox"
                checked={selectedImages.includes(item.id)}
                onChange={() => handleSelectImage(item.id)}
                className="absolute top-2 right-2 z-10 cursor-pointer"
              />
              {/* Image */}
              <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.imageUrl}
                  alt={`Payment Proof ${index}`}
                  className="h-40 w-full object-cover transition-transform duration-300 transform hover:scale-105"
                />
                {/* Hover effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 text-white text-lg font-bold">
                  Click to view
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ViewAllRecipts;
