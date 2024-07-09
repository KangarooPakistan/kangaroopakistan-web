"use client";
import React, { useEffect, useState } from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css"; // Import styles
import DatePicker from "react-datepicker"; // Import react-datepicker
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().refine((name) => name.trim() !== "", {
    message: "Name is required.",
  }),
  startDate: z
    .date()
    .refine((startDate) => startDate !== null && startDate !== undefined, {
      message: "Start Date is required.",
    }),
  endDate: z
    .date()
    .refine((endDate) => endDate !== null && endDate !== undefined, {
      message: "End date is required.",
    }),
  contestDate: z.string(),
  resultDate: z.string(),
});
const CreateContest = () => {
  const [data, setData] = useState();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetch = async () => {
      await axios
        .get(`/api/users/contesttype/${params.id}`)
        .then((resp) => {
          setData(resp.data.contestCh);
        })
        .catch((error) => {});
    };
    fetch();
  }, [params.id]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: new Date(), // Provide a valid initial date value
      endDate: new Date(),
      contestDate: "",
      resultDate: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      name: values.name, // Spread the form values
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      contestTypeId: params.id,
      contestCh: data,
    };
    try {
      await axios.post("/api/users/contests", payload);
      await router.push(`/employee/contesttypes/${params.id}/viewcontest`);
      toast.success("🦄 Contest successfully created", {
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
      toast.error(" " + error, {
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

    // const databaseDate = "2024-01-11T14:59:11.000Z";
    // const parsedDate = new Date(databaseDate);

    // // Convert to the desired date picker format
    // const formattedDate = parsedDate.toLocaleString("en-US", {
    //   weekday: "short",
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    //   hour: "numeric",
    //   minute: "numeric",
    //   second: "numeric",
    //   timeZoneName: "short",
    // });
  };
  return (
    <>
      <section className="bg-white mb-12">
        <div className=" pt-10 h-screen grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-0">
          <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
            <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                Create account
              </h1>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 md:space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">Contest Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="input"
                            placeholder="Enter Contest Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">
                          Registration Start Date
                        </FormLabel>
                        <FormControl>
                          {/* Use react-datepicker for date selection */}
                          <DatePicker
                            disabled={isLoading}
                            selected={field.value}
                            onChange={(date: Date | null) => {
                              field.onChange(date);
                            }}
                            dateFormat="yyyy/MM/dd"
                            placeholderText="Pick a date"
                            className="input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">
                          Registration End Date
                        </FormLabel>
                        <FormControl>
                          {/* Use react-datepicker for date selection */}
                          <DatePicker
                            disabled={isLoading}
                            selected={field.value}
                            onChange={(date: Date | null) => {
                              field.onChange(date);
                            }}
                            dateFormat="yyyy/MM/dd"
                            placeholderText="Pick a date"
                            className="input w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">Contest Date</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="input"
                            placeholder="Enter Contest Date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resultDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="label">Result Date</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            className="input"
                            placeholder="Enter Result Date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-center mt-16">
                    <Button
                      disabled={isLoading}
                      variant="default"
                      className="px-10">
                      Create
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default CreateContest;
