"use client";
import CreateContestTypeModal from "@/components/modals/create-contest-type-modal";
import { useEffect, useState } from "react";
import AddImageModal from "../modals/add-image-modal";
import DeleteStudent from "../modals/delete-student-modal";
import DeleteSchool from "../modals/delete-school-modal";
import UploadNotification from "../modals/upload-notification-image-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
  return (
    <>
      <CreateContestTypeModal />
      <AddImageModal />
      <DeleteStudent />
      <DeleteSchool />
      <UploadNotification />
    </>
  );
};
