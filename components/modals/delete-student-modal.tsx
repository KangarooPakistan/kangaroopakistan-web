import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useRouter } from "next/navigation"; // Use 'next/router' instead of 'next/navigation'
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const DeleteStudent = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  //   useEffect(() => {
  //     if (isOpen && type === "deleteStudent") {
  //       // Perform any additional actions on modal open
  //     }
  //   }, [isOpen, type]);

  const handleDelete = async () => {
    console.log(data.id);
    try {
      const response = await axios.delete(
        `/api/users/deletestudent/${data.id}`
      ); // Replace ":id" with the actual ID of the student to be deleted
      toast.success("Student successfully deleted", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      // Close the modal after deletion
      onClose();
      // You can also perform any additional actions after deletion here
    } catch (error) {
      toast.error("there was an error while deleting student", {
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
    router.refresh();
    window.location.reload();
  };

  const handleClose = () => {
    // Close the modal without performing any action
    onClose();
    // You can also perform any additional actions when the modal is closed without deletion
  };

  return (
    <>
      <Dialog open={isOpen && type === "deleteStudent"} onOpenChange={onClose}>
        <DialogContent className="bg-white text-black p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Delete Student
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to delete this student?
          </DialogDescription>
          <DialogFooter className="bg-gray-100 px-6 py-4">
            <Button onClick={handleDelete} variant="destructive">
              Yes
            </Button>
            <Button onClick={handleClose} variant="default">
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default DeleteStudent;
