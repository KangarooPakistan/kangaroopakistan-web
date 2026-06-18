"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertTriangle } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";

const GiveParticipationModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "giveParticipation";
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { contestId, schoolId, schoolName } = data as {
    contestId?: string;
    schoolId?: number;
    schoolName?: string;
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSubmit = async () => {
    if (!contestId || !schoolId) {
      toast.error("Missing contest or school information.", {
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);

      const { data: result } = await axios.post(
        "/api/results/participation-by-school",
        { contestId, schoolId }
      );

      toast.success(result.message, {
        position: "bottom-center",
        autoClose: 6000,
      });

      onClose();
      router.refresh();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to grant participation.";
      toast.error(msg, { position: "top-right", autoClose: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden max-w-md">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-xl text-center font-bold">
            Give Participation (No Scores)
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-md p-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This will assign <strong>PARTICIPATION</strong> to all registered
              students of <strong>{schoolName}</strong> who have not received a
              score yet. This action writes to the database and cannot be
              undone without manually deleting the records.
            </p>
          </div>

          <DialogDescription className="text-sm text-gray-600">
            Permission has already been uploaded for this contest. Click{" "}
            <strong>Confirm</strong> to proceed.
          </DialogDescription>
        </div>

        <DialogFooter className="bg-gray-100 px-6 py-4 flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-700 text-white hover:bg-purple-800 disabled:bg-slate-200 disabled:text-black">
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiveParticipationModal;
