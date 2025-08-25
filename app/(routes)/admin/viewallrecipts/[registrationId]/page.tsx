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
  const [schoolName, setSchoolName] = useState<string>();
  const [schoolId, setSchoolId] = useState<number>();
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (selectedImages.length === 0) {
      toast.warning("Please select at least one image to delete", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedImages.length} payment proof(s)?`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Selected images:", selectedImages);

      // Join the selected IDs with commas for the API call
      const idsString = selectedImages.join(",");

      const response = await axios.delete(
        `/api/users/deleteimage/${idsString}`
      );

      // Update the local state by removing deleted items
      setPaymentProof((prevProofs) =>
        prevProofs.filter((proof) => !selectedImages.includes(proof.id))
      );

      // Clear the selection
      setSelectedImages([]);

      toast.success(
        `🗑️ ${selectedImages.length} payment proof(s) deleted successfully`,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    } catch (error: any) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete payment proofs";

      toast.error("❌ " + errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const id = Array.isArray(params.registrationId)
        ? params.registrationId[0]
        : params.registrationId;
      if (id) {
        setRegistrationId(id);

        try {
          const registeredStudents = await axios.get(
            `/api/users/registrations/${id}`
          );
          setTotalStudents(registeredStudents.data[0].students.length);
          setSchoolName(registeredStudents.data[0].schoolName);
          setSchoolId(registeredStudents.data[0].schoolId);

          const response = await axios.get(`/api/users/paymentproof/${id}`);
          console.log(response.data);
          const paymentProofData = Array.isArray(response.data)
            ? response.data
            : [];

          setPaymentProof(paymentProofData);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load payment proofs", {
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
        {/* School Information */}
        <h3 className="text-xl text-center my-3 font-bold text-[#891538]">
          School Name: {schoolName}
        </h3>
        <h3 className="text-xl text-center my-3 font-bold text-[#891538]">
          School Id: {schoolId}
        </h3>

        <div className="flex justify-center items-center">
          <div className="mx-auto font-bold flex justify-center items-center p-3 bg-blue-500 w-[350px] text-white text-2xl h-[100px] mb-10">
            <h1>Total # of students: &nbsp; </h1>
            <h1>{totalStudents}</h1>
          </div>
          <div className="mx-auto flex justify-center items-center font-bold p-3 bg-slate-950 w-[300px] text-white text-2xl h-[100px] mb-10">
            Payment Proofs.
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button variant="default" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelectedImages}
              disabled={selectedImages.length === 0 || isDeleting}>
              {isDeleting
                ? "Deleting..."
                : selectedImages.length === 0
                ? "Delete Image"
                : `Delete Selected (${selectedImages.length})`}
            </Button>
          </div>

          {selectedImages.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedImages.length} image(s) selected
            </div>
          )}
        </div>

        {/* Payment Proofs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {paymentProof.map((item, index) => (
            <div
              key={item.id}
              className={`relative rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                selectedImages.includes(item.id)
                  ? "ring-4 ring-blue-500 transform scale-105"
                  : "hover:shadow-lg"
              }`}>
              {/* Checkbox to select image */}
              <input
                type="checkbox"
                checked={selectedImages.includes(item.id)}
                onChange={() => handleSelectImage(item.id)}
                className="absolute top-2 right-2 z-10 cursor-pointer w-5 h-5"
                disabled={isDeleting}
              />

              {/* Image */}
              <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.imageUrl}
                  alt={`Payment Proof ${index + 1}`}
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

        {/* No payment proofs message */}
        {paymentProof.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No payment proofs found.</p>
          </div>
        )}
      </div>

      <ToastContainer />
    </>
  );
};

export default ViewAllRecipts;
