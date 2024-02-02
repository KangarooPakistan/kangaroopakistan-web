"use client";
import React, { useEffect, useState } from "react";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserData {
  email: string;
  schoolId: number;
  schoolName: string;
  contactNumber: string;
  district: string;
  tehsil: string;
  fax: string;
  bankTitle: string;
  p_fName: string;
  p_lName: string;
  p_contact: string;
  p_phone: string;
  p_email: string;
  c_fName: string;
  c_mName: string;
  c_lName: string;
  c_contact: string;
  c_phone: string;
  c_email: string;
  c_accountDetails: string;
  schoolAddress: string;
  // Define other properties here as needed
}
const formSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  schoolName: z.string().refine((data) => data.trim() !== "", {
    message: "SchoolName cannot be empty",
  }),
  contactNumber: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),

  district: z.string().refine((data) => data.trim() !== "", {
    message: "District cannot be empty",
  }),
  tehsil: z.string().refine((data) => data.trim() !== "", {
    message: "Tehsil cannot be empty",
  }),
  fax: z.string(),
  bankTitle: z.string().refine((data) => data.trim() !== "", {
    message: "BankTitle cannot be empty",
  }),
  p_fName: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's First Name cannot be empty",
  }),
  p_lName: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's last name cannot be empty",
  }),
  p_contact: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964"),
  p_phone: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),

  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),

  p_email: z.string().refine((data) => data.trim() !== "", {
    message: "Principal's email cannot be empty",
  }),
  c_fName: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's firstname cannot be empty",
  }),
  c_lName: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's last name cannot be empty",
  }),
  c_contact: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964"),
  c_phone: z.string().refine((data) => data.trim() !== "", {
    message: "Phone number cannot be empty",
  }),
  // .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964"),
  c_email: z
    .string()
    .email()
    .refine((data) => data.trim() !== "", {
      message: "Coordinator's email cannot be empty",
    }),
  c_accountDetails: z.string().refine((data) => data.trim() !== "", {
    message: "Coordinator's account details cannot be empty",
  }),
  schoolAddress: z.string().refine((data) => data.trim() !== "", {
    message: "School Address details cannot be empty",
  }),
});

const initialData: UserData = {
  email: "",
  schoolId: 0,
  schoolName: "",
  contactNumber: "",
  district: "",
  tehsil: "",
  fax: "",
  bankTitle: "",
  p_fName: "",
  p_lName: "",
  p_contact: "",
  p_phone: "",
  p_email: "",
  c_fName: "",
  c_mName: "",
  c_lName: "",
  c_contact: "",
  c_phone: "",
  c_email: "",
  c_accountDetails: "",
  schoolAddress: "",
};
const UserRegister = () => {
  const [data, setData] = useState<UserData>(initialData);
  const router = useRouter();
  const [schoolIdFromBE, setSchoolIdFromBE] = useState<number | undefined>();
  const params = useParams();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data.email,
      // password: "",
      schoolId: data.schoolId,
      schoolName: data.schoolName,
      contactNumber: data.contactNumber,
      district: data.district,
      tehsil: data.tehsil,
      fax: data.fax,
      bankTitle: data.bankTitle,
      p_fName: data.p_fName,

      p_lName: data.c_lName,
      p_contact: data.p_contact,
      p_phone: data.p_phone,
      p_email: data.email,
      c_fName: data.c_fName,
      c_mName: data.c_mName,
      c_lName: data.c_lName,
      c_contact: data.c_contact,
      c_phone: data.c_phone,
      c_email: data.c_email,
      schoolAddress: data.schoolAddress,
      c_accountDetails: data.c_accountDetails,
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/users/editprofile/${params.id}`);
      console.log(response.data);
      setData(response.data);
      setSchoolIdFromBE(response.data.schoolId);

      form.reset({
        email: response.data.email ?? "",
        schoolName: response.data.schoolName ?? "",
        contactNumber: response.data.contactNumber ?? "",
        district: response.data.district ?? "",
        tehsil: response.data.tehsil ?? "",
        fax: response.data.fax ?? "",
        schoolAddress: response.data.schoolAddress ?? "",
        bankTitle: response.data.bankTitle ?? "",
        p_fName: response.data.p_fName ?? "",
        p_lName: response.data.p_lName ?? "",
        p_contact: response.data.p_contact ?? "",
        p_phone: response.data.p_phone ?? "",
        p_email: response.data.p_email ?? "",
        c_fName: response.data.c_fName ?? "",
        c_mName: response.data.c_mName ?? "",
        c_lName: response.data.c_lName ?? "",
        c_contact: response.data.c_contact ?? "",
        c_phone: response.data.c_phone ?? "",
        c_email: response.data.c_email ?? "",
        c_accountDetails: response.data.c_accountDetails ?? "",
      });
    };
    fetchData();
  }, [form]);

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: UserData) => {
    console.log(values);
    console.log(data);
    try {
      const payload = {
        ...values,
        schooldId: schoolIdFromBE,
        // Spread the form values
        role: "User", // Add the additional string
      };
      console.log(payload);
      await axios.put(`/api/users/editprofile/${params.id}`, payload);
      form.reset();
      router.push(`/user/profile/${params.id}`);
      toast.success("🦄 Profile Updated successfully", {
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
      toast.error("Error Updating Profile ", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log(error);
    }
  };
  return (
    <section className="bg-white mb-12">
      <div className=" pt-10 h-screen grid grid-cols-1">
        <div className="w-full rounded-lg shadow-2xl md:mt-0 sm:max-w-md xl:p-0 mx-auto">
          <div className="p-6 space-y-3 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
              Update account
            </h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="label">Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="input"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolAddress"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        School Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">School Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Contact Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="051-1234567"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        District Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tehsil"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">Tehsil</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fax"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">Fax</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankTitle"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        OFFICIAL BANK TITLE OF THE INSTITUTION&apos;s BANK
                        ACCOUNT FOR HONORARIUM
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="p_fName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="p_lName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="p_contact"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s Cell #
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0333-1234567"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="p_phone"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="051-1234567"
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="p_email"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_fName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s first Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_mName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Middle Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_lName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_contact"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Cell #
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0333-1234567"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_phone"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Phone number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="051-1234567"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_email"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="c_accountDetails"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Coordinator&apos;s Account Details
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled={isLoading}
                          className="input"
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
                    className="px-10"
                  >
                    Update Account
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserRegister;
