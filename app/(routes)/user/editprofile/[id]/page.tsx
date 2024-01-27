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
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  schoolId: z.string({
    required_error: "School Id is required",
  }),
  schoolName: z.string(),
  contactNumber: z
    .string()
    .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964")
    .optional()
    .or(z.literal("")),
  district: z.string(),
  tehsil: z.string(),
  fax: z.string().optional().or(z.literal("")),
  bankTitle: z.string(),
  p_fName: z.string(),
  p_mName: z.string(),
  p_lName: z.string(),
  p_contact: z
    .string()
    .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964")
    .optional()
    .or(z.literal("")),
  p_phone: z
    .string()
    .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964")
    .optional()
    .or(z.literal("")),
  p_email: z.string(),
  c_fName: z.string(),
  c_mName: z.string(),
  c_lName: z.string(),
  c_contact: z
    .string()
    .regex(/^\d{4}-\d{7}$/, "Phone number must be in the format 0333-5194964")
    .optional()
    .or(z.literal("")),
  c_phone: z
    .string()
    .regex(/^\d{3}-\d{7}$/, "Phone number must be in the format 051-5194964")
    .optional()
    .or(z.literal("")),
  c_email: z.string().email().optional().or(z.literal("")),
  c_accountDetails: z.string(),

  // At least one special character
});
interface UserData {
  email: string;
  schoolId: string;
  schoolName: string;
  contactNumber: string;
  district: string;
  tehsil: string;
  fax: string;
  bankTitle: string;
  p_fName: string;
  p_mName: string;
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
  // Define other properties here as needed
}
const initialData: UserData = {
  email: "",
  schoolId: "",
  schoolName: "",
  contactNumber: "",
  district: "",
  tehsil: "",
  fax: "",
  bankTitle: "",
  p_fName: "",
  p_mName: "",
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
};
const UserRegister = () => {
  const [data, setData] = useState<UserData>(initialData);
  const router = useRouter();
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
      p_mName: data.c_mName,
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
      c_accountDetails: data.c_accountDetails,
    },
  });
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/users/editprofile/${params.id}`);
      console.log(response.data);
      setData(response.data);
      form.reset({
        email: response.data.email ?? "",
        schoolId: response.data.schoolId ?? "",
        schoolName: response.data.schoolName ?? "",
        contactNumber: response.data.contactNumber ?? "",
        district: response.data.district ?? "",
        tehsil: response.data.tehsil ?? "",
        fax: response.data.fax ?? "",
        bankTitle: response.data.bankTitle ?? "",
        p_fName: response.data.p_fName ?? "",
        p_mName: response.data.p_mName ?? "",
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
        ...values, // Spread the form values
        role: "User", // Add the additional string
      };
      console.log(payload);
      await axios.put(`/api/users/editprofile/${params.id}`, payload);
      form.reset();
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <section className="bg-white mb-12">
      <div className=" pt-10 h-screen grid grid-cols-1 md:grid-cols-2 gap-2 xl:gap-0">
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
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">School ID</FormLabel>
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
                  name="p_mName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="label mt-5">
                        Principal&apos;s Middle Name
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
                        Principal&apos;s Contact
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
                        Coordinator&apos;s Contact number
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
