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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Upload, X, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { getSignedURL } from "@/app/api/s3-upload/actions";
import { useModal } from "@/hooks/use-modal-store";

const GiveParticipationModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "giveParticipation";

  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const s3BucketUrl =
    process.env.NEXT_PUBLIC_AWS_BUCKET_URL ??
    "https://kangaroopakistan-prod.s3.us-east-1.amazonaws.com/";

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const generateUniqueFileName = (originalName: string) => {
    const timestamp = Date.now();
    const extension = originalName.split(".").pop();
    const base = originalName.replace(/\.[^/.]+$/, "");
    return `participation_proof_${base}_${timestamp}.${extension}`;
  };

  const computeSHA256 = async (f: File): Promise<string> => {
    const buffer = await f.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (selected) {
      setFile(selected);
      setFileUrl(URL.createObjectURL(selected));
    } else {
      setFile(undefined);
      setFileUrl(undefined);
    }
  };

  const handleRemoveFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(undefined);
    setFileUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleRemoveFile();
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please attach a permission proof image before submitting.", {
        position: "top-right",
      });
      return;
    }

    const { contestId, schoolId, schoolName } = data as {
      contestId?: string;
      schoolId?: number;
      schoolName?: string;
    };

    if (!contestId || !schoolId) {
      toast.error("Missing contest or school information.", {
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Upload proof image to S3
      const fileName = generateUniqueFileName(file.name);
      const checksum = await computeSHA256(file);
      const signedURLResult = await getSignedURL(file.type, checksum, fileName);

      if (signedURLResult.failure !== undefined) {
        throw new Error(signedURLResult.failure);
      }

      const { url: presignedUrl } = signedURLResult.success;
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      const proofImageUrl = `${s3BucketUrl}${fileName}`;

      // 2. Call the participation API
      const { data: result } = await axios.post(
        "/api/results/participation-by-school",
        {
          contestId,
          schoolId,
          proofImageUrl,
        }
      );

      toast.success(result.message, {
        position: "bottom-center",
        autoClose: 6000,
      });

      handleClose();
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

        <div className="px-6 pb-2">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-md p-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This will assign <strong>PARTICIPATION</strong> to all registered
              students of{" "}
              <strong>{(data as { schoolName?: string })?.schoolName}</strong>{" "}
              who have not received a score yet. A permission proof image is{" "}
              <strong>mandatory</strong> before proceeding.
            </p>
          </div>

          <DialogDescription className="text-sm text-gray-600 mb-4">
            Upload the authorization / permission proof document or screenshot.
            Accepted: JPEG, PNG, WEBP, GIF.
          </DialogDescription>

          {/* Preview */}
          {fileUrl && (
            <div className="relative w-full h-48 rounded-md overflow-hidden border mb-3">
              <Image
                src={fileUrl}
                alt="Permission proof"
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* File picker */}
          <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-full shadow hover:bg-blue-600 transition text-sm">
            <Upload className="h-4 w-4" />
            {file ? "Change Proof Image" : "Select Proof Image"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>
          {file && (
            <p className="mt-2 text-xs text-gray-500 truncate max-w-xs">
              {file.name}
            </p>
          )}
        </div>

        <DialogFooter className="bg-gray-100 px-6 py-4 flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="bg-purple-700 text-white hover:bg-purple-800 disabled:bg-slate-200 disabled:text-black">
            {loading ? "Processing..." : "Grant Participation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiveParticipationModal;
