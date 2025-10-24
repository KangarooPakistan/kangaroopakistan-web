"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ReceiptsDownloadModalProps {
  contestId: string;
  contestName: string;
  open: boolean;
  onClose: () => void;
}

export const ReceiptsDownloadModal = ({
  contestId,
  contestName,
  open,
  onClose,
}: ReceiptsDownloadModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date must be before end date", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Fetching receipts and downloading images...", {
        position: "top-right",
        autoClose: 2000,
      });

      const response = await axios.get("/api/receipts/download-by-contest", {
        params: {
          contestId,
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        },
      });

      // Handle the response structure - check if data is nested
      const receiptsData = response.data.data || response.data;

      if (!receiptsData || receiptsData.length === 0) {
        toast.warning("No receipts found for the selected date range", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsLoading(false);
        return;
      }

      toast.info(
        `Found ${receiptsData.length} receipt(s). Preparing download...`,
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      // Prepare data for Excel
      const excelData = receiptsData.map((receipt: any, index: number) => ({
        "S.No": index + 1,
        "Receipt ID": receipt.id || receipt["Receipt ID"],
        "Registration ID": receipt.registrationId || receipt["Registration ID"],
        "School ID":
          receipt.registration?.schoolId || receipt["School ID"] || "N/A",
        "School Name":
          receipt.registration?.schoolName ||
          receipt["School Name"] ||
          receipt.registration?.user?.schoolName ||
          "N/A",
        "Contest Name":
          receipt.registration?.contest?.name ||
          receipt["Contest Name"] ||
          contestName,
        "Image URL": receipt.imageUrl || receipt["Image URL"],
        "Upload Date":
          receipt["Upload Date"] ||
          new Date(receipt.createdAt).toLocaleString("en-PK", {
            timeZone: "Asia/Karachi",
          }),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Receipts");

      // Generate Excel file as blob
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a ZIP file containing Excel and images
      const zip = new JSZip();
      const imagesFolder = zip.folder("receipt_images");

      // Add Excel file to ZIP
      const fileName = `receipts_${format(startDate, "yyyy-MM-dd")}_to_${format(
        endDate,
        "yyyy-MM-dd"
      )}.xlsx`;
      zip.file(fileName, excelBlob);

      // Download and add images to ZIP
      toast.info("Downloading images...", {
        position: "top-right",
        autoClose: false,
      });

      let successCount = 0;
      let failCount = 0;

      const imagePromises = receiptsData.map(
        async (receipt: any, index: number) => {
          try {
            const schoolId =
              receipt.registration?.schoolId ||
              receipt["School ID"] ||
              "unknown";
            const imageUrl = receipt.imageUrl || receipt["Image URL"];

            if (!imageUrl) {
              console.warn(`No image URL for receipt ${receipt.id || index}`);
              failCount++;
              return;
            }

            // Fetch image as blob with proper headers
            const imageResponse = await axios.get(imageUrl, {
              responseType: "blob",
              timeout: 30000, // 30 second timeout
              headers: {
                Accept: "image/*",
              },
            });

            // Get file extension from URL or content type
            let extension = "jpg"; // default
            const urlMatch = imageUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
            if (urlMatch) {
              extension = urlMatch[1];
            } else if (imageResponse.headers["content-type"]) {
              const contentType = imageResponse.headers["content-type"];
              extension = contentType.split("/")[1]?.split(";")[0] || "jpg";
            }

            const receiptId = receipt.id || receipt["Receipt ID"] || index;
            const imageName = `${schoolId}_receipt_${receiptId}.${extension}`;

            // Add image to ZIP
            if (imagesFolder) {
              imagesFolder.file(imageName, imageResponse.data);
              successCount++;
            }
          } catch (error: any) {
            console.error(
              `Failed to download image for receipt ${receipt.id || index}:`,
              error.message
            );
            failCount++;
          }
        }
      );

      await Promise.all(imagePromises);

      toast.dismiss();

      if (successCount === 0) {
        toast.error(
          "Failed to download any images. Please check the image URLs.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        setIsLoading(false);
        return;
      }

      if (failCount > 0) {
        toast.warning(
          `Downloaded ${successCount} image(s). ${failCount} failed to download.`,
          {
            position: "top-right",
            autoClose: 4000,
          }
        );
      }

      toast.info("Creating ZIP file...", {
        position: "top-right",
        autoClose: 2000,
      });

      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      const zipFileName = `${contestName}_receipts_${format(
        startDate,
        "yyyy-MM-dd"
      )}_to_${format(endDate, "yyyy-MM-dd")}.zip`;
      saveAs(zipBlob, zipFileName);

      toast.success(
        `Successfully downloaded ${successCount} receipt(s) with images!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );

      // Reset and close
      setStartDate(undefined);
      setEndDate(undefined);
      onClose();
    } catch (error: any) {
      console.error("Error downloading receipts:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to download receipts. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-purple-600">
            Download Payment Receipts
          </DialogTitle>
          <DialogDescription>
            Select date range to download receipts for {contestName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              Time will be set to 00:00:00 (Pakistan Time)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Pick end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500">
              Time will be set to 23:59:59 (Pakistan Time)
            </p>
          </div>

          {startDate && endDate && (
            <div className="mt-2 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Selected Date Range:</strong>
                <br />
                From: {format(startDate, "PPP")} 00:00:00 PKT
                <br />
                To: {format(endDate, "PPP")} 23:59:59 PKT
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading || !startDate || !endDate}
              className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
