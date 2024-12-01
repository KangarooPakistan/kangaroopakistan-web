"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { getSession } from "next-auth/react";
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

// Updated schema to only include AwardLevel
const formSchema = zod.object({
  AwardLevel: zod.string().min(1, "Award Level is required"),
});

interface StudentResult {
  id: string;
  scoreId: string;
  contestId: string;
  schoolId: number;
  district: string;
  class: number;
  level: string;
  AwardLevel: string;
  rollNumber: string;
  percentage: string;
  createdAt: string;
  updatedAt: string;
  score: {
    rollNo: string;
    percentage: string;
  };
}

const UpdateAwardLevel = () => {
  const [data, setData] = useState<StudentResult | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>();

  const params = useParams();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      AwardLevel: "",
    },
  });

  useEffect(() => {
    const fetchUserSession = async () => {
      const session = await getSession();
      setCurrentUserEmail(session?.user?.email);
    };
    fetchUserSession();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/results/fetchresults/studentresult/${params.id}`
        );
        setData(response.data);

        // Set the initial AwardLevel in the form
        form.reset({
          AwardLevel: response.data.AwardLevel,
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast.error("Failed to fetch student data", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };
    fetchData();
  }, [form, params.id]);

  const onSubmit = async (values: zod.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values,
        currentUserEmail,
      };

      const response = await axios.put(
        `/api/results/updateresults/${params.id}`,
        payload
      );

      router.back();
      toast.success("Award Level Updated successfully", {
        position: "bottom-center",
        autoClose: 5000,
      });
    } catch (error: any) {
      toast.error(" " + error.response?.data?.message || "Update failed", {
        position: "top-right",
        autoClose: 5000,
      });
      console.error("Error updating award level:", error);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <section className="bg-white mb-12">
      <div className="pt-10 grid grid-cols-1">
        <div className="rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
          <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Update Award Level
            </h1>

            {/* Display Student Details as Labels */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Roll Number
                </label>
                <p className="mt-1 text-sm text-gray-900">{data.rollNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <p className="mt-1 text-sm text-gray-900">{data.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Percentage
                </label>
                <p className="mt-1 text-sm text-gray-900">{data.percentage}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <p className="mt-1 text-sm text-gray-900">{data.level}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class
                </label>
                <p className="mt-1 text-sm text-gray-900">{data.class}</p>
              </div>

              {/* Award Level Form Field */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6">
                  <FormField
                    control={form.control}
                    name="AwardLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">Award Level</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-2 text-xs md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500">
                            <option value="">SELECT AWARD LEVEL</option>
                            <option value="GOLD">GOLD</option>
                            <option value="SILVER">SILVER</option>
                            <option value="BRONZE">BRONZE</option>
                            <option value="THREE STAR">THREE STAR</option>
                            <option value="TWO STAR">TWO STAR</option>
                            <option value="ONE STAR">ONE STAR</option>
                            <option value="PARTICIPATION">PARTICIPATION</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-center mt-16">
                    <Button
                      disabled={form.formState.isSubmitting}
                      variant="default"
                      className="px-10">
                      Update Award Level
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdateAwardLevel;
