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
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Use 'next/router' instead of 'next/navigation'
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getSignedURL } from "@/app/api/s3-upload/actions";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  hasFile: z.boolean().refine((val) => val, {
    message: "A file is required.",
  }),
});

const InitialModal = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onClose, type } = useModal();

  const s3BucketUrl =
    process.env.AWS_BUCKET_NAME ??
    "https://kangaroo-pakistan-local-kainat.s3.us-east-1.amazonaws.com/";

  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [content, setContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      hasFile: false,
    },
  });

  const handleChange = (e: any) => {
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
  const generateUniqueFileName = (fileNameString: string) => {
    const timestamp = Date.now();
    const extension = fileNameString.split(".").pop();
    const fileNameWithoutExtension = fileNameString.replace(/\.[^/.]+$/, "");
    const fileName = `${fileNameWithoutExtension}_${timestamp}.${extension}`;
    return fileName;
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
          contestName: values.name, // Spread the form values
          imageUrl: awsUrl,
        };
        await axios.post("/api/users/contesttype", payload);
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
          setFileUrl("");
        }
        onClose();
        router.refresh();
      }
      // Use 'router.reload()' to refresh the page.
    } catch (error) {
      console.error(error);
    }
  };
  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={false}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add a new contest type
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center text-zinc-500">
          Add an image and title to your contest type. You can always change it
          later.
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <div className="flex gap-4 items-start pb-4 w-full">
                  <div className="">
                    <img src={fileUrl} />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="hasFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="file"
                          ref={fileInputRef} // Attach the ref here
                          className="bg-transparent flex-1 border-none outline-none"
                          name="imageUrl"
                          accept="image/jpeg, image/png, image/webp, image/gif" // Add ',' between file types
                          onChange={handleChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Server name
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Enter server name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button type="submit" variant="default">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InitialModal;
