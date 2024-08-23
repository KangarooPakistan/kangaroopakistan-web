"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import { getSignedURL } from "@/app/api/s3-upload/actions";
import { useModal } from "@/hooks/use-modal-store";
import { X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  hasFile: z.boolean().refine((val) => val, {
    message: "A file is required.",
  }),
});

const UploadNotification = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onClose, type } = useModal();
  const router = useRouter();

  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const s3BucketUrl =
    process.env.AWS_BUCKET_NAME ??
    "https://kangaroopakistan-prod.s3.us-east-1.amazonaws.com/";

  const generateUniqueFileName = (fileNameString: string) => {
    const timestamp = Date.now();
    const extension = fileNameString.split(".").pop();
    const fileNameWithoutExtension = fileNameString.replace(/\.[^/.]+$/, "");
    const fileName = `notificationvideo/${fileNameWithoutExtension}_${timestamp}.${extension}`;
    return fileName;
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click(); // Trigger the file input when the button is clicked
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasFile: false,
    },
  });
  const isModalOpen = isOpen && type === "upload-notification";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
    } else {
      setFileUrl(undefined);
    }

    form.setValue("hasFile", !!selectedFile);
  };

  const isLoading = form.formState.isSubmitting;

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>, e: any) => {
    e.preventDefault();
    try {
      if (file) {
        const fileName = generateUniqueFileName(file.name);
        const checksum = await computeSHA256(file);
        let awsUrl;

        const signedURLResult = await getSignedURL(
          file.type,
          checksum,
          fileName
        );

        if (signedURLResult.failure !== undefined) {
          throw new Error(signedURLResult.failure);
        }

        const { url } = signedURLResult.success;

        await axios
          .put(url, file, {
            headers: {
              "Content-Type": file.type,
            },
          })
          .then((resp) => {});
        awsUrl = `${s3BucketUrl}${fileName}`;
        const payload = {
          imageUrl: awsUrl,
        };
        await axios.post("/api/users/notificationimage/", payload);

        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
          setFileUrl("");
        }
        toast.success("🦄 Video added successfully", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error: any) {
      toast.error(" " + error.response.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error(error);
    }
  };

  const handleClose = () => {
    form.reset();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Notification Video
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-2xl font-bold text-zinc-500">
          Please Upload Notification Video. &nbsp; <br />
          <span className="text-red-700">
            Accepted video types are mp4, mov, avi, mkv
          </span>
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative overflow-hidden">
                  {fileUrl && (
                    <video width="300" height="200" controls>
                      <source src={fileUrl} />
                    </video>
                  )}
                  {fileUrl && (
                    <button
                      onClick={() => setFileUrl("")}
                      className="absolute z-20 top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition duration-300"
                      type="button">
                      <X className="h-6 w-6" />
                    </button>
                  )}
                </div>
                <div className="flex justify-center items-center w-full">
                  <FormField
                    control={form.control}
                    name="hasFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <label
                            htmlFor="fileInput"
                            className="bg-transparent flex-1 border-none outline-none cursor-pointer">
                            <div className="bg-blue-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-600 transition duration-300 flex items-center space-x-2">
                              <Upload className="h-6 w-6" />
                              <span>Select Video</span>
                            </div>
                            <input
                              type="file"
                              id="fileInput"
                              ref={fileInputRef}
                              name="imageUrl"
                              accept="video/mp4, video/mov, video/avi, video/mkv"
                              onChange={handleChange}
                              className="hidden"
                            />
                          </label>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button type="submit" variant="default">
                Add Video
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadNotification;
